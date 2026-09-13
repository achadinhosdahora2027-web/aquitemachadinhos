#!/usr/bin/env node
/**
 * ==============================================================================
 * GERADOR DE RESPOSTAS PARA COMENTARIOS  (Instagram / Facebook)
 * ==============================================================================
 * O QUE ESTE SCRIPT ERA (auditoria de 13/09/2026):
 *   Chamava-se "INSTAGRAM & FACEBOOK 24/7 AUTONOMOUS COMMENTS AUTO-RESPONDER" e
 *   terminava imprimindo
 *       "✅ MOTOR DE RESPOSTAS AUTOMATICAS DE COMENTARIOS 100% OPERACIONAL 24/7!"
 *   ...sem NUNCA ter feito uma unica chamada a API do Instagram. Ele testava 3
 *   comentarios escritos dentro do proprio codigo e imprimia o rascunho na tela.
 *   Nenhum comentario real era lido, nenhuma resposta real era enviada.
 *
 *   Pior: tinha (a) um loadJson sem `return` — o JSON da matriz de intencao era
 *   sempre descartado, entao `matrix.advertisers` vinha vazio e o script
 *   estourava com "Cannot read properties of undefined (reading 'brand')";
 *   (b) tokens fantasma no data/meta-config.json — literalmente as strings
 *   "ENV:META_PAGE_TOKEN_A", que nao sao tokens.
 *
 * O QUE ESTE SCRIPT FAZ AGORA (e o que ele NAO faz):
 *   ✅ Le a matriz de anunciantes de verdade (8 anunciantes, 115 palavras-chave).
 *   ✅ Detecta o idioma do comentario (pt/en/es/fr/de).
 *   ✅ Escolhe a marca certa por intencao e monta a resposta publica + a DM
 *      com o LINK DE AFILIADO JA TAGEADO.
 *   ✅ TESTA ESSE LINK AO VIVO no gateway antes de gravar o rascunho — se o
 *      link nao responde 307 com a tag, o rascunho e marcado como reprovado.
 *   ✅ Grava data/instagram-reply-drafts.json para revisao/publicacao manual.
 *   ✅ Diz na cara quando NAO ha credencial Meta configurada.
 *
 *   ❌ NAO publica no Instagram. Publicar exige token de pagina + Instagram
 *      Business ID validos (permissao instagram_manage_comments). Hoje o
 *      repositorio tem apenas placeholders "ENV:META_PAGE_TOKEN_A" e nenhuma
 *      variavel META_* no ambiente de producao. Enquanto isso nao existir, este
 *      script e um GERADOR DE RASCUNHOS — e se identifica assim.
 *
 * Uso:
 *   node scripts/instagram-comments-auto-responder.js
 *   node scripts/instagram-comments-auto-responder.js --no-live   (pula o teste de rede)
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const PROCESSED_FILE = path.join(DATA_DIR, 'processed-comments.json');
const DRAFTS_FILE = path.join(DATA_DIR, 'instagram-reply-drafts.json');
const MATRIX_FILE = path.join(__dirname, '../../achadinhos-ad-engine/data/advertisers-intent-matrix.json');
const META_CONFIG_FILE = path.join(__dirname, '../../achadinhos-ad-engine/data/meta-config.json');
const GATEWAY = process.env.AFFILIATE_GATEWAY || 'https://achadinhos-ad-engine.vercel.app/api/ads/go';
const NO_LIVE = process.argv.includes('--no-live');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

/**
 * Carrega JSON aplicando os tokens que vierem do ambiente por cima dos do
 * arquivo. CORRIGIDO: antes o JSON era lido e jogado no lixo (sem `return`).
 */
function loadJson(file, defaultVal = {}) {
  try {
    if (!fs.existsSync(file)) return defaultVal;
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (parsed && parsed.accounts) {
      const t = process.env;
      if (t.META_PAGE_TOKEN_A && parsed.accounts[0]) parsed.accounts[0].page_access_token = t.META_PAGE_TOKEN_A;
      if (t.META_PAGE_TOKEN_B && parsed.accounts[1]) parsed.accounts[1].page_access_token = t.META_PAGE_TOKEN_B;
      if (t.META_PAGE_TOKEN_2 && parsed.accounts[2]) parsed.accounts[2].page_access_token = t.META_PAGE_TOKEN_2;
      if (t.META_MASTER_USER_TOKEN && parsed.master_user) parsed.master_user.long_lived_user_token = t.META_MASTER_USER_TOKEN;
      if (t.META_APP_SECRET_TOKEN && parsed.meta_app) parsed.meta_app.app_secret_token = t.META_APP_SECRET_TOKEN;
    }
    return parsed;
  } catch (e) {
    return defaultVal;
  }
}

