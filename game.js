/**
 * Ludo Master - 4 Colors Edition
 * Players: Purple, Green, Yellow, Black
 * Complete rules, AI bots, step-by-step token hopping, Web Audio sound effects, 3D rolling dice.
 */

// ==========================================
// CONSTANTS & BOARD GEOMETRY
// ==========================================

const PLAYERS = [
  { id: 'purple', name: 'Purple', color: '#8b5cf6', startIndex: 0,  homeEntryStep: 50 },
  { id: 'green',  name: 'Green',  color: '#10b981', startIndex: 13, homeEntryStep: 50 },
  { id: 'yellow', name: 'Yellow', color: '#f59e0b', startIndex: 26, homeEntryStep: 50 },
  { id: 'black',  name: 'Black',  color: '#334155', startIndex: 39, homeEntryStep: 50 }
];

// Safe Star track indices (8 safe squares on standard international Ludo board)
const SAFE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

// 52 Perimeter Track Coordinates (row 1..15, col 1..15)
const TRACK_COORDS = [
  /* 0  - Purple Start */ { r: 7, c: 2 },
  /* 1  */                { r: 7, c: 3 },
  /* 2  */                { r: 7, c: 4 },
  /* 3  */                { r: 7, c: 5 },
  /* 4  */                { r: 7, c: 6 },
  /* 5  */                { r: 6, c: 7 },
  /* 6  */                { r: 5, c: 7 },
  /* 7  */                { r: 4, c: 7 },
  /* 8  - Safe Star   */ { r: 3, c: 7 },
  /* 9  */                { r: 2, c: 7 },
  /* 10 */                { r: 1, c: 7 },
  /* 11 - Top crossover*/ { r: 1, c: 8 },
  /* 12 */                { r: 1, c: 9 },
  /* 13 - Green Start  */ { r: 2, c: 9 },
  /* 14 */                { r: 3, c: 9 },
  /* 15 */                { r: 4, c: 9 },
  /* 16 */                { r: 5, c: 9 },
  /* 17 */                { r: 6, c: 9 },
  /* 18 */                { r: 7, c: 10 },
  /* 19 */                { r: 7, c: 11 },
  /* 20 */                { r: 7, c: 12 },
  /* 21 - Safe Star    */ { r: 7, c: 13 },
  /* 22 */                { r: 7, c: 14 },
  /* 23 */                { r: 7, c: 15 },
  /* 24 - Right x-over */ { r: 8, c: 15 },
  /* 25 */                { r: 9, c: 15 },
  /* 26 - Yellow Start */ { r: 9, c: 14 },
  /* 27 */                { r: 9, c: 13 },
  /* 28 */                { r: 9, c: 12 },
  /* 29 */                { r: 9, c: 11 },
  /* 30 */                { r: 9, c: 10 },
  /* 31 */                { r: 10, c: 9 },
  /* 32 */                { r: 11, c: 9 },
  /* 33 */                { r: 12, c: 9 },
  /* 34 - Safe Star    */ { r: 13, c: 9 },
  /* 35 */                { r: 14, c: 9 },
  /* 36 */                { r: 15, c: 9 },
  /* 37 - Bottom x-over*/ { r: 15, c: 8 },
  /* 38 */                { r: 15, c: 7 },
  /* 39 - Black Start  */ { r: 14, c: 7 },
  /* 40 */                { r: 13, c: 7 },
  /* 41 */                { r: 12, c: 7 },
  /* 42 */                { r: 11, c: 7 },
  /* 43 */                { r: 10, c: 7 },
  /* 44 */                { r: 9, c: 6 },
  /* 45 */                { r: 9, c: 5 },
  /* 46 */                { r: 9, c: 4 },
  /* 47 - Safe Star    */ { r: 9, c: 3 },
  /* 48 */                { r: 9, c: 2 },
  /* 49 */                { r: 9, c: 1 },
  /* 50 - Left x-over  */ { r: 8, c: 1 },
  /* 51 */                { r: 7, c: 1 }
];

// Home Path Coordinates (5 steps leading into center home)
const HOME_PATHS = {
  purple: [
    { r: 8, c: 2 }, { r: 8, c: 3 }, { r: 8, c: 4 }, { r: 8, c: 5 }, { r: 8, c: 6 }
  ],
  green: [
    { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 }, { r: 6, c: 8 }
  ],
  yellow: [
    { r: 8, c: 14 }, { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }
  ],
  black: [
    { r: 14, c: 8 }, { r: 13, c: 8 }, { r: 12, c: 8 }, { r: 11, c: 8 }, { r: 10, c: 8 }
  ]
};

// Base slots relative coordinates or slot IDs
const BASE_SLOT_OFFSETS = [
  { r: 0, c: 0 },
  { r: 0, c: 1 },
  { r: 1, c: 0 },
  { r: 1, c: 1 }
];

// 3D Dice rotation angles for each face (1-6)
const DICE_ROTATIONS = {
  1: { x: 0,    y: 0,    z: 0 },
  2: { x: 0,    y: 180,  z: 0 },
  3: { x: 0,    y: 90,   z: 0 },
  4: { x: 0,    y: -90,  z: 0 },
  5: { x: -90,  y: 0,    z: 0 },
  6: { x: 90,   y: 0,    z: 0 }
};

