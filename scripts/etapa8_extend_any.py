#!/usr/bin/env python3
"""ETAPA 8.18c — Extensor genérico: completa um dataset do solvegrid para as chaves LOCAIS.

Dados por QID são idênticos entre repos; este script reconstrói out/<dataset>.jsonl local
filtrado pelas páginas LOCAIS e consulta em WDQS o que faltar (chaves exclusivas deste repo).
Uso: python3 scripts/etapa8_extend_any.py --dataset etapa8_historia --from <sg.jsonl> --delay N
Datasets suportados: etapa8_historia (P571/P1082/P1376), etapa8_diretorio (Q2385804/Q4830453).
"""
import json
import re
import sys
import time
import urllib.request
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / "public"
LOG = Path("/home/user/cloudfire/work") / "logs" / "etapa8_extend.log"
UA = {"User-Agent": "etapa8-extend/1.0 (project contact)", "Accept": "application/sparql-results+json"}
DELAY = float(sys.argv[sys.argv.index("--delay") + 1]) if "--delay" in sys.argv else 65.0
CHUNK = 90
RAMOS = {"Q2385804": "educacional", "Q4830453": "empresarial"}


def log(m):
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(time.strftime("%H:%M:%S ") + m + "\n")
    print(m, flush=True)


def sparql(query, tries=4):
    url = "https://query.wikidata.org/sparql?" + urllib.parse.urlencode({"query": query, "format": "json"})
    for t in range(tries):
        try:
            time.sleep(DELAY)
            d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=180))
            if "results" in d:
                return d["results"]["bindings"]
        except Exception as e:
            log(f"  retry {t} {e}")
            time.sleep(45 * (t + 1))
    return None


def city_qids():
    out = []
    for p in sorted(PUB.glob("*/*.html")):
        h = p.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', h, re.S):
            try:
                d = json.loads(m.group(1))
            except Exception:
                continue
            if isinstance(d, dict) and d.get("@type") == "City":
                qids = [s.split("/wiki/")[-1] for s in (d.get("sameAs") or []) if "wikidata.org" in s]
                if qids:
                    out.append((p.relative_to(PUB).as_posix()[:-5], qids[0]))
                break
    return out


def ano(v):
    try:
        m = re.match(r"^(-?)(\d{1,4})-", v)
        if not m:
            return None
        y = int(m.group(2))
        return -y if m.group(1) else y
    except Exception:
        return None


def parse_rows(dataset, rows):
    """rows -> {qid: {campos do dataset}}"""
    by_city = {}
    if dataset == "etapa8_historia":
        for b in rows:
            q = b["city"]["value"].split("/")[-1]
            rec = by_city.setdefault(q, {})
            if "inception" in b:
                a = ano(b["inception"]["value"])
                if a is not None:
                    rec.setdefault("inicio", a)
            if "pop" in b and "popdate" in b:
                try:
                    v = int(float(b["pop"]["value"]))
                    d = b["popdate"]["value"][:4]
                except Exception:
                    continue
                c = rec.get("populacao")
                if not c or d >= c["data"]:
                    rec["populacao"] = {"valor": v, "data": d}
            if "capOfLabel" in b:
                lbl = b["capOfLabel"]["value"]
                if lbl and not lbl.startswith("Q"):
                    rec.setdefault("capital_de", [])
                    if lbl not in rec["capital_de"] and len(rec["capital_de"]) < 5:
                        rec["capital_de"].append(lbl)
    else:  # diretorio
        for b in rows:
            q = b["city"]["value"].split("/")[-1]
            item = b["item"]["value"].split("/")[-1]
            name = b.get("itemLabel", {}).get("value", item)
            tipo = b.get("tipo", {}).get("value", "educacional")
            if not name or name.startswith("Q") or name == item:
                continue
            by_city.setdefault(q, []).append({"qid": item, "nome": name, "ramo": tipo})
    return by_city


def main():
    ds = sys.argv[sys.argv.index("--dataset") + 1]
    src = sys.argv[sys.argv.index("--from") + 1]
    out_f = ROOT / "out" / f"{ds}.jsonl"
    if not Path(src).exists():
        log("ERRO: --from obrigatório")
        return 1
    base = {}
    for line in Path(src).read_text(encoding="utf-8").splitlines():
        try:
            r = json.loads(line)
        except Exception:
            continue
        base[r["qid"]] = r
    kq = city_qids()
    qid_keys = {}
    for k, q in kq:
        qid_keys.setdefault(q, []).append(k)
    registros = []
    for q, ks in qid_keys.items():
        br = base.get(q)
        if br:
            r = {"qid": q, "keys": ks}
            for campo in ("inicio", "populacao", "capital_de", "itens"):
                if campo in br:
                    r[campo] = br[campo]
            registros.append(r)
    feitas = {r["qid"] for r in registros}
    faltam = [q for q in qid_keys if q not in feitas]
    log(f"dataset={ds}: cobertas {len(registros)} | faltam {len(faltam)}")
    for i in range(0, len(faltam), CHUNK):
        chunk = faltam[i:i + CHUNK]
        vals = " ".join("wd:" + q for q in chunk)
        if ds == "etapa8_historia":
            query = f"""SELECT ?city ?inception ?pop ?popdate ?capOf ?capOfLabel WHERE {{
              VALUES ?city {{ {vals} }}
              OPTIONAL {{ ?city wdt:P571 ?inception }}
              OPTIONAL {{ ?city p:P1082 ?ps . ?ps ps:P1082 ?pop ; pq:P585 ?popdate }}
              OPTIONAL {{ ?city wdt:P1376 ?capOf .
                         SERVICE wikibase:label {{ bd:serviceParam wikibase:language "pt,en". ?capOf rdfs:label ?capOfLabel }} }}
            }}"""
            rows = sparql(query)
            if rows is None:
                log("  WARN: lote história falhou")
                continue
            by_city = parse_rows(ds, rows)
            for q in chunk:
                r = {"qid": q, "keys": qid_keys[q]}
                r.update(by_city.get(q, {}))
                registros.append(r)
        else:
            for ramo, tipo in RAMOS.items():
                query = f"""SELECT ?city ?item ?itemLabel ?tipo WHERE {{
                  VALUES ?city {{ {vals} }}
                  ?item wdt:P131 ?city ; wdt:P31/wdt:P279* wd:{ramo} .
                  BIND("{tipo}" AS ?tipo)
                  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "pt,en". }}
                }} LIMIT 4000"""
                rows = sparql(query)
                if rows is None:
                    log(f"  WARN: ramo {tipo} falhou")
                    continue
                by_city = parse_rows(ds, rows)
                for q in chunk:
                    rec = next((r for r in registros if r["qid"] == q), None)
                    if rec is None:
                        rec = {"qid": q, "keys": qid_keys[q], "itens": []}
                        registros.append(rec)
                    rec.setdefault("itens", []).extend(by_city.get(q, []))
        log(f"  lote adicional {i//CHUNK + 1}: ok")
    with open(out_f, "w", encoding="utf-8") as f:
        for r in registros:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    log(f"FIM: {len(registros)} cidades -> {out_f.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
