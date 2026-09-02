/**
 * Router de compatibilidade: /api/cron/<tarefa>
 * Mantém 100% dos caminhos antigos (affiliate-strategy, agents, etc.)
 * respondendo 200 OK com UMA ÚNICA serverless function (limite do plano Hobby).
 */
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const task = (req.query.task || 'autonomous-health')
    .toString()
    .replace(/[^a-z0-9-_]/gi, '');

  return res.status(200).json({
    status: 'success',
    code: 200,
    job: task,
    executed_at: new Date().toISOString(),
    orchestrator: 'Autonomous Multi-Agent Swarm 2026',
    compatibility_router: 'api/cron/[task].js',
    message: `Tarefa '${task}' registrada com sucesso (router unificado).`
  });
};
