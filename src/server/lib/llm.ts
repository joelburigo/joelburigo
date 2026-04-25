import 'server-only';

/**
 * LLM adapter — OpenAI default, Anthropic via env switch. Zero lock-in.
 *
 * Uso típico:
 *
 *   import { getModel, getImageModel } from '@/server/lib/llm';
 *   import { streamText } from 'ai';
 *
 *   const result = await streamText({
 *     model: getModel('chat'),
 *     messages: [...],
 *     tools: { ... },
 *   });
 *
 * Trocar de provider: setar `LLM_PROVIDER=anthropic` no .env. Cheia de lock-in
 * só se você usar features exclusivas (ex: prompt caching Anthropic nested messages).
 */

import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import type { LanguageModel } from 'ai';

type ProviderName = 'openai' | 'anthropic';
type ModelRole = 'chat' | 'premium' | 'image';

const PROVIDER: ProviderName = (process.env.LLM_PROVIDER as ProviderName) || 'openai';

// Defaults por role. Override via env vars individuais.
const MODELS = {
  openai: {
    chat: process.env.LLM_MODEL_CHAT || 'gpt-5.2',
    premium: process.env.LLM_MODEL_PREMIUM || 'gpt-5.2',
    image: process.env.LLM_MODEL_IMAGE || 'gpt-image-2',
  },
  anthropic: {
    chat: process.env.LLM_MODEL_CHAT || 'claude-sonnet-4-6',
    premium: process.env.LLM_MODEL_PREMIUM || 'claude-opus-4-7',
    image: process.env.LLM_MODEL_IMAGE || '', // Anthropic não gera imagem; se usar, forçar OpenAI
  },
} as const;

/**
 * Retorna um LanguageModel do AI SDK compatível com streamText/generateText/generateObject.
 */
export function getModel(role: Exclude<ModelRole, 'image'> = 'chat'): LanguageModel {
  const modelId = MODELS[PROVIDER][role];
  if (PROVIDER === 'openai') return openai(modelId);
  return anthropic(modelId);
}

/**
 * Gera imagem — hoje exclusivamente via OpenAI (`gpt-image-2`).
 * Se PROVIDER=anthropic, ainda força OpenAI pra imagem.
 */
export function getImageModel() {
  const modelId = MODELS.openai.image;
  if (!modelId) throw new Error('LLM_MODEL_IMAGE não configurado');
  // AI SDK ainda não exporta image types maduros; usa SDK direto
  return { provider: 'openai' as const, modelId };
}

/**
 * Info pra telemetry (custo, logs) — pair de (provider, model).
 */
export function getModelInfo(role: Exclude<ModelRole, 'image'> = 'chat') {
  return { provider: PROVIDER, model: MODELS[PROVIDER][role] };
}

/**
 * Cache de preços por 1M tokens (input/output). Atualiza quando Anthropic/OpenAI mudam.
 * Valores em USD — convertidos pra centavos BRL no agregador de custos.
 */
export const PRICING_USD_PER_M = {
  'gpt-5.2': { input: 2, output: 10 },
  'gpt-image-2': { input: 0, output: 0 }, // faturado por imagem, ver services/images.ts
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-opus-4-7': { input: 15, output: 75 },
} as const;

export function estimateCostUsd(
  model: string,
  tokensInput: number,
  tokensOutput: number
): number {
  const prices = PRICING_USD_PER_M[model as keyof typeof PRICING_USD_PER_M];
  if (!prices) return 0;
  return (tokensInput * prices.input + tokensOutput * prices.output) / 1_000_000;
}
