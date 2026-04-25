'use client';

/**
 * AgentChat — chat client do agente VSS.
 *
 * Por que sem `@ai-sdk/react`: na Sprint 2 do projeto, `@ai-sdk/react` ainda
 * não foi instalado (constraint do task: "se faltar, não instale, reporte").
 * Implementação mínima de `useChat`-like usando `fetch` + `ReadableStream`
 * + parser de SSE pro formato `toUIMessageStreamResponse()` do AI SDK 6.
 *
 * Parses os chunks: `text-start`, `text-delta`, `text-end`, `tool-input-start`,
 * `tool-output-available`, `tool-output-error`, `error`. Mostra tool calls
 * inline ("salvando artifact: ICP...") e renderiza markdown da resposta.
 */

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =====================================================================
// TYPES
// =====================================================================

type Role = 'user' | 'assistant' | 'system';

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  state: 'running' | 'done' | 'error';
  output?: unknown;
  errorText?: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  /** Tool calls feitas pelo assistant (renderizadas inline). */
  tools?: ToolInvocation[];
}

export interface AgentChatProps {
  destravamentoId: string;
  /** Se já existe uma conversa ativa, passa o ID pra continuar dela. */
  conversationId?: string;
  /** Mensagens já persistidas (carregadas server-side e hidratadas no client). */
  initialMessages?: ChatMessage[];
  /** Título mostrado no topo do chat (opcional). */
  destravamentoTitle?: string;
  /** Endpoint da API (default `/api/agent/chat`). */
  endpoint?: string;
  className?: string;
}

// =====================================================================
// SSE PARSER
// =====================================================================

interface SSEEvent {
  data: string;
}

/**
 * Lê bytes de uma `Response.body` e emite eventos SSE conforme chegam.
 * Não tenta ser completo (ignora `event:`, `id:`, `retry:`) — só `data:`.
 */
