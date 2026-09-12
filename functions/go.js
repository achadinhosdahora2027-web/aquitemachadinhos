// CF Pages Function — /go redirector v128 — SOVEREIGN HOST ALIGNMENT (1:1 fail-closed)
// v128: SocialBar/Popunder bound 1:1 ao host (fonte da verdade: nexus_host_tag_alignment).
// Host desconhecido → SEM tags (nunca tag de outro host = fim do mismatch/ads.txt descarte).
const SB = 'https://etbxbaaaspdcoiakifbb.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YnhiYWFhc3BkY29pYWtpZmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NTE2OTcsImV4cCI6MjEwMjUyNzY5N30.529X__LRoPurMqRJBVmiI9EYY8wgIv3cefZ-nxSiKJ0';
const ENGINE = 'https://achadinhos-ad-engine.vercel.app/api/ads/go';
const CJ = ['jdoqocy.com', 'anrdoezrs.net', 'tkqlhce.com', 'dpbolvw.net', 'kqzyfj.com'];
const BRANDS = ['booking','nordvpn','nordpass','surfshark','carla','shopee','mercadolivre','ebay','amazon','amazon_us','aliexpress','malwarebytes','wondershare','movavi','parallels','corel','sucuri','updf','switchbot','bluetti','soundcore','novakid','economybookings','faculdade','clickbus','udemy','voo'];
const SEL = 'id,name,advertiser,category,region,promo_type,coupon_code,click_url';
const HDRS = { apikey: ANON, Authorization: 'Bearer ' + ANON };
const ADSTERRA_POPUNDER = {
  'aquitemachadinhos.com.br': 'https://undergocutlery.com/n125219ufh?key=0474000233cefd60e54ca390d15beaaf',
  'solvegrid.com.br': 'https://undergocutlery.com/kpppprb1h5?key=3d010529a102de694b51b617cbfa2221',
  'nexusplataforma.ia.br': 'https://undergocutlery.com/zqmeg0npik?key=9829517559c74ab7fd87b787ee036287',
  'achadinhos-ad-engine.vercel.app': 'https://undergocutlery.com/v6k6sq45dm?key=90f19ab095cebec116b7ee5f129e1b2b'
};
const ADSTERRA_SOCIALBAR = {
  // v128 — binding 1:1 espelhado de nexus_host_tag_alignment (Supabase mestre).
  // NULL = SocialBar pendente no painel Adsterra → fail-closed: NÃO injeta nada.
  // PROIBIDO default cruzado: tag de host A nunca serve em host B (mismatch = descarte).
  'aquitemachadinhos.com.br': 'https://undergocutlery.com/a0/4b/ea/a04bea8f13eec4c1e3b87777107a3c6e.js',
  'solvegrid.com.br': 'https://undergocutlery.com/24/92/83/24928371ac3714c625a6644222607191.js',           // v128.5: SocialBar placement 31166085 (website 6042199) — código do painel
  'achadinhos-ad-engine.vercel.app': 'https://undergocutlery.com/65/0f/e1/650fe1ea8c40a70c29031a35f6ac5e49.js', // v128.5: SocialBar placement 31180418 (website 6044306) — código do painel
  'nexusplataforma.ia.br': null            // PENDENTE: gerar SocialBar (placement 30879030 / website 6002104)
};
export async function onRequestGet({ request }) {
  const u = new URL(request.url);
  const marca = (u.searchParams.get('marca') || '').trim().slice(0, 60);
  const oferta = (u.searchParams.get('oferta') || '').trim();
  const host = u.hostname || '';
  const site = host.indexOf('nexusplataforma') >= 0 ? 'nexus' : host.indexOf('solvegrid') >= 0 ? 'solvegrid' : 'aquitemachadinhos';
  const PID = site === 'nexus' ? '101870639' : site === 'solvegrid' ? '101870640' : '101859672';
  const sidIn = (u.searchParams.get('sid') || '').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 60);
  const sid = sidIn || (site + '_oferta_' + (oferta ? oferta.replace(/-/g, '').slice(0, 8) : marca || 'dir')).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 60);
  let row = null;
  try {
    let r = null;
    if (oferta && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(oferta)) {
      r = await fetch(SB + '/rest/v1/nexus_public_offers_ordered_mv?id=eq.' + oferta + '&select=' + SEL + '&limit=1', { headers: HDRS });
    } else if (marca) {
      r = await fetch(SB + '/rest/v1/nexus_public_offers_ordered_mv?advertiser=ilike.*' + encodeURIComponent(marca) + '*&select=' + SEL + '&order=rank_score.desc&limit=1', { headers: HDRS });
    }
    if (r && r.ok) row = (await r.json())[0] || null;
  } catch (e) {}
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
          dest = ENGINE + '?brand=' + b + '&site=' + site + '&slot=oferta_' + sid.slice(-8) + (cjDirect ? '&dest=' + encodeURIComponent(cjDirect) : '');
          break;
        }
      }
    }
    if (!dest) dest = cjDirect || (ENGINE + '?brand=auto&site=' + site + '&slot=oferta_geo');
  }
  if (!dest && marca) {
    const mk = marca.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const b of BRANDS) {
      if (mk.indexOf(b) >= 0 || b.indexOf(mk) >= 0) {
        dest = ENGINE + '?brand=' + b + '&site=' + site + '&slot=marca_' + sid.slice(-8);
        break;
      }
    }
  }
  if (!dest) dest = site === 'solvegrid' ? 'https://www.solvegrid.com.br/' : site === 'nexus' ? 'https://nexusplataforma.ia.br/' : 'https://www.aquitemachadinhos.com.br/';
  if (dest.indexOf('achadinhos-ad-engine.vercel.app') >= 0 && dest.indexOf('noint=') < 0) {
    dest += (dest.indexOf('?') >= 0 ? '&' : '?') + 'noint=1';
  }
  const UA = String(request.headers.get('user-agent') || '');
  const BOT_AD_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegrambot|headless|curl|wget|python|monitor|lighthouse|lexicore|skytab|claude|gptbot|ccbot|anthropic|perplexity|bytespider|applebot|amazonbot|semrush|ahrefs|mj12|dotbot|petalbot|dataforseo|uptimerobot|pingdom|pagespeed|node-fetch|axios|okhttp|java\/|go-http|libwww|scrapy|requests|aiohttp|postman|insomnia|mention_c|mention_ca|mention_car/i;
  const IS_BOT = !UA || BOT_AD_RE.test(UA);
  const NOINT = u.searchParams.get('noint') === '1';
  const RH = { 'Location': dest, 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store, max-age=0', 'Referrer-Policy': 'no-referrer' };
  if (IS_BOT || NOINT) return new Response(null, { status: 302, headers: RH });
  const hostLower = host.toLowerCase().replace(/^www\./, '');
  // v128 — fail-closed: default SEMPRE null; só injeta tag do PRÓPRIO host (match 1:1).
  let popunderTag = null;
  let socialbarTag = null;
  for (const dom in ADSTERRA_POPUNDER) {
    if (hostLower === dom || hostLower.endsWith('.' + dom)) { popunderTag = ADSTERRA_POPUNDER[dom]; break; }
  }
  for (const dom in ADSTERRA_SOCIALBAR) {
    if (hostLower === dom || hostLower.endsWith('.' + dom)) { socialbarTag = ADSTERRA_SOCIALBAR[dom]; break; }
  }
  // Cabeçalho de auditoria vivo (sem expor segredos: só bound/none)
  const TAG_BINDING = 'pop=' + (popunderTag ? 'bound' : 'none') + ';sb=' + (socialbarTag ? 'bound' : 'none');
  const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const sd = esc(dest);
  const DWELL = 4000;
  // v128 — nenhuma injeção com tag ausente (nunca T("null") em host sem binding)
  let popHead = popunderTag ? 'T("' + popunderTag + '");' : '';
  let popBody = popunderTag ? 'load("' + popunderTag + '", null, "adsterra_popunder"),' : '';
  let popClick = popunderTag ? 'try{var s=document.createElement("script");s.src="' + popunderTag + '";s.async=true;document.body.appendChild(s)}catch(e){}' : 'try{}catch(e){}';
  let socialbarScriptHead = socialbarTag ? 'T("' + socialbarTag + '");' : '';
  let socialbarLoadBody = socialbarTag ? 'load("' + socialbarTag + '", null, "adsterra_socialbar"),' : '';
  const html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<meta name="robots" content="noindex,nofollow">'
    + '<meta http-equiv="refresh" content="6;url=' + sd + '">'
    + '<title>Redirecionando…</title><style>'
    + 'body{margin:0;font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f1115;color:#e8eaed;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center}'
    + '.b{max-width:640px;padding:26px}.s{width:34px;height:34px;margin:0 auto 16px;border:3px solid #2a2f3a;border-top-color:#4c8bf5;border-radius:50%;animation:r .9s linear infinite}'
    + '@keyframes r{to{transform:rotate(360deg)}}a.go{display:inline-block;margin-top:14px;padding:11px 20px;background:#4c8bf5;color:#fff;text-decoration:none;border-radius:8px;font-weight:600}p{opacity:.75;font-size:14px}.tags{opacity:.5;font-size:11px;margin-top:20px}'
    + '</style>'
    + '<link rel="preconnect" href="https://undergocutlery.com" crossorigin>'
    + '<link rel="preconnect" href="https://quge5.com" crossorigin>'
    + '<link rel="preconnect" href="https://6opo.com" crossorigin>'
    + '<link rel="preconnect" href="https://auqot.com" crossorigin>'
    + '<link rel="preconnect" href="https://ekhay.com" crossorigin>'
    + '<link rel="preconnect" href="https://b3mny.com" crossorigin>'
    + '<link rel="dns-prefetch" href="https://undergocutlery.com">'
    + '<link rel="dns-prefetch" href="https://quge5.com">'
    + '<link rel="dns-prefetch" href="https://6opo.com">'
    + '<script>(function(){function T(src,zone){try{var s=document.createElement("script");s.src=src;s.async=true;s.setAttribute("data-cfasync","false");if(zone)s.setAttribute("data-zone",zone);(document.head||document.documentElement).appendChild(s)}catch(e){}}'
    + popHead + socialbarScriptHead
    + 'T("https://quge5.com/88/tag.min.js","274860");T("https://quge5.com/88/tag.min.js","278800");'
    + 'T("https://auqot.com/pfe/current/tag.min.js?z=11691068");T("https://ekhay.com/vignette.min.js?z=11691067");T("https://b3mny.com/tag.min.js?z=11691066");'
    + 'T("https://auqot.com/pfe/current/tag.min.js?z=11771440");T("https://ekhay.com/vignette.min.js?z=11771438");T("https://b3mny.com/tag.min.js?z=11771437");})();<\/script>'
    + '</head><body><div class="b"><div class="s"></div><strong>Levando você à oferta…</strong>'
    + '<p>Se não avançar automaticamente, toque no botão.</p>'
    + '<a class="go" id="go" href="' + sd + '" rel="nofollow noopener">Continuar para a oferta</a>'
    + '<noscript><p><a href="' + sd + '" rel="nofollow noopener">Clique aqui para continuar</a></p></noscript>'
    + '<div class="tags">Carregando ofertas verificadas • ' + site + ' • ' + sid.slice(-8) + ' • v128</div>'
    + '</div>'
    + '<script>(function(){var DEST=' + JSON.stringify(dest) + ';var SITE="' + site + '";var SID="' + sid + '";'
    + 'function load(src,zone,name){return new Promise(function(res){try{var s=document.createElement("script");s.src=src;s.async=true;s.setAttribute("data-cfasync","false");if(zone)s.setAttribute("data-zone",zone);s.onload=function(){res("ok")};s.onerror=function(){res("err")};document.body.appendChild(s)}catch(e){res("err")}})}'
    + 'var tags=['
    + popBody + socialbarLoadBody
    + 'load("https://quge5.com/88/tag.min.js","274860","monetag_274860"),load("https://quge5.com/88/tag.min.js","278800","monetag_278800")];'
    + 'if(Promise.allSettled)Promise.allSettled(tags);'
    + 'var goBtn=document.getElementById("go");if(goBtn){goBtn.addEventListener("click",function(){' + popClick + '})}'
    + 'setTimeout(function(){try{location.replace(DEST)}catch(e){location.href=DEST}},' + DWELL + ');})();<\/script>'
    + '</body></html>';
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store, max-age=0', 'Referrer-Policy': 'no-referrer', 'X-Adsterra-Binding': TAG_BINDING }
  });
}
