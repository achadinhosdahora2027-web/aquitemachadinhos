/**
 * ==============================================================================
 * RADAR DE COMISSÕES CJ AFFILIATE 24/7 (dados 100% reais)
 * ==============================================================================
 * Consulta a API oficial da CJ a cada 15 minutos, detecta comissões NOVAS,
 * grava em affiliate_conversions (dedupe por brand+order_id) e dispara
 * alerta instantâneo no Telegram do dono. Nenhum valor é inventado.
 */

const https = require('https');
const path = require('path');
const { notifyAffiliateSale } = require('../lib/telegram/notify-engine');

const CJ_TOKEN = process.env.CJ_ACCESS_TOKEN || '';
const CJ_CID = process.env.CJ_CID || '8041957';
const SUPA_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

function httpGet(url, headers) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers, timeout: 15000 }, (rs) => {
      let body = '';
      rs.on('data', c => body += c);
      rs.on('end', () => resolve({ status: rs.statusCode, body }));
    });
    req.on('error', (e) => resolve({ status: 0, body: String(e) }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: 'timeout' }); });
  });
}

function sbInsert(row) {
  return new Promise((resolve) => {
    if (!SUPA_URL || !SUPA_KEY) return resolve({ status: 0 });
    const payload = JSON.stringify(row);
    const req = https.request(`${SUPA_URL}/rest/v1/affiliate_conversions`, {
      method: 'POST',
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      timeout: 8000
    }, (rs) => { rs.resume(); resolve({ status: rs.statusCode }); });
    req.on('error', () => resolve({ status: 0 }));
    req.write(payload); req.end();
  });
}

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}>(<!\\[CDATA\\[)?([\\s\\S]*?)(\\]\\]>)?</${tag}>`));
  return m ? m[2].trim() : '';
}

(async () => {
  console.log('================================================================================');
  console.log('📡 RADAR DE COMISSÕES CJ — CICLO', new Date().toISOString());
  console.log('================================================================================');

  if (!CJ_TOKEN) {
    console.log('❌ CJ_ACCESS_TOKEN ausente — ciclo encerrado sem consulta.');
    process.exit(0);
  }

  // Janela: últimos 3 dias (o dedupe por order_id impede repetição de alerta)
  const fmt = (d) => d.toISOString().slice(0, 10);
  const end = fmt(new Date());
  const start = fmt(new Date(Date.now() - 7 * 24 * 3600 * 1000));

  const url = `https://commission-detail.api.cj.com/v3/commissions?date-type=event&start-date=${start}&end-date=${end}&requestor-cid=${CJ_CID}`;
  const res = await httpGet(url, { Authorization: `Bearer ${CJ_TOKEN}` });

  if (res.status === 401) {
    console.log('❌ CJ rejeitou o token (401). Verificar/regenerar o Personal Access Token na CJ.');
    process.exit(0);
  }
  if (res.status !== 200) {
    console.log(`⚠️ CJ respondeu HTTP ${res.status} — nova tentativa no próximo ciclo.`);
    process.exit(0);
  }

  const blocks = res.body.split('<commissions>').slice(1).map(b => b.split('</commissions>')[0]);
  console.log(`✓ ${blocks.length} comissão(ões) retornada(s) pela CJ na janela ${start} → ${end}`);

  let novas = 0, dupes = 0;
  for (const b of blocks) {
    const advertiser = pick(b, 'advertiser-name') || 'CJ Advertiser';
    const orderId = pick(b, 'order-id');
    const saleAmt = parseFloat(pick(b, 'sale-amount')) || 0;
    const commAmt = parseFloat(pick(b, 'commission-amount')) || 0;
    const sid = pick(b, 'sid') || 'cj_sem_sid';
    const tracker = pick(b, 'action-tracker-name') || 'geral';
    const status = pick(b, 'status') || '';
    const eventDate = pick(b, 'event-date') || '';

    if (!orderId) continue;

    const insert = await sbInsert({
      brand: advertiser.slice(0, 80),
      order_id: orderId.slice(0, 80),
      amount_brl: saleAmt,
      commission_brl: commAmt,
      sid: sid.slice(0, 120),
      category: `CJ ${tracker} [${status}]`.slice(0, 60),
      raw: { event_date: eventDate, status }
    });

    if (insert.status === 201) {
      novas++;
      console.log(`  💰 NOVA: ${advertiser} | pedido ${orderId} | venda ${saleAmt} | comissão ${commAmt} | sid ${sid}`);
      try {
        await notifyAffiliateSale({
          network: 'cj',
          brand: advertiser,
          title: tracker,
          order_id: orderId,
          amount_brl: saleAmt,
          commission_brl: commAmt,
          sid: `${sid} [${status}]`
        });
      } catch (e) { console.log('  ⚠️ telegram falhou:', e.message); }
    } else if (insert.status === 409) {
      dupes++;
    } else {
      console.log(`  ⚠️ insert HTTP ${insert.status} para pedido ${orderId} (será reavaliado no próximo ciclo)`);
    }
  }

  console.log(`\n📊 Resumo do ciclo: ${novas} nova(s), ${dupes} já conhecida(s), ${blocks.length - novas - dupes} ignorada(s).`);
})();
