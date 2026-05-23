const App = {
  state: {
    currentRank: null, currentVine: 'word',
    inQuiz: false, quizLevel: null, quizQuestions: [], quizIndex: 0,
    quizScore: 0, quizCorrect: 0, quizWrong: 0,
    selectedOption: -1, answered: false, locked: false,
    userProgress: {}
  },

  TOTAL_LEVELS: 15,

  init() {
    this.loadProgress();
    this.state.currentRank = this.findBestRank();
    window.addEventListener('resize', () => this.handleResize());
    this.renderHome();
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
      if ((p.word.highestUnlocked || 1) <= this.TOTAL_LEVELS || (p.listening.highestUnlocked || 1) <= this.TOTAL_LEVELS) return r.id;
    }
    return RANKS[0].id;
  },

  getProgress(rankId) {
    if (!this.state.userProgress[rankId]) this.state.userProgress[rankId] = { word: { highestUnlocked: 1, completedLevels: [], bestScores: {} }, listening: { highestUnlocked: 1, completedLevels: [], bestScores: {} } };
    return this.state.userProgress[rankId];
  },

  loadProgress() { try { const s = localStorage.getItem('charm_english_progress'); if (s) this.state.userProgress = JSON.parse(s); } catch(e) {} },
  saveProgress() { try { localStorage.setItem('charm_english_progress', JSON.stringify(this.state.userProgress)); } catch(e) {} },

  // ===================== HOME - 消消乐风楼梯 =====================

  renderHome() {
    const container = document.getElementById('app');
    const rank = RANKS.find(r => r.id === this.state.currentRank);
    if (!rank) return;
    this.state.inQuiz = false;

    container.innerHTML = `
      <div class="screen stair-screen active">
        <div class="home-header-bar">
          <div class="home-title-row">
            <span class="home-brand">🌸 Charm</span>
            <span class="home-badge">EN</span>
          </div>
          <div class="home-sub-row">🎯 一级一台阶 · 开心闯关学英语</div>
        </div>
        <div class="selector-row" id="rank-selector">
          ${RANKS.map(r => `
            <button class="rank-chip ${r.id === this.state.currentRank ? 'active' : ''}"
                    style="${r.id === this.state.currentRank ? 'border-color:' + r.color + ';background:' + r.lightColor : ''}"
                    onclick="App.switchRank('${r.id}')">
              <span class="rc-icon">${r.icon}</span>
              <span class="rc-name">${r.name}</span>
            </button>
          `).join('')}
        </div>
        <div class="vine-tab-row">
          <button class="vine-tab ${this.state.currentVine === 'word' ? 'active' : ''}" onclick="App.switchVine('word')">📝 单词</button>
          <button class="vine-tab ${this.state.currentVine === 'listening' ? 'active' : ''}" onclick="App.switchVine('listening')">🎧 听力</button>
        </div>
        <div class="stair-scroll-area" id="stair-scroll">
          <div class="stair-world" id="stair-world">
            ${this.buildStairWorld()}
          </div>
        </div>
        <div class="feature-bar">
          <button class="f-btn" onclick="App.openWrongBook()">📖 错题本</button>
          <button class="f-btn" onclick="App.openBadges()">🏆 勋章</button>
          <button class="f-btn" onclick="App.openDaily()">📅 打卡</button>
        </div>
      </div>
    `;
    setTimeout(() => this.scrollToCurrent(), 200);
  },

  buildStairWorld() {
    const rankId = this.state.currentRank;
    const vineType = this.state.currentVine;
    const prog = this.getProgress(rankId);
    const vine = prog[vineType];
    const rank = RANKS.find(r => r.id === rankId);
    if (!rank) return '';

    const area = document.getElementById('stair-scroll');
    const cw = area ? area.clientWidth : 375;
    const ch = area ? area.clientHeight : 600;
    const isPortrait = ch > cw;

    const total = this.TOTAL_LEVELS;
    const padH = cw * 0.06;
    const padV = ch * 0.04;
    const usableW = cw - padH * 2;
    const usableH = ch - padV * 2;

    // Step spacing: portrait uses more vertical, landscape uses more horizontal
    const baseSize = Math.min(cw, ch) * 0.065;
    const stepW = Math.max(40, Math.min(72, baseSize * 1.6));
    const stepHt = Math.max(12, Math.min(22, baseSize * 0.45));
    const riserH = Math.max(6, Math.min(12, baseSize * 0.25));

    const hStep = isPortrait ? usableH * 0.055 : usableH * 0.04;
    const wStep = isPortrait ? usableW * 0.045 : usableW * 0.058;

    const startB = padV;
    const startL = padH;
    const maxB = startB + (total - 1) * hStep + stepHt + riserH + 60;
    const maxL = startL + (total - 1) * wStep + stepW + 40;
    const containerH = Math.max(ch, maxB + padV);
    const containerW = Math.max(cw, maxL + padH);

    // Background layers using container dimensions
    const grassTopPct = Math.max(40, Math.min(65, 55 + (ch / cw - 1.5) * 5));
    const groundH = Math.max(20, Math.min(40, baseSize * 0.8));

    let html = `<div class="xld-wrap" style="height:${containerH}px;min-width:${cw}px">`;

    html += `<div class="xld-sky" style="bottom:${100-grassTopPct}%"></div>`;
    html += `<div class="xld-grass" style="top:${grassTopPct}%;height:${100-grassTopPct}%"></div>`;
    html += `<div class="xld-ground" style="height:${groundH}px"></div>`;

    // Clouds
    const cloudSz = baseSize * 0.5;
    const clouds = [
      { top: '3%', left: '8%', delay: '0s' },
      { top: '6%', left: '52%', delay: '1.5s' },
      { top: '1%', left: '78%', delay: '3s' },
      { top: '10%', left: '28%', delay: '2s' },
    ];
    clouds.forEach(c => {
      html += `<div class="xld-cloud" style="top:${c.top};left:${c.left};animation-delay:${c.delay};font-size:${cloudSz}px">☁️</div>`;
    });

    html += `<div class="xld-sun" style="font-size:${baseSize * 0.7}px;top:${baseSize * 0.2}px;right:${baseSize * 0.4}px">🌤️</div>`;

    // Steps
    for (let i = 0; i < total; i++) {
      const levelNum = i + 1;
      const isCompleted = vine.completedLevels.includes(levelNum);
      const isCurrent = levelNum === vine.highestUnlocked && !isCompleted;
      const isLocked = levelNum > vine.highestUnlocked;
      const starCount = vine.bestScores[levelNum] || 0;
      const stars = Math.min(3, Math.ceil(starCount / 2));

      const bottom = startB + i * hStep;
      const left = startL + i * wStep;
      const visStepTop = bottom + riserH;

      let nodeBg, nodeBorder, nodeShadow;
      if (isCompleted) {
        nodeBg = `linear-gradient(135deg, ${rank.color}, ${rank.color}dd)`;
        nodeBorder = rank.color;
        nodeShadow = `0 ${baseSize*0.06}px ${baseSize*0.18}px ${rank.color}66`;
      } else if (isCurrent) {
        nodeBg = 'linear-gradient(135deg, #FFD700, #FFA726)';
        nodeBorder = '#FFA726';
        nodeShadow = '0 0 24px rgba(255,215,0,0.6)';
      } else if (isLocked) {
        nodeBg = 'linear-gradient(135deg, #888, #666)';
        nodeBorder = '#555';
        nodeShadow = 'none';
      } else {
        nodeBg = 'linear-gradient(135deg, #fff, #f0f0f0)';
        nodeBorder = '#ccc';
        nodeShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }

      const numSz = baseSize * 0.45;
      const charSz = baseSize * 0.6;
      const starSz = baseSize * 0.25;
      const leafSz = baseSize * 0.4;

      html += `
        <div class="xld-node ${isCompleted ? 'done' : isCurrent ? 'cur' : isLocked ? 'locked' : 'open'}"
             style="bottom:${bottom}px;left:${left}px;"
             onclick="App.clickLevel(${levelNum})" data-level="${levelNum}">
          <div class="xld-node-tread" style="width:${stepW}px;height:${stepHt}px;background:${nodeBg};border-color:${nodeBorder};box-shadow:${nodeShadow}"></div>
          <div class="xld-node-riser" style="width:${stepW}px;height:${riserH}px;background:${isLocked ? '#777' : isCompleted ? rank.color + '99' : isCurrent ? '#FFC107' : '#ddd'}"></div>
          <div class="xld-node-body ${isLocked ? 'locked' : ''}" style="bottom:calc(100% + 2px);left:50%;transform:translateX(-50%)">
            <div class="xld-node-icon" style="font-size:${baseSize*0.25}px;height:${baseSize*0.35}px;line-height:${baseSize*0.35}px">
              ${isCompleted ? '⭐' : isCurrent ? '' : isLocked ? '🔒' : '○'}
            </div>
            <div class="xld-node-num" style="font-size:${numSz}px">${levelNum}</div>
            ${isCurrent ? `<div class="xld-node-char" style="font-size:${charSz}px">🧑‍🎓</div>` : ''}
            ${isCompleted && stars > 0 ? `<div class="xld-node-stars" style="font-size:${starSz}px">${'⭐'.repeat(stars)}</div>` : ''}
          </div>
        </div>
      `;

      // Decorative leaves
      if (i % 2 === 0) {
        html += `<div class="xld-leaf" style="bottom:${bottom + riserH + 8}px;left:${left + stepW + 4}px;font-size:${leafSz}px;opacity:0.45">🌿</div>`;
      }
      if (i % 3 === 0) {
        html += `<div class="xld-leaf" style="bottom:${bottom + riserH + 16}px;left:${left - 6}px;font-size:${leafSz*0.9}px;opacity:0.35;transform:scaleX(-1)">🍃</div>`;
      }
    }

    // Butterfly
    html += `<div class="xld-butterfly" style="bottom:${ch * 0.3}px;left:${maxL + 10}px;font-size:${baseSize*0.5}px">🦋</div>`;

    // Section labels
    const sections = [
      { level: 1, label: '🌱 小学', yOff: baseSize * 0.15 },
      { level: 4, label: '🌿 初中', yOff: baseSize * 0.3 },
      { level: 7, label: '🌳 高中', yOff: baseSize * 0.3 },
      { level: 10, label: '🏛️ 大学', yOff: baseSize * 0.3 },
      { level: 13, label: '🔬 研究生', yOff: baseSize * 0.3 },
    ];
    const labelSz = baseSize * 0.32;
    sections.forEach(s => {
      const idx = s.level - 1;
      const btm = startB + idx * hStep + s.yOff;
      const lft = startL + idx * wStep + stepW + 6;
      html += `<div class="xld-slabel" style="bottom:${btm}px;left:${lft}px;font-size:${labelSz}px">${s.label}</div>`;
    });

    // Goal
    const topIdx = total - 1;
    const goalSz = baseSize * 0.36;
    html += `<div class="xld-goal" style="bottom:${startB + topIdx * hStep + stepHt + riserH + 24}px;left:${startL + topIdx * wStep}px;font-size:${goalSz}px">🎯 博士顶峰</div>`;

    html += '</div>';
    return html;
  },

  scrollToCurrent() {
    const area = document.getElementById('stair-scroll');
    if (!area) return;
    const vine = this.getProgress(this.state.currentRank)[this.state.currentVine];
    const cur = vine.highestUnlocked || 1;
    const ch = area.clientHeight || 600;
    const cw = area.clientWidth || 375;
    const isPortrait = ch > cw;
    const hStep = isPortrait ? ch * 0.055 : ch * 0.04;
    const target = (cur - 1) * hStep - ch * 0.3;
    const maxScroll = area.scrollHeight - area.clientHeight;
    setTimeout(() => area.scrollTo({ top: Math.max(0, Math.min(target, maxScroll)), behavior: 'smooth' }), 250);
  },

  switchRank(rankId) {
    if (rankId === this.state.currentRank) return;
    this.state.currentRank = rankId;
    this.renderHome();
  },

  switchVine(type) {
    if (this.state.currentVine === type) return;
    this.state.currentVine = type;
    const els = document.querySelectorAll('.vine-tab');
    els.forEach((el, i) => el.classList.toggle('active', (i === 0 && type === 'word') || (i === 1 && type === 'listening')));
    const w = document.getElementById('stair-world');
    if (w) { w.innerHTML = this.buildStairWorld(); this.scrollToCurrent(); }
  },

  clickLevel(levelNum) {
    const vine = this.getProgress(this.state.currentRank)[this.state.currentVine];
    if (levelNum > vine.highestUnlocked) return;
    this.startQuiz(levelNum);
  },

  // ===================== QUIZ =====================

  startQuiz(levelNum) {
    const qs = this.getLevelQuestions(this.state.currentRank, this.state.currentVine, levelNum);
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
    this.renderQuiz();
  },

  getLevelQuestions(rankId, vineType, levelNum) {
    const qs = QUESTIONS[rankId]?.[vineType]?.[levelNum];
    if (qs && qs.length > 0) return shuffle([...qs]).slice(0, 5);
    return this.makeFallbackQuestions(5);
  },

  makeFallbackQuestions(count) {
    const r = [];
    for (let i = 0; i < count; i++) r.push({ type: 'word', question: `闯关题 ${i+1}：选择正确答案`, options: shuffle([{ text: '正确答案', correct: true }, { text: '干扰A', correct: false }, { text: '干扰B', correct: false }, { text: '干扰C', correct: false }]), humorStory: '用有趣的画面联想来记住吧 ✨', humorTag: '趣味记忆' });
    return r;
  },

  renderQuiz() {
    const container = document.getElementById('app');
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

  selectOpt(index) {
    if (this.state.locked || this.state.answered) return;
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
      document.getElementById('q-actions').innerHTML = `<button class="q-act q-act-next" onclick="App.nextQ()">下一题 →</button>`;
      this.showToast('✅ 答对了！', 'success');
    } else {
      this.state.quizWrong++;
      document.getElementById('q-actions').innerHTML = `<button class="q-act q-act-humor" onclick="App.showHumorPopup()">💡 趣味记忆</button>`;
      this.showToast('❌ 看看趣味提示~', 'error');
    }
  },

  nextQ() { this.state.quizIndex++; this.state.answered = false; this.state.locked = false; this.state.selectedOption = -1; if (this.state.quizIndex >= this.state.quizQuestions.length) this.finishQuiz(); else this.renderQuiz(); },
  skipQ() { this.state.quizWrong++; this.nextQ(); },
  quitQuiz() { this.state.inQuiz = false; this.renderHome(); },

  finishQuiz() {
    const rankId = this.state.currentRank;
    const vineType = this.state.currentVine;
    const levelNum = this.state.quizLevel;
    const vine = this.getProgress(rankId)[vineType];
    if (!vine.completedLevels.includes(levelNum)) vine.completedLevels.push(levelNum);
    if (levelNum >= vine.highestUnlocked && levelNum < this.TOTAL_LEVELS) vine.highestUnlocked = levelNum + 1;
    const prevBest = vine.bestScores[levelNum] || 0;
    if (this.state.quizScore > prevBest) vine.bestScores[levelNum] = this.state.quizScore;
    this.saveProgress();

    const correct = this.state.quizCorrect, wrong = this.state.quizWrong;
    const total = correct + wrong || 1, accuracy = Math.round(correct / total * 100);
    const stars = Math.min(3, Math.ceil(correct / 5 * 3));
    const rank = RANKS.find(r => r.id === rankId);

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
    const total = RANKS.reduce((s, r) => { const p = this.getProgress(r.id); return s + p.word.completedLevels.length + p.listening.completedLevels.length; }, 0);
    this.showPopup(`<div class="popup"><span class="popup-icon">🏆</span><div class="popup-title">勋章图鉴</div><div class="popup-desc">${RANKS.map((r, i) => `${total >= (i+1)*10 ? '✅' : '🔒'} ${r.icon} ${r.name}`).join('<br>')}</div><button class="popup-btn popup-btn-primary" onclick="App.closePopup()">继续努力 💪</button></div>`);
  },
  openDaily() { this.showPopup(`<div class="popup"><span class="popup-icon">📅</span><div class="popup-title">每日打卡挑战</div><div class="popup-desc">🌅 单词复习<br>🎧 听力训练<br>💡 趣味记忆</div><button class="popup-btn popup-btn-success" onclick="App.closePopup()">明天开始！🌟</button></div>`); }
};

function shuffle(a) { for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
document.addEventListener('DOMContentLoaded', () => App.init());
