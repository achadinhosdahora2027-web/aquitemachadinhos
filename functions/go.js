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
  if (!dest) dest = site === 'solvegrid' ? 'https://www.solvegrid.com.br/'
    : site === 'nexus' ? 'https://nexusplataforma.ia.br/' : 'https://www.aquitemachadinhos.com.br/';

  return new Response(null, {
    status: 302,
    headers: { 'Location': dest, 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store, max-age=0', 'Referrer-Policy': 'no-referrer' }
  });
}
