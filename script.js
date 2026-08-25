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
  const roles = ['Full-Stack Developer', 'HPC Engineer', 'ML Engineer', 'Backend Engineer', 'Problem Solver'];
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

// ---- Terminal bio + xsh mini shell (commands, pong, matrix) ----
(function () {
  const body = document.getElementById('terminal-body');
  if (!body) return;

  const bioLines = [
    { prompt: true,  text: 'cat bio.txt' },
    { html: '<span class="t-key">Name  </span>  <span class="t-val">Xerxis Palsetia</span>' },
    { html: '<span class="t-key">Role  </span>  <span class="t-val">Software Engineer L2 @ Supermicro</span>' },
    { html: '<span class="t-key">Edu   </span>  <span class="t-val">B.S. CS @ UW-Madison \u00b7 GPA 3.6</span>' },
    { html: '<span class="t-key">Stack </span>  <span class="t-val">Python \u00b7 FastAPI \u00b7 React \u00b7 MongoDB \u00b7 LangChain</span>' },
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
  const history = [];
  let histIdx = 0;

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
      hint.textContent = '# type `help` to see what this shell can do\u2026';
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

  /* ---- OUTPUT HELPERS ---- */
  function print(html, cls) {
    const line = document.createElement('span');
    line.className = 't-line' + (cls ? ' ' + cls : '');
    line.innerHTML = html === '' ? '&nbsp;' : html;
    body.appendChild(line);
    return line;
  }
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function kv(key, val) {
    return '<span class="t-key">' + key.padEnd(10) + '</span><span class="t-val">' + val + '</span>';
  }
  function scrollDown() { body.scrollTop = body.scrollHeight; }

  /* ---- INPUT MODE ---- */
  function enableInput() {
    inputActive = true; inputText = ''; histIdx = history.length;
    const row = document.createElement('span'); row.className = 't-line';
    row.innerHTML = '<span class="t-prompt">$ </span>';
    inputCmdEl = document.createElement('span'); inputCmdEl.className = 't-cmd';
    inputCursorEl = document.createElement('span'); inputCursorEl.className = 't-cursor-inline';
    row.appendChild(inputCmdEl); row.appendChild(inputCursorEl);
    body.appendChild(row);
    scrollDown();
    document.addEventListener('keydown', handleTermInput);
  }

  function endInput() {
    inputActive = false;
    document.removeEventListener('keydown', handleTermInput);
    if (inputCursorEl) inputCursorEl.remove();
  }

  // Keystrokes only reach the shell while the terminal is actually on screen,
  // so arrow keys still scroll the page everywhere else.
  function termVisible() {
    const win = body.closest('.terminal-window') || body;
    const r = win.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  function handleTermInput(e) {
    if (!inputActive || !termVisible()) return;
    if (e.key === 'Enter') {
      const raw = inputText.trim();
      endInput();
      if (raw) { history.push(raw); histIdx = history.length; }
      runCommand(raw);
    } else if (e.key === 'Backspace') {
      inputText = inputText.slice(0, -1);
      if (inputCmdEl) inputCmdEl.textContent = inputText;
      e.preventDefault();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (!history.length) return;
      e.preventDefault();
      histIdx += e.key === 'ArrowUp' ? -1 : 1;
      histIdx = Math.max(0, Math.min(history.length, histIdx));
      inputText = histIdx === history.length ? '' : history[histIdx];
      if (inputCmdEl) inputCmdEl.textContent = inputText;
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const matches = Object.keys(commands).filter(c => c.startsWith(inputText) && inputText);
      if (matches.length === 1) {
        inputText = matches[0];
        if (inputCmdEl) inputCmdEl.textContent = inputText;
      }
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      inputText += e.key;
      if (inputCmdEl) inputCmdEl.textContent = inputText;
    }
  }

  /* ---- COMMANDS ---- */
  function goTo(sel) {
    const target = document.querySelector(sel);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const commands = {
    help() {
      print('<span class="t-comment">Available commands:</span>');
      [
        ['help',       'show this list'],
        ['whoami',     'who is Xerxis'],
        ['skills',     'languages, frameworks, tools'],
        ['experience', 'where I have worked'],
        ['projects',   'things I have built'],
        ['contact',    'how to reach me'],
        ['resume',     'open the full resume'],
        ['neofetch',   'system info, portfolio edition'],
        ['pong',       'play pong in this terminal'],
        ['matrix',     'follow the white rabbit'],
        ['history',    'previous commands'],
        ['clear',      'clear the screen'],
      ].forEach(([c, d]) => print('<span class="t-cmd">' + c.padEnd(12) + '</span><span class="t-val">' + d + '</span>'));
      print('<span class="t-comment"># \u2191/\u2193 for history, Tab to complete</span>');
    },
    whoami() {
      print(kv('name', 'Xerxis Palsetia'));
      print(kv('role', 'Software Engineer L2 @ Supermicro'));
      print(kv('focus', 'L12 cluster testing, L10 on-site appliances, GPU validation'));
      print(kv('edu', 'B.S. Computer Science \u2014 UW-Madison, GPA 3.6'));
      print(kv('orgs', 'Badger Blockchain (VP of Tech), Wisconsin Racing'));
    },
    skills() {
      print(kv('languages', 'Python, Java, Swift, C, Kotlin, JS/TS, Bash, SQL, R'));
      print(kv('backend', 'FastAPI, Flask, Node.js, Spring Boot'));
      print(kv('frontend', 'React, React Native, iOS, Android'));
      print(kv('data', 'MongoDB, Postgres, MySQL, Firebase'));
      print(kv('ai', 'Ollama, LangChain, ChromaDB'));
      print(kv('infra', 'Docker, Kubernetes, Ansible, Linux, AWS/GCP/Azure'));
    },
    experience() {
      print('<span class="t-cmd">Supermicro</span> <span class="t-comment">\u2014 Software Engineer L2 \u00b7 Aug 2026 \u2013 Present</span>');
      print('<span class="t-val">  L12 cluster testing tool \u00b7 L10 on-site testing appliance to cut RMA timelines</span>');
      print('<span class="t-cmd">Supermicro</span> <span class="t-comment">\u2014 Software Engineer \u00b7 Aug 2025 \u2013 Aug 2026</span>');
      print('<span class="t-val">  Argus Cluster Monitor \u00b7 30x faster deployments \u00b7 50MW GB300 field validation</span>');
      print('<span class="t-cmd">Cequence Security</span> <span class="t-comment">\u2014 Engineering Intern \u00b7 Jun \u2013 Sep 2023</span>');
      print('<span class="t-val">  Discovery Feature (+30% efficiency) \u00b7 Spring Boot / Kotlin API \u00b7 80% coverage</span>');
      print('<span class="t-cmd">Coding For Tomorrow</span> <span class="t-comment">\u2014 Founder / Instructor \u00b7 2020 \u2013 2022</span>');
      print('<span class="t-val">  Taught Scratch, Python, and Java to younger students</span>');
      print('<span class="t-comment"># scrolling to the experience section\u2026</span>');
      goTo('#experience');
    },
    projects() {
      print('<span class="t-cmd">argus</span>      <span class="t-val">GPU cluster validation platform (work)</span>');
      print('<span class="t-cmd">unigpu</span>     <span class="t-val">Local GPU orchestration across NVIDIA + AMD</span>');
      print('<span class="t-cmd">markov</span>     <span class="t-val">S&amp;P 500 prediction with k-order Markov chains</span>');
      print('<span class="t-cmd">prem</span>       <span class="t-val">Premier League match outcome predictor</span>');
      print('<span class="t-cmd">ridethebus</span> <span class="t-val">Browser card game</span>');
      print('<span class="t-comment"># scrolling to the projects section\u2026</span>');
      goTo('#projects');
    },
    contact() {
      print(kv('email', 'xerxis.palsetia@gmail.com'));
      print(kv('linkedin', 'linkedin.com/in/xpalsetia'));
      print(kv('github', 'github.com/xpalsetia'));
      goTo('#contact');
    },
    resume() {
      print('<span class="t-comment"># opening resume\u2026</span>');
      setTimeout(() => { window.location.href = 'resume.html'; }, 500);
    },
    neofetch() {
      const art = [
        '   __  __ ____  ',
        '   \\ \\/ /|  _ \\ ',
        '    \\  / | |_) |',
        '    /  \\ |  __/ ',
        '   /_/\\_\\|_|    ',
      ];
      const info = [
        ['xerxis', '@portfolio'],
        ['os', 'Portfolio OS 2.0'],
        ['shell', 'xsh 1.0'],
        ['uptime', 'shipping since 2020'],
        ['role', 'SWE L2 @ Supermicro'],
        ['langs', 'Python, Java, TS, Swift'],
        ['games', 'run `pong`'],
      ];
      const rows = Math.max(art.length, info.length);
      for (let i = 0; i < rows; i++) {
        const a = '<span class="t-prompt">' + esc((art[i] || '').padEnd(17)) + '</span>';
        const inf = info[i]
          ? (i === 0
              ? '<span class="t-cmd">' + info[i][0] + '</span><span class="t-val">' + info[i][1] + '</span>'
              : '<span class="t-key">' + info[i][0].padEnd(8) + '</span><span class="t-val">' + info[i][1] + '</span>')
          : '';
        print(a + inf);
      }
    },
    history() {
      if (!history.length) { print('<span class="t-comment"># no history yet</span>'); return; }
      history.forEach((h, i) => print('<span class="t-comment">' + String(i + 1).padStart(3) + '</span>  <span class="t-cmd">' + esc(h) + '</span>'));
    },
    clear() {
      body.innerHTML = '';
      return 'skip-prompt-reset';
    },
    pong() { startPong(); return 'takeover'; },
    matrix() { startMatrix(); return 'takeover'; },
  };

  const aliases = { ls: 'help', '?': 'help', man: 'help', about: 'whoami', me: 'whoami',
                    work: 'experience', jobs: 'experience', cv: 'resume', email: 'contact',
                    stack: 'skills', cls: 'clear' };

  function runCommand(raw) {
    const name = raw.split(/\s+/)[0].toLowerCase();
    if (!name) { enableInput(); return; }

    if (name === 'sudo') {
      print('<span class="t-comment">nice try \u2014 you are not in the sudoers file.</span>');
      enableInput(); scrollDown(); return;
    }
    if (name === 'exit' || name === 'quit') {
      print('<span class="t-comment"># there is no escape. try `help`.</span>');
      enableInput(); scrollDown(); return;
    }

    const fn = commands[name] || commands[aliases[name]];
    if (!fn) {
      print('<span class="t-val">xsh: command not found: ' + esc(name) + '</span>');
      print('<span class="t-comment"># type `help` for the list</span>');
      enableInput(); scrollDown(); return;
    }

    const result = fn();
    if (result === 'takeover') return;
    enableInput();
    scrollDown();
  }

  /* ---- MATRIX RAIN ---- */
  function startMatrix() {
    const H = 240;
    body.innerHTML = '';
    body.style.padding = '0';
    body.style.minHeight = H + 'px';
    const W = body.clientWidth || 580;

    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.style.display = 'block';
    body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const chars = 'アイウエオカキクケコｱｲｳ0123456789XPXERXIS'.split('');
    const fontSize = 13;
    const cols = Math.floor(W / fontSize);
    const drops = new Array(cols).fill(0).map(() => Math.random() * -20);
    let af = null, running = true;

    function frame() {
      if (!running) return;
      ctx.fillStyle = 'rgba(13,17,23,0.12)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = fontSize + 'px "Courier New",monospace';
      for (let i = 0; i < cols; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        const y = drops[i] * fontSize;
        ctx.fillStyle = y > 0 && Math.random() > 0.94 ? '#aff5b4' : '#57ab5a';
        ctx.fillText(ch, i * fontSize, y);
        if (y > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      af = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(af);
      document.removeEventListener('keydown', onKey);
      exitToShell('# back to xsh \u2014 type `help` for commands');
    }
    function onKey(e) {
      if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape' || e.key === 'Enter') stop();
    }

    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);
    frame();
    document.addEventListener('keydown', onKey);
    setTimeout(() => { if (running) stop(); }, 7000);
  }

  /* ---- RETURN TO SHELL ---- */
  function exitToShell(msg) {
    body.innerHTML = '';
    body.style.padding = '';
    body.style.minHeight = '';
    if (msg) print('<span class="t-comment">' + msg + '</span>');
    enableInput();
  }

  /* ---- PONG ---- */
  function startPong() {
    const H = 240;
    body.innerHTML = '';
    body.style.padding = '0';
    body.style.minHeight = H + 'px';
    const W = body.clientWidth || 580;

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
        exitToShell('# back to xsh \u2014 type `help` for commands');
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

// ---- Expandable experience timeline ----
document.querySelectorAll('.timeline-item.is-expandable .timeline-toggle').forEach(btn => {
  const toggle = () => {
    const item = btn.closest('.timeline-item');
    const open = item.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  };
  btn.addEventListener('click', toggle);
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
});

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
