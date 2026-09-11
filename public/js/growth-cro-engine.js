/**
 * Growth Hacker, CRO Acceleration & ManyChat Conversational Engine (2026)
 * Implements:
 * 1. Viral Share Loops (WhatsApp, Telegram, WebShare API, Pinterest)
 * 2. Dynamic Real-Time Urgency & Scarcity Badges (Live countdowns & timestamps)
 * 3. High-Converting Mobile Sticky Bottom Bar (100% viewport retention)
 * 4. Micro-Engagement 3-Step Commitment Hooks (Cialdini Psychology)
 * 5. ManyChat & WhatsApp 24/7 Conversational Automation Trigger
 */

(function() {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. VIRAL SHARE SYSTEM (K-Factor WhatsApp / Telegram / WebShare)
  // --------------------------------------------------------------------------
  window.shareResultViral = function(title, description, customUrl) {
    const url = customUrl || window.location.href;
    const text = encodeURIComponent(`${title}\n\n"${description}"\n\n👉 Veja o seu resultado completo aqui: ${url}`);
    
    if (navigator.share && /mobile|iphone|android/i.test(navigator.userAgent)) {
      navigator.share({
        title: title,
        text: `${title} - ${description}`,
        url: url
      }).catch(function() {});
      return;
    }

    const waUrl = `https://api.whatsapp.com/send?text=${text}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  window.shareTelegramViral = function(title, description, customUrl) {
    const url = encodeURIComponent(customUrl || window.location.href);
    const text = encodeURIComponent(`${title} - ${description}`);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'noopener,noreferrer');
  };

  window.sharePinterestViral = function(description, mediaUrl) {
    const url = encodeURIComponent(window.location.href);
    const desc = encodeURIComponent(description || document.title);
    const media = encodeURIComponent(mediaUrl || 'https://www.aquitemachadinhos.com.br/og-image.png');
    window.open(`https://pinterest.com/pin/create/button/?url=${url}&description=${desc}&media=${media}`, '_blank', 'noopener,noreferrer');
  };

  // --------------------------------------------------------------------------
  // 2. REAL-TIME DYNAMIC URGENCY & SCARCITY TIMERS (CRO Multiplier)
  // --------------------------------------------------------------------------
  function initDynamicUrgency() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    document.querySelectorAll('.live-timestamp').forEach(function(el) {
      el.innerText = `Hoje às ${hours}:${minutes}`;
    });

    let totalSeconds = 47 * 60 + 18;
    function updateCountdowns() {
      totalSeconds--;
      if (totalSeconds <= 0) totalSeconds = 45 * 60;
      const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
      const s = String(totalSeconds % 60).padStart(2, '0');
      document.querySelectorAll('.live-countdown').forEach(function(el) {
        el.innerText = `${m}m ${s}s`;
      });
    }
    setInterval(updateCountdowns, 1000);
    updateCountdowns();
  }

  // --------------------------------------------------------------------------
  // 3. STICKY MOBILE BOTTOM BAR (Unobtrusive High-CTR Floating Bar)
  // --------------------------------------------------------------------------
  function initStickyBottomBar() {
    if (document.getElementById('achadinhos-sticky-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'achadinhos-sticky-bar';
    bar.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 99999;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-top: 1px solid rgba(99, 102, 241, 0.3);
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.5);
      font-family: system-ui, -apple-system, sans-serif;
    `;

    const site = window.location.hostname.includes('solvegrid') ? 'solvegrid' : (window.location.hostname.includes('nexus') ? 'nexus' : 'aquitemachadinhos');
    // Udemy nao tem programa de afiliados na conta (auditoria 03/09/2026) -> nexus usa NordVPN (top EPC)
    const brand = site === 'aquitemachadinhos' ? 'shopee' : 'nordvpn';
    const offerText = site === 'aquitemachadinhos' ? '🔥 Achadinho do Dia: Cupons Shopee & Amazon' : '🛡️ NordVPN 74% OFF + 3 Meses';
    const btnText = site === 'aquitemachadinhos' ? 'Pegar Cupom ➔' : 'Ativar Desconto ➔';

    bar.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;min-width:0;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 10px #22c55e;animation:pulse 2s infinite;"></span>
        <div style="font-size:0.82rem;color:#f8fafc;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${offerText} <span style="color:#38bdf8;font-size:0.75rem;font-weight:600;" class="live-countdown">46m 52s</span>
        </div>
      </div>
      <a href="https://achadinhos-ad-engine.vercel.app/api/ads/go?brand=${brand}&site=${site}&slot=sticky_mobile" target="_blank" rel="sponsored noopener noreferrer nofollow" style="background:linear-gradient(135deg,#6366f1,#3b82f6);color:#fff;font-weight:800;font-size:0.78rem;padding:8px 14px;border-radius:8px;text-decoration:none;white-space:nowrap;box-shadow:0 2px 10px rgba(99,102,241,0.4);border:none;cursor:pointer;">
        ${btnText}
      </a>
      <button onclick="document.getElementById('achadinhos-sticky-bar').style.display='none'" style="background:transparent;border:none;color:#94a3b8;font-size:1.1rem;cursor:pointer;padding:2px 4px;line-height:1;" aria-label="Fechar">&times;</button>
    `;

    document.body.appendChild(bar);
  }

  // --------------------------------------------------------------------------
  // 4. MANYCHAT & WHATSAPP CONVERSATIONAL FLOATING TRIGGER
  // --------------------------------------------------------------------------
  function initManyChatTrigger() {
    if (document.getElementById('manychat-smart-trigger')) return;

    const userLang = (navigator.language || 'pt').substring(0, 2).toLowerCase();
    const promptMsg = userLang === 'es' ? 'Hola! Quiero mi carta del Tarot y Cupones VIP' : (userLang === 'en' ? 'Hello! I want my Tarot Daily Card and VIP Deals' : 'Olá! Quero tirar minha Carta do Tarot e receber Cupons');
    const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(promptMsg)}`;

    const bubble = document.createElement('div');
    bubble.id = 'manychat-smart-trigger';
    bubble.style.cssText = `
      position: fixed;
      bottom: 64px;
      right: 16px;
      z-index: 99998;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    bubble.innerHTML = `
      <a href="${waLink}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:6px;background:#25d366;color:#fff;font-size:0.78rem;font-weight:700;padding:7px 12px;border-radius:20px;text-decoration:none;box-shadow:0 4px 15px rgba(37,211,102,0.4);transition:transform 0.2s ease;">
        <span>💬</span>
        <span>Oráculo & Cupons</span>
      </a>
    `;

    document.body.appendChild(bubble);
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION ON DOM READY
  // --------------------------------------------------------------------------
  function initEngine() {
    initDynamicUrgency();
    initStickyBottomBar();
    initManyChatTrigger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngine);
  } else {
    initEngine();
  }
})();