// ==========================================
// AUDIO SYNTHESIZER (Web Audio API)
// ==========================================

class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playDiceSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const count = 5;
    for (let i = 0; i < count; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = this.ctx.currentTime + (i * 0.07);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 80, time);
      osc.frequency.exponentialRampToValueAtTime(50, time + 0.05);

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.05);
    }
  }

  playHopSound(pitchOffset = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const time = this.ctx.currentTime;

    osc.type = 'sine';
    const baseFreq = 380 + (pitchOffset * 15);
    osc.frequency.setValueAtTime(baseFreq, time);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, time + 0.07);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.08);
  }

  playCaptureSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const time = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, time);
    osc.frequency.exponentialRampToValueAtTime(90, time + 0.28);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.28);
  }

  playBonusSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = this.ctx.currentTime + (i * 0.09);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.16);
    });
  }

  playHomeSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = this.ctx.currentTime + (i * 0.08);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.22);
    });
  }

  playWinFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const chords = [
      [523.25, 659.25, 783.99],       // C
      [587.33, 739.99, 880.00],       // D
      [659.25, 830.61, 987.77],       // E
      [1046.50, 1318.51, 1567.98]     // High C
    ];

    chords.forEach((chord, stepIdx) => {
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = this.ctx.currentTime + (stepIdx * 0.2);
        const dur = (stepIdx === 3) ? 0.6 : 0.18;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + dur);
      });
    });
  }
}

// ==========================================
// CONFETTI CELEBRATION SYSTEM
// ==========================================

class Confetti {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start(durationMs = 4000) {
    this.resize();
    this.particles = [];
    const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#cbd5e1', '#ec4899', '#38bdf8'];
    for (let i = 0; i < 150; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * -this.canvas.height * 0.5,
        size: Math.random() * 9 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        velX: (Math.random() - 0.5) * 5,
        velY: Math.random() * 4 + 3,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10
      });
    }

    if (this.animationId) cancelAnimationFrame(this.animationId);
    const startTime = performance.now();

    const loop = (now) => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const elapsed = now - startTime;

      this.particles.forEach(p => {
        p.x += p.velX;
        p.y += p.velY;
        p.rot += p.rotSpeed;

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rot * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        this.ctx.restore();
      });

      if (elapsed < durationMs) {
        this.animationId = requestAnimationFrame(loop);
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.animationId = null;
      }
    };

    this.animationId = requestAnimationFrame(loop);
  }
}

// ==========================================
// MAIN LUDO GAME ENGINE
// ==========================================

class LudoGame {
  constructor() {
    this.sound = new SoundManager();
    this.confetti = new Confetti(document.getElementById('confettiCanvas'));

    // Config: Player types: 'human', 'bot', 'off'
    this.playerConfig = {
      purple: 'human',
      green: 'bot',
      yellow: 'bot',
      black: 'bot'
    };

    this.fastSpeed = false;
    this.turnIndex = 0;
    this.diceValue = 1;
    this.isRolling = false;
    this.isMoving = false;
    this.consecutiveSixes = 0;
    this.waitingForMove = false;
    this.validMoves = [];
    this.winnerRanks = []; // Array of finished player IDs in order: 1st, 2nd, 3rd

    // Player Tokens State:
    // tokens: Array of 4 tokens: { id: 0..3, state: 'base'|'track'|'home_path'|'home', step: -1..56 }
    this.players = PLAYERS.map(p => ({
      ...p,
      tokens: [
        { id: 0, state: 'base', step: -1 },
        { id: 1, state: 'base', step: -1 },
        { id: 2, state: 'base', step: -1 },
        { id: 3, state: 'base', step: -1 }
      ]
    }));

    this.dom = {
      board: document.getElementById('ludoBoard'),
      statusBanner: document.getElementById('statusBanner'),
      statusMessage: document.getElementById('statusMessage'),
      turnDot: document.getElementById('turnDot'),
      diceStation: document.getElementById('diceStation'),
      activeDiceCard: document.getElementById('activeDiceCard'),
      diceCube: document.getElementById('diceCube'),
      diceWrapper: document.getElementById('diceWrapper'),
      rollBtn: document.getElementById('rollDiceBtn'),
      dicePlayerTag: document.getElementById('dicePlayerTag'),
      diceTagDot: document.getElementById('diceTagDot'),
      diceTagText: document.getElementById('diceTagText'),
      logEntries: document.getElementById('logEntries'),
      rulesModal: document.getElementById('rulesModal'),
      settingsModal: document.getElementById('settingsModal'),
      victoryModal: document.getElementById('victoryModal')
    };

    this.initBoardDOM();
    this.bindEvents();
    this.applyPreset('1p');
    this.updateUI();
  }

