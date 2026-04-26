'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';
import type { BlogTag } from '@/server/db/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { slugify, readingMinutes } from '@/lib/utils';
import { TagSelector } from './tag-selector';
import { ImageDropzone } from './image-dropzone';

type Status = 'draft' | 'published' | 'scheduled';

interface InitialPost {
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  content_md: string;
  slug: string;
  status: Status;
  cover_image_path: string | null;
  cover_image_alt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_path: string | null;
  scheduled_for: string | null;
  published_at: string | null;
  reading_minutes: number | null;
}

interface Props {
  postId: string;
  initial: InitialPost;
  initialTagIds: string[];
  allTags: BlogTag[];
  r2PublicUrl: string;
  revisionsCount: number;
}

type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: number }
  | { kind: 'error'; message: string };

const AUTOSAVE_DEBOUNCE_MS = 3000;

export function BlogEditor({
  postId,
  initial,
  initialTagIds,
  allTags,
  r2PublicUrl,
  revisionsCount,
}: Props) {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle ?? '');
  const [excerpt, setExcerpt] = useState(initial.excerpt ?? '');
  const [slug, setSlug] = useState(initial.slug);
  const [status, setStatus] = useState<Status>(initial.status);
  const [coverPath, setCoverPath] = useState<string | null>(initial.cover_image_path);
  const [coverAlt, setCoverAlt] = useState(initial.cover_image_alt ?? '');
  const [seoTitle, setSeoTitle] = useState(initial.seo_title ?? '');
  const [seoDesc, setSeoDesc] = useState(initial.seo_description ?? '');
  const [ogImagePath, setOgImagePath] = useState<string | null>(initial.og_image_path);
  const [tagIds, setTagIds] = useState<string[]>(initialTagIds);
  const [tags, setTags] = useState<BlogTag[]>(allTags);
  const [save, setSave] = useState<SaveState>({ kind: 'idle' });
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState(
    initial.scheduled_for ? toLocalDatetimeInput(initial.scheduled_for) : ''
  );
  const [readingMin, setReadingMin] = useState(initial.reading_minutes ?? 1);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: 'Escreve aqui o post...' }),
      Markdown.configure({
        html: false,
        tightLists: true,
        bulletListMarker: '-',
        linkify: true,
        breaks: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: mdToInitialContent(initial.content_md),
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none min-h-[60vh] focus:outline-none px-6 py-8 text-cream',
      },
    },
    immediatelyRender: false,
    onUpdate: () => {
      scheduleAutosave();
    },
  });

  // ─── Autosave ───
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);

  const flush = useCallback(async () => {
    if (!editor) return;
    dirtyRef.current = false;
    setSave({ kind: 'saving' });
    const md = (editor.storage.markdown as { getMarkdown: () => string }).getMarkdown();
    const minutes = readingMinutes(md);
    setReadingMin(minutes);
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle: subtitle || null,
          excerpt: excerpt || null,
          content_md: md,
          slug,
          cover_image_path: coverPath,
          cover_image_alt: coverAlt || null,
          seo_title: seoTitle || null,
          seo_description: seoDesc || null,
          og_image_path: ogImagePath,
          reading_minutes: minutes,
          tag_ids: tagIds,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setSave({ kind: 'error', message: data.error ?? `HTTP ${res.status}` });
        return;
      }
      setSave({ kind: 'saved', at: Date.now() });
    } catch (err) {
      setSave({
        kind: 'error',
        message: err instanceof Error ? err.message : 'erro de rede',
      });
    }
  }, [
    editor,
    postId,
    title,
    subtitle,
    excerpt,
    slug,
    coverPath,
    coverAlt,
    seoTitle,
    seoDesc,
    ogImagePath,
    tagIds,
  ]);

  const scheduleAutosave = useCallback(() => {
    dirtyRef.current = true;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void flush();
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [flush]);

  // re-arm autosave when meta fields change
  useEffect(() => {
    if (!editor) return;
    scheduleAutosave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    subtitle,
    excerpt,
    slug,
    coverPath,
    coverAlt,
    seoTitle,
    seoDesc,
    ogImagePath,
    tagIds,
  ]);

  // Save on unload
  useEffect(() => {
    const handler = () => {
      if (dirtyRef.current) void flush();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [flush]);

  // ─── Slug auto-fill from title (only while default-ish) ───
  useEffect(() => {
    // se slug ainda parece um auto ('novo-post-xxxxxx'), atualiza com base no título
    if (/^novo-post-[a-z0-9]{4,}$/.test(slug) && title && title !== 'Novo post') {
      setSlug(slugify(title));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  // ─── Publish / Unpublish / Schedule ───
  async function publish() {
    await flush();
    const res = await fetch(`/api/admin/blog/${postId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish' }),
    });
    if (!res.ok) {
      alert('Falha ao publicar');
      return;
    }
    setStatus('published');
    router.refresh();
  }

  async function unpublish() {
    await flush();
    const res = await fetch(`/api/admin/blog/${postId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unpublish' }),
    });
    if (!res.ok) {
      alert('Falha ao despublicar');
      return;
    }
    setStatus('draft');
    router.refresh();
  }

  async function schedule() {
    if (!scheduleAt) return;
    await flush();
    const iso = new Date(scheduleAt).toISOString();
    const res = await fetch(`/api/admin/blog/${postId}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduled_for: iso }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      alert(`Falha ao agendar: ${data.error ?? 'erro'}`);
      return;
    }
    setStatus('scheduled');
    setScheduleOpen(false);
    router.refresh();
  }

  // ─── Image insertion ───
  const insertImageFromUpload = useCallback(
    async (file: File) => {
      if (!editor) return;
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/admin/blog/${postId}/image`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        alert('Falha no upload da imagem');
        return;
      }
      const data = (await res.json()) as {
        image: { url: string; alt: string; width: number; height: number };
      };
      editor
        .chain()
        .focus()
        .insertContent(`<p><img src="${data.image.url}" alt="${data.image.alt}" /></p>`)
        .run();
      scheduleAutosave();
    },
    [editor, postId, scheduleAutosave]
  );

  // Slug uniqueness on blur
  async function validateSlug() {
    const normalized = slugify(slug);
    if (!normalized) return;
    if (normalized !== slug) setSlug(normalized);
    // PATCH already validates; here só normaliza o input.
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      {/* ─── Left: Editor ─── */}
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <a
              href="/admin/blog"
              className="text-fg-3 hover:text-acid font-mono text-[11px] tracking-[0.22em] uppercase"
            >
              ← Posts
            </a>
            <SaveIndicator state={save} />
            <span className="text-fg-3 ml-auto font-mono text-[11px] tracking-[0.22em] uppercase">
              {revisionsCount} rev · {readingMin}min
            </span>
          </div>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do post"
            className="!h-auto border-0 border-b border-[var(--jb-hair)] !bg-transparent px-0 !py-3 !text-3xl font-black uppercase tracking-tight focus-visible:!border-acid focus-visible:!ring-0"
          />
          <Input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtítulo (opcional)"
            className="text-fg-2 !h-auto border-0 !bg-transparent px-0 !py-1 text-base focus-visible:!ring-0"
          />
        </header>

        <Toolbar editor={editor} onImageUpload={insertImageFromUpload} />

        <div className="bg-ink-2 border border-[var(--jb-hair)]">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* ─── Right: Meta panel ─── */}
      <aside className="flex flex-col gap-5">
        <PanelSection title="Status">
          <div className="flex flex-col gap-2">
            <div className="text-fg-2 flex items-center gap-2 font-mono text-xs">
              {status === 'published' && <Badge variant="acid">publicado</Badge>}
              {status === 'scheduled' && <Badge variant="fire">agendado</Badge>}
              {status === 'draft' && <Badge variant="outline">draft</Badge>}
            </div>
            {initial.published_at && status === 'published' && (
              <p className="text-fg-3 font-mono text-[11px]">
                desde {new Date(initial.published_at).toLocaleString('pt-BR')}
              </p>
            )}
            <div className="flex flex-col gap-2 pt-2">
              {status !== 'published' ? (
                <Button onClick={publish} variant="primary" size="sm">
                  Publicar agora
                </Button>
              ) : (
                <Button onClick={unpublish} variant="secondary" size="sm">
                  Despublicar
                </Button>
              )}
              <Button onClick={() => setScheduleOpen(true)} variant="secondary" size="sm">
                Agendar
              </Button>
            </div>
          </div>
        </PanelSection>

        <PanelSection title="Slug">
          <Input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            onBlur={validateSlug}
            className="font-mono text-sm"
          />
          <p className="text-fg-3 mt-1 font-mono text-[11px]">/blog/{slug}</p>
        </PanelSection>

        <PanelSection title="Tags">
          <TagSelector
            allTags={tags}
            selectedIds={tagIds}
            onChange={setTagIds}
            onCreated={(t) => setTags((prev) => [...prev, t])}
          />
        </PanelSection>

        <PanelSection title="Excerpt">
          <Textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="Resumo curto pro card e SEO description default"
          />
        </PanelSection>

        <PanelSection title="Cover image">
          <ImageDropzone
            currentPath={coverPath}
            r2PublicUrl={r2PublicUrl}
            postId={postId}
            onUploaded={(img) => {
              setCoverPath(img.path);
              if (!coverAlt) setCoverAlt(img.alt);
            }}
            onClear={() => setCoverPath(null)}
          />
          <Input
            type="text"
            value={coverAlt}
            onChange={(e) => setCoverAlt(e.target.value)}
            placeholder="Alt text"
            className="mt-2"
          />
        </PanelSection>

        <PanelSection title="SEO">
          <Label className="text-fg-3 font-mono text-[10px] tracking-[0.2em] uppercase">
            Title
          </Label>
          <Input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder={title}
            maxLength={120}
            className="mb-3"
          />
          <Label className="text-fg-3 font-mono text-[10px] tracking-[0.2em] uppercase">
            Description
          </Label>
          <Textarea
            value={seoDesc}
            onChange={(e) => setSeoDesc(e.target.value)}
            placeholder={excerpt || 'Default = excerpt'}
            rows={3}
            maxLength={200}
            className="mb-3"
          />
          <Label className="text-fg-3 font-mono text-[10px] tracking-[0.2em] uppercase">
            OG Image
          </Label>
          <ImageDropzone
            currentPath={ogImagePath}
            r2PublicUrl={r2PublicUrl}
            postId={postId}
            onUploaded={(img) => setOgImagePath(img.path)}
            onClear={() => setOgImagePath(null)}
          />
        </PanelSection>
      </aside>

      {/* Schedule Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar publicação</DialogTitle>
            <DialogDescription>
              Worker pg-boss publica no horário marcado. Cron de fallback varre a cada 5min.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="scheduled_for">Data e hora</Label>
            <Input
              id="scheduled_for"
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={() => setScheduleOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={schedule} disabled={!scheduleAt}>
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Subcomponents
// ────────────────────────────────────────────────────────────────────────────

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-ink-2 border border-[var(--jb-hair)] p-4">
      <h3 className="text-fg-3 mb-3 font-mono text-[10px] tracking-[0.22em] uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const text = useMemo(() => {
    switch (state.kind) {
      case 'idle':
        return '—';
      case 'saving':
        return 'salvando...';
      case 'saved':
        return `salvo ${secondsAgo(state.at)}s atrás`;
      case 'error':
        return `erro: ${state.message}`;
    }
  }, [state]);
  const color =
    state.kind === 'error' ? 'text-fire' : state.kind === 'saving' ? 'text-acid' : 'text-fg-3';
  return (
    <span className={`font-mono text-[11px] tracking-[0.22em] uppercase ${color}`}>{text}</span>
  );
}

function Toolbar({
  editor,
  onImageUpload,
}: {
  editor: Editor | null;
  onImageUpload: (file: File) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  if (!editor) return null;
  const ed: Editor = editor;

  function btn({
    onClick,
    active,
    label,
    children,
    disabled,
  }: {
    onClick: () => void;
    active?: boolean;
    label: string;
    children: React.ReactNode;
    disabled?: boolean;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={label}
        aria-label={label}
        disabled={disabled}
        className={`hover:text-acid hover:border-acid p-2 transition-colors disabled:opacity-40 ${
          active ? 'text-acid border-acid' : 'text-fg-2 border-[var(--jb-hair)]'
        } border`}
      >
        {children}
      </button>
    );
  }

  function setLink() {
    const prev = ed.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL do link', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      ed.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    ed.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  return (
    <div className="bg-ink-2 flex flex-wrap gap-1 border border-[var(--jb-hair)] p-2">
      {btn({
        onClick: () => editor.chain().focus().toggleBold().run(),
        active: editor.isActive('bold'),
        label: 'Negrito (Ctrl+B)',
        children: <Bold className="size-4" />,
      })}
      {btn({
        onClick: () => editor.chain().focus().toggleItalic().run(),
        active: editor.isActive('italic'),
        label: 'Itálico (Ctrl+I)',
        children: <Italic className="size-4" />,
      })}
      <span className="bg-[var(--jb-hair)] mx-1 w-px" />
      {btn({
        onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        active: editor.isActive('heading', { level: 1 }),
        label: 'H1',
        children: <Heading1 className="size-4" />,
      })}
      {btn({
        onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        active: editor.isActive('heading', { level: 2 }),
        label: 'H2',
        children: <Heading2 className="size-4" />,
      })}
      {btn({
        onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        active: editor.isActive('heading', { level: 3 }),
        label: 'H3',
        children: <Heading3 className="size-4" />,
      })}
      <span className="bg-[var(--jb-hair)] mx-1 w-px" />
      {btn({
        onClick: () => editor.chain().focus().toggleBulletList().run(),
        active: editor.isActive('bulletList'),
        label: 'Lista',
        children: <List className="size-4" />,
      })}
      {btn({
        onClick: () => editor.chain().focus().toggleOrderedList().run(),
        active: editor.isActive('orderedList'),
        label: 'Lista numerada',
        children: <ListOrdered className="size-4" />,
      })}
      {btn({
        onClick: () => editor.chain().focus().toggleBlockquote().run(),
        active: editor.isActive('blockquote'),
        label: 'Quote',
        children: <Quote className="size-4" />,
      })}
      {btn({
        onClick: () => editor.chain().focus().toggleCodeBlock().run(),
        active: editor.isActive('codeBlock'),
        label: 'Código',
        children: <Code className="size-4" />,
      })}
      <span className="bg-[var(--jb-hair)] mx-1 w-px" />
      {btn({
        onClick: setLink,
        active: editor.isActive('link'),
        label: 'Link',
        children: <LinkIcon className="size-4" />,
      })}
      {btn({
        onClick: () => fileRef.current?.click(),
        label: 'Inserir imagem',
        children: <ImageIcon className="size-4" />,
      })}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          await onImageUpload(file);
          e.target.value = '';
        }}
      />
      <span className="bg-[var(--jb-hair)] mx-1 w-px" />
      {btn({
        onClick: () => editor.chain().focus().undo().run(),
        label: 'Desfazer',
        disabled: !editor.can().undo(),
        children: <Undo className="size-4" />,
      })}
      {btn({
        onClick: () => editor.chain().focus().redo().run(),
        label: 'Refazer',
        disabled: !editor.can().redo(),
        children: <Redo className="size-4" />,
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// helpers
// ────────────────────────────────────────────────────────────────────────────

function secondsAgo(ts: number): number {
  return Math.max(0, Math.round((Date.now() - ts) / 1000));
}

/**
 * tiptap-markdown aceita string MD direto via `content` prop, mas pra ficar
 * explícito + futuro-proof, retornamos string que o markdown extension parseia.
 */
function mdToInitialContent(md: string): string {
  return md ?? '';
}

function toLocalDatetimeInput(iso: string): string {
  // Convert ISO → "YYYY-MM-DDTHH:MM" no fuso local
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
