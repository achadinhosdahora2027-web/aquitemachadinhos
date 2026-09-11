// CF Pages Function — /go redirector 302 (SEO: noindex + disallow + 302)
// Substitui o interstitial client-side: resolve a oferta no edge e redireciona.
const SB = 'https://etbxbaaaspdcoiakifbb.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YnhiYWFhc3BkY29pYWtpZmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NTE2OTcsImV4cCI6MjEwMjUyNzY5N30.529X__LRoPurMqRJBVmiI9EYY8wgIv3cefZ-nxSiKJ0';
const ENGINE = 'https://achadinhos-ad-engine.vercel.app/api/ads/go';
const CJ = ['jdoqocy.com', 'anrdoezrs.net', 'tkqlhce.com', 'dpbolvw.net', 'kqzyfj.com'];
const BRANDS = ['booking','nordvpn','nordpass','surfshark','carla','shopee','mercadolivre','ebay','amazon','amazon_us','aliexpress','malwarebytes','wondershare','movavi','parallels','corel','sucuri','updf','switchbot','bluetti','soundcore','novakid','economybookings','faculdade','clickbus','udemy','voo'];
const SEL = 'id,name,advertiser,category,region,promo_type,coupon_code,click_url';
const HDRS = { apikey: ANON, Authorization: 'Bearer ' + ANON };

