import 'server-only';

/**
 * Tools do agente VSS — Vercel AI SDK 6.x.
 *
 * Cada tool é uma factory `makeXxx({ userId, conversationId, destravamentoId })`
 * que captura o contexto do usuário em closure e devolve um `Tool` pronto pro
 * `streamText({ tools: ... })`. Isso evita ter que passar IDs por args do model
 * (que não tem como saber quem é o user) e mantém type-safety.
 *
 * Tools disponíveis:
 *   - saveArtifact      → insere em agent_artifacts
 *   - updateProfile     → patch em user_profiles (campos 6P + dados base)
 *   - markComplete      → upsert user_progress.status='completed'
 *   - requestHumanReview → flag conversation pra Joel revisar (status='needs_review')
 */

import { tool } from 'ai';
import { z } from 'zod';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/server/db/client';
import {
  agent_artifacts,
  agent_conversations,
  user_profiles,
  user_progress,
} from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';

export interface ToolContext {
  userId: string;
  conversationId: string;
  destravamentoId: string;
}

/** Tipos de artifact que o agente pode salvar (livre, mas categorizado pra UI). */
const ARTIFACT_KINDS = [
  'icp',
  'oferta',
  'script_vendas',
  'cadencia',
  'precificacao',
  'plano_acao',
  'diagnostico',
  'outro',
] as const;

/** Campos de user_profiles que o agente pode atualizar via tool. */
const PROFILE_FIELDS = [
  'empresa_nome',
  'segmento',
  'gargalo_principal',
  'produto_md',
  'pessoas_md',
  'precificacao_md',
  'processos_md',
  'performance_md',
  'propaganda_md',
] as const;
type ProfileField = (typeof PROFILE_FIELDS)[number];

// ============ FACTORIES ============

function makeSaveArtifact(ctx: ToolContext) {
  return tool({
    description:
      'Salva um artifact do destravamento (markdown). Use quando o aluno e você consolidaram um entregável (ex: ICP definido, script de vendas, oferta). Retorna o ID do artifact pra referenciar depois.',
    inputSchema: z.object({
      title: z.string().min(1).max(200).describe('Título curto do artifact (ex: "ICP — agências PMEs SP")'),
      content_md: z.string().min(1).describe('Conteúdo em markdown bem-formatado'),
      kind: z.enum(ARTIFACT_KINDS).describe('Categoria do artifact'),
    }),
    execute: async ({ title, content_md, kind }) => {
      const id = ulid();
      await db.insert(agent_artifacts).values({
        id,
        user_id: ctx.userId,
        conversation_id: ctx.conversationId,
        destravamento_id: ctx.destravamentoId,
        kind,
        title,
        content_md,
        version: 1,
        is_current: true,
        metadata: {},
      });
      // Atualiza ponteiro do progresso pro último artifact
      await db
        .insert(user_progress)
        .values({
          user_id: ctx.userId,
          destravamento_id: ctx.destravamentoId,
          last_artifact_id: id,
          started_at: new Date(),
        })
        .onConflictDoUpdate({
          target: [user_progress.user_id, user_progress.destravamento_id],
          set: { last_artifact_id: id },
        });
      return { id, title, kind, ok: true };
    },
  });
}

function makeUpdateProfile(ctx: ToolContext) {
  return tool({
    description:
      'Atualiza um campo do perfil 6P do aluno. Use quando o aluno revelar info nova relevante (gargalo principal, ICP em precificacao_md, etc). Não sobrescreve campo: faz patch.',
    inputSchema: z.object({
      field: z.enum(PROFILE_FIELDS).describe('Campo do perfil a atualizar'),
      value: z.string().min(1).max(20_000).describe('Novo valor (markdown ok)'),
    }),
    execute: async ({ field, value }) => {
      const set: Partial<Record<ProfileField, string>> & { updated_at: Date } = {
        updated_at: new Date(),
        [field]: value,
      };
      await db
        .insert(user_profiles)
        .values({
          user_id: ctx.userId,
          [field]: value,
        })
        .onConflictDoUpdate({
          target: user_profiles.user_id,
          set,
        });
      return { field, ok: true };
    },
  });
}

function makeMarkComplete(ctx: ToolContext) {
  return tool({
    description:
      'Marca o destravamento atual como concluído. Use SOMENTE quando o aluno explicitamente confirmou que terminou e o entregável principal está salvo.',
    inputSchema: z.object({
      summary: z
        .string()
        .max(1000)
        .optional()
        .describe('Resumo curto do que foi destravado (opcional, vai pra metadata)'),
    }),
    execute: async ({ summary }) => {
      const now = new Date();
      await db
        .insert(user_progress)
        .values({
          user_id: ctx.userId,
          destravamento_id: ctx.destravamentoId,
          started_at: now,
          completed_at: now,
        })
        .onConflictDoUpdate({
          target: [user_progress.user_id, user_progress.destravamento_id],
          set: { completed_at: now },
        });
      // Marca a conversa como done
      await db
        .update(agent_conversations)
        .set({
          status: 'completed',
          updated_at: now,
          context_snapshot: sql`coalesce(${agent_conversations.context_snapshot}, '{}'::jsonb) || ${JSON.stringify({ completion_summary: summary ?? null })}::jsonb`,
        })
        .where(eq(agent_conversations.id, ctx.conversationId));
      return { ok: true, completed_at: now.toISOString() };
    },
  });
}

function makeRequestHumanReview(ctx: ToolContext) {
  return tool({
    description:
      'Sinaliza que essa conversa precisa de revisão humana do Joel. Use quando o aluno traz situação fora do escopo do destravamento, pede review estratégico explicitamente, ou você não tem confiança suficiente pra avançar sozinho.',
    inputSchema: z.object({
      reason: z
        .string()
        .min(10)
        .max(2000)
        .describe('Motivo da revisão — o que o Joel deve olhar e por quê'),
    }),
    execute: async ({ reason }) => {
      const now = new Date();
      await db
        .update(agent_conversations)
        .set({
          status: 'needs_review',
          updated_at: now,
          context_snapshot: sql`coalesce(${agent_conversations.context_snapshot}, '{}'::jsonb) || ${JSON.stringify({ review_reason: reason, review_requested_at: now.toISOString() })}::jsonb`,
        })
        .where(
          and(
            eq(agent_conversations.id, ctx.conversationId),
            eq(agent_conversations.user_id, ctx.userId)
          )
        );
      return { ok: true, status: 'needs_review' as const };
    },
  });
}

// ============ PUBLIC ============

/**
 * Constrói o `tools` object pro `streamText`. Captura `ctx` via closure pra cada
 * tool ter acesso a userId/conversationId/destravamentoId sem o model precisar
 * passar essas IDs (o que não daria, ele não as conhece).
 */
export function buildAgentTools(ctx: ToolContext) {
  return {
    saveArtifact: makeSaveArtifact(ctx),
    updateProfile: makeUpdateProfile(ctx),
    markComplete: makeMarkComplete(ctx),
    requestHumanReview: makeRequestHumanReview(ctx),
  };
}

export type AgentToolSet = ReturnType<typeof buildAgentTools>;
