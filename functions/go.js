// CF Pages Function — /go redirector v128 — SOVEREIGN HOST ALIGNMENT (1:1 fail-closed)
// v128: SocialBar/Popunder bound 1:1 ao host (fonte da verdade: nexus_host_tag_alignment).
// Host desconhecido → SEM tags (nunca tag de outro host = fim do mismatch/ads.txt descarte).
const SB = 'https://etbxbaaaspdcoiakifbb.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YnhiYWFhc3BkY29pYWtpZmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NTE2OTcsImV4cCI6MjEwMjUyNzY5N30.529X__LRoPurMqRJBVmiI9EYY8wgIv3cefZ-nxSiKJ0';
const ENGINE = 'https://achadinhos-ad-engine.vercel.app/api/ads/go';
// v420: orçamento nominal de borda. O desvio acontece ao atingir 404/erro/timeout;
// nenhum retry é feito no caminho do comprador.
const EDGE_FALLBACK_BUDGET_MS = 45;
const ENGINE_PROBE_MAX_MS = 35;
const MELI_FALLBACK = 'https://meli.la/1U3rtgV?matt_tool=56714869';
const EBAY_TIER1_FALLBACK = 'https://www.ebay.com/deals?campid=5339193749&toolid=10001&mkevt=1&mkcid=1&mkrid=711-53200-19255-0';
const SAFE_DIRECT_HOST = /(^|\.)(meli\.la|mercadolivre\.com\.br|s\.shopee\.com\.br|shopee\.com\.br|amazon\.com\.br|lmdee\.link|ebay\.(com|co\.uk|de|fr|ca)|booking\.com|kqzyfj\.com|jdoqocy\.com|anrdoezrs\.net|dpbolvw\.net|tkqlhce\.com)$/i;
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
/* ══════════════════════════════════════════════════════════════════════════
   v340.0 — SOVEREIGN GEO-TARGETING CORE (borda Cloudflare)
   ──────────────────────────────────────────────────────────────────────────
   DEFEITO MEDIDO QUE ISTO CORRIGE: esta função chamava o motor do lado
   servidor (fetch de borda). O motor lia x-vercel-ip-country e via o IP da
   CLOUDFLARE — não o do visitante. Resultado: brasileiro podia ser classificado
   como US/EU e receber merchant em moeda estrangeira (Booking UK, eBay, Amazon).
   Agora o país vem de request.cf.country (IP real do visitante), viaja como
   geo=<CC>&geoforce=1 para o motor e ainda é conferido AQUI: para visitante
   humano brasileiro, nenhum destino de moeda estrangeira passa.
   ══════════════════════════════════════════════════════════════════════════ */
const MOEDA_ESTRANGEIRA_BRANDS = ['booking','booking_uk','booking_latam','ebay','ebay_us','amazon','amazon_us','aliexpress','udemy','nordvpn','economybookings','brunoyam'];
const HOST_MOEDA_ESTRANGEIRA = /(^|\.)(booking\.com|ebay\.(com|co\.uk|de|fr|it|es|ca)|amazon\.(com|co\.uk|de|fr|es|it|ca)|aliexpress\.com|udemy\.com|nordvpn\.com|economybookings\.com)$/i;
const SLOTS_SINTETICOS = ['_health_desktop','health','_health','health_desktop'];

function arquiteturaUA(ua) {
  const s = String(ua || '').toLowerCase();
  if (!s || s.length < 20) return 'desconhecido';
  if (/bot|crawl|spider|slurp|headless|preview|scan|curl|wget|python|java|okhttp|libwww|httpclient|monitor|synthetic|lighthouse|pagespeed/.test(s)) return 'bot';
  if (/ipad|tablet/.test(s)) return 'tablet';
  if (/mobile|android|iphone/.test(s)) return 'mobile';
  return 'desktop';
}
function slugKeyword(t) {
  return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40);
}
/* Slot dinâmico: termo REAL buscado na página + arquitetura do user-agent.
   Nunca slot sintético: se não há termo real, fica 'sem_keyword_<arquitetura>'. */
function slotDinamicoCF(termo, ua) {
  const kw = slugKeyword(termo);
  const arch = arquiteturaUA(ua);
  if (!kw || /^[0-9]+$/.test(kw) || SLOTS_SINTETICOS.includes(kw)) return 'sem_keyword_' + arch;
  return kw + '_' + arch;
}
function destinoMoedaEstrangeira(url) {
  try {
    const h = new URL(url).hostname.toLowerCase();
    if (/(kqzyfj|jdoqocy|dpbolvw|anrdoezrs|tkqlhce)\.(com|net)/i.test(h)) return true;
    return HOST_MOEDA_ESTRANGEIRA.test(h);
  } catch (e) { return false; }
}

