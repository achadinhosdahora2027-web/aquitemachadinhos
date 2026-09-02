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

  return res.status(200).json({
    status: 'success',
    code: 200,
    action: action || 'index',
    executed_at: new Date().toISOString(),
    compatibility_router: 'api/supabase/[action].js'
  });
};
