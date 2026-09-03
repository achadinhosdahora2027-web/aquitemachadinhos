const https = require('https');
const http = require('http');

// Cada entrada: url + PID CJ esperado no Location (null = não é link CJ).
// PIDs reais (API CJ Promotional Properties): aquitem 101859672 / nexus 101870639 / solvegrid 101870640.
// 8041957 é o CID da empresa: se aparecer em click-8041957-* a comissão vai para outra conta => FALHA.
const GW = 'https://achadinhos-ad-engine.vercel.app/api/ads/go';
const ENDPOINTS_TO_VERIFY = [
  { url: GW + '?brand=booking&site=aquitemachadinhos&slot=health', cjPid: '101859672' },
  { url: GW + '?brand=carla&site=aquitemachadinhos&slot=health', cjPid: '101859672' },
  { url: GW + '?brand=nordvpn&site=aquitemachadinhos&slot=health', cjPid: '101859672' },
  { url: GW + '?brand=booking&site=nexus&slot=health', cjPid: '101870639' },
  { url: GW + '?brand=nordvpn&site=solvegrid&slot=health', cjPid: '101870640' },
  { url: GW + '?brand=udemy&site=aquitemachadinhos&slot=health', cjPid: null },
  { url: GW + '?brand=faculdade&site=aquitemachadinhos&slot=health', cjPid: null },
  { url: 'https://www.aquitemachadinhos.com.br/entretenimento', cjPid: null },
  { url: 'https://nexusplataforma.ia.br/entertainment', cjPid: null },
  { url: 'https://solvegrid.com.br/tech-pulse', cjPid: null }
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

  for (const { url, cjPid } of ENDPOINTS_TO_VERIFY) {
    const res = await checkUrl(url);
    const loc = res.location || '';
    if (/click-8041957-|image-8041957-/.test(loc)) {
      console.log(`✗ [CID COMO PID] ${url.substring(0, 70)} -> ${loc.substring(0, 60)}`);
      failures++;
      continue;
    }
    if (cjPid && !loc.includes(`click-${cjPid}-`)) {
      console.log(`✗ [PID ERRADO: esperado ${cjPid}] ${url.substring(0, 70)} -> ${loc.substring(0, 60)}`);
      failures++;
      continue;
    }
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
