(function() {
  const container = document.createElement('div');
  container.id = 'achadinhos-horoscope-widget';
  container.style = 'max-width:380px;background:#0f172a;border:1px solid #334155;border-radius:14px;padding:16px;color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 10px 25px rgba(0,0,0,0.5);';

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1e293b;padding-bottom:10px;margin-bottom:12px;">
      <div style="font-weight:800;font-size:0.95rem;color:#fde047;">🔮 Horóscopo do Dia</div>
      <div style="font-size:0.75rem;color:#38bdf8;font-weight:700;">${today}</div>
    </div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
      <span style="font-size:2.2rem;" id="widget-sign-icon">♈</span>
      <div>
        <select id="widget-sign-select" style="background:#030712;border:1px solid #334155;color:#fff;padding:4px 8px;border-radius:6px;font-size:0.85rem;font-weight:700;" onchange="window.updateAchadinhosWidgetSign(this.value)">
          <option value="0">♈ Áries</option><option value="1">♉ Touro</option><option value="2">♊ Gêmeos</option>
          <option value="3">♋ Câncer</option><option value="4">♌ Leão</option><option value="5">♍ Virgem</option>
          <option value="6">♎ Libra</option><option value="7">♏ Escorpião</option><option value="8">♐ Sagitário</option>
          <option value="9">♑ Capricórnio</option><option value="10">♒ Aquário</option><option value="11">♓ Peixes</option>
        </select>
        <div style="font-size:0.75rem;color:#94a3b8;margin-top:2px;" id="widget-sign-element">Elemento: Fogo</div>
      </div>
    </div>
    <p id="widget-sign-text" style="font-size:0.85rem;line-height:1.4;color:#cbd5e1;margin-bottom:12px;">Hoje o trânsito planetário favorece decisões estratégicas e novos começos financeiros.</p>
    <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #1e293b;padding-top:10px;font-size:0.75rem;">
      <a href="https://www.aquitemachadinhos.com.br/entretenimento" target="_blank" style="color:#a78bfa;text-decoration:none;font-weight:700;">✨ Ver Mapa Astral Completo ➔</a>
      <span style="color:#64748b;font-size:0.65rem;">Por Aqui Tem Achadinhos</span>
    </div>
  `;

  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  currentScript.parentNode.insertBefore(container, currentScript);

  const signsData = [
    { icon: "♈", elem: "Elemento: Fogo", text: "Hoje o trânsito planetário favorece decisões estratégicas e novos começos financeiros." },
    { icon: "♉", elem: "Elemento: Terra", text: "A energia da estabilidade governa suas finanças hoje. Momento ideal para consolidar investimentos." },
    { icon: "♊", elem: "Elemento: Ar", text: "Sua agilidade mental estará no ápice! Excelente momento para novos estudos e fechar acordos." },
    { icon: "♋", elem: "Elemento: Água", text: "Sua intuição está aguçada como nunca. Confie no sexto sentido em decisões profissionais." },
    { icon: "♌", elem: "Elemento: Fogo", text: "Seu brilho pessoal e liderança natural ganham destaque irresistível hoje. Projetos aprovados." },
    { icon: "♍", elem: "Elemento: Terra", text: "Dia perfeito para organizar finanças e otimizar rotinas. O foco nos detalhes trará economia." },
    { icon: "♎", elem: "Elemento: Ar", text: "Harmonia e diplomacia serão suas maiores armas. Oportunidade dourada para novas parcerias." },
    { icon: "♏", elem: "Elemento: Água", text: "Força magnética e poder de transformação em alta. Uma resposta esperada se revela." },
    { icon: "♐", elem: "Elemento: Fogo", text: "O espírito aventureiro traz vontade de expandir horizontes e planejar novos projetos." },
    { icon: "♑", elem: "Elemento: Terra", text: "Disciplina e perseverança geram resultados concretos. Seus esforços começam a render." },
    { icon: "♒", elem: "Elemento: Ar", text: "Ideias inovadoras e pensamentos fora da caixa vão te destacar na carreira hoje." },
    { icon: "♓", elem: "Elemento: Água", text: "Sensibilidade artística e intuição espiritual elevadas. Conecte-se com suas metas." }
  ];

  window.updateAchadinhosWidgetSign = function(idx) {
    const s = signsData[idx];
    document.getElementById('widget-sign-icon').innerText = s.icon;
    document.getElementById('widget-sign-element').innerText = s.elem;
    document.getElementById('widget-sign-text').innerText = s.text;
  };
})();