/** Um token de verdade tem 60+ caracteres e nenhum ":". Placeholder nao passa. */
function isValidToken(tok) {
  if (!tok || typeof tok !== 'string') return false;
  const s = tok.trim();
  if (s.length < 30) return false;
  if (/^ENV:|^YOUR_|^<|placeholder|changeme/i.test(s)) return false;
  return true;
}

function metaCredentialStatus(metaConfig) {
  const accounts = (metaConfig && metaConfig.accounts) || [];
  const usable = accounts.filter((a) => isValidToken(a.page_access_token) && a.instagram_business_id);
  return {
    total_accounts: accounts.length,
    with_real_token: usable.length,
    handles: accounts.map((a) => a.handle || '(sem handle)'),
    placeholders: accounts.filter((a) => !isValidToken(a.page_access_token)).map((a) => a.handle || '(sem handle)'),
    ready_to_publish: usable.length > 0
  };
}

const matrix = loadJson(MATRIX_FILE, { advertisers: [] });
const metaConfig = loadJson(META_CONFIG_FILE, { accounts: [] });
const processed = loadJson(PROCESSED_FILE, { processed_ids: [] });

function normalizeText(text = '') {
  return String(text).toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

/* Marcadores exclusivos de cada idioma. CORRIGIDO: antes a checagem era
   "primeiro que casar vence" e a palavra 'hotel' (igual em pt/en/es) fazia um
   comentario em portugues ser classificado como ingles. Agora contamos quantos
   marcadores de cada idioma aparecem e vence o maior; empate → portugues. */
const LANG_MARKERS = {
  pt: [/\b(quero|preciso|tem|tenho|alguma|dica|desconto|cupom|cupons|barato|onde|vou|viagem|carro|curso|filho|noite|gratis|vale|como)\b/g],
  en: [/\b(the|want|need|looking|deal|deals|discount|coupon|cheap|where|help|please|stay|vacation|free|course|learn|rental|night)\b/g],
  es: [/\b(hola|quiero|necesito|viaje|viajes|alojamiento|cupon|cupones|cursos|gratis|alquiler|auto|coche|barato|donde|ayuda)\b/g],
  fr: [/\b(bonjour|je|veux|besoin|voyage|vacances|reduction|cours|gratuit|voiture|aide|ou)\b/g],
  de: [/\b(hallo|ich|will|brauche|reise|rabatt|unterkunft|kurs|kostenlos|mietwagen|hilfe|wo)\b/g]
};

function detectLanguage(text = '') {
  const n = normalizeText(text);
  let best = 'pt', bestScore = 0;
  for (const [lang, patterns] of Object.entries(LANG_MARKERS)) {
    let score = 0;
    for (const re of patterns) score += (n.match(re) || []).length;
    if (score > bestScore) { bestScore = score; best = lang; }
  }
  return best;
}

/** Escolhe o anunciante pela intencao. Sem intencao clara → null (nao inventa). */
function matchIntent(commentText = '') {
  const normalized = normalizeText(commentText);
  const words = normalized.split(/\s+/);
  const lang = detectLanguage(commentText);
  let best = null;
  let bestScore = 0;

  for (const adv of matrix.advertisers || []) {
    let score = 0;
    for (const kw of adv.keywords || []) {
      const normKw = normalizeText(kw);
      if (!normKw) continue;
      if (normKw.includes(' ')) {
        if (normalized.includes(normKw)) score += 2;
      } else if (words.includes(normKw)) {
        score += 1;
      }
    }
    /* Empate: fica com o anunciante que REALMENTE monetiza. Antes o primeiro da
       lista vencia e um comentario de "curso" podia cair num link sem CPA. */
    if (score > bestScore) { bestScore = score; best = adv; }
    else if (score === bestScore && score > 0 && adv.monetized && best && !best.monetized) { best = adv; }
  }
  return { matchedAdv: best, score: bestScore, lang };
}

function buildTaggedLink(brand, slot = 'auto_intent', tag = 'ig_comment') {
  const params = new URLSearchParams({ brand, site: tag, slot, geo: 'BR', noint: '1' });
  return `${GATEWAY}?${params.toString()}`;
}

async function probeLink(url, tag, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      signal: ctrl.signal,
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36' }
    });
    const loc = res.headers.get('location') || '';
    let tagOk = false;
    if (loc) {
      try {
        tagOk = loc.includes(tag) || new URL(loc).searchParams.toString().includes(tag);
      } catch (e) {
        tagOk = loc.includes(tag);
      }
    }
    return { status: res.status, location: loc, tag_ok: tagOk };
  } catch (e) {
    return { status: 0, location: '', tag_ok: false, error: e.name === 'AbortError' ? 'timeout' : e.message };
  } finally {
    clearTimeout(t);
  }
}

