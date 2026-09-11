// CF Pages Function — /api/supabase/contextual-offers (Legacy Hydration v13.0)
// Ofertas contextuais por nicho da página (RPC read-only nexus_get_contextual_offers).
// Padrão do functions/go.js: anon key embutida + REST direto. Fail-closed
// ABSOLUTO: qualquer falha → 200 {ok:false} (hidratador cliente falha em
// silêncio; página legada intacta; zero 500).
const SB = 'https://etbxbaaaspdcoiakifbb.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YnhiYWFhc3BkY29pYWtpZmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NTE2OTcsImV4cCI6MjEwMjUyNzY5N30.529X__LRoPurMqRJBVmiI9EYY8wgIv3cefZ-nxSiKJ0';

const json = (data, cache) => new Response(JSON.stringify(data), {
  status: 200,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': cache || 'public, s-maxage=300, stale-while-revalidate=600',
    // v113: a resposta VARIA por pais (targeted-countries da CJ). Sem isto o
    // CDN serviria a oferta BR para visitante US.
    'Vary': 'CF-IPCountry',
  },
});

export async function onRequestGet({ request, params }) {
  const action = String((params && params.action) || '');
  if (action !== 'contextual-offers') {
    return json({ ok: false, reason: 'acao_desconhecida' }, 'no-store');
  }
  try {
    const u = new URL(request.url);
    const path = (u.searchParams.get('path') || '/').slice(0, 200);
    const sid = (u.searchParams.get('sid') || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120) || null;
    // v113 FIX: pais REAL do visitante (Cloudflare) -> a RPC respeita o
    // targeted-countries oficial da CJ e nao serve link BR-only fora do BR.
    const country = String(
      (request.cf && request.cf.country) || request.headers.get('cf-ipcountry') || ''
    ).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) || null;
    // v113 FIX C1: site -> PID correto (NUNCA o CID 8041957).
    const host = String(u.hostname || '').toLowerCase();
    const site = host.includes('nexusplataforma') ? 'nexus'
               : host.includes('solvegrid') ? 'solvegrid'
               : 'aquitemachadinhos';
    const r = await fetch(SB + '/rest/v1/rpc/nexus_get_contextual_offers', {
      method: 'POST',
      headers: { apikey: ANON, Authorization: 'Bearer ' + ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_path: path, p_limit: 6, p_sid: sid, p_country: country, p_site: site }),
    });
    const data = await r.json().catch(() => null);
    return json(data && typeof data === 'object' ? data : { ok: false });
  } catch (e) {
    return json({ ok: false, reason: 'contextual_offline' }, 'no-store');
  }
}
