#!/usr/bin/env node
/**
 * ==============================================================================
 * SUITE GLOBAL OMNI-TESTE  (reescrita honesta — 13/09/2026)
 * ==============================================================================
 * O QUE A VERSAO ANTIGA FAZIA (e por que isso era enganoso):
 *   1. O titulo anunciava "195 PAISES" mas o array tinha 50 — e o log imprimia
 *      "50/50 Paises Amostrados Resolveram com Sucesso" como se fossem 195.
 *   2. Usava uma variavel `hasMonetag` que NUNCA existia no arquivo, entao o
 *      script morria com ReferenceError antes de auditar qualquer pagina.
 *   3. Terminava sempre com "100% SUCESSO!" escrito literalmente na string,
 *      independente do resultado real.
 *   4. Nunca chamava process.exit(1): mesmo falhando, o orquestrador ficava
 *      verde.
 *
 * O QUE ESTA VERSAO FAZ:
 *   • Testa OS 195 ESTADOS SOBERANOS de verdade (ISO 3166-1: 193 membros da ONU
 *     + Vaticano + Palestina). O proprio script confere que a lista tem 195
 *     codigos unicos e aborta se alguem quebrar a lista.
 *   • Inventaria a monetizacao pagina por pagina e imprime a PORCENTAGEM REAL
 *     (AdSense, Monetag, Infolinks, Growth Engine e "tem pelo menos uma tag").
 *   • Compara os arquivos essenciais (feeds, ads.txt, sitemaps) medindo valor.
 *   • Imprime a taxa de aprovacao CALCULADA.
 *   • Sai com codigo 1 quando um teste reproduzivel falha (roteamento dos
 *     paises ou arquivos essenciais). Percentual baixo de monetizacao e
 *     reportado como ALERTA — nao derruba o job, mas aparece com o numero exato.
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

let adHandler = null;
try {
  adHandler = require('../../achadinhos-ad-engine/api/ads/go.js');
} catch (e) {
  try {
    adHandler = require('../api/ads/go.js');
  } catch (e2) {
    adHandler = null;
  }
}

/* --- 195 estados soberanos (ISO 3166-1 alpha-2) ---------------------------- */
const COUNTRIES_195 = {
  AF: 'Afeganistão', AL: 'Albânia', DZ: 'Argélia', AD: 'Andorra', AO: 'Angola', AG: 'Antígua e Barbuda',
  AR: 'Argentina', AM: 'Armênia', AU: 'Austrália', AT: 'Áustria', AZ: 'Azerbaijão',
  BS: 'Bahamas', BH: 'Bahrein', BD: 'Bangladesh', BB: 'Barbados', BY: 'Bielorrússia', BE: 'Bélgica',
  BZ: 'Belize', BJ: 'Benin', BT: 'Butão', BO: 'Bolívia', BA: 'Bósnia e Herzegovina', BW: 'Botsuana',
  BR: 'Brasil', BN: 'Brunei', BG: 'Bulgária', BF: 'Burquina Faso', BI: 'Burundi', CV: 'Cabo Verde',
  KH: 'Camboja', CM: 'Camarões', CA: 'Canadá', CF: 'República Centro-Africana', TD: 'Chade',
  CL: 'Chile', CN: 'China', CO: 'Colômbia', KM: 'Comores', CG: 'Congo', CD: 'República Dem. do Congo',
  CR: 'Costa Rica', CI: 'Costa do Marfim', HR: 'Croácia', CU: 'Cuba', CY: 'Chipre', CZ: 'Tchéquia',
  DK: 'Dinamarca', DJ: 'Djibuti', DM: 'Dominica', DO: 'República Dominicana', EC: 'Equador',
  EG: 'Egito', SV: 'El Salvador', GQ: 'Guiné Equatorial', ER: 'Eritreia', EE: 'Estônia', SZ: 'Essuatíni',
  ET: 'Etiópia', FJ: 'Fiji', FI: 'Finlândia', FR: 'França', GA: 'Gabão', GM: 'Gâmbia', GE: 'Geórgia',
  DE: 'Alemanha', GH: 'Gana', GR: 'Grécia', GD: 'Granada', GT: 'Guatemala', GN: 'Guiné', GW: 'Guiné-Bissau',
  GY: 'Guiana', HT: 'Haiti', HN: 'Honduras', HU: 'Hungria', IS: 'Islândia', IN: 'Índia', ID: 'Indonésia',
  IR: 'Irã', IQ: 'Iraque', IE: 'Irlanda', IL: 'Israel', IT: 'Itália', JM: 'Jamaica', JP: 'Japão',
  JO: 'Jordânia', KZ: 'Cazaquistão', KE: 'Quênia', KI: 'Quiribati', KP: 'Coreia do Norte', KR: 'Coreia do Sul',
  KW: 'Kuwait', KG: 'Quirguistão', LA: 'Laos', LV: 'Letônia', LB: 'Líbano', LS: 'Lesoto', LR: 'Libéria',
  LY: 'Líbia', LI: 'Liechtenstein', LT: 'Lituânia', LU: 'Luxemburgo', MG: 'Madagascar', MW: 'Malawi',
  MY: 'Malásia', MV: 'Maldivas', ML: 'Mali', MT: 'Malta', MH: 'Ilhas Marshall', MR: 'Mauritânia',
  MU: 'Maurício', MX: 'México', FM: 'Micronésia', MD: 'Moldávia', MC: 'Mônaco', MN: 'Mongólia',
  ME: 'Montenegro', MA: 'Marrocos', MZ: 'Moçambique', MM: 'Mianmar', NA: 'Namíbia', NR: 'Nauru',
  NP: 'Nepal', NL: 'Países Baixos', NZ: 'Nova Zelândia', NI: 'Nicarágua', NE: 'Níger', NG: 'Nigéria',
  MK: 'Macedônia do Norte', NO: 'Noruega', OM: 'Omã', PK: 'Paquistão', PW: 'Palau', PA: 'Panamá',
  PG: 'Papua-Nova Guiné', PY: 'Paraguai', PE: 'Peru', PH: 'Filipinas', PL: 'Polônia', PT: 'Portugal',
  QA: 'Catar', RO: 'Romênia', RU: 'Rússia', RW: 'Ruanda', KN: 'São Cristóvão e Névis', LC: 'Santa Lúcia',
  VC: 'São Vicente e Granadinas', WS: 'Samoa', SM: 'San Marino', ST: 'São Tomé e Príncipe',
  SA: 'Arábia Saudita', SN: 'Senegal', RS: 'Sérvia', SC: 'Seicheles', SL: 'Serra Leoa', SG: 'Singapura',
  SK: 'Eslováquia', SI: 'Eslovênia', SB: 'Ilhas Salomão', SO: 'Somália', ZA: 'África do Sul', SS: 'Sudão do Sul',
  ES: 'Espanha', LK: 'Sri Lanka', SD: 'Sudão', SR: 'Suriname', SE: 'Suécia', CH: 'Suíça', SY: 'Síria',
  TJ: 'Tajiquistão', TZ: 'Tanzânia', TH: 'Tailândia', TL: 'Timor-Leste', TG: 'Togo', TO: 'Tonga',
  TT: 'Trinidad e Tobago', TN: 'Tunísia', TR: 'Turquia', TM: 'Turcomenistão', TV: 'Tuvalu', UG: 'Uganda',
  UA: 'Ucrânia', AE: 'Emirados Árabes Unidos', GB: 'Reino Unido', US: 'Estados Unidos', UY: 'Uruguai',
  UZ: 'Uzbequistão', VU: 'Vanuatu', VE: 'Venezuela', VN: 'Vietnã', YE: 'Iêmen', ZM: 'Zâmbia', ZW: 'Zimbábue',
  VA: 'Vaticano', PS: 'Palestina'
};

