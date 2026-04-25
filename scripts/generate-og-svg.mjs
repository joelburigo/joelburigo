/**
 * Gera a OG image principal (public/og-image.jpg) a partir de SVG vetorial.
 * 100% determinístico, fiel ao design system Terminal Growth.
 * Não depende de API externa.
 *
 * Tamanho: 1200x630 (Open Graph + Twitter card padrão).
 * Rodar: node scripts/generate-og-svg.mjs
 */
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const W = 1200;
const H = 630;

const INK = '#050505';
const INK_2 = '#0B0B0B';
const CREAM = '#F5F1E8';
const FIRE = '#FF3B0F';
const ACID = '#C6FF00';
const HAIR = 'rgba(255,255,255,0.08)';

// Grid overlay (80px)
const gridLines = (() => {
  let out = '';
  for (let x = 0; x <= W; x += 80) {
    out += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>`;
  }
  for (let y = 0; y <= H; y += 80) {
    out += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>`;
  }
  return out;
})();

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="85%" cy="20%" r="55%">
      <stop offset="0%" stop-color="${FIRE}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${FIRE}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${INK}"/>
  ${gridLines}
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Status bar topo -->
  <line x1="0" y1="56" x2="${W}" y2="56" stroke="${HAIR}" stroke-width="1"/>
  <circle cx="56" cy="28" r="4" fill="${ACID}"/>
  <text x="72" y="33" font-family="Menlo, monospace" font-size="13" font-weight="600"
    letter-spacing="2.5" fill="rgba(255,255,255,0.5)" text-transform="uppercase">
    SYS ONLINE  ·  EST. 2008  ·  FLORIANÓPOLIS/SC
  </text>

  <!-- Wordmark JOEL|BURIGO -->
  <text x="64" y="280" font-family="Archivo Black, Impact, sans-serif" font-size="180"
    font-weight="900" letter-spacing="-9" fill="${CREAM}">JOEL</text>
  <text x="64" y="450" font-family="Archivo Black, Impact, sans-serif" font-size="180"
    font-weight="900" letter-spacing="-9" fill="${FIRE}">BURIGO</text>

  <!-- Tagline acid -->
  <text x="68" y="530" font-family="Menlo, monospace" font-size="20" font-weight="700"
    letter-spacing="6" fill="${ACID}" text-transform="uppercase">
    // VENDAS SEM SEGREDOS · FRAMEWORK 6PS
  </text>

  <!-- Sub bullets -->
  <text x="68" y="568" font-family="Archivo, system-ui, sans-serif" font-size="22"
    fill="rgba(245,241,232,0.85)">
    17+ anos · 140+ MPEs · ~R$ 1 bilhão estruturado
  </text>

  <!-- Card lateral direita: investimento -->
  <g transform="translate(800, 130)">
    <rect width="340" height="200" fill="${INK_2}" stroke="${ACID}" stroke-width="2"/>
    <text x="20" y="42" font-family="Menlo, monospace" font-size="14" font-weight="700"
      letter-spacing="3.5" fill="${ACID}" text-transform="uppercase">
      // ACESSO VITALÍCIO
    </text>
    <text x="20" y="105" font-family="Archivo Black, Impact, sans-serif" font-size="58"
      font-weight="900" letter-spacing="-3" fill="${ACID}">R$ 1.997</text>
    <text x="20" y="138" font-family="Archivo, system-ui, sans-serif" font-size="16"
      fill="rgba(245,241,232,0.75)">
      ou 12× R$ 166,42 no cartão
    </text>
    <line x1="20" y1="155" x2="320" y2="155" stroke="${HAIR}" stroke-width="1"/>
    <text x="20" y="180" font-family="Menlo, monospace" font-size="11" font-weight="600"
      letter-spacing="3" fill="rgba(245,241,232,0.5)" text-transform="uppercase">
      ★ GARANTIA 15 DIAS · INCONDICIONAL
    </text>
  </g>

  <!-- Linha rodapé -->
  <line x1="0" y1="608" x2="${W}" y2="608" stroke="${HAIR}" stroke-width="1"/>
  <text x="64" y="603" font-family="Menlo, monospace" font-size="11" font-weight="700"
    letter-spacing="4" fill="rgba(245,241,232,0.5)" text-transform="uppercase">
    SISTEMA  &gt;  IMPROVISO    ·    JOELBURIGO.COM.BR
  </text>
</svg>`;

const out = join('public', 'og-image.jpg');

const buf = await sharp(Buffer.from(svg))
  .resize(W, H)
  .jpeg({ quality: 90, mozjpeg: true })
  .toBuffer();

await writeFile(out, buf);
console.info(`✓ ${out} (${(buf.length / 1024).toFixed(1)}KB · ${W}x${H})`);