function decodeDest64(value) {
  try {
    const raw = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
    const padded = raw + '='.repeat((4 - raw.length % 4) % 4);
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (e) { return ''; }
}

function safeDirectUrl(value) {
  try {
    const x = new URL(String(value || '').trim());
    if (x.protocol !== 'https:' || !SAFE_DIRECT_HOST.test(x.hostname)) return null;
    return x.toString();
  } catch (e) { return null; }
}

function brandForDirect(value) {
  try {
    const h = new URL(value).hostname.toLowerCase();
    if (h.includes('shopee')) return 'shopee';
    if (h === 'meli.la' || h.includes('mercadolivre')) return 'mercadolivre';
    if (h.includes('ebay')) return 'ebay';
    if (h.includes('amazon.com.br')) return 'amazon';
    if (h.includes('booking') || /(kqzyfj|jdoqocy|anrdoezrs|dpbolvw|tkqlhce)/.test(h)) return 'booking';
  } catch (e) {}
  return 'auto';
}

function directFallback(country, candidate) {
  const cc = String(country || '').toUpperCase();
  if (cc === 'BR') {
    const safe = safeDirectUrl(candidate);
    if (safe && !destinoMoedaEstrangeira(safe)) {
      const x = new URL(safe);
      if (x.hostname.toLowerCase() === 'meli.la') x.searchParams.set('matt_tool', '56714869');
      return x.toString();
    }
    return MELI_FALLBACK;
  }
  if (['US', 'CA', 'GB', 'DE', 'FR'].includes(cc)) return EBAY_TIER1_FALLBACK;
  return safeDirectUrl(candidate) || EBAY_TIER1_FALLBACK;
}

async function probeEngine(url, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), Math.max(1, timeoutMs));
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'manual', signal: ctrl.signal,
      headers: { 'X-Nexus-Probe': 'v420.0' } });
    if (r.status === 404) return { ok: false, reason: 'http_404', status: 404 };
    if (r.status >= 200 && r.status < 400) return { ok: true, reason: 'healthy', status: r.status };
    return { ok: false, reason: 'http_' + r.status, status: r.status };
  } catch (e) {
    return { ok: false, reason: e && e.name === 'AbortError' ? 'timeout' : 'network_error', status: 0 };
  } finally { clearTimeout(timer); }
}

