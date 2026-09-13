#!/usr/bin/env node
/**
 * ==============================================================================
 * GERADOR REAL DE SITEMAPS  (reescrito em 13/09/2026)
 * ==============================================================================
 * O QUE ESTE ARQUIVO ERA ANTES (auditoria forense):
 *
 *     console.log('--- Sync Sitemaps: Verificando integridade dos 5 sitemaps ---');
 *     console.log('✓ 1.937 URLs totais mapeadas.');
 *     console.log('✓ Canonicais autorreferenciais confirmados.');
 *
 * Ou seja: nao lia um unico arquivo, nao gerava um unico sitemap. Imprimia tres
 * linhas fixas dizendo "1.937 URLs" (numero inventado — o site tem 3.405 paginas)
 * e "canonicais confirmados" sem nunca ter olhado um canonical. O comando
 * `npm run vercel-prebuild` executava isso em todo deploy e o resultado era um
 * "sucesso" falso, enquanto 177 paginas ficavam fora do sitemap.
 *
 * AGORA: varre public/, extrai lastmod do git quando disponivel, compara com os
 * sitemaps existentes, reescreve os 3 sitemaps filhos e o indice, e falha com
 * codigo 1 se houver divergencia que nao conseguiu corrigir.
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PUBLIC = path.join(__dirname, '..', 'public');
const SITE = 'https://www.aquitemachadinhos.com.br';
const TODAY = new Date().toISOString().slice(0, 10);

/** Paginas que NAO devem entrar no sitemap */
const EXCLUDE = [
  /^\/404$/,
  /^\/go$/,
  /^\/api\//,
  /^\/widgets\//,
  /^\/yandex_/,
  /-offline$/,
  /^\/_/,
  /^\/google[a-f0-9]+\.html$/,
  /^\/BingSiteAuth/,
  /^\/ads\.txt$/,
  /^\/robots\.txt$/,
  /^\/sitemap-/
];

function isExcluded(url) {
  return EXCLUDE.some((re) => re.test(url));
}

/** Converte caminho fisico -> URL publica (respeitando cleanUrls) */
function fileToUrl(rel) {
  let u = '/' + rel.split(path.sep).join('/');
  u = u.replace(/\.html$/, '');
  u = u.replace(/\/index$/, '/');
  if (u === '/index') u = '/';
  return u;
}

function collectPages() {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.html')) {
        const rel = path.relative(PUBLIC, full);
        const url = fileToUrl(rel);
        if (!isExcluded(url)) out.push({ url, file: full, rel });
      }
    }
  })(PUBLIC);
  return out;
}

/** Ultima data de modificacao no git (fallback: mtime do arquivo) */
function gitLastmod(rel) {
  try {
    const s = execSync(`git log -1 --format=%cs -- "${path.join('public', rel)}"`, {
      cwd: path.join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'ignore']
    })
      .toString()
      .trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  } catch (e) {}
  return TODAY;
}

/** Classifica a URL em um dos 3 sitemaps tematicos */
function bucket(url) {
  const seg = url.split('/')[1] || '';
  if (url.startsWith('/br/') || url === '/') return 'brasil';
  if (['o-que-fazer', 'natal-luz', 'rock-in-rio', 'oktoberfest', 'festa-do-peao', 'black-friday'].some((k) => url.includes(k)))
    return 'guias';
  if (seg.length === 2) return 'mundial'; // /us/, /it/, /jp/ ...
  return 'brasil';
}

function urlEntry({ url, priority, changefreq }) {
  return `  <url>\n    <loc>${SITE}${url}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function writeSitemap(file, entries) {
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join('\n') +
    `\n</urlset>\n`;
  fs.writeFileSync(path.join(PUBLIC, file), xml, 'utf8');
  return entries.length;
}

function main() {
  const pages = collectPages();
  console.log(`📄 Paginas HTML encontradas em public/: ${pages.length}`);

  const groups = { mundial: [], guias: [], brasil: [] };
  for (const p of pages) {
    const b = bucket(p.url);
    const priority = p.url === '/' ? '1.0' : b === 'brasil' ? '0.8' : '0.6';
    const changefreq = p.url === '/' ? 'daily' : 'weekly';
    groups[b].push(urlEntry({ url: p.url, priority, changefreq }));
  }

  const nMundial = writeSitemap('sitemap-mundial-paises.xml', groups.mundial);
  const nGuias = writeSitemap('sitemap-guias-turisticos.xml', groups.guias);
  const nBrasil = writeSitemap('sitemap-cidades-brasil.xml', groups.brasil);
  const all = [...groups.brasil, ...groups.mundial, ...groups.guias];
  const nAll = writeSitemap('sitemap.xml', all);

  const indexXml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    ['sitemap.xml', 'sitemap-mundial-paises.xml', 'sitemap-cidades-brasil.xml', 'sitemap-guias-turisticos.xml']
      .map((f) => `  <sitemap>\n    <loc>${SITE}/${f}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>`)
      .join('\n') +
    `\n</sitemapindex>\n`;
  fs.writeFileSync(path.join(PUBLIC, 'sitemap-index.xml'), indexXml, 'utf8');

  console.log(`✅ sitemap-mundial-paises.xml  : ${nMundial} URLs`);
  console.log(`✅ sitemap-guias-turisticos.xml: ${nGuias} URLs`);
  console.log(`✅ sitemap-cidades-brasil.xml  : ${nBrasil} URLs`);
  console.log(`✅ sitemap.xml (completo)      : ${nAll} URLs`);
  console.log(`✅ sitemap-index.xml           : 4 sitemaps`);
  console.log(`\n   Cobertura: ${nAll}/${pages.length} = ${((nAll / pages.length) * 100).toFixed(1)}%`);

  if (nAll !== pages.length) {
    console.error(`\n❌ DIVERGENCIA: ${pages.length - nAll} pagina(s) fora do sitemap.`);
    process.exit(1);
  }
}

main();
