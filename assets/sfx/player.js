/* =====================================================================
   dropSFX · player de pré-escuta (sons reais do plugin)
   Usado no funil (/comecar/) e no site (home).

   DropSFXPlayer.mount(el, {
     lang: 'pt' | 'en' | 'es' | 'hi',
     priority: ['risers', 'tonalidade', ...],   // categorias "pra você" (opcional)
     onPlay: function (id, cat) {}               // rastreamento (opcional)
   }) → { setLang(l), setPriority(arr) }

   Os sons ficam em assets/sfx/*.mp3 e a lista + forma de onda em sfx.json.
   ===================================================================== */
(function () {
  var BASE = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/player\.js(\?.*)?$/, '') : '/assets/sfx/';
  })();

  var ORDER = ['whooshes', 'hits', 'risers', 'drops', 'transitions', 'glitches', 'tonalidade', 'clicks', 'hud',
               'foley', 'camera', 'memes', 'elements', 'guns', 'slowmo', 'ambientes', 'natureza', 'retro'];
  var COLOR = {
    whooshes: '#2dd4bf', foley: '#06b6d4', hits: '#f87171', drops: '#a78bfa', tonalidade: '#fde047', clicks: '#38bdf8',
    camera: '#94a3b8', ambientes: '#86efac', transitions: '#facc15', risers: '#fb923c', natureza: '#65a30d', memes: '#f472b6',
    elements: '#d97706', glitches: '#60a5fa', guns: '#ef4444', hud: '#22d3ee', slowmo: '#c4b5fd', retro: '#b45309'
  };
  var NAMES = {
    pt: { whooshes: 'Whooshes', foley: 'Foley & Diegese', hits: 'Hits & Impacts', drops: 'Cinematic Drops', tonalidade: 'Tonalidade', clicks: 'Clicks & UI', camera: 'Câmera', ambientes: 'Ambientes', transitions: 'Transições', risers: 'Risers', natureza: 'Natureza', memes: 'Memes & Cartoon', elements: 'Elements', glitches: 'Glitches', guns: 'Guns', hud: 'HUD & Digital', slowmo: 'Slow Motion', retro: 'Retrô' },
    en: { whooshes: 'Whooshes', foley: 'Foley & Diegetic', hits: 'Hits & Impacts', drops: 'Cinematic Drops', tonalidade: 'Tonal', clicks: 'Clicks & UI', camera: 'Camera', ambientes: 'Ambiences', transitions: 'Transitions', risers: 'Risers', natureza: 'Nature', memes: 'Memes & Cartoon', elements: 'Elements', glitches: 'Glitches', guns: 'Guns', hud: 'HUD & Digital', slowmo: 'Slow Motion', retro: 'Retro' },
    es: { whooshes: 'Whooshes', foley: 'Foley & Diégesis', hits: 'Hits & Impacts', drops: 'Cinematic Drops', tonalidade: 'Tonalidad', clicks: 'Clicks & UI', camera: 'Cámara', ambientes: 'Ambientes', transitions: 'Transiciones', risers: 'Risers', natureza: 'Naturaleza', memes: 'Memes & Cartoon', elements: 'Elements', glitches: 'Glitches', guns: 'Guns', hud: 'HUD & Digital', slowmo: 'Slow Motion', retro: 'Retro' },
    hi: { whooshes: 'व्हूश', foley: 'फ़ॉली', hits: 'हिट्स & इम्पैक्ट्स', drops: 'सिनेमैटिक ड्रॉप्स', tonalidade: 'टोनल', clicks: 'क्लिक्स & UI', camera: 'कैमरा', ambientes: 'एम्बिएंस', transitions: 'ट्रांज़िशन', risers: 'राइज़र', natureza: 'नेचर', memes: 'मीम्स & कार्टून', elements: 'एलिमेंट्स', glitches: 'ग्लिच', guns: 'गन्स', hud: 'HUD & डिजिटल', slowmo: 'स्लो मोशन', retro: 'रेट्रो' }
  };
  var UI = {
    pt: { forYou: 'Pra você', top: 'Destaques', hover: 'Passe o mouse pra ouvir', tap: 'Toque pra ouvir', play: 'Ouvir', stop: 'Parar', more: 'de {n} sons nesta categoria' },
    en: { forYou: 'For you', top: 'Highlights', hover: 'Hover to listen', tap: 'Tap to listen', play: 'Play', stop: 'Stop', more: 'of {n} sounds in this category' },
    es: { forYou: 'Para ti', top: 'Destacados', hover: 'Pasa el mouse para escuchar', tap: 'Toca para escuchar', play: 'Escuchar', stop: 'Parar', more: 'de {n} sonidos en esta categoría' },
    hi: { forYou: 'आपके लिए', top: 'हाइलाइट्स', hover: 'सुनने के लिए माउस ले जाइए', tap: 'सुनने के लिए टैप करें', play: 'सुनें', stop: 'रोकें', more: 'इस कैटेगरी के {n} साउंड में से' }
  };
  var COUNT = { whooshes: 436, foley: 231, hits: 196, drops: 192, tonalidade: 185, clicks: 169, camera: 139, ambientes: 124, transitions: 110, risers: 110, natureza: 77, memes: 71, elements: 69, glitches: 65, guns: 58, hud: 55, slowmo: 50, retro: 34 };

  var CSS = '' +
    '.sfxp{--sfxp-line:rgba(255,255,255,.1);font-family:inherit}' +
    '.sfxp-tabs{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 12px;scrollbar-width:none;-webkit-overflow-scrolling:touch;mask-image:linear-gradient(90deg,#000 88%,transparent)}' +
    '.sfxp-tabs::-webkit-scrollbar{display:none}' +
    '.sfxp-tab{flex:none;display:inline-flex;align-items:center;gap:7px;padding:9px 14px;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:rgba(255,255,255,.03);color:#c4c8d4;font-family:inherit;font-weight:600;font-size:13px;line-height:1;cursor:pointer;white-space:nowrap;transition:border-color .2s,background .2s,color .2s}' +
    '.sfxp-tab i{width:8px;height:8px;border-radius:50%;background:var(--c,#6e9bff)}' +
    '.sfxp-tab:hover{color:#fff;border-color:var(--c,#6e9bff)}' +
    '.sfxp-tab[aria-selected="true"]{color:#fff;border-color:var(--c,#6e9bff);background:color-mix(in srgb,var(--c,#6e9bff) 20%,transparent)}' +
    '.sfxp-hint{display:flex;align-items:center;gap:8px;margin:2px 0 12px;font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8a8f9c}' +
    '.sfxp-hint b{display:inline-flex;gap:2px;align-items:flex-end;height:12px}' +
    '.sfxp-hint b i{width:2px;background:#6e9bff;border-radius:1px;animation:sfxpEq 1s ease-in-out infinite alternate}' +
    '.sfxp-hint b i:nth-child(2){animation-delay:.2s}.sfxp-hint b i:nth-child(3){animation-delay:.4s}' +
    '@keyframes sfxpEq{from{height:30%}to{height:100%}}' +
    '.sfxp-list{display:grid;gap:8px}' +
    '.sfxp-row{position:relative;display:grid;grid-template-columns:44px 1fr;gap:14px;align-items:center;padding:12px 14px 12px 12px;border:1px solid var(--sfxp-line);border-radius:14px;background:rgba(255,255,255,.025);cursor:pointer;transition:border-color .2s,background .2s;-webkit-tap-highlight-color:transparent;user-select:none}' +
    '.sfxp-row:hover,.sfxp-row.on{border-color:color-mix(in srgb,var(--c) 55%,transparent);background:color-mix(in srgb,var(--c) 8%,transparent)}' +
    '.sfxp-btn{display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:12px;background:color-mix(in srgb,var(--c) 18%,transparent);color:var(--c);cursor:pointer;padding:0}' +
    '.sfxp-btn svg{width:18px;height:18px}' +
    '.sfxp-btn .st{display:none}.sfxp-row.on .sfxp-btn .pl{display:none}.sfxp-row.on .sfxp-btn .st{display:block}' +
    '.sfxp-row.on .sfxp-btn{background:var(--c);color:#000}' +
    '.sfxp-mid{min-width:0}' +
    '.sfxp-top{display:flex;justify-content:space-between;align-items:baseline;gap:10px}' +
    '.sfxp-name{font-size:15px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.sfxp-meta{flex:none;font-family:"JetBrains Mono",monospace;font-size:10.5px;color:#8a8f9c}' +
    '.sfxp-meta em{font-style:normal;color:var(--c)}' +
    '.sfxp-wave{position:relative;display:flex;align-items:center;gap:2px;height:28px;margin-top:8px}' +
    '.sfxp-wave i{flex:1;min-width:1px;border-radius:1px;background:rgba(255,255,255,.18);transition:background .08s}' +
    '.sfxp-wave i.p{background:var(--c)}' +
    '.sfxp-foot{margin-top:10px;font-size:12.5px;color:#8a8f9c}' +
    '@media (prefers-reduced-motion:reduce){.sfxp-hint b i{animation:none}}';

  var data = null, loading = null, current = null;
  function load() {
    if (data) return Promise.resolve(data);
    if (!loading) loading = fetch(BASE + 'sfx.json').then(function (r) { return r.json(); }).then(function (d) { data = d; return d; });
    return loading;
  }
  function injectCSS() {
    if (document.getElementById('sfxp-css')) return;
    var st = document.createElement('style'); st.id = 'sfxp-css'; st.textContent = CSS; document.head.appendChild(st);
  }
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(d) { return d < 10 ? '0:0' + d.toFixed(1) : '0:' + d.toFixed(1); }

  function stopCurrent() {
    if (!current) return;
    try { current.audio.pause(); current.audio.currentTime = 0; } catch (e) {}
    current.row.classList.remove('on');
    paint(current.row, 0);
    cancelAnimationFrame(current.raf);
    current = null;
  }
  function paint(row, pct) {
    var bars = row._bars, n = bars.length, k = Math.round(pct * n);
    for (var i = 0; i < n; i++) bars[i].classList.toggle('p', i < k);
  }
  function play(row, s, onPlay) {
    if (current && current.row === row) { stopCurrent(); return; }
    stopCurrent();
    var a = row._audio || (row._audio = new Audio(BASE + s.id + '.mp3'));
    a.preload = 'auto';
    try { a.currentTime = 0; } catch (e) {}
    var p = a.play(); if (p && p.catch) p.catch(function () {});
    row.classList.add('on');
    current = { row: row, audio: a, raf: 0 };
    var me = current;
    (function tick() {
      if (current !== me) return;
      var d = a.duration || s.dur;
      paint(row, Math.min(1, (a.currentTime || 0) / d));
      if (a.ended) { stopCurrent(); return; }
      me.raf = requestAnimationFrame(tick);
    })();
    if (onPlay) try { onPlay(s.id, s.cat); } catch (e) {}
  }

  function mount(el, opt) {
    opt = opt || {};
    injectCSS();
    var lang = opt.lang || 'pt', priority = (opt.priority || []).slice(), tab = priority.length ? 'you' : 'top';
    el.classList.add('sfxp');
    el.innerHTML = '<div class="sfxp-tabs" role="tablist"></div><p class="sfxp-hint"><b aria-hidden="true"><i></i><i></i><i></i></b><span></span></p><div class="sfxp-list"></div><p class="sfxp-foot" hidden></p>';
    var tabsEl = el.querySelector('.sfxp-tabs'), listEl = el.querySelector('.sfxp-list'), hintEl = el.querySelector('.sfxp-hint span'), footEl = el.querySelector('.sfxp-foot');

    function pickList(d) {
      if (tab === 'you' || tab === 'top') {
        var cats = tab === 'you' ? priority : ['hits', 'whooshes', 'risers', 'glitches', 'tonalidade', 'memes', 'foley', 'hud'];
        var first = [], second = [];
        cats.forEach(function (c) {
          var arr = d.filter(function (s) { return s.cat === c; });
          if (arr[0]) first.push(arr[0]);
          if (arr[1]) second.push(arr[1]);
        });
        return first.concat(second).slice(0, opt.max || 8);
      }
      return d.filter(function (s) { return s.cat === tab; });
    }

    function render() {
      var U = UI[lang] || UI.pt, N = NAMES[lang] || NAMES.pt;
      hintEl.textContent = canHover ? U.hover : U.tap;
      var tabs = [];
      if (priority.length) tabs.push(['you', U.forYou, '#6e9bff']);
      else tabs.push(['top', U.top, '#6e9bff']);
      var cats = priority.length ? priority.concat(ORDER.filter(function (c) { return priority.indexOf(c) < 0; })) : ORDER;
      cats.forEach(function (c) { tabs.push([c, N[c] || c, COLOR[c]]); });
      tabsEl.innerHTML = tabs.map(function (t) {
        return '<button type="button" class="sfxp-tab" role="tab" style="--c:' + t[2] + '" data-tab="' + t[0] + '" aria-selected="' + (t[0] === tab) + '"><i></i>' + esc(t[1]) + '</button>';
      }).join('');
      [].forEach.call(tabsEl.querySelectorAll('.sfxp-tab'), function (b) {
        b.addEventListener('click', function () { tab = b.getAttribute('data-tab'); stopCurrent(); render(); if (opt.onTab) try { opt.onTab(tab); } catch (e) {} });
      });
      load().then(function (d) {
        stopCurrent();
        var list = pickList(d);
        listEl.innerHTML = list.map(function (s) {
          return '<div class="sfxp-row" style="--c:' + (COLOR[s.cat] || '#6e9bff') + '" data-id="' + s.id + '">' +
            '<button type="button" class="sfxp-btn" aria-label="' + esc(U.play + ': ' + s.name) + '">' +
              '<svg class="pl" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>' +
              '<svg class="st" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>' +
            '</button>' +
            '<div class="sfxp-mid"><div class="sfxp-top"><span class="sfxp-name">' + esc(s.name) + '</span>' +
            '<span class="sfxp-meta"><em>' + esc(N[s.cat] || s.cat) + '</em> · ' + fmt(s.dur) + '</span></div>' +
            '<div class="sfxp-wave" aria-hidden="true">' + s.w.map(function (v) { return '<i style="height:' + Math.max(8, v) + '%"></i>'; }).join('') + '</div></div></div>';
        }).join('');
        var byId = {}; d.forEach(function (s) { byId[s.id] = s; });
        [].forEach.call(listEl.querySelectorAll('.sfxp-row'), function (row) {
          var s = byId[row.getAttribute('data-id')];
          row._bars = row.querySelectorAll('.sfxp-wave i');
          var hoverT = 0;
          row.addEventListener('click', function () { play(row, s, opt.onPlay); });
          if (canHover) {
            row.addEventListener('mouseenter', function () {
              hoverT = setTimeout(function () { if (!(current && current.row === row)) play(row, s, opt.onPlay); }, 140);
            });
            row.addEventListener('mouseleave', function () { clearTimeout(hoverT); });
          }
        });
        if (tab !== 'you' && tab !== 'top' && COUNT[tab]) {
          footEl.hidden = false;
          footEl.textContent = list.length + ' ' + U.more.replace('{n}', COUNT[tab].toLocaleString(lang === 'pt' || lang === 'es' ? 'pt-BR' : 'en'));
        } else footEl.hidden = true;
      });
    }

    render();
    // carrega a lista assim que o player chegar perto da tela
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { load(); o.disconnect(); } }, { rootMargin: '600px 0px' }).observe(el);
    } else load();

    return {
      setLang: function (l) { if (l !== lang) { lang = l; render(); } },
      setPriority: function (arr) { priority = (arr || []).slice(); tab = priority.length ? 'you' : 'top'; render(); },
      stop: stopCurrent
    };
  }

  // pausa se a pessoa trocar de aba do navegador
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopCurrent(); });

  window.DropSFXPlayer = { mount: mount };
})();
