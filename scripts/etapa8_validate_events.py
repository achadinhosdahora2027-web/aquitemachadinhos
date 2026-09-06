#!/usr/bin/env python3
"""ETAPA 8.1 — Validador das 7 páginas de eventos/guias (anti-regressão do bug Natal Luz).

Falha (exit 1) se QUALQUER uma destas condições for violada:
1. title / h1 / description / canonical únicos entre as 7 páginas
2. canonical sem .html e sem barra final; og:url == canonical; JSON-LD url == canonical
3. robots == index (as 7 têm conteúdo real próprio agora)
4. JSON-LD parseia: 1 Event|SaleEvent|TouristDestination + 1 FAQPage; Event tem startDate ISO
5. "Natal Luz" só aparece em natal-luz-2026 + o-que-fazer-em-gramado (link interno legítimo)
6. Todo card afiliado (<a class="btn..."> com href http) tem rel com sponsored+nofollow
7. disclosure #affiliate-disclosure presente; pixels CJ com PID 101859672 presentes
8. slots ad-engine únicos por página e com site=aquitemachadinhos
9. FAQ visível (<details>) bate com o FAQPage (mesmas perguntas)
10. marcador do gerador presente (etapa8_events.py)
Uso: python3 scripts/etapa8_validate_events.py [--live]  (--live testa links externos com HTTP)
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / "public"
SITE = "https://www.aquitemachadinhos.com.br"
PID = "101859672"

PAGES = [
    "oktoberfest-blumenau-2026",
    "cirio-de-nazare-belem-2026",
    "festa-do-peao-barretos-2027-ingressos",
    "rock-in-rio-2026",
    "natal-luz-2026",
    "o-que-fazer-em-gramado",
    "black-friday-2026-cupons",
]

errors, warns = [], []


def err(msg):
    errors.append(msg)


def get(pattern, html, name, slug):
    m = re.search(pattern, html, re.S)
    if not m:
        err(f"{slug}: {name} ausente")
        return None
    return m.group(1).strip()


def main():
    live = "--live" in sys.argv
    seen = {"title": {}, "h1": {}, "desc": {}, "canon": {}}
    for slug in PAGES:
        p = PUB / (slug + ".html")
        if not p.exists():
            err(f"{slug}: arquivo inexistente")
            continue
        h = p.read_text(encoding="utf-8")
        if "etapa8_events.py" not in h:
            err(f"{slug}: marcador do gerador ausente")
        title = get(r"<title>(.*?)</title>", h, "title", slug)
        h1 = get(r"<h1>(.*?)</h1>", h, "h1", slug)
        desc_m = re.search(r'<meta name="description" content="(.*?)"', h, re.S)
        desc = desc_m.group(1) if desc_m else None
        if not desc:
            err(f"{slug}: description ausente")
        can_m = re.search(r'<link rel="canonical" href="(.*?)"', h)
        can = can_m.group(1) if can_m else None
        if not can:
            err(f"{slug}: canonical ausente")
        for key, val in (("title", title), ("h1", h1), ("desc", desc), ("canon", can)):
            if val:
                if val in seen[key]:
                    err(f"{slug}: {key} DUPLICADO com {seen[key][val]}: {val[:80]}")
                seen[key][val] = slug
        exp = f"{SITE}/{slug}"
        if can and can != exp:
            err(f"{slug}: canonical errado: {can} (esperado {exp})")
        ogu = re.search(r'<meta property="og:url" content="(.*?)"', h)
        if not ogu or ogu.group(1) != exp:
            err(f"{slug}: og:url != canonical")
        robots = re.search(r'<meta name="robots" content="(.*?)"', h)
        if not robots or "noindex" in robots.group(1):
            err(f"{slug}: robots não é index: {robots.group(1) if robots else '?'}")
        # JSON-LD
        lds = re.findall(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', h, re.S)
        if len(lds) < 2:
            err(f"{slug}: esperava >=2 JSON-LD, achou {len(lds)}")
            continue
        types = []
        for raw in lds:
            try:
                j = json.loads(raw)
            except Exception as e:
                err(f"{slug}: JSON-LD inválido: {e}")
                continue
            types.append(j.get("@type"))
            if j.get("@type") in ("Event", "SaleEvent"):
                for f in ("name", "startDate", "location", "url"):
                    if f not in j:
                        err(f"{slug}: Event sem {f}")
                if j.get("url") != exp:
                    err(f"{slug}: Event.url != canonical")
                if not re.match(r"^\d{4}-\d{2}-\d{2}$", str(j.get("startDate", ""))):
                    err(f"{slug}: startDate fora do ISO: {j.get('startDate')}")
            if j.get("@type") == "TouristDestination" and j.get("url") != exp:
                err(f"{slug}: TouristDestination.url != canonical")
            if j.get("@type") == "FAQPage":
                qs = [e.get("name") for e in j.get("mainEntity", [])]
                vis = re.findall(r"<details class=\"faq\"><summary>(.*?)</summary>", h)
                if qs != vis:
                    err(f"{slug}: FAQPage != FAQ visível ({len(qs)} vs {len(vis)})")
        if "FAQPage" not in types:
            err(f"{slug}: sem FAQPage")
        if not (set(types) & {"Event", "SaleEvent", "TouristDestination"}):
            err(f"{slug}: sem Event/TouristDestination (tipos: {types})")
        # Contaminação Natal Luz
        if slug not in ("natal-luz-2026", "o-que-fazer-em-gramado") and "Natal Luz" in h:
            err(f"{slug}: contém 'Natal Luz' (regressão do bug!)")
        # Afiliados
        for m in re.finditer(r'<a href="(https?://[^"]+)" class="btn[^"]*"([^>]*)>', h):
            href, rest = m.group(1), m.group(2)
            rel = re.search(r'rel="([^"]*)"', rest)
            relv = rel.group(1) if rel else ""
            if "sponsored" not in relv or "nofollow" not in relv:
                err(f"{slug}: card sem sponsored+nofollow: {href[:70]}")
            if "achadinhos-ad-engine" in href and "site=aquitemachadinhos" not in href:
                err(f"{slug}: ad-engine sem site=aquitemachadinhos: {href[:80]}")
        slots = re.findall(r"slot=([a-z0-9_]+)", h)
        if len(slots) != len(set(slots)):
            err(f"{slug}: slot duplicado: {slots}")
        if 'id="affiliate-disclosure"' not in h:
            err(f"{slug}: disclosure ausente")
        if h.count(f"image-{PID}-") < 2:
            err(f"{slug}: pixels CJ PID {PID} ausentes")
        if "8041957" in h:
            err(f"{slug}: CID legado 8041957 presente!")
        if live:
            for u in sorted(set(re.findall(r'href="(https?://[^"]+)"', h))):
                if "aquitemachadinhos" in u or "googlesyndication" in u or "infolinks" in u:
                    continue
                try:
                    req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
                    r = urllib.request.urlopen(req, timeout=20)
                    if r.status >= 400:
                        err(f"{slug}: link externo {r.status}: {u[:90]}")
                except Exception as e:
                    err(f"{slug}: link externo FALHOU ({e}): {u[:90]}")
    print(f"Validadas {len(PAGES)} páginas de eventos")
    if warns:
        print(f"AVISOS ({len(warns)}):")
        [print(" -", w) for w in warns]
    if errors:
        print(f"ERROS ({len(errors)}):")
        [print(" -", e) for e in errors]
        return 1
    print("ERROS: NENHUM ✅")
    return 0


if __name__ == "__main__":
    sys.exit(main())
