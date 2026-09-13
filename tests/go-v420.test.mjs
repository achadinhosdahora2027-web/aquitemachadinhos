import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../functions/go.js', import.meta.url), 'utf8');
const mod = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

const UA = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36';
function req(country, direct, ua = UA) {
  const u = new URL('https://www.aquitemachadinhos.com.br/go');
  u.searchParams.set('marca', 'auto');
  if (direct) u.searchParams.set('dest', direct);
  u.searchParams.set('sid', 'test_v420');
  const r = new Request(u, { headers: { 'user-agent': ua, 'accept-language': 'pt-BR,pt;q=0.9', 'sec-fetch-user': '?1' } });
  Object.defineProperty(r, 'cf', { value: { country }, configurable: true });
  return r;
}

const originalFetch = globalThis.fetch;
try {
  // Gateway saudável: mantém o intersticial de display.
  globalThis.fetch = async () => new Response(null, { status: 307, headers: { location: 'https://example.invalid' } });
  let out = await mod.onRequestGet({ request: req('BR', 'https://meli.la/1U3rtgV') });
  assert.equal(out.status, 200);
  assert.equal(out.headers.get('x-nexus-edge'), 'v1510.0');
  assert.equal(out.headers.get('x-nexus-engine-probe'), 'healthy');
  assert.equal(out.headers.get('x-adsterra-binding'), 'pop=bound;sb=bound');

  // 404: desvio direto Mercado Livre, com matt_tool verificado.
  globalThis.fetch = async () => new Response('not found', { status: 404 });
  out = await mod.onRequestGet({ request: req('BR', 'https://www.booking.com/') });
  assert.equal(out.status, 302);
  assert.equal(out.headers.get('x-nexus-fallback'), 'direct');
  assert.equal(out.headers.get('x-nexus-engine-probe'), 'http_404');
  assert.equal(out.headers.get('x-adsterra-binding'), 'pop=bound;sb=bound');
  assert.match(out.headers.get('location'), /^https:\/\/meli\.la\//);
  assert.match(out.headers.get('location'), /matt_tool=56714869/);

  // Sem dest no link: consulta a oferta e usa o click_url correspondente do catálogo.
  let catalogCalls = 0;
  globalThis.fetch = async (url) => {
    catalogCalls++;
    if (String(url).includes('supabase.co/rest/v1/')) {
      return new Response(JSON.stringify([{
        id: '11111111-1111-1111-1111-111111111111', advertiser: 'Mercado Livre',
        click_url: 'https://meli.la/1U3rtgV', cj_pid_verified: false
      }]), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response('not found', { status: 404 });
  };
  const catalogReq = req('BR', null);
  const catalogUrl = new URL(catalogReq.url);
  catalogUrl.searchParams.set('oferta', '11111111-1111-1111-1111-111111111111');
  const catalogRequest = new Request(catalogUrl, { headers: catalogReq.headers });
  Object.defineProperty(catalogRequest, 'cf', { value: { country: 'BR' }, configurable: true });
  out = await mod.onRequestGet({ request: catalogRequest });
  assert.equal(out.status, 302);
  assert.match(out.headers.get('location'), /^https:\/\/meli\.la\//);
  assert.match(out.headers.get('location'), /matt_tool=56714869/);
  assert.equal(catalogCalls, 2);

  // Timeout: AbortController encerra a prova dentro do orçamento nominal <50 ms.
  globalThis.fetch = (_url, options = {}) => new Promise((_resolve, reject) => {
    const fail = () => { const e = new Error('aborted'); e.name = 'AbortError'; reject(e); };
    if (options.signal?.aborted) fail();
    else options.signal?.addEventListener('abort', fail, { once: true });
  });
  const started = Date.now();
  out = await mod.onRequestGet({ request: req('BR', 'https://meli.la/1U3rtgV') });
  const elapsed = Date.now() - started;
  assert.equal(out.status, 302);
  assert.equal(out.headers.get('x-nexus-engine-probe'), 'timeout');
  assert.equal(out.headers.get('x-adsterra-binding'), 'pop=bound;sb=bound');
  // This is a local unit measurement, not a production-network latency SLA.
  assert.ok(elapsed < 50, `fallback excedeu 50 ms no teste local: ${elapsed} ms`);

  // Tier-1: fallback EPN contém exatamente a campanha declarada.
  globalThis.fetch = async () => new Response('not found', { status: 404 });
  out = await mod.onRequestGet({ request: req('US', 'https://meli.la/1U3rtgV') });
  assert.equal(out.status, 302);
  assert.match(out.headers.get('location'), /^https:\/\/www\.ebay\.com\//);
  assert.match(out.headers.get('location'), /campid=5339193749/);

  // Bot não executa a prova humana nem recebe fallback afiliado direto.
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('not found', { status: 404 }); };
  out = await mod.onRequestGet({ request: req('BR', 'https://meli.la/1U3rtgV', 'Googlebot/2.1') });
  assert.equal(out.status, 302);
  assert.equal(calls, 0);
  assert.equal(out.headers.get('x-nexus-fallback'), null);

  console.log('go-v420: 6/6 cenários OK');
} finally {
  globalThis.fetch = originalFetch;
}
