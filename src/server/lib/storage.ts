import 'server-only';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Storage adapter — Cloudflare R2 via S3 SDK (padrão S3-compatible).
 *
 * Troca de impl (ex: CF binding direto na Fase B) só toca este arquivo.
 */

export interface StorageAdapter {
  put(key: string, body: Buffer | Uint8Array | string, contentType?: string): Promise<void>;
  get(key: string): Promise<Uint8Array>;
  delete(key: string): Promise<void>;
  signedGetUrl(key: string, expiresInSec?: number): Promise<string>;
  publicUrl(key: string): string;
}

const R2_BUCKET = process.env.R2_BUCKET || 'joelburigo-artifacts';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''; // ex: https://pub-xxx.r2.dev

function makeClient(): S3Client {
  const accountId = process.env.CF_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 creds ausentes (CF_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

let _client: S3Client | null = null;
function client() {
  if (!_client) _client = makeClient();
  return _client;
}

export const storage: StorageAdapter = {
  async put(key, body, contentType) {
    await client().send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
  },

  async get(key) {
    const res = await client().send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    const body = res.Body;
    if (!body) throw new Error(`Empty body for ${key}`);
    const chunks: Uint8Array[] = [];
    for await (const c of body as AsyncIterable<Uint8Array>) chunks.push(c);
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const merged = new Uint8Array(total);
    let pos = 0;
    for (const c of chunks) {
      merged.set(c, pos);
      pos += c.length;
    }
    return merged;
  },

  async delete(key) {
    await client().send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  },

  async signedGetUrl(key, expiresInSec = 3600) {
    return getSignedUrl(client(), new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }), {
      expiresIn: expiresInSec,
    });
  },

  publicUrl(key) {
    if (!R2_PUBLIC_URL) throw new Error('R2_PUBLIC_URL não configurado');
    return `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
  },
};
