#!/usr/bin/env node
/**
 * ==============================================================================
 * INJETOR DO STACK DE MONETIZACAO  (idempotente)
 * ==============================================================================
 * ACHADO DA AUDITORIA DE 13/09/2026:
 *   O site tem 3.405 paginas HTML, mas apenas 318 (9,3%) tinham QUALQUER tag de
 *   monetizacao. As outras 3.087 — todas as paginas de cidade/pais geradas
 *   (/br/*, /it/*, /us/*, /compatibilidade/*) — carregavam apenas o
 *   affiliate-telemetry.js e os pixels da CJ. Ou seja: 90,7% do trafego do site
 *   nao via um unico anuncio e nao alimentava o motor de crescimento.
 *
 *   O workflow antigo anunciava "100% DAS PAGINAS BLINDADAS COM ADSENSE, MONETAG,
 *   INfolinks E GROWTH ENGINE" — era falso: 1 pagina tinha as 4 coisas juntas.
 *
 * O QUE ESTE SCRIPT FAZ:
 *   Insere, exatamente antes de </head>, as mesmas tags que as paginas boas ja
 *   usam — e somente na pagina que ainda nao tem cada uma:
 *       • AdSense  (ca-pub-5604700207394147)
 *       • Infolinks
 *       • Growth/CRO Engine (/js/growth-cro-engine.js)
 *   E, antes de </body>, o bloco Monetag (tags carregadas apos o conteudo para
 *   nao atrasar o LCP).
 *
 *   E idempotente: rodar duas vezes nao duplica tag nenhuma. Pagina que ja tem
 *   tudo e marcada como intacta e nao e reescrita (preserva mtime).
 *
 * Uso:
 *   node scripts/inject-monetization-stack.js            # aplica
 *   node scripts/inject-monetization-stack.js --check    # so mede, nao escreve
 *   node scripts/inject-monetization-stack.js --sample 5 # lista 5 exemplos
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const REPORT_FILE = path.join(__dirname, '..', 'data', 'monetization-injection-report.json');
const CHECK_ONLY = process.argv.includes('--check');
const SAMPLE = (() => {
  const i = process.argv.indexOf('--sample');
  return i > 0 && process.argv[i + 1] ? parseInt(process.argv[i + 1], 10) : 0;
})();

const ADSENSE = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5604700207394147" crossorigin="anonymous"></script>';
const INFOLINKS = '<script type="text/javascript" src="//resources.infolinks.com/js/infolinks_main.js"></script>';
const GROWTH = '<script src="/js/growth-cro-engine.js" defer></script>';
const MONETAG = [
  '<script data-cfasync="false" src="https://quge5.com/88/tag.min.js" data-zone="274860" async></script>',
  '<script data-cfasync="false" src="https://quge5.com/88/tag.min.js" data-zone="278800" async></script>'
].join('\n');

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

function hasAdsense(s) {
  return s.includes('adsbygoogle') || s.includes('googlesyndication');
}
function hasInfolinks(s) {
  return s.toLowerCase().includes('infolinks');
}
function hasGrowth(s) {
  return s.includes('growth-cro-engine.js');
}
function hasMonetag(s) {
  const l = s.toLowerCase();
  return l.includes('monetag') || l.includes('quge5.com') || l.includes('auqot.com');
}

function inject(file) {
  let s = fs.readFileSync(file, 'utf8');
  const before = { adsense: hasAdsense(s), infolinks: hasInfolinks(s), growth: hasGrowth(s), monetag: hasMonetag(s) };
  if (before.adsense && before.infolinks && before.growth && before.monetag) {
    return { file, changed: false, added: [] };
  }
  const added = [];

  /* ACHADO (bug do proprio injetor, corrigido aqui):
     `s.toLowerCase().lastIndexOf('</head>')` devolvia o indice DENTRO DA COPIA
     MINUSCULA, e essa copia nao tem necessariamente o mesmo comprimento do
     original — basta um caractere cujo lowercase mude de tamanho (ex.: 'İ'
     U+0130 -> 2 code points). O indice vinha 1 posicao adiante e a insercao
     caia ENTRE o '<' e o '/head>', produzindo "<<script ... /head>": o </head>
     era destruido em 35 paginas. Agora o indice e procurado no texto original
     com regex case-insensitive (i), que preserva as posicoes. */
  const lastIndexOfTag = (text, tag) => {
    const re = new RegExp('<\\/' + tag + '\\s*>', 'gi');
    let idx = -1, m;
    while ((m = re.exec(text)) !== null) { idx = m.index; if (m.index === re.lastIndex) re.lastIndex++; }
    return idx;
  };

  /* --- head: AdSense + Infolinks + Growth (na ordem das paginas originais) --- */
  const headEnd = lastIndexOfTag(s, 'head');
  if (headEnd === -1) return { file, changed: false, added: [], skipped: 'sem </head>' };

  const headBlock = [];
  if (!before.adsense) { headBlock.push(ADSENSE); added.push('adsense'); }
  if (!before.infolinks) { headBlock.push(INFOLINKS); added.push('infolinks'); }
  if (!before.growth) { headBlock.push(GROWTH); added.push('growth'); }
  if (headBlock.length) {
    const indent = (s.slice(0, headEnd).match(/\n([ \t]*)$/) || [, ''])[1];
    s = s.slice(0, headEnd) + headBlock.map((t) => indent + t).join('\n') + '\n' + s.slice(headEnd);
  }

  /* --- body: Monetag no fim, para nao atrasar o LCP --- */
  if (!before.monetag) {
    const bodyEnd = lastIndexOfTag(s, 'body');
    if (bodyEnd !== -1) {
      s = s.slice(0, bodyEnd) + MONETAG + '\n' + s.slice(bodyEnd);
      added.push('monetag');
    }
  }

  /* Trava de seguranca: se a pagina ficar sem </head>, sem </body> ou ganhar
     um "<<" (sinal de insercao no meio de uma tag), NAO gravamos nada. Melhor
     deixar a pagina sem anuncio do que quebrar o HTML dela. */
  if (!/<\/head\s*>/i.test(s) || !/<\/body\s*>/i.test(s) || s.includes('<<')) {
    return { file, changed: false, added: [], skipped: 'sanidade: HTML ficaria invalido (nada foi gravado)' };
  }

  fs.writeFileSync(file, s);
  return { file, changed: true, added };
}

