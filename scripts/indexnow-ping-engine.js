const https = require('https');

const KEY = 'a120ccc82c4e2dbeeda51d4cd6d03284e2909f92f101984a2133e567b748455c';
const HOST = 'www.aquitemachadinhos.com.br';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow'
];

const URLS_TO_SUBMIT = [
  'https://www.aquitemachadinhos.com.br/',
  'https://www.aquitemachadinhos.com.br/entretenimento',
  'https://www.aquitemachadinhos.com.br/radar-mundial',
  'https://www.aquitemachadinhos.com.br/natal-luz-2026',
  'https://www.aquitemachadinhos.com.br/o-que-fazer-em-gramado',
  'https://www.aquitemachadinhos.com.br/oktoberfest-blumenau-2026',
  'https://www.aquitemachadinhos.com.br/rock-in-rio-2026',
  'https://www.aquitemachadinhos.com.br/black-friday-2026-cupons',
  'https://www.aquitemachadinhos.com.br/cirio-de-nazare-belem-2026',
  'https://www.aquitemachadinhos.com.br/festa-do-peao-barretos-2027-ingressos',
  'https://www.aquitemachadinhos.com.br/transportes',
  'https://www.aquitemachadinhos.com.br/mundial'
];

async function submitBatch(batchUrls) {
  const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: batchUrls
  });

  console.log(`Disparando IndexNow para ${batchUrls.length} URLs...`);

  const promises = ENDPOINTS.map(endpoint => {
    return new Promise((resolve) => {
      try {
        const u = new URL(endpoint);
        const req = https.request({
          hostname: u.hostname,
          path: u.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(payload)
          },
          timeout: 5000
        }, (res) => {
          console.log(`✓ [${endpoint}] HTTP ${res.statusCode}`);
          resolve({ endpoint, status: res.statusCode });
        });

        req.on('error', (err) => {
          console.log(`⚠ [${endpoint}] Erro: ${err.message}`);
          resolve({ endpoint, error: err.message });
        });

        req.on('timeout', () => {
          req.destroy();
          console.log(`⚠ [${endpoint}] Timeout`);
          resolve({ endpoint, timeout: true });
        });

        req.write(payload);
        req.end();
      } catch (e) {
        resolve({ endpoint, error: e.message });
      }
    });
  });

  await Promise.all(promises);
}

async function run() {
  await submitBatch(URLS_TO_SUBMIT);
  console.log('--- Submissão IndexNow Concluída com Sucesso! ---');
  process.exit(0);
}

run();
