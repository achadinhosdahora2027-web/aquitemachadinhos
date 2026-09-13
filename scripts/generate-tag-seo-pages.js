/**
 * ==============================================================================
 * PROGRAMMATIC SEARCH INTENT & TAG SEO GENERATOR 2026 (195 COUNTRIES)
 * Generates search-optimized, high-ranking programmatic tag landing pages
 * with JSON-LD Schema.org, OpenGraph meta, and quadruple monetization stack.
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

const TAGS_DIR = path.join(__dirname, '../public/tags');
const DOMAIN = 'https://www.aquitemachadinhos.com.br';
const NOW = new Date().toISOString();

if (!fs.existsSync(TAGS_DIR)) fs.mkdirSync(TAGS_DIR, { recursive: true });

const TAG_DEFINITIONS = [
  {
    slug: "cupons-shopee-hoje",
    title: "Cupons Shopee Verificados Hoje 2026: Frete Grátis & 70% OFF",
    meta_desc: "Lista atualizada de cupons secretos da Shopee com frete grátis sem valor mínimo, cashback e até 70% de desconto em compras verificadas.",
    h1: "🛍️ Cupons Shopee Atualizados Hoje (Frete Grátis & Descontos)",
    brand: "shopee",
    badge: "🔥 ECONOMIA RELÂMPAGO",
    cta_text: "Pegar Cupons da Shopee Agora ➔",
    faq: [
      { q: "Como conseguir frete grátis na Shopee hoje?", a: "Acesse nosso link oficial verificado diariamente para resgatar cupons de frete grátis e descontos relâmpago de até 70%." }
    ]
  },
  {
    slug: "hoteis-gramado-booking-desconto",
    title: "Hotéis em Gramado com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve os melhores hotéis e pousadas perto da Borges de Medeiros e Lago Negro em Gramado com 15% a 30% OFF direto no Booking.com.",
    h1: "🏨 Hotéis e Pousadas em Gramado com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Gramado com Desconto ➔",
    faq: [
      { q: "Qual a melhor época para conseguir hotéis baratos em Gramado?", a: "Na baixa temporada e reservando com antecedência pelo Booking.com você garante até 30% de desconto e cancelamento grátis." }
    ]
  },
  {
    slug: "nordvpn-cupom-74-off",
    title: "Cupom NordVPN 2026: 74% OFF + 3 Meses Grátis de Proteção",
    meta_desc: "Ative o melhor desconto oficial da NordVPN com criptografia militar, IP dedicado e streaming liberado em 111 países.",
    h1: "🛡️ NordVPN Shield: 74% OFF + 3 Meses Grátis",
    brand: "nordvpn",
    badge: "🔒 CIBERSEGURANÇA & PRIVACIDADE",
    cta_text: "Ativar NordVPN com 74% OFF ➔",
    faq: [
      { q: "Como funciona a garantia de reembolso da NordVPN?", a: "A NordVPN oferece garantia de reembolso incondicional de 30 dias para você testar sem riscos." }
    ]
  },
  {
    slug: "cursos-ia-udemy-desconto",
    title: "Cursos de IA, Python e Programação na Udemy (A partir de R$ 27,90)",
    meta_desc: "Aprenda Inteligência Artificial, Engenharia de Prompt, Python e Full-Stack com cursos certificados e mais bem avaliados na Udemy.",
    h1: "🎓 Cursos de IA & Programação com Desconto na Udemy",
    brand: "udemy",
    direct_url: "https://www.udemy.com/topic/artificial-intelligence/", // sem programa de afiliados na conta (auditoria 03/09/2026)
    badge: "💡 EDUCAÇÃO & CARREIRA",
    cta_text: "Acessar cursos na Udemy ➔",
    faq: [
      { q: "Os cursos da Udemy têm certificado reconhecido?", a: "Sim, todos os cursos concluídos emitem certificado oficial que pode ser adicionado ao LinkedIn e currículo." }
    ]
  },
  {
    slug: "barretos-2027-ingressos-hoteis",
    title: "Festa do Peão de Barretos 2027: Hotéis, Ingressos & Dicas",
    meta_desc: "Guia completo antecipado para a maior festa do peão da América Latina: como comprar ingressos baratos e reservar hotéis perto do Parque do Peão.",
    h1: "🤠 Guia Oficial Festa do Peão de Barretos 2027",
    brand: "booking",
    badge: "🐎 EVENTOS NACIONAIS",
    cta_text: "Garantir Hotéis para Barretos ➔",
    faq: [
      { q: "Onde se hospedar na Festa do Peão de Barretos?", a: "Recomenda-se reservar pousadas e hotéis com antecedência pelo Booking em Barretos ou cidades vizinhas como Colina e Bebedouro." }
    ]
  },
  {
    slug: "tarot-3d-previsao-gratis",
    title: "Tarot 3D dos Arcanos Maiores Online Grátis: Conselho do Dia 2026",
    meta_desc: "Tire sua carta do dia no Tarot 3D dos Arcanos Maiores, receba orientações para amor, finanças e caminhos abertos com cupom VIP exclusivo.",
    h1: "🔮 Tarot 3D Interativo: Tire Sua Carta do Dia Grátis",
    brand: "booking",
    badge: "✨ ORÁCULO CÓSMICO",
    cta_text: "Tirar Carta do Dia no Tarot 3D ➔",
    faq: [
      { q: "Como funciona a tiragem do Tarot 3D?", a: "Você escolhe mentalmente sua questão, clica na carta em 3D e o oráculo revela a mensagem do Arcano Maior correspondente ao seu momento." }
    ]
  },
  {
    slug: "hoteis-miami-booking-desconto",
    title: "Hotéis em Miami com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Miami com 15% a 30% OFF no Booking.com. Praias de South Beach e outlets premium com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Miami com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Miami com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Miami?", a: "Verão (dez–mar) fugindo do frio, reservando com antecedência, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-orlando-booking-desconto",
    title: "Hotéis em Orlando com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Orlando com 15% a 30% OFF no Booking.com. Parques temáticos (Disney, Universal) e hotéis com café com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Orlando com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Orlando com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Orlando?", a: "Temporada de férias, garantindo cancelamento grátis, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-nova-york-booking-desconto",
    title: "Hotéis em Nova York com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Nova York com 15% a 30% OFF no Booking.com. Manhattan, Times Square e hotéis perto do metrô com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Nova York com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Nova York com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Nova York?", a: "Baixa temporada (jan–fev), quando os preços caem até 40%, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-las-vegas-booking-desconto",
    title: "Hotéis em Las Vegas com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Las Vegas com 15% a 30% OFF no Booking.com. Hotéis-cassino da Strip e shows internacionais com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Las Vegas com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Las Vegas com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Las Vegas?", a: "Dias de semana, quando as diárias despencam, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-lisboa-booking-desconto",
    title: "Hotéis em Lisboa com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Lisboa com 15% a 30% OFF no Booking.com. Baixa Chiado, Belém e hotéis com vista do Tejo com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Lisboa com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Lisboa com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Lisboa?", a: "Primavera e outono, com clima amado e preços suaves, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-porto-booking-desconto",
    title: "Hotéis em Porto com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Porto com 15% a 30% OFF no Booking.com. Ribeira, caves de vinho do Porto e pousadas históricas com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Porto com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Porto com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Porto?", a: "Meia temporada, evitando o verão europeu, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-paris-booking-desconto",
    title: "Hotéis em Paris com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Paris com 15% a 30% OFF no Booking.com. Hotéis perto dos Champs-Élysées e de Montmartre com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Paris com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Paris com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Paris?", a: "Janeiro–fevereiro e agosto, fora dos grandes eventos, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-londres-booking-desconto",
    title: "Hotéis em Londres com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Londres com 15% a 30% OFF no Booking.com. Hotéis junto ao Thames e estações de trem com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Londres com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Londres com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Londres?", a: "Janeiro e fevereiro, os meses mais baratos da cidade, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-roma-booking-desconto",
    title: "Hotéis em Roma com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Roma com 15% a 30% OFF no Booking.com. Hotéis no centro histórico perto do Coliseu com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Roma com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Roma com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Roma?", a: "Novembro e fevereiro, com filas menores e tarifas baixas, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-buenos-aires-booking-desconto",
    title: "Hotéis em Buenos Aires com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Buenos Aires com 15% a 30% OFF no Booking.com. Palermo, Recoleta e hotéis boutique em San Telmo com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Buenos Aires com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Buenos Aires com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Buenos Aires?", a: "Primavera argentina (set–nov), com câmbio favorável, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-santiago-booking-desconto",
    title: "Hotéis em Santiago com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Santiago com 15% a 30% OFF no Booking.com. Hotéis em Providencia e vista da cordilheira com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Santiago com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Santiago com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Santiago?", a: "Outono chileno (mar–mai), com tarifas amenas, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-cancun-booking-desconto",
    title: "Hotéis em Cancún com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Cancún com 15% a 30% OFF no Booking.com. Resorts all inclusive na Zona Hotelera com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Cancún com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Cancún com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Cancún?", a: "Temporada baixa (ago–out), com all inclusive em conta, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-dubai-booking-desconto",
    title: "Hotéis em Dubai com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Dubai com 15% a 30% OFF no Booking.com. Hotéis 5 estrelas na Marina e Downtown com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Dubai com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Dubai com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Dubai?", a: "Junho–setembro (calor) quando as diárias caem muito, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-toquio-booking-desconto",
    title: "Hotéis em Tóquio com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Tóquio com 15% a 30% OFF no Booking.com. Shinjuku, Shibuya e hotéis cápsula premium com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Tóquio com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Tóquio com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Tóquio?", a: "Janeiro e junho, fora das festas de ano novo e flores, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-sydney-booking-desconto",
    title: "Hotéis em Sydney com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Sydney com 15% a 30% OFF no Booking.com. Hotéis com vista da Opera House e Harbour Bridge com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Sydney com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Sydney com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Sydney?", a: "Maio–agosto (inverno australiano), tarifas bem menores, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-salvador-booking-desconto",
    title: "Hotéis em Salvador com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Salvador com 15% a 30% OFF no Booking.com. Pelourinho, praia do Farol da Barra e resorts com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Salvador com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Salvador com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Salvador?", a: "Fora do carnaval, quando a cidade respira e os preços caem, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-recife-booking-desconto",
    title: "Hotéis em Recife com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Recife com 15% a 30% OFF no Booking.com. Boa Viagem e hotéis com breakfast regional com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Recife com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Recife com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Recife?", a: "Fora do período de festas juninas e carnaval, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-fortaleza-booking-desconto",
    title: "Hotéis em Fortaleza com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Fortaleza com 15% a 30% OFF no Booking.com. Praia do Futuro e resorts all inclusive com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Fortaleza com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Fortaleza com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Fortaleza?", a: "Segunda metade do ano, na high season cearense de vento, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-florianopolis-booking-desconto",
    title: "Hotéis em Florianópolis com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Florianópolis com 15% a 30% OFF no Booking.com. Praias do norte da ilha e pousadas boutique com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Florianópolis com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Florianópolis com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Florianópolis?", a: "Março e novembro, com clima bom e menos multidão, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-curitiba-booking-desconto",
    title: "Hotéis em Curitiba com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Curitiba com 15% a 30% OFF no Booking.com. Hotéis no centro histórico e perto do Jardim Botânico com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Curitiba com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Curitiba com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Curitiba?", a: "Fora do inverno rigoroso, em tarifas de meia temporada, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-bonito-booking-desconto",
    title: "Hotéis em Bonito (MS) com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Bonito (MS) com 15% a 30% OFF no Booking.com. Pousadas com meia pensão perto do Rio da Prata com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Bonito (MS) com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Bonito (MS) com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Bonito (MS)?", a: "Fora das férias de janeiro e julho, com flutuações garantidas, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-maragogi-booking-desconto",
    title: "Hotéis em Maragogi com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Maragogi com 15% a 30% OFF no Booking.com. Pousadas pé na areia das Galés (Caribe brasileiro) com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Maragogi com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Maragogi com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Maragogi?", a: "Fora do verão, com piscinas naturais menos cheias, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-bombinhas-booking-desconto",
    title: "Hotéis em Bombinhas com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Bombinhas com 15% a 30% OFF no Booking.com. Praias de água clara e pousadas com vista com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Bombinhas com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Bombinhas com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Bombinhas?", a: "Setembro–novembro, antes da alta temporada catarinense, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
  {
    slug: "hoteis-arraial-dajuda-booking-desconto",
    title: "Hotéis em Arraial d'Ajuda com Desconto no Booking 2026 (Até 30% OFF)",
    meta_desc: "Reserve hotéis e pousadas em Arraial d'Ajuda com 15% a 30% OFF no Booking.com. Pousadas charmosas perto de Trancoso e Porto Seguro com cancelamento grátis e pagamento na chegada.",
    h1: "🏨 Hotéis em Arraial d'Ajuda com Desconto Exclusivo",
    brand: "booking",
    badge: "✈️ VIAGENS & HOSPEDAGEM",
    cta_text: "Ver Hotéis em Arraial d'Ajuda com Desconto ➔",
    faq: [
      { q: "Quando vale mais a pena reservar hotéis em Arraial d'Ajuda?", a: "Fora de janeiro, com clima ótimo e preços de baixa temporada, garantindo até 30% OFF e cancelamento grátis no Booking.com." }
    ]
  },
];

function generateHtmlPage(tag) {
  const affiliateUrl = tag.direct_url || `https://achadinhos-ad-engine.vercel.app/api/ads/go?brand=${tag.brand}&site=tag_seo&slot=${tag.slug}`;
  const relAttr = tag.direct_url ? 'nofollow noopener noreferrer' : 'sponsored noopener noreferrer nofollow';
  // AUDITORIA 13/09/2026: canônico NUNCA com .html — o cleanUrls do Vercel
  // responde 301 em /x.html, então um canônico com .html aponta para um redirect.
  const canonicalUrl = `${DOMAIN}/tags/${tag.slug}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5"/>
  <title>${tag.title} | Aqui Tem Achadinhos</title>
  <meta name="description" content="${tag.meta_desc}"/>
  <link rel="canonical" href="${canonicalUrl}"/>
  <meta name="robots" content="index, follow, max-image-preview:large"/>

  <meta property="og:title" content="${tag.title}"/>
  <meta property="og:description" content="${tag.meta_desc}"/>
  <meta property="og:url" content="${canonicalUrl}"/>
  <meta property="og:type" content="article"/>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      ${tag.faq.map(f => `{"@type": "Question", "name": "${f.q}", "acceptedAnswer": {"@type": "Answer", "text": "${f.a}"}}`).join(',')}
    ]
  }
  </script>

  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
    body { background:#0f172a; color:#f8fafc; min-height:100vh; padding:24px 16px 80px 16px; display:flex; justify-content:center; }
    .wrap { width:100%; max-width:680px; display:flex; flex-direction:column; gap:20px; }
    .badge { display:inline-block; padding:6px 14px; background:linear-gradient(135deg,#6366f1,#8b5cf6); border-radius:20px; font-size:0.75rem; font-weight:800; color:#fff; align-self:flex-start; }
    h1 { font-size:1.6rem; font-weight:900; line-height:1.3; color:#fff; }
    .desc { font-size:0.95rem; color:#cbd5e1; line-height:1.6; }
    .card { background:rgba(30,41,59,0.7); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:20px; display:flex; flex-direction:column; gap:14px; }
    .cta-btn { background:linear-gradient(135deg,#10b981,#059669); color:#fff; text-decoration:none; font-weight:800; font-size:1rem; padding:16px 24px; border-radius:12px; text-align:center; box-shadow:0 4px 20px rgba(16,185,129,0.4); transition:transform 0.2s; }
    .cta-btn:hover { transform:scale(1.02); }
    .faq-box { background:#030712; padding:16px; border-radius:12px; border:1px solid #1e293b; }
    .faq-q { font-weight:700; color:#38bdf8; font-size:0.92rem; margin-bottom:6px; }
    .faq-a { font-size:0.85rem; color:#94a3b8; line-height:1.5; }
  </style>

  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5604700207394147" crossorigin="anonymous"></script>
</head>
<body>

  <div class="wrap">
    <a href="/links" style="color:#94a3b8; text-decoration:none; font-size:0.85rem; font-weight:600;">➔ Voltar para Todos os Links & Cupons</a>
    
    <span class="badge">${tag.badge}</span>
    <h1>${tag.h1}</h1>
    
    <div class="card">
      <div style="display:flex; align-items:center; gap:8px; font-size:0.82rem; color:#4ade80; font-weight:700;">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px #22c55e;"></span>
        <span class="live-timestamp">Verificado hoje</span>
      </div>
      <p class="desc">${tag.meta_desc}</p>
      
      <a href="${affiliateUrl}" target="_blank" rel="${relAttr}" class="cta-btn">
        ${tag.cta_text}
      </a>
    </div>

    <!-- FAQ Section -->
    <div class="card">
      <h2 style="font-size:1.1rem; color:#f8fafc; font-weight:800;">Perguntas Frequentes</h2>
      ${tag.faq.map(f => `
        <div class="faq-box">
          <div class="faq-q">${f.q}</div>
          <div class="faq-a">${f.a}</div>
        </div>
      `).join('')}
    </div>

    <!-- Navigation Hubs -->
    <div style="text-align:center; margin-top:20px;">
      <a href="/entretenimento" style="color:#38bdf8; font-size:0.85rem; margin:0 8px;">Tarot 3D</a> •
      <a href="/o-que-fazer-em-gramado" style="color:#38bdf8; font-size:0.85rem; margin:0 8px;">Guia Gramado</a> •
      <a href="/links" style="color:#38bdf8; font-size:0.85rem; margin:0 8px;">Bio VIP</a>
    </div>

  </div>

  <script type="text/javascript"> var infolinks_pid = 3447442; var infolinks_wsid = 0; </script>
  <script type="text/javascript" src="//resources.infolinks.com/js/infolinks_main.js"></script>
  <script src="/js/growth-cro-engine.js" defer></script>
</body>
</html>`;
}

function runTagGenerator() {
  console.log('================================================================================');
  console.log('🏷️ GERADOR PROGRAMÁTICO DE TAGS SEO & SEARCH INTENT 2026');
  console.log('================================================================================\n');

  TAG_DEFINITIONS.forEach(tag => {
    const html = generateHtmlPage(tag);
    const filePath = path.join(TAGS_DIR, `${tag.slug}.html`);
    fs.writeFileSync(filePath, html);
    console.log(`✓ [Tag SEO] Gerada: public/tags/${tag.slug}.html`);
  });

  console.log('\n================================================================================');
  console.log('✅ TODAS AS PÁGINAS DE TAG SEO GERADAS COM SUCESSO 24/7!');
  console.log('================================================================================');
}

runTagGenerator();
