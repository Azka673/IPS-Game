// ===== UTILS.JS =====
// Shared utility functions used across all modules

const Utils = {
  // Euclidean distance
  dist(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  },

  // Shuffle array (Fisher-Yates)
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  // Clamp number
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  // Linear interpolation
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  // Show notification
  _notifTimer: null,
  notify(msg, color = '#00ffcc') {
    const el = document.getElementById('notif');
    el.textContent = msg;
    el.style.borderColor = color;
    el.style.color = color;
    el.style.display = 'block';
    el.style.animation = 'none';
    setTimeout(() => { el.style.animation = 'notifIn .2s ease-out'; }, 10);
    if (this._notifTimer) clearTimeout(this._notifTimer);
    this._notifTimer = setTimeout(() => { el.style.display = 'none'; }, 2800);
  },

  // Eat animation
  showEatAnim(emoji, txt) {
    const el  = document.getElementById('eatAnim');
    const ee  = document.getElementById('eatEmoji');
    const et  = document.getElementById('eatTxt');
    ee.textContent = emoji;
    et.textContent = txt;
    el.style.display = 'block';
    ee.style.animation = 'none';
    setTimeout(() => { ee.style.animation = 'eatPop .6s ease-out forwards'; }, 10);
    setTimeout(() => { el.style.display = 'none'; }, 2100);
  },

  // Haptic feedback (mobile)
  vibrate(pattern = 30) {
    if (navigator.vibrate && document.getElementById('togVib')?.classList.contains('on')) {
      navigator.vibrate(pattern);
    }
  },

  // Random int in range [min, max)
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  // Random float in range
  randFloat(min, max) {
    return Math.random() * (max - min) + min;
  },

  // Angle from point a to point b
  angleTo(ax, ay, bx, by) {
    return Math.atan2(by - ay, bx - ax);
  },

  // Format big number
  fmt(n) {
    return n.toLocaleString('id-ID');
  }
};

// Global state object shared by all modules
const GS = {
  started:     false,
  paused:      false,
  tick:        0,
  score:       0,
  quizAnswered:0,
  quizCorrect: 0,
  quizAsked:   [],
  missionsDone:0,
  secretFound: false,
  inDimension: false,
  dimLevel:    0,   // which dimension we're in (0=none, 1=paleolith, 2=neolith)
  dimQuizDone: false,
  endingType:  null,
};
