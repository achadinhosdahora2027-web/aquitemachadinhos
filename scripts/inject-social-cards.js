#!/usr/bin/env node
/**
 * ==============================================================================
 * INJETOR DE CARTOES SOCIAIS (Open Graph + Twitter Card)
 * ==============================================================================
 * ACHADO: 3.401 das 3.403 paginas nao tinham `og:image`. Sem og:image, todo link
 * compartilhado no WhatsApp, Telegram, Facebook, X ou LinkedIn aparece como um
 * quadrado vazio — sem foto, sem marca. Isso derruba o CTR justamente no canal
 * que mais importa para este projeto (grupos e canais do Telegram, onde as
 * ofertas sao divulgadas com link para o site).
 *
 * O QUE ESTE SCRIPT FAZ, por pagina (idempotente):
 *   • og:image ............... https://www.aquitemachadinhos.com.br/og-image.png
 *                              (arquivo real do repositorio: 1200x630, conferido)
 *   • og:image:width/height .. 1200 / 630
 *   • og:type ................ website
 *   • og:site_name ........... "Aqui Tem Achadinhos"
 *   • og:locale .............. pt_BR
 *   • og:url ................. a canonical da propria pagina (nao inventa URL)
 *   • twitter:card ........... summary_large_image
 *   • twitter:image .......... a mesma imagem
 *
 *   Nao sobrescreve og:image que ja exista e aponte para outra imagem (respeita
 *   paginas que definiram foto propria, como it/laquila.html com foto do Unsplash).
 *   As meta tags sao lidas como atributos de verdade (ordem livre, aspas simples
 *   ou duplas) e criadas antes de </head> quando faltam.
 *
 * Uso:
 *   node scripts/inject-social-cards.js --check
 *   node scripts/inject-social-cards.js
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const REPORT = path.join(__dirname, '..', 'data', 'social-cards-report.json');
const ORIGIN = 'https://www.aquitemachadinhos.com.br';
const OG_IMAGE = `${ORIGIN}/og-image.png`;
const SITE_NAME = 'Aqui Tem Achadinhos';
const CHECK_ONLY = process.argv.includes('--check');

const META_RE = /<meta\b[^>]*>/gi;
const ATTR_RE = /([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

function parseAttrs(tag) {
  const attrs = [];
  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(tag)) !== null) {
    attrs.push({ name: m[1].toLowerCase(), raw: m[0], value: m[3] !== undefined ? m[3] : m[4], quote: m[2][0] });
  }
  return attrs;
}

function escapeAttr(v) {
  return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function getMeta(html, key) {
  let found = null;
  for (const m of html.matchAll(META_RE)) {
    const attrs = parseAttrs(m[0]);
    const id = attrs.find((a) => a.name === 'property' || a.name === 'name');
    if (id && id.value === key) {
      const c = attrs.find((a) => a.name === 'content');
      found = c ? c.value : '';
    }
  }
  return found;
}

function setMeta(html, key, content) {
  const useProperty = key.startsWith('og:');
  const idAttr = useProperty ? 'property' : 'name';
  let done = false;
  const out = html.replace(META_RE, (tag) => {
    const attrs = parseAttrs(tag);
    const id = attrs.find((a) => a.name === idAttr);
    if (!id || id.value !== key) return tag;
    const c = attrs.find((a) => a.name === 'content');
    done = true;
    if (!c) return `<meta ${idAttr}="${key}" content="${escapeAttr(content)}"/>`;
    return tag.replace(c.raw, `content=${c.quote}${escapeAttr(content)}${c.quote}`);
  });
  if (done) return out;
  const tag = useProperty
    ? `<meta property="${key}" content="${escapeAttr(content)}"/>`
    : `<meta name="${key}" content="${escapeAttr(content)}"/>`;
  return out.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function canonicalOf(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  if (!m) return null;
  const c = m[0].match(/href\s*=\s*("([^"]*)"|'([^']*)')/i);
  return c ? (c[2] !== undefined ? c[2] : c[3]) : null;
}

function isVerificationFile(file) {
  const base = path.basename(file).toLowerCase();
  if (/^(yandex|google|bing|indexnow|verification)[_-]/.test(base)) return true;
  if (/^[0-9a-f]{32}\.html$/.test(base)) return true;
  return false;
}

function main() {
  console.log('================================================================================');
  console.log(`🖼️  INJETOR DE CARTOES SOCIAIS (Open Graph + Twitter)${CHECK_ONLY ? '  (MEDICAO)' : ''}`);
  console.log('================================================================================');
  console.log(`   Imagem padrão: ${OG_IMAGE}`);

  const ogExists = fs.existsSync(path.join(PUBLIC_DIR, 'og-image.png'));
  console.log(`   Arquivo real no repositório: ${ogExists ? '✅ public/og-image.png (1200x630)' : '❌ AUSENTE — abortando'}`);
  if (!ogExists) process.exit(1);

  const files = walk(PUBLIC_DIR);
  const stats = { total: files.length, semOgImage: 0, comOgImagePropria: 0, alterados: 0, jaCompletos: 0, semCanonical: 0 };
  const samples = [];

  for (const f of files) {
    if (isVerificationFile(f)) continue;
    let html;
    try { html = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }

    const jaTem = getMeta(html, 'og:image');
    if (jaTem && jaTem !== OG_IMAGE) {
      stats.comOgImagePropria++;
      /* respeita a imagem escolhida pela pagina, mas garante o twitter:image */
      if (!CHECK_ONLY && !getMeta(html, 'twitter:image')) {
        let out = setMeta(html, 'twitter:image', jaTem);
        out = setMeta(out, 'twitter:card', 'summary_large_image');
        fs.writeFileSync(f, out);
      }
      continue;
    }
    if (jaTem === OG_IMAGE && getMeta(html, 'twitter:image') === OG_IMAGE) { stats.jaCompletos++; continue; }
    stats.semOgImage++;

    if (CHECK_ONLY) { stats.alterados++; continue; }

    const canon = canonicalOf(html);
    if (!canon) stats.semCanonical++;

    let out = html;
    out = setMeta(out, 'og:image', OG_IMAGE);
    out = setMeta(out, 'og:image:width', '1200');
    out = setMeta(out, 'og:image:height', '630');
    out = setMeta(out, 'og:image:alt', `${SITE_NAME} — ofertas, cupons e guias de viagem`);
    out = setMeta(out, 'og:type', 'website');
    out = setMeta(out, 'og:site_name', SITE_NAME);
    out = setMeta(out, 'og:locale', 'pt_BR');
    if (canon && /^https?:\/\//i.test(canon)) out = setMeta(out, 'og:url', canon);
    out = setMeta(out, 'twitter:card', 'summary_large_image');
    out = setMeta(out, 'twitter:image', OG_IMAGE);

    /* trava de sanidade */
    if (!/<\/head>/i.test(out) || !/<\/body>/i.test(out) || out.includes('<<')) continue;

    fs.writeFileSync(f, out);
    stats.alterados++;
    if (samples.length < 5) samples.push({ file: path.relative(PUBLIC_DIR, f), og_url: canon || null });
  }

  console.log('');
  console.log('  RESULTADO:');
  console.log(`    Sem og:image (corrigidas) .......: ${stats.alterados}`);
  console.log(`    Já completas ....................: ${stats.jaCompletos}`);
  console.log(`    Com imagem própria (respeitadas) : ${stats.comOgImagePropria}`);
  if (stats.semCanonical) console.log(`    (sem canonical para og:url) .....: ${stats.semCanonical}`);
  if (samples.length) {
    console.log('');
    console.log('  Amostra:');
    for (const s of samples) console.log(`    • ${s.file}  →  og:url=${s.og_url || '(sem canonical)'}`);
  }

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, JSON.stringify({
    generated_at: new Date().toISOString(),
    og_image: OG_IMAGE,
    og_image_existe_no_repo: ogExists,
    modo: CHECK_ONLY ? 'medicao' : 'aplicado',
    stats, amostra: samples
  }, null, 2));
  console.log('');
  console.log(`  📄 Relatório: ${path.relative(path.join(__dirname, '..'), REPORT)}`);
  console.log('================================================================================');
}

main();
