/**
 * Gera a Open Graph image principal do site (public/og-image.jpg).
 * Usa OpenAI Images API com gpt-image-2 (fallback gpt-image-1).
 * Saída: 1200x630 JPEG (formato OG/Twitter card).
 *
 * Rodar: node scripts/generate-og-image.mjs
 * Requer: OPENAI_API_KEY no .env
 */
import 'dotenv/config';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import OpenAI from 'openai';

const OUT_DIR = 'public';

const PROMPT = `
Brutalist editorial poster, 16:9 horizontal layout, dark background (#050505 ink black).
Massive typography:
  - "JOEL" in cream/off-white (#F5F1E8) — Archivo Black, condensed, geometric
  - "BURIGO" in fire orange-red (#FF3B0F) — same condensed geometric type
  - Subtitle below "VENDAS SEM SEGREDOS" in mono uppercase, electric green-yellow (#C6FF00)

Visual elements:
  - Subtle grid overlay (80px) at low opacity
  - Sharp 90-degree corners, NO rounded edges, NO gradients
  - Brutalist offset shadow on key text — fire/acid color blocks behind
  - Small "// EST. 2008" label in mono monospace, muted gray
  - Small "// SISTEMA > IMPROVISO" tagline at bottom

Style: brutalist swiss design, terminal aesthetic, high contrast, punk rock business confidence.
NO photographs, NO logos, NO watermarks, NO emojis, NO illustrations of people.
Type as the hero — typography poster style.
`.trim();

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY ausente no .env');
    process.exit(1);
  }

  const openai = new OpenAI();

  // gpt-image-2 ainda pode não estar GA — tenta esse e cai pra gpt-image-1
  const candidateModels = ['gpt-image-2', 'gpt-image-1'];

  let imageBase64 = null;
  let usedModel = null;
  let lastError = null;

  for (const model of candidateModels) {
    try {
      console.info(`[og] tentando modelo ${model}...`);
      const res = await openai.images.generate({
        model,
        prompt: PROMPT,
        size: '1536x1024',
        quality: 'high',
        n: 1,
      });
      imageBase64 = res.data?.[0]?.b64_json;
      if (imageBase64) {
        usedModel = model;
        break;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[og] ${model} falhou: ${err.message}. Tentando próximo...`);
    }
  }

  if (!imageBase64) {
    console.error('❌ Nenhum modelo de imagem funcionou:', lastError?.message);
    process.exit(1);
  }

  console.info(`[og] gerada com ${usedModel} (${Math.round(imageBase64.length / 1024)}KB base64)`);

  const buf = Buffer.from(imageBase64, 'base64');
  // Redimensiona pra 1200x630 (OG card padrão) preservando centro
  const ogBuf = await sharp(buf)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  const outPath = join(OUT_DIR, 'og-image.jpg');
  await writeFile(outPath, ogBuf);
  console.info(`✓ ${outPath} salvo (${Math.round(ogBuf.length / 1024)}KB)`);
}

main().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