export async function onRequestGet({ request }) {
  const u = new URL(request.url);
  const marca = (u.searchParams.get('marca') || '').trim().slice(0, 60);
  const oferta = (u.searchParams.get('oferta') || '').trim();
  const host = u.hostname || '';
  const site = host.indexOf('nexusplataforma') >= 0 ? 'nexus'
    : host.indexOf('solvegrid') >= 0 ? 'solvegrid' : 'aquitemachadinhos';
  const PID = site === 'nexus' ? '101870639' : site === 'solvegrid' ? '101870640' : '101859672';
  const sid = (site + '_oferta_' + (oferta ? oferta.replace(/-/g, '').slice(0, 8) : marca || 'dir'))
    .replace(/[^a-zA-Z0-9_]/g, '').slice(0, 60);

  let row = null;
  try {
    let r = null;
    if (oferta && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(oferta)) {
      r = await fetch(SB + '/rest/v1/nexus_public_offers_ordered_mv?id=eq.' + oferta + '&select=' + SEL + '&limit=1', { headers: HDRS });
    } else if (marca) {
      r = await fetch(SB + '/rest/v1/nexus_public_offers_ordered_mv?advertiser=ilike.*' + encodeURIComponent(marca) + '*&select=' + SEL + '&order=rank_score.desc&limit=1', { headers: HDRS });
    }
    if (r && r.ok) row = (await r.json())[0] || null;
  } catch (e) { /* fail-closed → home */ }

  let dest = null, cjDirect = null;
  if (row) {
    const cu = String(row.click_url || '');
    for (const d of CJ) {
      if (cu.indexOf(d) >= 0) {
        const m = cu.match(/click-\d+-(\d+)/);
        if (m) { cjDirect = 'https://www.' + d + '/click-' + PID + '-' + m[1] + '?sid=' + encodeURIComponent(sid); break; }
      }
    }
    if (!dest && /s\.shopee\.com|meli\.la|ebay\.com\/deals/.test(cu)) dest = cu;
    if (!dest) {
      const adv = ((row.advertiser || '') + ' ' + (row.name || '')).toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
      for (const b of BRANDS) {
        if (adv.indexOf(b) >= 0) {
          // roteia via engine (log de clique em ads_clicks + PID por site);
          // se a oferta já é link CJ, repassa como dest (deep link url=)
          dest = ENGINE + '?brand=' + b + '&site=' + site + '&slot=oferta_' + sid.slice(-8) + (cjDirect ? '&dest=' + encodeURIComponent(cjDirect) : '');
          break;
        }
      }
    }
    if (!dest) dest = cjDirect || (ENGINE + '?brand=auto&site=' + site + '&slot=oferta_geo');
  }
  // v126.3: FALLBACK MONETIZADO. Antes, quando a oferta nao era encontrada no
  // catalogo (ex.: ?marca=amazon — nao existe advertiser 'amazon' na MV), o
  // usuario caia na HOME: clique gasto, zero chance de venda. Medido em teste:
  // 3 de 14 marcas testadas caiam na home. Agora, se a marca pedida for uma
  // marca conhecida do engine, entrega ao engine, que resolve marca + geo
  // (e ja aplica o PID correto). So cai na home se nao houver marca alguma.
  if (!dest && marca) {
    const mk = marca.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const b of BRANDS) {
      if (mk.indexOf(b) >= 0 || b.indexOf(mk) >= 0) {
        dest = ENGINE + '?brand=' + b + '&site=' + site + '&slot=marca_' + sid.slice(-8);
        break;
      }
    }
  }
  if (!dest) dest = site === 'solvegrid' ? 'https://www.solvegrid.com.br/'
    : site === 'nexus' ? 'https://nexusplataforma.ia.br/' : 'https://www.aquitemachadinhos.com.br/';

  // ==========================================================================
  // v126: INTERSTITIAL DE MONETIZACAO (paridade com api/ads/go.js do engine)
  //
  // MEDIDO, nao suposto: 11.128 de 12.099 cliques humanos de 7 dias (92%) nao
  // registravam page_path — tomavam redirect seco e NUNCA renderizavam HTML.
  // Um 302/307 nao executa JavaScript, entao Adsterra/Monetag jamais contavam
  // impressao, embora os cliques chegassem ao Telegram (server-side, outro
  // caminho). Este e o elo que faltava — e ESTE arquivo e o que atende o
  // trafego real do Telegram (links /go dos satelites CF Pages).
  //
  //  - Bot        -> 302 seco (nao infla impressao invalida)
  //  - ?noint=1   -> 302 seco (escape hatch)
  //  - Humano     -> HTML com tags VERIFICADAS 200 + auto-redirect 1.5s
  //  - <noscript> + <a> visivel: sem JS o usuario ainda chega ao destino
  //  - meta refresh como segunda rede de seguranca
  // ==========================================================================
  // v126.1: se o destino for o proprio engine (que TAMBEM serve interstitial),
  // marca noint=1 — sem isto o usuario veria DOIS interstitials em sequencia
  // (1.5s + 1.5s), dobrando o atrito e derrubando conversao. Comprovado em
  // navegador real: satelite -> engine -> loja, com 2 telas de espera.
  if (dest.indexOf('achadinhos-ad-engine.vercel.app') >= 0 && dest.indexOf('noint=') < 0) {
    dest += (dest.indexOf('?') >= 0 ? '&' : '?') + 'noint=1';
  }

  const UA = String(request.headers.get('user-agent') || '');
  // v155: BOT_AD_RE endurecido. Medido em producao 11/09: 'LexiCore/1.0'
  // passava como HUMANO (HTTP 200) e consumia uma impressao de anuncio —
  // impressao invalida perante o ToS das AdNetworks, alem de desperdicar
  // requisicao do cluster. Adicionados os agentes nominais da diretiva v155
  // (lexicore, claude-searchbot, gptbot, perplexity, bytespider, applebot,
  // semrush, ahrefs, dataforseo, uptimerobot, pingdom) e o cinto 'fetch/http'.
  const BOT_AD_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegrambot|headless|curl|wget|python|monitor|lighthouse|lexicore|skytab|claude|gptbot|ccbot|anthropic|perplexity|bytespider|applebot|amazonbot|semrush|ahrefs|mj12|dotbot|petalbot|dataforseo|uptimerobot|pingdom|pagespeed|node-fetch|axios|okhttp|java\/|go-http|libwww|scrapy|requests|aiohttp|postman|insomnia/i;
  const IS_BOT = !UA || BOT_AD_RE.test(UA);
  const NOINT = u.searchParams.get('noint') === '1';
  const RH = { 'Location': dest, 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store, max-age=0', 'Referrer-Policy': 'no-referrer' };
  if (IS_BOT || NOINT) return new Response(null, { status: 302, headers: RH });

  const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const sd = esc(dest);
  const html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<meta name="robots" content="noindex,nofollow">'
    + '<meta http-equiv="refresh" content="3;url=' + sd + '">'
    + '<title>Redirecionando\u2026</title><style>'
    + 'body{margin:0;font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f1115;color:#e8eaed;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center}'
    + '.b{max-width:640px;padding:26px}.s{width:34px;height:34px;margin:0 auto 16px;border:3px solid #2a2f3a;border-top-color:#4c8bf5;border-radius:50%;animation:r .9s linear infinite}'
    + '@keyframes r{to{transform:rotate(360deg)}}a.go{display:inline-block;margin-top:14px;padding:11px 20px;background:#4c8bf5;color:#fff;text-decoration:none;border-radius:8px;font-weight:600}p{opacity:.75;font-size:14px}'
    + '</style></head><body><div class="b"><div class="s"></div><strong>Levando voc\u00ea \u00e0 oferta\u2026</strong>'
    + '<p>Se n\u00e3o avan\u00e7ar automaticamente, toque no bot\u00e3o.</p>'
    + '<a class="go" href="' + sd + '" rel="nofollow noopener">Continuar para a oferta</a>'
    + '<noscript><p><a href="' + sd + '" rel="nofollow noopener">Clique aqui para continuar</a></p></noscript></div>'
    + '<script>(function(){var DEST=' + JSON.stringify(dest) + ';'
    + 'function load(src,zone){return new Promise(function(res){try{var s=document.createElement("script");s.src=src;s.async=true;s.setAttribute("data-cfasync","false");if(zone)s.setAttribute("data-zone",zone);s.onload=function(){res("ok")};s.onerror=function(){res("err")};document.body.appendChild(s)}catch(e){res("err")}})}'
    + 'var t=[load("https://undergocutlery.com/n125219ufh?key=0474000233cefd60e54ca390d15beaaf"),load("https://quge5.com/88/tag.min.js","274860"),load("https://quge5.com/88/tag.min.js","278800")];'
    + 'if(Promise.allSettled)Promise.allSettled(t);'
    + 'setTimeout(function(){try{location.replace(DEST)}catch(e){location.href=DEST}},1500);})();<\/script>'
    + '</body></html>';

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store, max-age=0', 'Referrer-Policy': 'no-referrer' }
  });
}
