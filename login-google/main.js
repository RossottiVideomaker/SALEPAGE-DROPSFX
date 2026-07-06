/**
 * DropSFX – main.js  v4.2
 */
(function () {
  'use strict';

  // ── Supabase Auth ──────────────────────────────────────────
  const SUPA_URL  = 'https://bwgrxdjdvrdawarbnqjv.supabase.co';
  const SUPA_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3Z3J4ZGpkdnJkYXdhcmJucWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjIxNDgsImV4cCI6MjA5NDU5ODE0OH0.M1Yw6ljgUzPQWTW0CC8DBn8WV6nZDKCCKTwzcZN_Zo0';
  const SUPA_HEADERS = { 'Content-Type': 'application/json', 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY };
  const STORE_TOKEN     = 'dropsfx_auth_token';
  const STORE_TOKEN_EXP = 'dropsfx_auth_exp';
  const STORE_REFRESH   = 'dropsfx_auth_refresh';   // refresh_token for silent renewal
  const STORE_USER      = 'dropsfx_auth_user';

  const STORE_LIB      = 'dropsfx_v4_lib';
  const STORE_VOL      = 'dropsfx_v4_vol';
  const STORE_SORT     = 'dropsfx_v4_sort';
  const STORE_AUTO     = 'dropsfx_v4_auto';
  const STORE_RECENTS  = 'dropsfx_v4_recents';
  const STORE_THEME    = 'dropsfx_v4_theme';
  const STORE_SEEDED   = 'dropsfx_v4_seeded';   // bundled library seeded flag
  const STORE_LIB_VER  = 'dropsfx_lib_version'; // which library.json version was seeded
  const STORE_FP       = 'dropsfx_v4_fp';       // device fingerprint
  const STORE_LIC      = 'dropsfx_v4_lic';      // last license verify result (cache)
  const STORE_TOUR     = 'dropsfx_v4_tour';     // onboarding tour completed flag
  const STORE_USE_COUNTS = 'dropsfx_v4_uses';   // per-file insertion counts (for "Most used")
  const STORE_GAIN     = 'dropsfx_v4_gain';     // default insertion gain in dB
  const MAX_RECENTS    = 20;

  // ── License control ─────────────────────────────────────────
  const VERIFY_URL        = SUPA_URL + '/functions/v1/verify-license';
  const HEARTBEAT_MS      = 60 * 60 * 1000;   // re-verify every 1 hour while open
  const SUPPORT_WHATSAPP  = '5527992625721';  // suporte DropSFX
  const SUPPORT_URL       = 'https://wa.me/' + SUPPORT_WHATSAPP;

  // ── Google Sign-In (device-code / paste-code flow) ──────────
  // The panel can't receive an OAuth redirect (sandboxed Chromium with no
  // return URL), so login happens in the user's real browser on a web page we
  // host. That page creates a short pairing code tied to the Supabase session;
  // the user pastes the code here and the plugin swaps it for real tokens.
  // Web page (hosted on GitHub Pages) that runs the Google OAuth flow:
  const GOOGLE_LOGIN_PAGE = 'https://www.dropsfx.com.br/login-google/';
  // Edge Function that stores/redeems the pairing code:
  const PAIR_CLAIM_URL    = SUPA_URL + '/functions/v1/pair-code';

  const FOLDER_COLORS = [
    {key:'grey',hex:'#94a3b8'},{key:'red',hex:'#f87171'},{key:'orange',hex:'#fb923c'},
    {key:'yellow',hex:'#facc15'},{key:'green',hex:'#4ade80'},{key:'teal',hex:'#2dd4bf'},
    {key:'blue',hex:'#60a5fa'},{key:'purple',hex:'#a78bfa'},{key:'pink',hex:'#f472b6'},
  ];

  // SVG icon paths per bundled category name (fallback: music note)
  const CAT_ICONS = {
    'Whooshes':'<path d="M3 8h10a3 3 0 100-6M3 12h14a3 3 0 110 6M3 16h6"/>',
    'Transitions':'<path d="M7 7h13M17 4l3 3-3 3M17 17H4M7 14l-3 3 3 3"/>',
    'Cinematic Drops':'<path d="M12 2l4 6-4 14-4-14z"/><path d="M2 8h20"/>',
    'Clicks & UI':'<path d="M4 4l7 17 2.5-7L21 11.5z"/>',
    'Foley & Diegese':'<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0M12 17v5M8 22h8"/>',
    'Risers':'<path d="M3 17c4 0 5-10 9-10s4 6 9 6"/><path d="M17 5l4-1-1 4"/>',
    'Elements':'<path d="M12 2c2 4 6 6 6 11a6 6 0 11-12 0c0-5 4-7 6-11z"/>',
    'Memes & Cartoon':'<circle cx="12" cy="12" r="9"/><path d="M8 10h.01M16 10h.01M8 15s1.5 2 4 2 4-2 4-2"/>',
    'Hits & Impacts':'<path d="M12 2l2 6 6-2-4 5 5 4-6 1 1 6-4-4-4 4 1-6-6-1 5-4-4-5 6 2z"/>',
    'Glitches':'<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>',
    'Guns':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>',
    'Reverb':'<circle cx="12" cy="12" r="2"/><path d="M8 12a4 4 0 014-4M16 12a4 4 0 01-4 4"/><path d="M5 12a7 7 0 017-7M19 12a7 7 0 01-7 7" opacity=".55"/>',
    'Retro':'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M8 2l4 4 4-4M8 11v3M12 10v5M16 12v2"/>',
    'Tonalidade':'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    'HUD & Digital':'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    'Ambientes':'<path d="M3 21h18M5 21V8l5-4v17M14 21V10l5 3v8"/>',
    'Natureza':'<path d="M11 20A7 7 0 014 13c0-4 3-8 8-10 0 0 8 2 8 10a7 7 0 01-7 7z"/><path d="M12 21v-9"/>',
    'Emoção':'<path d="M12 21s-8-4.5-8-11a4.5 4.5 0 018-3 4.5 4.5 0 018 3c0 6.5-8 11-8 11z"/>',
    'Camera':'<path d="M23 7l-7 5 7 5z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
    'Bells & Buttons':'<path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>',
    'Slow Motion':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  };
  const USER_FOLDER_ICON = '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>';
  function catIcon(name){ return CAT_ICONS[name] || USER_FOLDER_ICON; }
  function isUserFolder(f){ return !String(f.id).startsWith('seed_'); }

  const PRESET_TAGS = [
    {id:'impact',label:'Impact',color:'#ef4444'},{id:'whoosh',label:'Whoosh',color:'#f97316'},
    {id:'riser',label:'Riser',color:'#eab308'},{id:'foley',label:'Foley',color:'#22c55e'},
    {id:'ambient',label:'Ambient',color:'#06b6d4'},{id:'music',label:'Música',color:'#8b5cf6'},
    {id:'voice',label:'Voz',color:'#ec4899'},{id:'glitch',label:'Glitch',color:'#64748b'},
  ];

  const AUDIO_EXTS = /\.(mp3|wav|ogg|flac|aac|m4a|aif|aiff|wma|opus|webm)$/i;
  const AUDIO_MIME = /^audio\//;

  // ── Library ──────────────────────────────────────────────────
  const lib = {
    items:[],
    folders(){ return this.items.filter(i=>i.type==='folder'); },
    files(){   return this.items.filter(i=>i.type==='file');   },
    folderById(id){ return this.items.find(i=>i.type==='folder'&&i.id===id)||null; },
    fileById(id){   return this.items.find(i=>i.type==='file'&&i.id===id)||null;   },
    filesInFolder(fid){ return this.items.filter(i=>i.type==='file'&&i.folderId===fid); },
    looseFiles(){ return this.items.filter(i=>i.type==='file'&&!i.folderId); },
  };

  const state = {
    selectedId:null, isPlaying:false, isLooping:false,
    volume:parseFloat(localStorage.getItem(STORE_VOL)||'0.85'),
    sortOrder:localStorage.getItem(STORE_SORT)||'name',
    searchQuery:'', activeTab:'library', activeTagFilter:null,
    isCEP:typeof window.__adobe_cep__!=='undefined',
    platform:'unknown',
    autoTrack:localStorage.getItem(STORE_AUTO)!=='0',  // default ON; off only if user explicitly disabled
    recents:[],
    trial:false,  // updated by verifyLicense; true = restrict to 50 SFX
    openFolderId:null,  // folder currently open in the folder-view (null = home grid)
    useCounts: (()=>{ try{return JSON.parse(localStorage.getItem(STORE_USE_COUNTS)||'{}');}catch(e){return{};} })(),
    insertGainDb: parseFloat(localStorage.getItem(STORE_GAIN) || '0') || 0,
  };

  // Hover preview
  let hoverTimer=null, hoverCtx=null, hoverSource=null,
      hoverGain=null, hoverStartedAt=0, hoverAnimFrame=null;

  // Main audio
  let audioCtx=null, audioBuffer=null, sourceNode=null,
      gainNode=null, startOffset=0, startedAt=0, animFrame=null;

  // Trim state
  let trimIn=null, trimOut=null, trimDragging=null;

  // Modal state
  let editingFileId=null;

  // ── DOM ──────────────────────────────────────────────────────
  const g = id => document.getElementById(id);
  const dom = {
    fileInput:      ()=>g('file-input'),
    folderInput:    ()=>g('folder-input'),
    fileList:       ()=>g('file-list'),
    fileCount:      ()=>g('file-count'),
    libLabel:       ()=>g('lib-label'),
    searchInput:    ()=>g('search-input'),
    sortBtn:        ()=>g('sort-btn'),
    statusDot:      ()=>g('status-dot'),
    statusText:     ()=>g('status-text'),
    tagBar:         ()=>g('tag-bar'),
    waveCanvas:     ()=>g('waveform-canvas'),
    wavePlayed:     ()=>g('wave-played'),
    waveCursor:     ()=>g('wave-cursor'),
    waveHover:      ()=>g('wave-hover'),
    waveWrap:       ()=>g('waveform-wrap'),
    waveLoading:    ()=>g('wave-loading'),
    btnPlay:        ()=>g('btn-play'),
    playIcon:       ()=>g('play-icon'),
    btnStop:        ()=>g('btn-stop'),
    btnLoop:        ()=>g('btn-loop'),
    volSlider:      ()=>g('vol-slider'),
    timeCur:        ()=>g('time-cur'),
    timeTot:        ()=>g('time-tot'),
    timeFill:       ()=>g('time-fill'),
    playerName:     ()=>g('player-name'),
    playerExt:      ()=>g('player-ext'),
    playerBpm:      ()=>g('player-bpm'),
    trimIn:         ()=>g('trim-in'),
    trimOut:        ()=>g('trim-out'),
    trimRegion:     ()=>g('trim-region'),
    trimBadge:      ()=>g('trim-badge'),
    trimDur:        ()=>g('trim-dur'),
    btnTrimReset:   ()=>g('btn-trim-reset'),
    insertLabel:    ()=>g('insert-label'),
    trackDrop:      ()=>g('track-drop'),
    trackDropBtn:   ()=>g('track-drop-btn'),
    trackDropLabel: ()=>g('track-drop-label'),
    trackDropMenu:  ()=>g('track-drop-menu'),
    toggleAutoTrack:()=>g('toggle-auto-track'),
    btnInsert:      ()=>g('btn-insert'),
    btnImport:      ()=>g('btn-import'),
    toastWrap:      ()=>g('toast-wrap'),
    dragOverlay:    ()=>g('drag-overlay'),
    newFolderRow:   ()=>g('new-folder-row'),
    newFolderName:  ()=>g('new-folder-name'),
    tagModal:       ()=>g('tag-modal'),
    modalRename:    ()=>g('modal-rename'),
    modalBpm:       ()=>g('modal-bpm'),
    tagsGrid:       ()=>g('tags-grid'),
  };

  // ════════════════════════════════════════════════════════════
  // INIT
  // ════════════════════════════════════════════════════════════
  function init() {
    applyTheme(localStorage.getItem(STORE_THEME) || 'dark');
    if (isLoggedIn()) {
      // User already has a session — verify license before opening
      verifyAndProceed({ skipSplash: true });
    } else {
      showLoginScreen();
    }
  }

  // ════════════════════════════════════════════════════════════
  // AUTH
  // ════════════════════════════════════════════════════════════
  function isLoggedIn() {
    const token = localStorage.getItem(STORE_TOKEN);
    const exp   = parseInt(localStorage.getItem(STORE_TOKEN_EXP) || '0', 10);
    return !!token && Date.now() < exp;
  }

  function saveSession(access_token, expires_in, refresh_token) {
    localStorage.setItem(STORE_TOKEN, access_token);
    // expires_in is in seconds (Supabase default 3600 = 1h). Store the real expiry.
    const exp = Date.now() + (expires_in ? expires_in * 1000 : 3600 * 1000);
    localStorage.setItem(STORE_TOKEN_EXP, String(exp));
    if (refresh_token) localStorage.setItem(STORE_REFRESH, refresh_token);
  }

  function clearSession() {
    localStorage.removeItem(STORE_TOKEN);
    localStorage.removeItem(STORE_TOKEN_EXP);
    localStorage.removeItem(STORE_REFRESH);
    localStorage.removeItem(STORE_USER);
    localStorage.removeItem(STORE_LIC);
  }

  // Silently exchange the refresh_token for a fresh access_token.
  // Returns the new access_token, or null if refresh failed.
  async function refreshAccessToken() {
    const refresh = localStorage.getItem(STORE_REFRESH);
    if (!refresh) return null;
    try {
      const res = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: SUPA_HEADERS,
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.access_token) {
        saveSession(data.access_token, data.expires_in, data.refresh_token || refresh);
        return data.access_token;
      }
    } catch (e) {}
    return null;
  }

  async function supabaseSignIn(email, password, attempt) {
    attempt = attempt || 1;
    const res = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: SUPA_HEADERS,
      body: JSON.stringify({ email, password })
    });
    // Cold start — Supabase returns 503/504 when project is waking up
    if ((res.status === 503 || res.status === 504 || res.status === 0) && attempt < 4) {
      await new Promise(r => setTimeout(r, attempt * 2000)); // 2s, 4s, 6s
      return supabaseSignIn(email, password, attempt + 1);
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || 'Erro ao entrar');
    return data;
  }

  async function supabaseSignUp(email, password) {
    const res = await fetch(`${SUPA_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: SUPA_HEADERS,
      body: JSON.stringify({
        email,
        password,
        options: {
          emailRedirectTo: 'https://rossottivideomaker.github.io/DropSFX/'
        }
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || 'Erro ao criar conta');
    return data;
  }

  async function supabaseForgotPassword(email) {
    const res = await fetch(`${SUPA_URL}/auth/v1/recover`, {
      method: 'POST',
      headers: SUPA_HEADERS,
      body: JSON.stringify({
        email,
        options: {
          redirectTo: 'https://rossottivideomaker.github.io/dropsfx-password/'
        }
      })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error_description || data.msg || data.message || 'Erro ao enviar email');
    }
  }

  // ── Google Sign-In: redeem a pairing code for a real session ──
  // The web page created a short code (e.g. "DROP-4F9K") tied to the Supabase
  // session after Google login. Here the plugin sends that code to the
  // pair-code Edge Function and gets back the same tokens a password login
  // would produce. Everything downstream (verify-license, device lock, trial)
  // is unchanged.
  function normalizePairCode(raw) {
    // Accept "drop-4f9k", "DROP 4F9K", "4f9k" etc. → "DROP-4F9K"
    let s = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (s.startsWith('DROP')) s = s.slice(4);
    return s ? ('DROP-' + s) : '';
  }

  async function redeemPairingCode(code, attempt) {
    attempt = attempt || 1;
    const res = await fetch(PAIR_CLAIM_URL, {
      method: 'POST',
      headers: SUPA_HEADERS,
      body: JSON.stringify({ action: 'claim', code: code }),
    });
    // Cold start grace, same pattern as supabaseSignIn
    if ((res.status === 503 || res.status === 504 || res.status === 0) && attempt < 4) {
      await new Promise(r => setTimeout(r, attempt * 2000));
      return redeemPairingCode(code, attempt + 1);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const m = (data.error || data.message || '').toLowerCase();
      if (m.includes('expired'))   throw new Error('Este código expirou. Gere um novo no navegador.');
      if (m.includes('not found') || m.includes('invalid')) throw new Error('Código inválido. Confira e tente de novo.');
      if (m.includes('used'))      throw new Error('Este código já foi usado. Gere um novo.');
      throw new Error(data.error || data.message || 'Não foi possível validar o código');
    }
    if (!data.access_token) throw new Error('Resposta inválida do servidor');
    return data; // { access_token, expires_in, refresh_token, email }
  }

  function showLoginScreen() {
    const screen = g('login-screen');
    const app    = g('app');
    if (screen) screen.classList.remove('hidden');
    if (app)    app.style.display = 'none';
    bindLoginEvents();
  }

  function showApp() {
    const screen = g('login-screen');
    const app    = g('app');
    if (screen) screen.classList.add('hidden');
    if (app)    app.style.display = '';
    // Init app only once
    if (!showApp._initialized) {
      showApp._initialized = true;
      loadLibrary(); loadRecents(); bindEvents();
      dom.volSlider().value = state.volume;
      applyVolume(state.volume);
      dom.toggleAutoTrack().classList.toggle('on', state.autoTrack);
      setTrackDropDisabled(state.autoTrack);
      updateSortBtn(); renderTabCounts(); renderTagBar(); renderLibrary(); resetPlayer();
      initCEP();
      // First-run: load bundled SFX library, then re-render
      seedInitialLibrary(seeded => {
        if (seeded) {
          renderTabCounts(); renderTagBar(); renderLibrary();
          setStatus('Biblioteca atualizada ✨', 'info');
        }
        // First-run onboarding tour (after library is ready)
        if (!localStorage.getItem(STORE_TOUR)) {
          setTimeout(startTour, 700);
        }
      });
    }
  }

  // Verify license with server, then either open the app or show blocked screen.
  // Used after fresh login AND on auto-login at startup.
  async function verifyAndProceed(opts) {
    opts = opts || {};
    const result = await verifyLicense();
    if (!result.valid) {
      // If we're offline AND have a recent cached "valid" result, allow grace
      if (result.offline && result.reason !== 'unauthenticated') {
        state.trial = !!result.trial;
        if (opts.skipSplash) showApp(); else showSplashThenApp();
        startHeartbeat();
        return;
      }
      showBlockedScreen(result);
      return;
    }
    state.trial = !!result.trial;
    if (opts.skipSplash) showApp(); else showSplashThenApp();
    startHeartbeat();
  }

  // Play splash animation, then reveal the app underneath
  function showSplashThenApp() {
    const splash = g('splash-screen');
    if (!splash) { showApp(); return; }

    // Show splash on top (z-index 100000 covers login at 99999)
    splash.classList.remove('hidden', 'fade-out');
    // Force reflow so CSS animations restart cleanly on subsequent logins
    void splash.offsetWidth;

    // Reveal app behind the splash now so it's fully rendered when splash fades
    showApp();

    const SHOW_MS = 1600;  // time splash stays fully visible
    const FADE_MS = 450;   // matches CSS opacity transition

    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.classList.add('hidden');
        splash.classList.remove('fade-out');
      }, FADE_MS);
    }, SHOW_MS);
  }

  function bindLoginEvents() {
    const emailEl    = g('l-email');
    const passEl     = g('l-password');
    const btnEl      = g('login-btn');
    const btnText    = g('login-btn-text');
    const spinner    = g('login-spinner');
    const errorEl    = g('login-error');
    const successEl  = g('login-success');
    const pwToggle   = g('pw-toggle');
    const forgotLink = g('forgot-link');
    const footerLink = g('login-footer-link');

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.classList.add('visible');
      successEl.classList.remove('visible');
    }
    function showSuccess(msg) {
      successEl.textContent = msg;
      successEl.classList.add('visible');
      errorEl.classList.remove('visible');
    }
    function clearMessages() {
      errorEl.classList.remove('visible');
      successEl.classList.remove('visible');
    }
    function setLoading(on, msg) {
      btnEl.disabled = on;
      btnText.style.display = on ? 'none' : 'block';
      spinner.style.display = on ? 'block' : 'none';
      if (on && msg) {
        // Show status message below button
        let statusEl = g('login-status-msg');
        if (!statusEl) {
          statusEl = document.createElement('p');
          statusEl.id = 'login-status-msg';
          statusEl.style.cssText = 'font-size:10.5px;color:var(--txt-4);text-align:center;margin-top:8px;transition:opacity 0.3s;';
          btnEl.parentNode.insertBefore(statusEl, btnEl.nextSibling);
        }
        statusEl.textContent = msg;
        statusEl.style.opacity = '1';
      } else {
        const statusEl = g('login-status-msg');
        if (statusEl) statusEl.style.opacity = '0';
      }
    }

    // (Tabs removed — single sign-in flow. Account is auto-created on first
    //  login if the email exists in `licenses` but doesn't have a password yet.)

    // Password show/hide
    pwToggle.addEventListener('click', () => {
      passEl.type = passEl.type === 'password' ? 'text' : 'password';
    });

    // Forgot password
    forgotLink.addEventListener('click', async e => {
      e.preventDefault();
      const email = emailEl.value.trim();
      if (!email) { showError('Digite seu email primeiro'); return; }
      setLoading(true);
      try {
        await supabaseForgotPassword(email);
        showSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
      } catch(err) {
        showError(err.message);
      } finally {
        setLoading(false);
      }
    });

    // Submit — pure sign-in flow. Accounts are created by the Kiwify webhook
    // when a purchase is approved; users receive an email with a "set password"
    // link. The plugin itself cannot create accounts.
    async function handleSubmit() {
      clearMessages();
      const email    = emailEl.value.trim();
      const password = passEl.value;
      if (!email || !password) { showError('Preencha email e senha'); return; }
      if (password.length < 6) { showError('Senha deve ter pelo menos 6 caracteres'); return; }

      setLoading(true, 'Entrando…');
      // Progressive feedback during cold start retries
      const t1 = setTimeout(() => setLoading(true, 'Conectando ao servidor…'), 2100);
      const t2 = setTimeout(() => setLoading(true, 'Aguarde, servidor acordando…'), 4200);
      const t3 = setTimeout(() => setLoading(true, 'Quase lá…'), 6300);
      const clearTimers = () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };

      try {
        const data = await supabaseSignIn(email, password);
        clearTimers();
        saveSession(data.access_token, data.expires_in, data.refresh_token);
        localStorage.setItem(STORE_USER, email);
        await verifyAndProceed();
      } catch(err) {
        clearTimers();
        let raw = (err.message || 'Erro desconhecido');
        let m = raw.toLowerCase();
        let msg = raw, wrongCreds = false;
        if (m.includes('invalid login') || m.includes('invalid_grant') || m.includes('invalid credentials') || m.includes('credentials')) {
          msg = 'Senha incorreta. Verifique e tente novamente.'; wrongCreds = true;
        }
        else if (m.includes('email not confirmed')) msg = 'Confirme seu email antes de entrar';
        else if (m.includes('rate limit') || m.includes('over_email_send_rate_limit') || m.includes('too many')) msg = 'Limite atingido. Aguarde 1 minuto e tente novamente';
        else if (m.includes('fetch') || m.includes('network') || m.includes('failed')) msg = 'Sem conexão com o servidor';
        showError(msg);
        if (wrongCreds) {
          passEl.classList.add('input-error');
          passEl.value = '';
          passEl.focus();
        }
      } finally {
        setLoading(false);
      }
    }

    btnEl.addEventListener('click', handleSubmit);
    passEl.addEventListener('keydown', e => { if (e.key === 'Enter') handleSubmit(); });
    passEl.addEventListener('input', () => passEl.classList.remove('input-error'));
    emailEl.addEventListener('keydown', e => { if (e.key === 'Enter') passEl.focus(); });

    // ── Google Sign-In wiring ────────────────────────────────
    const googleBtn   = g('google-login-btn');
    const codeWrap    = g('google-code-wrap');
    const codeInput   = g('google-code-input');
    const codeConfirm = g('google-code-confirm');
    const codeReopen  = g('google-code-reopen');

    if (googleBtn && !googleBtn._bound) {
      googleBtn._bound = true;

      // Step 1: open the Google login page in the real browser, then reveal
      // the "paste your code" box.
      googleBtn.addEventListener('click', () => {
        clearMessages();
        openExternal(GOOGLE_LOGIN_PAGE);
        if (codeWrap) codeWrap.classList.add('visible');
        showSuccess('Uma aba abriu no navegador. Faça login com o Google, copie o código e cole abaixo.');
        if (codeInput) { codeInput.focus(); }
      });

      // If the browser didn't open, let them try again.
      if (codeReopen) {
        codeReopen.addEventListener('click', e => {
          e.preventDefault();
          openExternal(GOOGLE_LOGIN_PAGE);
        });
      }

      // Step 2: redeem the pasted code for a session.
      async function submitCode() {
        clearMessages();
        const code = normalizePairCode(codeInput ? codeInput.value : '');
        if (!code || code.length < 6) { showError('Digite o código que apareceu no navegador'); return; }

        setLoading(true, 'Validando código…');
        const t1 = setTimeout(() => setLoading(true, 'Conectando ao servidor…'), 2100);
        const t2 = setTimeout(() => setLoading(true, 'Aguarde, servidor acordando…'), 4200);
        const clearTimers = () => { clearTimeout(t1); clearTimeout(t2); };

        try {
          const data = await redeemPairingCode(code);
          clearTimers();
          saveSession(data.access_token, data.expires_in, data.refresh_token);
          if (data.email) localStorage.setItem(STORE_USER, data.email);
          await verifyAndProceed();
        } catch(err) {
          clearTimers();
          showError(err.message || 'Erro ao validar o código');
          if (codeInput) { codeInput.classList.add('input-error'); codeInput.focus(); }
        } finally {
          setLoading(false);
        }
      }

      if (codeConfirm) codeConfirm.addEventListener('click', submitCode);
      if (codeInput) {
        codeInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitCode(); });
        codeInput.addEventListener('input', () => codeInput.classList.remove('input-error'));
      }
    }
  }

  // ════════════════════════════════════════════════════════════
  // CEP
  // ════════════════════════════════════════════════════════════
  const cs = state.isCEP ? new CSInterface() : null;

  function parseEvalResult(res) {
    if (res===null||res===undefined) throw new Error('null result');
    let s = String(res).trim();
    if (s==='undefined'||s==='null'||s==='') throw new Error('empty: '+s);
    if (s.charAt(0)==='"'&&s.charAt(s.length-1)==='"') { try{s=JSON.parse(s);}catch(e){} }
    return JSON.parse(s);
  }

  function evalScript(script, cb) {
    if (!cs) { if(cb) cb(JSON.stringify({error:'Not in CEP'})); return; }
    cs.evalScript(script, res => { if(cb) cb(res); });
  }

  function initCEP() {
    if (!state.isCEP) { setStatus('Modo demo — abra no Premiere Pro', 'info'); return; }
    if (navigator.platform.toLowerCase().includes('mac')) state.platform = 'mac';
    else if (navigator.platform.toLowerCase().includes('win')) state.platform = 'win';
    setStatus('Conectando…', 'loading');

    evalScript('getProjectInfo()', res => {
      let d;
      try { d = parseEvalResult(res); } catch(e) {
        setStatus('Conectado · ' + String(res).slice(0, 50), 'connected');
        refreshTracks(); return;
      }
      if (d.error) { setStatus('Sem projeto aberto', 'error'); return; }
      if (d.platform) state.platform = d.platform;
      setStatus(d.projectName + (d.hasSequence ? ` · ${d.sequenceName}` : '') + (d.hasSequence ? '' : ' · Sem sequência'), 'connected');
      refreshTracks();
    });
  }

  // Custom track dropdown state
  let trackOptions = [{index:0, label:'A1', name:'A1'}];
  let trackSelectedIndex = 0;

  function setTrackDropDisabled(disabled) {
    const d = dom.trackDrop();
    if (d) d.classList.toggle('auto-dim', disabled);
  }

  function setTrackSelectedIndex(idx) {
    trackSelectedIndex = idx;
    const opt = trackOptions.find(t => t.index === idx) || trackOptions[0];
    const lbl = dom.trackDropLabel();
    if (lbl) lbl.textContent = opt ? opt.label : 'A1';
    // Update selected highlight in menu
    document.querySelectorAll('.track-drop-item').forEach(el => {
      el.classList.toggle('selected', parseInt(el.dataset.idx) === idx);
    });
  }

  function buildTrackMenu() {
    const menu = dom.trackDropMenu(); if (!menu) return;
    menu.innerHTML = '';
    trackOptions.forEach(t => {
      const item = document.createElement('div');
      item.className = 'track-drop-item' + (t.index === trackSelectedIndex ? ' selected' : '');
      item.dataset.idx = t.index;
      item.textContent = t.label + (t.name !== t.label ? ' – ' + t.name : '');
      item.addEventListener('click', e => {
        e.stopPropagation();
        setTrackSelectedIndex(t.index);
        // Picking a track manually turns Auto off so the choice is respected
        if (state.autoTrack) {
          state.autoTrack = false;
          dom.toggleAutoTrack().classList.remove('on');
          setTrackDropDisabled(false);
          localStorage.setItem(STORE_AUTO, '0');
        }
        closeTrackDrop();
        toast('Track ' + (t.label||'') + ' selecionada', 'info');
      });
      menu.appendChild(item);
    });
  }

  function openTrackDrop() {
    const drop = dom.trackDrop(); if (!drop) return;
    buildTrackMenu();
    drop.classList.add('open');
    // Position menu above the button (player is at bottom)
    const btn = dom.trackDropBtn();
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const menu = dom.trackDropMenu();
      if (menu) {
        menu.style.left = rect.left + 'px';
        menu.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
        menu.style.top = 'auto';
      }
    }
  }

  function closeTrackDrop() {
    const drop = dom.trackDrop(); if (drop) drop.classList.remove('open');
  }

  function refreshTracks() {
    evalScript('getAudioTracks()', res => {
      let d; try{d=parseEvalResult(res);}catch(e){return;}
      if (!d.tracks || !d.tracks.length) return;
      trackOptions = d.tracks;
      // Keep current selection if still valid
      if (!trackOptions.find(t => t.index === trackSelectedIndex)) {
        trackSelectedIndex = trackOptions[0].index;
      }
      setTrackSelectedIndex(trackSelectedIndex);
    });
  }

  // ════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ════════════════════════════════════════════════════════════
  function saveLibrary() {
    try { localStorage.setItem(STORE_LIB,JSON.stringify(lib.items.map(item=>{
      if(item.type==='folder') return{type:'folder',id:item.id,name:item.name,color:item.color,open:item.open,dateAdded:item.dateAdded};
      return{type:'file',id:item.id,name:item.name,path:item.path,size:item.size,duration:item.duration,dateAdded:item.dateAdded,folderId:item.folderId||null,starred:item.starred||false,tags:item.tags||[],bpm:item.bpm||null,waveformData:item.waveformData?Array.from(item.waveformData).map(v=>+v.toFixed(4)):null};
    }))); } catch(e) {}
  }

  function loadLibrary() {
    try {
      const raw=localStorage.getItem(STORE_LIB); if(!raw) return;
      JSON.parse(raw).forEach(item=>{
        if(!item?.id) return;
        if(item.type==='folder') lib.items.push({type:'folder',id:item.id,name:item.name||'Pasta',color:item.color||'grey',open:item.open!==false,dateAdded:item.dateAdded||Date.now()});
        else lib.items.push({type:'file',id:item.id,name:item.name,path:item.path||'',size:item.size||0,duration:item.duration||null,dateAdded:item.dateAdded||Date.now(),folderId:item.folderId||null,starred:item.starred||false,tags:item.tags||[],bpm:item.bpm||null,waveformData:item.waveformData?new Float32Array(item.waveformData):null,fileObj:null,restored:true,trial:item.trial||false,bundled:item.bundled||false});
      });
    } catch(e) {}
  }

  // ────────────────────────────────────────────────────────────
  // LICENSE — device fingerprint, server verification, heartbeat
  // ────────────────────────────────────────────────────────────

  // Generate a stable device fingerprint. Combines platform + extension path
  // Generate a STABLE device fingerprint. Derived only from fixed machine
  // characteristics — NO random component — so it stays identical even if
  // localStorage is cleared, the plugin is reinstalled, or the Premiere cache
  // is wiped. This prevents the "phantom devices" bug where each cache clear
  // created a new device and eventually tripped the device limit.
  function getDeviceFingerprint() {
    const cached = localStorage.getItem(STORE_FP);
    if (cached) return cached;
    // Deterministic seed from stable machine traits
    const seed = [
      navigator.platform || '',
      navigator.userAgent || '',
      (navigator.language || ''),
      (navigator.hardwareConcurrency || ''),
      getExtensionDir() || '',
    ].join('|');
    // Simple stable hash (djb2) → hex string
    let h1 = 5381, h2 = 52711;
    for (let i = 0; i < seed.length; i++) {
      const c = seed.charCodeAt(i);
      h1 = (h1 * 33) ^ c;
      h2 = (h2 * 33) ^ c;
    }
    const fp = 'fp_' + (h1 >>> 0).toString(16).padStart(8, '0')
                     + (h2 >>> 0).toString(16).padStart(8, '0');
    localStorage.setItem(STORE_FP, fp);
    return fp;
  }

  function getDeviceName() {
    const p = (navigator.platform || '').toLowerCase();
    if (p.includes('mac'))   return 'Mac';
    if (p.includes('win'))   return 'Windows PC';
    if (p.includes('linux')) return 'Linux PC';
    return 'Computador';
  }

  function getPlatformKey() {
    const p = (navigator.platform || '').toLowerCase();
    if (p.includes('mac'))   return 'darwin';
    if (p.includes('win'))   return 'win32';
    if (p.includes('linux')) return 'linux';
    return 'unknown';
  }

  // Call the verify-license Edge Function. Returns the parsed result.
  // On network error, returns the last cached result (offline grace).
  async function verifyLicense() {
    let token = localStorage.getItem(STORE_TOKEN);
    if (!token) return { valid: false, reason: 'unauthenticated' };

    // Proactively refresh if the token is expired or about to expire (< 5 min left)
    const exp = parseInt(localStorage.getItem(STORE_TOKEN_EXP) || '0', 10);
    if (Date.now() > exp - 5 * 60 * 1000) {
      const fresh = await refreshAccessToken();
      if (fresh) token = fresh;
    }

    const payload = {
      fingerprint: getDeviceFingerprint(),
      device_name: getDeviceName(),
      platform:    getPlatformKey(),
    };

    const doFetch = async (tok) => {
      const r = await fetch(VERIFY_URL, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        SUPA_KEY,
          'Authorization': 'Bearer ' + tok,
        },
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => ({}));
      return { r, data };
    };

    try {
      let { r, data } = await doFetch(token);

      // If the server says unauthenticated (token rejected), try one refresh + retry
      if ((r.status === 401 || data.reason === 'unauthenticated')) {
        const fresh = await refreshAccessToken();
        if (fresh) {
          ({ r, data } = await doFetch(fresh));
        }
      }

      const result = { ...data, valid: !!data.valid, http: r.status, at: Date.now() };
      try { localStorage.setItem(STORE_LIC, JSON.stringify(result)); } catch(e) {}
      return result;
    } catch (err) {
      // Network error — fall back to cached result if recent (< 24h)
      console.warn('[verifyLicense] network error:', err && err.message);
      try {
        const cached = JSON.parse(localStorage.getItem(STORE_LIC) || 'null');
        if (cached && (Date.now() - (cached.at || 0)) < 24 * 60 * 60 * 1000) {
          return { ...cached, offline: true };
        }
      } catch(e) {}
      return { valid: false, reason: 'network', offline: true };
    }
  }

  // Block UI: replace the app with a friendly blocked screen.
  function showBlockedScreen(result) {
    const reason = (result && result.reason) || 'unknown';
    const messages = {
      refunded:        { title: 'Compra reembolsada',     body: 'Detectamos que sua compra foi reembolsada. O acesso ao plugin foi encerrado.' },
      chargeback:      { title: 'Acesso suspenso',        body: 'Sua compra entrou em disputa. Entre em contato para regularizar.' },
      blocked:         { title: 'Conta bloqueada',        body: 'Sua conta foi bloqueada. Entre em contato com o suporte.' },
      device_limit:    { title: 'Limite de dispositivos', body: 'Este é seu 3º dispositivo. Você pode usar o DropSFX em até 2 PCs. Para liberar este, peça ajuda ao suporte para desativar um dispositivo anterior.' },
      no_license:      { title: 'Compra não encontrada',  body: 'Não encontramos uma compra ativa para este e-mail. Verifique se está usando o mesmo e-mail da Kiwify.' },
      unauthenticated: { title: 'Sessão expirada',        body: 'Faça login novamente para continuar.' },
      pending:         { title: 'Compra em análise',      body: 'Sua compra ainda está sendo processada. Tente novamente em alguns minutos.' },
      network:         { title: 'Sem conexão',            body: 'Não foi possível verificar sua licença. Conecte-se à internet e tente novamente.' },
      unknown:         { title: 'Acesso indisponível',    body: 'Não foi possível liberar o acesso. Entre em contato com o suporte.' },
    };
    const msg = messages[reason] || messages.unknown;

    // Hide app and login, show blocked
    const app    = g('app');         if (app)    app.classList.add('hidden');
    const login  = g('login-screen');if (login)  login.classList.add('hidden');
    const splash = g('splash-screen');if(splash) splash.classList.add('hidden');

    let block = g('blocked-screen');
    if (!block) {
      block = document.createElement('div');
      block.id = 'blocked-screen';
      block.innerHTML = `
        <div class="blocked-box">
          <div class="blocked-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 class="blocked-title"></h2>
          <p class="blocked-body"></p>
          <div class="blocked-actions">
            <a class="blocked-btn primary" id="blocked-support" href="#">Falar com suporte</a>
            <button class="blocked-btn secondary" id="blocked-retry">Tentar novamente</button>
            <button class="blocked-btn ghost" id="blocked-logout">Sair</button>
          </div>
        </div>
      `;
      document.body.appendChild(block);
      block.querySelector('#blocked-support').addEventListener('click', (e) => {
        e.preventDefault();
        openSupport();
      });
      block.querySelector('#blocked-retry').addEventListener('click', async () => {
        const r = await verifyLicense();
        if (r.valid) location.reload();
        else showBlockedScreen(r);
      });
      block.querySelector('#blocked-logout').addEventListener('click', () => {
        clearSession();
        location.reload();
      });
    }
    block.querySelector('.blocked-title').textContent = msg.title;
    block.querySelector('.blocked-body').textContent  = msg.body;
    block.classList.remove('hidden');
  }

  // Heartbeat: re-verify periodically while plugin is open.
  let heartbeatTimer = null;
  function startHeartbeat() {
    if (heartbeatTimer) return;
    heartbeatTimer = setInterval(async () => {
      const r = await verifyLicense();
      if (!r.valid && !r.offline) {
        stopHeartbeat();
        showBlockedScreen(r);
      } else if (r.valid) {
        // Update trial flag if it changed (e.g. trial just ended)
        const wasTrial = state.trial;
        state.trial = !!r.trial;
        if (wasTrial && !state.trial) {
          // Trial ended → full library now visible
          renderTabCounts(); renderTagBar(); renderLibrary();
          toast('Período de teste finalizado. Biblioteca completa liberada! ✨', 'info');
        }
      }
    }, HEARTBEAT_MS);
  }
  function stopHeartbeat() {
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
  }

  // Open the support URL in the OS default browser.
  // Inside a CEP panel, <a target="_blank"> doesn't work — the panel is a
  // sandboxed Chromium. We must use either the CEP API or window.cep.process.
  // Open any URL in the OS default browser.
  // Inside a CEP panel, <a target="_blank"> doesn't work — the panel is a
  // sandboxed Chromium. We must use either the CEP API or window.cep.process.
  function openExternal(url) {
    // 1) Preferred: CSInterface.openURLInDefaultBrowser
    try {
      if (typeof CSInterface !== 'undefined') {
        const csi = new CSInterface();
        if (typeof csi.openURLInDefaultBrowser === 'function') {
          csi.openURLInDefaultBrowser(url);
          return;
        }
      }
    } catch(e) {}
    // 2) Fallback: window.cep.util.openURLInDefaultBrowser (older CEP)
    try {
      if (window.cep && window.cep.util && window.cep.util.openURLInDefaultBrowser) {
        window.cep.util.openURLInDefaultBrowser(url);
        return;
      }
    } catch(e) {}
    // 3) Fallback: cep.process.createProcess (last resort — spawns OS handler)
    try {
      if (window.cep && window.cep.process) {
        const isMac = /mac|darwin/i.test(navigator.platform);
        if (isMac) window.cep.process.createProcess('/usr/bin/open', url);
        else        window.cep.process.createProcess('cmd', '/c', 'start', '', url);
        return;
      }
    } catch(e) {}
    // 4) Last resort: regular window.open (works outside CEP, e.g. when testing in browser)
    try { window.open(url, '_blank'); } catch(e) {}
  }

  // Open the support URL in the OS default browser.
  function openSupport() { openExternal(SUPPORT_URL); }

  // ────────────────────────────────────────────────────────────
  // SEED — load bundled library on first run
  // ────────────────────────────────────────────────────────────
  function getExtensionDir() {
    // Preferred: CEP API
    try {
      if (typeof CSInterface !== 'undefined' && typeof SystemPath !== 'undefined') {
        const csi = new CSInterface();
        const p = csi.getSystemPath(SystemPath.EXTENSION);
        if (p) return p.replace(/[\\/]+$/, '');
      }
    } catch(e) {}
    // Fallback: derive from location.href
    try {
      let href = decodeURIComponent(window.location.href);
      // strip "file://" + leading slashes appropriately for win/mac
      href = href.replace(/^file:\/+/, '/');
      // On windows, file:///C:/... → leave the slash before C:
      if (/^\/[A-Za-z]:/.test(href)) href = href.slice(1);
      // remove filename + any query/hash
      href = href.split(/[?#]/)[0].replace(/\/[^/]*$/, '');
      return href;
    } catch(e) { return ''; }
  }

  function seedInitialLibrary(onDone) {
    // Check the bundled library version on disk first.
    fetch('library.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('library.json missing')))
      .then(catalog => {
        const diskVer  = parseInt(catalog.version || 1, 10);
        const seededVer = parseInt(localStorage.getItem(STORE_LIB_VER) || '0', 10);
        const alreadySeeded = localStorage.getItem(STORE_SEEDED) === '1';

        // CASE 1: Already seeded AND library is up to date → nothing to do.
        if (alreadySeeded && seededVer >= diskVer) {
          if (onDone) onDone(false);
          return;
        }

        // CASE 2: A newer bundled library exists → refresh the bundled items,
        // but PRESERVE anything the user imported themselves (non-bundled).
        if (alreadySeeded && diskVer > seededVer) {
          // Remember user favorites/recents by file path so we can re-apply
          const userImported = lib.items.filter(it => !it.bundled);
          lib.items = userImported;  // drop old bundled, keep user's own
        }

        // (CASE 3: never seeded → proceed to seed normally below.)
        doSeed(catalog, diskVer, onDone);
      })
      .catch(() => { if (onDone) onDone(false); });
  }

  function doSeed(catalog, diskVer, onDone) {
    try {
        const extDir = getExtensionDir();
        if (!extDir) throw new Error('Cannot resolve extension path');
        const sep = /win/i.test(state.platform) || /\\/.test(extDir) ? '\\' : '/';
        const join = (a, b) => a.replace(/[\\/]+$/, '') + sep + b.replace(/\\/g, sep).replace(/\//g, sep);

        const now = Date.now();
        (catalog.folders || []).forEach(f => {
          lib.items.push({
            type: 'folder',
            id: f.id,
            name: f.name,
            color: f.color || 'grey',
            open: false,
            dateAdded: now,
          });
        });
        (catalog.files || []).forEach(f => {
          lib.items.push({
            type: 'file',
            id: f.id,
            name: f.name,
            path: join(extDir, f.rel),
            size: f.size || 0,
            duration: null,
            dateAdded: now,
            folderId: f.folderId || null,
            starred: false,
            tags: f.tags || [],
            bpm: null,
            waveformData: null,
            fileObj: null,
            restored: true,
            bundled: true,
            trial: !!f.trial,
          });
        });

        localStorage.setItem(STORE_SEEDED, '1');
        localStorage.setItem(STORE_LIB_VER, String(diskVer));
        try { saveLibrary(); } catch(e) {}
        if (onDone) onDone(true);
    } catch (err) {
        console.warn('[DropSFX] seed skipped:', err && err.message);
        if (onDone) onDone(false);
    }
  }

  function saveRecents() { try{localStorage.setItem(STORE_RECENTS,JSON.stringify(state.recents));}catch(e){} }
  function loadRecents() { try{const r=localStorage.getItem(STORE_RECENTS);if(r)state.recents=JSON.parse(r);}catch(e){} }
  function addToRecents(id) {
    state.recents=state.recents.filter(x=>x!==id); state.recents.unshift(id);
    if(state.recents.length>MAX_RECENTS) state.recents=state.recents.slice(0,MAX_RECENTS);
    saveRecents(); renderTabCounts();
  }

  // ════════════════════════════════════════════════════════════
  // FILE DIALOGS
  // ════════════════════════════════════════════════════════════
  function normCEPPath(raw) {
    let p=String(raw||'').replace(/\\/g,'/');
    if(p.startsWith('file:///')) p=p.slice(7);
    else if(p.startsWith('file://')) p=p.slice(7);
    try{p=decodeURIComponent(p);}catch(e){}
    return p;
  }

  function openNativeFileDialog(targetFolderId) {
    if (state.isCEP&&window.cep&&window.cep.fs) {
      try {
        const r=window.cep.fs.showOpenDialog(true,false,'Selecionar áudios','',['mp3','wav','ogg','flac','aac','m4a','aif','aiff','wma','opus','webm']);
        if(r&&r.err===0&&r.data&&r.data.length){addFilesByPath(r.data,targetFolderId);return;}
        return;
      } catch(e){}
    }
    dom.fileInput().click();
  }

  function openNativeFolderDialog() {
    if (state.isCEP&&window.cep&&window.cep.fs) {
      try {
        const r=window.cep.fs.showOpenDialog(false,true,'Selecionar pasta de áudios','',[]); 
        if(r&&r.err===0&&r.data&&r.data.length){
          const folderPath=normCEPPath(r.data[0]);
          const folderName=folderPath.split('/').pop()||folderPath;
          let libFolder=lib.items.find(i=>i.type==='folder'&&i.name===folderName);
          if(!libFolder){const nid='folder_'+Date.now();libFolder={type:'folder',id:nid,name:folderName,color:'grey',open:true,dateAdded:Date.now()};lib.items.unshift(libFolder);}
          const paths=scanDirWithCEP(folderPath,0);
          if(!paths.length){toast(`Nenhum áudio em "${folderName}"`,'info');renderLibrary();saveLibrary();return;}
          addFilesByPath(paths,libFolder.id);
          toast(`${paths.length} arquivo(s) de "${folderName}" importado(s)`,'success');
          return;
        }
        return;
      } catch(e){}
    }
    dom.folderInput().click();
  }

  function scanDirWithCEP(dirPath,depth) {
    if(depth===undefined)depth=0; if(depth>5)return[];
    const found=[];
    try {
      const r=window.cep.fs.readdir(dirPath);
      if(!r||r.err!==0)return found;
      r.data.forEach(rawName=>{
        if(rawName==='.'||rawName==='..')return;
        const name=normCEPPath(rawName);
        const full=dirPath+'/'+name;
        const stat=window.cep.fs.stat(full);
        if(!stat||stat.err!==0)return;
        if(stat.data.isDirectory()) scanDirWithCEP(full,depth+1).forEach(p=>found.push(p));
        else if(AUDIO_EXTS.test(name)) found.push(full);
      });
    } catch(e){}
    return found;
  }

  function addFilesByPath(paths,targetFolderId) {
    let added=0;
    paths.forEach(rawPath=>{
      const p=normCEPPath(rawPath);
      const name=p.split('/').pop();
      if(!name||!AUDIO_EXTS.test(name))return;
      if(lib.items.find(i=>i.type==='file'&&normCEPPath(i.path)===p)){toast(`"${name}" já existe`,'info');return;}
      const id='f_'+Date.now()+'_'+Math.random().toString(36).slice(2,5);
      let size=0;
      try{const st=window.cep&&window.cep.fs&&window.cep.fs.stat(p);if(st&&st.err===0&&st.data)size=st.data.size||0;}catch(e){}
      const entry={type:'file',id,name,path:p,size,duration:null,dateAdded:Date.now(),folderId:targetFolderId||null,starred:false,tags:[],bpm:null,waveformData:null,fileObj:null,restored:false};
      lib.items.push(entry); added++;
      resolveDuration(entry,null);
    });
    if(added){renderLibrary();saveLibrary();renderTagBar();renderTabCounts();}
  }

  function addFiles(fileList,targetFolderId) {
    let added=0;
    Array.from(fileList).forEach(file=>{
      if(!AUDIO_MIME.test(file.type)&&!AUDIO_EXTS.test(file.name))return;
      if(lib.items.find(i=>i.type==='file'&&i.name===file.name&&i.size===file.size)){toast(`"${file.name}" já existe`,'info');return;}
      let realPath='';
      if(file.path&&file.path!==file.name)realPath=file.path.replace(/\\/g,'/');
      else if(file.webkitRelativePath)realPath=file.webkitRelativePath.replace(/\\/g,'/');
      const id='f_'+Date.now()+'_'+Math.random().toString(36).slice(2,5);
      const entry={type:'file',id,name:file.name,path:realPath,size:file.size,duration:null,dateAdded:Date.now(),folderId:targetFolderId||null,starred:false,tags:[],bpm:null,waveformData:null,fileObj:file,restored:false};
      lib.items.push(entry); added++;
      resolveDuration(entry,file);
    });
    if(added){renderLibrary();saveLibrary();renderTagBar();renderTabCounts();}
  }

  // ════════════════════════════════════════════════════════════
  // FOLDER MANAGEMENT
  // ════════════════════════════════════════════════════════════
  function createFolder(name,color){
    if(!name.trim())return null;
    const id='folder_'+Date.now();
    lib.items.unshift({type:'folder',id,name:name.trim(),color:color||'grey',open:true,dateAdded:Date.now()});
    saveLibrary();renderLibrary();toast(`Pasta "${name.trim()}" criada`,'success');return id;
  }
  function deleteFolder(id){
    lib.items.forEach(i=>{if(i.type==='file'&&i.folderId===id)i.folderId=null;});
    lib.items.splice(lib.items.findIndex(i=>i.id===id),1);
    saveLibrary();renderLibrary();
  }
  function setFolderColor(id,key){const f=lib.folderById(id);if(f){f.color=key;saveLibrary();renderLibrary();}}
  function renameFolder(id,name){const f=lib.folderById(id);if(f&&name.trim()){f.name=name.trim();saveLibrary();renderLibrary();}}

  // ── Folder create/edit modal ──────────────────────────────
  let _folderModalEditId=null;
  let _folderModalColor='pink';
  function openFolderModal(editId){
    _folderModalEditId=editId||null;
    const f=editId?lib.folderById(editId):null;
    _folderModalColor=f?f.color:'pink';
    g('folder-modal-title').textContent=f?'Editar pasta':'Nova pasta';
    g('folder-modal-save').textContent=f?'Salvar':'Criar pasta';
    g('folder-modal-name').value=f?f.name:'';
    // render swatches
    const wrap=g('folder-modal-colors');
    wrap.innerHTML='';
    FOLDER_COLORS.forEach(c=>{
      const s=document.createElement('div');
      s.className='fc-swatch'+(c.key===_folderModalColor?' sel':'');
      s.style.background=c.hex;
      s.addEventListener('click',()=>{
        _folderModalColor=c.key;
        wrap.querySelectorAll('.fc-swatch').forEach(x=>x.classList.remove('sel'));
        s.classList.add('sel');
      });
      wrap.appendChild(s);
    });
    g('folder-modal').classList.add('open');
    setTimeout(()=>g('folder-modal-name').focus(),60);
  }
  function closeFolderModal(){ g('folder-modal').classList.remove('open'); _folderModalEditId=null; }
  function saveFolderModal(){
    const name=g('folder-modal-name').value.trim();
    if(!name){ g('folder-modal-name').focus(); return; }
    if(_folderModalEditId){
      const f=lib.folderById(_folderModalEditId);
      if(f){ f.name=name; f.color=_folderModalColor; saveLibrary(); renderLibrary(); toast('Pasta atualizada','success'); }
    } else {
      const id=createFolder(name,_folderModalColor);
      if(id){ /* createFolder already saves+renders+toasts */ }
    }
    closeFolderModal();
  }

  // ── Folder context menu (user folders only) ───────────────
  let folderCtxEl=null;
  function closeFolderCtx(){ if(folderCtxEl){folderCtxEl.remove();folderCtxEl=null;} }
  function showFolderCtx(e,folder){
    e.stopPropagation();
    closeFolderCtx(); closeCtxMenu();
    const menu=document.createElement('div');
    menu.className='ctx-menu';
    menu.innerHTML=`
      <div class="ctx-menu-title">${esc(folder.name)}</div>
      <div class="ctx-item" data-act="edit"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>Renomear / Cor</div>
      <div class="ctx-sep"></div>
      <div class="ctx-item danger" data-act="del"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>Excluir pasta</div>`;
    document.body.appendChild(menu);
    folderCtxEl=menu;
    const mw=170, mh=menu.offsetHeight||110;
    menu.style.left=(e.clientX+mw>window.innerWidth?e.clientX-mw:e.clientX)+'px';
    menu.style.top=(e.clientY+mh>window.innerHeight?e.clientY-mh:e.clientY)+'px';
    menu.addEventListener('click',ev=>{
      const item=ev.target.closest('[data-act]'); if(!item) return;
      const act=item.dataset.act;
      if(act==='edit'){ closeFolderCtx(); openFolderModal(folder.id); }
      else if(act==='del'){
        // confirm() breaks on Mac CEP → two-step inline confirm
        if(item.dataset.armed==='1'){
          closeFolderCtx();
          deleteFolder(folder.id);
          toast('Pasta excluída (sons movidos pra "Sem pasta")','info');
        } else {
          item.dataset.armed='1';
          item.innerHTML='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>Confirmar exclusão?';
        }
      }
    });
    setTimeout(()=>{
      document.addEventListener('click',function h(ev){
        if(!ev.target.closest('.ctx-menu')){ closeFolderCtx(); document.removeEventListener('click',h); }
      });
    },10);
  }
  function toggleFolder(id){const f=lib.folderById(id);if(f){f.open=!f.open;saveLibrary();renderLibrary();}}
  function moveFileToFolder(fileId,folderId){
    const f=lib.fileById(fileId);if(!f)return;
    f.folderId=folderId||null;
    if(folderId){const fold=lib.folderById(folderId);if(fold)fold.open=true;}
    saveLibrary();renderLibrary();
  }
  function colorHex(key){return FOLDER_COLORS.find(c=>c.key===key)?.hex||'#5a5a72';}
  function toggleStar(id){
    const f=lib.fileById(id);if(!f)return;
    f.starred=!f.starred; saveLibrary();renderLibrary();renderTabCounts();
    toast(f.starred?'Adicionado aos favoritos':'Removido dos favoritos',f.starred?'success':'info');
  }

  function removeFile(id){
    lib.items.splice(lib.items.findIndex(i=>i.id===id),1);
    state.recents=state.recents.filter(r=>r!==id);
    if(state.selectedId===id){stopAudio();state.selectedId=null;resetPlayer();}
    saveLibrary();saveRecents();renderLibrary();renderTabCounts();renderTagBar();
  }

  function resolveDuration(entry,fileObj){
    const tryPath=url=>{const a=new Audio();a.preload='metadata';a.onloadedmetadata=()=>{entry.duration=a.duration;updateFileMeta(entry.id);saveLibrary();};a.onerror=()=>{};a.src=url;};
    if(fileObj){
      const url=URL.createObjectURL(fileObj);
      const a=new Audio();a.preload='metadata';
      a.onloadedmetadata=()=>{entry.duration=a.duration;URL.revokeObjectURL(url);updateFileMeta(entry.id);saveLibrary();};
      a.onerror=()=>{URL.revokeObjectURL(url);if(entry.path)tryPath(pathToUrl(entry.path));};
      a.src=url;
    } else if(entry.path) tryPath(pathToUrl(entry.path));
  }

  // ════════════════════════════════════════════════════════════
  // TAGS
  // ════════════════════════════════════════════════════════════
  function renderTagBar(){
    const bar=dom.tagBar();
    const usedTags=new Set();
    lib.files().forEach(f=>f.tags.forEach(t=>usedTags.add(t)));
    if(!usedTags.size){bar.style.display='none';return;}
    bar.style.display='flex';
    bar.innerHTML='<div class="tag-pill'+(state.activeTagFilter===null?' active':'')+'" data-tag="all">Todos</div>'
      +PRESET_TAGS.filter(t=>usedTags.has(t.id)).map(t=>`
        <div class="tag-pill${state.activeTagFilter===t.id?' active':''}" data-tag="${t.id}">
          <span class="tag-dot" style="background:${t.color}"></span>${t.label}
        </div>`).join('');
    bar.querySelectorAll('.tag-pill').forEach(p=>{
      p.addEventListener('click',()=>{state.activeTagFilter=p.dataset.tag==='all'?null:p.dataset.tag;renderTagBar();renderLibrary();});
    });
  }

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  function renderTabCounts(){
    g('tab-count-library').textContent=lib.files().length;
    g('tab-count-favorites').textContent=lib.files().filter(f=>f.starred).length;
    g('tab-count-recents').textContent=state.recents.filter(id=>lib.fileById(id)).length;
    const usedIds = state.useCounts ? Object.keys(state.useCounts).filter(id=>state.useCounts[id]>0 && lib.fileById(id)) : [];
    g('tab-count-topused').textContent = usedIds.length;
  }

  function getActiveFiles(){
    let files;
    if(state.activeTab==='favorites') files=lib.files().filter(f=>f.starred);
    else if(state.activeTab==='recents') files=state.recents.map(id=>lib.fileById(id)).filter(Boolean);
    else if(state.activeTab==='topused'){
      // Files inserted at least once, sorted by usage count (desc)
      const counts = state.useCounts || {};
      files = Object.keys(counts)
        .filter(id => counts[id] > 0)
        .map(id => lib.fileById(id))
        .filter(Boolean)
        .sort((a,b) => (counts[b.id]||0) - (counts[a.id]||0));
    }
    else files=lib.files();
    // Trial mode: hide bundled files that aren't in the trial selection.
    if(state.trial) files=files.filter(f=>!f.bundled||f.trial);
    if(state.activeTagFilter) files=files.filter(f=>f.tags.includes(state.activeTagFilter));
    if(state.searchQuery){const q=state.searchQuery.toLowerCase();files=files.filter(f=>f.name.toLowerCase().includes(q));}
    return files;
  }

  function sortedFiles(arr){
    // Recents and Top-used preserve their natural ordering (chronological / by-count).
    if(state.activeTab==='recents'||state.activeTab==='topused')return arr;
    const a=arr.slice();
    if(state.sortOrder==='name')a.sort((x,y)=>x.name.localeCompare(y.name));
    else if(state.sortOrder==='size')a.sort((x,y)=>(y.size||0)-(x.size||0));
    else a.sort((x,y)=>(y.dateAdded||0)-(x.dateAdded||0));
    return a;
  }

  function foldersWithSearchMatches(){
    if(!state.searchQuery)return new Set();
    const q=state.searchQuery.toLowerCase(),ids=new Set();
    lib.files().forEach(f=>{if(f.folderId&&f.name.toLowerCase().includes(q))ids.add(f.folderId);});
    return ids;
  }

  // Trial banner: shows once per session, auto-hides after 8s, dismissable.
  let _bannerDismissed = false;
  let _bannerTimer = null;
  let _bannerShown = false;
  function updateTrialBanner() {
    const tbn = g('trial-banner');
    if (!tbn) return;
    const shouldShow = state.trial && state.activeTab === 'library' && !_bannerDismissed;
    if (!shouldShow) {
      tbn.classList.add('hidden');
      return;
    }
    // Show only once per session (avoid restarting the timer on every re-render)
    if (_bannerShown) return;
    _bannerShown = true;
    tbn.classList.remove('hidden', 'fade-out');
    // Auto-hide after 8s
    if (_bannerTimer) clearTimeout(_bannerTimer);
    _bannerTimer = setTimeout(dismissTrialBanner, 8000);
    // Bind close button once
    const btn = g('trial-banner-close');
    if (btn && !btn._bound) {
      btn._bound = true;
      btn.addEventListener('click', dismissTrialBanner);
    }
  }
  function dismissTrialBanner() {
    const tbn = g('trial-banner');
    if (!tbn) return;
    _bannerDismissed = true;
    if (_bannerTimer) { clearTimeout(_bannerTimer); _bannerTimer = null; }
    tbn.classList.add('fade-out');
    setTimeout(() => tbn.classList.add('hidden'), 400);
  }

  // Max items rendered upfront in any flat list. Big lists (Tudo / busca ampla)
  // showed 1400+ rows at once, freezing CEP's old Chromium. With a cap, we render
  // the first N immediately and lazy-load the rest as the user scrolls.
  const FLAT_INITIAL = 80;
  const FLAT_BATCH = 60;
  let _flatRemaining = [];
  let _flatScrollHandler = null;

  function attachFlatLazyLoad(container){
    if(_flatScrollHandler) container.removeEventListener('scroll', _flatScrollHandler);
    _flatScrollHandler = ()=>{
      if(!_flatRemaining.length) return;
      // Load more when near the bottom
      if(container.scrollTop + container.clientHeight >= container.scrollHeight - 400){
        const batch = _flatRemaining.splice(0, FLAT_BATCH);
        const frag = document.createDocumentFragment();
        batch.forEach(f => frag.appendChild(buildFileEl(f)));
        container.appendChild(frag);
      }
    };
    container.addEventListener('scroll', _flatScrollHandler, {passive:true});
  }

  function appendFlat(container, files){
    // Render first chunk synchronously, queue the rest for scroll-driven loading.
    _flatRemaining = files.length > FLAT_INITIAL ? files.slice(FLAT_INITIAL) : [];
    const initial = files.length > FLAT_INITIAL ? files.slice(0, FLAT_INITIAL) : files;
    const frag = document.createDocumentFragment();
    initial.forEach(f => frag.appendChild(buildFileEl(f)));
    container.appendChild(frag);
    if(_flatRemaining.length) attachFlatLazyLoad(container);
  }

  function renderLibrary(){
    const container=dom.fileList();
    container.innerHTML=''; closeAllPopovers(); closeCtxMenu();
    _flatRemaining = [];
    if(_flatScrollHandler){ container.removeEventListener('scroll', _flatScrollHandler); _flatScrollHandler = null; }

    const activeFiles=getActiveFiles();
    const allFiles=sortedFiles(activeFiles);
    dom.libLabel().textContent='';
    dom.fileCount().textContent=allFiles.length;
    const tb=g('trial-badge'); if(tb) tb.classList.toggle('hidden', !state.trial);
    updateTrialBanner();

    // ── MODE 1: favorites / recents → flat list ──
    if(state.activeTab!=='library'){
      if(!allFiles.length){
        const msgs={favorites:'Nenhum favorito ainda.<br>Clique na ★ de um som pra salvar aqui.',recents:'Nenhum som recente.<br>Os últimos sons usados aparecem aqui.',topused:'Ainda sem histórico de uso.<br>Os sons que você mais inserir aparecem aqui.'};
        container.innerHTML=`<div class="empty-state"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" style="opacity:.3"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg><p>${msgs[state.activeTab]||''}</p></div>`;
        return;
      }
      appendFlat(container, allFiles);
      return;
    }

    // ── MODE 2: active search → flat results across all folders ──
    if(state.searchQuery || state.activeTagFilter){
      if(!allFiles.length){
        container.innerHTML=`<div class="empty-state"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" style="opacity:.3"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg><p><b>Nada encontrado</b>Tente outra palavra ou categoria.</p></div>`;
        return;
      }
      appendFlat(container, allFiles);
      return;
    }

    // ── MODE 3: a folder is open → header + its files ──
    if(state.openFolderId){
      const folder=lib.folderById(state.openFolderId);
      if(!folder){ state.openFolderId=null; renderLibrary(); return; }
      const children=sortedFiles(activeFiles.filter(f=>f.folderId===folder.id));
      container.appendChild(buildFolderHead(folder,children.length));
      if(!children.length){
        const ed=document.createElement('div');
        ed.className='empty-state';
        if(isUserFolder(folder)){
          ed.innerHTML=`<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" style="opacity:.3"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>
            <p><b>Pasta vazia</b>Adicione seus próprios sons aqui.</p>
            <button class="fadd-btn" id="empty-add-btn">＋ Adicionar sons</button>
            <div class="hint"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/></svg> ou arraste arquivos pra cá</div>`;
          container.appendChild(ed);
          const eb=g('empty-add-btn'); if(eb) eb.addEventListener('click',()=>dom.fileInput().click());
        } else {
          ed.innerHTML=`<p>Nenhum som disponível nesta pasta.</p>`;
          container.appendChild(ed);
        }
        return;
      }
      appendFlat(container, children);
      return;
    }

    // ── MODE 4: home → folder grid (user folders + bundled) ──
    const folders=lib.folders();
    const userFolders=folders.filter(isUserFolder);
    const seedFolders=folders.filter(f=>!isUserFolder(f));
    // Pre-compute counts in one O(N) pass instead of O(N×F) per countFor() call
    const countByFid = new Map();
    for(const f of activeFiles){
      if(f.folderId) countByFid.set(f.folderId, (countByFid.get(f.folderId)||0)+1);
    }
    const countFor = fid => countByFid.get(fid) || 0;

    const homeFrag = document.createDocumentFragment();

    // user section
    const lbl1=document.createElement('div');
    lbl1.className='sec-label';
    lbl1.innerHTML=`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Minhas pastas`;
    homeFrag.appendChild(lbl1);
    const ugrid=document.createElement('div'); ugrid.className='fgrid';
    userFolders.forEach(f=>ugrid.appendChild(buildFolderCard(f,countFor(f.id),true)));
    const add=document.createElement('div');
    add.className='fcard new';
    add.innerHTML=`<div class="plus"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></div><span>Nova pasta</span>`;
    add.addEventListener('click',()=>openFolderModal());
    ugrid.appendChild(add);
    homeFrag.appendChild(ugrid);

    // loose files
    const loose=sortedFiles(allFiles.filter(f=>!f.folderId));
    if(loose.length){
      const lblL=document.createElement('div');
      lblL.className='sec-label'; lblL.textContent='Sem pasta';
      homeFrag.appendChild(lblL);
      loose.forEach(f=>homeFrag.appendChild(buildFileEl(f)));
    }

    // bundled section
    if(seedFolders.length){
      const lbl2=document.createElement('div');
      lbl2.className='sec-label';
      lbl2.innerHTML=`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg> Biblioteca dropSFX`;
      homeFrag.appendChild(lbl2);
      const sgrid=document.createElement('div'); sgrid.className='fgrid'; sgrid.style.paddingBottom='14px';
      seedFolders.slice().sort((a,b)=>countFor(b.id)-countFor(a.id)).forEach(f=>{
        const n=countFor(f.id);
        if(n>0) sgrid.appendChild(buildFolderCard(f,n,false));
      });
      homeFrag.appendChild(sgrid);
    }
    container.appendChild(homeFrag);
  }

  // Builds a folder card for the home grid
  function buildFolderCard(folder,count,isUser){
    const hex=colorHex(folder.color);
    const card=document.createElement('div');
    card.className='fcard'+(isUser?' user':'');
    card.style.setProperty('--c',hex);
    // Inline colors — CEP's Chromium is too old for CSS color-mix()
    const bgA=hexToRgba(hex,0.14), bgB=hexToRgba(hex,0.05);
    card.style.background=`linear-gradient(135deg, ${bgA}, ${bgB})`;
    card.style.borderColor=hexToRgba(hex,0.25);
    card.dataset.cHi=hexToRgba(hex,0.5);   // hover border
    card.dataset.cGlow=hexToRgba(hex,0.22);// hover shadow
    let deco='';
    if(!isUser){
      deco='<div class="fcard-deco">'+Array.from({length:5},()=>`<i style="height:${5+Math.random()*12}px;background:${hex}"></i>`).join('')+'</div>';
    }
    const menuBtn=isUser?`<button class="fcard-menu" title="Opções"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></button>`:'';
    card.innerHTML=`${deco}${menuBtn}
      <div class="fcard-ic" style="background:${hexToRgba(hex,0.22)};color:${hex}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${isUser?USER_FOLDER_ICON:catIcon(folder.name)}</svg></div>
      <div class="fcard-name" title="${esc(folder.name)}">${esc(folder.name)}</div>
      <div class="fcard-n"><b style="color:${hex}">${count}</b> ${count===1?'som':'sons'}</div>`;
    // Hover handlers (replace CSS color-mix hover)
    card.addEventListener('mouseenter',()=>{
      card.style.borderColor=card.dataset.cHi;
      card.style.boxShadow=`0 10px 26px ${card.dataset.cGlow}`;
    });
    card.addEventListener('mouseleave',()=>{
      card.style.borderColor=hexToRgba(hex,0.25);
      card.style.boxShadow='';
    });
    card.addEventListener('click',e=>{
      if(e.target.closest('.fcard-menu')){ showFolderCtx(e,folder); return; }
      state.openFolderId=folder.id; renderLibrary();
      dom.fileList().scrollTop=0;
    });
    // Accept internal sound drags (move sound into this folder) — user folders only
    if(isUser){
      card.addEventListener('dragover',e=>{
        if(e.dataTransfer.types.includes('application/x-soundfx-id')){
          e.preventDefault();e.stopPropagation();card.classList.add('drop-target');
        }
      });
      card.addEventListener('dragleave',e=>{if(!card.contains(e.relatedTarget))card.classList.remove('drop-target');});
      card.addEventListener('drop',e=>{
        card.classList.remove('drop-target');
        const internalId=e.dataTransfer.getData('application/x-soundfx-id');
        if(internalId){e.preventDefault();e.stopPropagation();moveFileToFolder(internalId,folder.id);toast('Movido pra '+folder.name,'success');}
      });
    }
    return card;
  }

  // Builds the sticky header shown inside an open folder
  function buildFolderHead(folder,count){
    const hex=colorHex(folder.color);
    const isUser=isUserFolder(folder);
    const head=document.createElement('div');
    head.className='fhead';
    head.innerHTML=`
      <button class="fback" title="Voltar"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
      <div class="fhead-ic" style="background:${hexToRgba(hex,0.2)};color:${hex}">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${isUser?USER_FOLDER_ICON:catIcon(folder.name)}</svg>
      </div>
      <div class="fhead-info">
        <div class="fhead-name" title="${esc(folder.name)}">${esc(folder.name)}</div>
        <div class="fhead-n">${count} ${count===1?'som':'sons'}</div>
      </div>
      ${isUser?`<button class="fadd-btn" id="fhead-add"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> Adicionar</button>`:''}
    `;
    head.querySelector('.fback').addEventListener('click',()=>{
      state.openFolderId=null; renderLibrary();
      dom.fileList().scrollTop=0;
    });
    const ab=head.querySelector('#fhead-add');
    if(ab) ab.addEventListener('click',()=>dom.fileInput().click());
    return head;
  }

  function buildFolderEl(folder,children,forceOpen){
    const isOpen=forceOpen||folder.open,hex=colorHex(folder.color);
    const el=document.createElement('div');
    el.className='folder-item'+(isOpen?' open':''); el.dataset.fid=folder.id;
    el.innerHTML=`
      <div class="folder-header">
        <svg class="folder-chevron" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="folder-icon" style="background:${hex}">
          <svg width="10" height="8" viewBox="0 0 20 14" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="2" stroke-linecap="round"><line x1="2" y1="4" x2="18" y2="4"/><line x1="2" y1="9" x2="12" y2="9"/></svg>
        </div>
        <span class="folder-name">${esc(folder.name)}</span>
        <span class="folder-meta">${children.length}</span>
        <div class="folder-actions">
          <button class="fta-btn btn-fc" title="Cor da pasta"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="5"/></svg></button>
          <button class="fta-btn danger btn-fd" title="Excluir pasta"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
      </div>
      <div class="folder-children" id="fch_${folder.id}"></div>`;

    const stale=g('cpop_'+folder.id);if(stale)stale.remove();
    const pop=document.createElement('div');pop.className='color-popover';pop.id='cpop_'+folder.id;
    pop.innerHTML=FOLDER_COLORS.map(c=>`<div class="cp-swatch${c.key===folder.color?' active':''}" style="background:${c.hex}" data-fid="${folder.id}" data-color="${c.key}"></div>`).join('');
    document.body.appendChild(pop);
    pop.querySelectorAll('.cp-swatch').forEach(sw=>sw.addEventListener('click',e=>{e.stopPropagation();setFolderColor(sw.dataset.fid,sw.dataset.color);closeAllPopovers();}));

    const childWrap=el.querySelector(`#fch_${folder.id}`);
    children.forEach(f=>childWrap.appendChild(buildFileEl(f)));
    if(isOpen){const hint=document.createElement('div');hint.className='folder-drop-hint';hint.innerHTML=`<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Arraste áudios aqui`;childWrap.appendChild(hint);}

    el.querySelector('.folder-header').addEventListener('click',e=>{if(e.target.closest('.folder-actions'))return;toggleFolder(folder.id);});
    el.querySelector('.btn-fc').addEventListener('click',e=>{
      e.stopPropagation();const isOpen=pop.classList.contains('open');closeAllPopovers();
      if(!isOpen){pop.classList.add('open');const rect=e.currentTarget.getBoundingClientRect();const popW=148,popH=80;let left=rect.left,top=rect.bottom+4;if(left+popW>window.innerWidth-6)left=window.innerWidth-popW-6;if(top+popH>window.innerHeight-6)top=rect.top-popH-4;pop.style.left=left+'px';pop.style.top=top+'px';}
    });
    el.querySelector('.btn-fd').addEventListener('click',e=>{e.stopPropagation();if(!confirm(`Excluir "${folder.name}"?`))return;deleteFolder(folder.id);});

    el.addEventListener('dragover',e=>{e.preventDefault();e.stopPropagation();el.classList.add('drop-target');});
    el.addEventListener('dragleave',e=>{if(!el.contains(e.relatedTarget))el.classList.remove('drop-target');});
    el.addEventListener('drop',e=>{
      e.preventDefault();e.stopPropagation();el.classList.remove('drop-target');
      const internalId=e.dataTransfer.getData('application/x-soundfx-id');
      if(internalId){moveFileToFolder(internalId,folder.id);return;}
      if(state.isCEP){const text=e.dataTransfer.getData('text/plain');if(text&&text.trim()){const paths=text.split('\n').map(l=>l.trim().replace(/^file:\/\//,'')).filter(l=>AUDIO_EXTS.test(l));if(paths.length){addFilesByPath(paths,folder.id);return;}}}
      const items=e.dataTransfer.items;
      if(items?.length&&items[0]?.webkitGetAsEntry){handleDataTransferItems(items,folder.id);return;}
      if(e.dataTransfer.files.length)addFiles(e.dataTransfer.files,folder.id);
    });
    return el;
  }

  // Per-folder color cache: hex→rgba and lightenHex are pure but called thousands
  // of times during a full render. Memoize by hex once and reuse.
  const _folderColorCache = new Map();
  function getFolderColors(hex){
    let c = _folderColorCache.get(hex);
    if(c) return c;
    c = {
      full:  hex,
      dim:   hexToRgba(hex, 0.18),
      mid:   hexToRgba(hex, 0.35),
      glow:  hexToRgba(hex, 0.45),
      hover: hexToRgba(hex, 0.28),
      hi:    lightenHex(hex, 0.3),
    };
    _folderColorCache.set(hex, c);
    return c;
  }

  function buildFileEl(entry){
    const isActive=entry.id===state.selectedId,isPlaying=isActive&&state.isPlaying;

    // Resolve folder color — default to purple if no folder
    const folder = entry.folderId ? lib.folderById(entry.folderId) : null;
    const fcolor  = folder ? colorHex(folder.color) : '#7c3aed';
    const C = getFolderColors(fcolor);
    const colorDim=C.dim, colorMid=C.mid, colorGlow=C.glow, colorFull=C.full, colorHi=C.hi, colorHover=C.hover;

    const div=document.createElement('div');
    div.className=`file-item${isActive?' active':''}${isPlaying?' playing':''}`;
    div.dataset.id=entry.id; div.draggable=true;
    const ext=entry.name.split('.').pop().toUpperCase();
    const tagsHtml=entry.tags.map(tid=>{const t=PRESET_TAGS.find(p=>p.id===tid);return t?`<span class="file-tag" style="background:${t.color}22;color:${t.color}">${t.label}</span>`:''}).join('');
    const bpmHtml=entry.bpm?`<span class="bpm-badge">${entry.bpm} BPM</span>`:'';
    const useN = getUseCount(entry.id);
    const useHtml = useN>0 ? `<span class="use-badge" title="Inserido ${useN}× na timeline">${useN}×</span>` : '';
    const dur=entry.duration?fmtTime(entry.duration):'—';

    // Build colored mini-bars style
    const barsStyle = isActive
      ? `background:${colorFull};border-color:${colorHi};box-shadow:0 0 14px ${colorGlow};`
      : `background:${colorDim};border-color:${colorMid};box-shadow:0 0 8px ${colorGlow};`;
    const barsSpanColor = isActive ? 'rgba(255,255,255,0.9)' : colorHi;

    div.innerHTML=`
      <div class="file-mini-bars" style="${barsStyle}"
           data-color="${fcolor}"
           data-color-dim="${colorDim}"
           data-color-mid="${colorMid}"
           data-color-glow="${colorGlow}"
           data-color-hover="${colorHover}"
           data-color-full="${colorFull}"
           data-color-hi="${colorHi}">
        ${buildMiniBars(entry, barsSpanColor)}
      </div>
      <div class="file-info">
        <div class="file-name"><span class="file-name-text" title="${esc(entry.name)}">${esc(stripExt(entry.name))}</span></div>
        <div class="file-meta">
          <span>${ext}</span><span>·</span>
          <span class="file-duration" data-id="${entry.id}">${dur}</span>
          <span>·</span><span>${fmtSize(entry.size)}</span>
          ${bpmHtml}${useHtml}${tagsHtml?`<span>·</span><div class="file-tags">${tagsHtml}</div>`:''}
        </div>
      </div>
      <button class="btn-star${entry.starred?' starred':''}" title="${entry.starred?'Remover favorito':'Favoritar'}">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="${entry.starred?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </button>
      <div class="file-actions">
        <button class="fta-btn btn-qi" title="Inserir no playhead"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg></button>
        <button class="fta-btn btn-more" title="Mais opções"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg></button>
      </div>
      <div class="hover-progress"><div class="hover-progress-fill" id="hpf_${entry.id}"></div></div>`;

    // Hover — update mini-bars color
    const bars = div.querySelector('.file-mini-bars');
    div.addEventListener('mouseenter', () => {
      if (!div.classList.contains('active'))
        bars.style.cssText = `background:${colorHover};border-color:${colorMid};box-shadow:0 0 10px ${colorGlow};`;
    });
    div.addEventListener('mouseleave', () => {
      if (!div.classList.contains('active'))
        bars.style.cssText = `background:${colorDim};border-color:${colorMid};box-shadow:0 0 8px ${colorGlow};`;
    });

    // Single click — select & load preview
    // Double click — insert at playhead directly
    let clickTimer = null;
    div.addEventListener('click', e => {
      if (e.target.closest('.file-actions') || e.target.closest('.btn-star')) return;
      if (clickTimer) {
        // Double click detected
        clearTimeout(clickTimer);
        clickTimer = null;
        selectFile(entry.id);
        insertAtPlayhead(entry.id);
      } else {
        clickTimer = setTimeout(() => {
          clickTimer = null;
          selectFile(entry.id);
        }, 220);
      }
    });
    div.querySelector('.btn-star').addEventListener('click',e=>{e.stopPropagation();toggleStar(entry.id);});
    div.querySelector('.btn-qi').addEventListener('click',e=>{e.stopPropagation();selectFile(entry.id);insertAtPlayhead(entry.id);});
    div.querySelector('.btn-more').addEventListener('click',e=>{e.stopPropagation();showCtxMenu(e,entry);});
    div.addEventListener('contextmenu',e=>{e.preventDefault();showCtxMenu(e,entry);});
    div.addEventListener('mouseenter',()=>scheduleHoverPreview(entry,div));
    div.addEventListener('mouseleave',()=>cancelHoverPreview(div));
    // Mac drag: must import to project first, then drag the project item
    div.addEventListener('mousedown', e => {
      if (e.button !== 0 || !entry.path || !state.isCEP) return;
      let p = entry.path.replace(/\\/g, '/');
      if (p.startsWith('file:///')) p = p.slice(7);
      else if (p.startsWith('file://')) p = p.slice(7);
      try { p = decodeURIComponent(p); } catch(ex) {}
      if (state.platform === 'mac' && !p.startsWith('/')) p = '/' + p;
      div.dataset.cleanPath = p;
    });

    div.addEventListener('dragstart', e => {
      div.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      // Internal drag only: lets the user drop the sound into a user folder card.
      // Drag-to-host-timeline was attempted with `com.adobe.cep.dnd.file.N` but
      // is inconsistent across Premiere versions, so it's intentionally disabled.
      e.dataTransfer.setData('application/x-soundfx-id', entry.id);

      // Custom drag ghost
      try {
        const ghost = document.createElement('div');
        ghost.className = 'drag-ghost';
        ghost.textContent = '🎵 ' + stripExt(entry.name);
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 12, 14);
        setTimeout(() => ghost.remove(), 0);
      } catch(ex) {}
    });
    div.addEventListener('dragend', () => div.classList.remove('dragging'));
    return div;
  }

  function buildMiniBars(entry, spanColor){
    const raw=entry.waveformData?(()=>{const d=entry.waveformData,s=Math.floor(d.length/5);return[0,1,2,3,4].map(i=>d[i*s]||0);})():[0.35,0.75,0.95,0.55,0.65];
    const color = spanColor || 'var(--purple-hi)';
    return raw.map(v=>`<span style="height:${Math.max(3,Math.round(v*18))}px;background:${color};"></span>`).join('');
  }

  /** Convert #rrggbb hex to rgba(r,g,b,a) string */
  function hexToRgba(hex, alpha) {
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  /** Lighten a hex color by mixing with white */
  function lightenHex(hex, amount) {
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    const lr=Math.round(r+(255-r)*amount), lg=Math.round(g+(255-g)*amount), lb=Math.round(b+(255-b)*amount);
    return `#${lr.toString(16).padStart(2,'0')}${lg.toString(16).padStart(2,'0')}${lb.toString(16).padStart(2,'0')}`;
  }
  function updateFileMeta(id){document.querySelectorAll(`.file-duration[data-id="${id}"]`).forEach(el=>{const e=lib.fileById(id);if(e?.duration)el.textContent=fmtTime(e.duration);});}

  // ════════════════════════════════════════════════════════════
  // HOVER PREVIEW
  // ════════════════════════════════════════════════════════════
  function scheduleHoverPreview(entry,div){cancelHoverPreview(div);hoverTimer=setTimeout(()=>startHoverPreview(entry,div),400);}
  function cancelHoverPreview(div){clearTimeout(hoverTimer);hoverTimer=null;stopHoverPreview();if(div){div.classList.remove('hover-preview');const f=div.querySelector('.hover-progress-fill');if(f)f.style.width='0%';}}

  async function startHoverPreview(entry,div){
    stopHoverPreview(); div.classList.add('hover-preview');
    try {
      if(!hoverCtx||hoverCtx.state==='closed')hoverCtx=new (window.AudioContext||window.webkitAudioContext)();
      if(hoverCtx.state==='suspended')hoverCtx.resume();
      let ab;
      if(entry.fileObj)ab=await entry.fileObj.arrayBuffer();
      else if(entry.path){const r=await fetch(pathToUrl(entry.path));ab=await r.arrayBuffer();}
      else return;
      const buf=await hoverCtx.decodeAudioData(ab);
      const dur=Math.min(buf.duration,2.5);
      hoverGain=hoverCtx.createGain();hoverGain.gain.value=state.volume*0.7;hoverGain.connect(hoverCtx.destination);
      hoverSource=hoverCtx.createBufferSource();hoverSource.buffer=buf;hoverSource.connect(hoverGain);
      hoverSource.start(0,0,dur);hoverSource.onended=()=>stopHoverPreview(div);
      hoverStartedAt=hoverCtx.currentTime;
      (function tick(){cancelAnimationFrame(hoverAnimFrame);hoverAnimFrame=requestAnimationFrame(()=>{if(!hoverSource)return;const ratio=Math.min((hoverCtx.currentTime-hoverStartedAt)/dur,1);const f=div.querySelector('.hover-progress-fill');if(f)f.style.width=(ratio*100)+'%';if(ratio<1)tick();});})();
    } catch(e){div.classList.remove('hover-preview');}
  }
  function stopHoverPreview(div){
    cancelAnimationFrame(hoverAnimFrame);
    if(hoverSource){try{hoverSource.stop();}catch(e){}hoverSource.disconnect();hoverSource=null;}
    if(hoverGain){hoverGain.disconnect();hoverGain=null;}
    if(div){div.classList.remove('hover-preview');const f=div.querySelector('.hover-progress-fill');if(f)f.style.width='0%';}
  }

  // ════════════════════════════════════════════════════════════
  // SELECT & LOAD
  // ════════════════════════════════════════════════════════════
  function selectFile(id){
    if(state.selectedId===id&&audioBuffer)return;
    stopAudio();state.selectedId=id;startOffset=0;
    addToRecents(id);renderLibrary();
    const entry=lib.fileById(id);if(!entry)return;
    dom.playerName().textContent=stripExt(entry.name);
    dom.playerName().classList.remove('empty');
    dom.playerExt().textContent=entry.name.split('.').pop().toUpperCase();
    const pb=dom.playerBpm();if(pb){if(entry.bpm){pb.textContent=entry.bpm+' BPM';pb.classList.add('visible');}else pb.classList.remove('visible');}
    dom.btnInsert().disabled=false;dom.btnImport().disabled=false;
    clearTrim();
    loadAudioBuffer(entry);
  }

  async function loadAudioBuffer(entry){
    showWaveLoading(true);clearWaveCanvas();
    try {
      const ctx=getACtx();let ab;
      if(entry.fileObj)ab=await entry.fileObj.arrayBuffer();
      else if(entry.path){const r=await fetch(pathToUrl(entry.path));ab=await r.arrayBuffer();}
      else throw new Error('Sem dados');
      audioBuffer=await ctx.decodeAudioData(ab);
      entry.duration=audioBuffer.duration;
      dom.timeTot().textContent=fmtTime(audioBuffer.duration);
      if(!entry.waveformData||entry.waveformData.length<10){entry.waveformData=extractWaveform(audioBuffer,220);saveLibrary();}
      drawWaveform(entry.waveformData);showWaveLoading(false);updateFileMeta(entry.id);renderLibrary();
    } catch(e){
      showWaveLoading(false);
      if(entry.waveformData){drawWaveform(entry.waveformData);toast('Preview indisponível','error');}
      else toast('Erro: '+e.message,'error');
    }
  }

  // ════════════════════════════════════════════════════════════
  // WAVEFORM
  // ════════════════════════════════════════════════════════════
  function getACtx(){if(!audioCtx||audioCtx.state==='closed')audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx;}
  function extractWaveform(buffer,samples){const ch=buffer.getChannelData(0),step=Math.floor(ch.length/samples),out=new Float32Array(samples);for(let i=0;i<samples;i++){let max=0,b=i*step;for(let j=0;j<step;j++){const v=Math.abs(ch[b+j]||0);if(v>max)max=v;}out[i]=max;}return out;}

  function drawWaveform(data){
    const canvas=dom.waveCanvas();if(!canvas)return;
    const dpr=window.devicePixelRatio||1;
    canvas.width=canvas.offsetWidth*dpr;canvas.height=canvas.offsetHeight*dpr;
    const ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height,mid=H/2,bw=W/data.length;
    ctx.clearRect(0,0,W,H);
    for(let i=0;i<data.length;i++){
      const bh=data[i]*mid*0.88,x=i*bw;
      ctx.fillStyle=`rgba(255,255,255,${0.15+data[i]*0.12})`;
      if(ctx.roundRect){ctx.beginPath();ctx.roundRect(x+.5,mid-bh,Math.max(1,bw-1),bh*2,1);ctx.fill();}
      else ctx.fillRect(x+.5,mid-bh,Math.max(1,bw-1),bh*2);
    }
    canvas._data=data;canvas._W=W;canvas._H=H;setWaveProgress(0);
  }

  function setWaveProgress(ratio){
    const canvas=dom.waveCanvas();if(!canvas||!canvas._data)return;
    const ctx=canvas.getContext('2d'),W=canvas._W,H=canvas._H,data=canvas._data;
    const mid=H/2,bw=W/data.length,sx=ratio*W;
    ctx.clearRect(0,0,W,H);
    for(let i=0;i<data.length;i++){
      const bh=data[i]*mid*0.88,x=i*bw;
      ctx.fillStyle=x<sx?`rgba(168,85,247,${0.65+data[i]*0.32})`:`rgba(255,255,255,${0.15+data[i]*0.12})`;
      if(ctx.roundRect){ctx.beginPath();ctx.roundRect(x+.5,mid-bh,Math.max(1,bw-1),bh*2,1);ctx.fill();}
      else ctx.fillRect(x+.5,mid-bh,Math.max(1,bw-1),bh*2);
    }
    dom.wavePlayed().style.width=(ratio*100)+'%';
    dom.waveCursor().style.left=(ratio*100)+'%';
    dom.timeFill().style.width=(ratio*100)+'%';
  }

  function clearWaveCanvas(){const c=dom.waveCanvas();if(c){c.getContext('2d').clearRect(0,0,c.width,c.height);c._data=null;}dom.wavePlayed().style.width='0%';dom.waveCursor().style.left='0%';dom.timeFill().style.width='0%';dom.timeCur().textContent='0:00';dom.timeTot().textContent='0:00';}
  function showWaveLoading(on){dom.waveLoading().style.display=on?'flex':'none';}

  function setupWaveHover(){
    const wrap=dom.waveWrap();
    wrap.addEventListener('mousemove',e=>{if(!audioBuffer)return;const r=wrap.getBoundingClientRect(),h=dom.waveHover();h.style.display='block';h.style.left=(((e.clientX-r.left)/r.width)*100)+'%';});
    wrap.addEventListener('mouseleave',()=>{dom.waveHover().style.display='none';});
  }

  // ════════════════════════════════════════════════════════════
  // TRIM HANDLES
  // ════════════════════════════════════════════════════════════
  function updateTrimUI(){
    const hasTrim=trimIn!==null&&trimOut!==null;
    const inPct=(trimIn||0)*100,outPct=(trimOut||1)*100;
    const region=dom.trimRegion();
    if(region){region.style.display=hasTrim?'block':'none';if(hasTrim){region.style.left=inPct+'%';region.style.width=(outPct-inPct)+'%';}}
    const ih=dom.trimIn(),oh=dom.trimOut();
    if(ih){ih.classList.toggle('visible',trimIn!==null);if(trimIn!==null)ih.style.left='calc('+inPct+'% - 6px)';}
    if(oh){oh.classList.toggle('visible',trimOut!==null);if(trimOut!==null)oh.style.right='calc('+(100-outPct)+'% - 6px)';}
    const badge=dom.trimBadge();
    if(badge){if(hasTrim&&audioBuffer){const dur=(trimOut-trimIn)*audioBuffer.duration;badge.textContent=fmtTime(dur)+' sel.';badge.classList.add('visible');badge.style.left=((inPct+outPct)/2)+'%';}else badge.classList.remove('visible');}
    const durEl=dom.trimDur();
    if(durEl){if(hasTrim&&audioBuffer){durEl.textContent='↔ '+fmtTime((trimOut-trimIn)*audioBuffer.duration);durEl.classList.add('visible');}else durEl.classList.remove('visible');}
    dom.btnTrimReset().classList.toggle('visible',hasTrim);
    const lbl=dom.insertLabel();if(lbl)lbl.textContent=hasTrim?'Inserir trecho':'Inserir';
    dom.btnInsert().classList.toggle('trim-active',hasTrim);
  }

  function clearTrim(){trimIn=trimOut=trimDragging=null;updateTrimUI();}

  function setupTrimHandles(){
    const wrap=dom.waveWrap();if(!wrap)return;
    // Trim/in-out is not supported in the current build — gestures disabled.
    // Click-to-seek remains active (bound separately).
    dom.btnTrimReset().addEventListener('click',clearTrim);
  }

  // ════════════════════════════════════════════════════════════
  // PLAYBACK
  // ════════════════════════════════════════════════════════════
  function playAudio(){
    if(!audioBuffer)return;stopSource();
    const ctx=getACtx();
    gainNode=ctx.createGain();gainNode.gain.value=state.volume;gainNode.connect(ctx.destination);
    sourceNode=ctx.createBufferSource();sourceNode.buffer=audioBuffer;sourceNode.connect(gainNode);sourceNode.loop=state.isLooping;
    sourceNode.onended=()=>{if(!state.isLooping){state.isPlaying=false;startOffset=0;cancelAnimationFrame(animFrame);updatePlayBtn();setWaveProgress(0);dom.timeCur().textContent='0:00';updatePlayingClass(false);}};
    startedAt=ctx.currentTime-startOffset;sourceNode.start(0,startOffset);
    state.isPlaying=true;updatePlayBtn();updatePlayingClass(true);tickMain();
  }
  function pauseAudio(){if(!state.isPlaying)return;startOffset=getACtx().currentTime-startedAt;stopSource();state.isPlaying=false;cancelAnimationFrame(animFrame);updatePlayBtn();updatePlayingClass(false);}
  function stopAudio(){stopSource();state.isPlaying=false;startOffset=0;cancelAnimationFrame(animFrame);updatePlayBtn();updatePlayingClass(false);if(audioBuffer){setWaveProgress(0);dom.timeCur().textContent='0:00';}}
  function stopSource(){if(sourceNode){try{sourceNode.stop();}catch(e){}sourceNode.disconnect();sourceNode=null;}if(gainNode){gainNode.disconnect();gainNode=null;}}
  function tickMain(){animFrame=requestAnimationFrame(()=>{if(!state.isPlaying||!audioBuffer)return;const el=Math.min(getACtx().currentTime-startedAt,audioBuffer.duration);setWaveProgress(el/audioBuffer.duration);dom.timeCur().textContent=fmtTime(el);tickMain();});}
  function seekTo(ratio){if(!audioBuffer)return;startOffset=ratio*audioBuffer.duration;if(state.isPlaying)playAudio();else{setWaveProgress(ratio);dom.timeCur().textContent=fmtTime(startOffset);}}
  function applyVolume(v){state.volume=v;if(gainNode)gainNode.gain.value=v;localStorage.setItem(STORE_VOL,String(v));}
  function updatePlayBtn(){dom.playIcon().innerHTML=state.isPlaying?`<rect x="5" y="4" width="4" height="16" rx="1.5" fill="currentColor"/><rect x="15" y="4" width="4" height="16" rx="1.5" fill="currentColor"/>`:`<polygon points="5,3 19,12 5,21" fill="currentColor"/>`;}
  function updatePlayingClass(on){
    document.querySelectorAll(`.file-item[data-id="${state.selectedId}"]`).forEach(el=>{
      el.classList.toggle('playing',on);
      // Re-apply color to mini-bars when active state changes
      const bars = el.querySelector('.file-mini-bars');
      if (!bars) return;
      const entry = lib.fileById(state.selectedId);
      if (!entry) return;
      const folder = entry.folderId ? lib.folderById(entry.folderId) : null;
      const fcolor = folder ? colorHex(folder.color) : '#7c3aed';
      const colorGlow = hexToRgba(fcolor, 0.45);
      const colorHi   = lightenHex(fcolor, 0.3);
      const colorDim  = hexToRgba(fcolor, 0.18);
      const colorMid  = hexToRgba(fcolor, 0.35);
      if (el.classList.contains('active')) {
        bars.style.cssText = `background:${fcolor};border-color:${colorHi};box-shadow:0 0 14px ${colorGlow};`;
        bars.querySelectorAll('span').forEach(s=>s.style.background='rgba(255,255,255,0.9)');
      } else {
        bars.style.cssText = `background:${colorDim};border-color:${colorMid};box-shadow:0 0 8px ${colorGlow};`;
        bars.querySelectorAll('span').forEach(s=>s.style.background=colorHi);
      }
    });
  }

  // ════════════════════════════════════════════════════════════
  // CEP ACTIONS
  // ════════════════════════════════════════════════════════════
  function buildPath(entry){
    let p=entry.path||'';if(!p)return null;
    p=p.replace(/\\/g,'/');
    if(p.startsWith('file:///'))p=p.slice(state.platform==='mac'?7:8);
    else if(p.startsWith('file://'))p=p.slice(7);
    return p.replace(/'/g,"\\'");
  }

  function getTargetTrack(cb){
    if(!state.autoTrack){cb(trackSelectedIndex);return;}
    evalScript('getAutoTrack()',res=>{try{const d=parseEvalResult(res);cb(typeof d.trackIndex==='number'?d.trackIndex:0);}catch(e){cb(0);}});
  }

  function insertAtPlayhead(id, opts){
    opts = opts || {};
    const entry=lib.fileById(id||state.selectedId);
    if(!entry){toast('Nenhum arquivo selecionado','error');return;}
    // Visual feedback on the file item
    document.querySelectorAll(`.file-item[data-id="${entry.id}"]`).forEach(el=>{
      el.classList.add('inserting');
      setTimeout(()=>el.classList.remove('inserting'), 400);
    });
    if(!state.isCEP){toast('Funciona somente no Premiere Pro','info');return;}
    const p=buildPath(entry);if(!p){toast('Caminho indisponível','error');return;}
    const useInPoint = opts.useInPoint ? 1 : 0;
    const gainDb = (typeof opts.gainDb === 'number') ? opts.gainDb : state.insertGainDb || 0;
    getTargetTrack(track=>{
      setStatus('Inserindo…','loading');
      evalScript(`importAndInsertAtPlayhead('${p}',${track},${useInPoint},${gainDb})`,res=>{
        try{
          const d=parseEvalResult(res);
          if(d.error){toast(d.error,'error');setStatus(d.error,'error');}
          else{
            toast(d.message||'Inserido!','success');
            setStatus(d.message||'Pronto','connected');
            bumpUseCount(entry.id);
          }
        }
        catch(e){toast('Inserido!','success');setStatus('Pronto','connected');bumpUseCount(entry.id);}
      });
    });
  }

  // Track how many times each sound has been inserted, for the "Most used" tab.
  function bumpUseCount(id){
    if(!state.useCounts) state.useCounts = {};
    state.useCounts[id] = (state.useCounts[id]||0) + 1;
    try { localStorage.setItem(STORE_USE_COUNTS, JSON.stringify(state.useCounts)); } catch(e){}
  }
  function getUseCount(id){ return (state.useCounts && state.useCounts[id]) || 0; }

  function importToProject(){
    const entry=lib.fileById(state.selectedId);
    if(!entry){toast('Nenhum arquivo selecionado','error');return;}
    if(!state.isCEP){toast('Funciona somente no Premiere Pro','info');return;}
    const p=buildPath(entry);if(!p){toast('Caminho indisponível','error');return;}
    setStatus('Importando…','loading');
    evalScript(`importAudioFile('${p}')`,res=>{
      try{const d=parseEvalResult(res);if(d.error){toast(d.error,'error');setStatus(d.error,'error');}else{toast(d.alreadyImported?`"${d.name}" já no projeto`:`"${d.name}" → projeto`,'success');setStatus('Importado','connected');}}
      catch(e){toast('Importado!','success');setStatus('Pronto','connected');}
    });
  }

  // ════════════════════════════════════════════════════════════
  // CONTEXT MENU
  // ════════════════════════════════════════════════════════════
  let ctxMenuEl=null;

  function showCtxMenu(e,entry){
    closeCtxMenu();
    const folders=lib.folders();
    const menu=document.createElement('div');menu.className='ctx-menu';menu.id='ctx-menu';
    let html=`<div class="ctx-menu-title">Arquivo</div>
      <div class="ctx-item" data-action="edit"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Renomear / Tags / BPM</div>
      <div class="ctx-item" data-action="star"><svg width="11" height="11" viewBox="0 0 24 24" fill="${entry.starred?'#f59e0b':'none'}" stroke="${entry.starred?'#f59e0b':'currentColor'}" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>${entry.starred?'Remover favorito':'Adicionar favorito'}</div>`;
    if(folders.length){
      html+=`<div class="ctx-sep"></div><div class="ctx-menu-title">Mover para pasta</div>`;
      folders.forEach(f=>{html+=`<div class="ctx-item" data-action="move" data-fid="${f.id}"><svg width="11" height="9" viewBox="0 0 22 14" fill="${colorHex(f.color)}"><path d="M1 2a1 1 0 011-1h5l2 2h11a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V2z"/></svg>${esc(f.name)}${entry.folderId===f.id?' ✓':''}</div>`;});
      if(entry.folderId)html+=`<div class="ctx-item" data-action="move" data-fid="">Remover da pasta</div>`;
    }
    html+=`<div class="ctx-sep"></div><div class="ctx-item danger" data-action="delete"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Remover arquivo</div>`;
    menu.innerHTML=html;document.body.appendChild(menu);ctxMenuEl=menu;
    const mw=165,mh=menu.offsetHeight||180;
    menu.style.left=(e.clientX+mw>window.innerWidth?e.clientX-mw:e.clientX)+'px';
    menu.style.top=(e.clientY+mh>window.innerHeight?e.clientY-mh:e.clientY)+'px';
    menu.addEventListener('click',ev=>{
      const item=ev.target.closest('[data-action]');if(!item)return;
      const action=item.dataset.action;
      if(action==='edit')openEditModal(entry.id);
      else if(action==='star')toggleStar(entry.id);
      else if(action==='move'){moveFileToFolder(entry.id,item.dataset.fid||null);toast(item.dataset.fid?'Arquivo movido':'Removido da pasta','success');}
      else if(action==='delete')removeFile(entry.id);
      closeCtxMenu();
    });
  }
  function closeCtxMenu(){if(ctxMenuEl){ctxMenuEl.remove();ctxMenuEl=null;}}
  function closeAllPopovers(){document.querySelectorAll('.color-popover.open').forEach(p=>p.classList.remove('open'));}

  // ════════════════════════════════════════════════════════════
  // EDIT MODAL
  // ════════════════════════════════════════════════════════════
  function openEditModal(id){
    const entry=lib.fileById(id);if(!entry)return;
    editingFileId=id;
    dom.modalRename().value=stripExt(entry.name);
    dom.modalBpm().value=entry.bpm||'';
    dom.tagsGrid().innerHTML=PRESET_TAGS.map(t=>`
      <div class="tag-toggle${entry.tags.includes(t.id)?' on':''}" data-tag="${t.id}"
        style="${entry.tags.includes(t.id)?`background:${t.color};border-color:${t.color}`:``}">
        <span class="tag-dot" style="background:${t.color}"></span>${t.label}
      </div>`).join('');
    dom.tagsGrid().querySelectorAll('.tag-toggle').forEach(el=>{
      el.addEventListener('click',()=>{
        el.classList.toggle('on');
        const t=PRESET_TAGS.find(p=>p.id===el.dataset.tag);
        if(t){if(el.classList.contains('on')){el.style.background=t.color;el.style.borderColor=t.color;el.style.color='white';}else{el.style.background='';el.style.borderColor='';el.style.color='';}}
      });
    });
    dom.tagModal().classList.add('open');dom.modalRename().focus();dom.modalRename().select();
  }

  function saveEditModal(){
    const entry=lib.fileById(editingFileId);if(!entry)return;
    const newName=dom.modalRename().value.trim();
    if(newName){const ext=entry.name.split('.').pop();entry.name=newName+(newName.includes('.')?'':'.'+ext);}
    const bpm=parseInt(dom.modalBpm().value,10);entry.bpm=(bpm>=40&&bpm<=300)?bpm:null;
    entry.tags=Array.from(dom.tagsGrid().querySelectorAll('.tag-toggle.on')).map(el=>el.dataset.tag);
    saveLibrary();renderLibrary();renderTagBar();renderTabCounts();
    dom.tagModal().classList.remove('open');editingFileId=null;
    toast('Arquivo atualizado','success');
  }

  // ════════════════════════════════════════════════════════════
  // SHORTCUT
  // ════════════════════════════════════════════════════════════
  // ════════════════════════════════════════════════════════════
  // UI HELPERS
  // ════════════════════════════════════════════════════════════
  function applyTheme(theme) {
    document.body.classList.toggle('theme-light', theme === 'light');
    const icon = g('theme-icon');
    if (icon) {
      if (theme === 'light') {
        // Moon icon for switching to dark
        icon.innerHTML = `<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" stroke="none"/>`;
      } else {
        // Sun icon for switching to light
        icon.innerHTML = `<circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
      }
    }
  }

  function toggleTheme() {
    const current = localStorage.getItem(STORE_THEME) || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORE_THEME, next);
    applyTheme(next);
    toast(next === 'light' ? 'Tema claro ativado' : 'Tema escuro ativado', 'info');
  }

  function resetPlayer(){
    dom.playerName().textContent='Selecione um arquivo';dom.playerName().classList.add('empty');dom.playerExt().textContent='—';
    const pb=dom.playerBpm();if(pb)pb.classList.remove('visible');
    clearWaveCanvas();audioBuffer=null;dom.btnInsert().disabled=true;dom.btnImport().disabled=true;
    clearTrim();
  }
  function setStatus(msg,type){dom.statusText().textContent=msg;dom.statusDot().className='';if(type==='connected')dom.statusDot().classList.add('connected');else if(type==='error')dom.statusDot().classList.add('error');else if(type==='loading')dom.statusDot().classList.add('loading');}
  function toast(msg,type){const t=document.createElement('div');t.className='toast '+(type||'info');t.innerHTML=`<span>${type==='success'?'✓':type==='error'?'✕':'ℹ'}</span><span>${esc(msg)}</span>`;dom.toastWrap().appendChild(t);setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),300);},2800);}
  function updateSortBtn(){if(state.activeTab==='recents'||state.activeTab==='topused'){dom.sortBtn().style.display='none';return;}dom.sortBtn().style.display='';dom.sortBtn().textContent={name:'Nome',date:'Data',size:'Tamanho'}[state.sortOrder]||'Nome';}

  async function handleDataTransferItems(items,targetFolderId){
    const audioFiles=[];
    async function readEntry(entry,folderName){
      if(entry.isFile){await new Promise(resolve=>{entry.file(file=>{if(AUDIO_MIME.test(file.type)||AUDIO_EXTS.test(file.name)){try{Object.defineProperty(file,'webkitRelativePath',{value:(folderName?folderName+'/':'')+file.name});}catch(e){}audioFiles.push({file,folderName});}resolve();},resolve);});}
      else if(entry.isDirectory){const reader=entry.createReader();await new Promise(resolve=>{reader.readEntries(async entries=>{for(const e of entries)await readEntry(e,folderName||entry.name);resolve();},resolve);});}
    }
    for(const item of Array.from(items)){if(!item.webkitGetAsEntry)continue;const entry=item.webkitGetAsEntry();if(!entry)continue;await readEntry(entry,entry.isDirectory?entry.name:'');}
    if(!audioFiles.length)return;
    const groups={};audioFiles.forEach(({file,folderName})=>{const dir=folderName||'__root__';(groups[dir]=groups[dir]||[]).push(file);});
    Object.entries(groups).forEach(([dir,files])=>{
      let fid=targetFolderId||null;
      if(dir!=='__root__'&&!targetFolderId){let ex=lib.items.find(i=>i.type==='folder'&&i.name===dir);if(!ex){const nid='folder_'+Date.now();ex={type:'folder',id:nid,name:dir,color:'grey',open:true,dateAdded:Date.now()};lib.items.unshift(ex);}fid=ex.id;}
      addFiles(files,fid);
    });
  }

  // ════════════════════════════════════════════════════════════
  // BIND EVENTS
  // ════════════════════════════════════════════════════════════
  function bindEvents(){
    g('btn-add-files').addEventListener('click',()=>openNativeFileDialog(null));
    dom.fileInput().addEventListener('change',e=>{addFiles(e.target.files,state.openFolderId||null);e.target.value='';});

    // Folder modal bindings
    g('folder-modal-cancel').addEventListener('click',closeFolderModal);
    g('folder-modal-save').addEventListener('click',saveFolderModal);
    g('folder-modal-name').addEventListener('keydown',e=>{
      if(e.key==='Enter')saveFolderModal();
      if(e.key==='Escape')closeFolderModal();
    });
    g('folder-modal').addEventListener('click',e=>{if(e.target.id==='folder-modal')closeFolderModal();});
    dom.folderInput().addEventListener('change',e=>{
      if(state.isCEP)return;
      const groups={};
      Array.from(e.target.files).forEach(file=>{if(!AUDIO_MIME.test(file.type)&&!AUDIO_EXTS.test(file.name))return;const parts=(file.webkitRelativePath||file.name).split('/');const dir=parts.length>1?parts[0]:'__root__';(groups[dir]=groups[dir]||[]).push(file);});
      Object.entries(groups).forEach(([dir,files])=>{let folderId=null;if(dir!=='__root__'){let ex=lib.items.find(i=>i.type==='folder'&&i.name===dir);if(!ex){const nid='folder_'+Date.now();ex={type:'folder',id:nid,name:dir,color:'grey',open:true,dateAdded:Date.now()};lib.items.unshift(ex);}folderId=ex.id;}addFiles(files,folderId);});
      e.target.value='';
    });

    g('btn-add-folder').addEventListener('click',()=>{const row=dom.newFolderRow(),vis=row.style.display!=='none';row.style.display=vis?'none':'flex';if(!vis)dom.newFolderName().focus();});
    g('new-folder-ok').addEventListener('click',()=>{const name=dom.newFolderName().value.trim();if(name){createFolder(name,'grey');dom.newFolderName().value='';dom.newFolderRow().style.display='none';}});
    dom.newFolderName().addEventListener('keydown',e=>{if(e.key==='Enter')g('new-folder-ok').click();if(e.key==='Escape')dom.newFolderRow().style.display='none';});

    document.querySelectorAll('.tab').forEach(tab=>{tab.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');state.activeTab=tab.dataset.tab;state.openFolderId=null;updateSortBtn();renderLibrary();});});

    // Debounced search: keystrokes are coalesced so we don't re-render 1463
    // items on every key. 140ms feels instant but skips intermediate work.
    let _searchT;
    dom.searchInput().addEventListener('input',e=>{
      const v=e.target.value.trim();
      clearTimeout(_searchT);
      _searchT=setTimeout(()=>{state.searchQuery=v;renderLibrary();},140);
    });
    // Clicking anywhere on the search box (padding/border included) focuses the input
    const searchBox=document.querySelector('.search-hero .search-box');
    if(searchBox) searchBox.addEventListener('mousedown',e=>{
      if(e.target!==dom.searchInput()){ e.preventDefault(); dom.searchInput().focus(); }
    });
    dom.sortBtn().addEventListener('click',()=>{const o=['name','date','size'];state.sortOrder=o[(o.indexOf(state.sortOrder)+1)%o.length];localStorage.setItem(STORE_SORT,state.sortOrder);updateSortBtn();renderLibrary();});

    // Waveform
    dom.waveWrap().addEventListener('click',e=>{if(!audioBuffer)return;const r=dom.waveWrap().getBoundingClientRect();seekTo(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)));});
    setupWaveHover();
    setupTrimHandles();

    // Transport
    dom.btnPlay().addEventListener('click',()=>{if(!audioBuffer){toast('Selecione um arquivo primeiro','info');return;}state.isPlaying?pauseAudio():playAudio();});
    dom.btnStop().addEventListener('click',stopAudio);
    dom.btnLoop().addEventListener('click',()=>{state.isLooping=!state.isLooping;dom.btnLoop().classList.toggle('on',state.isLooping);if(sourceNode)sourceNode.loop=state.isLooping;});
    dom.volSlider().addEventListener('input',e=>applyVolume(parseFloat(e.target.value)));

    // Player bottom
    dom.btnInsert().addEventListener('click',()=>insertAtPlayhead(state.selectedId));
    dom.btnImport().addEventListener('click',importToProject);
    // Custom track dropdown
    const dropBtn = dom.trackDropBtn();
    if (dropBtn) {
      dropBtn.addEventListener('click', e => {
        e.stopPropagation();
        const drop = dom.trackDrop();
        if (drop.classList.contains('open')) { closeTrackDrop(); }
        else { if (state.isCEP) refreshTracks(); openTrackDrop(); }
      });
    }
    document.addEventListener('click', () => closeTrackDrop());

    g('btn-refresh-tracks').addEventListener('click', () => { refreshTracks(); toast('Tracks atualizadas', 'info'); });

    dom.toggleAutoTrack().addEventListener('click',()=>{
      state.autoTrack=!state.autoTrack;
      dom.toggleAutoTrack().classList.toggle('on',state.autoTrack);
      setTrackDropDisabled(state.autoTrack);
      localStorage.setItem(STORE_AUTO,state.autoTrack?'1':'0');
      toast(state.autoTrack?'Track automática ativada':'Track manual','info');
    });

    // Header
    g('btn-refresh').addEventListener('click',()=>{if(state.isCEP)initCEP();else setStatus('Atualizado','info');});
    g('btn-launcher').addEventListener('click', openLauncher);
    g('btn-theme').addEventListener('click', toggleTheme);

    // Insertion-gain pills (-12 / 0 / +6 dB)
    document.querySelectorAll('#gain-pills .gain-pill').forEach(btn=>{
      const dB = parseFloat(btn.dataset.g);
      if(Math.abs(dB - state.insertGainDb) < 0.01) {
        document.querySelectorAll('#gain-pills .gain-pill').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
      }
      btn.addEventListener('click',()=>{
        document.querySelectorAll('#gain-pills .gain-pill').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        state.insertGainDb = dB;
        try { localStorage.setItem(STORE_GAIN, String(dB)); } catch(e){}
      });
    });
    g('btn-logout').addEventListener('click', () => {
      if (!confirm('Sair da conta DropSFX?')) return;
      clearSession();
      showApp._initialized = false;
      stopAudio();
      location.reload();
    });
    g('btn-clear-all').addEventListener('click',()=>{if(!confirm('Limpar toda a biblioteca?'))return;lib.items=[];state.selectedId=null;state.recents=[];audioBuffer=null;stopAudio();resetPlayer();saveLibrary();saveRecents();renderLibrary();renderTabCounts();renderTagBar();});

    g('btn-reload-lib').addEventListener('click', () => {
      // Remember favorites (by path) so we can re-apply after reseed
      const faves = new Set(lib.items.filter(it => it.type === 'file' && it.starred).map(it => it.path));
      // Drop bundled items + reset seed flags to force a fresh load
      lib.items = lib.items.filter(it => !it.bundled);
      localStorage.removeItem(STORE_SEEDED);
      localStorage.removeItem(STORE_LIB_VER);
      setStatus('Recarregando biblioteca…', 'info');
      seedInitialLibrary(seeded => {
        if (faves.size) {
          lib.items.forEach(it => { if (it.type === 'file' && faves.has(it.path)) it.starred = true; });
          try { saveLibrary(); } catch(e) {}
        }
        renderTabCounts(); renderTagBar(); renderLibrary();
        toast(seeded ? 'Biblioteca atualizada ✨' : 'Biblioteca já está atualizada', 'info');
      });
    });

    // Modals
    g('modal-cancel').addEventListener('click',()=>{dom.tagModal().classList.remove('open');editingFileId=null;});
    g('modal-save').addEventListener('click',saveEditModal);

    // Drag/drop global
    document.body.addEventListener('dragover',e=>{if(e.dataTransfer?.types.includes('Files')){e.preventDefault();dom.dragOverlay().classList.add('on');}});
    document.body.addEventListener('dragleave',e=>{if(!e.relatedTarget||e.relatedTarget===document.documentElement)dom.dragOverlay().classList.remove('on');});
    document.body.addEventListener('drop',e=>{
      dom.dragOverlay().classList.remove('on');e.preventDefault();
      const tgt=state.openFolderId||null;
      if(state.isCEP){const text=e.dataTransfer.getData('text/plain');if(text&&text.trim()){const paths=text.split('\n').map(l=>l.trim().replace(/^file:\/\//,'')).filter(l=>AUDIO_EXTS.test(l));if(paths.length){addFilesByPath(paths,tgt);return;}}}
      const items=e.dataTransfer.items;
      if(items?.length&&items[0]?.webkitGetAsEntry){handleDataTransferItems(items,tgt);return;}
      if(e.dataTransfer.files.length)addFiles(e.dataTransfer.files,tgt);
    });

    // Close menus
    document.addEventListener('click',e=>{if(!e.target.closest('.color-popover')&&!e.target.closest('.btn-fc'))closeAllPopovers();if(!e.target.closest('.ctx-menu')&&!e.target.closest('.btn-more'))closeCtxMenu();});

    // Keyboard
    document.addEventListener('keydown',e=>{
      // Don't capture keys when user is typing in an input/textarea
      if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
      // Modal open? Skip
      if(document.querySelector('.modal-overlay.open')||document.getElementById('tour-overlay').classList.contains('open'))return;

      const mod = e.ctrlKey||e.metaKey||e.altKey;

      // Enter: insert at playhead. Shift+Enter: insert at in-point (or playhead fallback)
      if(e.code==='Enter'&&state.selectedId&&!mod){
        e.preventDefault();
        insertAtPlayhead(state.selectedId, {useInPoint: e.shiftKey});
        return;
      }
      // Arrow Down/Up: navigate visible sounds (and auto-preview)
      if((e.code==='ArrowDown'||e.code==='ArrowUp')&&!mod){
        const moved = stepSelection(e.code==='ArrowDown'?1:-1);
        if(moved){ e.preventDefault(); }
        return;
      }
      if(e.code==='Space'&&!mod){e.preventDefault();dom.btnPlay().click();}
      if(e.code==='Escape'){stopAudio();closeCtxMenu();}
    });
  }

  // Move the selection up/down through the currently rendered file list.
  // Returns true if a move happened (so we can preventDefault on the arrow).
  function stepSelection(dir){
    const rows = Array.from(document.querySelectorAll('#file-list .file-item'));
    if(!rows.length) return false;
    const ids = rows.map(r=>r.dataset.id);
    let idx = state.selectedId ? ids.indexOf(state.selectedId) : -1;
    if(idx === -1){ idx = dir>0 ? -1 : rows.length; }
    const next = Math.max(0, Math.min(rows.length-1, idx+dir));
    if(next === idx) return false;
    const targetId = ids[next];
    selectFile(targetId);
    // Scroll into view (closest = least visual jump)
    const targetRow = document.querySelector(`#file-list .file-item[data-id="${targetId}"]`);
    if(targetRow && targetRow.scrollIntoView){
      try { targetRow.scrollIntoView({block:'nearest', behavior:'smooth'}); } catch(e){ targetRow.scrollIntoView(); }
    }
    return true;
  }

  // ════════════════════════════════════════════════════════════
  // ONBOARDING TOUR
  // ════════════════════════════════════════════════════════════
  const TOUR_STEPS = [
    {
      sel: null,
      title: 'Bem-vindo ao dropSFX 🎬',
      body: 'Mais de 1.400 efeitos sonoros, prontos pra usar dentro do Premiere. Vou te mostrar o essencial em 20 segundos.',
      next: 'Bora!'
    },
    {
      sel: '#file-list .fgrid',
      title: '2 cliques e tá na timeline ⚡',
      body: 'Essa é a mágica: dê 2 cliques em qualquer som e ele cai direto no playhead do Premiere. Simples assim — sem arrastar, sem exportar.',
      arrow: 'up',
      tapHint: true
    },
    {
      sel: '#file-list .fgrid',
      title: 'Só passar o mouse pra ouvir 👆',
      body: 'Quer uma prévia rápida? Passe o mouse em cima de um som (sem clicar) e ele toca na hora. Perfeito pra achar o efeito certo sem parar.',
      arrow: 'up',
      hoverHint: true
    },
    {
      sel: '.search-hero .search-box',
      title: 'Achou o som na hora',
      body: 'Digite o nome aqui pra buscar entre todos os efeitos de uma vez. Aí é só dar os 2 cliques.',
      arrow: 'up'
    },
    {
      sel: '#file-list .fgrid',
      title: 'Tudo organizado em pastas',
      body: 'Whooshes, impactos, câmera, risers… clique numa pasta pra explorar. Você também pode criar suas próprias pastas e importar seus sons.',
      arrow: 'up'
    },
    {
      sel: '.waveform-wrap',
      title: 'Ouça antes de usar 🎧',
      body: 'Clique 1 vez em qualquer som pra dar o play e ouvir aqui na onda. Gostou? 2 cliques e ele vai pra timeline.',
      arrow: 'down'
    },
    {
      sel: '#gain-row',
      title: 'Ganho rápido + Atalhos ⌨️',
      body: 'Escolha o ganho aqui antes de inserir (whooshes geralmente pedem −12). Pelo teclado: ↑↓ navega, Enter insere no playhead, Shift+Enter no in-point (marca com I na timeline).',
      arrow: 'down',
      next: 'Entendi!'
    },
  ];
  let _tourIdx = 0;

  function startTour() {
    _tourIdx = 0;
    const ov = g('tour-overlay');
    if (!ov) return;
    ov.classList.add('open');
    // build dots
    const dots = g('tour-dots');
    dots.innerHTML = TOUR_STEPS.map((_,i)=>`<i${i===0?' class="on"':''}></i>`).join('');
    g('tour-next').addEventListener('click', tourNext);
    g('tour-skip').addEventListener('click', endTour);
    window.addEventListener('resize', positionTourStep);
    renderTourStep();
  }

  function renderTourStep() {
    const step = TOUR_STEPS[_tourIdx];
    g('tour-step-badge').textContent = (_tourIdx+1) + ' / ' + TOUR_STEPS.length;
    g('tour-title').textContent = step.title;
    g('tour-body').textContent = step.body;
    g('tour-next').textContent = step.next || (_tourIdx === TOUR_STEPS.length-1 ? 'Concluir' : 'Próximo');
    g('tour-skip').style.visibility = (_tourIdx === TOUR_STEPS.length-1) ? 'hidden' : 'visible';
    document.querySelectorAll('#tour-dots i').forEach((d,i)=>d.classList.toggle('on', i===_tourIdx));

    // The double-click and hover steps need real sound rows visible. If we're on
    // the home grid (only folders), open the first bundled folder so hints land on a sound.
    const needsSound = step.tapHint || step.hoverHint;
    if (needsSound && !state.openFolderId) {
      const firstSeed = lib.folders().find(f => !isUserFolder(f) && getActiveFiles().some(x=>x.folderId===f.id));
      if (firstSeed) { state.openFolderId = firstSeed.id; renderLibrary(); }
    } else if (!needsSound && step.sel === '#file-list .fgrid' && state.openFolderId) {
      // steps that want the grid: go back home
      state.openFolderId = null; renderLibrary();
    }

    // small delay so layout settles before measuring
    requestAnimationFrame(()=>requestAnimationFrame(positionTourStep));
  }

  function positionTourStep() {
    const step = TOUR_STEPS[_tourIdx];
    const spot = g('tour-spotlight');
    const card = g('tour-card');
    const tapHint = g('tour-tap-hint');
    const hoverHint = g('tour-hover-hint');
    const pad = 8;

    // On the tap/hover steps, target the first actual sound row instead of the grid
    let el;
    if (step.tapHint || step.hoverHint) {
      el = document.querySelector('#file-list .file-item');
    } else {
      el = step.sel ? document.querySelector(step.sel) : null;
    }

    card.className = '';
    tapHint.classList.remove('show');
    hoverHint.classList.remove('show');

    if (!el) {
      spot.classList.add('no-target');
      card.style.left = '50%'; card.style.top = '50%';
      card.style.transform = 'translate(-50%,-50%)';
      return;
    }
    spot.classList.remove('no-target');
    const r = el.getBoundingClientRect();
    spot.style.left = (r.left - pad) + 'px';
    spot.style.top = (r.top - pad) + 'px';
    spot.style.width = (r.width + pad*2) + 'px';
    spot.style.height = (r.height + pad*2) + 'px';

    // place the animated double-tap hint over the row
    if (step.tapHint) {
      tapHint.classList.add('show');
      tapHint.style.left = (r.left + r.width*0.5 - 8) + 'px';
      tapHint.style.top = (r.top + r.height*0.5 - 6) + 'px';
    }
    // place the animated hover hint over the row
    if (step.hoverHint) {
      hoverHint.classList.add('show');
      hoverHint.style.left = (r.left + r.width*0.5 - 6) + 'px';
      hoverHint.style.top = (r.top + r.height*0.5 - 6) + 'px';
    }

    card.style.transform = 'none';
    const cardW = 270, cardH = card.offsetHeight || 150, gap = 16;
    let left, top;
    const arrow = step.arrow || 'up';
    if (arrow === 'up') {
      top = r.bottom + gap;
      left = r.left + r.width/2 - cardW/2;
      card.classList.add('arrow-up');
    } else if (arrow === 'down') {
      top = r.top - cardH - gap;
      left = r.left + r.width/2 - cardW/2;
      card.classList.add('arrow-down');
    } else if (arrow === 'left') {
      left = r.right + gap;
      top = r.top + r.height/2 - cardH/2;
      card.classList.add('arrow-left');
    } else {
      left = r.left - cardW - gap;
      top = r.top + r.height/2 - cardH/2;
      card.classList.add('arrow-right');
    }
    left = Math.max(10, Math.min(left, window.innerWidth - cardW - 10));
    top = Math.max(10, Math.min(top, window.innerHeight - cardH - 10));
    card.style.left = left + 'px';
    card.style.top = top + 'px';
  }

  function tourNext() {
    if (_tourIdx >= TOUR_STEPS.length - 1) { endTour(); return; }
    _tourIdx++;
    renderTourStep();
  }

  function endTour() {
    const ov = g('tour-overlay');
    if (ov) ov.classList.remove('open');
    const tapHint = g('tour-tap-hint');
    if (tapHint) tapHint.classList.remove('show');
    const hoverHint = g('tour-hover-hint');
    if (hoverHint) hoverHint.classList.remove('show');
    localStorage.setItem(STORE_TOUR, '1');
    window.removeEventListener('resize', positionTourStep);
    // Tour may have opened a folder to demo the double-click; return to home.
    if (state.openFolderId) { state.openFolderId = null; renderLibrary(); }
  }

  // ════════════════════════════════════════════════════════════
  // QUICK LAUNCHER
  // ════════════════════════════════════════════════════════════
  let launcherSelectedIdx = 0;
  let launcherResults = [];

  function openLauncher() {
    const overlay = g('launcher-overlay');
    const input   = g('launcher-input');
    if (!overlay) return;
    overlay.classList.add('open');
    if (input) { input.value = ''; input.focus(); }
    renderLauncherResults('');
  }

  function closeLauncher() {
    const overlay = g('launcher-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  function renderLauncherResults(query) {
    const results = g('launcher-results');
    const hint    = g('launcher-hint');
    if (!results) return;
    const q = query.toLowerCase();
    const allFiles = lib.files();
    launcherResults = q
      ? allFiles.filter(f => f.name.toLowerCase().includes(q))
      : allFiles.slice(0, 40);
    launcherResults.sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      return a.name.localeCompare(b.name);
    });
    launcherSelectedIdx = 0;
    if (!launcherResults.length) {
      results.innerHTML = `<div class="lr-empty">${q ? `Nenhum resultado para "<strong>${esc(query)}</strong>"` : 'Biblioteca vazia'}</div>`;
      if (hint) hint.classList.remove('visible');
      return;
    }
    if (hint) hint.classList.add('visible');
    results.innerHTML = launcherResults.map((f, i) => {
      const folder = f.folderId ? lib.folderById(f.folderId) : null;
      const fcolor = folder ? colorHex(folder.color) : '#7c3aed';
      const colorDim = hexToRgba(fcolor, 0.18);
      const colorMid = hexToRgba(fcolor, 0.35);
      const colorHi  = lightenHex(fcolor, 0.3);
      const raw = f.waveformData
        ? [0,1,2,3,4].map(j => f.waveformData[Math.floor(j * f.waveformData.length / 5)] || 0)
        : [0.35,0.75,0.95,0.55,0.65];
      const bars = raw.map(v => `<span style="height:${Math.max(3,Math.round(v*18))}px;background:${colorHi}"></span>`).join('');
      let displayName = esc(stripExt(f.name));
      if (q) {
        const idx = f.name.toLowerCase().indexOf(q);
        if (idx !== -1) {
          displayName = esc(stripExt(f.name).slice(0,idx)) +
            `<em>${esc(stripExt(f.name).slice(idx, idx+q.length))}</em>` +
            esc(stripExt(f.name).slice(idx+q.length));
        }
      }
      const dur = f.duration ? fmtTime(f.duration) : '';
      const ext = f.name.split('.').pop().toUpperCase();
      const star = f.starred ? '★ ' : '';
      return `<div class="lr-item${i===0?' selected':''}" data-idx="${i}">
        <div class="lr-icon" style="background:${colorDim};border:1px solid ${colorMid};">${bars}</div>
        <div class="lr-info">
          <div class="lr-name">${star}${displayName}</div>
          <div class="lr-meta">
            <span>${ext}</span>
            ${dur?`<span>·</span><span class="lr-duration">${dur}</span>`:''}
            ${folder?`<span class="lr-folder">📁 ${esc(folder.name)}</span>`:''}
          </div>
        </div>
        <span class="lr-action">↵</span>
      </div>`;
    }).join('');
    results.querySelectorAll('.lr-item').forEach(el => {
      el.addEventListener('click', () => { launcherSelectedIdx=parseInt(el.dataset.idx); launcherConfirm(); });
      el.addEventListener('mouseenter', () => { launcherSelectedIdx=parseInt(el.dataset.idx); updateLauncherSelection(); });
    });
  }

  function moveLauncher(dir) {
    if (!launcherResults.length) return;
    launcherSelectedIdx = Math.max(0, Math.min(launcherResults.length-1, launcherSelectedIdx+dir));
    updateLauncherSelection();
    const results = g('launcher-results');
    const sel = results && results.querySelector('.lr-item.selected');
    if (sel) sel.scrollIntoView({block:'nearest'});
  }

  function updateLauncherSelection() {
    const results = g('launcher-results');
    if (!results) return;
    results.querySelectorAll('.lr-item').forEach((el,i) => el.classList.toggle('selected', i===launcherSelectedIdx));
  }

  function launcherConfirm() {
    const entry = launcherResults[launcherSelectedIdx];
    if (!entry) return;
    closeLauncher();
    selectFile(entry.id);
    insertAtPlayhead(entry.id);
  }

  // Launcher keyboard nav (separate listener so it works inside input)
  document.addEventListener('keydown', e => {
    const overlay = g('launcher-overlay');
    if (!overlay || !overlay.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeLauncher(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); moveLauncher(1); return; }
    if (e.key === 'ArrowUp')   { e.preventDefault(); moveLauncher(-1); return; }
    if (e.key === 'Enter')     { e.preventDefault(); launcherConfirm(); return; }
  });

  // Backdrop click
  document.addEventListener('click', e => {
    if (e.target && e.target.id === 'launcher-overlay') closeLauncher();
  });

  // Input search
  document.addEventListener('input', e => {
    if (e.target && e.target.id === 'launcher-input') {
      renderLauncherResults(e.target.value.trim());
    }
  });
  function pathToUrl(p){if(!p)return'';p=p.replace(/\\/g,'/');if(p.startsWith('file://'))return p;return 'file:///'+(p.startsWith('/')?p.slice(1):p);}
  function fmtTime(s){if(!isFinite(s))return'0:00';const m=Math.floor(s/60),r=s%60;return m+':'+(r<10?'0':'')+r.toFixed(1);}
  function fmtSize(b){if(!b)return'—';if(b<1024)return b+'B';if(b<1048576)return(b/1024).toFixed(0)+'KB';return(b/1048576).toFixed(1)+'MB';}
  function stripExt(n){return n.replace(/\.[^.]+$/,'');}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