/* ══════════════════════════════════════════════════════════════════════════
 * LEGACY MONETIZATION HYDRATOR v13.0 (2026-09-10) — Multi-Tier Ad Injection
 * Carregado por TODAS as páginas legadas (este script já vinha em todas):
 *   · Tier CPM (tráfego NÃO-Google): Monetag zona 11691043 + Adsterra native
 *     (o tráfego Google já recebe SOMENTE o AdSense estático do <head> —
 *     política de isolamento da conta Adsense preservada).
 *   · Tier CONVERSÃO: cards de ofertas contextuais via
 *     /api/supabase/contextual-offers (RPC read-only por nicho da página) —
 *     link CJ/Shopee/Lomadee com SID forense legacy_{path}_{AAAAMMDDHH}.
 *   · FAIL-CLOSED ABSOLUTO: IIFE isolado, try/catch total, timeout 2.5s,
 *     AbortController; QUALQUER falha → silêncio (página original intacta,
 *     zero 500, zero atraso: hydrata após DOMContentLoaded).
 * ══════════════════════════════════════════════════════════════════════════ */
(function() {
  'use strict';
  if (window.__legacyHydration) return;
  window.__legacyHydration = true;

  var escH = function(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  function initLegacyMonetization() {
    try {
      var isGoogleTraffic = /google\./i.test(String(document.referrer || ''));

      // ── Tier 1: CPM na entrada (não-Google) — nunca bloqueia render ──
      if (!isGoogleTraffic) {
        var adWrap = document.createElement('div');
        adWrap.id = 'legacy-ad-tier';
        adWrap.setAttribute('style', 'margin:18px auto;max-width:760px;text-align:center;');
        // v113 FIX: scripts inseridos via innerHTML NUNCA executam (spec HTML).
        // A Monetag 11691043 e o native da Adsterra estavam mortos desde a v13.
        // Agora sao criados com createElement (mesmo mecanismo da SocialBar).
        var adContainer = document.createElement('div');
        adContainer.id = 'container-65ecd104cf64eb4aad5086068ce93de8';
        adWrap.appendChild(adContainer);
        document.body.appendChild(adWrap);

        var mtg = document.createElement('script');
        mtg.src = 'https://quge5.com/88/tag.min.js';
        mtg.setAttribute('data-zone', '11691043');
        mtg.async = true;
        mtg.setAttribute('data-cfasync', 'false');
        adWrap.appendChild(mtg);

        var nat = document.createElement('script');
        nat.src = 'https://undergocutlery.com/65ecd104cf64eb4aad5086068ce93de8/invoke.js';
        nat.async = true;
        nat.setAttribute('data-cfasync', 'false');
        adWrap.appendChild(nat);
      }

      // ── Tier 2: cards contextuais ABAIXO do conteúdo principal ──
      var ctrl = new AbortController();
      var timer = setTimeout(function() { ctrl.abort(); }, 2500);
      var pathSlug = (location.pathname.replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'home');
      var sid = 'legacy_' + pathSlug + '_' + new Date().toISOString().slice(0, 13).replace(/[-T]/g, '');
      fetch('/api/supabase/contextual-offers?path=' + encodeURIComponent(location.pathname) + '&sid=' + encodeURIComponent(sid), { signal: ctrl.signal })
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(d) {
          clearTimeout(timer);
          // GA4 (v13.2): ID de medição vem do cofre via RPC (ga4_measurement_id).
          // Enquanto for placeholder, nada carrega. Presente → gtag.js em TODAS
          // as páginas (page_view automático). Falha → silêncio (fail-closed).
          if (d && d.ga && /^G-[A-Z0-9]+$/.test(String(d.ga)) && !window.__ga4Done) {
            try {
              window.__ga4Done = true;
              window.dataLayer = window.dataLayer || [];
              window.gtag = function() { dataLayer.push(arguments); };
              gtag('js', new Date());
              gtag('config', String(d.ga));
              var gs = document.createElement('script');
              gs.async = true;
              gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(String(d.ga));
              document.head.appendChild(gs);
            } catch (e) { /* GA nunca quebra a página */ }
          }
          if (!d || !d.ok || !d.offers || !d.offers.length) return;
          var cards = d.offers.map(function(o, i) {
            var nome = String(o.name || 'Oferta').replace(/_+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 70);
            return '<a href="' + escH(o.url) + '" rel="sponsored nofollow noopener" target="_blank" style="display:block;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;text-decoration:none;color:#111827;box-shadow:0 1px 4px rgba(0,0,0,.07)">'
              + '<span style="font-size:.68rem;color:#059669;font-weight:800;letter-spacing:.04em;text-transform:uppercase">' + escH(o.category || 'oferta') + '</span>'
              + '<span style="display:block;font-weight:700;font-size:.95rem;margin:5px 0 2px;line-height:1.3">' + escH(nome) + '</span>'
              + '<span style="font-size:.78rem;color:#6b7280">' + escH(o.advertiser) + '</span>'
              + '<span style="display:block;margin-top:9px;background:#059669;color:#fff;font-weight:800;font-size:.85rem;padding:9px;border-radius:8px;text-align:center">Ver oferta →</span></a>';
          }).join('');
          var block = document.createElement('section');
          block.id = 'legacy-offers';
          block.setAttribute('style', 'margin:24px auto;max-width:760px;padding:0 4px');
          // v13.3 POLYMORPHIC: resenha única do nicho (IA, atualizada
          // semanalmente) acima dos cards — contexto editorial de verdade
          var intro = '';
          if (d.texto && String(d.texto).length > 120) {
            intro = '<p style="font-size:.9rem;color:#374151;line-height:1.55;margin:0 0 12px">' + escH(String(d.texto).slice(0, 600)) + '</p>';
          }
          block.innerHTML = '<div style="font-size:1.05rem;font-weight:800;margin-bottom:10px">🔥 Ofertas relacionadas para você</div>'
            + intro
            + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">' + cards + '</div>'
            + '<p style="font-size:.7rem;color:#9ca3af;margin-top:8px">Links de afiliados — podemos receber comissão pelas compras.</p>';
          var main = document.querySelector('main') || document.querySelector('article') || document.querySelector('.content');
          if (main && main.parentNode) main.insertAdjacentElement('afterend', block);
          else document.body.appendChild(block);
        })
        .catch(function() { /* silêncio absoluto — conteúdo original intacto */ });
    } catch (e) { /* hidratação NUNCA quebra a página legada */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLegacyMonetization);
  } else {
    initLegacyMonetization();
  }
})();
