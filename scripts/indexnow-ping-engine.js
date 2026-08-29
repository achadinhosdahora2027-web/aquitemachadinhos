const https = require('https');

const KEY = 'a120ccc82c4e2dbeeda51d4cd6d03284e2909f92f101984a2133e567b748455c';
const HOST = 'www.aquitemachadinhos.com.br';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow'
];

async function submitBatch(batchUrls, batchNum) {
  const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: batchUrls
  });

  console.log(`\n--- Disparando Lote ${batchNum} (${batchUrls.length} URLs) ---`);

  for (const endpoint of ENDPOINTS) {
    try {
      const url = new URL(endpoint);
      const req = https.request({
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        console.log(`✓ [${endpoint}] HTTP Status: ${res.statusCode}`);
      });

      req.on('error', (e) => {
        console.error(`✗ [${endpoint}] Error: ${e.message}`);
      });

      req.write(payload);
      req.end();
    } catch (err) {
      console.error(`Error with ${endpoint}:`, err);
    }
  }
}

async function run() {
  const sampleUrls = [
    `https://${HOST}/`,
    `https://${HOST}/radar-mundial`,
    `https://${HOST}/mundial`,
    `https://${HOST}/transportes`,
    `https://${HOST}/us/new-york`,
    `https://${HOST}/fr/paris`,
    `https://${HOST}/jp/tokyo`,
    `https://${HOST}/pt/lisbon`,
    `https://${HOST}/it/rome`,
    `https://${HOST}/es/barcelona`,
    `https://${HOST}/ar/buenos-aires`,
    `https://${HOST}/nl/amsterdam`
  ];

  console.log(`Iniciando motor de submissão IndexNow para ${HOST}...`);
  await submitBatch(sampleUrls, 1);
  console.log(`\nSubmissão IndexNow concluída com sucesso! Total: ${sampleUrls.length} URLs enviadas.`);
}

run();