  // Generate 15x15 board elements in DOM
  initBoardDOM() {
    this.dom.board.innerHTML = '';

    // 1. Purple Base (Top-Left 6x6)
    const basePurple = this.createBaseElement('purple', 'base-purple');
    this.dom.board.appendChild(basePurple);

    // 2. Green Base (Top-Right 6x6)
    const baseGreen = this.createBaseElement('green', 'base-green');
    this.dom.board.appendChild(baseGreen);

    // 3. Yellow Base (Bottom-Right 6x6)
    const baseYellow = this.createBaseElement('yellow', 'base-yellow');
    this.dom.board.appendChild(baseYellow);

    // 4. Black Base (Bottom-Left 6x6)
    const baseBlack = this.createBaseElement('black', 'base-black');
    this.dom.board.appendChild(baseBlack);

    // 5. Center Home (3x3 Center Block)
    const centerHome = document.createElement('div');
    centerHome.className = 'center-home';
    centerHome.innerHTML = `
      <svg class="center-home-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <!-- Top triangle: Green -->
        <polygon points="0,0 100,0 50,50" fill="#10b981" />
        <!-- Right triangle: Yellow -->
        <polygon points="100,0 100,100 50,50" fill="#f59e0b" />
        <!-- Bottom triangle: Black -->
        <polygon points="100,100 0,100 50,50" fill="#1e293b" />
        <!-- Left triangle: Purple -->
        <polygon points="0,100 0,0 50,50" fill="#8b5cf6" />
      </svg>
      <div class="center-trophy" title="Home Finish">🏆</div>
    `;
    this.dom.board.appendChild(centerHome);

    // 6. Perimeter Track cells (52 cells)
    TRACK_COORDS.forEach((coord, idx) => {
      const cell = document.createElement('div');
      cell.className = 'cell track-cell';
      cell.dataset.trackIndex = idx;
      cell.dataset.row = coord.r;
      cell.dataset.col = coord.c;
      cell.style.gridRow = coord.r;
      cell.style.gridColumn = coord.c;

      // Special cell markings:
      if (idx === 0) {
        cell.classList.add('start-purple');
        cell.innerHTML = '<span class="start-arrow">▶</span>';
      } else if (idx === 13) {
        cell.classList.add('start-green');
        cell.innerHTML = '<span class="start-arrow">▼</span>';
      } else if (idx === 26) {
        cell.classList.add('start-yellow');
        cell.innerHTML = '<span class="start-arrow">◀</span>';
      } else if (idx === 39) {
        cell.classList.add('start-black');
        cell.innerHTML = '<span class="start-arrow">▲</span>';
      } else if (SAFE_INDICES.includes(idx)) {
        cell.innerHTML = '<span class="safe-star">★</span>';
      }

      this.dom.board.appendChild(cell);
    });

    // 7. Home Stretch cells (5 for each player)
    Object.entries(HOME_PATHS).forEach(([color, path]) => {
      path.forEach((coord, stepIdx) => {
        const cell = document.createElement('div');
        cell.className = `cell home-stretch-${color}`;
        cell.dataset.homePlayer = color;
        cell.dataset.homeStep = stepIdx;
        cell.dataset.row = coord.r;
        cell.dataset.col = coord.c;
        cell.style.gridRow = coord.r;
        cell.style.gridColumn = coord.c;
        this.dom.board.appendChild(cell);
      });
    });
  }

  createBaseElement(color, className) {
    const base = document.createElement('div');
    base.className = `base-block ${className}`;
    base.dataset.basePlayer = color;

    const innerCard = document.createElement('div');
    innerCard.className = 'base-inner-card';

    for (let slot = 0; slot < 4; slot++) {
      const slotDiv = document.createElement('div');
      slotDiv.className = 'base-slot';
      slotDiv.dataset.baseColor = color;
      slotDiv.dataset.slotId = slot;
      innerCard.appendChild(slotDiv);
    }

    base.appendChild(innerCard);
    return base;
  }

