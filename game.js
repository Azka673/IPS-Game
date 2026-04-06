// ===== PLAYER.JS =====

const Player = {
  x: 200, y: 200,
  hp: 100, hunger: 100, stamina: 100,
  speed: 2.2, facing: 0,
  sprintOn: false,
  atkAnim: 0, atkCooldown: 0,

  reset() {
    this.x = 200; this.y = 200;
    this.hp = 100; this.hunger = 100; this.stamina = 100;
    this.facing = 0; this.sprintOn = false;
    this.atkAnim = 0; this.atkCooldown = 0;
  },

  update(jDx, jDy, keys) {
    let dx = jDx || 0, dy = jDy || 0;
    if (keys['ArrowLeft']  || keys['KeyA']) dx -= 1;
    if (keys['ArrowRight'] || keys['KeyD']) dx += 1;
    if (keys['ArrowUp']    || keys['KeyW']) dy -= 1;
    if (keys['ArrowDown']  || keys['KeyS']) dy += 1;

    const moving    = Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05;
    const sprinting = this.sprintOn && moving && this.stamina > 3;
    const spd       = this.speed * (sprinting ? 1.9 : 1);

    if (moving) {
      const len = Math.sqrt(dx * dx + dy * dy);
      this.x += (dx / len) * spd;
      this.y += (dy / len) * spd;
      this.facing = Math.atan2(dy, dx);
    }

    if (sprinting) this.stamina = Math.max(0,   this.stamina - 1.1);
    else           this.stamina = Math.min(100,  this.stamina + 0.5);

    this.x = Utils.clamp(this.x, 15, 985);
    this.y = Utils.clamp(this.y, 15, 985);

    if (GS.tick % 320 === 0)                      this.hunger = Math.max(0,   this.hunger - 1);
    if (this.hunger === 0 && GS.tick % 200 === 0) this.hp     = Math.max(0,   this.hp - 1);
    if (this.hunger > 60  && GS.tick % 700 === 0) this.hp     = Math.min(100, this.hp + 1);

    if (this.atkCooldown > 0) this.atkCooldown--;
    if (this.atkAnim     > 0) this.atkAnim--;

    const hpEl = document.getElementById('hpF');
    const huEl = document.getElementById('huF');
    const stEl = document.getElementById('stF');
    if (hpEl) hpEl.style.width = this.hp      + '%';
    if (huEl) huEl.style.width = this.hunger  + '%';
    if (stEl) stEl.style.width = this.stamina + '%';
  },

  attack() {
    if (this.atkCooldown > 0) return;
    this.atkCooldown = 22;
    this.atkAnim     = 15;
    _showSwordVFX();
    Utils.vibrate(25);

    const objs = World.objects;
    for (let i = 0; i < objs.length; i++) {
      const obj = objs[i];
      if (obj.hp === undefined || obj.hp < 0) continue;
      if (Utils.dist(obj.x, obj.y, this.x, this.y) < 72) {
        obj.hp--;
        World.spawnParticles(obj.x, obj.y, obj.type === 'tree' ? '#44dd88' : '#aaaaaa', 4);
        if (obj.hp <= 0) {
          if (obj.drop) Inventory.add(obj.drop.e, obj.drop.n, obj.drop.c);
          World.spawnBurst(obj.x, obj.y, obj.type === 'tree' ? '#44dd88' : '#888888');
          obj.hp = -999;
          MissionSystem.check();
        }
      }
    }

    const anims = AnimalSystem.animals;
    for (let i = 0; i < anims.length; i++) {
      const a = anims[i];
      if (a.hp < 0) continue;
      if (Utils.dist(a.x, a.y, this.x, this.y) < 60) {
        a.hp--;
        a.flee = true;
        a.fleeTimer = 120;
        World.spawnParticles(a.x, a.y, '#ff4444', 3);
        if (a.hp <= 0 && a.drop) {
          Inventory.add(a.drop.e, a.drop.n, 1);
          a.hp = -999;
        }
      }
    }
  },

  interact() {
    if (Dialog.isOpen()) { Dialog.next(); return; }

    const npcList = NPCSystem.npcs;
    for (let i = 0; i < npcList.length; i++) {
      if (Utils.dist(npcList[i].x, npcList[i].y, this.x, this.y) < 65) {
        NPCSystem.startDialog(npcList[i]);
        return;
      }
    }

    const objs = World.objects;
    for (let i = 0; i < objs.length; i++) {
      const obj = objs[i];
      if (obj.type === 'chest' && !obj.opened &&
          Utils.dist(obj.x, obj.y, this.x, this.y) < 55) {
        obj.opened = true;
        Inventory.add(obj.drop.e, obj.drop.n, obj.drop.c);
        MissionSystem.check();
        Utils.notify('📦 ' + obj.drop.n + ' ditemukan!', '#ffcc00');
        return;
      }
    }

    for (let i = 0; i < objs.length; i++) {
      const obj = objs[i];
      if (obj.type === 'dimension' &&
          Utils.dist(obj.x, obj.y, this.x, this.y) < 70) {
        Dimension.enter(obj.dimId);
        return;
      }
    }

    if (this.x > 880 && this.y > 740 && !GS.secretFound) {
      GS.secretFound = true;
      Utils.notify('🌀 Area Rahasia Ditemukan!', '#cc88ff');
      MissionSystem.check();
      return;
    }

    if (GS.quizAnswered < 10) QuizSystem.trigger();
  },
};

function _showSwordVFX() {
  const vfx = document.getElementById('swordVFX');
  if (!vfx) return;
  const cvs = document.getElementById('gc');
  vfx.style.left    = (cvs.width  / 2) + 'px';
  vfx.style.top     = (cvs.height / 2) + 'px';
  vfx.style.display = 'block';
  vfx.innerHTML     = '';

  for (let i = 0; i < 12; i++) {
    const s   = document.createElement('div');
    const ang = (i / 12) * 360;
    const len = 18 + Math.random() * 34;
    s.style.cssText =
      'position:absolute;width:3px;height:' + len + 'px;' +
      'background:linear-gradient(0deg,transparent,#00ffcc,#fff);' +
      'border-radius:2px;transform-origin:bottom center;' +
      'transform:rotate(' + ang + 'deg) translateY(-' + (len/2) + 'px);' +
      'left:-1px;top:-' + len + 'px;transition:opacity .3s;';
    vfx.appendChild(s);
  }

  const arc = document.createElement('div');
  arc.style.cssText =
    'position:absolute;width:80px;height:80px;' +
    'border:3px solid rgba(0,255,200,0.7);border-radius:50%;' +
    'top:-40px;left:-40px;animation:swordArc .25s ease-out forwards;';
  vfx.appendChild(arc);

  if (!document.getElementById('swordArcStyle')) {
    const st = document.createElement('style');
    st.id = 'swordArcStyle';
    st.textContent =
      '@keyframes swordArc{0%{transform:scale(0);opacity:1}100%{transform:scale(2.2);opacity:0}}';
    document.head.appendChild(st);
  }

  setTimeout(() => {
    vfx.querySelectorAll('div').forEach(el => el.style.opacity = '0');
  }, 110);
  setTimeout(() => {
    vfx.style.display = 'none';
    vfx.innerHTML = '';
  }, 420);
}
