/**
 * Router de compatibilidade: /api/supabase/<acao>
 * ledger-sync mantém o handler original; demais ações respondem 200 OK.
 */
const ledgerSyncHandler = require('../../lib/supabase/ledger-sync-handler');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = (req.query.action || '').toString().replace(/[^a-z0-9-_]/gi, '');

  if (action === 'ledger-sync' && typeof ledgerSyncHandler === 'function') {
    return ledgerSyncHandler(req, res);
  }

  // v13.0 LEGACY HYDRATION — ofertas contextuais por nicho da página (RPC
  // read-only no Supabase). 200 + ok:false em QUALQUER falha (o hidratador
  // cliente falha em silêncio absoluto — página original intacta).
  if (action === 'contextual-offers') {
    try {
      const path = String(req.query.path || '/').slice(0, 200);
      const sid = req.query.sid ? String(req.query.sid).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120) : null;
      // envs do projeto quando presentes; fallback: anon key pública (mesmo
      // padrão do functions/go.js do CF Pages — o RPC é SECURITY DEFINER e
      // read-only, seguro para expor).
      const base = process.env.SUPABASE_URL || process.env.CLICKS_DB_URL
        || 'https://etbxbaaaspdcoiakifbb.supabase.co';
      let key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.CLICKS_DB_KEY;
      if (!key) {
        key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YnhiYWFhc3BkY29pYWtpZmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NTE2OTcsImV4cCI6MjEwMjUyNzY5N30.529X__LRoPurMqRJBVmiI9EYY8wgIv3cefZ-nxSiKJ0';
      }
      const r = await fetch(base.replace(/\/$/, '') + '/rest/v1/rpc/nexus_get_contextual_offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: key, Authorization: 'Bearer ' + key },
        body: JSON.stringify({ p_path: path, p_limit: 6, p_sid: sid }),
        signal: AbortSignal.timeout(2500),
      });
      const data = await r.json().catch(() => null);
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).json(data && typeof data === 'object' ? data : { ok: false });
    } catch (e) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ ok: false, reason: 'contextual_offline' });
    }
  }

  return res.status(200).json({
    status: 'success',
    code: 200,
    action: action || 'index',
    executed_at: new Date().toISOString(),
    compatibility_router: 'api/supabase/[action].js'
  });
};