const LANGUAGES = [
  { code: 'pt-br', name: 'Português (Brasil)' }, { code: 'en-us', name: 'English (US)' },
  { code: 'es-es', name: 'Español' }, { code: 'fr-fr', name: 'Français' }, { code: 'de-de', name: 'Deutsch' },
  { code: 'it-it', name: 'Italiano' }, { code: 'ja-jp', name: '日本語' }, { code: 'ko-kr', name: '한국어' },
  { code: 'zh-cn', name: '中文' }, { code: 'ar-sa', name: 'العربية', rtl: true }, { code: 'ru-ru', name: 'Русский' },
  { code: 'hi-in', name: 'हिन्दी' }, { code: 'nl-nl', name: 'Nederlands' }, { code: 'pl-pl', name: 'Polski' },
  { code: 'tr-tr', name: 'Türkçe' }, { code: 'sv-se', name: 'Svenska' }
];

const SITE_ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(SITE_ROOT, 'public');

function walkHtml(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

function countRealPages() {
  return walkHtml(PUBLIC_DIR).length;
}

async function main() {
  console.log('================================================================================');
  console.log('👑 SUITE GLOBAL OMNI-TESTE — INVENTARIO REAL DO ECOSSISTEMA');
  console.log('================================================================================');
  console.log(`   Data/hora      : ${new Date().toISOString()}`);
  console.log(`   Repositorio    : ${SITE_ROOT}`);
  console.log(`   Gateway em teste: ${adHandler ? 'carregado (api/ads/go.js)' : '❌ NAO CARREGADO'}`);

  let totalTests = 0, passedTests = 0;
  const failures = [];

  /* -- checagem da propria lista ------------------------------------------- */
  const codes = Object.keys(COUNTRIES_195);
  const unique = new Set(codes);
  if (codes.length !== 195 || unique.size !== 195) {
    console.error(`❌ A lista de paises esta quebrada: ${codes.length} entradas, ${unique.size} unicas (esperado 195).`);
    process.exit(1);
  }
  console.log(`   Paises testados : ${codes.length} (lista conferida: 195 codigos unicos)`);
  console.log('');

  /* 1. INVENTARIO DE MONETIZACAO POR PAGINA -------------------------------- */
  console.log('--- 1. INVENTARIO DE MONETIZACAO DAS PAGINAS HTML ---');
  const pages = walkHtml(PUBLIC_DIR);
  const stat = { total: pages.length, growth: 0, adsense: 0, monetag: 0, infolinks: 0, anyTag: 0, all: 0 };
  for (const p of pages) {
    let s = '';
    try { s = fs.readFileSync(p, 'utf8'); } catch (e) { continue; }
    const low = s.toLowerCase();
    const g = s.includes('growth-cro-engine.js');
    const ads = low.includes('adsbygoogle') || low.includes('googlesyndication');
    const mon = low.includes('monetag') || low.includes('quge5.com') || low.includes('auqot.com');
    const inf = low.includes('infolinks');
    if (g) stat.growth++;
    if (ads) stat.adsense++;
    if (mon) stat.monetag++;
    if (inf) stat.infolinks++;
    if (ads || mon || inf) stat.anyTag++;
    if (g && ads && mon && inf) stat.all++;
  }
  const pct = (n) => stat.total ? `${((n / stat.total) * 100).toFixed(1)}%` : '0%';
  console.log(`   Páginas HTML auditadas ..............: ${stat.total}`);
  console.log(`   com Growth/CRO Engine ..............: ${stat.growth} (${pct(stat.growth)})`);
  console.log(`   com AdSense ........................: ${stat.adsense} (${pct(stat.adsense)})`);
  console.log(`   com Monetag ........................: ${stat.monetag} (${pct(stat.monetag)})`);
  console.log(`   com Infolinks ......................: ${stat.infolinks} (${pct(stat.infolinks)})`);
  console.log(`   com PELO MENOS UMA tag de renda ....: ${stat.anyTag} (${pct(stat.anyTag)})`);
  console.log(`   com as 4 stacks completas ..........: ${stat.all} (${pct(stat.all)})`);
  if (stat.anyTag < stat.total) {
    const missing = stat.total - stat.anyTag;
    console.log(`   ⚠️  ALERTA: ${missing} página(s) sem nenhuma tag de monetização (${pct(missing)} do site).`);
  }
  totalTests++; if (stat.total > 0) passedTests++; else failures.push('Nenhuma pagina HTML encontrada em public/');

  /* 2. IDIOMAS ------------------------------------------------------------- */
  console.log('');
  console.log('--- 2. MATRIZ DE IDIOMAS SUPORTADOS ---');
  console.log(`   Idiomas mapeados: ${LANGUAGES.length}`);
  for (const l of LANGUAGES) console.log(`     ✓ [${l.code}] ${l.name}${l.rtl ? ' (RTL)' : ''}`);
  totalTests++; passedTests++;

  /* 3. ROTEAMENTO GEO NO GATEWAY ------------------------------------------ */
  console.log('');
  console.log('--- 3. ROTEAMENTO GEO — 195 PAISES NO GATEWAY ---');
  if (!adHandler) {
    console.log('   ❌ Gateway indisponivel: impossivel testar roteamento.');
    totalTests++; failures.push('api/ads/go.js nao pode ser carregado');
  } else {
    let ok = 0;
    const failedCountries = [];
    for (const cc of codes) {
      totalTests++;
      let statusCode = 0;
      const headers = {};
      const req = {
        headers: {
          'x-vercel-ip-country': cc,
          'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          'x-forwarded-for': '8.8.8.8'
        },
        query: { slot: 'travel', site: 'aquitemachadinhos', noint: '1' }
      };
      const res = {
        setHeader(k, v) { headers[String(k).toLowerCase()] = v; },
        status(code) { statusCode = code; return this; },
        end() { return this; },
        json() { return this; },
        write() { return this; }
      };
      try {
        await adHandler(req, res);
      } catch (e) {
        failedCountries.push(`${cc} (erro: ${e.message})`);
        continue;
      }
      const loc = headers['location'] || '';
      const tagOk = /sid=|subid=|aff_sub=|customid=|sub_id=/.test(loc);
      if (statusCode === 307 && loc && tagOk) { ok++; passedTests++; }
      else failedCountries.push(`${cc} (HTTP ${statusCode}${loc ? '' : ', sem Location'}${loc && !tagOk ? ', SEM TAG' : ''})`);
    }
    console.log(`   Rotearam com 307 + tag: ${ok}/${codes.length}`);
    if (failedCountries.length) {
      console.log(`   ❌ Paises que NAO rotearam corretamente (${failedCountries.length}):`);
      failedCountries.slice(0, 25).forEach((c) => console.log(`      • ${c}`));
      if (failedCountries.length > 25) console.log(`      … e mais ${failedCountries.length - 25}`);
      failures.push(`${failedCountries.length} pais(es) sem roteamento 307+tag`);
    }
  }

  /* 4. ARQUIVOS ESSENCIAIS ------------------------------------------------ */
  console.log('');
  console.log('--- 4. FEEDS, ADS.TXT E SITEMAPS ---');
  const essentials = [
    'public/ads.txt', 'public/sitemap-index.xml', 'public/sitemap.xml',
    'public/sitemap-mundial-paises.xml', 'public/sitemap-cidades-brasil.xml',
    'public/sitemap-guias-turisticos.xml', 'public/robots.txt'
  ];
  for (const rel of essentials) {
    totalTests++;
    const full = path.join(SITE_ROOT, rel);
    if (fs.existsSync(full) && fs.statSync(full).size > 50) {
      passedTests++;
      console.log(`   ✓ ${rel} (${fs.statSync(full).size} bytes)`);
    } else {
      console.log(`   ✗ AUSENTE OU VAZIO: ${rel}`);
      failures.push(`arquivo essencial ausente/vazio: ${rel}`);
    }
  }

  /* RESULTADO -------------------------------------------------------------- */
  const rate = totalTests ? ((passedTests / totalTests) * 100).toFixed(1) : '0.0';
  console.log('');
  console.log('================================================================================');
  console.log(`🏁 RESULTADO REAL: ${passedTests}/${totalTests} testes aprovados (${rate}%)`);
  if (failures.length) {
    console.log(`   ${failures.length} falha(s) reproduzivel(is):`);
    failures.forEach((f) => console.log(`     • ${f}`));
  }
  console.log('================================================================================');

  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error('❌ Erro fatal na suite omni-teste:', e && (e.stack || e.message));
  process.exit(1);
});
