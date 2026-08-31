/**
 * ==============================================================================
 * AUTOMATED SOCIAL SYNDICATION & PINTEREST RSS FEED GENERATOR (24/7 PIPELINE)
 * Generates automated Pinterest RSS feeds and Telegram broadcast JSON payloads
 * to compress social distribution and indexation cycles from months to days.
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://www.aquitemachadinhos.com.br';
const FEEDS_DIR = path.join(__dirname, '../public/feeds');
const NOW = new Date().toUTCString();

if (!fs.existsSync(FEEDS_DIR)) {
  fs.mkdirSync(FEEDS_DIR, { recursive: true });
}

const VIRAL_CARDS = [
  {
    title: "Tarot 3D dos Arcanos Maiores & Conselho do Dia 2026",
    link: `${DOMAIN}/entretenimento.html#tarot`,
    description: "Tire sua carta do dia no Tarot 3D interativo! Descubra previsões cósmicas para amor, finanças e caminhos abertos com cupom de desconto exclusivo.",
    image: `${DOMAIN}/favicon.ico`,
    category: "Astrologia & Espiritualidade"
  },
  {
    title: "Guia Oficial Natal Luz Gramado 2026: Hotéis & Descontos",
    link: `${DOMAIN}/natal-luz-2026.html`,
    description: "Programação completa, melhores hotéis perto da Borges de Medeiros e cupom de 15% OFF no Booking e aluguel de carros Carla.",
    image: `${DOMAIN}/favicon.ico`,
    category: "Viagens & Turismo"
  },
  {
    title: "Calculadora de Compatibilidade Astrológica 2026 (144 Combinações)",
    link: `${DOMAIN}/compatibilidade/aries-e-leao.html`,
    description: "Descubra a afinidade exata entre os signos no amor, química e futuro. Teste grátis agora e desbloqueie o Mapa Astral completo.",
    image: `${DOMAIN}/favicon.ico`,
    category: "Relacionamentos"
  },
  {
    title: "O Que Fazer em Gramado & Canela em 2026: Roteiro 4 Dias",
    link: `${DOMAIN}/o-que-fazer-em-gramado.html`,
    description: "Roteiro gastronômico e turístico completo pela Serra Gaúcha. Dicas secretas e cupons de passagens e hospedagem.",
    image: `${DOMAIN}/favicon.ico`,
    category: "Viagens"
  },
  {
    title: "Festa do Peão de Barretos 2027: Ingressos, Hotéis e Dicas",
    link: `${DOMAIN}/festa-do-peao-barretos-2027-ingressos.html`,
    description: "Guia antecipado com hotéis com desconto, rotas de transporte e como garantir ingressos para a maior festa do Brasil.",
    image: `${DOMAIN}/favicon.ico`,
    category: "Eventos"
  },
  {
    title: "Black Friday 2026: Radar Mundial de Cupons & Ofertas Secretas",
    link: `${DOMAIN}/black-friday-2026-cupons.html`,
    description: "Monitoramento em tempo real de promoções verificadas em eletrônicos, viagens, moda e produtos importados com cashback.",
    image: `${DOMAIN}/favicon.ico`,
    category: "Economia & Cupons"
  }
];

function generatePinterestRss() {
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Aqui Tem Achadinhos - Pins Oficiais & Ofertas 2026</title>
    <link>${DOMAIN}</link>
    <description>Feed diário automatizado com previsões astrológicas, achadinhos de viagens, cupons e guias interativos.</description>
    <language>pt-BR</language>
    <lastBuildDate>${NOW}</lastBuildDate>
`;

  VIRAL_CARDS.forEach(item => {
    rss += `    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <description><![CDATA[${item.description}]]></description>
      <category><![CDATA[${item.category}]]></category>
      <pubDate>${NOW}</pubDate>
      <media:content url="${item.image}" medium="image" />
    </item>\n`;
  });

  rss += `  </channel>
</rss>`;

  fs.writeFileSync(path.join(FEEDS_DIR, 'pinterest-pins.rss'), rss);
  console.log(`✓ Pinterest RSS gerado com sucesso: public/feeds/pinterest-pins.rss`);
}

function generateTelegramSyndicationJson() {
  const payload = {
    generated_at: NOW,
    network: "Aqui Tem Achadinhos Viral Network",
    total_campaigns: VIRAL_CARDS.length,
    broadcast_queue: VIRAL_CARDS.map(item => ({
      headline: item.title,
      target_url: item.link,
      telegram_caption: `🔥 *${item.title}*\n\n${item.description}\n\n👉 Acesse agora: ${item.link}`,
      whatsapp_message: `*${item.title}*\n${item.description}\n👉 ${item.link}`,
      category: item.category
    }))
  };

  fs.writeFileSync(path.join(FEEDS_DIR, 'telegram-broadcast.json'), JSON.stringify(payload, null, 2));
  console.log(`✓ Telegram Broadcast JSON gerado com sucesso: public/feeds/telegram-broadcast.json`);
}

function run() {
  console.log('--- GERANDO FEEDS DE SINCRONIZAÇÃO SOCIAL 24/7 ---');
  generatePinterestRss();
  generateTelegramSyndicationJson();
  console.log('--- PIPELINE SOCIAL CONCLUÍDO COM SUCESSO ---');
}

run();