  bindEvents() {
    // Dice Click & Roll Button
    this.dom.rollBtn.addEventListener('click', () => this.handleRollClick());
    this.dom.diceWrapper.addEventListener('click', () => this.handleRollClick());

    // Spacebar shortcut for rolling dice
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        const activeModal = document.querySelector('.modal-backdrop.show');
        if (!activeModal && !this.isRolling && !this.isMoving && this.isCurrentPlayerHuman() && !this.waitingForMove) {
          e.preventDefault();
          this.handleRollClick();
        }
      }
    });

    // Preset mode buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyPreset(btn.dataset.preset);
      });
    });

    // Speed toggle
    document.getElementById('speedToggleBtn').addEventListener('click', () => {
      this.fastSpeed = !this.fastSpeed;
      document.getElementById('speedLabel').textContent = this.fastSpeed ? '2x Speed' : '1x Speed';
      this.addLog(`⚡ Speed set to ${this.fastSpeed ? 'Fast (2x)' : 'Normal (1x)'}`);
    });

    // Sound toggle
    document.getElementById('soundToggleBtn').addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      document.getElementById('soundIcon').textContent = this.sound.enabled ? '🔊' : '🔇';
      document.getElementById('soundLabel').textContent = this.sound.enabled ? 'Sound' : 'Muted';
      this.addLog(this.sound.enabled ? '🔊 Sound unmuted' : '🔇 Sound muted');
    });

    // Rules modal
    document.getElementById('rulesBtn').addEventListener('click', () => {
      this.dom.rulesModal.classList.add('show');
    });
    document.getElementById('closeRulesBtn').addEventListener('click', () => {
      this.dom.rulesModal.classList.remove('show');
    });
    document.getElementById('gotItBtn').addEventListener('click', () => {
      this.dom.rulesModal.classList.remove('show');
    });

    // Settings modal
    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.openSettingsModal();
    });
    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
      this.dom.settingsModal.classList.remove('show');
    });
    document.getElementById('applySettingsBtn').addEventListener('click', () => {
      this.saveSettingsModal();
      this.dom.settingsModal.classList.remove('show');
      this.resetGame();
    });

    // Player sidebar type toggles (Human/Bot/Off direct cycle)
    document.querySelectorAll('.player-type-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.player;
        const currentType = this.playerConfig[color];
        let nextType = 'bot';
        if (currentType === 'human') nextType = 'bot';
        else if (currentType === 'bot') nextType = 'off';
        else nextType = 'human';

        // Ensure at least 2 active players
        const activeCount = Object.values(this.playerConfig).filter(t => t !== 'off').length;
        if (nextType === 'off' && activeCount <= 2) {
          nextType = 'human';
        }

        this.playerConfig[color] = nextType;
        this.updatePlayerCardHeaders();
        this.addLog(`Player ${color.toUpperCase()} set to: ${nextType.toUpperCase()}`);

        // If current turn player is now off, advance turn
        if (this.getCurrentPlayerConfig() === 'off') {
          this.advanceTurn();
        } else {
          this.checkBotTurn();
        }
      });
    });

    // New Game & Play Again buttons
    document.getElementById('newGameBtn').addEventListener('click', () => this.resetGame());
    document.getElementById('playAgainBtn').addEventListener('click', () => {
      this.dom.victoryModal.classList.remove('show');
      this.resetGame();
    });
  }

  // Switch presets
  applyPreset(presetKey) {
    if (presetKey === '1p') {
      this.playerConfig = { purple: 'human', green: 'bot', yellow: 'bot', black: 'bot' };
    } else if (presetKey === 'pass') {
      this.playerConfig = { purple: 'human', green: 'human', yellow: 'human', black: 'human' };
    } else if (presetKey === '2p') {
      this.playerConfig = { purple: 'human', green: 'off', yellow: 'human', black: 'off' };
    } else if (presetKey === 'botbattle') {
      this.playerConfig = { purple: 'bot', green: 'bot', yellow: 'bot', black: 'bot' };
    }
    this.resetGame();
  }

  resetGame() {
    this.turnIndex = 0;
    this.diceValue = 1;
    this.isRolling = false;
    this.isMoving = false;
    this.consecutiveSixes = 0;
    this.waitingForMove = false;
    this.validMoves = [];
    this.winnerRanks = [];

    // Reset tokens
    this.players.forEach(p => {
      p.tokens.forEach((t, i) => {
        t.state = 'base';
        t.step = -1;
      });
    });

    // Hide ranks
    PLAYERS.forEach(p => {
      const badge = document.getElementById(`rank-${p.id}`);
      if (badge) {
        badge.className = 'rank-badge';
        badge.textContent = '';
      }
    });

    this.updatePlayerCardHeaders();
    this.rotateDiceCube(1);
    this.renderTokens();
    this.updateUI();
    this.addLog('🔄 New game initialized. Purple goes first!');

    // First player turn check
    this.startTurn();
  }

  updatePlayerCardHeaders() {
    PLAYERS.forEach(p => {
      const card = document.getElementById(`card-${p.id}`);
      const toggle = card.querySelector('.player-type-toggle');
      const type = this.playerConfig[p.id];

      if (type === 'off') {
        card.classList.add('inactive');
        toggle.innerHTML = `<span class="type-icon">❌</span> <span class="type-text">Off</span>`;
      } else if (type === 'bot') {
        card.classList.remove('inactive');
        toggle.innerHTML = `<span class="type-icon">🤖</span> <span class="type-text">Bot</span>`;
      } else {
        card.classList.remove('inactive');
        toggle.innerHTML = `<span class="type-icon">👤</span> <span class="type-text">Human</span>`;
      }
    });
  }

  getCurrentPlayer() {
    return this.players[this.turnIndex];
  }

  getCurrentPlayerConfig() {
    const cur = this.getCurrentPlayer();
    return this.playerConfig[cur.id];
  }

  isCurrentPlayerHuman() {
    return this.getCurrentPlayerConfig() === 'human';
  }

  // Start turn for current player
  startTurn() {
    const player = this.getCurrentPlayer();
    const config = this.getCurrentPlayerConfig();

    if (config === 'off' || this.winnerRanks.includes(player.id)) {
      this.advanceTurn();
      return;
    }

    this.waitingForMove = false;
    this.validMoves = [];
    this.updateUI();

    if (config === 'bot') {
      this.dom.rollBtn.disabled = true;
      this.dom.diceWrapper.classList.add('disabled');
      const delay = this.fastSpeed ? 400 : 750;
      setTimeout(() => {
        if (!this.isRolling && !this.isMoving) {
          this.executeRoll();
        }
      }, delay);
    } else {
      this.dom.rollBtn.disabled = false;
      this.dom.diceWrapper.classList.remove('disabled');
    }
  }

  handleRollClick() {
    if (this.isRolling || this.isMoving || this.waitingForMove) return;
    if (!this.isCurrentPlayerHuman()) return;
    this.executeRoll();
  }

  executeRoll() {
    this.isRolling = true;
    this.dom.rollBtn.disabled = true;
    this.dom.diceWrapper.classList.add('disabled');
    this.dom.diceCube.classList.add('rolling');
    this.sound.playDiceSound();

    const rollDuration = this.fastSpeed ? 350 : 650;

    setTimeout(() => {
      this.diceValue = Math.floor(Math.random() * 6) + 1;
      this.dom.diceCube.classList.remove('rolling');
      this.rotateDiceCube(this.diceValue);
      this.isRolling = false;
      this.processRollResult();
    }, rollDuration);
  }

  rotateDiceCube(value) {
    const rot = DICE_ROTATIONS[value] || DICE_ROTATIONS[1];
    this.dom.diceCube.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg) rotateZ(${rot.z}deg)`;
  }

  processRollResult() {
    const player = this.getCurrentPlayer();
    this.addLog(`${player.name} rolled a ${this.diceValue}! 🎲`);

    // Check consecutive 6s
    if (this.diceValue === 6) {
      this.consecutiveSixes++;
      if (this.consecutiveSixes === 3) {
        this.addLog(`⚠️ ${player.name} rolled three consecutive 6s! Turn forfeited.`);
        this.setStatus(`${player.name} rolled three 6s in a row! Turn forfeited.`, player.color);
        this.consecutiveSixes = 0;
        const delay = this.fastSpeed ? 600 : 1200;
        setTimeout(() => this.advanceTurn(), delay);
        return;
      }
    } else {
      this.consecutiveSixes = 0;
    }

    // Determine legal moves
    this.validMoves = this.calculateValidMoves(player, this.diceValue);

    if (this.validMoves.length === 0) {
      this.setStatus(`${player.name} rolled ${this.diceValue}. No legal moves! Passing turn...`, player.color);
      const delay = this.fastSpeed ? 600 : 1200;
      setTimeout(() => this.advanceTurn(), delay);
      return;
    }

    this.waitingForMove = true;
    this.renderTokens(); // Highlights movable tokens

    if (this.getCurrentPlayerConfig() === 'bot') {
      const bestMove = this.selectBestBotMove(player, this.validMoves, this.diceValue);
      const delay = this.fastSpeed ? 300 : 600;
      setTimeout(() => {
        this.executeMove(player, bestMove);
      }, delay);
    } else {
      // Human player
      if (this.validMoves.length === 1) {
        this.setStatus(`Rolled a ${this.diceValue}! Moving Token ${this.validMoves[0].tokenId + 1}...`, player.color);
        // If single valid move, highlight clearly and let user tap or auto-move after short delay
        const autoMoveDelay = this.fastSpeed ? 250 : 500;
        setTimeout(() => {
          if (this.waitingForMove) {
            this.executeMove(player, this.validMoves[0]);
          }
        }, autoMoveDelay);
      } else {
        this.setStatus(`Rolled a ${this.diceValue}! Select which highlighted token to move.`, player.color);
      }
    }
  }

  // Calculate all valid moves for a player given the dice value
  calculateValidMoves(player, dice) {
    const moves = [];

    player.tokens.forEach(token => {
      // Case 1: In base
      if (token.state === 'base') {
        if (dice === 6) {
          moves.push({ tokenId: token.id, fromState: 'base', toStep: 0, stepsToHop: 1 });
        }
      }
      // Case 2: On board or in home path
      else if (token.state === 'track' || token.state === 'home_path') {
        const newStep = token.step + dice;
        if (newStep <= 56) {
          moves.push({
            tokenId: token.id,
            fromState: token.state,
            fromStep: token.step,
            toStep: newStep,
            stepsToHop: dice
          });
        }
      }
    });

    return moves;
  }

  // AI bot decision-making heuristic
  selectBestBotMove(player, moves, dice) {
    let bestScore = -Infinity;
    let chosenMove = moves[0];

    const activePlayers = this.players.filter(p => this.playerConfig[p.id] !== 'off');

    moves.forEach(move => {
      let score = 0;
      const targetStep = move.toStep;

      // 1. Getting token out of base
      if (move.fromState === 'base') {
        score += 650;
      }
      // 2. Reaching Home finish
      else if (targetStep === 56) {
        score += 1200;
      }
      else {
        // Track evaluation
        if (targetStep <= 50) {
          const targetTrackIdx = (player.startIndex + targetStep) % 52;
          const isSafe = SAFE_INDICES.includes(targetTrackIdx);

          // Capture check
          let captures = 0;
          if (!isSafe) {
            activePlayers.forEach(opp => {
              if (opp.id !== player.id) {
                opp.tokens.forEach(oppToken => {
                  if (oppToken.state === 'track') {
                    const oppTrackIdx = (opp.startIndex + oppToken.step) % 52;
                    if (oppTrackIdx === targetTrackIdx) {
                      captures++;
                    }
                  }
                });
              }
            });
          }

          if (captures > 0) {
            score += 1500 * captures; // Massive capture incentive!
          } else if (isSafe) {
            score += 350; // Safe star protection
          }

          // Threat avoidance
          const currTrackIdx = (player.startIndex + move.fromStep) % 52;
          let threatenedAtCurrent = false;
          let threatenedAtTarget = false;

          activePlayers.forEach(opp => {
            if (opp.id !== player.id) {
              opp.tokens.forEach(oppToken => {
                if (oppToken.state === 'track') {
                  const oppTrackIdx = (opp.startIndex + oppToken.step) % 52;
                  const distFromCurrent = (currTrackIdx - oppTrackIdx + 52) % 52;
                  if (distFromCurrent >= 1 && distFromCurrent <= 6) {
                    threatenedAtCurrent = true;
                  }
                  if (!isSafe) {
                    const distFromTarget = (targetTrackIdx - oppTrackIdx + 52) % 52;
                    if (distFromTarget >= 1 && distFromTarget <= 6) {
                      threatenedAtTarget = true;
                    }
                  }
                }
              });
            }
          });

          if (threatenedAtCurrent) score += 300; // Escape threat!
          if (threatenedAtTarget) score -= 220; // Avoid moving into danger
        } else {
          // Entering/advancing in home path
          score += 450 + (targetStep * 12);
        }

        // Slight bias towards tokens further ahead to race them home
        score += targetStep * 4;
      }

      if (score > bestScore) {
        bestScore = score;
        chosenMove = move;
      }
    });

    return chosenMove;
  }

  // Execute selected token move with step-by-step hopping animation
  async executeMove(player, move) {
    this.waitingForMove = false;
    this.isMoving = true;
    this.validMoves = [];
    this.renderTokens();

    const token = player.tokens.find(t => t.id === move.tokenId);
    const hopInterval = this.fastSpeed ? 65 : 130;

    // Moving from base directly to start square (step 0)
    if (move.fromState === 'base') {
      token.state = 'track';
      token.step = 0;
      this.sound.playHopSound(1);
      this.renderTokens();
      await this.sleep(hopInterval);
    } else {
      // Step-by-step hop
      const startStep = move.fromStep;
      const endStep = move.toStep;

      for (let s = startStep + 1; s <= endStep; s++) {
        token.step = s;
        if (s <= 50) token.state = 'track';
        else if (s <= 55) token.state = 'home_path';
        else token.state = 'home';

        this.sound.playHopSound(s % 8);
        this.renderTokens();
        await this.sleep(hopInterval);
      }
    }

    // Move complete: Handle captures, goal, and bonus turns
    let earnedBonus = false;

    // 1. Check Reached Goal (step 56)
    if (token.step === 56) {
      token.state = 'home';
      this.sound.playHomeSound();
      this.addLog(`🌟 ${player.name}'s Token ${token.id + 1} reached Home!`);
      earnedBonus = true;
    }
    // 2. Check Capture on outer track (steps 0 to 50)
    else if (token.state === 'track' && token.step <= 50) {
      const landedTrackIdx = (player.startIndex + token.step) % 52;
      const isSafe = SAFE_INDICES.includes(landedTrackIdx);

      if (!isSafe) {
        const activePlayers = this.players.filter(p => this.playerConfig[p.id] !== 'off');
        activePlayers.forEach(opp => {
          if (opp.id !== player.id) {
            opp.tokens.forEach(oppToken => {
              if (oppToken.state === 'track') {
                const oppTrackIdx = (opp.startIndex + oppToken.step) % 52;
                if (oppTrackIdx === landedTrackIdx) {
                  // Capture!
                  oppToken.state = 'base';
                  oppToken.step = -1;
                  this.sound.playCaptureSound();
                  this.addLog(`⚔️ ${player.name} captured ${opp.name}'s token! Returned to base.`);
                  this.setStatus(`⚔️ ${player.name} captured ${opp.name}'s token! Bonus Roll!`, player.color);
                  earnedBonus = true;
                }
              }
            });
          }
        });
      }
    }

    // 3. Check Rolled a 6 bonus
    if (this.diceValue === 6 && this.consecutiveSixes < 3) {
      earnedBonus = true;
    }

    // 4. Check if player has finished all 4 tokens
    const allHome = player.tokens.every(t => t.state === 'home');
    if (allHome && !this.winnerRanks.includes(player.id)) {
      this.winnerRanks.push(player.id);
      const rankNum = this.winnerRanks.length;
      const rankBadge = document.getElementById(`rank-${player.id}`);
      if (rankBadge) {
        rankBadge.classList.add('show');
        rankBadge.textContent = rankNum === 1 ? '🥇 1st Place' : rankNum === 2 ? '🥈 2nd Place' : '🥉 3rd Place';
      }

      this.sound.playWinFanfare();
      this.confetti.start(4500);
      this.addLog(`🎉 ${player.name} completed all tokens! (${rankNum === 1 ? 'WINNER!' : `${rankNum} Place`})`);

      // Check if game is complete (only 1 player remains)
      const activeTotal = Object.values(this.playerConfig).filter(t => t !== 'off').length;
      if (this.winnerRanks.length >= activeTotal - 1 || activeTotal <= 1) {
        this.showVictoryModal();
        this.isMoving = false;
        return;
      }
    }

    this.renderTokens();
    this.updateStats();
    this.isMoving = false;

    // Advance or Bonus Roll
    if (earnedBonus && !this.winnerRanks.includes(player.id)) {
      this.setStatus(`${player.name} earns a Bonus Roll! 🎲`, player.color);
      const delay = this.fastSpeed ? 350 : 700;
      setTimeout(() => this.startTurn(), delay);
    } else {
      this.advanceTurn();
    }
  }

  advanceTurn() {
    this.consecutiveSixes = 0;
    const activeTotal = Object.values(this.playerConfig).filter(t => t !== 'off').length;

    // Find next active player who hasn't already finished
    let loops = 0;
    do {
      this.turnIndex = (this.turnIndex + 1) % 4;
      loops++;
    } while (
      loops <= 8 &&
      (this.getCurrentPlayerConfig() === 'off' || this.winnerRanks.includes(this.getCurrentPlayer().id))
    );

    this.startTurn();
  }

  checkBotTurn() {
    if (this.getCurrentPlayerConfig() === 'bot' && !this.isRolling && !this.isMoving && !this.waitingForMove) {
      this.startTurn();
    }
  }

  // Render tokens onto board grid cells and base slots
  renderTokens() {
    // Clear all existing pawns from board
    document.querySelectorAll('.pawn').forEach(el => el.remove());
    document.querySelectorAll('.pawn-cluster').forEach(el => el.remove());

    const activePlayers = this.players.filter(p => this.playerConfig[p.id] !== 'off');
    const cellTokenMap = new Map(); // key: selector, value: array of { player, token }

    activePlayers.forEach(player => {
      player.tokens.forEach(token => {
        let container = null;

        if (token.state === 'base') {
          container = document.querySelector(`.base-slot[data-base-color="${player.id}"][data-slot-id="${token.id}"]`);
          if (container) {
            const pawn = this.createPawnElement(player, token);
            container.appendChild(pawn);
          }
        }
        else if (token.state === 'home') {
          container = document.querySelector('.center-home');
          if (container) {
            const pawn = this.createPawnElement(player, token, true);
            container.appendChild(pawn);
          }
        }
        else if (token.state === 'track') {
          const trackIdx = (player.startIndex + token.step) % 52;
          const selector = `.track-cell[data-track-index="${trackIdx}"]`;
          if (!cellTokenMap.has(selector)) cellTokenMap.set(selector, []);
          cellTokenMap.get(selector).push({ player, token });
        }
        else if (token.state === 'home_path') {
          const pathStep = token.step - 51;
          const selector = `.home-stretch-${player.id}[data-home-step="${pathStep}"]`;
          if (!cellTokenMap.has(selector)) cellTokenMap.set(selector, []);
          cellTokenMap.get(selector).push({ player, token });
        }
      });
    });

    // Populate clustered cells
    cellTokenMap.forEach((tokensOnCell, selector) => {
      const cell = document.querySelector(selector);
      if (!cell) return;

      if (tokensOnCell.length === 1) {
        const { player, token } = tokensOnCell[0];
        const pawn = this.createPawnElement(player, token);
        cell.appendChild(pawn);
      } else {
        const cluster = document.createElement('div');
        cluster.className = 'pawn-cluster';
        if (tokensOnCell.length === 3) cluster.classList.add('triple');
        if (tokensOnCell.length >= 4) cluster.classList.add('quad');

        tokensOnCell.forEach(({ player, token }) => {
          const pawn = this.createPawnElement(player, token);
          cluster.appendChild(pawn);
        });

        cell.appendChild(cluster);
      }
    });

    this.updateStats();
  }

  createPawnElement(player, token, isHome = false) {
    const pawn = document.createElement('div');
    pawn.className = `pawn pawn-${player.id}`;
    pawn.textContent = token.id + 1;
    pawn.dataset.playerId = player.id;
    pawn.dataset.tokenId = token.id;

    if (isHome) {
      pawn.classList.add('home-goal-pawn');
      // Position neatly in center home around trophy
      const posMap = {
        purple: { left: '15%', top: '40%' },
        green:  { left: '42%', top: '15%' },
        yellow: { left: '70%', top: '40%' },
        black:  { left: '42%', top: '70%' }
      };
      const p = posMap[player.id];
      if (p) {
        pawn.style.position = 'absolute';
        pawn.style.left = p.left;
        pawn.style.top = p.top;
      }
    }

    // Check if this pawn is legally movable
    const curPlayer = this.getCurrentPlayer();
    if (this.waitingForMove && curPlayer.id === player.id) {
      const isMovable = this.validMoves.some(m => m.tokenId === token.id);
      if (isMovable) {
        pawn.classList.add('movable');
        pawn.title = `Move Token ${token.id + 1}`;
        pawn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.isCurrentPlayerHuman() && this.waitingForMove) {
            const move = this.validMoves.find(m => m.tokenId === token.id);
            if (move) {
              this.executeMove(player, move);
            }
          }
        });
      }
    }

    return pawn;
  }

  updateStats() {
    this.players.forEach(p => {
      const inBase = p.tokens.filter(t => t.state === 'base').length;
      const onTrack = p.tokens.filter(t => t.state === 'track' || t.state === 'home_path').length;
      const inHome = p.tokens.filter(t => t.state === 'home').length;

      const baseEl = document.getElementById(`stat-base-${p.id}`);
      const trackEl = document.getElementById(`stat-track-${p.id}`);
      const homeEl = document.getElementById(`stat-home-${p.id}`);

      if (baseEl) baseEl.textContent = inBase;
      if (trackEl) trackEl.textContent = onTrack;
      if (homeEl) homeEl.textContent = `${inHome}/4`;
    });
  }

  updateUI() {
    const curPlayer = this.getCurrentPlayer();
    const isHuman = this.isCurrentPlayerHuman();

    // Turn indicator dots and styling
    this.dom.turnDot.style.background = curPlayer.color;
    this.dom.turnDot.style.boxShadow = `0 0 12px ${curPlayer.color}`;
    this.dom.turnDot.classList.toggle('pulse', isHuman);

    // Active Card in Sidebar
    document.querySelectorAll('.player-card').forEach(c => c.classList.remove('active-turn'));
    const curCard = document.getElementById(`card-${curPlayer.id}`);
    if (curCard && this.getCurrentPlayerConfig() !== 'off') {
      curCard.classList.add('active-turn');
    }

    // Active Card in Dice Station
    this.dom.activeDiceCard.className = `dice-card ${curPlayer.id}-turn`;
    this.dom.diceTagDot.style.background = curPlayer.color;
    this.dom.diceTagDot.style.boxShadow = `0 0 8px ${curPlayer.color}`;
    this.dom.diceTagText.textContent = `${curPlayer.name}'s Turn (${isHuman ? 'Human' : 'Bot'})`;

    // Status message banner
    if (!this.waitingForMove) {
      if (isHuman) {
        this.setStatus(`<strong>${curPlayer.name}'s turn</strong> — Click the dice or press Spacebar to roll.`, curPlayer.color);
      } else {
        this.setStatus(`<strong>${curPlayer.name} (Bot)</strong> is thinking...`, curPlayer.color);
      }
    }
  }

  setStatus(msgHtml, color) {
    this.dom.statusMessage.innerHTML = msgHtml;
  }

  addLog(message) {
    const item = document.createElement('span');
    item.className = 'log-item';
    item.textContent = message;
    this.dom.logEntries.appendChild(item);
    this.dom.logEntries.scrollLeft = this.dom.logEntries.scrollWidth;
  }

  openSettingsModal() {
    PLAYERS.forEach(p => {
      const type = this.playerConfig[p.id];
      const row = document.querySelector(`.config-options[data-player="${p.id}"]`);
      if (row) {
        row.querySelectorAll('.config-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.type === type);
          btn.onclick = () => {
            row.querySelectorAll('.config-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
          };
        });
      }
    });
    this.dom.settingsModal.classList.add('show');
  }

  saveSettingsModal() {
    PLAYERS.forEach(p => {
      const row = document.querySelector(`.config-options[data-player="${p.id}"]`);
      if (row) {
        const activeBtn = row.querySelector('.config-btn.active');
        if (activeBtn) {
          this.playerConfig[p.id] = activeBtn.dataset.type;
        }
      }
    });
  }

  showVictoryModal() {
    const winnerId = this.winnerRanks[0] || 'purple';
    const winnerPlayer = this.players.find(p => p.id === winnerId);

    document.getElementById('victoryTitle').textContent = `${winnerPlayer.name} Wins!`;
    document.getElementById('victorySubtitle').textContent = `All 4 tokens successfully reached Home!`;

    const podium = document.getElementById('leaderboardPodium');
    podium.innerHTML = '';

    this.winnerRanks.forEach((pid, idx) => {
      const p = this.players.find(x => x.id === pid);
      const row = document.createElement('div');
      row.className = `podium-item ${idx === 0 ? 'first' : ''}`;
      row.innerHTML = `
        <span>${idx === 0 ? '🥇 1st Place' : idx === 1 ? '🥈 2nd Place' : '🥉 3rd Place'}</span>
        <span style="color: ${p.color};">${p.name} (${this.playerConfig[p.id] === 'human' ? 'Player' : 'Bot'})</span>
      `;
      podium.appendChild(row);
    });

    this.dom.victoryModal.classList.add('show');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
  window.ludoGame = new LudoGame();
});
