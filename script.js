// ---- Scroll progress bar ----
window.addEventListener('scroll', () => {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  const bar = document.getElementById('progress-bar');
  if (bar) bar.style.width = pct + '%';
});

// ---- Smooth scrolling ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Scroll-in animations (index.html only) ----
if (document.getElementById('tw-word')) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('section').forEach(section => {
    if (!section.classList.contains('hero')) {
      section.style.opacity = '0';
      section.style.transform = 'translateY(24px)';
      section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(section);
    }
  });
}

// ---- Typewriter role rotator ----
(function () {
  const roles = ['Full-Stack Developer', 'ML Engineer', 'iOS Developer', 'Backend Engineer', 'Problem Solver'];
  let rIdx = 0, cIdx = 0, deleting = false;
  const el = document.getElementById('tw-word');
  if (!el) return;
  function tick() {
    const word = roles[rIdx];
    if (!deleting) {
      el.textContent = word.slice(0, ++cIdx);
      if (cIdx === word.length) { deleting = true; setTimeout(tick, 1800); return; }
    } else {
      el.textContent = word.slice(0, --cIdx);
      if (cIdx === 0) { deleting = false; rIdx = (rIdx + 1) % roles.length; setTimeout(tick, 400); return; }
    }
    setTimeout(tick, deleting ? 45 : 80);
  }
  tick();
})();

