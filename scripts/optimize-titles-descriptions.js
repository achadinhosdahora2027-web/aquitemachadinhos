#!/usr/bin/env node
/**
 * ==============================================================================
 * OTIMIZADOR DE TITULOS E DESCRICOES  (programmatic SEO, 3.405 paginas)
 * ==============================================================================
 * ACHADO DA AUDITORIA:
 *   3.393 de 3.405 paginas tinham <title> acima de 60 caracteres (media 95, max
 *   148) e 2.963 tinham meta description acima de 160 (media 228, max 300).
 *
 *   O Google mostra ~60 caracteres de titulo e ~155-160 de descricao. O que passa
 *   disso e cortado — e o corte e feito no meio da frase, com "…". Exemplo real:
 *     "Passagens para Ananindeua, Brasil 2026: Voos Baratos, Hotéis e O que Fazer
 *      | Aqui Tem Achadinhos"   (96 chars)
 *     aparece como "Passagens para Ananindeua, Brasil 2026: Voos Baratos, Hoté…"
 *   Ou seja: o nome do site e o "O que Fazer" — que sao o diferencial — nunca
 *   apareciam na busca.
 *
 * O QUE ESTE SCRIPT FAZ:
 *   Reescreve <title> (<=60), meta description (<=160), og:title, og:description,
 *   twitter:title e twitter:description em todas as paginas que estao fora da
 *   medida. Usa o que a propria pagina ja contem de verdade:
 *     • nome da cidade   (JSON-LD City.name / h1 / slug)
 *     • pais             (JSON-LD addressCountry / slug de duas letras)
 *     • atracoes reais   (JSON-LD TouristAttraction / itens do roteiro)
 *   Nada e inventado: se a pagina nao diz de onde e, o titulo usa so o slug.
 *
 *   Escada de titulos (escolhe o MAIS longo que couber em 60 chars):
 *     1) "<Cidade>, <Pais> 2026: Voos, Hotéis e O Que Fazer | Aqui Tem"
 *     2) "<Cidade> 2026: Voos, Hotéis e O Que Fazer | Aqui Tem"
 *     3) "<Cidade> 2026: Voos, Hotéis e O Que Fazer"
 *     4) "<Cidade> 2026: Voos e Hotéis | Aqui Tem"
 *     5) "<Cidade> 2026: Guia de Viagem"
 *     6) corte limpo do nome da cidade
 *
 *   E idempotente: pagina que ja esta dentro da medida nao e tocada.
 *
 * Uso:
 *   node scripts/optimize-titles-descriptions.js --check        # so mede
 *   node scripts/optimize-titles-descriptions.js                # aplica em tudo
 *   node scripts/optimize-titles-descriptions.js --limit 20     # amostra
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const REPORT = path.join(__dirname, '..', 'data', 'seo-title-description-report.json');

const argv = process.argv.slice(2);
const CHECK_ONLY = argv.includes('--check');
const LIMIT = (() => {
  const i = argv.indexOf('--limit');
  return i > -1 && argv[i + 1] ? parseInt(argv[i + 1], 10) : Infinity;
})();

const TITLE_MAX = 60;
const DESC_MAX = 160;
const BRAND = 'Aqui Tem';

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

function parseJsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  const out = [];
  for (const b of blocks) {
    try { out.push(JSON.parse(b[1].trim())); } catch (e) {}
  }
  return out;
}

function flattenLd(nodes, acc = []) {
  for (const n of nodes) {
    if (!n || typeof n !== 'object') continue;
    acc.push(n);
    if (Array.isArray(n['@graph'])) flattenLd(n['@graph'], acc);
    if (Array.isArray(n.itemListElement)) flattenLd(n.itemListElement, acc);
    if (n.item && typeof n.item === 'object') flattenLd([n.item], acc);
    if (Array.isArray(n.item)) flattenLd(n.item, acc);
  }
  return acc;
}

/** Extrai cidade/pais/atracoes do que a pagina JA diz. Nao inventa nada. */
function pageFacts(file, html, nodes) {
  const facts = { city: null, country: null, attractions: [] };

  const city = nodes.find((n) => {
    const t = n['@type'];
    return t === 'City' || (Array.isArray(t) && t.includes('City'));
  });
  if (city) {
    facts.city = city.name || null;
    const addr = city.address || {};
    facts.country = (typeof addr === 'object' && addr.addressCountry) || city.addressCountry || null;
    if (facts.country && typeof facts.country === 'object') facts.country = facts.country.name || null;
  }

  if (!facts.country) {
    const tp = nodes.find((n) => n['@type'] === 'TouristDestination' || n['@type'] === 'TouristAttraction');
    if (tp && tp.address) {
      const c = tp.address.addressCountry;
      facts.country = typeof c === 'object' ? c.name : c;
    }
  }

  for (const n of nodes) {
    const t = n['@type'];
    const isAttraction = t === 'TouristAttraction' || t === 'LandmarksOrHistoricalBuildings';
    if (isAttraction && n.name) facts.attractions.push(String(n.name).trim());
  }
  /* some paginas listam as atracoes apenas no texto do roteiro */
  if (!facts.attractions.length) {
    const li = [...html.matchAll(/<li[^>]*>\s*(?:<strong>)?([A-ZÀ-Ú][^<>{}]{4,60})(?:<\/strong>)?\s*<\/li>/g)];
    for (const m of li.slice(0, 4)) facts.attractions.push(m[1].trim());
  }

  if (!facts.city) {
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1) {
      facts.city = h1[1].replace(/<[^>]+>/g, '').replace(/^[\p{Emoji}\s]+/u, '').split(/[—–|-]/)[0].trim();
    }
  }
  if (!facts.city) {
    const slug = path.basename(file, '.html');
    facts.city = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  /* slug de duas letras indica pais quando a pagina nao traz addressCountry */
  if (!facts.country) {
    const first = path.relative(PUBLIC_DIR, file).split(path.sep)[0];
    if (/^[a-z]{2}$/.test(first)) facts.country = first.toUpperCase();
  }
  facts.attractions = [...new Set(facts.attractions)].filter((a) => a.length >= 3).slice(0, 3);
  return facts;
}

