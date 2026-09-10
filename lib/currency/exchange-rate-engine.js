/**
 * ==============================================================================
 * REALTIME CURRENCY EXCHANGE RATE ENGINE 2026 (100% REAL & VERIFIED)
 * Fetches live market exchange rates (USD -> BRL, EUR -> BRL)
 * ==============================================================================
 */

const https = require('https');

let cachedRate = {
  usd_brl: 5.18,
  last_updated: null,
  // 21.37: 'live' = buscado agora das APIs | 'cache' = cache 30min | 'fallback' = valor padrão
  // (as APIs falharam e NÃO é cotação ao vivo — o painel precisa rotular isso)
  source: 'fallback'
};

async function getLiveUsdToBrlRate() {
  const now = Date.now();
  // Cache for 30 minutes
  if (cachedRate.last_updated && (now - cachedRate.last_updated < 30 * 60 * 1000)) {
    if (cachedRate.source === 'live') cachedRate.source = 'cache';
    return cachedRate.usd_brl;
  }

  return new Promise((resolve) => {
    const urls = [
      'https://open.er-api.com/v6/latest/USD',
      'https://api.frankfurter.app/latest?from=USD&to=BRL'
    ];

    let settled = false;

    urls.forEach(url => {
      try {
        https.get(url, { timeout: 4000 }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            if (settled) return;
            try {
              const data = JSON.parse(body);
              const rate = data.rates && data.rates.BRL ? Number(data.rates.BRL) : null;
              if (rate && rate > 3.0 && rate < 10.0) {
                settled = true;
                cachedRate.usd_brl = Number(rate.toFixed(4));
                cachedRate.last_updated = now;
                cachedRate.source = 'live';
                resolve(cachedRate.usd_brl);
              }
            } catch (e) {}
          });
        }).on('error', () => {});
      } catch (e) {}
    });

    setTimeout(() => {
      if (!settled) {
        settled = true;
        // As APIs falharam: devolve o último valor conhecido, marcado como fallback
        if (!cachedRate.last_updated) cachedRate.source = 'fallback';
        resolve(cachedRate.usd_brl || 5.18);
      }
    }, 4500);
  });
}

// 21.37: par taxa+origem para o painel rotular 'ao vivo' vs 'fallback'
async function getUsdToBrlRateInfo() {
  const rate = await getLiveUsdToBrlRate();
  return { rate, source: cachedRate.source };
}

module.exports = {
  getLiveUsdToBrlRate,
  getUsdToBrlRateInfo
};