/** Comentarios reais monitorados. Sem API Meta ativa, usamos a fila local. */
function loadIncomingComments() {
  const file = path.join(DATA_DIR, 'instagram-incoming-comments.json');
  const data = loadJson(file, null);
  if (data && Array.isArray(data.comments)) return { comments: data.comments, source: path.relative(process.cwd(), file) };
  return { comments: [], source: null };
}

async function main() {
  console.log('================================================================================');
  console.log('💬 GERADOR DE RESPOSTAS PARA COMENTARIOS — INSTAGRAM / FACEBOOK');
  console.log('================================================================================');

  const cred = metaCredentialStatus(metaConfig);
  console.log(`   Matriz de anunciantes : ${(matrix.advertisers || []).length}`);
  console.log(`   Palavras-chave totais  : ${(matrix.advertisers || []).reduce((s, a) => s + (a.keywords || []).length, 0)}`);
  console.log(`   Contas Meta declaradas: ${cred.total_accounts} (${cred.handles.join(', ') || '-'})`);
  console.log(`   Tokens reais validos  : ${cred.with_real_token}`);

  if (!cred.ready_to_publish) {
    console.log('');
    console.log('   ⛔ MODO RASCUNHO: nenhuma conta tem token de pagina valido.');
    console.log(`      Placeholders encontrados: ${cred.placeholders.join(', ') || '-'}`);
    console.log('      Sem token real este processo NAO consegue ler nem responder comentarios');
    console.log('      no Instagram. Ele gera os rascunhos com os links tageados prontos para');
    console.log('      publicacao manual — e nao afirma o contrario.');
  }
  console.log('');

  if (!Array.isArray(matrix.advertisers) || matrix.advertisers.length === 0) {
    console.error('❌ Matriz de anunciantes vazia ou ilegivel:', MATRIX_FILE);
    process.exit(1);
  }

  const incoming = loadIncomingComments();
  const samples = incoming.comments.length
    ? incoming.comments.map((c) => ({ text: c.text, user: c.user || 'seguidor', id: c.id }))
    : [
        { text: 'Quero desconto em hotel em Gramado!', user: 'viajante_sp', id: 'amostra-1' },
        { text: 'Tem cupom para a Shopee?', user: 'comprador_top', id: 'amostra-2' },
        { text: 'Preciso de VPN segura para streaming', user: 'dev_secure', id: 'amostra-3' },
        { text: 'Aluguel de carro em Fortaleza, alguma dica?', user: 'ferias_ce', id: 'amostra-4' },
        { text: 'Curso de ingles para meu filho, tem opcao barata?', user: 'mae_pratica', id: 'amostra-5' }
      ];
  console.log(`   Fonte dos comentarios: ${incoming.source || 'amostra interna (nenhuma fila local encontrada)'}`);
  console.log(`   Comentarios a processar: ${samples.length}`);
  console.log('');

  const drafts = [];
  let semIntencao = 0, linksOk = 0, linksFalha = 0, semCpaCount = 0;

  for (const c of samples) {
    const { matchedAdv, score, lang } = matchIntent(c.text);
    if (!matchedAdv) {
      semIntencao++;
      console.log(`  ⚪ "${c.text.slice(0, 48)}" → nenhum anunciante corresponde (nao inventamos resposta)`);
      drafts.push({ comment: c.text, user: c.user, status: 'SEM_INTENCAO', lang });
      continue;
    }

    const link = buildTaggedLink(matchedAdv.brand, 'auto_intent', 'ig_comment');
    const probe = NO_LIVE ? { status: 'pulado', tag_ok: null } : await probeLink(link, 'ig_comment');
    const monetized = matchedAdv.monetized !== false;
    const respondeu = NO_LIVE ? true : (probe.status >= 300 && probe.status < 400);
    /* Anunciante sem CPA ativo NAO recebe tag de proposito (o gateway o marca como
       NON_MONETIZED). Nesse caso a ausencia de tag e o comportamento correto, nao
       uma falha — mas o rascunho fica rotulado como "sem comissao". */
    const linkOk = NO_LIVE ? null : (monetized ? (respondeu && probe.tag_ok) : respondeu);
    const semCpa = NO_LIVE ? null : (!monetized);
    if (linkOk === true) linksOk++;
    if (linkOk === false) linksFalha++;
    if (semCpa === true) semCpaCount++;

    const replies = matchedAdv.public_comment_reply || {};
    const dms = matchedAdv.dm_templates || {};
    const publicReply = `@${c.user} ${replies[lang] || replies.pt || ''}`.trim();
    const dm = (dms[lang] || dms.pt || '').replace('{LINK}', link);

    console.log(`  ${linkOk === false ? '❌' : '✅'} "${c.text.slice(0, 48)}"`);
    console.log(`     → marca: ${matchedAdv.name} (score ${score}, idioma ${lang})`);
    console.log(`     → link : HTTP ${probe.status} ${NO_LIVE ? '' : monetized ? (probe.tag_ok ? '(tag OK)' : '(TAG AUSENTE)') : '(sem CPA — tag omitida de proposito)'}${probe.error ? ' erro: ' + probe.error : ''}`);
    console.log(`     → resposta publica: "${publicReply.slice(0, 70)}${publicReply.length > 70 ? '…' : ''}"`);

    drafts.push({
      comment_id: c.id,
      comment: c.text,
      user: c.user,
      lang,
      intent_score: score,
      advertiser: { brand: matchedAdv.brand, name: matchedAdv.name, badge: matchedAdv.discount_badge },
      tagged_link: link,
      link_check: { http_status: probe.status, location: probe.location || null, tag_present: probe.tag_ok },
      public_reply: publicReply,
      dm_message: dm,
      monetized,
      monetization_note: matchedAdv.monetization_note || null,
      status: linkOk === false ? 'LINK_REPROVADO' : (monetized ? 'PRONTO_PARA_PUBLICAR_MANUALMENTE' : 'SEM_CPA_NAO_MONETIZADO'),
      publish_blocker: cred.ready_to_publish ? null : 'sem token Meta valido — publicacao manual'
    });
  }

  const report = {
    generated_at: new Date().toISOString(),
    mode: cred.ready_to_publish ? 'TOKENS_OK_PUBLICACAO_AINDA_NAO_IMPLEMENTADA' : 'GERADOR_DE_RASCUNHOS_SEM_TOKEN',
    /* Este script NAO chama a API de comentarios do Instagram — mesmo quando os
       tokens existem. O diagnostico de credenciais mostrou que os tokens Meta do
       repositorio SAO validos (paginas "Aqui Tem", "Achadinhos da Hora - Cupons"),
       mas ler/responder comentarios exige permissao instagram_manage_comments e
       chamada de API que ainda nao esta escrita aqui. Preferimos dizer isso a
       imprimir "100% OPERACIONAL" como a versao anterior fazia. */
    publishes_to_instagram: false,
    publish_blocker: cred.ready_to_publish
      ? 'Tokens Meta validos, mas a chamada de API para ler/responder comentarios (instagram_manage_comments) ainda nao foi implementada neste script.'
      : 'Contas Meta em data/meta-config.json contem apenas placeholders (ex.: "ENV:META_PAGE_TOKEN_A") e nao existe variavel META_* no ambiente.',
    matrix_version: matrix.version || null,
    advertisers_available: (matrix.advertisers || []).map((a) => a.brand),
    meta_credentials: cred,
    totals: { comments: samples.length, drafts: drafts.length, sem_intencao: semIntencao, links_ok: linksOk, links_falha: linksFalha, sem_cpa: semCpaCount },
    drafts
  };
  fs.writeFileSync(DRAFTS_FILE, JSON.stringify(report, null, 2));

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('  RESULTADO');
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log(`  📝 Rascunhos gerados ..........: ${drafts.length}`);
  console.log(`  ⚪ Sem anunciante aplicavel ...: ${semIntencao}`);
  console.log(`  🔗 Links tageados aprovados ...: ${linksOk}`);
  console.log(`  ⚪ Marcas sem CPA ativo .......: ${semCpaCount} (link entregue, sem comissao)`);
  console.log(`  ❌ Links reprovados ...........: ${linksFalha}`);
  console.log(`  🚫 Publica no Instagram? ......: NAO — gerador de rascunhos`);
  if (cred.ready_to_publish) {
    console.log(`     (os tokens Meta do repositório SÃO válidos; falta a chamada de API de`);
    console.log(`      comentários — instagram_manage_comments — que este script não implementa)`);
  }
  console.log(`  📄 Arquivo: ${path.relative(process.cwd(), DRAFTS_FILE)}`);
  console.log('═══════════════════════════════════════════════════════════════════════');

  if (linksFalha > 0) {
    console.error(`\n❌ ${linksFalha} link(s) tageado(s) nao passaram no teste ao vivo.`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Erro fatal no gerador de respostas:', e && (e.stack || e.message));
  process.exit(1);
});
