#!/usr/bin/env python3
"""ETAPA 8.1 — Gerador determinístico das 7 páginas de eventos/guias do aquitem.

Substitui os 6 stubs que repetiam o conteúdo "Natal Luz de Gramado" (bug citado nos
relatórios Etapa 5 §6.1 e Etapa 6 §7) por conteúdo real, único e verificado por página,
mais o enriquecimento da página legítima natal-luz-2026.

Fontes (consultadas em 05/09/2026, links oficiais testados com HTTP 200):
- Oktoberfest Blumenau 2026: 7–25/out/2026, 41ª ed., Parque Vila Germânica
- Círio de Nazaré 2026: procissão 11/out/2026 (2º domingo), abertura 6/10, Trasladação 10/10, Recírio 26/10
- Festa do Peão Barretos 2027: 72ª ed., 19–29/ago/2027 (anúncio 30/08/2026; grade/vendas 2027 ainda não divulgadas)
- Rock in Rio 2026: 4,5,6,7,11,12,13/set/2026, Cidade do Rock (Parque Olímpico, Barra), portões 14h, ingresso digital
- Natal Luz Gramado 2026: 41ª ed., 22/out/2026–17/jan/2027, 88 dias; espetáculos: Grande Desfile, Nativitaten, O Brilho do Natal, Natal Luz in Concert
- Black Friday 2026: 27/nov/2026 (última sexta-feira de novembro — fato de calendário)
- Gramado: guia perene (Lago Negro, Mini Mundo, Rua Coberta, Snowland, Canela/Caracol)

Regras: idempotente (2 runs = bytes idênticos), sem .html no canonical/og:url/JSON-LD url,
robots index, afiliados com rel sponsored + disclosure, JSON-LD Event/FAQPage válido.
Uso: python3 scripts/etapa8_events.py [--check]  (--check só verifica, não escreve)
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / "public"
SITE = "https://www.aquitemachadinhos.com.br"
ATUALIZADO = "5 de setembro de 2026"

AD = "https://achadinhos-ad-engine.vercel.app/api/ads/go"
MELI = "https://meli.la/1U3rtgV"
SHOPEE = "https://s.shopee.com.br/30n7ohzzU6"

PIXELS = """<!-- CJ Affiliate Universal High-Priority Impression Pixels (Publisher PID: 101859672) -->
<img src="https://www.ftjcfx.com/image-101859672-17288448" width="1" height="1" style="position:fixed;top:0;left:0;width:1px;height:1px;opacity:0.001;pointer-events:none;z-index:-1;"alt="image 101859672 17288448" fetchpriority="high" />
<img src="https://www.tqlkg.com/image-101859672-17075184" width="1" height="1" style="position:fixed;top:0;left:0;width:1px;height:1px;opacity:0.001;pointer-events:none;z-index:-1;"alt="image 101859672 17075184" fetchpriority="high" />
<!-- /CJ Affiliate Pixels -->"""

DISCLOSURE = """<div id="affiliate-disclosure" style="clear:both;margin:24px auto 8px;max-width:720px;padding:10px 14px;font-size:12px;line-height:1.5;color:#94a3b8;background:rgba(148,163,184,.08);border:1px solid rgba(148,163,184,.2);border-radius:8px"><strong>Divulgação de Afiliados:</strong> o Aqui Tem Achadinhos (e sites irmãos) participa de programas de afiliados — CJ Affiliate, Amazon Associados, Shopee, Awin, Mercado Livre, Lomadee e similares. Podemos receber comissão por compras feitas nos links deste site, sem nenhum custo extra para você. <em>(FTC 16 CFR Part 255 / CONAR)</em></div>"""

SCRIPTS = """  <script type="text/javascript"> var infolinks_pid = 3447442; var infolinks_wsid = 0; </script>
<script type="text/javascript" src="//resources.infolinks.com/js/infolinks_main.js"></script>
  <script src="/js/growth-cro-engine.js" defer></script>
  <script src="/js/growth-cro-engine.js" defer></script>
