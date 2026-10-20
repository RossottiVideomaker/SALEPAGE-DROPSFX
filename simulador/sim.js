/* =====================================================================
   dropSFX | simulador
   Um "Premiere" de mentira com o painel do dropSFX funcionando:
   pastas, pré-escuta no hover, ganho, faixa, Auto, Inserir, arrastar
   pra timeline e play com os sons sincronizados com o vídeo.
   O visual do painel usa o CSS real do plugin (plugin.css).
   Parâmetros: ?embed=1 &lang=pt|en|es|hi|fr|id &prio=whooshes,hits,...
   ===================================================================== */
(function () {
  'use strict';

  var Q = new URLSearchParams(location.search);
  var EMBED = Q.has('embed');
  var BASE = '/assets/sim/';
  var SEQ = 12, FPS = 30;
  var LANGS = ['pt', 'en', 'es', 'hi', 'fr', 'id'];
  var lang = (Q.get('lang') || (navigator.language || 'pt')).slice(0, 2).toLowerCase();
  if (LANGS.indexOf(lang) < 0) lang = 'en';
  var PRIO = (Q.get('prio') || '').split(',').filter(Boolean);
  var FINE = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.body.classList.add(EMBED ? 'embed' : 'standalone');

  // ------------------------------------------------------------------ textos
  var T = {
    pt: { lib: 'Biblioteca', comm: 'Comunidade', search: 'Buscar sons…', folders: 'Pastas', sort: 'Nome', sortDur: 'Duração', libLabel: 'Biblioteca dropSFX', forYou: 'Pra você', sounds: 'sons', select: 'Selecione um som', gain: 'Ganho', inpoint: 'duplo-clique insere', insert: 'Inserir', inserted: 'Inserido em {t}, {tc}', commToast: 'A Comunidade abre no plugin completo', more: '+{n} sons nesta pasta', moreSub: 'no plugin completo', unlock: 'Desbloquear', results: 'Resultados', none: 'Nada encontrado', noneSub: 'Tente outra palavra ou categoria.', 'st.1': 'Abra uma pasta', 'st.2h': 'Passe o mouse num som', 'st.2t': 'Toque num som', 'st.3': 'Insira na timeline', 'st.4': 'Dê play', demo: 'Ver exemplo pronto', clear: 'Limpar', 'm.import': 'Importar', 'm.edit': 'Editar', 'm.export': 'Exportar', simtag: 'Simulação', program: 'Programa: Sequência 01', seq: 'Sequência 01', title: 'dropSFX_demo.prproj, Editado', 'tab.lumetri': 'Lumetri Color', 'tab.props': 'Propriedades', 'cue.impact': 'Impacto aqui', 'cue.whoosh': 'Whoosh no corte', 'cue.click': 'Clique', 'cue.riser': 'Riser até o drop', 'cue.drop': 'Drop', 'hint.start': 'Os marcadores ▼ mostram onde um som encaixa', 'hint.play': 'Agora aperte play ▶ (ou espaço)', 'hint.drag': 'Solte na faixa', 'hint.done': 'Isso é sound design em segundos', removed: 'Clipe removido', demoToast: 'Exemplo pronto: aperte play', 'solo.sub': 'Teste o plugin no navegador: ouça, insira e dê play.', 'solo.cta': 'Quero o dropSFX', locked: 'No plugin completo', moveHint: 'arraste pra mover' },
    en: { lib: 'Library', comm: 'Community', search: 'Search sounds…', folders: 'Folders', sort: 'Name', sortDur: 'Length', libLabel: 'dropSFX library', forYou: 'For you', sounds: 'sounds', select: 'Select a sound', gain: 'Gain', inpoint: 'double-click inserts', insert: 'Insert', inserted: 'Inserted on {t}, {tc}', commToast: 'Community opens in the full plugin', more: '+{n} sounds in this folder', moreSub: 'in the full plugin', unlock: 'Unlock', results: 'Results', none: 'Nothing found', noneSub: 'Try another word or category.', 'st.1': 'Open a folder', 'st.2h': 'Hover a sound', 'st.2t': 'Tap a sound', 'st.3': 'Insert it on the timeline', 'st.4': 'Hit play', demo: 'See a finished example', clear: 'Clear', 'm.import': 'Import', 'm.edit': 'Edit', 'm.export': 'Export', simtag: 'Simulation', program: 'Program: Sequence 01', seq: 'Sequence 01', title: 'dropSFX_demo.prproj, Edited', 'tab.lumetri': 'Lumetri Color', 'tab.props': 'Properties', 'cue.impact': 'Impact here', 'cue.whoosh': 'Whoosh on the cut', 'cue.click': 'Click', 'cue.riser': 'Riser into the drop', 'cue.drop': 'Drop', 'hint.start': 'The ▼ markers show where a sound fits', 'hint.play': 'Now hit play ▶ (or space)', 'hint.drag': 'Drop it on a track', 'hint.done': "That's sound design in seconds", removed: 'Clip removed', demoToast: 'Example ready: hit play', 'solo.sub': 'Try the plugin in your browser: listen, insert, play.', 'solo.cta': 'Get dropSFX', locked: 'In the full plugin', moveHint: 'drag to move' },
    es: { lib: 'Biblioteca', comm: 'Comunidad', search: 'Buscar sonidos…', folders: 'Carpetas', sort: 'Nombre', sortDur: 'Duración', libLabel: 'Biblioteca dropSFX', forYou: 'Para ti', sounds: 'sonidos', select: 'Selecciona un sonido', gain: 'Ganancia', inpoint: 'doble clic inserta', insert: 'Insertar', inserted: 'Insertado en {t}, {tc}', commToast: 'La Comunidad se abre en el plugin completo', more: '+{n} sonidos en esta carpeta', moreSub: 'en el plugin completo', unlock: 'Desbloquear', results: 'Resultados', none: 'Nada encontrado', noneSub: 'Prueba otra palabra o categoría.', 'st.1': 'Abre una carpeta', 'st.2h': 'Pasa el mouse por un sonido', 'st.2t': 'Toca un sonido', 'st.3': 'Insértalo en la línea de tiempo', 'st.4': 'Dale play', demo: 'Ver ejemplo listo', clear: 'Limpiar', 'm.import': 'Importar', 'm.edit': 'Editar', 'm.export': 'Exportar', simtag: 'Simulación', program: 'Programa: Secuencia 01', seq: 'Secuencia 01', title: 'dropSFX_demo.prproj, Editado', 'tab.lumetri': 'Lumetri Color', 'tab.props': 'Propiedades', 'cue.impact': 'Impacto aquí', 'cue.whoosh': 'Whoosh en el corte', 'cue.click': 'Clic', 'cue.riser': 'Riser hasta el drop', 'cue.drop': 'Drop', 'hint.start': 'Los marcadores ▼ muestran dónde encaja un sonido', 'hint.play': 'Ahora dale play ▶ (o espacio)', 'hint.drag': 'Suéltalo en una pista', 'hint.done': 'Eso es sound design en segundos', removed: 'Clip eliminado', demoToast: 'Ejemplo listo: dale play', 'solo.sub': 'Prueba el plugin en el navegador: escucha, inserta y dale play.', 'solo.cta': 'Quiero dropSFX', locked: 'En el plugin completo', moveHint: 'arrastra para mover' },
    hi: { lib: 'लाइब्रेरी', comm: 'कम्युनिटी', search: 'साउंड खोजें…', folders: 'फ़ोल्डर', sort: 'नाम', sortDur: 'लंबाई', libLabel: 'dropSFX लाइब्रेरी', forYou: 'आपके लिए', sounds: 'साउंड', select: 'कोई साउंड चुनें', gain: 'गेन', inpoint: 'डबल-क्लिक से इन्सर्ट', insert: 'इन्सर्ट', inserted: '{t} पर इन्सर्ट, {tc}', commToast: 'कम्युनिटी पूरे प्लगइन में खुलती है', more: 'इस फ़ोल्डर में +{n} साउंड', moreSub: 'पूरे प्लगइन में', unlock: 'अनलॉक', results: 'नतीजे', none: 'कुछ नहीं मिला', noneSub: 'कोई और शब्द या कैटेगरी आज़माएँ।', 'st.1': 'एक फ़ोल्डर खोलें', 'st.2h': 'किसी साउंड पर माउस ले जाएँ', 'st.2t': 'किसी साउंड पर टैप करें', 'st.3': 'टाइमलाइन पर इन्सर्ट करें', 'st.4': 'प्ले दबाएँ', demo: 'तैयार उदाहरण देखें', clear: 'साफ़ करें', 'm.import': 'Import', 'm.edit': 'Edit', 'm.export': 'Export', simtag: 'सिमुलेशन', program: 'Program: Sequence 01', seq: 'Sequence 01', title: 'dropSFX_demo.prproj, Edited', 'tab.lumetri': 'Lumetri Color', 'tab.props': 'Properties', 'cue.impact': 'यहाँ इम्पैक्ट', 'cue.whoosh': 'कट पर व्हूश', 'cue.click': 'क्लिक', 'cue.riser': 'ड्रॉप तक राइज़र', 'cue.drop': 'ड्रॉप', 'hint.start': '▼ मार्कर बताते हैं कि साउंड कहाँ फ़िट होगा', 'hint.play': 'अब प्ले ▶ दबाएँ (या स्पेस)', 'hint.drag': 'किसी ट्रैक पर छोड़ें', 'hint.done': 'सेकंडों में साउंड डिज़ाइन', removed: 'क्लिप हटाई गई', demoToast: 'उदाहरण तैयार: प्ले दबाएँ', 'solo.sub': 'ब्राउज़र में प्लगइन आज़माएँ: सुनें, इन्सर्ट करें, प्ले करें।', 'solo.cta': 'dropSFX लें', locked: 'पूरे प्लगइन में', moveHint: 'खिसकाने के लिए खींचें' },
    fr: { lib: 'Bibliothèque', comm: 'Communauté', search: 'Rechercher des sons…', folders: 'Dossiers', sort: 'Nom', sortDur: 'Durée', libLabel: 'Bibliothèque dropSFX', forYou: 'Pour vous', sounds: 'sons', select: 'Choisissez un son', gain: 'Gain', inpoint: 'double-clic pour insérer', insert: 'Insérer', inserted: 'Inséré sur {t}, {tc}', commToast: 'La Communauté s’ouvre dans le plugin complet', more: '+{n} sons dans ce dossier', moreSub: 'dans le plugin complet', unlock: 'Débloquer', results: 'Résultats', none: 'Rien trouvé', noneSub: 'Essayez un autre mot ou une autre catégorie.', 'st.1': 'Ouvrez un dossier', 'st.2h': 'Survolez un son', 'st.2t': 'Touchez un son', 'st.3': 'Insérez-le sur la timeline', 'st.4': 'Lancez la lecture', demo: 'Voir un exemple fini', clear: 'Effacer', 'm.import': 'Importer', 'm.edit': 'Montage', 'm.export': 'Exporter', simtag: 'Simulation', program: 'Programme : Séquence 01', seq: 'Séquence 01', title: 'dropSFX_demo.prproj, Modifié', 'tab.lumetri': 'Lumetri Color', 'tab.props': 'Propriétés', 'cue.impact': 'Impact ici', 'cue.whoosh': 'Whoosh sur la coupe', 'cue.click': 'Clic', 'cue.riser': 'Riser jusqu’au drop', 'cue.drop': 'Drop', 'hint.start': 'Les repères ▼ montrent où un son colle', 'hint.play': 'Lancez la lecture ▶ (ou espace)', 'hint.drag': 'Déposez-le sur une piste', 'hint.done': 'Du sound design en quelques secondes', removed: 'Clip supprimé', demoToast: 'Exemple prêt : lancez la lecture', 'solo.sub': 'Testez le plugin dans le navigateur : écoutez, insérez, lancez.', 'solo.cta': 'Je veux dropSFX', locked: 'Dans le plugin complet', moveHint: 'glissez pour déplacer' },
    id: { lib: 'Pustaka', comm: 'Komunitas', search: 'Cari suara…', folders: 'Folder', sort: 'Nama', sortDur: 'Durasi', libLabel: 'Pustaka dropSFX', forYou: 'Untukmu', sounds: 'suara', select: 'Pilih suara', gain: 'Gain', inpoint: 'klik dua kali untuk memasukkan', insert: 'Masukkan', inserted: 'Masuk di {t}, {tc}', commToast: 'Komunitas ada di plugin lengkap', more: '+{n} suara di folder ini', moreSub: 'di plugin lengkap', unlock: 'Buka', results: 'Hasil', none: 'Tidak ditemukan', noneSub: 'Coba kata atau kategori lain.', 'st.1': 'Buka folder', 'st.2h': 'Arahkan kursor ke suara', 'st.2t': 'Ketuk suara', 'st.3': 'Masukkan ke timeline', 'st.4': 'Putar', demo: 'Lihat contoh jadi', clear: 'Hapus', 'm.import': 'Import', 'm.edit': 'Edit', 'm.export': 'Export', simtag: 'Simulasi', program: 'Program: Sequence 01', seq: 'Sequence 01', title: 'dropSFX_demo.prproj, Diedit', 'tab.lumetri': 'Lumetri Color', 'tab.props': 'Properties', 'cue.impact': 'Impact di sini', 'cue.whoosh': 'Whoosh di potongan', 'cue.click': 'Klik', 'cue.riser': 'Riser sampai drop', 'cue.drop': 'Drop', 'hint.start': 'Penanda ▼ menunjukkan tempat suara cocok', 'hint.play': 'Sekarang putar ▶ (atau spasi)', 'hint.drag': 'Lepas di track', 'hint.done': 'Sound design dalam hitungan detik', removed: 'Klip dihapus', demoToast: 'Contoh siap: putar', 'solo.sub': 'Coba plugin di browser: dengar, masukkan, putar.', 'solo.cta': 'Saya mau dropSFX', locked: 'Di plugin lengkap', moveHint: 'seret untuk memindah' }
  };
  var NAMES = {
    pt: { whooshes: 'Whooshes', foley: 'Foley & Diegese', hits: 'Hits & Impacts', drops: 'Cinematic Drops', tonalidade: 'Tonalidade', clicks: 'Clicks & UI', camera: 'Câmera', ambientes: 'Ambientes', transitions: 'Transições', risers: 'Risers', natureza: 'Natureza', memes: 'Memes & Cartoon', elements: 'Elements', glitches: 'Glitches', guns: 'Guns', hud: 'HUD & Digital', slowmo: 'Slow Motion', retro: 'Retrô' },
    en: { whooshes: 'Whooshes', foley: 'Foley & Diegetic', hits: 'Hits & Impacts', drops: 'Cinematic Drops', tonalidade: 'Tonal', clicks: 'Clicks & UI', camera: 'Camera', ambientes: 'Ambiences', transitions: 'Transitions', risers: 'Risers', natureza: 'Nature', memes: 'Memes & Cartoon', elements: 'Elements', glitches: 'Glitches', guns: 'Guns', hud: 'HUD & Digital', slowmo: 'Slow Motion', retro: 'Retro' },
    es: { whooshes: 'Whooshes', foley: 'Foley & Diégesis', hits: 'Hits & Impacts', drops: 'Cinematic Drops', tonalidade: 'Tonalidad', clicks: 'Clicks & UI', camera: 'Cámara', ambientes: 'Ambientes', transitions: 'Transiciones', risers: 'Risers', natureza: 'Naturaleza', memes: 'Memes & Cartoon', elements: 'Elements', glitches: 'Glitches', guns: 'Guns', hud: 'HUD & Digital', slowmo: 'Slow Motion', retro: 'Retro' },
    hi: { whooshes: 'व्हूश', foley: 'फ़ॉली', hits: 'हिट्स & इम्पैक्ट्स', drops: 'सिनेमैटिक ड्रॉप्स', tonalidade: 'टोनल', clicks: 'क्लिक्स & UI', camera: 'कैमरा', ambientes: 'एम्बिएंस', transitions: 'ट्रांज़िशन', risers: 'राइज़र', natureza: 'नेचर', memes: 'मीम्स & कार्टून', elements: 'एलिमेंट्स', glitches: 'ग्लिच', guns: 'गन्स', hud: 'HUD & डिजिटल', slowmo: 'स्लो मोशन', retro: 'रेट्रो' },
    fr: { whooshes: 'Whooshes', foley: 'Foley & Diégétique', hits: 'Hits & Impacts', drops: 'Cinematic Drops', tonalidade: 'Tonal', clicks: 'Clics & UI', camera: 'Caméra', ambientes: 'Ambiances', transitions: 'Transitions', risers: 'Risers', natureza: 'Nature', memes: 'Mèmes & Cartoon', elements: 'Éléments', glitches: 'Glitches', guns: 'Armes', hud: 'HUD & Digital', slowmo: 'Slow Motion', retro: 'Rétro' },
    id: { whooshes: 'Whoosh', foley: 'Foley & Diegetik', hits: 'Hits & Impact', drops: 'Cinematic Drops', tonalidade: 'Tonal', clicks: 'Klik & UI', camera: 'Kamera', ambientes: 'Ambience', transitions: 'Transisi', risers: 'Riser', natureza: 'Alam', memes: 'Meme & Kartun', elements: 'Elemen', glitches: 'Glitch', guns: 'Senjata', hud: 'HUD & Digital', slowmo: 'Slow Motion', retro: 'Retro' }
  };
  // ícones das pastas (os mesmos desenhos do painel)
  var ICON = {
    whooshes: '<path d="M3 8h10a3 3 0 100-6M3 12h14a3 3 0 110 6M3 16h6"/>',
    foley: '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0M12 17v5M8 22h8"/>',
    hits: '<path d="M12 2l2 6 6-2-4 5 5 4-6 1 1 6-4-4-4 4 1-6-6-1 5-4-4-5 6 2z"/>',
    drops: '<path d="M12 2l4 6-4 14-4-14z"/><path d="M2 8h20"/>',
    tonalidade: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    clicks: '<path d="M4 4l7 17 2.5-7L21 11.5z"/>',
    camera: '<path d="M23 7l-7 5 7 5z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
    ambientes: '<path d="M3 21h18M5 21V8l5-4v17M14 21V10l5 3v8"/>',
    transitions: '<path d="M7 7h13M17 4l3 3-3 3M17 17H4M7 14l-3 3 3 3"/>',
    risers: '<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
    natureza: '<path d="M11 20A7 7 0 014 13c0-4 3-8 8-10 0 0 8 2 8 10a7 7 0 01-7 7z"/><path d="M12 21v-9"/>',
    memes: '<circle cx="12" cy="12" r="9"/><path d="M8 10h.01M16 10h.01M8 15s1.5 2 4 2 4-2 4-2"/>',
    elements: '<path d="M12 2c2 4 6 6 6 11a6 6 0 11-12 0c0-5 4-7 6-11z"/>',
    glitches: '<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>',
    guns: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>',
    hud: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    slowmo: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
    retro: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M8 2l4 4 4-4M8 11v3M12 10v5M16 12v2"/>'
  };
  var PRIO_MAP = { ambient: 'ambientes', nature: 'natureza', tonal: 'tonalidade' };
  PRIO = PRIO.map(function (p) { return PRIO_MAP[p] || p; });

  // marcadores do vídeo (onde cada som encaixa)
  var CUES = [
    { t: 0.35, k: 'impact', cat: 'hits' },
    { t: 2.4, k: 'whoosh', cat: 'whooshes' },
    { t: 5.3, k: 'click', cat: 'clicks' },
    { t: 5.9, k: 'click', cat: 'clicks' },
    { t: 6.5, k: 'click', cat: 'clicks' },
    { t: 7.2, k: 'riser', cat: 'risers' },
    { t: 9.6, k: 'drop', cat: 'drops' }
  ];
  var SHOTS = [
    { a: 0, b: 2.4, n: '01_impacto.mp4' }, { a: 2.4, b: 4.8, n: '02_paisagem.mp4' },
    { a: 4.8, b: 7.2, n: '03_app.mp4' }, { a: 7.2, b: 9.6, n: '04_tunel.mp4' }, { a: 9.6, b: 12, n: '05_logo.mp4' }
  ];
  var TRACKS = ['A1', 'A2', 'A3', 'A4'];

  // ------------------------------------------------------------------ util
  var $ = function (id) { return document.getElementById(id); };
  function t(k) { var d = T[lang] || T.en; return d[k] != null ? d[k] : (T.en[k] != null ? T.en[k] : k); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hexA(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function svg(p, s) { s = s || 15; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }
  function tc(sec) { sec = Math.max(0, sec); var f = Math.floor(sec * FPS + 1e-6), fr = f % FPS, s = Math.floor(f / FPS); return '00:00:' + String(s).padStart(2, '0') + ':' + String(fr).padStart(2, '0'); }
  function mmss(s) { s = Math.max(0, s || 0); return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0'); }
  function db(g) { return Math.pow(10, g / 20); }
  function catName(id) { return (NAMES[lang] || NAMES.en)[id] || id; }
  function post(ev, data) { if (EMBED && window.parent !== window) { try { window.parent.postMessage({ type: 'dropsfx-sim', ev: ev, data: data || null }, '*'); } catch (e) {} } }

  // ------------------------------------------------------------------ estado
  var lib = null, CAT = {}, SND = {};
  var S = {
    view: 'home', cat: null, q: '', sort: 'name',
    sel: null, gain: 0, track: 0, auto: true,
    clips: [], uid: 1, selClip: null,
    ph: 1.0, playing: false, steps: {}, hoverId: null
  };

  // ------------------------------------------------------------------ áudio
  var ac = null, master = null, analyser = null, prevBus = null, prev = null, timeline = [], playT0 = 0, playAc = 0;
  var bufs = {}, pend = {};
  function ensureAC() {
    if (!ac) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ac = new C();
      master = ac.createGain();
      analyser = ac.createAnalyser(); analyser.fftSize = 512;
      prevBus = ac.createGain(); prevBus.gain.value = +$('vol-slider').value;
      master.connect(analyser); prevBus.connect(analyser); analyser.connect(ac.destination);
    }
    if (ac.state !== 'running') {
      try { ac.resume(); } catch (e) {}
      // iOS só libera o áudio tocando algo dentro do próprio toque
      try { var sb = ac.createBuffer(1, 1, 22050), ss = ac.createBufferSource(); ss.buffer = sb; ss.connect(ac.destination); ss.start(0); } catch (e) {}
    }
    return ac;
  }
  ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'].forEach(function (e) { window.addEventListener(e, ensureAC, { capture: true, passive: true }); });
  function load(id) {
    if (bufs[id]) return Promise.resolve(bufs[id]);
    if (pend[id]) return pend[id];
    if (!ensureAC()) return Promise.reject();
    pend[id] = fetch(BASE + 's/' + id + '.mp3').then(function (r) { return r.arrayBuffer(); }).then(function (ab) {
      return new Promise(function (res, rej) { ac.decodeAudioData(ab, res, rej); });
    }).then(function (b) { bufs[id] = b; return b; });
    pend[id].catch(function () { delete pend[id]; });
    return pend[id];
  }

  // pré-escuta (painel)
  function stopPreview() {
    if (prev) { try { prev.src.stop(); } catch (e) {} prev = null; }
    document.querySelectorAll('.file-item.playing,.file-item.hover-preview').forEach(function (el) { el.classList.remove('playing', 'hover-preview'); var f = el.querySelector('.hover-progress-fill'); if (f) f.style.width = '0%'; });
    $('play-icon').innerHTML = '<polygon points="5,3 19,12 5,21"/>';
    $('wave-played').style.width = '0%'; $('time-fill').style.width = '0%'; $('time-cur').textContent = '0:00';
  }
  function playPreview(id, hover) {
    if (!ensureAC()) return;
    stopPreview();
    var token = {}; prev = { token: token, id: id, hover: hover };
    load(id).then(function (b) {
      if (!prev || prev.token !== token) return;
      var src = ac.createBufferSource(); src.buffer = b; src.connect(prevBus);
      src.start(); prev.src = src; prev.at = ac.currentTime; prev.dur = b.duration;
      src.onended = function () { if (prev && prev.src === src) stopPreview(); };
      var el = document.querySelector('.file-item[data-id="' + id + '"]');
      if (el) el.classList.add('playing', hover ? 'hover-preview' : 'x');
      if (!hover || S.sel === id) $('play-icon').innerHTML = '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>';
      step(2);
      post('sfx_play', { id: id, cat: SND[id].cat, hover: !!hover });
    });
  }

  // ------------------------------------------------------------------ painel
  function applyStatic() {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    $('search-input').placeholder = t('search');
    $('st2').textContent = t(FINE ? 'st.2h' : 'st.2t');
    $('winTitle').textContent = t('title');
    $('seqName').textContent = t('seq');
    $('sort-btn').textContent = t(S.sort === 'name' ? 'sort' : 'sortDur');
    if (!S.sel) $('player-name').textContent = t('select');
    renderTrackMenu();
  }

  function catCardStyle(c) {
    return '--c:' + c.color + ';--g:linear-gradient(150deg,' + hexA(c.color, .16) + ' 0%,' + hexA(c.color, .05) + ' 55%,rgba(255,255,255,.02) 100%);--b:' + hexA(c.color, .22);
  }
  function deco() { return '<div class="fcard-deco"><i style="height:45%"></i><i style="height:80%"></i><i style="height:60%"></i><i style="height:100%"></i></div>'; }

  function renderList() {
    var fl = $('file-list'), h = '';
    if (S.q) {
      var q = S.q.toLowerCase();
      var hits = lib.sounds.filter(function (s) { return s.name.toLowerCase().indexOf(q) >= 0 || catName(s.cat).toLowerCase().indexOf(q) >= 0 || (s.tags || []).join(' ').indexOf(q) >= 0; });
      h += '<div class="fhead"><button class="fback" type="button" id="fback">' + svg('<path d="M15 18l-6-6 6-6"/>', 14) + '</button><div class="fhead-info"><div class="fhead-name">' + esc(t('results')) + '</div><div class="fhead-n">' + hits.length + ' ' + esc(t('sounds')) + '</div></div></div>';
      h += hits.length ? hits.map(rowHtml).join('') : '<div class="empty-state"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" style="opacity:.3"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg><p><b>' + esc(t('none')) + '</b>' + esc(t('noneSub')) + '</p></div>';
    } else if (S.view === 'folder' && S.cat) {
      var c = CAT[S.cat];
      var list = lib.sounds.filter(function (s) { return s.cat === S.cat; });
      list.sort(S.sort === 'name' ? function (a, b) { return a.name.localeCompare(b.name); } : function (a, b) { return a.dur - b.dur; });
      h += '<div class="fhead"><button class="fback" type="button" id="fback">' + svg('<path d="M15 18l-6-6 6-6"/>', 14) + '</button>' +
        '<div class="fhead-ic" style="background:' + hexA(c.color, .16) + ';color:' + c.color + '">' + svg(ICON[c.id], 16) + '</div>' +
        '<div class="fhead-info"><div class="fhead-name">' + esc(catName(c.id)) + '</div><div class="fhead-n">' + c.count + ' ' + esc(t('sounds')) + '</div></div></div>';
      h += list.map(rowHtml).join('');
      var more = lib.more[c.id] || [];
      h += '<div class="more-strip"><div><b>' + esc(t('more').replace('{n}', more.length)) + '</b><span>' + esc(t('moreSub')) + '</span></div><button type="button" id="btnUnlock">' + esc(t('unlock')) + ' →</button></div>';
      h += more.slice(0, 24).map(function (n) {
        return '<div class="file-item locked"><div class="file-mini-bars" style="border-color:' + hexA(c.color, .3) + ';background:' + hexA(c.color, .06) + '">' + bars([40, 80, 55, 30], c.color) + '</div>' +
          '<div class="file-info"><div class="file-name"><span class="file-name-text">' + esc(n) + '</span></div><div class="file-meta"><span>' + esc(t('locked')) + '</span></div></div>' +
          '<svg class="lock-ic" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg></div>';
      }).join('');
    } else {
      var cats = lib.cats.slice();
      if (PRIO.length) cats.sort(function (a, b) { var ia = PRIO.indexOf(a.id), ib = PRIO.indexOf(b.id); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
      h += '<div class="sec-label">' + svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', 11) + esc(t('libLabel')) + '</div><div class="fgrid">';
      h += cats.map(function (c) {
        return '<div class="fcard" data-cat="' + c.id + '" style="' + catCardStyle(c) + '">' + (PRIO.indexOf(c.id) >= 0 ? '<span class="prio">' + esc(t('forYou')) + '</span>' : '') +
          '<div class="fcard-ic">' + svg(ICON[c.id], 16) + '</div>' + deco() +
          '<div class="fcard-name">' + esc(catName(c.id)) + '</div><div class="fcard-n"><b>' + c.count + '</b> ' + esc(t('sounds')) + '</div></div>';
      }).join('') + '</div>';
    }
    fl.innerHTML = h;
    fl.scrollTop = 0;
    wireList();
  }
  function bars(ws, color) { return ws.map(function (w) { return '<span style="height:' + Math.max(18, w) + '%;background:' + color + '"></span>'; }).join(''); }
  function rowHtml(s) {
    var c = CAT[s.cat], w = s.w, n = w.length, pick = [w[Math.floor(n * .15)], w[Math.floor(n * .35)], w[Math.floor(n * .55)], w[Math.floor(n * .75)]];
    var tag = (s.tags || [])[0];
    return '<div class="file-item' + (S.sel === s.id ? ' active' : '') + '" data-id="' + s.id + '"' + (FINE ? ' draggable="true"' : '') + '>' +
      '<div class="file-mini-bars" style="border-color:' + hexA(c.color, .35) + ';background:' + hexA(c.color, .1) + '">' + bars(pick, c.color) + '</div>' +
      '<div class="file-info"><div class="file-name"><span class="file-name-text">' + esc(s.name) + '</span></div>' +
      '<div class="file-meta"><span class="dur-pill">' + s.dur.toFixed(1) + 's</span><span>MP3</span>' + (tag ? '<span class="file-tags"><span class="file-tag" style="background:' + hexA(c.color, .16) + ';color:' + c.color + '">' + esc(tag) + '</span></span>' : '') + (S.used && S.used[s.id] ? '<span class="use-badge">×' + S.used[s.id] + '</span>' : '') + '</div></div>' +
      '<div class="file-actions"><button class="fta-btn btn-qi" type="button" title="' + esc(t('insert')) + '"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg></button></div>' +
      '<div class="hover-progress"><div class="hover-progress-fill"></div></div></div>';
  }

  var hoverTimer = null;
  function wireList() {
    var back = $('fback');
    if (back) back.onclick = function () { S.view = 'home'; S.q = ''; $('search-input').value = ''; renderList(); };
    var un = $('btnUnlock');
    if (un) un.onclick = function () { post('cta', { pos: 'sim_folder', cat: S.cat }); if (!EMBED) location.href = '/comecar/?ref=simulador'; };
    document.querySelectorAll('.fcard[data-cat]').forEach(function (el) {
      el.onclick = function () { openFolder(el.getAttribute('data-cat')); };
    });
    document.querySelectorAll('.file-item[data-id]').forEach(function (el) {
      var id = el.getAttribute('data-id');
      el.addEventListener('click', function (e) {
        if (e.target.closest('.btn-qi')) { select(id, false); insert(id); return; }
        select(id, true);
      });
      el.addEventListener('dblclick', function () { insert(id); });
      if (FINE) {
        el.addEventListener('mouseenter', function () {
          clearTimeout(hoverTimer);
          hoverTimer = setTimeout(function () { if (ac && ac.state === 'running') playPreview(id, true); }, 140);
        });
        el.addEventListener('mouseleave', function () {
          clearTimeout(hoverTimer);
          if (prev && prev.id === id && prev.hover) stopPreview();
        });
        el.addEventListener('dragstart', function (e) {
          clearTimeout(hoverTimer); stopPreview();
          e.dataTransfer.setData('text/plain', 'dropsfx:' + id);
          e.dataTransfer.effectAllowed = 'copy';
          el.classList.add('dragging'); S.dragId = id;
          try { var g = document.createElement('div'); g.className = 'drag-ghost'; g.textContent = SND[id].name; document.body.appendChild(g); e.dataTransfer.setDragImage(g, 10, 10); setTimeout(function () { g.remove(); }, 0); } catch (x) {}
          hint(t('hint.drag'));
        });
        el.addEventListener('dragend', function () { el.classList.remove('dragging'); S.dragId = null; clearGhost(); });
      }
    });
  }

  function openFolder(id) {
    S.view = 'folder'; S.cat = id; S.q = ''; $('search-input').value = '';
    stopPreview(); renderList(); step(1);
    post('open_folder', { cat: id });
    // pré-carrega os sons da pasta
    if (ensureAC()) lib.sounds.filter(function (s) { return s.cat === id; }).slice(0, 6).forEach(function (s) { load(s.id).catch(function () {}); });
  }

  function select(id, play) {
    S.sel = id;
    document.querySelectorAll('.file-item.active').forEach(function (el) { el.classList.remove('active'); });
    var el = document.querySelector('.file-item[data-id="' + id + '"]'); if (el) el.classList.add('active');
    var s = SND[id];
    $('player-name').textContent = s.name; $('player-name').classList.remove('empty');
    $('player-ext').textContent = 'MP3'; $('time-tot').textContent = mmss(s.dur);
    $('btn-insert').disabled = false;
    drawWave(s);
    if (play) playPreview(id, false);
  }

  function drawWave(s) {
    var cv = $('waveform-canvas'), r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.max(10, r.width * dpr); cv.height = Math.max(10, r.height * dpr);
    var x = cv.getContext('2d'), W = cv.width, H = cv.height, c = CAT[s.cat].color, n = s.w.length, bw = W / n;
    x.clearRect(0, 0, W, H); x.fillStyle = hexA(c, .75);
    for (var i = 0; i < n; i++) { var h = Math.max(2 * dpr, s.w[i] / 100 * (H * .78)); x.fillRect(i * bw + bw * .18, (H - h) / 2, bw * .64, h); }
  }

  // ------------------------------------------------------------------ timeline
  var lanes = $('lanes'), heads = $('heads'), pps = 60, laneEls = [], phEl = null, ghostEl = null;
  function buildTimeline() {
    var hh = '<div class="rul"></div><div class="pr-h v"><span class="lk">' + svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>', 10) + '</span><span class="nm">V1</span></div>';
    TRACKS.forEach(function (n, i) { hh += '<div class="pr-h a' + (i === S.track && !S.auto ? ' tgt' : '') + '" data-tr="' + i + '"><span class="lk">' + svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>', 10) + '</span><span class="nm">' + n + '</span><span class="ms"><span>M</span><span>S</span></span></div>'; });
    heads.innerHTML = hh;
    var lh = '<div class="pr-ruler" id="ruler"></div><div class="pr-lane v" id="laneV"></div>';
    TRACKS.forEach(function (n, i) { lh += '<div class="pr-lane a" data-tr="' + i + '"></div>'; });
    lh += '<div class="pr-ph" id="ph"></div>';
    lanes.innerHTML = lh;
    laneEls = [].slice.call(lanes.querySelectorAll('.pr-lane.a'));
    phEl = $('ph');
    heads.querySelectorAll('.pr-h.a').forEach(function (h) { h.onclick = function () { setTrack(+h.getAttribute('data-tr'), true); }; });
    layoutTimeline();
  }
  function layoutTimeline() {
    if (!lib || !laneEls.length) return;
    var w = lanes.clientWidth || 600;
    pps = w / SEQ;
    var r = $('ruler'), rh = '';
    for (var s = 0; s <= SEQ; s += 0.5) {
      var x = s * pps, major = s % 1 === 0;
      rh += '<span class="tk' + (major ? ' m' : '') + '" style="left:' + x + 'px"></span>';
      if (major && s % (simEl.classList.contains('compact') ? 4 : 2) === 0 && s > 0 && s < SEQ) rh += '<span class="lb" style="left:' + x + 'px">' + tc(s).slice(3) + '</span>';
    }
    CUES.forEach(function (c) { rh += '<span class="pr-mk" style="left:' + (c.t * pps) + 'px;--mc:' + CAT[c.cat].color + '" data-t="' + esc(t('cue.' + c.k)) + '"></span>'; });
    r.innerHTML = rh;
    lanes.querySelectorAll('.pr-mkline').forEach(function (m) { m.remove(); });
    CUES.forEach(function (c) { var m = document.createElement('span'); m.className = 'pr-mkline'; m.style.left = (c.t * pps) + 'px'; m.style.borderColor = CAT[c.cat].color; lanes.appendChild(m); });
    $('laneV').innerHTML = SHOTS.map(function (sh) { return '<div class="pr-vclip" style="left:' + (sh.a * pps + 1) + 'px;width:' + ((sh.b - sh.a) * pps - 2) + 'px"><span>' + sh.n + '</span><i></i></div>'; }).join('');
    renderClips();
    setPh(S.ph, true);
  }
  function renderClips() {
    laneEls.forEach(function (l) { l.querySelectorAll('.pr-clip:not(.ghost)').forEach(function (c) { c.remove(); }); });
    S.clips.forEach(function (c) { laneEls[c.tr].appendChild(clipEl(c)); });
    $('btnClear').hidden = !S.clips.length;
  }
  function clipEl(c) {
    var s = SND[c.sid], col = CAT[s.cat].color, el = document.createElement('div');
    el.className = 'pr-clip' + (S.selClip === c.uid ? ' sel' : '') + (c.isNew ? ' new' : '');
    c.isNew = false;
    el.style.left = (c.start * pps) + 'px'; el.style.width = Math.max(4, c.dur * pps) + 'px';
    el.style.setProperty('--cc', col);
    el.setAttribute('data-uid', c.uid);
    el.title = s.name + ', ' + t('moveHint');
    el.innerHTML = '<span class="cn">' + esc(s.name) + '</span>' + (c.gain ? '<span class="cg">' + (c.gain > 0 ? '+' : '−') + Math.abs(c.gain) + 'dB</span>' : '') + '<canvas></canvas><button type="button" class="cx" aria-label="x">×</button>';
    requestAnimationFrame(function () { drawClipWave(el.querySelector('canvas'), s, c.gain); });
    return el;
  }
  function drawClipWave(cv, s, gain) {
    if (!cv) return;
    var r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.max(4, r.width * dpr); cv.height = Math.max(4, r.height * dpr);
    var x = cv.getContext('2d'), W = cv.width, H = cv.height, n = s.w.length, k = Math.min(1.4, db(gain || 0));
    x.fillStyle = 'rgba(0,0,0,.5)';
    for (var px = 0; px < W; px += 2 * dpr) {
      var i = Math.min(n - 1, Math.floor(px / W * n)), h = Math.max(1, s.w[i] / 100 * H * .9 * k);
      x.fillRect(px, (H - Math.min(H, h)) / 2, 1.3 * dpr, Math.min(H, h));
    }
  }

  function setPh(sec, quiet) {
    S.ph = Math.max(0, Math.min(SEQ, sec));
    if (phEl) phEl.style.left = (S.ph * pps) + 'px';
    $('tcTl').textContent = tc(S.ph); $('tcMon').textContent = tc(S.ph);
    if (!S.playing) drawFrame(S.ph);
  }

  // inserir: Auto escolhe a primeira faixa livre no playhead; senão sobrescreve na faixa escolhida
  function freeTrack(start, dur, skip) {
    for (var i = 0; i < TRACKS.length; i++) {
      var busy = S.clips.some(function (c) { return c.tr === i && c.uid !== skip && c.start < start + dur - 0.01 && start < c.start + c.dur - 0.01; });
      if (!busy) return i;
    }
    return -1;
  }
  function insert(id, atTime, atTrack, how) {
    var s = SND[id]; if (!s) return;
    var start = atTime != null ? atTime : S.ph, tr = atTrack != null ? atTrack : (S.auto ? freeTrack(start, s.dur) : S.track);
    if (tr < 0) tr = S.track;
    // sobrescreve o que estiver embaixo (como o Premiere faz)
    S.clips = S.clips.filter(function (c) { return !(c.tr === tr && c.start < start + s.dur - 0.01 && start < c.start + c.dur - 0.01); });
    var clip = { uid: S.uid++, sid: id, tr: tr, start: start, dur: s.dur, gain: S.gain, isNew: true };
    S.clips.push(clip); S.selClip = clip.uid;
    S.used = S.used || {}; S.used[id] = (S.used[id] || 0) + 1;
    load(id).catch(function () {});
    renderClips();
    toast('success', '✓', t('inserted').replace('{t}', TRACKS[tr]).replace('{tc}', tc(start)));
    step(3);
    if (!S.steps[4]) { $('btnPlay').classList.add('pulse'); hint(t('hint.play')); }
    if (false && !S.revealed) { S.revealed = true; setTimeout(function () { post('reveal', { y: Math.round(document.querySelector('.pr-mon').getBoundingClientRect().top + window.scrollY) - 8 }); }, 650); }
    post('insert', { id: id, cat: s.cat, track: TRACKS[tr], at: Math.round(start * 100) / 100, gain: S.gain, how: how || (atTime != null ? 'drag' : 'button') });
    var row = document.querySelector('.file-item[data-id="' + id + '"] .file-meta');
    if (row && !row.querySelector('.use-badge')) row.insertAdjacentHTML('beforeend', '<span class="use-badge">×' + S.used[id] + '</span>');
    else if (row) row.querySelector('.use-badge').textContent = '×' + S.used[id];
  }

  // arrastar do painel pra timeline
  function laneAt(y) { for (var i = 0; i < laneEls.length; i++) { var r = laneEls[i].getBoundingClientRect(); if (y >= r.top && y < r.bottom) return i; } return -1; }
  function timeAt(x) { var r = lanes.getBoundingClientRect(); return Math.max(0, Math.min(SEQ - 0.05, (x - r.left) / pps)); }
  function snap(sec, skipUid) {
    var pts = CUES.map(function (c) { return c.t; }).concat([S.ph, 0]);
    S.clips.forEach(function (c) { if (c.uid !== skipUid) { pts.push(c.start, c.start + c.dur); } });
    var best = sec, bd = 8 / pps;
    pts.forEach(function (p) { var d = Math.abs(p - sec); if (d < bd) { bd = d; best = p; } });
    return best;
  }
  function clearGhost() { if (ghostEl) { ghostEl.remove(); ghostEl = null; } laneEls.forEach(function (l) { l.classList.remove('drop'); }); }
  lanes.addEventListener('dragover', function (e) {
    if (!S.dragId) return;
    e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
    var tr = laneAt(e.clientY); if (tr < 0) { clearGhost(); return; }
    var s = SND[S.dragId], st = snap(timeAt(e.clientX));
    laneEls.forEach(function (l, i) { l.classList.toggle('drop', i === tr); });
    if (!ghostEl) { ghostEl = document.createElement('div'); ghostEl.className = 'pr-clip ghost'; ghostEl.style.setProperty('--cc', CAT[s.cat].color); }
    if (ghostEl.parentNode !== laneEls[tr]) laneEls[tr].appendChild(ghostEl);
    ghostEl.style.left = (st * pps) + 'px'; ghostEl.style.width = (s.dur * pps) + 'px';
  });
  lanes.addEventListener('dragleave', function (e) { if (!lanes.contains(e.relatedTarget)) clearGhost(); });
  lanes.addEventListener('drop', function (e) {
    var data = e.dataTransfer.getData('text/plain') || '';
    if (data.indexOf('dropsfx:') !== 0) return;
    e.preventDefault();
    var id = data.slice(8), tr = laneAt(e.clientY);
    clearGhost();
    if (tr >= 0) insert(id, snap(timeAt(e.clientX)), tr, 'drag');
  });

  // playhead, seleção e mover clipes (mouse e toque)
  var drag = null;
  lanes.addEventListener('pointerdown', function (e) {
    var cx = e.target.closest('.cx');
    if (cx) { var u = +cx.parentNode.getAttribute('data-uid'); removeClip(u); e.stopPropagation(); return; }
    var clip = e.target.closest('.pr-clip');
    if (clip && !clip.classList.contains('ghost')) {
      var uid = +clip.getAttribute('data-uid'), c = S.clips.filter(function (x) { return x.uid === uid; })[0];
      S.selClip = uid;
      lanes.querySelectorAll('.pr-clip.sel').forEach(function (x) { x.classList.remove('sel'); }); clip.classList.add('sel');
      drag = { kind: 'clip', c: c, el: clip, x0: e.clientX, s0: c.start, tr0: c.tr, moved: false };
      clip.setPointerCapture(e.pointerId);
      return;
    }
    S.selClip = null; lanes.querySelectorAll('.pr-clip.sel').forEach(function (x) { x.classList.remove('sel'); });
    if (S.playing) stopPlay();
    drag = { kind: 'ph' }; setPh(timeAt(e.clientX));
    lanes.setPointerCapture(e.pointerId);
  });
  lanes.addEventListener('pointermove', function (e) {
    if (!drag) return;
    if (drag.kind === 'ph') { setPh(timeAt(e.clientX)); return; }
    var dx = e.clientX - drag.x0;
    if (!drag.moved && Math.abs(dx) < 4 && laneAt(e.clientY) === drag.tr0) return;
    drag.moved = true;
    var st = snap(Math.max(0, Math.min(SEQ - 0.1, drag.s0 + dx / pps)), drag.c.uid), tr = laneAt(e.clientY);
    drag.c.start = st; drag.el.style.left = (st * pps) + 'px';
    if (tr >= 0 && tr !== drag.c.tr) { drag.c.tr = tr; laneEls[tr].appendChild(drag.el); }
  });
  function endDrag() {
    if (drag && drag.kind === 'clip' && drag.moved) {
      var c = drag.c;
      S.clips = S.clips.filter(function (x) { return x === c || !(x.tr === c.tr && x.start < c.start + c.dur - 0.01 && c.start < x.start + x.dur - 0.01); });
      renderClips(); post('move_clip', { id: c.sid });
    }
    drag = null;
  }
  lanes.addEventListener('pointerup', endDrag);
  lanes.addEventListener('pointercancel', endDrag);
  function removeClip(uid) {
    S.clips = S.clips.filter(function (c) { return c.uid !== uid; });
    if (S.selClip === uid) S.selClip = null;
    renderClips(); toast('info', '✕', t('removed'));
  }

  // ------------------------------------------------------------------ play
  function startPlay() {
    if (!ensureAC()) return;
    stopPreview();
    if (S.ph >= SEQ - 0.05) setPh(0);
    S.playing = true; $('icoPlay').innerHTML = '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>';
    $('btnPlay').classList.remove('pulse');
    playT0 = S.ph; playAc = ac.currentTime + 0.06;
    timeline = [];
    var need = S.clips.filter(function (c) { return !bufs[c.sid]; });
    Promise.all(need.map(function (c) { return load(c.sid).catch(function () {}); })).then(function () {
      if (!S.playing) return;
      playAc = ac.currentTime + 0.04; playT0 = S.ph;
      S.clips.forEach(function (c) {
        var b = bufs[c.sid]; if (!b) return;
        if (c.start + c.dur <= playT0) return;
        var src = ac.createBufferSource(), g = ac.createGain();
        src.buffer = b; g.gain.value = db(c.gain || 0);
        src.connect(g); g.connect(master);
        var off = Math.max(0, playT0 - c.start), when = playAc + Math.max(0, c.start - playT0);
        try { src.start(when, off); timeline.push(src); } catch (e) {}
      });
      if (S.clips.length) { step(4); }
      post('play', { clips: S.clips.length, from: Math.round(playT0 * 10) / 10 });
      requestAnimationFrame(loop);
    });
  }
  function stopPlay() {
    S.playing = false; $('icoPlay').innerHTML = '<path d="M7 4l13 8-13 8z"/>';
    timeline.forEach(function (s) { try { s.stop(); } catch (e) {} }); timeline = [];
  }
  function loop() {
    if (!S.playing) return;
    var now = playT0 + (ac.currentTime - playAc);
    if (now >= SEQ) { setPhLive(SEQ); stopPlay(); drawFrame(SEQ - 0.001); if (S.clips.length) hint(t('hint.done')); return; }
    setPhLive(Math.max(playT0, now));
    requestAnimationFrame(loop);
  }
  function setPhLive(sec) { S.ph = sec; if (phEl) phEl.style.left = (sec * pps) + 'px'; $('tcTl').textContent = tc(sec); $('tcMon').textContent = tc(sec); drawFrame(sec); }

  // medidor de áudio
  var meterBars = [].slice.call(document.querySelectorAll('#meter i')), mbuf = null;
  (function meter() {
    if (analyser) {
      if (!mbuf) mbuf = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(mbuf);
      var s = 0, pk = 0; for (var i = 0; i < mbuf.length; i++) { s += mbuf[i] * mbuf[i]; pk = Math.max(pk, Math.abs(mbuf[i])); }
      var rms = Math.sqrt(s / mbuf.length), dbv = 20 * Math.log10(rms + 1e-6), l = Math.max(0, Math.min(100, (dbv + 48) / 48 * 100));
      meterBars[0].style.setProperty('--l', l + '%'); meterBars[1].style.setProperty('--l', Math.max(0, l - 3 + Math.random() * 4) + '%');
    }
    requestAnimationFrame(meter);
  })();

  // ------------------------------------------------------------------ vídeo (desenhado no canvas)
  var cv = $('vid'), g = cv.getContext('2d'), W = cv.width, H = cv.height;
  var FONT = getComputedStyle(document.body).fontFamily;
  var LOGO = new Image(); LOGO.onload = function () { if (!S.playing) drawFrame(S.ph); }; LOGO.src = 'logo.webp';
  function logo(cx, cy, w) { if (!LOGO.complete || !LOGO.naturalWidth) return; var h = w * LOGO.naturalHeight / LOGO.naturalWidth; g.drawImage(LOGO, cx - w / 2, cy - h / 2, w, h); }
  function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function easeOut(x) { return 1 - Math.pow(1 - clamp(x, 0, 1), 3); }
  function drawFrame(tt) {
    g.save(); g.clearRect(0, 0, W, H);
    // tremida no impacto e no drop
    var sh = 0;
    if (tt >= .35 && tt < 1.2) sh = 16 * Math.exp(-(tt - .35) * 8);
    if (tt >= 9.6 && tt < 10.6) sh = 22 * Math.exp(-(tt - 9.6) * 7);
    if (sh) g.translate(Math.sin(tt * 91) * sh, Math.cos(tt * 77) * sh);
    if (tt < 2.4) shotA(tt); else if (tt < 4.8) shotB(tt - 2.4); else if (tt < 7.2) shotC(tt - 4.8, tt); else if (tt < 9.6) shotD(tt - 7.2); else shotE(tt - 9.6);
    g.restore();
    // whip pan: rastros no corte do 2.4
    var k = 1 - Math.abs(tt - 2.4) / .32;
    if (k > 0) {
      g.save(); g.globalAlpha = clamp(k, 0, 1);
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
      for (var i = 0; i < 46; i++) { var y = rnd(i) * H, len = 200 + rnd(i + 9) * 700, x = ((rnd(i + 3) * W * 2 + tt * 9000) % (W * 2)) - W * .5; g.fillStyle = 'rgba(255,255,255,' + (0.08 + rnd(i + 5) * .35) + ')'; g.fillRect(x, y, len, 1 + rnd(i + 7) * 5); }
      g.restore();
    }
    // vinheta
    var vg = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
  }
  function flash(a) { if (a > 0) { g.fillStyle = 'rgba(255,255,255,' + clamp(a, 0, 1) + ')'; g.fillRect(-50, -50, W + 100, H + 100); } }
  function shotA(u) {
    var bg = g.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W * .7); bg.addColorStop(0, '#13204d'); bg.addColorStop(1, '#030409');
    g.fillStyle = bg; g.fillRect(-50, -50, W + 100, H + 100);
    var pre = u < .35, sc = pre ? 2.6 - (u / .35) * 1.6 : 1 + .05 * Math.exp(-(u - .35) * 7);
    if (!pre) { // estilhaços
      for (var i = 0; i < 26; i++) { var a = rnd(i) * Math.PI * 2, d = easeOut((u - .35) * 1.4) * (160 + rnd(i + 2) * 320); g.strokeStyle = 'rgba(110,155,255,' + clamp(.8 - (u - .35), 0, .8) + ')'; g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2 + Math.cos(a) * d * .7, H / 2 + Math.sin(a) * d * .7); g.lineTo(W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d); g.stroke(); }
    }
    g.save(); g.translate(W / 2, H / 2 - 10); g.scale(sc, sc);
    g.globalAlpha = pre ? u / .35 : 1;
    logo(0, 0, 560); g.restore();
    flash(u >= .35 ? .9 * (1 - (u - .35) / .22) : 0);
  }
  function shotB(u) {
    var sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#120a2e'); sky.addColorStop(.55, '#6b2a5c'); sky.addColorStop(.78, '#f07a4a'); sky.addColorStop(1, '#2a0f1f');
    g.fillStyle = sky; g.fillRect(-50, -50, W + 100, H + 100);
    var sun = g.createRadialGradient(W * .62, H * .64, 10, W * .62, H * .64, 160); sun.addColorStop(0, 'rgba(255,214,150,1)'); sun.addColorStop(.35, 'rgba(255,150,90,.9)'); sun.addColorStop(1, 'rgba(255,120,80,0)');
    g.fillStyle = sun; g.beginPath(); g.arc(W * .62, H * .64 - u * 8, 160, 0, Math.PI * 2); g.fill();
    function ridge(base, amp, seed, col, off) { g.fillStyle = col; g.beginPath(); g.moveTo(-60, H + 50); for (var x = -60; x <= W + 60; x += 20) { var y = base - amp * (Math.sin((x + off) * .006 + seed) * .6 + Math.sin((x + off) * .017 + seed * 2) * .4); g.lineTo(x, y); } g.lineTo(W + 60, H + 50); g.fill(); }
    ridge(H * .72, 60, 1, '#3a1638', u * 25); ridge(H * .82, 50, 3, '#1d0b1e', u * 55); ridge(H * .93, 30, 5, '#0b0410', u * 110);
    for (var i = 0; i < 4; i++) { var bx = ((rnd(i) * W + u * (60 + i * 15)) % W), by = H * (.25 + rnd(i + 4) * .2); g.strokeStyle = 'rgba(20,8,20,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(bx - 8, by - 3); g.quadraticCurveTo(bx - 3, by - 7, bx, by); g.quadraticCurveTo(bx + 3, by - 7, bx + 8, by - 3); g.stroke(); }
  }
  function shotC(u, tt) {
    g.fillStyle = '#07080c'; g.fillRect(-50, -50, W + 100, H + 100);
    g.strokeStyle = 'rgba(255,255,255,.04)'; g.lineWidth = 1;
    for (var x = 0; x < W; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (var y = 0; y < H; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    var px = W / 2 - 120, py = 40, pw = 240, phh = 460;
    rr(px, py, pw, phh, 34, '#111318', 'rgba(255,255,255,.12)');
    rr(px + 18, py + 36, pw - 36, 150, 18, '#1b2340');
    g.fillStyle = '#6e9bff'; g.font = '800 26px ' + FONT; g.textAlign = 'left'; g.fillText('dropSFX', px + 36, py + 120);
    var btns = [{ y: py + 210, t: 5.3, ic: '♥' }, { y: py + 290, t: 5.9, ic: '↗' }, { y: py + 370, t: 6.5, ic: '★' }];
    btns.forEach(function (b, i) {
      var d = tt - b.t, on = d >= 0 && d < .28, done = d >= 0;
      var s = on ? 1 + .06 * Math.sin(d / .28 * Math.PI) : 1;
      g.save(); g.translate(px + pw / 2, b.y + 28); g.scale(s, s);
      rr(-(pw - 36) / 2, -28, pw - 36, 56, 16, done ? '#3b6ef5' : '#1c1f27', done ? null : 'rgba(255,255,255,.08)');
      g.fillStyle = '#fff'; g.font = '700 22px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(b.ic, 0, 1);
      g.restore();
      if (d >= 0 && d < .5) { g.strokeStyle = 'rgba(110,155,255,' + (1 - d / .5) + ')'; g.lineWidth = 3; g.beginPath(); g.arc(px + pw / 2 + 30, b.y + 28, 10 + d * 140, 0, Math.PI * 2); g.stroke(); }
      if (d >= 0 && d < .9) { g.globalAlpha = 1 - d / .9; g.fillStyle = '#9fbbff'; g.font = '800 22px ' + FONT; g.fillText('+1', px + pw + 40, b.y + 20 - d * 60); g.globalAlpha = 1; }
    });
    // cursor
    var pts = [{ t: 4.8, x: W * .85, y: H * .9 }, { t: 5.3, x: px + pw / 2 + 30, y: btns[0].y + 28 }, { t: 5.9, x: px + pw / 2 + 30, y: btns[1].y + 28 }, { t: 6.5, x: px + pw / 2 + 30, y: btns[2].y + 28 }, { t: 7.2, x: px + pw / 2 + 60, y: btns[2].y + 60 }];
    var cx = pts[0].x, cy = pts[0].y;
    for (var i = 0; i < pts.length - 1; i++) { if (tt >= pts[i].t && tt <= pts[i + 1].t) { var k = easeOut((tt - pts[i].t) / (pts[i + 1].t - pts[i].t) * 1.25); cx = pts[i].x + (pts[i + 1].x - pts[i].x) * k; cy = pts[i].y + (pts[i + 1].y - pts[i].y) * k; } }
    if (tt > pts[pts.length - 1].t) { cx = pts[pts.length - 1].x; cy = pts[pts.length - 1].y; }
    g.save(); g.translate(cx, cy); g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 30); g.lineTo(8, 23); g.lineTo(14, 36); g.lineTo(19, 34); g.lineTo(13, 21); g.lineTo(23, 21); g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  function rr(x, y, w, h, r, fill, stroke) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1.5; g.stroke(); } }
  function shotD(u) {
    var p = u / 2.4;
    g.fillStyle = 'rgb(' + Math.round(4 + p * 18) + ',' + Math.round(5 + p * 20) + ',' + Math.round(12 + p * 50) + ')'; g.fillRect(-50, -50, W + 100, H + 100);
    var z = 1 + p * p * .25; g.save(); g.translate(W / 2, H / 2); g.scale(z, z);
    for (var i = 0; i < 16; i++) {
      var f = ((i / 16) + p * p * 2.6) % 1, r = f * f * 720;
      g.strokeStyle = 'rgba(' + Math.round(110 + p * 145) + ',' + Math.round(155 + p * 100) + ',255,' + (f * .9) + ')'; g.lineWidth = 1 + f * 5;
      g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke();
    }
    g.restore();
    var n = 24;
    for (var j = 0; j < n; j++) { var hh = (40 + rnd(j) * 60) * (0.25 + p * 1.6) * (0.8 + .2 * Math.sin(u * 20 + j)); g.fillStyle = 'rgba(110,155,255,' + (0.35 + p * .6) + ')'; g.fillRect(W / 2 - n * 9 + j * 18, H - 40 - hh, 10, hh); }
    flash(p > .85 ? (p - .85) / .15 * .45 : 0);
  }
  function shotE(u) {
    var bg = g.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * .65); bg.addColorStop(0, '#16245a'); bg.addColorStop(1, '#000');
    g.fillStyle = bg; g.fillRect(-50, -50, W + 100, H + 100);
    if (u < 1.2) { g.strokeStyle = 'rgba(110,155,255,' + (1 - u / 1.2) + ')'; g.lineWidth = 10 * (1 - u / 1.2) + 1; g.beginPath(); g.arc(W / 2, H / 2, easeOut(u / 1.2) * 620, 0, Math.PI * 2); g.stroke(); }
    for (var i = 0; i < 40; i++) { var a = rnd(i) * Math.PI * 2, d = easeOut(u * .8) * (120 + rnd(i + 1) * 420), al = clamp(1 - u / 2, 0, 1); g.fillStyle = 'rgba(160,190,255,' + al + ')'; g.fillRect(W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d, 3, 3); }
    var sc = 1 + .18 * Math.exp(-u * 6);
    g.save(); g.translate(W / 2, H / 2); g.scale(sc, sc);
    g.shadowColor = 'rgba(59,110,245,.9)'; g.shadowBlur = 40;
    logo(0, 0, 600); g.shadowBlur = 0;
    g.restore();
    var ta = clamp((u - .9) / .6, 0, 1);
    if (ta) { g.globalAlpha = ta; g.fillStyle = '#9a9aab'; g.font = '600 22px ' + FONT; g.textAlign = 'center'; g.fillText('2,371 SFX, Premiere, After Effects, DaVinci', W / 2, H / 2 + 120); g.globalAlpha = 1; }
    flash(u < .3 ? .95 * (1 - u / .3) : 0);
  }

  // ------------------------------------------------------------------ passos, dicas, toasts
  function step(n) {
    if (S.steps[n]) return;
    S.steps[n] = true;
    renderSteps();
    post('step', { n: n });
  }
  function renderSteps() {
    var next = [1, 2, 3, 4].filter(function (n) { return !S.steps[n]; })[0];
    document.querySelectorAll('.pr-step').forEach(function (el) {
      var n = +el.getAttribute('data-s');
      el.classList.toggle('done', !!S.steps[n]); el.classList.toggle('now', n === next);
      el.querySelector('i').textContent = S.steps[n] ? '✓' : n;
    });
  }
  var hintTimer = null;
  function hint(txt, ms) {
    var h = $('tlHint'); h.textContent = txt; h.classList.add('show');
    clearTimeout(hintTimer); hintTimer = setTimeout(function () { h.classList.remove('show'); }, ms || 3200);
  }
  function toast(kind, ic, msg) {
    var w = $('toast-wrap'), el = document.createElement('div');
    el.className = 'toast ' + kind; el.innerHTML = '<span>' + esc(ic) + '</span><span>' + esc(msg) + '</span>';
    w.appendChild(el);
    setTimeout(function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 320); }, 2200);
    while (w.children.length > 2) w.firstChild.remove();
  }

  // ------------------------------------------------------------------ controles
  function setTrack(i, manual) {
    S.track = i; $('track-drop-label').textContent = TRACKS[i];
    if (manual) { S.auto = false; $('toggle-auto-track').classList.remove('on'); }
    $('track-drop').classList.toggle('auto-dim', S.auto);
    heads.querySelectorAll('.pr-h.a').forEach(function (h) { h.classList.toggle('tgt', !S.auto && +h.getAttribute('data-tr') === i); });
    renderTrackMenu();
  }
  function renderTrackMenu() {
    $('track-drop-menu').innerHTML = TRACKS.map(function (n, i) { return '<div class="track-drop-item' + (i === S.track ? ' selected' : '') + '" data-i="' + i + '">' + n + ', Audio ' + (i + 1) + '</div>'; }).join('');
    $('track-drop-menu').querySelectorAll('.track-drop-item').forEach(function (it) {
      it.onclick = function (e) { e.stopPropagation(); setTrack(+it.getAttribute('data-i'), true); $('track-drop').classList.remove('open'); };
    });
  }
  $('track-drop-btn').onclick = function (e) {
    e.stopPropagation();
    var d = $('track-drop'), open = !d.classList.contains('open');
    d.classList.toggle('open', open);
    if (open) { var r = $('track-drop-btn').getBoundingClientRect(), m = $('track-drop-menu'); m.style.left = r.left + 'px'; m.style.top = Math.max(8, r.top - 4 - 4 * 32 - 12) + 'px'; }
  };
  document.addEventListener('click', function () { $('track-drop').classList.remove('open'); });
  $('toggle-auto-track').onclick = function () { S.auto = !S.auto; this.classList.toggle('on', S.auto); setTrack(S.track, false); };
  document.querySelectorAll('.gain-pill').forEach(function (b) {
    b.onclick = function () { S.gain = +b.getAttribute('data-g'); document.querySelectorAll('.gain-pill').forEach(function (x) { x.classList.toggle('active', x === b); }); post('gain', { g: S.gain }); };
  });
  $('vol-slider').oninput = function () { if (prevBus) prevBus.gain.value = +this.value; };
  $('btn-play').onclick = function () {
    if (!S.sel) return;
    if (prev && prev.id === S.sel) stopPreview(); else playPreview(S.sel, false);
  };
  $('btn-insert').onclick = function () { if (S.sel) insert(S.sel); };
  $('waveform-wrap').onclick = function () { if (S.sel) playPreview(S.sel, false); };
  $('search-input').addEventListener('input', function () { S.q = this.value.trim(); if (!S.q && S.view !== 'folder') S.view = 'home'; renderList(); });
  $('sort-btn').onclick = function () { S.sort = S.sort === 'name' ? 'dur' : 'name'; this.textContent = t(S.sort === 'name' ? 'sort' : 'sortDur'); if (S.view === 'folder') renderList(); };
  document.querySelectorAll('.area-btn').forEach(function (b) {
    b.onclick = function () { if (b.getAttribute('data-area') === 'community') { toast('info', '★', t('commToast')); post('community'); } };
  });
  $('tabs-drop-btn').onclick = function () { S.view = 'home'; S.q = ''; $('search-input').value = ''; renderList(); };
  $('btnPlay').onclick = function () { if (S.playing) stopPlay(); else startPlay(); };
  $('btnStart').onclick = function () { if (S.playing) stopPlay(); setPh(0); };
  $('btnBack').onclick = function () { if (S.playing) stopPlay(); setPh(S.ph - 1 / FPS); };
  $('btnFwd').onclick = function () { if (S.playing) stopPlay(); setPh(S.ph + 1 / FPS); };
  $('btnClear').onclick = function () { stopPlay(); S.clips = []; S.selClip = null; renderClips(); post('clear'); };
  $('btnDemo').onclick = demo;
  window.addEventListener('keydown', function (e) {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); if (S.playing) stopPlay(); else startPlay(); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && S.selClip) { e.preventDefault(); removeClip(S.selClip); }
    else if (e.key === 'Enter' && S.sel) { e.preventDefault(); insert(S.sel, null, null, 'enter'); }
    else if (e.key === 'ArrowLeft') { if (S.playing) stopPlay(); setPh(S.ph - 1 / FPS); }
    else if (e.key === 'ArrowRight') { if (S.playing) stopPlay(); setPh(S.ph + 1 / FPS); }
  });

  // exemplo pronto: monta um sound design nos marcadores
  function peakAt(s) { var m = 0, mi = 0; s.w.forEach(function (v, i) { if (v > m) { m = v; mi = i; } }); return mi / s.w.length * s.dur; }
  function best(cat, fn) { var l = lib.sounds.filter(function (s) { return s.cat === cat; }); l.sort(fn); return l[0]; }
  function demo() {
    stopPlay();
    var hit = best('hits', function (a, b) { return (a.dur > 3.6) - (b.dur > 3.6) || peakAt(a) - peakAt(b); });
    var wh = best('whooshes', function (a, b) { return Math.abs(a.dur - 1.8) - Math.abs(b.dur - 1.8); });
    var cl = lib.sounds.filter(function (s) { return s.cat === 'clicks'; }).sort(function (a, b) { return a.dur - b.dur; });
    var ri = best('risers', function (a, b) { return Math.abs(peakAt(a) - 2.4) - Math.abs(peakAt(b) - 2.4); });
    var dr = best('drops', function (a, b) { return peakAt(a) - peakAt(b); });
    var tn = best('tonalidade', function (a, b) { return peakAt(a) - peakAt(b); });
    S.clips = [];
    var plan = [[hit, .35 - peakAt(hit), 0, 0], [wh, 2.4 - peakAt(wh), 1, 0], [cl[0], 5.3, 2, 0], [cl[1] || cl[0], 5.9, 2, 0], [cl[2] || cl[0], 6.5, 2, 0], [ri, 9.6 - peakAt(ri), 1, 0], [dr, 9.6 - peakAt(dr), 2, 0], [tn, 9.6 - peakAt(tn), 3, -12]];
    plan.forEach(function (p) { if (!p[0]) return; S.clips.push({ uid: S.uid++, sid: p[0].id, tr: p[2], start: Math.max(0, p[1]), dur: p[0].dur, gain: p[3], isNew: true }); load(p[0].id).catch(function () {}); });
    renderClips(); setPh(0);
    $('btnPlay').classList.add('pulse');
    toast('success', '✦', t('demoToast'));
    post('demo');
  }

  // ------------------------------------------------------------------ layout
  var simEl = $('sim');
  function fit() {
    var compact = window.innerWidth < 860;
    simEl.classList.toggle('compact', compact);
    var th = compact ? 26 : Math.max(34, Math.min(120, Math.round((window.innerHeight - 205) / 5.15)));
    document.documentElement.style.setProperty('--th', th + 'px');
    document.documentElement.style.setProperty('--tv', (th + 4) + 'px');
    if (EMBED && !compact) document.documentElement.style.setProperty('--h', window.innerHeight + 'px');
    layoutTimeline();
    if (S.sel) drawWave(SND[S.sel]);
    if (EMBED) post('height', { h: Math.ceil(simEl.getBoundingClientRect().height) });
  }
  window.addEventListener('resize', function () { clearTimeout(fit.t); fit.t = setTimeout(fit, 80); });

  // idioma pode mudar de fora (o funil manda quando a pessoa troca)
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.type === 'dropsfx-sim-cmd' && d.lang && LANGS.indexOf(d.lang) >= 0 && d.lang !== lang) { lang = d.lang; applyStatic(); renderList(); layoutTimeline(); }
  });

  // ------------------------------------------------------------------ início
  applyStatic(); renderSteps(); drawFrame(S.ph);
  fetch(BASE + 'lib.json').then(function (r) { return r.json(); }).then(function (d) {
    lib = d;
    d.cats.forEach(function (c) { CAT[c.id] = c; });
    d.sounds.forEach(function (s) { SND[s.id] = s; });
    $('tabs-drop-badge').textContent = d.total;
    buildTimeline(); renderList(); fit();
    post('ready');
  });
})();