function fit(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).trim();
}

function buildTitle(facts) {
  const c = facts.city;
  const p = facts.country && /^[A-Za-zÀ-ÿ .]{2,28}$/.test(facts.country) ? facts.country : null;
  const ladder = [
    `${c}, ${p} 2026: Voos, Hotéis e O Que Fazer | ${BRAND}`,
    `${c} 2026: Voos, Hotéis e O Que Fazer | ${BRAND}`,
    `${c} 2026: Voos, Hotéis e O Que Fazer`,
    `${c} 2026: Voos e Hotéis | ${BRAND}`,
    `${c} 2026: Guia de Viagem`,
    `${c} 2026`
  ].filter((x) => !x.includes('null') && !x.includes('undefined'));
  for (const cand of ladder) if (cand.length <= TITLE_MAX) return cand;
  return fit(ladder[ladder.length - 1], TITLE_MAX);
}

function buildDescription(facts) {
  const c = facts.city;
  const p = facts.country && /^[A-Za-zÀ-ÿ .]{2,28}$/.test(facts.country) ? `, ${facts.country}` : '';
  const base = `Guia de ${c}${p} 2026: voos baratos, hotéis e o que fazer. Roteiro, atrações e cupons de desconto.`;
  if (base.length <= DESC_MAX) {
    if (facts.attractions.length) {
      const extra = ` Imperdíveis: ${facts.attractions.slice(0, 2).join(', ')}.`;
      if ((base + extra).length <= DESC_MAX) return base + extra;
    }
    return base;
  }
  return fit(`Guia de ${c}${p} 2026: voos, hotéis e o que fazer.`, DESC_MAX);
}

/* --------------------------------------------------------------------------
   ATENCAO — BUG CORRIGIDO AQUI:
   A primeira versao usava
       /(<meta[^>]+name=["']description["'][^>]+content=["'])[^"']*(["'])/
   O `[^"']*` para no PRIMEIRO apóstrofo ou aspas. Como varias descricoes
   originais tinham apóstrofo ("Basílica Menor de Santo'..." / "d'água"), o
   replace cortava no meio e deixava o resto do conteudo original como lixo
   depois do texto novo. Ex.: "...cupons de desconto.'Arinsal, Refugi de Coma..."
   Agora as meta tags sao lidas como ATRIBUTOS de verdade: ordem livre, aspas
   simples ou duplas, e o valor pode conter o outro caractere de aspas.
   -------------------------------------------------------------------------- */

const META_RE = /<meta\b[^>]*>/gi;
const ATTR_RE = /([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;

function parseAttrs(tag) {
  const attrs = [];
  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(tag)) !== null) {
    attrs.push({ name: m[1], raw: m[0], value: m[3] !== undefined ? m[3] : m[4], quote: m[2][0] });
  }
  return attrs;
}