<script src="/js/exit-intent-retention-engine.js" defer></script>
<script src="/js/affiliate-telemetry.js" defer></script>
<script src="/js/viral-share-engine.js" defer></script>
<script src="/js/web-push-subscriber.js" defer></script>"""

CSS = """  <style>
    :root{color-scheme:dark}
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#030712;color:#f3f4f6;padding:20px}
    .container{max-width:1000px;margin:0 auto}
    header{text-align:center;padding:30px 0}
    h1{font-size:2.2rem;color:#f59e0b;margin-bottom:8px}
    h2{color:#fbbf24;margin:28px 0 10px;font-size:1.35rem}
    .badge{display:inline-block;background:#78350f;color:#fde68a;font-size:.8rem;font-weight:700;padding:4px 12px;border-radius:99px;margin-bottom:12px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-top:24px}
    .card{background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:20px}
    .card h3{margin-top:0;color:#60a5fa}
    .btn{display:inline-block;padding:12px 18px;border-radius:10px;font-weight:700;text-decoration:none;background:#2563eb;color:#fff;margin-top:12px;text-align:center;width:100%;box-sizing:border-box}
    .btn-gold{background:#d97706}
    .btn-green{background:#059669}
    dl.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:0 24px;background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:6px 20px;margin:0}
    dl.facts div{display:flex;gap:10px;justify-content:space-between;border-bottom:1px dotted #334155;padding:8px 0}
    dl.facts dt{color:#94a3b8;margin:0}
    dl.facts dd{margin:0;text-align:right}
    ul.tips{line-height:1.7;padding-left:20px}
    ul.tips li{margin:6px 0}
    details.faq{background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:12px 16px;margin:10px 0}
    details.faq summary{cursor:pointer;font-weight:700;color:#bfdbfe}
    a.ext{color:#38bdf8}
    p.mut{color:#94a3b8;font-size:.85rem}
  </style>"""

PAGES = [
    {
        "slug": "oktoberfest-blumenau-2026",
        "badge": "41ª edição · 7 a 25 de outubro de 2026",
        "title": "Oktoberfest Blumenau 2026 — Datas, Ingressos, Hotéis e Programação",
        "description": "Guia da Oktoberfest Blumenau 2026 (41ª edição, 7 a 25 de outubro, Parque Vila Germânica): desfiles na Rua XV, hotéis, como chegar e ingressos.",
        "h1": "🍺 Oktoberfest Blumenau 2026 — Guia Completo",
        "sub": "A maior festa alemã das Américas: 19 dias de desfiles, chope, gastronomia típica e shows no Parque Vila Germânica.",
        "facts": [
            ("Datas", "7 a 25 de outubro de 2026 (19 dias)"),
            ("Edição", "41ª edição"),
            ("Local", "Parque Vila Germânica — Blumenau, SC"),
            ("Desfiles", "Tradicionais desfiles típicos pela Rua XV de Novembro"),
            ("Site oficial", '<a class="ext" href="https://www.oktoberfestblumenau.com.br/" target="_blank" rel="noopener">oktoberfestblumenau.com.br</a>'),
        ],
        "tips": [
            "A festa dura quase três semanas: dias de semana costumam ser mais tranquilos; fins de semana concentram os maiores públicos e os desfiles mais cheios.",
            "Os desfiles típicos percorrem a Rua XV de Novembro com grupos folclóricos, bandas, carros alegóricos e trajes germânicos — chegue cedo para garantir lugar.",
            "A programação musical mistura bandas alemãs, grupos folclóricos e atrações internacionais; confira o calendário oficial por dia antes de comprar passagens.",
            "Blumenau recebe visitantes de todo o Brasil em outubro: reserve hotel com antecedência e prefira hospedagem com cancelamento grátis.",
            "Para chegar: os aeroportos da região (Navegantes e Florianópolis) atendem Blumenau; de carro, a BR-470 é o principal acesso.",
        ],
        "cards": [
            ("🏨 Hotéis em Blumenau", "Alta ocupação em outubro. Compare hotéis e pousadas perto da Vila Germânica com cancelamento grátis.", f"{AD}?brand=booking&site=aquitemachadinhos&slot=oktoberfest_hotel", "Ver Hotéis em Blumenau (Booking.com)", "btn-gold"),
            ("🚗 Aluguel de Carros", "Desembarque na região e explore Blumenau, Pomerode e o Vale Europeu com liberdade.", f"{AD}?brand=carla&site=aquitemachadinhos&slot=oktoberfest_car", "Alugar Carro em SC (Carla)", "btn-green"),
            ("👒 Trajes Típicos e Acessórios", "Lederhosen, dirndl, canecas e acessórios para curtir a festa a caráter.", MELI, "Ver Ofertas de Trajes e Festa", ""),
        ],
        "faq": [
            ("Quando acontece a Oktoberfest Blumenau 2026?", "De 7 a 25 de outubro de 2026, na 41ª edição da festa, com 19 dias de programação no Parque Vila Germânica."),
            ("Onde é a Oktoberfest de Blumenau?", "No Parque Vila Germânica, em Blumenau (SC), com desfiles típicos pela Rua XV de Novembro."),
            ("Precisa de ingresso?", "Sim, a festa tem cobrança de ingresso na maioria dos dias. Valores, meia-entrada e gratuidades variam por dia — confirme no site oficial antes de ir."),
            ("Qual aeroporto usar para ir à Oktoberfest?", "Os aeroportos mais usados são Navegantes e Florianópolis, com transfer e aluguel de carros até Blumenau."),
        ],
        "ld_event": {"name": "Oktoberfest Blumenau 2026", "startDate": "2026-10-07", "endDate": "2026-10-25",
                     "location_name": "Parque Vila Germânica", "address": "Blumenau, Santa Catarina, Brasil"},
    },
    {
        "slug": "cirio-de-nazare-belem-2026",
        "badge": "Procissão principal: 11 de outubro de 2026",
        "title": "Círio de Nazaré Belém 2026 — Data, Percurso, Romarias e Hotéis",
        "description": "Círio de Nazaré 2026 em Belém do Pará: procissão em 11 de outubro, Trasladação, romarias, percurso Sé–Basílica e guia de hospedagem.",
        "h1": "⛪ Círio de Nazaré Belém 2026 — Guia do Romeiro",
        "sub": "A maior procissão católica do mundo: milhões de fiéis nas ruas de Belém no segundo domingo de outubro.",
        "facts": [
            ("Procissão principal", "11 de outubro de 2026 (domingo)"),
            ("Abertura oficial", "6 de outubro de 2026, Basílica Santuário de Nazaré"),
            ("Trasladação", "10 de outubro de 2026 (sábado, à noite)"),
            ("Percurso", "Catedral da Sé → Basílica Santuário de Nazaré (Belém, PA)"),
            ("Encerramento / Recírio", "25–26 de outubro de 2026"),
            ("Site oficial", '<a class="ext" href="https://www.ciriodenazare.com.br/" target="_blank" rel="noopener">ciriodenazare.com.br</a>'),
        ],
        "tips": [
            "A procissão principal sai da Catedral da Sé e segue até a Basílica Santuário, reunindo mais de 2 milhões de pessoas — chegue com horas de antecedência.",
            "A programação começa dias antes: abertura oficial, Círio Musical, Romaria Fluvial, Trasladação e, depois do Círio, as romarias dos corredores, da juventude, das crianças e o Recírio.",
            "Outubro é alta temporada em Belém: hotéis próximos à Basílica e à Sé esgotam rápido — reserve com cancelamento grátis.",
            "Hidrate-se, use protetor solar e combine pontos de encontro: o sinal do celular costuma falhar na multidão.",
            "Prove a culinária paraense do período: maniçoba, pato no tucupi, tacacá e açaí são tradições do Círio.",
        ],
        "cards": [
            ("🏨 Hotéis em Belém", "Fique perto da Basílica ou da Sé e evite deslocamentos no dia da procissão.", f"{AD}?brand=booking&site=aquitemachadinhos&slot=cirio_hotel", "Ver Hotéis em Belém (Booking.com)", "btn-gold"),
            ("🚗 Aluguel de Carros em Belém", "Chegue pelo aeroporto de Belém e explore a cidade e a Ilha de Marajó com conforto.", f"{AD}?brand=carla&site=aquitemachadinhos&slot=cirio_car", "Alugar Carro em Belém (Carla)", "btn-green"),
            ("🎁 Artesanato e Lembranças", "Imagens, fitinhas do Senhor do Bonfim, artesanato de miriti e lembranças do Pará.", MELI, "Ver Artesanato e Lembranças", ""),
        ],
        "faq": [
            ("Quando é o Círio de Nazaré 2026?", "A procissão principal é em 11 de outubro de 2026 (segundo domingo de outubro), com programação de 6 a 26 de outubro."),
            ("Qual é o percurso do Círio?", "Da Catedral da Sé até a Basílica Santuário de Nazaré, em Belém do Pará, num trajeto de cerca de 3,6 km."),
            ("O que é a Trasladação?", "É a procissão noturna da véspera (10 de outubro), que leva a imagem de Nazaré até a Catedral da Sé — um dos momentos mais emocionantes da festa."),
            ("Onde ficar em Belém no Círio?", "Perto da Basílica Santuário ou da Catedral da Sé. Reserve cedo: outubro é o mês mais cheio do ano na cidade."),
        ],
        "ld_event": {"name": "Círio de Nazaré 2026", "startDate": "2026-10-11", "endDate": "2026-10-11",
                     "location_name": "Basílica Santuário de Nazaré", "address": "Belém, Pará, Brasil",
                     "description": "Procissão principal do Círio de Nazaré 2026, da Catedral da Sé à Basílica Santuário."},
    },
    {
        "slug": "festa-do-peao-barretos-2027-ingressos",
        "badge": "72ª edição · 19 a 29 de agosto de 2027",
        "title": "Festa do Peão Barretos 2027 — Datas, Ingressos, Shows e Hotéis",
        "description": "Festa do Peão de Barretos 2027 (72ª edição, 19 a 29 de agosto, Parque do Peão): datas confirmadas, ingressos, shows e guia de hospedagem.",
        "h1": "🤠 Festa do Peão Barretos 2027 — Datas e Ingressos",
        "sub": "O maior rodeio da América Latina: 72ª edição confirmada para 19 a 29 de agosto de 2027 no Parque do Peão.",
        "facts": [
            ("Datas 2027", "19 a 29 de agosto de 2027 (11 dias)"),
            ("Edição", "72ª Festa do Peão de Boiadeiro de Barretos"),
            ("Local", "Parque do Peão — Barretos, SP"),
            ("Grade de shows 2027", "Ainda não divulgada (confirmada a data em 30/08/2026)"),
            ("Venda de ingressos 2027", "Ainda não aberta — acompanhe o site oficial"),
            ("Organização", 'Os Independentes — <a class="ext" href="https://www.independentes.com.br/" target="_blank" rel="noopener">independentes.com.br</a>'),
        ],
        "tips": [
            "As datas da 72ª edição foram anunciadas no encerramento da festa de 2026: de 19 a 29 de agosto de 2027, no Parque do Peão.",
            "A grade de shows e a venda de ingressos de 2027 ainda não foram divulgadas — desconfie de quem vender ingresso antecipado fora dos canais oficiais.",
            "A edição de 2026 (71ª) teve mais de 150 apresentações em cinco palcos, com rodeio internacional, feira comercial, praça de alimentação e camping.",
            "Os setores costumam incluir Parque, Pista, Área VIP, camarotes e camping — os preços e mapas de 2027 saem junto com a grade oficial.",
            "Barretos lota em agosto: garanta hotel, pousada ou camping com antecedência e prefira reservas com cancelamento grátis.",
        ],
        "cards": [
            ("🏨 Hotéis em Barretos", "Hotéis, pousadas e camping para a semana do rodeio — reserve cedo, a cidade lota.", f"{AD}?brand=booking&site=aquitemachadinhos&slot=barretos_hotel", "Ver Hospedagem em Barretos (Booking.com)", "btn-gold"),
            ("🚗 Aluguel de Carros", "Chegue pelos aeroportos da região e rode com liberdade entre festa, hotel e fazendas.", f"{AD}?brand=carla&site=aquitemachadinhos&slot=barretos_car", "Alugar Carro (Carla)", "btn-green"),
            ("👢 Moda Country", "Botas, chapéus, cintos e camisas para curtir o rodeio no traje certo.", MELI, "Ver Moda Country", ""),
        ],
        "faq": [
            ("Quando é a Festa do Peão de Barretos 2027?", "De 19 a 29 de agosto de 2027, na 72ª edição, no Parque do Peão em Barretos (SP)."),
            ("Os ingressos para 2027 já estão à venda?", "Não. Até o anúncio das datas (30/08/2026), nem a grade de shows nem a venda de ingressos de 2027 haviam sido divulgadas."),
            ("Quem organiza a Festa de Barretos?", "A associação Os Independentes, pelo site oficial independentes.com.br."),
            ("Onde ficar em Barretos na festa?", "Hotéis e pousadas na cidade e camping no entorno do Parque do Peão — reserve com meses de antecedência."),
        ],
        "ld_event": {"name": "Festa do Peão de Barretos 2027", "startDate": "2027-08-19", "endDate": "2027-08-29",
                     "location_name": "Parque do Peão", "address": "Barretos, São Paulo, Brasil",
                     "organizer": "Os Independentes"},
    },
    {
        "slug": "rock-in-rio-2026",
        "badge": "4 a 13 de setembro de 2026 · Cidade do Rock",
        "title": "Rock in Rio 2026 — Datas, Line-up, Ingressos e Como Chegar",
        "description": "Rock in Rio 2026 na Cidade do Rock (4, 5, 6, 7, 11, 12 e 13 de setembro): line-up, portões, como chegar, onde ficar e transmissão.",
        "h1": "🎸 Rock in Rio 2026 — Guia do Festival",
        "sub": "Sete dias de festival na Cidade do Rock, no Parque Olímpico da Barra da Tijuca, Rio de Janeiro.",
        "facts": [
            ("Datas", "4, 5, 6, 7, 11, 12 e 13 de setembro de 2026"),
            ("Local", "Cidade do Rock — Parque Olímpico, Barra da Tijuca, Rio de Janeiro"),
            ("Portões", "Abertura às 14h nos dias de festival"),
            ("Ingresso", "Digital — confira as regras de transferência no site oficial"),
            ("Transmissão", "Globoplay (sinal aberto) e TV Globo"),
            ("Site oficial", '<a class="ext" href="https://rockinrio.com/" target="_blank" rel="noopener">rockinrio.com</a>'),
        ],
        "tips": [
            "O festival ocupa dois fins de semana: 4 a 7 (sexta a segunda, com o feriado de 7 de setembro) e 11 a 13 de setembro.",
            "São seis palcos e espaços temáticos (Mundo, Sunset, New Dance Order, Espaço Favela, Global Village, Supernova) — monte seu roteiro por dia no app/site oficial.",
            "A abertura dos portões acontece às 14h; chegue cedo para evitar filas no transporte e na entrada.",
            "O ingresso é digital: baixe com antecedência, leve documento com foto e confira as regras de meia-entrada e transferência.",
            "Quem não vai ao festival pode assistir aos shows no Globoplay e em flashes na TV Globo.",
            "Para a hospedagem, a Barra da Tijuca e o Recreio são as regiões mais práticas; a cidade inteira fica mais cheia nos dias de festival.",
        ],
        "cards": [
            ("🏨 Hotéis no Rio de Janeiro", "Barra, Recreio e Zona Sul: hotéis para os dias de festival com cancelamento grátis.", f"{AD}?brand=booking&site=aquitemachadinhos&slot=rockinrio_hotel", "Ver Hotéis no Rio (Booking.com)", "btn-gold"),
            ("🚗 Aluguel de Carros no Rio", "Para explorar praias, trilhas e o Rio além do festival, antes e depois dos shows.", f"{AD}?brand=carla&site=aquitemachadinhos&slot=rockinrio_car", "Alugar Carro no Rio (Carla)", "btn-green"),
            ("🎒 Essenciais de Festival", "Capa de chuva, protetor solar, pochete e moda festival para aguentar o dia inteiro.", MELI, "Ver Essenciais de Festival", ""),
        ],
        "faq": [
            ("Quando é o Rock in Rio 2026?", "Nos dias 4, 5, 6, 7, 11, 12 e 13 de setembro de 2026, na Cidade do Rock, no Rio de Janeiro."),
            ("Onde fica a Cidade do Rock?", "No Parque Olímpico, na Barra da Tijuca, Zona Oeste do Rio de Janeiro."),
            ("Que horas abrem os portões?", "Às 14h nos dias de festival. A programação dos palcos começa à tarde e vai até a madrugada."),
            ("Dá para assistir sem ir ao festival?", "Sim: o Globoplay disponibiliza sinal aberto e a TV Globo exibe momentos do festival na programação."),
        ],
        "ld_event": {"name": "Rock in Rio 2026", "startDate": "2026-09-04", "endDate": "2026-09-13",
                     "location_name": "Cidade do Rock — Parque Olímpico", "address": "Barra da Tijuca, Rio de Janeiro, Brasil",
                     "description": "Dias 4, 5, 6, 7, 11, 12 e 13 de setembro de 2026."},
    },
    {
        "slug": "natal-luz-2026",
        "badge": "41ª edição · 22 de outubro de 2026 a 17 de janeiro de 2027",
        "title": "Natal Luz Gramado 2026/2027 — Programação, Hotéis e Ingressos",
        "description": "Natal Luz Gramado 2026/2027 (41ª edição, 22/out a 17/jan, 88 dias): Grande Desfile, Nativitaten, shows gratuitos, hotéis e ingressos.",
        "h1": "✨ Natal Luz de Gramado 2026 — Guia Completo",
        "sub": "O maior e mais longo festival de Natal do mundo: 88 dias de espetáculos, desfiles e shows gratuitos na Serra Gaúcha.",
        "facts": [
            ("Datas", "22 de outubro de 2026 a 17 de janeiro de 2027 (88 dias)"),
            ("Edição", "41ª edição — recorde mundial de festival natalino mais longo"),
            ("Espetáculos pagos", "Grande Desfile de Natal, Nativitaten, O Brilho do Natal e Natal Luz in Concert"),
            ("Atrações gratuitas", "Mais de 400 atrações gratuitas espalhadas pela cidade"),
            ("Local", "Gramado, Serra Gaúcha, RS"),
            ("Site oficial", '<a class="ext" href="https://www.natalluzdegramado.com.br/" target="_blank" rel="noopener">natalluzdegramado.com.br</a>'),
        ],
        "tips": [
            "São 88 dias seguidos de programação — dá para escolher entre outubro (mais tranquilo), dezembro (clímax) e janeiro (encerramento).",
            "Os espetáculos pagos mais procurados são o Grande Desfile de Natal e o Nativitaten; em 2026 há duas estreias: O Brilho do Natal e Natal Luz in Concert.",
            "Compre ingressos com pelo menos dois meses de antecedência para datas entre outubro e dezembro — os melhores lugares esgotam.",
            "A cidade inteira vira cenário: Rua Coberta, Avenida Borges de Medeiros, Lago Negro e Vila de Natal ganham decoração e shows gratuitos.",
            "Reserve hotel cedo: a ocupação de Gramado e Canela passa de 95% nos fins de semana de dezembro.",
            "Chegue pelos aeroportos de Porto Alegre ou Caxias do Sul e suba a serra de carro, transfer ou ônibus.",
        ],
        "cards": [
            ("🏨 Hotéis e Pousadas em Gramado", "A alta temporada esgota as vagas até outubro. Compare ofertas com cancelamento grátis.", f"{AD}?brand=booking&site=aquitemachadinhos&slot=gramado_hotel", "Ver Hotéis em Gramado (Booking.com)", "btn-gold"),
            ("🚗 Aluguel de Carros (Porto Alegre / Caxias)", "Desça no aeroporto de Porto Alegre ou Caxias do Sul e suba a serra gaúcha com conforto.", f"{AD}?brand=carla&site=aquitemachadinhos&slot=gramado_car", "Alugar Carro na Serra Gaúcha (Carla)", "btn-green"),
            ("🧣 Roupas de Frio e Chocolates", "Mundo de Chocolate e lojas da serra: prepare-se para o frio e traga lembranças.", MELI, "Ver Cupons de Moda Inverno e Viagem", ""),
        ],
        "faq": [
            ("Quando começa e termina o Natal Luz 2026?", "Começa em 22 de outubro de 2026 e termina em 17 de janeiro de 2027 — 88 dias de programação ininterrupta."),
            ("Quais são os espetáculos pagos?", "Grande Desfile de Natal, Nativitaten e as estreias O Brilho do Natal e Natal Luz in Concert, além de mais de 400 atrações gratuitas."),
            ("Com quanta antecedência comprar ingressos?", "Pelo menos dois meses antes para outubro–dezembro; hotéis e voos também esgotam cedo."),
            ("Como chegar a Gramado?", "Pelos aeroportos de Porto Alegre ou Caxias do Sul, seguindo de carro, transfer ou ônibus serra acima."),
            ("Guia da cidade", 'Veja também o nosso <a class="ext" href="/o-que-fazer-em-gramado">guia do que fazer em Gramado</a>.'),
        ],
        "ld_event": {"name": "Natal Luz de Gramado 2026", "startDate": "2026-10-22", "endDate": "2027-01-17",
                     "location_name": "Gramado", "address": "Gramado, Rio Grande do Sul, Brasil"},
    },
    {
        "slug": "o-que-fazer-em-gramado",
        "badge": "Guia perene · Serra Gaúcha",
        "title": "O que Fazer em Gramado — Roteiro, Atrações, Hotéis e Quando Ir",
        "description": "Guia do que fazer em Gramado: Lago Negro, Mini Mundo, Rua Coberta, Snowland, Cascata do Caracol, roteiro de 4 dias, hotéis e melhor época.",
        "h1": "🏔️ O que Fazer em Gramado — Guia Completo",
        "sub": "Roteiro testado da Serra Gaúcha: atrações imperdíveis, quando ir, onde ficar e como economizar.",
        "facts": [
            ("Onde fica", "Serra Gaúcha, RS — a ~115 km de Porto Alegre"),
            ("Atrações clássicas", "Lago Negro, Mini Mundo, Rua Coberta, Palácio dos Festivais"),
            ("Para famílias", "Snowland, Mundo de Chocolate, Alpen Park (Canela)"),
            ("Natureza", "Cascata do Caracol (Canela), Lago Joaquina Rita Bier, Belvedere do Belvedere"),
            ("Bate-voltas", "Canela, Nova Petrópolis, Bento Gonçalves (Maria Fumaça), Rota dos Vinhedos"),
            ("Evento maior", '<a class="ext" href="/natal-luz-2026">Natal Luz de Gramado 2026</a> (22/out–17/jan)'),
        ],
        "tips": [
            "Roteiro de 4 dias: dia 1 — Rua Coberta, Borges de Medeiros, Lago Negro e Mini Mundo; dia 2 — Snowland e fábricas de chocolate; dia 3 — Canela (Cascata do Caracol, Bondinhos Aéreos); dia 4 — Rota dos Vinhedos ou Maria Fumaça.",
            "Quando ir: Natal Luz (22/out–17/jan) para a magia do Natal; inverno (jun–ago) para o frio e fondues; baixa temporada (mar–mai) para preços menores.",
            "Lago Negro rende o cartão-postal clássico (pedalinhos e árvores importadas da Floresta Negra); Mini Mundo encanta crianças e adultos.",
            "A Rua Coberta concentra bares e restaurantes — programe ao menos um jantar de fondue ou café colonial.",
            "Canela fica a minutos de Gramado: Cascata do Caracol, Catedral de Pedra e Bondinhos Aéreos valem o dia.",
            "Reserve hotel com antecedência em feriados, inverno e Natal Luz; fora de pico dá para negociar diárias menores.",
        ],
        "cards": [
            ("🏨 Hotéis e Pousadas em Gramado", "Do centro à tranquilidade dos bairros: compare ofertas com cancelamento grátis.", f"{AD}?brand=booking&site=aquitemachadinhos&slot=gramado_hotel", "Ver Hotéis em Gramado (Booking.com)", "btn-gold"),
            ("🚗 Aluguel de Carros na Serra", "Gramado + Canela + vinhedos pedem carro: alugue em Porto Alegre ou Caxias do Sul.", f"{AD}?brand=carla&site=aquitemachadinhos&slot=gramado_guia_car", "Alugar Carro na Serra (Carla)", "btn-green"),
            ("🍫 Chocolates e Lembranças", "Chocolates artesanais, malhas, vinhos e lembranças da Serra Gaúcha.", MELI, "Ver Ofertas da Serra Gaúcha", ""),
        ],
        "faq": [
            ("Quantos dias ficar em Gramado?", "Quatro dias cobrem o essencial (Gramado + Canela); com 6–7 dias dá para incluir vinhedos e Maria Fumaça."),
            ("Qual a melhor época para ir a Gramado?", "Depende do objetivo: Natal Luz (out–jan) para festa, inverno (jun–ago) para frio, baixa temporada para economia."),
            ("O que fazer em Gramado com chuva?", "Snowland, Mundo de Chocolate, museus, cinemas, cafés coloniais e compras na Borges de Medeiros."),
            ("Vale combinar Gramado com Canela?", "Sim — ficam a poucos minutos uma da outra e dividem atrações como a Cascata do Caracol e os Bondinhos."),
        ],
        "ld_destination": {"name": "Gramado", "address": "Gramado, Rio Grande do Sul, Brasil"},
    },
    {
        "slug": "black-friday-2026-cupons",
        "badge": "27 de novembro de 2026 · Brasil todo (online e lojas)",
        "title": "Black Friday 2026 — Data, Cupons, Ofertas e Como Economizar",
        "description": "Black Friday 2026 no Brasil (27 de novembro): cupons, ofertas reais em eletrônicos, eletrodomésticos e moda, e guia anti-golpe.",
        "h1": "🛒 Black Friday 2026 — Data, Cupons e Guia Anti-Golpe",
        "sub": "A maior data do varejo brasileiro: 27 de novembro de 2026. Aprenda a separar desconto real de maquiagem de preço.",
        "facts": [
            ("Data oficial", "27 de novembro de 2026 (última sexta-feira de novembro)"),
            ("Onde", "Lojas online e físicas em todo o Brasil"),
            ("Categorias quentes", "Eletrônicos, eletrodomésticos, celulares, moda, beleza e games"),
            ("Esquenta", "Ofertas de aquecimento costumam começar dias antes — monte sua lista cedo"),
            ("Regra de ouro", "Compare o histórico de preços antes de comprar (veja o guia abaixo)"),
        ],
        "tips": [
            "A Black Friday 2026 cai em 27 de novembro, última sexta-feira do mês — mas as ofertas de aquecimento começam dias antes.",
            "Desconto real se prova com histórico: acompanhe o preço do produto por semanas antes de novembro e desconfie de quedas milagrosas de última hora.",
            "Monte a lista com antecedência, defina o preço-alvo de cada item e priorize o que você já ia comprar mesmo sem promoção.",
            "Some cupons + cashback + frete grátis: o melhor preço quase sempre vem da combinação, não do banner.",
            "Cuidado com golpes: confira o CNPJ da loja, evite boletos e Pix para desconhecidos, e desconfie de preços muito abaixo do mercado.",
            "Eletrônicos e eletrodomésticos costumam ter as maiores quedas reais; moda e beleza rendem bons achados com cupons cumulativos.",
        ],
        "cards": [
            ("🛍️ Ofertas no Mercado Livre", "Eletrônicos, eletrodomésticos e milhares de vendedores com reputação e Mercado Pago.", MELI, "Ver Ofertas (Mercado Livre)", "btn-gold"),
            ("📦 Achados na Shopee", "Cupons diários, frete grátis e achadinhos de beleza, casa e moda.", SHOPEE, "Ver Achadinhos (Shopee)", "btn-green"),
        ],
        "editorial_card": ("🛡️ Guia Anti-Golpe (grátis)", "Antes de comprar: histórico de preços, CNPJ da loja, reputação do vendedor e regras de troca. Desconto bom é desconto comprovado."),
        "faq": [
            ("Quando é a Black Friday 2026?", "Em 27 de novembro de 2026, última sexta-feira de novembro, com ofertas de aquecimento nos dias anteriores."),
            ("Como saber se o desconto é real?", "Acompanhando o histórico de preços do produto por semanas. Queda real aparece contra o preço médio, não contra o preço cheio de etiqueta."),
            ("Vale comprar eletrônicos na Black Friday?", "Sim — eletrônicos, eletrodomésticos e celulares costumam ter as maiores quedas reais do ano, somando cupons e cashback."),
            ("Quais cuidados contra golpes?", "Verificar CNPJ e reputação da loja, evitar pagamentos fora da plataforma, desconfiar de preços irreais e guardar prints do anúncio."),
        ],
        "ld_event": {"name": "Black Friday Brasil 2026", "startDate": "2026-11-27", "endDate": "2026-11-27",
                     "location_name": "Brasil (online e lojas físicas)", "address": "Brasil",
                     "type": "SaleEvent"},
    },
]


def build_ld(page, url):
    scripts = []
    if "ld_event" in page:
        e = page["ld_event"]
        ev = {
            "@context": "https://schema.org",
            "@type": e.get("type", "Event"),
            "name": e["name"],
            "startDate": e["startDate"],
            "endDate": e.get("endDate", e["startDate"]),
            "eventStatus": "https://schema.org/EventScheduled",
            "url": url,
            "location": {
                "@type": "Place",
                "name": e["location_name"],
                "address": e["address"],
            },
            "description": page["description"],
        }
        if "organizer" in e:
            ev["organizer"] = {"@type": "Organization", "name": e["organizer"]}
        scripts.append(ev)
    if "ld_destination" in page:
        d = page["ld_destination"]
        scripts.append({
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            "name": d["name"],
            "url": url,
            "description": page["description"],
            "address": d["address"],
        })
    scripts.append({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in page["faq"]
        ],
    })
    return "\n".join(
        '  <script type="application/ld+json">\n  ' + json.dumps(s, ensure_ascii=False) + "\n  </script>"
        for s in scripts
    )


def build_html(page):
    url = f"{SITE}/{page['slug']}"
    facts = "\n".join(
        f'      <div><dt>{k}</dt><dd><strong>{v}</strong></dd></div>' for k, v in page["facts"]
    )
    tips = "\n".join(f"      <li>{t}</li>" for t in page["tips"])
    cards = []
    for emoji_title, desc, href, cta, cls in page["cards"]:
        klass = "btn " + cls if cls else "btn"
        cards.append(
            f"""      <div class="card">
        <h3>{emoji_title}</h3>
        <p>{desc}</p>
        <a href="{href}" class="{klass}" rel="sponsored noopener noreferrer nofollow">{cta}</a>
      </div>"""
        )
    if "editorial_card" in page:
        t, d = page["editorial_card"]
        cards.append(
            f"""      <div class="card">
        <h3>{t}</h3>
        <p>{d}</p>
      </div>"""
        )
    cards_html = "\n".join(cards)
    faqs = "\n".join(
        f'    <details class="faq"><summary>{q}</summary><p>{a}</p></details>' for q, a in page["faq"]
    )
    ld = build_ld(page, url)
    return f"""<!DOCTYPE html>
<!-- gerado por scripts/etapa8_events.py (ETAPA 8.1) — NÃO EDITAR À MÃO; rode o gerador -->
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>{page['title']} | Aqui Tem Achadinhos</title>
  <link rel="canonical" href="{url}"/>
  <meta name="description" content="{page['description']}"/>
  <meta name="robots" content="index, follow, max-image-preview:large"/>
  <meta property="og:type" content="article"/>
  <meta property="og:title" content="{page['title']}"/>
  <meta property="og:description" content="{page['description']}"/>
  <meta property="og:url" content="{url}"/>
  <meta property="og:site_name" content="Aqui Tem Achadinhos"/>
  <meta name="twitter:card" content="summary"/>
{CSS}
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5604700207394147" crossorigin="anonymous"></script>
{ld}
</head>
<body>
  <div class="container">
    <header>
      <span class="badge">{page['badge']}</span>
      <h1>{page['h1']}</h1>
      <p>{page['sub']}</p>
      <p class="mut">Atualizado em {ATUALIZADO} · Sempre confirme datas e preços no site oficial do evento.</p>
    </header>

    <h2>📌 O essencial</h2>
    <dl class="facts">
{facts}
    </dl>

    <h2>🧭 O que você precisa saber</h2>
    <ul class="tips">
{tips}
    </ul>

    <h2>🎟️ Planeje sua ida</h2>
    <div class="grid">
{cards_html}
    </div>

    <h2>❓ Perguntas frequentes</h2>
{faqs}
  </div>
{SCRIPTS}
{PIXELS}
{DISCLOSURE}
</body>
</html>
"""


def main():
    check = "--check" in sys.argv
    changed, mismatched = [], []
    for page in PAGES:
        path = PUB / (page["slug"] + ".html")
        html = build_html(page)
        if not path.exists() or path.read_text(encoding="utf-8") != html:
            if check:
                mismatched.append(path.name)
            else:
                path.write_text(html, encoding="utf-8")
                changed.append(path.name)
    if check:
        if mismatched:
            print("DIVERGENTES:", ", ".join(mismatched))
            return 1
        print(f"OK — {len(PAGES)} páginas idênticas ao gerador")
        return 0
    print(f"Geradas/atualizadas: {len(changed)} de {len(PAGES)}" + (f" ({', '.join(changed)})" if changed else " (0 mudanças — idempotente)"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
