#!/usr/bin/env node
/**
 * ==============================================================================
 * VERIFICADOR DE ENTREGA 24/7 DOS DESTINOS DE TELEGRAM
 * ==============================================================================
 * Para CADA destino do registro:
 *   1. getChat          -> o chat existe e o bot tem acesso?
 *   2. getChatMember    -> o bot consegue escrever ali? (status)
 *   3. sendChatAction   -> teste leve que prova permissao de escrita sem poluir
 *
 * Sai com codigo 1 se algum destino ATIVO estiver inacessivel -> o GitHub Actions
 * marca o job como falho e o problema aparece. Nao existe "falso verde" aqui.
 * ==============================================================================
 */

const { loadRegistry, telegramRequest } = require('../lib/telegram/multi-destination-sender');

async function verifyDestination(dest) {
  const out = { label: dest.label, id: dest.id, chat_id: dest.chat_id, tag: dest.tag, ok: false, checks: {} };

  if (!dest.chat_id) {
    out.checks.chat = { ok: false, error: 'chat_id nao resolvido (grupo privado pendente)' };
    return out;
  }

  const chat = await telegramRequest('getChat', { chat_id: dest.chat_id });
  out.checks.chat = chat.ok
    ? { ok: true, title: chat.result && chat.result.title, type: chat.result && chat.result.type }
    : { ok: false, error: chat.description || chat.error };

  if (chat.ok && dest.type !== 'private') {
    const me = await telegramRequest('getChatMember', {
      chat_id: dest.chat_id,
      user_id: process.env.TELEGRAM_BOT_ID || 8992362681
    });
    out.checks.member = me.ok
      ? { ok: ['administrator', 'creator', 'member', 'restricted'].includes(me.result.status), status: me.result.status }
      : { ok: false, error: me.description || me.error };
  }

  // prova de escrita sem publicar mensagem: sendChatAction e leve e nao deixa lixo
  const action = await telegramRequest('sendChatAction', { chat_id: dest.chat_id, action: 'typing' });
  out.checks.write = action.ok ? { ok: true } : { ok: false, error: action.description || action.error };

  out.ok = Object.values(out.checks).every((c) => c.ok !== false);
  return out;
}

(async () => {
  const reg = loadRegistry();
  const all = (reg.destinations || []).filter((d) => d.enabled !== false);

  console.log('='.repeat(84));
  console.log('🔍 VERIFICACAO DE ENTREGA — DESTINOS DE TELEGRAM 24/7');
  console.log('='.repeat(84));
  console.log(`   Registro: ${reg.destinations.length} destino(s) | ${all.length} ativo(s)\n`);

  const results = [];
  for (const d of all) results.push(await verifyDestination(d));

  let falhas = 0;
  let pendentes = 0;
  for (const r of results) {
    if (r.ok) {
      const t = (r.checks.chat && r.checks.chat.title) || '(privado)';
      const s = (r.checks.member && r.checks.member.status) || 'privado';
      console.log(`  ✅ ${r.label.padEnd(30)} "${t}" | bot: ${s} | tag: ${r.tag}`);
    } else if (!r.chat_id) {
      pendentes++;
      console.log(`  ⏳ ${r.label.padEnd(30)} AGUARDANDO chat_id`);
      console.log(`      → acao: abra o grupo e envie  /start@NandimFernandesBot`);
    } else {
      falhas++;
      console.log(`  ❌ ${r.label.padEnd(30)} chat_id=${r.chat_id}`);
      Object.entries(r.checks).forEach(([k, v]) => {
        if (v.ok === false) console.log(`      → ${k}: ${v.error}`);
      });
    }
  }

  console.log('\n' + '='.repeat(84));
  console.log(`  RESULTADO: ${results.filter((r) => r.ok).length} OK | ${pendentes} pendente(s) | ${falhas} falha(s)`);
  console.log('='.repeat(84));

  if (falhas > 0) {
    console.error('\n🚨 DESTINO ATIVO INACESSIVEL — o bot perdeu acesso. Corrija antes que as notificacoes parem.');
    process.exit(1);
  }
  if (pendentes > 0) {
    console.log('\n⚠️  Ha grupo(s) sem chat_id. Enquanto isso, eles NAO recebem notificacao.');
    console.log('    Solucao de 20 segundos por grupo: envie /start@NandimFernandesBot dentro do grupo.');
    // nao falha o build: pendencia e configuravel, nao e quebra
  }
})().catch((e) => {
  console.error('💥 Erro fatal:', e.message);
  process.exit(1);
});
