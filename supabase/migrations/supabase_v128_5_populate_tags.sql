-- ═══════════════════════════════════════════════════════════════════════════════
-- supabase_v128_5_populate_tags.sql — MATRIX CORE v128.5
-- População das SocialBars dedicadas (fim do 'sb=none' nos hosts com código real)
-- Data: 2026-09-12 · Mandato: Veracidade Radical · ToS White-Hat estrito
-- ═══════════════════════════════════════════════════════════════════════════════
-- EFEITO: only UPDATE em nexus_host_tag_alignment (tabela operacional de binding).
--   solvegrid.com.br               → SocialBar placement 31166085 (website 6042199)
--   achadinhos-ad-engine.vercel.app → SocialBar placement 31180418 (website 6044306)
-- NÃO toca: catálogo public.ads (read-only absoluto), funções, guards v128,
--   jobs cron, nexusplataforma.ia.br (permanece fail-closed até haver código real).
-- IDEMPOTENTE: re-executar não duplica nota nem reescreve URL idêntica.
-- Paridade ads.txt: os website_ids 6042199/6044306 já declarados no ads.txt de
--   cada host — a condição do WHERE amarilla update à identidade correta.
-- ═══════════════════════════════════════════════════════════════════════════════

SET lock_timeout = '2s';
SET statement_timeout = '60s'; -- lote curto de DML; funções de runtime mantêm 2s/1s internos (SET LOCAL)

-- 1) SOLVEGRID — SocialBar placement 31166085 (código fornecido pelo operador, painel Adsterra)
update public.nexus_host_tag_alignment set
  socialbar_url       = 'https://undergocutlery.com/24/92/83/24928371ac3714c625a6644222607191.js',
  socialbar_placement = 31166085,
  updated_at          = now(),
  notes               = notes || ' | v128.5 (12/09): SocialBar 31166085 populada (código do painel; conf. ping DC=403 anti-bot, padrão de URL válido).'
where host = 'solvegrid.com.br'
  and adsterra_website_id = 6042199
  and (socialbar_url is null or socialbar_url <> 'https://undergocutlery.com/24/92/83/24928371ac3714c625a6644222607191.js');

-- 2) ENGINE — SocialBar placement 31180418 (código fornecido pelo operador; corrobora inventário v112 "650fe1")
update public.nexus_host_tag_alignment set
  socialbar_url       = 'https://undergocutlery.com/65/0f/e1/650fe1ea8c40a70c29031a35f6ac5e49.js',
  socialbar_placement = 31180418,
  updated_at          = now(),
  notes               = notes || ' | v128.5 (12/09): SocialBar 31180418 populada (código do painel; corrobora registro histórico v112 "SocialBar 650fe1").'
where host = 'achadinhos-ad-engine.vercel.app'
  and adsterra_website_id = 6044306
  and (socialbar_url is null or socialbar_url <> 'https://undergocutlery.com/65/0f/e1/650fe1ea8c40a70c29031a35f6ac5e49.js');

-- 3) SELF-CHECK DA PRÓPRIA MIGRAÇÃO (prova embutida; roda sempre)
do $$
declare
  r record;
  v_bad int;
begin
  set local statement_timeout = '2000';
  set local lock_timeout = '1000';

  -- 3a. solvegrid deve estar sb=bound com a URL/ID certos
  select * into r from public.nexus_host_tag_alignment where host = 'solvegrid.com.br';
  if r.socialbar_url <> 'https://undergocutlery.com/24/92/83/24928371ac3714c625a6644222607191.js'
     or r.socialbar_placement <> 31166085 then
    raise exception 'v128.5 self-check FALHOU: solvegrid não populada corretamente';
  end if;

  -- 3b. engine idem
  select * into r from public.nexus_host_tag_alignment where host = 'achadinhos-ad-engine.vercel.app';
  if r.socialbar_url <> 'https://undergocutlery.com/65/0f/e1/650fe1ea8c40a70c29031a35f6ac5e49.js'
     or r.socialbar_placement <> 31180418 then
    raise exception 'v128.5 self-check FALHOU: engine não populada corretamente';
  end if;

  -- 3c. aquitem intocado (mestre a04bea8f) e nexus permanece fail-closed
  select count(*) into v_bad from public.nexus_host_tag_alignment
   where (host = 'aquitemachadinhos.com.br' and coalesce(socialbar_url,'') not like '%a04bea8f13eec4c1e3b87777107a3c6e.js')
      or (host = 'nexusplataforma.ia.br'    and socialbar_url is not null);
  if v_bad <> 0 then
    raise exception 'v128.5 self-check FALHOU: mestre alterado ou nexus sem fail-closed';
  end if;

  -- 3d. seletor 1:1 vivo: cada host só vê a PRÓPRIA socialbar
  raise notice 'v128.5 · seletor solvegrid : %', public.nexus_get_ad_tags_for_host('www.solvegrid.com.br')::text;
  raise notice 'v128.5 · seletor engine    : %', public.nexus_get_ad_tags_for_host('achadinhos-ad-engine.vercel.app')::text;
  raise notice 'v128.5 · seletor aquitem   : %', public.nexus_get_ad_tags_for_host('www.aquitemachadinhos.com.br')::text;
  raise notice 'v128.5 · seletor nexus (sb=null esperado): %', public.nexus_get_ad_tags_for_host('nexusplataforma.ia.br')::text;
  raise notice 'v128.5 · SELF-CHECK OK: 2 hosts sb=bound, mestre intocado, nexus fail-closed';
exception when others then
  raise notice 'v128.5 · SELF-CHECK COM EXCEÇÃO: %', sqlerrm;
  raise;
end $$;
