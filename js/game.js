const App = window.App = {
  // ===================== SOUND FX =====================
  _sfx: null,
  _sfxCtx: null,
  _muted: false,

  _ensureAudio() {
    if (this._muted) return null;
    if (this._sfxCtx && this._sfxCtx.state !== 'closed') return this._sfxCtx;
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      this._sfxCtx = new C();
    } catch(e) { this._muted = true; }
    return this._sfxCtx;
  },

  _sfxTone(freq, dur, type, vol) {
    const ctx = this._ensureAudio();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.15));
    o.connect(g); g.connect(ctx.destination);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + (dur || 0.15));
  },

  _sfxNoise(dur, vol) {
    const ctx = this._ensureAudio();
    if (!ctx) return;
    const buf = ctx.createBuffer(1, ctx.sampleRate * (dur || 0.1), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol || 0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.1));
    src.connect(g); g.connect(ctx.destination);
    src.start(ctx.currentTime);
  },

  _sfxChord(freqs, dur, type, vol) {
    const ctx = this._ensureAudio();
    if (!ctx) return;
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime((vol || 0.08) * (1 - i * 0.2), ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.3));
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + (dur || 0.3));
    });
  },

  playSfx(name) {
    if (this._muted) return;
    switch (name) {
      case 'click':
        this._sfxTone(800, 0.06, 'sine', 0.08);
        break;
      case 'select':
        this._sfxTone(600, 0.08, 'sine', 0.1);
        break;
      case 'correct':
        this._sfxChord([523, 659, 784], 0.25, 'sine', 0.12);
        break;
      case 'wrong':
        this._sfxNoise(0.2, 0.08);
        this._sfxTone(220, 0.25, 'sawtooth', 0.06);
        break;
      case 'levelup':
        this._sfxChord([523, 659, 784, 1047], 0.5, 'sine', 0.1);
        setTimeout(() => this._sfxChord([784, 1047, 1319], 0.4, 'sine', 0.08), 200);
        break;
      case 'popup':
        this._sfxTone(400, 0.1, 'sine', 0.07);
        setTimeout(() => this._sfxTone(600, 0.08, 'sine', 0.05), 60);
        break;
      case 'switch':
        this._sfxTone(500, 0.05, 'sine', 0.06);
        setTimeout(() => this._sfxTone(700, 0.05, 'sine', 0.05), 40);
        break;
      case 'next':
        this._sfxTone(660, 0.08, 'sine', 0.07);
        break;
      case 'start':
        this._sfxTone(400, 0.1, 'sine', 0.08);
        setTimeout(() => this._sfxTone(600, 0.08, 'sine', 0.06), 80);
        setTimeout(() => this._sfxTone(800, 0.12, 'sine', 0.07), 160);
        break;
      case 'humor':
        this._sfxChord([523, 659, 784], 0.15, 'triangle', 0.06);
        break;
      case 'star':
        this._sfxTone(880, 0.1, 'sine', 0.1);
        break;
    }
  },

  toggleMute() {
    this._muted = !this._muted;
    if (this._muted && this._sfxCtx) {
      try { this._sfxCtx.close(); } catch(e) {}
      this._sfxCtx = null;
    }
    this.saveProgress();
    this.renderHome();
  },

  state: {
    currentRank: null,
    inQuiz: false, quizLevel: null, quizQuestions: [], quizIndex: 0,
    quizScore: 0, quizCorrect: 0, quizWrong: 0,
    selectedOption: -1, answered: false, locked: false,
    homePopup: null,
    userProgress: {},
    charGender: 'male'
  },

  TOTAL_LEVELS: 200,

  init() {
    this.loadProgress();
    this.state.currentRank = this.findBestRank();
    window.addEventListener('resize', () => this.handleResize());
    this.renderHome();
    this._startClock();
    this._fetchWeather();
    this._bindWeatherKeys();
  },

  handleResize() {
    if (!this.state.inQuiz) {
      const w = document.getElementById('stair-world');
      if (w) { w.innerHTML = this.buildStairWorld(); this.scrollToCurrent(); }
    }
  },

  findBestRank() {
    for (const r of RANKS) {
      const p = this.getProgress(r.id);
      if (p.highestUnlocked > 0) return r.id;
    }
    return RANKS[0].id;
  },

  getProgress(rankId) {
    if (!this.state.userProgress[rankId]) this.state.userProgress[rankId] = { highestUnlocked: 1, completedLevels: [], bestScores: {} };
    return this.state.userProgress[rankId];
  },

  loadProgress() {
    try {
      const raw = localStorage.getItem('charm_english_progress');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.version) {
          this.state.userProgress = parsed.progress || {};
          this.state.charGender = parsed.gender || 'male';
          this._muted = parsed.muted || false;
        } else {
          this.state.userProgress = parsed;
          this.state.charGender = 'male';
        }
      }
      // Migrate old word/listening structure to flat format
      for (const rankId of Object.keys(this.state.userProgress)) {
        const p = this.state.userProgress[rankId];
        if (p.word || p.listening) {
          const oldWord = p.word || { highestUnlocked: 1, completedLevels: [], bestScores: {} };
          const oldListen = p.listening || { highestUnlocked: 1, completedLevels: [], bestScores: {} };
          this.state.userProgress[rankId] = {
            highestUnlocked: Math.max(oldWord.highestUnlocked || 1, oldListen.highestUnlocked || 1),
            completedLevels: [...new Set([...oldWord.completedLevels, ...oldListen.completedLevels])],
            bestScores: { ...oldWord.bestScores, ...oldListen.bestScores }
          };
        }
      }
    } catch(e) {}
  },
  saveProgress() {
    try {
      localStorage.setItem('charm_english_progress', JSON.stringify({
        version: 1, progress: this.state.userProgress, gender: this.state.charGender, muted: this._muted
      }));
    } catch(e) {}
  },

  // ===================== HOME - 消消乐风楼梯 =====================

  renderHome() {
    const container = document.getElementById('app');
    const rank = RANKS.find(r => r.id === this.state.currentRank);
    if (!rank) return;
    this.state.inQuiz = false;

    const th = new Date().getHours() + new Date().getMinutes() / 60;
    const wi = this._weatherInfo;
    const isDay = wi?.is_day !== undefined ? wi.is_day === 1 : (th >= 5 && th < 19);
    const themeClass = !isDay ? 'night-theme' : th < 7 ? 'dawn-theme' : th >= 17 ? 'dusk-theme' : 'day-theme';
    const totalStars = this._getTotalStars();

    let popupHTML = '';
    if (this.state.homePopup === 'profile') {
      popupHTML = `
        <div class="home-nav-overlay" onclick="App.closeHomePopup()"></div>
        <div class="home-nav-popup" onclick="event.stopPropagation()">
          <button class="hnp-close" onclick="App.closeHomePopup()">✕</button>
          <div class="hnp-avatar">${this.state.charGender === 'female' ? '👧' : '👦'}</div>
          <div class="hnp-name">英语小达人</div>
          <div class="hnp-stat">⭐ 总星星 <em>${totalStars}</em></div>
          <div class="hnp-gender-row">
            <span class="hnp-gender ${this.state.charGender === 'male' ? 'active' : ''}" onclick="App.setGender('male')">👦 男生</span>
            <span class="hnp-gender ${this.state.charGender === 'female' ? 'active' : ''}" onclick="App.setGender('female')">👧 女生</span>
          </div>
          <div class="hnp-mute-row">
            <span class="hnp-mute ${this._muted ? '' : 'active'}" onclick="App.toggleMute()">🔊 音效</span>
            <span class="hnp-mute ${this._muted ? 'active' : ''}" onclick="App.toggleMute()">🔇 静音</span>
          </div>
        </div>`;
    } else if (this.state.homePopup === 'ranks') {
      const totalStars = this._getTotalStars();
      const sideRanks = RANKS.slice(0, 4);
      popupHTML = `
        <div class="home-nav-overlay" onclick="App.closeHomePopup()"></div>
        <div class="home-nav-popup" onclick="event.stopPropagation()">
          <button class="hnp-close" onclick="App.closeHomePopup()">✕</button>
          <div class="hnp-rank no-hover"><span>🏆 段位</span></div>
          <div class="hnp-row"><span>⭐ 总星星</span><span class="hr-level">${totalStars}</span></div>
          ${sideRanks.map(r => `<div class="hnp-row"><span>${r.icon} ${r.name}</span><span class="hr-level">${this._getRankStars(r.id)}⭐</span></div>`).join('')}
        </div>`;
    } else if (this.state.homePopup === 'rankings') {
      popupHTML = `
        <div class="home-nav-overlay" onclick="App.closeHomePopup()"></div>
        <div class="home-nav-popup" onclick="event.stopPropagation()">
          <button class="hnp-close" onclick="App.closeHomePopup()">✕</button>
          <div class="hnp-ri">🌐 全国 <em>--</em></div>
          <div class="hnp-ri">🏙️ 市区 <em>--</em></div>
          <div class="hnp-ri">🏫 学校 <em>--</em></div>
          <div class="hnp-ri">👥 好友 <em>--</em></div>
        </div>`;
    }

    const navActive = t => this.state.homePopup === t ? ' active' : '';
    const sideRanks = RANKS.slice(0, 4);
    const bestRank = RANKS.slice().reverse().find(r => this.getProgress(r.id).completedLevels.length > 0);
    const tier = bestRank || RANKS[0];

    container.innerHTML = `
      <div class="screen stair-screen active ${themeClass}" id="screen-home">
        ${this.buildSkyOverlay()}
        <div class="stair-scroll-area" id="stair-scroll">
          <div class="stair-world" id="stair-world">
            ${this.buildStairWorld()}
          </div>
        </div>
        <div class="rank-sidebar">
          ${sideRanks.map(r => `
            <div class="rank-sbtn ${r.id === this.state.currentRank ? 'active' : ''}" onclick="App.switchRank('${r.id}')">
              <span class="rsb-icon">${r.icon}</span>
              <span class="rsb-name">${r.name}</span>
              <span class="rsb-stars">${this._getRankStars(r.id)}⭐</span>
            </div>
          `).reverse().join('')}
        </div>
        <div class="home-nav">
          <div class="home-nav-btn${navActive('profile')}" onclick="App.openHomePopup('profile')"><span class="hnb-ico">📋</span><span class="hnb-lbl">主页</span></div>
          <div class="home-nav-btn${navActive('ranks')}" onclick="App.openHomePopup('ranks')"><span class="hnb-ico">🏆</span><span class="hnb-lbl">排位</span></div>
          <div class="home-nav-btn${navActive('rankings')}" onclick="App.openHomePopup('rankings')"><span class="hnb-ico">📊</span><span class="hnb-lbl">排名</span></div>
        </div>
        ${popupHTML}
      </div>
    `;
    setTimeout(() => this.scrollToCurrent(), 200);
  },

  openHomePopup(type) {
    if (this.state.homePopup !== type) this.playSfx('popup');
    this.state.homePopup = this.state.homePopup === type ? null : type;
    this.renderHome();
  },

  closeHomePopup() {
    this.state.homePopup = null;
    this.renderHome();
  },

  switchRankAndClose(rankId) {
    this.state.currentRank = rankId;
    this.state.homePopup = null;
    this.renderHome();
  },

  setGender(g) {
    if (this.state.charGender === g) return;
    this.playSfx('click');
    this.state.charGender = g;
    this.saveProgress();
    this.renderHome();
  },

  makeCharacterSVG(sz) {
    const g = this.state.charGender || 'male';
    const isF = g === 'female';
    const w = Math.round(sz * 0.7);
    const h = Math.round(sz * 1.1);
    return `<svg viewBox="0 0 32 50" width="${w}" height="${h}" style="display:block">
      <circle cx="16" cy="8" r="7" fill="${isF ? '#FFE0B2' : '#FFDAB9'}" stroke="${isF ? '#8D6E63' : '#4E342E'}" stroke-width="0.8"/>
      <path d="M10 5.5 Q13 2 16 2 Q19 2 22 5.5" fill="${isF ? '#8D6E63' : '#4E342E'}"/>
      <rect x="11.5" y="15" width="9" height="12" rx="2.5" fill="${isF ? '#FF6B9D' : '#42A5F5'}"/>
      <line x1="11.5" y1="19" x2="5" y2="17" stroke="${isF ? '#FFE0B2' : '#FFDAB9'}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="20.5" y1="19" x2="27" y2="17" stroke="${isF ? '#FFE0B2' : '#FFDAB9'}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="14" y1="27" x2="11" y2="41" stroke="${isF ? '#5D4037' : '#37474F'}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="18" y1="27" x2="21" y2="41" stroke="${isF ? '#5D4037' : '#37474F'}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="11" y1="41" x2="8" y2="45" stroke="${isF ? '#795548' : '#212121'}" stroke-width="3" stroke-linecap="round"/>
      <line x1="21" y1="41" x2="24" y2="45" stroke="${isF ? '#795548' : '#212121'}" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  },

  _nodeParticles(stepHt, stepW, levelNum) {
    const seed = levelNum || 0;
    let h = `<div class="xld-ptcls" style="top:${stepHt}px;width:${stepW}px">`;
    for (let pi = 0; pi < 6; pi++) {
      const ls = (seed * 7 + pi * 13 + 5) % 100;
      const ld = ((seed * 3 + pi * 7 + 11) % 40) / 10;
      const lz = 2 + (seed * 11 + pi * 5 + 3) % 4;
      const ll = 3 + (seed * 17 + pi * 23 + 7) % 90;
      h += `<div class="xld-pdot" style="left:${ll}%;animation-delay:${ld.toFixed(1)}s;width:${lz}px;height:${lz}px;animation-duration:${(2 + (seed * 5 + pi * 3) % 3).toFixed(1)}s"></div>`;
    }
    return h + '</div>';
  },

  buildSkyOverlay() {
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const baseSize = Math.min(ww, wh) * 0.065;
    const wi = this._weatherInfo;
    const th = new Date().getHours() + new Date().getMinutes() / 60;
    const isDay = wi?.is_day !== undefined ? wi.is_day === 1 : (th >= 5 && th < 19);
    const themeCls = !isDay ? 'night-overlay' : th < 7 ? 'dawn-overlay' : th >= 17 ? 'dusk-overlay' : 'day-overlay';
    const wc = this._currentWeatherClass();
    let html = `<div class="sky-overlay ${themeCls}">`;

    for (let ci = 0; ci < 6; ci++) {
      const ct = 5 + (ci * 13 + 7) % 20;
      const cl = 3 + (ci * 17 + 5) % 90;
      const cd = ((ci * 1.7 + 0.3) % 4).toFixed(1);
      const cs = baseSize * (0.35 + ((ci * 11 + 7) % 100) * 0.002);
      html += `<div class="sky-cloud" style="top:${ct}%;left:${cl}%;animation-delay:${cd}s;font-size:${cs}px">☁️</div>`;
    }

    const p = Math.max(0, Math.min(1, isDay ? (th - 5) / 14 : th >= 19 ? (th - 19) / 10 : (th + 5) / 10));
    const arcSin = Math.sin(p * Math.PI);
    const xPos = 2 + p * 92;
    const yPos = 5 + (1 - arcSin) * 25;
    html += `<div class="sky-orb" style="left:${xPos}%;top:${yPos}%;font-size:${isDay ? baseSize * (0.5 + arcSin * 0.35) : baseSize * 0.45}px">${isDay ? '☀️' : '🌙'}</div>`;

    if (!isDay && (th < 5 || th >= 20)) {
      for (let si = 0; si < 20; si++) {
        const st = (si * 7 + 3) % 100;
        const sl = (si * 13 + 5) % 100;
        const sd = ((si * 0.7 + 0.3) % 3).toFixed(1);
        const ss = baseSize * (0.15 + ((si * 11 + 7) % 100) * 0.002);
        html += `<div class="sky-star" style="top:${st}%;left:${sl}%;animation-delay:${sd}s;font-size:${ss}px">✦</div>`;
      }
    }

    html += `<span class="sky-clock" id="bg-clock" style="color:${isDay ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)'}">--:--</span>`;

    html += '</div>';

    let weatherHTML = '';
    if (wc === 'weather-storm') {
      weatherHTML = '<div class="weather-overlay">';
      for (let ri = 0; ri < 60; ri++) {
        const rx = (ri * 37 + 13) % 100;
        const ry = (ri * 59 + 7) % 100;
        const rd = ((ri * 0.3) % 1.2).toFixed(2);
        const rl = 5 + (ri * 11) % 15;
        weatherHTML += `<div class="weather-rain-drop" style="left:${rx}%;top:${ry}%;animation-delay:${rd}s;height:${rl}px"></div>`;
      }
      weatherHTML += '<div class="weather-lightning"></div></div>';
    } else if (wc === 'weather-rain') {
      weatherHTML = '<div class="weather-overlay">';
      for (let ri = 0; ri < 40; ri++) {
        const rx = (ri * 37 + 13) % 100;
        const ry = (ri * 59 + 7) % 100;
        const rd = ((ri * 0.3) % 1.5).toFixed(2);
        const rl = 5 + (ri * 11) % 15;
        weatherHTML += `<div class="weather-rain-drop" style="left:${rx}%;top:${ry}%;animation-delay:${rd}s;height:${rl}px"></div>`;
      }
      weatherHTML += '</div>';
    } else if (wc === 'weather-snow') {
      weatherHTML = '<div class="weather-overlay">';
      for (let si = 0; si < 50; si++) {
        const sx = (si * 29 + 17) % 100;
        const sy = (si * 43 + 5) % 100;
        const sd = ((si * 0.5) % 3).toFixed(2);
        const ss = 4 + (si * 7) % 8;
        weatherHTML += `<div class="weather-snow-flake" style="left:${sx}%;top:${sy}%;animation-delay:${sd}s;width:${ss}px;height:${ss}px"></div>`;
      }
      weatherHTML += '</div>';
    }

    return html + weatherHTML;
  },

  _cookieColors: [
    ['#FF9AA2','#FF6B7A'], ['#FFB7B2','#FF8A80'], ['#FFDAC1','#FFB74D'],
    ['#E2F0CB','#AED581'], ['#B5EAD7','#66BB6A'], ['#C7CEEA','#7986CB'],
    ['#F8C8DC','#F06292'], ['#B0E0E6','#4FC3F7'], ['#D4A5FF','#AB47BC'],
    ['#FFE5A3','#FFD54F'], ['#A8D8EA','#4DD0E1'], ['#F6C6EA','#CE93D8'],
    ['#C5E99B','#8BC34A'], ['#FFAB76','#FF8A65'], ['#B8D4E3','#64B5F6'],
  ],

  _cookiePatterns: ['dots', 'heart', 'stripe', 'star', 'ring', 'zigzag'],

  _levelType(levelNum) { return levelNum % 4 === 0 ? 'listening' : 'word'; },

  _cookieShape(levelNum) {
    const idx = (levelNum * 7 + 13) % 15;
    const [top, bottom] = this._cookieColors[idx];
    const pat = this._cookiePatterns[((levelNum * 3 + 5) % this._cookiePatterns.length)];
    const shapeIdx = (levelNum * 11 + 3) % 4;
    const br = ['45%', '35%', '40% 30% 45% 30%', '30% 45% 30% 40%'][shapeIdx];
    return { top, bottom, br, pat };
  },

  buildStairWorld() {
    const rankId = this.state.currentRank;
    const prog = this.getProgress(rankId);
    const rank = RANKS.find(r => r.id === rankId);
    if (!rank) return '';

    const area = document.getElementById('stair-scroll');
    const cw = area ? area.clientWidth : 375;
    const ch = area ? area.clientHeight : 600;

    const total = this.TOTAL_LEVELS;
    const padH = cw * 0.06;
    const padV = ch * 0.04;
    const usableW = cw - padH * 2;
    const usableH = ch - padV * 2;

    const baseSize = Math.min(cw, ch) * 0.065;
    const cookieSz = Math.max(42, Math.min(76, baseSize * 1.5));

    const rIdx = Math.max(0, RANKS.findIndex(r => r.id === rankId));
    const rHStepMul = [2.2, 2.4, 2.0, 2.6][rIdx] || 2.2;
    const rAmpMul = [0.50, 0.55, 0.45, 0.52][rIdx] || 0.50;
    const rSlowFreq = [1.5, 1.8, 1.2, 2.0][rIdx] || 1.5;
    const rFastFreq = [7, 5, 9, 6][rIdx] || 7;
    const rSlowW = [0.45, 0.50, 0.40, 0.48][rIdx] || 0.45;
    const rFastW = [0.40, 0.35, 0.45, 0.38][rIdx] || 0.40;
    const rPhase = [0.8, 2.1, 4.3, 5.9][rIdx] || 0.8;
    const hStep = Math.max(baseSize * 0.8, (usableH - 60) / (total - 1 || 1)) * rHStepMul;
    const rightX = cw - cookieSz - padH;
    const startB = padV;
    const containerH = Math.max(ch, startB + (total - 1) * hStep + cookieSz + 40);

    let html = `<div class="xld-wrap" style="height:${containerH}px;min-width:${cw}px">`;

    let prevLeft = padH, lastBottom = startB;
    const leftGap = Math.min(80, Math.max(65, cw * 0.09));
    const rightGap = Math.min(75, Math.max(55, cw * 0.08));

    for (let i = 0; i < total; i++) {
      const levelNum = i + 1;
      const isCompleted = prog.completedLevels.includes(levelNum);
      const isCurrent = levelNum === prog.highestUnlocked && !isCompleted;
      const isLocked = levelNum > prog.highestUnlocked;
      const isListening = this._levelType(levelNum) === 'listening';
      const isBoss = levelNum % 10 === 0;

      // Multi-wave S-curve: slow wave for distribution + fast wave for bends
      const sProgress = i / (total - 1);
      const slow = Math.sin(sProgress * Math.PI * 2 * rSlowFreq + rPhase) * rSlowW;
      const fast = Math.sin(sProgress * Math.PI * 2 * rFastFreq + rPhase * 1.3) * rFastW;
      const jit = Math.sin(i * 0.91 + rPhase) * 0.1 + Math.sin(i * 0.37 + rPhase + 1.8) * 0.05;
      const sine = slow + fast + jit;
      const sAmp = (rightX - padH) * rAmpMul;
      const sCenter = padH + (rightX - padH) * 0.5;
      let rawX = sCenter + sine * sAmp;
      // Repulsion: prevent consecutive levels from forming a vertical line
      const minGap = cookieSz * 0.5;
      if (i > 0) {
        const dist = Math.abs(rawX - prevLeft);
        if (dist < minGap) {
          const dir = rawX >= prevLeft ? 1 : -1;
          rawX = prevLeft + dir * minGap;
          // Add extra nudge so next level won't immediately cluster back
          rawX += dir * Math.sin(i * 1.7 + 0.5) * cookieSz * 0.15;
        }
      }
      const left = Math.max(leftGap, Math.min(cw - cookieSz - rightGap, rawX));

      // Y — fixed spacing
      const yJit = Math.sin(i * 269.5 + 183.3) * hStep * 0.05;
      const bottom = startB + i * hStep + yJit;
      const centerX = left + cookieSz / 2;

      const shape = this._cookieShape(levelNum);
      const numSz = baseSize * 0.4;
      const patId = `cp-${levelNum}`;

      let bg, borderC, shadow, patEl = '';
      if (isLocked) {
        bg = '#bdbdbd'; borderC = '#9e9e9e';
        shadow = '0 4px 0 #888, 0 6px 12px rgba(0,0,0,0.12)';
      } else if (isCurrent) {
        bg = `linear-gradient(135deg, #FFD700, #FFB300)`;
        borderC = '#FF8F00';
        shadow = '0 4px 0 #F9A825, 0 0 20px rgba(255,215,0,0.5), 0 6px 12px rgba(0,0,0,0.12)';
      } else if (isCompleted) {
        bg = `linear-gradient(135deg, ${shape.top}, ${shape.bottom})`;
        borderC = shape.bottom;
        shadow = `0 4px 0 ${shape.bottom}, 0 6px 12px rgba(0,0,0,0.12)`;
      } else {
        bg = `linear-gradient(135deg, ${shape.top}, ${shape.bottom})`;
        borderC = shape.bottom;
        shadow = '0 4px 0 #ccc, 0 6px 12px rgba(0,0,0,0.1)';
      }

      // Pattern overlay (only for unlocked)
      if (!isLocked && shape.pat === 'dots') {
        patEl = `<div class="xld-cpat cpat-dots" style="border-radius:${shape.br}"></div>`;
      } else if (!isLocked && shape.pat === 'heart') {
        patEl = `<div class="xld-cpat cpat-heart" style="border-radius:${shape.br}">💖</div>`;
      } else if (!isLocked && shape.pat === 'stripe') {
        patEl = `<div class="xld-cpat cpat-stripe" style="border-radius:${shape.br}"></div>`;
      } else if (!isLocked && shape.pat === 'star') {
        patEl = `<div class="xld-cpat cpat-star" style="border-radius:${shape.br}">✨</div>`;
      } else if (!isLocked && shape.pat === 'ring') {
        patEl = `<div class="xld-cpat cpat-ring" style="border-radius:${shape.br}"></div>`;
      } else if (!isLocked && shape.pat === 'zigzag') {
        patEl = `<div class="xld-cpat cpat-zigzag" style="border-radius:${shape.br}"></div>`;
      }

      const statusCls = isCompleted ? 'done' : isCurrent ? 'cur' : isLocked ? 'locked' : 'open';

      html += `
        <div class="xld-node ${statusCls}"
             style="bottom:${bottom}px;left:${left}px;"
             onclick="App.clickLevel(${levelNum})" data-level="${levelNum}">
           <div class="xld-cookie" style="width:${cookieSz}px;height:${cookieSz}px;border-radius:${shape.br};background:${bg};border-color:${borderC};box-shadow:${shadow}">
            ${!isLocked ? `<div class="xld-cnum" style="font-size:${isBoss || isListening ? numSz * 2.0 : numSz}px;line-height:${cookieSz}px">${isBoss ? '👾' : isListening ? '🎧' : levelNum}</div>` : `<div class="xld-cnum locked" style="font-size:${isBoss || isListening ? numSz * 2.0 : numSz}px;line-height:${cookieSz}px">${isBoss ? '👾' : isListening ? '🎧' : levelNum}</div>`}
            ${patEl}
          </div>
          ${isCompleted ? this._nodeParticles(cookieSz, cookieSz, levelNum) : ''}
        </div>
      `;

      // Floating decor every 10 levels — boss marker
      if (levelNum % 10 === 0) {
        const dDelay = ((i * 0.7 + 0.5) % 3).toFixed(1);
        const isLeftSide = left < cw / 2;
        const dX = isLeftSide ? left + cookieSz + 6 : left - baseSize * 0.4;
        html += `<div class="xld-float-decor boss-flag" style="bottom:${bottom + cookieSz * 0.6}px;left:${dX}px;font-size:${baseSize*0.35}px;animation-delay:${dDelay}s">👑</div>`;
      }

      if (i === total - 1) { lastLeft = left; lastBottom = bottom; }
      prevLeft = left;
    }
    html += `<div class="xld-butterfly" style="bottom:${lastBottom + 30}px;left:${lastLeft + cookieSz + 10}px;font-size:${baseSize * 0.5}px">🦋</div>`;

    // Goal flag
    const goalSz = baseSize * 0.4;
    html += `<div class="xld-goal" style="bottom:${lastBottom + cookieSz + 8}px;left:50%;transform:translateX(-50%);font-size:${goalSz}px">🏁 ${rank.name}通关</div>`;

    html += '</div>';
    return html;
  },

  scrollToCurrent() {
    const area = document.getElementById('stair-scroll');
    if (!area) return;
    const prog = this.getProgress(this.state.currentRank);
    const cur = prog.highestUnlocked || 1;
    const ch = area.clientHeight || 600;
    const cw = area.clientWidth || 375;
    const baseSize = Math.min(cw, ch) * 0.065;
    const usableH = ch - (ch * 0.04) * 2;
    const hStep = Math.max(baseSize * 0.8, (usableH - 60) / (this.TOTAL_LEVELS - 1 || 1)) * 2.2;
    const maxScroll = area.scrollHeight - area.clientHeight;
    const target = maxScroll - (cur - 1) * hStep + ch * 0.35;
    setTimeout(() => area.scrollTo({ top: Math.max(0, Math.min(target, maxScroll)), behavior: 'smooth' }), 250);
  },

  switchRank(rankId) {
    if (rankId === this.state.currentRank) return;
    this.playSfx('switch');
    this.state.currentRank = rankId;
    this.state.homePopup = null;
    this.renderHome();
  },

  clickLevel(levelNum) {
    const prog = this.getProgress(this.state.currentRank);
    if (levelNum > prog.highestUnlocked) return;
    this.playSfx('click');
    this.startQuiz(levelNum);
  },

  // ===================== QUIZ =====================

  startQuiz(levelNum) {
    this.playSfx('start');
    const qs = this.getLevelQuestions(this.state.currentRank, levelNum);
    const isBoss = levelNum % 10 === 0;
    this.state.inQuiz = true;
    this.state.quizLevel = levelNum;
    this.state.quizQuestions = qs;
    this.state.quizIndex = 0;
    this.state.quizScore = 0;
    this.state.quizCorrect = 0;
    this.state.quizWrong = 0;
    this.state.selectedOption = -1;
    this.state.answered = false;
    this.state.locked = false;
    this.state.isBossLevel = isBoss;
    this.state.bossHp = isBoss ? 10 : 0;
    this.state.warriorHp = isBoss ? 5 : 0;
    this.state.bossAnimating = false;
    this.renderQuiz();
  },

  getLevelQuestions(rankId, levelNum) {
    const isBoss = levelNum % 10 === 0;
    const count = isBoss ? 10 : 5;
    const cleanQ = q => {
      q.question = q.question.replace(/^[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{200D}\u{FE00}-\u{FE0F}]+\s*/u, '');
      q.options = shuffle([...q.options]);
    };
    if (isBoss) {
      const start = Math.max(1, levelNum - 9);
      const allQs = [];
      for (let lv = start; lv < levelNum; lv++) {
        const vt = this._levelType(lv);
        const lvQs = QUESTIONS[rankId]?.[vt]?.[lv];
        if (lvQs) allQs.push(...lvQs);
      }
      if (allQs.length >= count) {
        const picked = shuffle([...allQs]).slice(0, count);
        picked.forEach(cleanQ);
        return picked;
      }
      return this.makeFallbackQuestions(count);
    }
    const vineType = this._levelType(levelNum);
    const qs = QUESTIONS[rankId]?.[vineType]?.[levelNum];
    if (qs && qs.length > 0) {
      const picked = shuffle([...qs]).slice(0, count);
      picked.forEach(cleanQ);
      return picked;
    }
    return this.makeFallbackQuestions(count);
  },

  makeFallbackQuestions(count) {
    const r = [];
    for (let i = 0; i < count; i++) r.push({ type: 'word', question: `闯关题 ${i+1}：选择正确答案`, options: shuffle([{ text: '正确答案', correct: true }, { text: '干扰A', correct: false }, { text: '干扰B', correct: false }, { text: '干扰C', correct: false }]), humorStory: '用有趣的画面联想来记住吧 ✨', humorTag: '趣味记忆' });
    return r;
  },

  renderQuiz() {
    const container = document.getElementById('app');
    if (this.state.isBossLevel) { this._renderBossQuiz(); return; }
    const rank = RANKS.find(r => r.id === this.state.currentRank);
    const qs = this.state.quizQuestions;
    const qi = this.state.quizIndex;
    const q = qs[qi];
    if (!q) { this.finishQuiz(); return; }
    const isListening = q.type === 'listening';
    const labels = ['A', 'B', 'C', 'D'];

    container.innerHTML = `
      <div class="screen quiz-screen active">
        <div class="q-header">
          <button class="q-back" onclick="App.quitQuiz()">✕</button>
          <div class="q-title">${rank.icon} ${rank.name} · 第${this.state.quizLevel}关</div>
          <div class="q-score">⭐${this.state.quizScore}</div>
        </div>
        <div class="q-body">
          <div class="q-badge" style="background:${rank.lightColor};color:${rank.color}">${isListening ? '🎧' : '📝'} 第 ${qi + 1}/${qs.length} 题</div>
          <div class="q-text">${q.question}</div>
          ${isListening ? `<div class="q-audio-wrap"><button class="q-audio-btn" id="play-btn-q" onclick="App.playAudio('${(q.audioText || '').replace(/'/g, "\\'")}')">🔊</button></div>` : ''}
          <div class="q-opts" id="q-opts">
            ${q.options.map((opt, i) => `<div class="q-opt" data-i="${i}" onclick="App.selectOpt(${i})"><span class="q-opt-label">${labels[i]}</span><span class="q-opt-text">${opt.text}</span></div>`).join('')}
          </div>
          <div class="q-actions" id="q-actions">
            <button class="q-act q-act-skip" onclick="App.skipQ()">跳过 ›</button>
            <button class="q-act q-act-confirm" id="confirm-btn" onclick="App.confirmQ()" disabled>确认</button>
          </div>
        </div>
      </div>
    `;
    if (isListening) setTimeout(() => this.playAudio(q.audioText || ''), 400);
  },

  _renderBossQuiz() {
    const container = document.getElementById('app');
    const rank = RANKS.find(r => r.id === this.state.currentRank);
    const qs = this.state.quizQuestions;
    const qi = this.state.quizIndex;
    const q = qs[qi];
    if (!q) { this.finishQuiz(); return; }
    const isListening = q.type === 'listening';
    const labels = ['A', 'B', 'C', 'D'];
    const bh = this.state.bossHp;
    const wh = this.state.warriorHp;
    const maxBossHp = 10;
    const maxWarriorHp = 5;
    const bossHpPct = Math.max(0, bh / maxBossHp * 100);
    const warriorHpPct = Math.max(0, wh / maxWarriorHp * 100);

    container.innerHTML = `
      <div class="screen quiz-screen active boss-screen">
        <div class="q-header">
          <button class="q-back" onclick="App.quitQuiz()">✕</button>
          <div class="q-title">${rank.icon} ${rank.name} · 第${this.state.quizLevel}关 👾</div>
          <div class="q-score">⭐${this.state.quizScore}</div>
        </div>
        <div class="boss-arena">
          <div class="boss-sky">
            <div class="boss-cloud c1">☁️</div>
            <div class="boss-cloud c2">☁️</div>
            <div class="boss-cloud c3">☁️</div>
          </div>
          <div class="boss-ground"></div>
          <div class="boss-castle">
            <div class="boss-wall">
              <div class="boss-crenellation"></div>
            </div>
            <div class="boss-cannon" id="boss-cannon">
              <div class="bc-barrel"></div>
              <div class="bc-base"></div>
              <div class="bc-wheel bl"></div>
              <div class="bc-wheel br"></div>
            </div>
          </div>
          <div class="boss-monster" id="boss-monster">
            <div class="bm-body" id="bm-body">🐉</div>
            <div class="bm-shadow"></div>
          </div>
          <div class="boss-arrow" id="boss-arrow">💣</div>
          <div class="boss-hitsplat" id="boss-hitsplat">💥</div>
        </div>
        <div class="boss-hud">
          <div class="bh-warrior">
            <span class="bh-label">💣 炮车</span>
            <div class="bh-bar-wrap"><div class="bh-bar bh-bar-warrior" style="width:${warriorHpPct}%"></div></div>
            <span class="bh-num">${'❤️'.repeat(wh)}</span>
          </div>
          <div class="bh-vs">⚔️</div>
          <div class="bh-monster">
            <span class="bh-label">👾 BOSS</span>
            <div class="bh-bar-wrap"><div class="bh-bar bh-bar-boss" style="width:${bossHpPct}%"></div></div>
            <span class="bh-num">${'❤️'.repeat(bh)}</span>
          </div>
        </div>
        <div class="q-body boss-q-body">
          <div class="q-badge" style="background:${rank.lightColor};color:${rank.color}">👾 第 ${qi + 1}/${qs.length} 题</div>
          <div class="q-text">${q.question}</div>
          ${isListening ? `<div class="q-audio-wrap"><button class="q-audio-btn" id="play-btn-q" onclick="App.playAudio('${(q.audioText || '').replace(/'/g, "\\'")}')">🔊</button></div>` : ''}
          <div class="q-opts" id="q-opts">
            ${q.options.map((opt, i) => `<div class="q-opt" data-i="${i}" onclick="App.selectOpt(${i})"><span class="q-opt-label">${labels[i]}</span><span class="q-opt-text">${opt.text}</span></div>`).join('')}
          </div>
          <div class="q-actions" id="q-actions">
            <button class="q-act q-act-skip" onclick="App.skipQ()">跳过 ›</button>
            <button class="q-act q-act-confirm" id="confirm-btn" onclick="App.confirmQ()" disabled>确认</button>
          </div>
        </div>
      </div>
    `;
    if (isListening) setTimeout(() => this.playAudio(q.audioText || ''), 400);
  },

  _bossArrowHit(callback) {
    const arrow = document.getElementById('boss-arrow');
    const hitsplat = document.getElementById('boss-hitsplat');
    const barrel = document.querySelector('.bc-barrel');
    if (!arrow || !hitsplat) { if (callback) callback(); return; }
    if (barrel) { barrel.classList.remove('fire'); void barrel.offsetHeight; barrel.classList.add('fire'); }
    arrow.style.display = 'block';
    arrow.style.left = '0';
    arrow.style.bottom = 'clamp(35px,6vh,75px)';
    arrow.style.opacity = '1';
    arrow.style.transform = 'scaleX(0.8)';
    arrow.style.transition = 'none';
    void arrow.offsetHeight;
    arrow.style.transition = 'left 0.6s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.6s ease';
    arrow.style.left = 'calc(100% - 70px)';
    arrow.style.transform = 'scaleX(1.5)';
    setTimeout(() => {
      arrow.style.display = 'none';
      hitsplat.style.display = 'block';
      hitsplat.style.left = '';
      hitsplat.style.right = 'clamp(35px,6vw,65px)';
      hitsplat.style.opacity = '1';
      hitsplat.style.transform = 'scale(1.5)';
      this.playSfx('levelup');
      setTimeout(() => {
        hitsplat.style.opacity = '0';
        hitsplat.style.transform = 'scale(0.5)';
        this._updateBossHud();
        if (callback) callback();
      }, 500);
    }, 700);
  },

  _bossBossAttack(callback) {
    const cannon = document.getElementById('boss-cannon');
    const hitsplat = document.getElementById('boss-hitsplat');
    if (!cannon || !hitsplat) { if (callback) callback(); return; }
    cannon.style.transition = 'transform 0.15s ease';
    cannon.style.transform = 'translateX(-10px) rotate(-3deg)';
    hitsplat.style.display = 'block';
    hitsplat.style.left = 'clamp(8px,2vw,20px)';
    hitsplat.style.top = '40%';
    hitsplat.style.opacity = '1';
    hitsplat.style.transform = 'scale(1.2)';
    setTimeout(() => {
      cannon.style.transform = '';
      setTimeout(() => {
        hitsplat.style.opacity = '0';
        hitsplat.style.transform = 'scale(0.5)';
        this._updateBossHud();
        if (callback) callback();
      }, 400);
    }, 300);
  },

  _updateBossHud() {
    const bh = this.state.bossHp;
    const wh = this.state.warriorHp;
    const maxBossHp = 10;
    const maxWarriorHp = 5;
    const warriorBar = document.querySelector('.bh-bar-warrior');
    const bossBar = document.querySelector('.bh-bar-boss');
    const warriorNum = document.querySelector('.bh-warrior .bh-num');
    const bossNum = document.querySelector('.bh-monster .bh-num');
    if (warriorBar) warriorBar.style.width = Math.max(0, wh / maxWarriorHp * 100) + '%';
    if (bossBar) bossBar.style.width = Math.max(0, bh / maxBossHp * 100) + '%';
    if (warriorNum) warriorNum.textContent = '❤️'.repeat(wh);
    if (bossNum) bossNum.textContent = '❤️'.repeat(bh);
  },

  selectOpt(index) {
    if (this.state.locked || this.state.answered) return;
    this.playSfx('select');
    this.state.selectedOption = index;
    document.querySelectorAll('.q-opt').forEach((el, i) => el.classList.toggle('sel', i === index));
    document.getElementById('confirm-btn').disabled = false;
  },

  confirmQ() {
    if (this.state.selectedOption < 0 || this.state.locked || this.state.answered) return;
    const q = this.state.quizQuestions[this.state.quizIndex];
    if (!q) return;
    const isCorrect = q.options[this.state.selectedOption].correct;
    this.state.answered = true; this.state.locked = true;

    document.querySelectorAll('.q-opt').forEach((el, i) => {
      el.classList.add('disabled');
      if (q.options[i].correct) el.classList.add('correct');
      else if (i === this.state.selectedOption && !isCorrect) el.classList.add('wrong');
    });

    if (isCorrect) {
      this.state.quizCorrect++;
      this.state.quizScore += this.state.quizIndex === 0 ? 3 : this.state.quizIndex <= 2 ? 2 : 1;
      this.playSfx('correct');
      if (this.state.isBossLevel) {
        this.state.bossHp = Math.max(0, this.state.bossHp - 1);
        this.showToast('✅ 答对了！弓箭发射！', 'success');
        this._bossArrowHit(() => {
          document.getElementById('q-actions').innerHTML = `<button class="q-act q-act-next" onclick="App.nextQ()">下一题 →</button>`;
        });
      } else {
        document.getElementById('q-actions').innerHTML = `<button class="q-act q-act-next" onclick="App.nextQ()">下一题 →</button>`;
        this.showToast('✅ 答对了！', 'success');
      }
    } else {
      this.state.quizWrong++;
      if (this.state.isBossLevel) {
        this.state.warriorHp = Math.max(0, this.state.warriorHp - 1);
        this.playSfx('wrong');
        this._bossBossAttack(() => {
          document.getElementById('q-actions').innerHTML = `<button class="q-act q-act-humor" onclick="App.showHumorPopup()">💡 趣味记忆</button>`;
        });
      } else {
        document.getElementById('q-actions').innerHTML = `<button class="q-act q-act-humor" onclick="App.showHumorPopup()">💡 趣味记忆</button>`;
        this.playSfx('wrong');
        this.showToast('❌ 看看趣味提示~', 'error');
      }
    }
  },

  nextQ() { this.playSfx('next'); this.state.quizIndex++; this.state.answered = false; this.state.locked = false; this.state.selectedOption = -1; if (this.state.quizIndex >= this.state.quizQuestions.length) this.finishQuiz(); else this.renderQuiz(); },
  skipQ() { this.state.quizWrong++; this.playSfx('next'); this.nextQ(); },
  quitQuiz() { this.state.inQuiz = false; this.renderHome(); },

  finishQuiz() {
    const rankId = this.state.currentRank;
    const levelNum = this.state.quizLevel;
    const prog = this.getProgress(rankId);
    if (!prog.completedLevels.includes(levelNum)) prog.completedLevels.push(levelNum);
    if (levelNum >= prog.highestUnlocked && levelNum < this.TOTAL_LEVELS) prog.highestUnlocked = levelNum + 1;
    const prevBest = prog.bestScores[levelNum] || 0;
    if (this.state.quizScore > prevBest) prog.bestScores[levelNum] = this.state.quizScore;
    this.saveProgress();

    const correct = this.state.quizCorrect, wrong = this.state.quizWrong;
    const total = correct + wrong || 1, accuracy = Math.round(correct / total * 100);
    const stars = Math.min(3, Math.ceil(correct / 5 * 3));
    const rank = RANKS.find(r => r.id === rankId);

    this.playSfx('levelup');
    setTimeout(() => { for (let si = 0; si < stars; si++) setTimeout(() => this.playSfx('star'), si * 150 + 300); }, 100);
    this.showPopup(`
      <div class="popup">
        <span class="popup-icon">🎉</span>
        <div class="popup-title">第${levelNum}关通关！</div>
        <div class="pr">
          <div class="pr-score">${this.state.quizScore}</div>
          <div class="pr-label">得分</div>
          <div class="pr-stars">${[1,2,3].map(s => `<span class="star ${s <= stars ? 'star-on' : ''}" style="animation-delay:${s*0.15}s">⭐</span>`).join('')}</div>
          <div class="pr-stats">
            <div class="pr-stat"><div class="psn">✅ ${correct}</div><div class="psl">正确</div></div>
            <div class="pr-stat"><div class="psn">❌ ${wrong}</div><div class="psl">待加强</div></div>
            <div class="pr-stat"><div class="psn">${accuracy}%</div><div class="psl">正确率</div></div>
          </div>
        </div>
        <div class="popup-desc">${accuracy >= 80 ? '🏆 小人往上爬一层！' : accuracy >= 60 ? '💪 不错哦！' : '📚 加油！'}</div>
        <button class="popup-btn popup-btn-success" onclick="App.closePopup();App.renderHome();">返回楼梯 🏠</button>
      </div>
    `);
  },

  showHumorPopup() {
    const q = this.state.quizQuestions[this.state.quizIndex];
    if (!q) return this.nextQ();
    this.playSfx('humor');
    this.showPopup(`<div class="popup"><span class="popup-icon">💡</span><div class="popup-title">趣味记忆卡片</div><div class="ph"><div class="ph-word">${q.options.find(o => o.correct)?.text || ''}</div><div class="ph-story">${q.humorStory || '用有趣的画面联想来记住吧~ ✨'}</div><span class="ph-tag">${q.humorTag || '趣味记忆'}</span></div><div class="popup-desc">😄 笑着记，忘不掉！</div><button class="popup-btn popup-btn-primary" onclick="App.closePopup();App.nextQ();">记住了！继续 →</button></div>`);
  },

  playAudio(text) {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.7;
    const btn = document.getElementById('play-btn-q');
    if (btn) { btn.classList.add('playing'); u.onend = () => btn.classList.remove('playing'); }
    speechSynthesis.speak(u);
  },

  showPopup(html) {
    document.getElementById('popup-overlay').classList.remove('hidden');
    const c = document.getElementById('popup-container'); c.classList.remove('hidden'); c.innerHTML = html;
  },
  closePopup() { document.getElementById('popup-overlay')?.classList.add('hidden'); document.getElementById('popup-container')?.classList.add('hidden'); },

  showToast(msg, type) {
    const old = document.querySelector('.toast'); if (old) old.remove();
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    t.style.background = type === 'success' ? '#4CAF50' : type === 'error' ? '#FF5252' : '#333';
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 1200);
  },

  openWrongBook() { this.showPopup(`<div class="popup"><span class="popup-icon">📖</span><div class="popup-title">错题知识库</div><div class="popup-desc">📝 单词错题库<br>🎧 听力错题库<br><br>艾宾浩斯智能推送复习</div><button class="popup-btn popup-btn-blue" onclick="App.closePopup()">我知道了 ✨</button></div>`); },
  openBadges() {
    const total = RANKS.reduce((s, r) => { const p = this.getProgress(r.id); return s + p.completedLevels.length; }, 0);
    this.showPopup(`<div class="popup"><span class="popup-icon">🏆</span><div class="popup-title">勋章图鉴</div><div class="popup-desc">${RANKS.map((r, i) => `${total >= (i+1)*10 ? '✅' : '🔒'} ${r.icon} ${r.name}`).join('<br>')}</div><button class="popup-btn popup-btn-primary" onclick="App.closePopup()">继续努力 💪</button></div>`);
  },
  openDaily() { this.showPopup(`<div class="popup"><span class="popup-icon">📅</span><div class="popup-title">每日打卡挑战</div><div class="popup-desc">🌅 单词复习<br>🎧 听力训练<br>💡 趣味记忆</div><button class="popup-btn popup-btn-success" onclick="App.closePopup()">明天开始！🌟</button></div>`); },

  // ===================== WEATHER / CLOCK / LOCATION =====================

  _weatherInfo: null,
  _clockInterval: null,

  _formatWeather() {
    const w = this._weatherInfo;
    if (!w) return '🌡️ --';
    const emoji = this._weatherEmoji(w.weather_code, w.is_day);
    return `${emoji} ${Math.round(w.temperature_2m)}°C`;
  },

  _weatherEmoji(code, isDay) {
    if (code === 0) return isDay ? '☀️' : '🌙';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 57) return '🌦️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌦️';
    return '⛈️';
  },

  _getTotalStars() {
    let total = 0;
    for (const rank of RANKS) {
      total += this._getRankStars(rank.id);
    }
    return total;
  },

  _getRankStars(rankId) {
    const p = this.getProgress(rankId);
    let t = 0;
    for (const lv of Object.keys(p.bestScores)) t += p.bestScores[lv];
    return t;
  },

  _currentWeatherClass() {
    const w = this._weatherInfo;
    if (!w) return '';
    const c = w.weather_code;
    if (c <= 3) return '';
    if (c <= 48) return '';
    if (c <= 57) return 'weather-rain';
    if (c <= 67) return 'weather-rain';
    if (c <= 77) return 'weather-snow';
    if (c <= 82) return 'weather-rain';
    return 'weather-storm';
  },

  _fetchWeather() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&timezone=auto`)
        .then(r => r.json()).then(d => { this._weatherInfo = d.current; }).catch(() => {});
    }, () => {});
  },

  cycleWeather() {
    const list = [
      { code: 0, temp: 25, label: '☀️ 晴天' },
      { code: 61, temp: 15, label: '🌧️ 雨天' },
      { code: 71, temp: -2, label: '❄️ 下雪' },
      { code: 95, temp: 20, label: '⛈️ 雷暴' },
    ];
    const cur = this._weatherInfo?.weather_code ?? 0;
    const idx = list.findIndex(w => w.code === cur);
    const next = list[(idx + 1) % list.length];
    const isDay = this._weatherInfo?.is_day ?? 1;
    this._weatherInfo = { weather_code: next.code, temperature_2m: next.temp, is_day: isDay };
    this.renderHome();
  },

  _bindWeatherKeys() {
    document.addEventListener('keydown', e => {
      const map = {
        '1': { code: 0, temp: 25, label: '☀️ 晴天' },
        '2': { code: 61, temp: 15, label: '🌧️ 雨天' },
        '3': { code: 71, temp: -2, label: '❄️ 下雪' },
        '4': { code: 95, temp: 20, label: '⛈️ 雷暴' },
      };
      if (map[e.key] || e.key === '6') {
        e.preventDefault();
        if (e.key === '6') {
          const now = this._weatherInfo;
          const nd = now?.is_day === 1 ? 0 : 1;
          this._weatherInfo = { weather_code: 0, temperature_2m: nd ? 10 : 25, is_day: nd };
        } else {
          const isDay = this._weatherInfo?.is_day ?? 1;
          this._weatherInfo = { weather_code: map[e.key].code, temperature_2m: map[e.key].temp, is_day: isDay };
        }
        this.renderHome();
      }
    });
  },

  _startClock() {
    this._updateClock();
    if (this._clockInterval) clearInterval(this._clockInterval);
    this._clockInterval = setInterval(() => this._updateClock(), 1000);
  },

  _updateClock() {
    const el = document.getElementById('bg-clock');
    if (!el) return;
    const now = new Date();
    el.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  },
};

function shuffle(a) { for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
document.addEventListener('DOMContentLoaded', () => App.init());
