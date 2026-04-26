import 'server-only';

/**
 * Cloudflare Stream — Live Input client
 *
 * Sem SDK oficial; usa fetch diretamente.
 * Docs: https://developers.cloudflare.com/stream/stream-live/
 *
 * Modo automatic recording: replays HLS gerados sem ação manual.
 * Webhook `live_input.recording.ready` dispara em `/api/cf-stream/webhook`.
 *
 * DEV (sem CF_API_TOKEN): retorna mocks; nunca falha.
 */

import { env } from '@/env';
import { ulid } from '@/server/lib/ulid';

const BASE = 'https://api.cloudflare.com/client/v4';

export interface CfLiveInputResponse {
  uid: string;
  rtmps: { url: string; streamKey: string };
  rtmpsPlayback?: { url: string; streamKey: string };
  srt?: { url: string; streamId: string; passphrase: string };
  webRTC?: { url: string };
  webRTCPlayback?: { url: string };
  meta?: { name?: string };
  status?: { current?: { state?: string } } | null;
  recording?: { mode: string; requireSignedURLs?: boolean };
}

export interface CfVideoResponse {
  uid: string;
  status?: { state?: string };
  playback?: { hls?: string; dash?: string };
  preview?: string;
  thumbnail?: string;
  duration?: number;
  meta?: Record<string, unknown>;
}

interface CfApiEnvelope<T> {
  result: T;
  success: boolean;
  errors?: Array<{ code: number; message: string }>;
  messages?: unknown[];
}

function isConfigured(): boolean {
  return Boolean(env.CF_ACCOUNT_ID && env.CF_API_TOKEN);
}

function streamBase(): string {
  return `${BASE}/accounts/${env.CF_ACCOUNT_ID}/stream`;
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${env.CF_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function cfFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers ?? {}) },
  });
  const json = (await res.json().catch(() => ({}))) as Partial<CfApiEnvelope<T>>;
  if (!res.ok || json.success === false) {
    const errMsg = json.errors?.map((e) => `${e.code}:${e.message}`).join('; ') ?? res.statusText;
    throw new Error(`[cf-stream] ${res.status} ${errMsg}`);
  }
  return json.result as T;
}

// ---------- Mocks (dev) ----------

function mockLiveInput(name: string): CfLiveInputResponse {
  const uid = `dev-${ulid().toLowerCase()}`;
  return {
    uid,
    rtmps: {
      url: 'rtmp://dev-stub.cloudflare.com/live/',
      streamKey: `stub-key-${uid}`,
    },
    meta: { name },
    status: { current: { state: 'idle' } },
    recording: { mode: 'automatic' },
  };
}

// ---------- Public API ----------

export interface CreateLiveInputOptions {
  name: string;
  mode?: 'automatic' | 'off';
}

export async function createLiveInput(
  opts: CreateLiveInputOptions
): Promise<CfLiveInputResponse> {
  if (!isConfigured()) {
    console.warn('[cf-stream] CF_API_TOKEN ausente — retornando mock pra dev');
    return mockLiveInput(opts.name);
  }
  return cfFetch<CfLiveInputResponse>(`${streamBase()}/live_inputs`, {
    method: 'POST',
    body: JSON.stringify({
      meta: { name: opts.name },
      recording: {
        mode: opts.mode ?? 'automatic',
        requireSignedURLs: false,
        allowedOrigins: [],
      },
      defaultCreator: 'joel',
    }),
  });
}

export async function getLiveInput(uid: string): Promise<CfLiveInputResponse | null> {
  if (!isConfigured()) {
    console.warn('[cf-stream] CF_API_TOKEN ausente — retornando mock');
    return mockLiveInput(`mock-${uid}`);
  }
  try {
    return await cfFetch<CfLiveInputResponse>(`${streamBase()}/live_inputs/${uid}`);
  } catch (err) {
    console.error('[cf-stream] getLiveInput falhou', err);
    return null;
  }
}

export async function deleteLiveInput(uid: string): Promise<void> {
  if (!isConfigured()) {
    console.warn(`[cf-stream] DEV deleteLiveInput ${uid} (mock)`);
    return;
  }
  if (uid.startsWith('dev-')) return; // ids mock nunca existiram no CF
  try {
    await cfFetch<unknown>(`${streamBase()}/live_inputs/${uid}`, { method: 'DELETE' });
  } catch (err) {
    console.error('[cf-stream] deleteLiveInput falhou', err);
  }
}

export async function listLiveInputVideos(uid: string): Promise<CfVideoResponse[]> {
  if (!isConfigured()) return [];
  try {
    const result = await cfFetch<CfVideoResponse[] | { videos: CfVideoResponse[] }>(
      `${streamBase()}/live_inputs/${uid}/videos`
    );
    if (Array.isArray(result)) return result;
    return result?.videos ?? [];
  } catch (err) {
    console.error('[cf-stream] listLiveInputVideos falhou', err);
    return [];
  }
}

export async function getVideo(videoUid: string): Promise<CfVideoResponse | null> {
  if (!isConfigured()) return null;
  try {
    return await cfFetch<CfVideoResponse>(`${streamBase()}/${videoUid}`);
  } catch (err) {
    console.error('[cf-stream] getVideo falhou', err);
    return null;
  }
}

// ---------- URL helpers ----------

export function hlsUrlFor(videoUid: string): string {
  const code = env.CF_STREAM_CUSTOMER_CODE ?? 'unknown';
  return `https://customer-${code}.cloudflarestream.com/${videoUid}/manifest/video.m3u8`;
}

export function iframeUrlFor(videoUid: string): string {
  const code = env.CF_STREAM_CUSTOMER_CODE ?? 'unknown';
  return `https://customer-${code}.cloudflarestream.com/${videoUid}/iframe`;
}

export function isCfStreamConfigured(): boolean {
  return isConfigured() && Boolean(env.CF_STREAM_CUSTOMER_CODE);
}
