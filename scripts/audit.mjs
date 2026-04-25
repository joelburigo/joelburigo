#!/usr/bin/env node
/**
 * Visual audit — Terminal Growth migration
 * Navega rotas em desktop+mobile, captura screenshots e reporta issues.
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:4322';
const OUT = '/tmp/audit-screenshots';
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  '/',
  '/sobre',
  '/advisory',
  '/vendas-sem-segredos',
  '/diagnostico',
  '/diagnostico-obrigado',
  '/diagnostico-resultado',
  '/advisory-aplicacao',
  '/advisory-obrigado',
  '/agendamento-sessao',
  '/cases',
  '/contato',
  '/press-kit',
  '/links',
  '/jornada-90-dias',
  '/privacidade',
  '/termos',
  '/apresentacao',
  '/design-system',
  '/vss-aguardando-pagamento',
  '/vss-analise-credito',
  '/vss-compra-aprovada',
  '/404',
  '/500',
  '/lp/vss',
  '/blog',
  '/blog/sistema-melhor-que-improviso',
];

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 375, height: 812 },
};

const TERMINAL_COLORS = {
  ink: 'rgb(5, 5, 5)',
  ink2: 'rgb(11, 11, 11)',
  cream: 'rgb(245, 241, 232)',
  fire: 'rgb(255, 59, 15)',
  acid: 'rgb(198, 255, 0)',
  white: 'rgb(255, 255, 255)',
};

function slug(route) {
  return route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-');
}

async function audit() {
  const browser = await chromium.launch();
  const results = [];

  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
    const page = await ctx.newPage();

    for (const route of ROUTES) {
      const url = BASE + route;
      const issues = [];
      let status = 0;
      try {
        const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        status = resp?.status() ?? 0;
        await page.waitForTimeout(400);

        // Screenshot
        const pngPath = `${OUT}/${vpName}-${slug(route)}.png`;
        await page.screenshot({ path: pngPath, fullPage: false });

        // 1. Header overlap check: hero/first section content behind fixed header
        const headerH = await page.evaluate(() => {
          const h = document.querySelector('header');
          if (!h) return 0;
          const s = getComputedStyle(h);
          if (s.position !== 'fixed' && s.position !== 'sticky') return 0;
          return h.getBoundingClientRect().height;
        });
        if (headerH > 0) {
          const firstContentTop = await page.evaluate(() => {
            // Find first "real" content under header: kicker, h1, or main > :first
            const candidates = [
              document.querySelector('main'),
              document.querySelector('main *'),
              document.querySelector('.kicker'),
              document.querySelector('h1'),
            ].filter(Boolean);
            if (!candidates.length) return null;
            return Math.round(candidates[0].getBoundingClientRect().top);
          });
          // Real overlap = content visibly inside header area (not just aligned to bottom edge).
          // Allow up to 2px for sub-pixel rounding.
          if (firstContentTop !== null && firstContentTop < Math.round(headerH) - 2) {
            issues.push({
              severity: 'high',
              kind: 'header-overlap',
              msg: `first content top=${firstContentTop}px < header height=${Math.round(headerH)}px — hero atrás do header`,
            });
          }
        }

        // 2. Check legacy colors in computed styles of visible elements
        const legacyColors = await page.evaluate((fire) => {
          const legacy = ['rgb(29, 78, 216)', 'rgb(163, 255, 63)']; // royal-blue, lime
          const found = [];
          document.querySelectorAll('*').forEach((el) => {
            const cs = getComputedStyle(el);
            [
              'color',
              'backgroundColor',
              'borderTopColor',
              'borderRightColor',
              'borderBottomColor',
              'borderLeftColor',
            ].forEach((p) => {
              if (legacy.includes(cs[p])) {
                found.push(
                  `${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 40)} ${p}=${cs[p]}`
                );
              }
            });
          });
          return [...new Set(found)].slice(0, 5);
        });
        if (legacyColors.length) {
          issues.push({
            severity: 'high',
            kind: 'legacy-color',
            msg: `cores legadas: ${legacyColors.join(' | ')}`,
          });
        }

        // 3. Button contrast — find .btn-primary (acid bg) and check if text is cream/white (wrong) vs ink (correct)
        const btnTextColors = await page.evaluate(() => {
          const btns = Array.from(
            document.querySelectorAll('.btn-primary, .btn-fire, button, a')
          ).filter((el) => {
            const cs = getComputedStyle(el);
            const bg = cs.backgroundColor;
            // Acid-ish background or classes
            return (
              bg === 'rgb(198, 255, 0)' ||
              (el.className || '').toString().includes('btn-primary') ||
              (el.className || '').toString().includes('bg-acid')
            );
          });
          return btns.slice(0, 5).map((b) => {
            const cs = getComputedStyle(b);
            return {
              class: (b.className || '').toString().slice(0, 60),
              color: cs.color,
              bg: cs.backgroundColor,
              text: (b.textContent || '').trim().slice(0, 30),
            };
          });
        });
        btnTextColors.forEach((b) => {
          // Wrong: text white/cream on acid bg (should be ink #050505)
          if (
            (b.bg === 'rgb(198, 255, 0)' ||
              b.class.includes('btn-primary') ||
              b.class.includes('bg-acid')) &&
            (b.color === 'rgb(255, 255, 255)' || b.color === 'rgb(245, 241, 232)')
          ) {
            issues.push({
              severity: 'high',
              kind: 'button-contrast',
              msg: `botão acid com texto claro: "${b.text}" color=${b.color}`,
            });
          }
        });

        // 4. Check emoji facial (forbidden)
        const emojiIssues = await page.evaluate(() => {
          const forbidden =
            /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{2700}-\u{27BF}]/u;
          // Allowed: ★ → ▶ ● ▲ ▼
          const allowed = new Set([
            '★',
            '→',
            '▶',
            '●',
            '▲',
            '▼',
            '•',
            '◦',
            '·',
            '«',
            '»',
            '©',
            '✓',
            '✕',
            '✗',
            '×',
          ]);
          const findings = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const text = walker.currentNode.nodeValue || '';
            for (const ch of text) {
              if (forbidden.test(ch) && !allowed.has(ch)) {
                findings.push(`"${ch}" in "${text.trim().slice(0, 40)}"`);
                break;
              }
            }
            if (findings.length > 3) break;
          }
          return findings;
        });
        if (emojiIssues.length) {
          issues.push({
            severity: 'medium',
            kind: 'emoji-forbidden',
            msg: emojiIssues.join(' | '),
          });
        }

        // 5. Font check — heading should be Archivo Black
        const wrongFont = await page.evaluate(() => {
          const found = [];
          document.querySelectorAll('h1, h2, h3').forEach((el) => {
            const cs = getComputedStyle(el);
            const f = cs.fontFamily;
            if (!f.includes('Archivo Black') && !f.includes('Archivo')) {
              found.push(`${el.tagName} fontFamily=${f.slice(0, 50)}`);
            }
          });
          return [...new Set(found)].slice(0, 3);
        });
        if (wrongFont.length) {
          issues.push({ severity: 'medium', kind: 'wrong-font', msg: wrongFont.join(' | ') });
        }

        // 6. Check for horizontal scroll (common responsive bug)
        const hasHScroll = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 2
        );
        if (hasHScroll) {
          issues.push({
            severity: 'high',
            kind: 'h-scroll',
            msg: `documentElement.scrollWidth > viewport`,
          });
        }

        results.push({ viewport: vpName, route, status, issues, screenshot: pngPath });
        process.stdout.write(`${vpName} ${route} [${status}] ${issues.length} issues\n`);
      } catch (e) {
        results.push({
          viewport: vpName,
          route,
          status,
          issues: [{ severity: 'high', kind: 'error', msg: String(e.message || e) }],
          screenshot: null,
        });
        process.stdout.write(`${vpName} ${route} ERROR: ${e.message}\n`);
      }
    }
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(results, null, 2));

  // Summary
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  const byKind = {};
  results.forEach((r) =>
    r.issues.forEach((i) => {
      byKind[i.kind] = (byKind[i.kind] || 0) + 1;
    })
  );
  console.log('\n====== SUMMARY ======');
  console.log(`Routes tested: ${ROUTES.length} × 2 viewports = ${results.length}`);
  console.log(`Total issues: ${totalIssues}`);
  console.log('By kind:', JSON.stringify(byKind));
}

audit().catch((e) => {
  console.error(e);
  process.exit(1);
});