function escapeAttr(v) {
  return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/** Atualiza (ou cria) a meta tag identificada por name/property, preservando
 *  a ordem original dos atributos e o estilo de aspas. */
function setMeta(html, key, content, attrKey) {
  const useProperty = key.startsWith('og:');
  const idAttr = useProperty ? 'property' : 'name';
  let done = false;

  const out = html.replace(META_RE, (tag) => {
    const attrs = parseAttrs(tag);
    const id = attrs.find((a) => a.name.toLowerCase() === idAttr);
    if (!id || id.value !== key) return tag;
    const c = attrs.find((a) => a.name.toLowerCase() === 'content');
    done = true;
    const nova = `${idAttr}="${key}" content="${escapeAttr(content)}"`;
    if (!c) return `<meta ${nova}/>`;
    return tag.replace(c.raw, `content=${c.quote}${escapeAttr(content)}${c.quote}`);
  });

  if (done) return out;

  /* nao existia: cria junto das outras do mesmo tipo, antes de </head> */
  const tag = useProperty
    ? `<meta property="${key}" content="${escapeAttr(content)}"/>`
    : `<meta name="${key}" content="${escapeAttr(content)}"/>`;
  return out.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function setTitle(html, value) {
  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${value}</title>`);
  out = setMeta(out, 'og:title', value);
  out = setMeta(out, 'twitter:title', value);
  return out;
}

function setDescription(html, value) {
  let out = setMeta(html, 'description', value);
  out = setMeta(out, 'og:description', value);
  out = setMeta(out, 'twitter:description', value);
  return out;
}

/** Arquivos de verificacao de buscador NAO recebem nada: mexer neles derruba a
 *  verificacao do dominio (Google, Yandex, Bing, IndexNow). */
function isVerificationFile(file) {
  const base = path.basename(file).toLowerCase();
  if (/^(yandex|google|bing|indexnow|verification)[_-]/.test(base)) return true;
  if (/^[0-9a-f]{32}\.html$/.test(base)) return true;   /* token solto do IndexNow */
  return false;
}

function main() {
  console.log('================================================================================');
  console.log(`🏷️  OTIMIZADOR DE TITULOS E DESCRICOES${CHECK_ONLY ? '  (MEDICAO APENAS)' : ''}`);
  console.log('================================================================================');
  console.log(`   Limites: título <= ${TITLE_MAX} | descrição <= ${DESC_MAX}`);
  console.log('');

  const files = walk(PUBLIC_DIR);
  const stats = {
    total: files.length, titleLong: 0, titleOk: 0, descLong: 0, descOk: 0, descMissing: 0,
    changed: 0, skipped: 0, semDados: 0
  };
  const changes = [];
  const samples = [];

  for (const f of files) {
    if (isVerificationFile(f)) { stats.skipped++; continue; }
    let html;
    try { html = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
    const tm = html.match(/<title>([\s\S]*?)<\/title>/i);
    const dm = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
    const curTitle = tm ? tm[1].trim() : '';
    const curDesc = dm ? dm[1].trim() : '';

    if (curTitle.length > TITLE_MAX) stats.titleLong++; else stats.titleOk++;
    if (!curDesc) stats.descMissing++;
    else if (curDesc.length > DESC_MAX) stats.descLong++; else stats.descOk++;

    const precisa = curTitle.length > TITLE_MAX || !curDesc || curDesc.length > DESC_MAX;
    if (!precisa) { stats.skipped++; continue; }

    const nodes = flattenLd(parseJsonLd(html));
    const facts = pageFacts(f, html, nodes);
    const newTitle = buildTitle(facts);
    const newDesc = buildDescription(facts);

    if (!newTitle || !newDesc) { stats.semDados++; continue; }

    const willChange = newTitle !== curTitle || newDesc !== curDesc;
    if (!willChange) { stats.skipped++; continue; }

    if (samples.length < 6) {
      samples.push({ file: path.relative(PUBLIC_DIR, f), fromT: curTitle, toT: newTitle, fromD: curDesc, toD: newDesc });
    }

    if (CHECK_ONLY || changes.length >= LIMIT) { stats.changed++; continue; }

    let out = html;
    if (newTitle !== curTitle) out = setTitle(out, newTitle);
    if (newDesc !== curDesc) out = setDescription(out, newDesc);

    /* trava de sanidade: nunca gravar HTML sem head/body nem titulo vazio */
    if (!/<title>[^<]+<\/title>/i.test(out) || !/<\/head>/i.test(out) || !/<\/body>/i.test(out) || out.includes('<<')) {
      stats.semDados++;
      continue;
    }
    fs.writeFileSync(f, out);
    stats.changed++;
    changes.push({ file: path.relative(PUBLIC_DIR, f), title: newTitle, description: newDesc });
  }

  console.log('  ANTES / DEPOIS (medido por página):');
  console.log(`    Títulos longos (>${TITLE_MAX}) .....: ${stats.titleLong}`);
  console.log(`    Descrições longas (>${DESC_MAX}) ...: ${stats.descLong}   (vazias: ${stats.descMissing})`);
  console.log(`    Dentro da medida ................: ${stats.skipped}`);
  console.log(`    Reescritas ......................: ${stats.changed}`);
  if (stats.semDados) console.log(`    Sem dados suficientes (ignoradas): ${stats.semDados}`);

  if (samples.length) {
    console.log('');
    console.log('  Amostra do que mudou:');
    for (const s of samples) {
      console.log(`    • ${s.file}`);
      console.log(`        título   : ${s.fromT.slice(0, 80)}  (${s.fromT.length})`);
      console.log(`              →  : ${s.toT}  (${s.toT.length})`);
      console.log(`        descrição: ${s.fromD.slice(0, 80)}…  (${s.fromD.length})`);
      console.log(`              →  : ${s.toD}  (${s.toD.length})`);
    }
  }

  const report = {
    generated_at: new Date().toISOString(),
    limites: { titulo: TITLE_MAX, descricao: DESC_MAX },
    modo: CHECK_ONLY ? 'medicao' : 'aplicado',
    stats,
    amostra: samples,
    alteracoes: changes.slice(0, 500)
  };
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
  console.log('');
  console.log(`  📄 Relatório: ${path.relative(path.join(__dirname, '..'), REPORT)}`);
  console.log('================================================================================');
}

main();