function measure(files) {
  const m = { total: files.length, adsense: 0, infolinks: 0, growth: 0, monetag: 0, any: 0, all: 0 };
  for (const f of files) {
    let s = '';
    try { s = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
    const a = hasAdsense(s), i = hasInfolinks(s), g = hasGrowth(s), n = hasMonetag(s);
    if (a) m.adsense++;
    if (i) m.infolinks++;
    if (g) m.growth++;
    if (n) m.monetag++;
    if (a || i || n) m.any++;
    if (a && i && g && n) m.all++;
  }
  return m;
}

function show(m, titulo, total) {
  const pct = (n) => total ? `${((n / total) * 100).toFixed(1)}%` : '0%';
  console.log(`  ${titulo}`);
  console.log(`    AdSense ..........: ${m.adsense} (${pct(m.adsense)})`);
  console.log(`    Infolinks ........: ${m.infolinks} (${pct(m.infolinks)})`);
  console.log(`    Growth/CRO .......: ${m.growth} (${pct(m.growth)})`);
  console.log(`    Monetag ..........: ${m.monetag} (${pct(m.monetag)})`);
  console.log(`    Com renda ativa ..: ${m.any} (${pct(m.any)})`);
  console.log(`    Stack completo ...: ${m.all} (${pct(m.all)})`);
}

function main() {
  console.log('================================================================================');
  console.log(`💰 INJETOR DO STACK DE MONETIZACAO${CHECK_ONLY ? '  (MEDICAO APENAS)' : ''}`);
  console.log('================================================================================');

  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error('❌ public/ nao encontrado em', PUBLIC_DIR);
    process.exit(1);
  }
  const files = walk(PUBLIC_DIR);
  const antes = measure(files);
  show(antes, `ANTES — ${files.length} páginas HTML`, files.length);
  console.log('');

  if (CHECK_ONLY) {
    console.log('  (--check: nenhum arquivo foi alterado)');
    process.exit(0);
  }

  const alterados = [];
  const erros = [];
  let intactas = 0;
  for (const f of files) {
    try {
      const r = inject(f);
      if (r.changed) alterados.push(r); else intactas++;
    } catch (e) {
      erros.push({ file: f, error: e.message });
    }
  }

  const depois = measure(files);
  console.log(`  ✅ Páginas alteradas .......: ${alterados.length}`);
  console.log(`  ✔️  Já estavam completas ....: ${intactas}`);
  console.log(`  ❌ Erros de escrita ........: ${erros.length}`);
  console.log('');
  show(depois, `DEPOIS — ${files.length} páginas HTML`, files.length);

  if (SAMPLE) {
    console.log('');
    console.log(`  Amostra de ${SAMPLE} páginas alteradas:`);
    alterados.slice(0, SAMPLE).forEach((a) => console.log(`    • ${path.relative(PUBLIC_DIR, a.file)}  (+${a.added.join(', +')})`));
  }

  const report = {
    generated_at: new Date().toISOString(),
    idempotente: true,
    tags: { adsense: ADSENSE, infolinks: INFOLINKS, growth: GROWTH, monetag: MONETAG.split('\n') },
    antes, depois,
    paginas_alteradas: alterados.length,
    paginas_intactas: intactas,
    erros,
    amostra_alteradas: alterados.slice(0, 100).map((a) => ({ file: path.relative(PUBLIC_DIR, a.file), added: a.added }))
  };
  fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log('');
  console.log(`  📄 Relatório: ${path.relative(path.join(__dirname, '..'), REPORT_FILE)}`);
  console.log('================================================================================');

  if (erros.length) process.exit(1);
  process.exit(0);
}

main();
