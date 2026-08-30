const https = require('https');
const http = require('http');

const ENDPOINTS_TO_VERIFY = [
  'https://achadinhos-ad-engine.vercel.app/api/ads/go?brand=booking&site=aquitemachadinhos&slot=health',
  'https://achadinhos-ad-engine.vercel.app/api/ads/go?brand=carla&site=aquitemachadinhos&slot=health',
  'https://achadinhos-ad-engine.vercel.app/api/ads/go?brand=nordvpn&site=aquitemachadinhos&slot=health',
  'https://achadinhos-ad-engine.vercel.app/api/ads/go?brand=udemy&site=aquitemachadinhos&slot=health',
  'https://achadinhos-ad-engine.vercel.app/api/ads/go?brand=faculdade&site=aquitemachadinhos&slot=health',
  'https://www.aquitemachadinhos.com.br/entretenimento',
  'https://nexusplataforma.ia.br/entertainment',
  'https://solvegrid.com.br/tech-pulse'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.request({
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'GET',
        headers: { 'User-Agent': 'HealthCheck-Canary/2026' },
        timeout: 7000
      }, (res) => {
        resolve({ url, status: res.statusCode, location: res.headers.location });
      });

      req.on('error', (e) => resolve({ url, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ url, timeout: true }); });
      req.end();
    } catch (err) {
      resolve({ url, error: err.message });
    }
  });
}

async function run() {
  console.log('=== Inspecionando Saúde das Rotas & Monetização ===');
  let failures = 0;

  for (const url of ENDPOINTS_TO_VERIFY) {
    const res = await checkUrl(url);
    if (res.status >= 200 && res.status < 400) {
      const extra = res.location ? ` -> Redirects to: ${res.location.substring(0, 50)}...` : '';
      console.log(`✓ [HTTP ${res.status}] ${url.substring(0, 70)}${extra}`);
    } else {
      console.log(`✗ [FALHA HTTP ${res.status || 'ERR'}] ${url} (${res.error || 'Erro'})`);
      failures++;
    }
  }

  console.log(`\nResultado: ${ENDPOINTS_TO_VERIFY.length - failures}/${ENDPOINTS_TO_VERIFY.length} endpoints saudáveis.`);
  if (failures > 0) {
    console.error(`⚠ Detectadas ${failures} falhas.`);
    process.exit(1);
  } else {
    console.log('✓ Todos os links e pipelines de afiliados estão 100% operacionais.');
    process.exit(0);
  }
}

run();
