#!/usr/bin/env node
/**
 * Runner CLI para descoberta de chat_id de grupos de Telegram.
 * Uso: node scripts/telegram-multi-destination.js --discover-only
 */
const { loadRegistry, discoverChatIds, activeDestinations } = require('../lib/telegram/multi-destination-sender');
(async () => {
  const reg = loadRegistry();
  console.log('🔎 DESCOBERTA DE DESTINOS DE TELEGRAM');
  console.log('='.repeat(70));
  const r = await discoverChatIds(reg);
  if (r.error) console.log('   Telegram:', r.error);
  console.log('   Descobertos agora:', r.discovered && r.discovered.length ? r.discovered.join(', ') : 'nenhum');
  console.log('   Ainda pendentes :', r.pending);
  if (r.candidates_seen && r.candidates_seen.length) {
    console.log('   Grupos vistos pelo bot:');
    r.candidates_seen.forEach((c) => console.log(`     - ${c.title} | ${c.chat_id} | @${c.username || 'privado'}`));
  }
  const act = activeDestinations(loadRegistry());
  console.log('\n   Destinos prontos para envio:', act.length);
  act.forEach((d) => console.log(`     ✅ ${d.label} -> ${d.chat_id} (tag ${d.tag})`));
})().catch((e) => { console.error(e.message); process.exit(1); });