async function* readSSE(stream: ReadableStream<Uint8Array>): AsyncGenerator<SSEEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // Eventos separados por blank line (\n\n)
      let idx;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const raw = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const lines = raw.split('\n');
        const dataLines: string[] = [];
        for (const line of lines) {
          if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).trimStart());
          }
        }
        if (dataLines.length > 0) {
          yield { data: dataLines.join('\n') };
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// =====================================================================
// CHUNK HANDLER
// =====================================================================

interface ChunkBase {
  type: string;
}

type Chunk =
  | (ChunkBase & { type: 'text-start'; id: string })
  | (ChunkBase & { type: 'text-delta'; id: string; delta: string })
  | (ChunkBase & { type: 'text-end'; id: string })
  | (ChunkBase & { type: 'tool-input-start'; toolCallId: string; toolName: string })
  | (ChunkBase & { type: 'tool-output-available'; toolCallId: string; output: unknown })
  | (ChunkBase & { type: 'tool-output-error'; toolCallId: string; errorText: string })
  | (ChunkBase & { type: 'error'; errorText: string })
  | (ChunkBase & Record<string, unknown>);

function parseChunk(raw: string): Chunk | null {
  if (!raw || raw === '[DONE]') return null;
  try {
    return JSON.parse(raw) as Chunk;
  } catch {
    return null;
  }
}

// =====================================================================
// MAIN COMPONENT
// =====================================================================

export function AgentChat({
  destravamentoId,
  conversationId: initialConversationId,
  initialMessages = [],
  destravamentoTitle,
  endpoint = '/api/agent/chat',
  className,
}: AgentChatProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [conversationId, setConversationId] = React.useState<string | undefined>(
    initialConversationId
  );
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  // Autoscroll quando novas mensagens chegam.
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Cleanup abort em unmount.
  React.useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const assistantId = `a_${Date.now()}`;
    const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', text: '' };

    // Otimisticamente adiciona ambas
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setBusy(true);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    // Monta payload no formato UIMessage esperado pelo route handler
    const payloadMessages = [...messages, userMsg].map((m) => ({
      id: m.id,
      role: m.role,
      parts: [{ type: 'text' as const, text: m.text }],
    }));

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          destravamentoId,
          conversationId,
          messages: payloadMessages,
        }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        let errBody: { error?: string; reason?: string } = {};
        try {
          errBody = await res.json();
        } catch {
          // ignore
        }
        const msg =
          res.status === 429
            ? errBody.reason ?? 'Cota de uso esgotada esse mês.'
            : res.status === 401
              ? 'Sessão expirou. Faça login de novo.'
              : errBody.reason ?? 'Erro ao falar com o agente.';
        toast.error(msg);
        // Marca a msg do assistant como erro inline
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, text: `_${msg}_` } : m
          )
        );
        setBusy(false);
        return;
      }

      // Header de mock — só pra debug visual
      const isMock = res.headers.get('x-agent-mock') === '1';
      const ct = res.headers.get('content-type') ?? '';

      if (!res.body) {
        toast.error('Resposta vazia.');
        setBusy(false);
        return;
      }

      // Mock retorna text/plain (não SSE) — lê como plain text
      if (isMock || ct.startsWith('text/plain')) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, text: m.text + chunk } : m))
          );
        }
      } else {
        // SSE / UIMessage stream
        for await (const ev of readSSE(res.body)) {
          const chunk = parseChunk(ev.data);
          if (!chunk) continue;
          applyChunk(chunk, assistantId, setMessages, setConversationId);
        }
      }

      setBusy(false);
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') {
        setBusy(false);
        return;
      }
      console.error('[AgentChat]', err);
      toast.error('Falha de rede ao conversar com o agente.');
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, text: '_Falha de rede. Tenta de novo._' } : m
        )
      );
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void send(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  }

  return (
    <div className={cn('flex h-full flex-col bg-ink text-cream', className)}>
      {destravamentoTitle ? (
        <div className="border-b border-[var(--jb-hair)] px-6 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--jb-fg-muted)]">
            Destravamento
          </p>
          <h2 className="mt-1 font-display text-xl uppercase tracking-tight text-cream">
            {destravamentoTitle}
          </h2>
        </div>
      ) : null}

      {/* Lista de mensagens */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--jb-fg-muted)]">
              comece descrevendo onde você está nesse destravamento
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {busy ? <TypingIndicator /> : null}
          </ul>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={onSubmit}
        className="border-t border-[var(--jb-hair)] bg-[var(--jb-ink-2)] p-4"
      >
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Escreve aqui — Enter envia, Shift+Enter pula linha"
            rows={2}
            disabled={busy}
            className="flex-1 resize-none border border-[var(--jb-hair-strong)] bg-ink px-4 py-3 font-sans text-base text-cream placeholder:text-[var(--jb-fg-muted)] focus:border-acid focus:outline-none disabled:opacity-50"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={busy || !input.trim()}
            className="self-stretch"
          >
            {busy ? '...' : 'Enviar'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// =====================================================================
// SUB-COMPONENTS
// =====================================================================

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <li
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] border px-4 py-3',
          isUser
            ? 'border-[var(--jb-fire-border)] bg-[var(--jb-fire-soft)] text-cream'
            : 'border-[var(--jb-hair-strong)] bg-[var(--jb-ink-2)] text-cream'
        )}
      >
        <div className="mb-2 flex items-center gap-2">
          <span
            className={cn(
              'font-mono text-[10px] uppercase tracking-[0.22em]',
              isUser ? 'text-fire' : 'text-acid'
            )}
          >
            {isUser ? 'você' : 'agente vss'}
          </span>
        </div>

        {message.tools && message.tools.length > 0 ? (
          <ul className="mb-2 space-y-1">
            {message.tools.map((t) => (
              <li
                key={t.toolCallId}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--jb-fg-muted)]"
              >
                {t.state === 'running' ? '↻' : t.state === 'done' ? '✓' : '✗'}{' '}
                {labelForTool(t.toolName)}
                {t.state === 'error' && t.errorText ? (
                  <span className="ml-2 normal-case text-fire">— {t.errorText}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        {message.text ? (
          <div className="prose prose-invert max-w-none text-sm leading-relaxed [&_a]:text-acid [&_code]:bg-[var(--jb-ink-3)] [&_code]:px-1 [&_code]:font-mono [&_code]:text-acid [&_p]:my-2 [&_pre]:bg-[var(--jb-ink-3)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
          </div>
        ) : null}
      </div>
    </li>
  );
}

function TypingIndicator() {
  return (
    <li className="flex justify-start">
      <div className="border border-[var(--jb-hair-strong)] bg-[var(--jb-ink-2)] px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-acid">
          agente vss
        </span>
        <div className="mt-2 flex gap-1">
          <span className="size-1.5 animate-pulse rounded-full bg-acid" />
          <span
            className="size-1.5 animate-pulse rounded-full bg-acid"
            style={{ animationDelay: '120ms' }}
          />
          <span
            className="size-1.5 animate-pulse rounded-full bg-acid"
            style={{ animationDelay: '240ms' }}
          />
        </div>
      </div>
    </li>
  );
}

function labelForTool(name: string): string {
  switch (name) {
    case 'saveArtifact':
      return 'salvando entregável';
    case 'updateProfile':
      return 'atualizando perfil';
    case 'markComplete':
      return 'marcando concluído';
    case 'requestHumanReview':
      return 'pedindo review do joel';
    default:
      return name;
  }
}

// =====================================================================
// CHUNK APPLY
// =====================================================================

function applyChunk(
  chunk: Chunk,
  assistantId: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setConversationId: React.Dispatch<React.SetStateAction<string | undefined>>
) {
  switch (chunk.type) {
    case 'text-delta': {
      const delta = (chunk as { delta: string }).delta;
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, text: m.text + delta } : m))
      );
      return;
    }
    case 'tool-input-start': {
      const c = chunk as { toolCallId: string; toolName: string };
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                tools: [
                  ...(m.tools ?? []),
                  { toolCallId: c.toolCallId, toolName: c.toolName, state: 'running' },
                ],
              }
            : m
        )
      );
      return;
    }
    case 'tool-output-available': {
      const c = chunk as { toolCallId: string; output: unknown };
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                tools: (m.tools ?? []).map((t) =>
                  t.toolCallId === c.toolCallId ? { ...t, state: 'done', output: c.output } : t
                ),
              }
            : m
        )
      );
      return;
    }
    case 'tool-output-error': {
      const c = chunk as { toolCallId: string; errorText: string };
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                tools: (m.tools ?? []).map((t) =>
                  t.toolCallId === c.toolCallId
                    ? { ...t, state: 'error', errorText: c.errorText }
                    : t
                ),
              }
            : m
        )
      );
      return;
    }
    case 'error': {
      const errText = (chunk as { errorText: string }).errorText;
      toast.error(errText || 'Erro no agente');
      return;
    }
    default: {
      // Procura conversation_id em metadata — caso a API resolva mandar
      const maybe = chunk as { messageMetadata?: { conversationId?: string } };
      if (maybe.messageMetadata?.conversationId) {
        setConversationId(maybe.messageMetadata.conversationId);
      }
      return;
    }
  }
}
