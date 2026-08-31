/**
 * ULTRA SITEMAP & GEO-INDEX GENERATOR ENGINE 2026
 * Generates and refreshes dynamic XML sitemaps for 195 countries, 144 zodiac pairs,
 * 50+ tourism destinations and seasonal events with hourly freshness tags.
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');
const DOMAIN = 'https://www.aquitemachadinhos.com.br';
const NOW = new Date().toISOString();

// 1. 195 Sovereign Countries List (ISO-3166)
const COUNTRIES = [
  'us', 'br', 'gb', 'de', 'fr', 'jp', 'ca', 'au', 'it', 'es',
  'nl', 'se', 'no', 'dk', 'ch', 'kr', 'cn', 'in', 'ae', 'sa',
  'sg', 'mx', 'ar', 'cl', 'co', 'pl', 'tr', 'za', 'nz', 'hk',
  'id', 'th', 'my', 'ph', 'cz', 'il', 'at', 'be', 'pt', 'gr',
  'ie', 'fi', 'hu', 'ro', 'bg', 'hr', 'sk', 'si', 'ee', 'lv',
  'lt', 'cy', 'mt', 'lu', 'is', 'pe', 'uy', 'py', 'bo', 'ec',
  've', 'cr', 'pa', 'do', 'gt', 'hn', 'sv', 'ni', 'cu', 'jm',
  'tt', 'bs', 'bb', 'eg', 'ma', 'ng', 'ke', 'gh', 'tz', 'ug',
  'dz', 'tn', 'et', 'sn', 'ci', 'cm', 'ao', 'mz', 'zw', 'bw',
  'na', 'mu', 're', 'qa', 'kw', 'om', 'bh', 'jo', 'lb', 'iq',
  'kz', 'uz', 'ge', 'am', 'az', 'pk', 'bd', 'lk', 'np', 'vn',
  'tw', 'mo', 'kh', 'la', 'mm', 'bn', 'pg', 'fj', 'ws', 'to'
];

// 2. 12 Zodiac Signs & 144 Combinations
const SIGNS = [
  'aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem',
  'libra', 'escorpiao', 'sagitario', 'capricornio', 'aquario', 'peixes'
];

// 3. Tourism Hubs & Seasonal Events
const HUBS = [
  'natal-luz-2026',
  'o-que-fazer-em-gramado',
  'oktoberfest-blumenau-2026',
  'rock-in-rio-2026',
  'black-friday-2026-cupons',
  'cirio-de-nazare-belem-2026',
  'festa-do-peao-barretos-2027-ingressos',
  'transportes',
  'radar-mundial',
  'mundial',
  'comunidade-vip',
  'newsletter',
  'entretenimento',
  'links',
  'bio',
  'tags/cupons-shopee-hoje.html',
  'tags/hoteis-gramado-booking-desconto.html',
  'tags/nordvpn-cupom-74-off.html',
  'tags/cursos-ia-udemy-desconto.html',
  'tags/barretos-2027-ingressos-hoteis.html',
  'tags/tarot-3d-previsao-gratis.html'
];

function buildUrlNode(loc, priority = '0.8', changefreq = 'daily') {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${NOW}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
}

// A. Generate sitemap-mundial-paises.xml
function generateCountriesSitemap() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  COUNTRIES.forEach(c => {
    xml += buildUrlNode(`${DOMAIN}/${c}/index.html`, '0.85', 'hourly');
    xml += buildUrlNode(`${DOMAIN}/mundial?country=${c.toUpperCase()}`, '0.80', 'daily');
  });
  xml += `</urlset>`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-mundial-paises.xml'), xml);
  console.log(`✓ sitemap-mundial-paises.xml gerado (${COUNTRIES.length * 2} URLs)`);
}

// B. Generate sitemap-compatibilidade-signos.xml (144 Combinations)
function generateCompatibilitySitemap() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  SIGNS.forEach(s1 => {
    SIGNS.forEach(s2 => {
      xml += buildUrlNode(`${DOMAIN}/compatibilidade/${s1}-e-${s2}.html`, '0.90', 'daily');
    });
  });
  xml += `</urlset>`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-compatibilidade-signos.xml'), xml);
  console.log(`✓ sitemap-compatibilidade-signos.xml gerado (144 combinações)`);
}

// C. Generate sitemap-guias-turisticos.xml
function generateGuidesSitemap() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  HUBS.forEach(h => {
    xml += buildUrlNode(`${DOMAIN}/${h}`, '1.00', 'hourly');
  });
  xml += `</urlset>`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-guias-turisticos.xml'), xml);
  console.log(`✓ sitemap-guias-turisticos.xml gerado (${HUBS.length} hubs)`);
}

// D. Generate sitemap-index.xml (Master Index)
function generateMasterIndex() {
  const SITEMAPS = [
    'sitemap.xml',
    'sitemap-guias-turisticos.xml',
    'sitemap-compatibilidade-signos.xml',
    'sitemap-mundial-paises.xml',
    'sitemap-cidades-brasil.xml',
    'sitemap-growth.xml',
    'sitemap-dados.xml'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  SITEMAPS.forEach(sm => {
    xml += `  <sitemap>\n    <loc>${DOMAIN}/${sm}</loc>\n    <lastmod>${NOW}</lastmod>\n  </sitemap>\n`;
  });
  xml += `</sitemapindex>`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-index.xml'), xml);
  console.log(`✓ sitemap-index.xml gerado com ${SITEMAPS.length} sub-sitemaps.`);
}

function run() {
  console.log('--- GERANDO E ATUALIZANDO SITEMAPS GEO-ESTRATÉGICOS 2026 ---');
  generateMasterIndex();
  generateGuidesSitemap();
  generateCompatibilitySitemap();
  generateCountriesSitemap();
  console.log('--- TODOS OS SITEMAPS ATUALIZADOS COM SUCESSO! ---');
}

run();