export async function onRequestGet({ request }) {
  const edgeStarted = Date.now();
  const u = new URL(request.url);
  const marca = (u.searchParams.get('marca') || u.searchParams.get('brand') || '').trim().slice(0, 60);
  const oferta = (u.searchParams.get('oferta') || u.searchParams.get('offer') || '').trim();
  const directIn = safeDirectUrl(u.searchParams.get('dest')) || safeDirectUrl(decodeDest64(u.searchParams.get('dest64')));
  const host = u.hostname || '';
  const UA_PRE = String(request.headers.get('user-agent') || '');
  /* IP REAL do visitante (borda Cloudflare) — não o IP de quem chama o motor */
  const CC = String((request.cf && request.cf.country) || request.headers.get('cf-ipcountry') || '').toUpperCase().slice(0, 2);
  const GEOQ = '&geo=' + (CC || 'BR') + '&geoforce=1';
  /* Termo REAL que trouxe o visitante: busca da página, oferta ou marca. */
  const TERMO = (u.searchParams.get('q') || u.searchParams.get('busca') || u.searchParams.get('kw') || oferta || marca || '');
  const SLOT_DIN = slotDinamicoCF(TERMO, UA_PRE);
  const site = host.indexOf('nexusplataforma') >= 0 ? 'nexus' : host.indexOf('solvegrid') >= 0 ? 'solvegrid' : 'aquitemachadinhos';
  const PID = site === 'nexus' ? '101870639' : site === 'solvegrid' ? '101870640' : '101859672';
  const sidIn = (u.searchParams.get('sid') || '').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 60);
  const sid = sidIn || (site + '_oferta_' + (oferta ? oferta.replace(/-/g, '').slice(0, 8) : marca || 'dir')).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 60);
  let row = null;
  let catalogDirect = directIn;
  try {
    // Mensagens v420 já carregam dest/dest64: nesse caso não se gasta o orçamento
    // de 45 ms consultando o catálogo outra vez.
    if (!directIn) {
      let r = null;
      const remaining = Math.max(1, Math.min(22, EDGE_FALLBACK_BUDGET_MS - (Date.now() - edgeStarted)));
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), remaining);
      try {
        if (oferta && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(oferta)) {
          r = await fetch(SB + '/rest/v1/nexus_public_offers_ordered_mv?id=eq.' + oferta + '&select=' + SEL + '&limit=1', { headers: HDRS, signal: ctrl.signal });
        } else if (marca) {
          r = await fetch(SB + '/rest/v1/nexus_public_offers_ordered_mv?advertiser=ilike.*' + encodeURIComponent(marca) + '*&select=' + SEL + '&order=rank_score.desc&limit=1', { headers: HDRS, signal: ctrl.signal });
        }
        if (r && r.ok) row = (await r.json())[0] || null;
      } finally { clearTimeout(timer); }
    }
  } catch (e) {}
  let dest = null, cjDirect = null;
  if (row) {
    const cu = String(row.click_url || '');
    catalogDirect = safeDirectUrl(cu) || catalogDirect;
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
          dest = ENGINE + '?brand=' + b + '&site=' + site + '&slot=' + SLOT_DIN + '&keyword=' + encodeURIComponent(TERMO || b) + GEOQ + (cjDirect ? '&dest=' + encodeURIComponent(cjDirect) : '');
          break;
        }
      }
    }
    if (!dest) dest = cjDirect || (ENGINE + '?brand=auto&site=' + site + '&slot=' + SLOT_DIN + '&keyword=' + encodeURIComponent(TERMO || 'oferta') + GEOQ);
  }
  if (!dest && directIn) {
    const safeBrand = BRANDS.includes(marca.toLowerCase()) ? marca.toLowerCase() : brandForDirect(directIn);
    dest = ENGINE + '?brand=' + safeBrand + '&site=' + site + '&slot=' + SLOT_DIN +
      '&keyword=' + encodeURIComponent(TERMO || safeBrand) + GEOQ + '&dest=' + encodeURIComponent(directIn);
  }
  if (!dest && marca) {
    const mk = marca.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const b of BRANDS) {
      if (mk.indexOf(b) >= 0 || b.indexOf(mk) >= 0) {
        dest = ENGINE + '?brand=' + b + '&site=' + site + '&slot=' + SLOT_DIN + '&keyword=' + encodeURIComponent(TERMO || marca) + GEOQ;
        break;
      }
    }
  }
  // ── v330 — REDE DE SEGURANÇA DE ATRIBUIÇÃO ────────────────────────────────
  // Achado testando o caminho que o visitante usa de verdade (www → /go → oferta):
  // a Shopee vinha da tabela pública como link cru e era entregue SEM TAG — na
  // prática o utm_content chegava como '----' no destino, ou seja, clique sem
  // atribuição e venda sem comissão rastreada. Mercado Livre e eBay tinham o
  // mesmo furo. Os demais anunciantes (CJ, Amazon, Booking, NordVPN) já passavam
  // pelo gateway.
  // Agora todo destino monetizável cru é envelopado: o gateway anexa o sub_id e
  // preserva o link específico do produto em ?dest=.
  if (dest && dest.indexOf('achadinhos-ad-engine') < 0
      && /s\.shopee\.com|meli\.la|ebay\.com\/deals/.test(dest)) {
    const b = /shopee/.test(dest) ? 'shopee' : (/meli\.la|mercadolivre/.test(dest) ? 'mercadolivre' : 'ebay');
    dest = ENGINE + '?brand=' + b + '&site=' + site + '&slot=' + SLOT_DIN + '&keyword=' + encodeURIComponent(TERMO || b) + GEOQ + '&dest=' + encodeURIComponent(dest);
  }
  if (!dest) dest = site === 'solvegrid' ? 'https://www.solvegrid.com.br/' : site === 'nexus' ? 'https://nexusplataforma.ia.br/' : 'https://www.aquitemachadinhos.com.br/';
  if (dest.indexOf('achadinhos-ad-engine.vercel.app') >= 0 && dest.indexOf('noint=') < 0) {
    dest += (dest.indexOf('?') >= 0 ? '&' : '?') + 'noint=1';
  }
  /* ══ TRAVA NACIONAL BR (borda) ══════════════════════════════════════════
     Segunda barreira: se por qualquer caminho o destino saiu com marca de moeda
     estrangeira (ou host de merchant internacional) para um visitante humano
     brasileiro, ele é trocado por Shopee Brasil / meli.la. O visitante NUNCA
     fica travado: recebe o link nativo e segue.                                */
  let brLock = CC === 'BR' ? 'br_humano' : (CC ? 'nao_br' : 'sem_pais');
  if (CC === 'BR') {
    const uaTxt = String(request.headers.get('user-agent') || '');
    const botBorda = !uaTxt || /bot|crawl|spider|slurp|preview|headless|curl|wget|python|monitor|lighthouse|pagespeed|node-fetch|axios|okhttp|java\/|go-http/i.test(uaTxt);
    if (!botBorda) {
      const mBrand = dest.match(/[?&]brand=([a-z_]+)/i);
      const brandAtual = mBrand ? mBrand[1].toLowerCase() : '';
      if (MOEDA_ESTRANGEIRA_BRANDS.indexOf(brandAtual) >= 0 || destinoMoedaEstrangeira(dest)) {
        const qs = 'brand=shopee&site=' + site + '&slot=' + SLOT_DIN + '&keyword=' + encodeURIComponent(TERMO || 'oferta') + GEOQ;
        dest = dest.indexOf('achadinhos-ad-engine') >= 0
          ? dest.replace(/([?&])brand=[a-z_]+/i, '$1brand=shopee')
          : ENGINE + '?' + qs;
        if (dest.indexOf('achadinhos-ad-engine') >= 0 && dest.indexOf('noint=') < 0) dest += '&noint=1';
        brLock = 'aplicada';
      } else { brLock = 'nativa'; }
    } else { brLock = 'br_bot'; }
  }

  const UA = String(request.headers.get('user-agent') || '');
  const BOT_AD_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegrambot|headless|curl|wget|python|monitor|lighthouse|lexicore|skytab|claude|gptbot|ccbot|anthropic|perplexity|bytespider|applebot|amazonbot|semrush|ahrefs|mj12|dotbot|petalbot|dataforseo|uptimerobot|pingdom|pagespeed|node-fetch|axios|okhttp|java\/|go-http|libwww|scrapy|requests|aiohttp|postman|insomnia|mention_c|mention_ca|mention_car/i;
  const IS_BOT = !UA || BOT_AD_RE.test(UA);
  const NOINT = u.searchParams.get('noint') === '1';
  const hostLower = host.toLowerCase().replace(/^www\./, '');
  // Resolve binding before every exit path. A direct anti-404 fallback does not
  // execute tags, but it must still expose the immutable 1:1 binding state.
  let popunderTag = null;
  let socialbarTag = null;
  for (const dom in ADSTERRA_POPUNDER) {
    if (hostLower === dom || hostLower.endsWith('.' + dom)) { popunderTag = ADSTERRA_POPUNDER[dom]; break; }
  }
  for (const dom in ADSTERRA_SOCIALBAR) {
    if (hostLower === dom || hostLower.endsWith('.' + dom)) { socialbarTag = ADSTERRA_SOCIALBAR[dom]; break; }
  }
  const TAG_BINDING = 'pop=' + (popunderTag ? 'bound' : 'none') + ';sb=' + (socialbarTag ? 'bound' : 'none');
  const RH = { 'Location': dest, 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store, max-age=0', 'Referrer-Policy': 'no-referrer',
               'X-Adsterra-Binding': TAG_BINDING, 'X-Nexus-Edge': 'v1510.0', 'X-Br-Lock': brLock,
               'X-Slot-Dinamico': SLOT_DIN, 'X-Visitor-Country': CC || 'desconhecido' };
  if (IS_BOT || NOINT) return new Response(null, { status: 302, headers: RH });

  /* v420 — porta híbrida anti-404. O orçamento é absoluto desde a entrada da
     Function. Se o gateway não provar saúde dentro dele, a borda devolve 302
     direto ao click_url verificado; não renderiza intersticial quebrado. */
  if (dest.indexOf(ENGINE) === 0) {
    const elapsed = Date.now() - edgeStarted;
    const remaining = Math.min(ENGINE_PROBE_MAX_MS, EDGE_FALLBACK_BUDGET_MS - elapsed);
    const probe = remaining > 0
      ? await probeEngine(dest, remaining)
      : { ok: false, reason: 'deadline', status: 0 };
    if (!probe.ok) {
      const fallback = directFallback(CC, catalogDirect);
      return new Response(null, { status: 302, headers: {
        ...RH,
        'Location': fallback,
        'X-Nexus-Fallback': 'direct',
        'X-Nexus-Engine-Probe': probe.reason,
        'Server-Timing': 'edge;dur=' + (Date.now() - edgeStarted)
      }});
    }
  }

  // v128/v1510 — tags remain fail-closed and bound 1:1 to this host.
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
    + '<div class="tags">Carregando ofertas verificadas • ' + site + ' • ' + sid.slice(-8) + ' • v420</div>'
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
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store, max-age=0', 'Referrer-Policy': 'no-referrer', 'X-Adsterra-Binding': TAG_BINDING, 'X-Nexus-Edge': 'v1510.0', 'X-Nexus-Engine-Probe': 'healthy', 'Server-Timing': 'edge;dur=' + (Date.now() - edgeStarted) }
  });
}