// ---- Terminal bio + interactive pong ----
(function () {
  const body = document.getElementById('terminal-body');
  if (!body) return;

  const bioLines = [
    { prompt: true,  text: 'cat bio.txt' },
    { html: '<span class="t-key">Name  </span>  <span class="t-val">Xerxis Palsetia</span>' },
    { html: '<span class="t-key">Role  </span>  <span class="t-val">Software Engineer @ Supermicro</span>' },
    { html: '<span class="t-key">Edu   </span>  <span class="t-val">B.S. CS \u2014 UW-Madison \u00b7 GPA 3.6</span>' },
    { html: '<span class="t-key">Stack </span>  <span class="t-val">Java \u00b7 Python \u00b7 React \u00b7 Swift \u00b7 Kotlin</span>' },
    { html: '<span class="t-key">Cloud </span>  <span class="t-val">AWS \u00b7 GCP \u00b7 Azure \u00b7 Docker \u00b7 K8s</span>' },
    { html: '<span class="t-comment"># Quick learner. Builder. Always shipping.</span>' },
    { blank: true },
    { prompt: true,  text: 'echo $AVAILABILITY' },
    { html: '<span class="t-val">Open to new &amp; interesting opportunities \u2713</span>' },
  ];

  // Shared mutable state
  let bioI = 0, bioCh = 0, bioCmdEl = null, bioCursorEl = null;
  let inputActive = false, inputText = '', inputCmdEl = null, inputCursorEl = null;
  let pongRunning = false, pongAF = null;
  const pongKeys = {};

  /* ---- BIO SEQUENCE ---- */
  function runBio() {
    body.innerHTML = '';
    body.style.padding = '';
    body.style.minHeight = '';
    bioI = 0; bioCh = 0; bioCmdEl = null; bioCursorEl = null;
    bioStep();
  }

  function bioStep() {
    if (bioI >= bioLines.length) {
      // Hint line then enable input
      const hint = document.createElement('span');
      hint.className = 't-line t-comment';
      hint.style.marginTop = '4px';
      hint.textContent = '# type anything and press enter\u2026';
      body.appendChild(hint);
      setTimeout(enableInput, 350);
      return;
    }
    const entry = bioLines[bioI];
    if (entry.blank) {
      const bl = document.createElement('span'); bl.className = 't-line'; bl.innerHTML = '&nbsp;';
      body.appendChild(bl); bioI++; setTimeout(bioStep, 150); return;
    }
    if (!entry.prompt) {
      const ol = document.createElement('span'); ol.className = 't-line'; ol.innerHTML = entry.html;
      body.appendChild(ol); bioI++; setTimeout(bioStep, 110); return;
    }
    if (bioCh === 0) {
      const row = document.createElement('span'); row.className = 't-line';
      row.innerHTML = '<span class="t-prompt">$ </span>';
      bioCmdEl = document.createElement('span'); bioCmdEl.className = 't-cmd';
      bioCursorEl = document.createElement('span'); bioCursorEl.className = 't-cursor-inline';
      row.appendChild(bioCmdEl); row.appendChild(bioCursorEl);
      body.appendChild(row);
    }
    if (bioCh < entry.text.length) { bioCmdEl.textContent += entry.text[bioCh++]; setTimeout(bioStep, 65); return; }
    bioCursorEl.remove(); bioCh = 0; bioI++; setTimeout(bioStep, 320);
  }

  /* ---- INPUT MODE ---- */
  function enableInput() {
    inputActive = true; inputText = '';
    const row = document.createElement('span'); row.className = 't-line';
    row.innerHTML = '<span class="t-prompt">$ </span>';
    inputCmdEl = document.createElement('span'); inputCmdEl.className = 't-cmd';
    inputCursorEl = document.createElement('span'); inputCursorEl.className = 't-cursor-inline';
    row.appendChild(inputCmdEl); row.appendChild(inputCursorEl);
    body.appendChild(row);
    document.addEventListener('keydown', handleTermInput);
  }

  function handleTermInput(e) {
    if (!inputActive) return;
    if (e.key === 'Enter') {
      inputActive = false;
      document.removeEventListener('keydown', handleTermInput);
      if (inputCursorEl) inputCursorEl.remove();
      setTimeout(startPong, 180);
    } else if (e.key === 'Backspace') {
      inputText = inputText.slice(0, -1);
      if (inputCmdEl) inputCmdEl.textContent = inputText;
      e.preventDefault();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      inputText += e.key;
      if (inputCmdEl) inputCmdEl.textContent = inputText;
    }
  }

  /* ---- PONG ---- */
  function startPong() {
    const W = body.offsetWidth || 580;
    const H = 240;
    body.innerHTML = '';
    body.style.padding = '0';
    body.style.minHeight = H + 'px';

    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.style.display = 'block';
    body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const G = '#57ab5a', DIM = 'rgba(87,171,90,0.28)';
    const PAD_W = 8, PAD_H = 46, BALL_R = 5, EDGE = 14;

    let playerY = H / 2 - PAD_H / 2;
    let cpuY    = H / 2 - PAD_H / 2;
    let ball    = { x: W / 2, y: H / 2, dx: 3.5, dy: 2 };
    let score   = { p: 0, c: 0 };
    let phase   = 'intro'; // intro | play | gameover

    function resetBall(dir) {
      ball.x = W / 2; ball.y = H / 2;
      ball.dx = 3.5 * dir;
      ball.dy = (Math.random() * 2 - 1) * 2.5;
    }

    function txt(t, x, y, size, color, align) {
      ctx.fillStyle = color || G;
      ctx.font = (size || 13) + 'px "Courier New",monospace';
      ctx.textAlign = align || 'center';
      ctx.fillText(t, x, y);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // dashed center line
      ctx.strokeStyle = DIM; ctx.setLineDash([4, 8]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
      ctx.setLineDash([]);
      // score
      txt(score.p, W / 2 - 30, 20, 15, G);
      txt(':', W / 2, 20, 15, DIM);
      txt(score.c, W / 2 + 30, 20, 15, G);
      // paddles & ball
      ctx.fillStyle = G;
      ctx.fillRect(EDGE, playerY, PAD_W, PAD_H);
      ctx.fillRect(W - EDGE - PAD_W, cpuY, PAD_W, PAD_H);
      ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2); ctx.fill();

      if (phase === 'intro') {
        ctx.fillStyle = 'rgba(13,17,23,0.75)';
        ctx.fillRect(0, H / 2 - 42, W, 84);
        txt('PONG', W / 2, H / 2 - 14, 22, G);
        txt('W / S  or  \u2191 / \u2193 to move', W / 2, H / 2 + 8, 11, DIM);
        txt('press any key to start  \u00b7  Q to quit', W / 2, H / 2 + 26, 11, G);
      }
      if (phase === 'gameover') {
        ctx.fillStyle = 'rgba(13,17,23,0.8)';
        ctx.fillRect(0, H / 2 - 46, W, 92);
        txt(score.p >= 5 ? 'YOU WIN' : 'CPU WINS', W / 2, H / 2 - 16, 20, G);
        txt(score.p + '  :  ' + score.c, W / 2, H / 2 + 6, 14, G);
        txt('R \u2014 play again   \u00b7   Q \u2014 exit', W / 2, H / 2 + 28, 11, DIM);
      }
    }

    function update() {
      if (phase !== 'play') return;
      const PSPD = 5;
      if (pongKeys['ArrowUp']   || pongKeys['w'] || pongKeys['W']) playerY = Math.max(0, playerY - PSPD);
      if (pongKeys['ArrowDown'] || pongKeys['s'] || pongKeys['S']) playerY = Math.min(H - PAD_H, playerY + PSPD);

      // CPU follows ball
      const cc = cpuY + PAD_H / 2;
      if (cc < ball.y - 2) cpuY = Math.min(H - PAD_H, cpuY + 3.8);
      else if (cc > ball.y + 2) cpuY = Math.max(0, cpuY - 3.8);

      ball.x += ball.dx; ball.y += ball.dy;

      // wall bounce
      if (ball.y - BALL_R < 0)  { ball.y = BALL_R;     ball.dy =  Math.abs(ball.dy); }
      if (ball.y + BALL_R > H)  { ball.y = H - BALL_R; ball.dy = -Math.abs(ball.dy); }

      // player paddle
      if (ball.dx < 0 && ball.x - BALL_R < EDGE + PAD_W && ball.x - BALL_R > EDGE
          && ball.y >= playerY && ball.y <= playerY + PAD_H) {
        ball.dx = Math.abs(ball.dx) * 1.05;
        ball.dy += (ball.y - (playerY + PAD_H / 2)) * 0.14;
        ball.x = EDGE + PAD_W + BALL_R;
      }
      // cpu paddle
      const cpuX = W - EDGE - PAD_W;
      if (ball.dx > 0 && ball.x + BALL_R > cpuX && ball.x + BALL_R < W - EDGE
          && ball.y >= cpuY && ball.y <= cpuY + PAD_H) {
        ball.dx = -Math.abs(ball.dx) * 1.05;
        ball.dy += (ball.y - (cpuY + PAD_H / 2)) * 0.14;
        ball.x = cpuX - BALL_R;
      }
      // speed cap
      const spd = Math.hypot(ball.dx, ball.dy);
      if (spd > 11) { ball.dx *= 11 / spd; ball.dy *= 11 / spd; }

      // scoring
      if (ball.x < 0)  { score.c++; if (score.c >= 5) { phase = 'gameover'; return; } resetBall(1); }
      if (ball.x > W)  { score.p++; if (score.p >= 5) { phase = 'gameover'; return; } resetBall(-1); }
    }

    pongRunning = true;
    resetBall(1);
    draw();

    function loop() {
      if (!pongRunning) return;
      update(); draw();
      pongAF = requestAnimationFrame(loop);
    }

    function onPongKey(e) {
      const down = e.type === 'keydown';
      pongKeys[e.key] = down;
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
      if (!down) return;

      if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape') {
        pongRunning = false;
        cancelAnimationFrame(pongAF);
        document.removeEventListener('keydown', onPongKey);
        document.removeEventListener('keyup',   onPongKey);
        for (const k in pongKeys) delete pongKeys[k];
        runBio();
        return;
      }
      if (phase === 'intro') {
        phase = 'play'; loop();
      } else if (phase === 'gameover' && (e.key === 'r' || e.key === 'R')) {
        score.p = 0; score.c = 0;
        playerY = H / 2 - PAD_H / 2; cpuY = H / 2 - PAD_H / 2;
        resetBall(1); phase = 'intro'; draw();
      }
    }

    document.addEventListener('keydown', onPongKey);
    document.addEventListener('keyup',   onPongKey);
  }

  runBio();
})();

// ---- 3D tilt cards ----
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale3d(1.03,1.03,1.03)`;
    card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    card.style.setProperty('--my', `${((e.clientY - r.top)  / r.height) * 100}%`);
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
  });
});

// ---- Spotlight cards ----
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--sx', `${e.clientX - r.left}px`);
    card.style.setProperty('--sy', `${e.clientY - r.top}px`);
  });
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--sx', '-999px');
    card.style.setProperty('--sy', '-999px');
  });
});
