/* =========================================================================
   main.js — semua animasi & interaksi portofolio (tanpa library tambahan)

   Daftar isi:
   0.  Utilitas & pengaturan
   1.  Smooth scroll (gulir halus untuk mouse/trackpad)
   2.  Pecah teks (judul & tulisan sambutan huruf per huruf) & paragraf "tinta"
   3.  Pembuka: tombol masuk → tinta dituang (backsound aurora) → hero (sapaan suara)
   4.  Animasi saat elemen terlihat (IntersectionObserver)
   5.  Efek yang mengikuti posisi gulir (satu loop requestAnimationFrame)
   5b. Hero: animasi benang WebThreads (React Bits)
   6.  Header, menu "tabel periodik", tautan jangkar
   7.  Kursor kontekstual, tombol magnetis, kemiringan 3D
   8.  Foto profil berubah menjadi rumus kimia
   9.  Lightbox (penampil foto)
   10. Galeri yang bisa digeser (drag)
   11. Pratinjau sertifikat yang mengikuti kursor
   12. Dialog detail proyek
   13. Salin email + toast
   14. Mulai!
   ========================================================================= */
(() => {
  'use strict';

  // ---------- 0. Utilitas & pengaturan ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const root = document.documentElement;

  // false = animasi SELALU jalan, walau "Animation effects" Windows dimatikan.
  // Ubah ke true bila ingin mengikuti pengaturan "kurangi gerakan" pengunjung.
  const IKUTI_KURANGI_GERAKAN = false;
  const reduced = IKUTI_KURANGI_GERAKAN && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mqPin = window.matchMedia('(min-width: 1024px) and (min-height: 640px)');
  const mqNarrow = window.matchMedia('(max-width: 1023px)');   // HP & tablet (hero bertumpuk)

  // Kunci/buka gulir halaman (dipakai menu, lightbox, dialog)
  let scrollLocks = 0;
  function lockScroll() { scrollLocks++; root.style.overflow = 'hidden'; smooth.lock(); }
  function unlockScroll() {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (!scrollLocks) { root.style.overflow = ''; smooth.unlock(); }
  }

  // ---------- 1. Smooth scroll ----------
  // Cara kerja: roda mouse tidak langsung menggulir, tapi menggeser "target".
  // Setiap frame, posisi sekarang mendekati target sedikit demi sedikit (lerp).
  const smooth = (() => {
    const enabled = !reduced && finePointer;
    let current = window.scrollY;
    let target = current;
    let running = false;
    let locked = false;
    let tween = null;
    const maxScroll = () => root.scrollHeight - window.innerHeight;
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function frame(now) {
      if (tween) {
        const t = clamp((now - tween.start) / tween.duration, 0, 1);
        current = lerp(tween.from, tween.to, easeInOutCubic(t));
        target = current;
        if (t >= 1) tween = null;
      } else {
        current = lerp(current, target, 0.1);
        if (Math.abs(target - current) < 0.5) current = target;
      }
      window.scrollTo(0, current);
      if (tween || current !== target) requestAnimationFrame(frame);
      else running = false;
    }
    function run() {
      if (!running) { running = true; requestAnimationFrame(frame); }
    }

    if (enabled) {
      root.classList.add('has-smooth-scroll');
      window.addEventListener('wheel', (e) => {
        if (locked || e.ctrlKey) return;                                   // ctrl+roda = zoom
        if (e.target.closest('dialog, .lightbox')) return;                 // biarkan elemen ini menggulir sendiri
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;               // geser horizontal (trackpad)
        e.preventDefault();
        tween = null;
        let delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 40;                                // satuan baris
        else if (e.deltaMode === 2) delta *= window.innerHeight;           // satuan halaman
        target = clamp(target + delta, 0, maxScroll());
        run();
      }, { passive: false });

      // Sinkronkan bila halaman digulir dengan cara lain (keyboard, scrollbar)
      window.addEventListener('scroll', () => {
        if (!running) { current = window.scrollY; target = current; }
      }, { passive: true });
    }

    return {
      enabled,
      to(y) {
        y = clamp(y, 0, maxScroll());
        if (!enabled) {
          window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
          return;
        }
        const distance = Math.abs(y - window.scrollY);
        tween = { from: window.scrollY, to: y, start: performance.now(), duration: clamp(distance * 0.35, 600, 1600) };
        current = window.scrollY;
        run();
      },
      lock() { locked = true; tween = null; current = target = window.scrollY; },
      unlock() { locked = false; current = target = window.scrollY; },
    };
  })();

  // ---------- 2. Pecah teks & paragraf tinta ----------
  // Mengubah "Keahlian" menjadi <span class="w"><span class="c">K</span>...</span>
  // supaya setiap huruf bisa dianimasikan. Teks asli tetap dibaca pembaca layar lewat aria-label.
  function splitChars(el) {
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    const words = text.split(' ');
    let index = 0;
    el.textContent = '';
    if (!el.hasAttribute('aria-hidden')) el.setAttribute('aria-label', text);
    words.forEach((word, wi) => {
      const w = document.createElement('span');
      w.className = 'w';
      w.setAttribute('aria-hidden', 'true');
      for (const ch of word) {
        const c = document.createElement('span');
        c.className = 'c';
        c.textContent = ch;
        c.style.setProperty('--i', index++);
        w.appendChild(c);
      }
      el.appendChild(w);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }

  // Tulisan sambutan hero: dipecah per huruf, tetapi pembungkus seperti <span class="hero__wave"> tetap ada.
  // --i = urutan huruf di tiap baris (animasi masuk), --wi = urutan kata di kedua baris (efek menyala).
  function splitHeadline() {
    let wi = 0;
    $$('.hero__headline .hero__fit').forEach((line) => {
      let i = 0;
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((node) => {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'w';
          w.style.setProperty('--wi', wi++);
          for (const ch of part) {
            const c = document.createElement('span');
            c.className = 'c';
            c.textContent = ch;
            c.style.setProperty('--i', i++);
            w.appendChild(c);
          }
          frag.appendChild(w);
        });
        node.replaceWith(frag);
      });
    });
  }

  // Paragraf "tinta": kata-kata menyala satu per satu mengikuti gulir.
  function setupInk(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const span = document.createElement('span');
        span.className = 'ink-w';
        span.textContent = part;
        frag.appendChild(span);
      });
      node.replaceWith(frag);
    });
    const words = $$('.ink-w', el);
    const marks = $$('mark', el).map((m) => {
      const inside = $$('.ink-w', m);
      return { el: m, last: words.indexOf(inside[inside.length - 1]) };
    });
    return { el, words, marks, lit: 0 };
  }

  function updateInk(ink, vh) {
    const r = ink.el.getBoundingClientRect();
    // mulai saat paragraf masuk 85% tinggi layar, selesai saat bagian bawahnya di 60%
    const start = vh * 0.85;
    const progress = clamp((start - r.top) / (vh * 0.25 + r.height), 0, 1);
    const lit = Math.round(progress * ink.words.length);
    if (lit === ink.lit) return;
    const [from, to] = lit > ink.lit ? [ink.lit, lit] : [lit, ink.lit];
    for (let i = from; i < to; i++) ink.words[i].classList.toggle('is-lit', i < lit);
    ink.marks.forEach((m) => m.el.classList.toggle('is-marked', lit > m.last));
    ink.lit = lit;
  }

  // ---------- 3. Pembuka: tombol masuk → tinta dituang (+ backsound) → hero (+ sapaan suara) ----------
  // Tampil SETIAP kali halaman dibuka atau dimuat ulang.
  // Browser (Chrome, Edge, Safari, …) MELARANG halaman memutar suara sebelum pengunjung mengklik
  // sesuatu. Karena itu pembuka diawali tombol "Masuk ke portofolio": klik itu sekaligus izin suara.
  // Urutan: klik Masuk → tetesan mengisi labu + backsound "aurora" → cairan merah muda (titik akhir,
  // tepat di puncak suara aurora) → merah muda membanjiri layar → surut ke bawah membuka hero →
  // suara "Hello, welcome to my portfolio" sambil tulisan sambutan menyala kata demi kata.
  const PRELOADER = {
    MIN: 1400,            // lama minimum tinta dituang bila masuk TANPA suara (milidetik)
    MIN_BERSUARA: 2000,   // lama tinta dituang bila bersuara: titik akhir jatuh di puncak backsound aurora
    HOLD: 550,            // lama berhenti di "titik akhir" (cairan merah muda)
    FLOOD: 500,           // lama merah muda menyebar memenuhi layar
    MAX: 4500,            // batas maksimum menunggu foto & font walau internet lambat
  };

  // Pengaturan suara (boleh diubah)
  const SUARA = {
    LATAR: 'assets/audio/aurora.mp3',          // backsound saat tinta dituang (React Bits Sound Lab: "aurora")
    VOLUME_LATAR: 0.9,                          // 0 = senyap … 1 = penuh
    KALIMAT: 'Hello, welcome to my portfolio',  // diucapkan suara browser saat hero muncul
    BAHASA: 'en-US',                            // logat: 'en-US' (Amerika) atau 'en-GB' (Inggris)
    KECEPATAN: 0.95,                            // 0.5 lambat … 1.5 cepat
    NADA: 1.05,                                 // 0 berat … 2 tinggi
    REKAMAN: '',                                // opsional: 'assets/audio/welcome.mp3' = pakai rekaman suaramu sendiri
  };

  // Pemutar suara. Backsound memakai <audio>. Sapaan memakai suara bawaan browser (Web Speech API),
  // atau file rekaman bila SUARA.REKAMAN diisi. Semua aman diabaikan bila browser tidak mendukung.
  const sound = (() => {
    let on = false;
    let utterance = null;   // disimpan agar tidak "dibuang" browser sebelum selesai bicara (bug Chrome)
    const makeAudio = (src) => {
      if (!src) return null;
      const audio = new Audio(src);
      audio.preload = 'auto';   // diunduh sejak awal supaya langsung bunyi saat tombol diklik
      return audio;
    };
    const latar = makeAudio(SUARA.LATAR);
    const rekaman = makeAudio(SUARA.REKAMAN);
    const tts = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window ? window.speechSynthesis : null;

    // daftar suara bawaan dimuat browser secara bertahap
    let voices = [];
    const loadVoices = () => { try { voices = tts.getVoices(); } catch (e) { voices = []; } };
    if (tts) {
      loadVoices();
      if (tts.addEventListener) tts.addEventListener('voiceschanged', loadVoices);
      else tts.onvoiceschanged = loadVoices;
    }

    // suara favorit (paling natural lebih dulu): Edge, Chrome, iPhone/Mac, Windows
    const FAVORIT = [/aria.*natural/i, /jenny.*natural/i, /ava.*natural/i, /emma.*natural/i, /google us english/i,
      /samantha/i, /google uk english female/i, /zira/i, /female/i];
    function pickVoice(localOnly) {
      const lang = SUARA.BAHASA.slice(0, 2).toLowerCase();
      const pool = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(lang) && (!localOnly || v.localService));
      for (const re of FAVORIT) {
        const v = pool.find((x) => re.test(x.name));
        if (v) return v;
      }
      const exact = SUARA.BAHASA.toLowerCase();
      return pool.find((v) => v.lang.toLowerCase().replace('_', '-') === exact) || pool[0] || null;
    }

    function fade(audio, to, ms, done) {
      const from = audio.volume;
      const start = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - start) / ms);
        try { audio.volume = from + (to - from) * k; } catch (e) { /* iPhone: volume tidak bisa diatur */ }
        if (k < 1) requestAnimationFrame(step);
        else if (done) done();
      };
      requestAnimationFrame(step);
    }

    function speak(onStart, localOnly) {
      if (!tts || !SUARA.KALIMAT) return false;
      if (!voices.length) loadVoices();
      const u = new SpeechSynthesisUtterance(SUARA.KALIMAT);
      const voice = pickVoice(localOnly);
      if (voice) u.voice = voice;
      u.lang = voice ? voice.lang : SUARA.BAHASA;
      u.rate = SUARA.KECEPATAN;
      u.pitch = SUARA.NADA;
      u.volume = 1;
      let started = false;
      let retried = localOnly || !voice || voice.localService;
      // suara online (mis. "Google US English") kadang gagal saat internet lambat → ulangi dengan suara bawaan perangkat
      const retry = () => {
        if (started || retried) return;
        retried = true;
        tts.cancel();
        setTimeout(() => speak(onStart, true), 80);
      };
      u.onstart = () => { started = true; if (onStart) onStart(); };
      u.onerror = retry;
      setTimeout(retry, 2500);
      utterance = u;
      if (tts.speaking || tts.pending) tts.cancel();
      setTimeout(() => tts.speak(utterance), 50);
      return true;
    }

    return {
      get on() { return on; },
      // Dipanggil LANGSUNG di dalam klik tombol Masuk: membuka izin suara & memutar backsound
      start() {
        on = true;
        if (latar) {
          latar.volume = SUARA.VOLUME_LATAR;
          latar.currentTime = 0;
          const p = latar.play();
          if (p && p.catch) p.catch(() => {});
        }
        if (rekaman) {
          // iPhone: rekaman harus "dipancing" di dalam klik supaya boleh diputar beberapa detik kemudian
          rekaman.muted = true;
          const p = rekaman.play();
          if (p && p.then) p.then(() => { rekaman.pause(); rekaman.currentTime = 0; rekaman.muted = false; }).catch(() => { rekaman.muted = false; });
        } else if (tts) {
          // iPhone: suara browser juga harus "dipancing" di dalam klik
          try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; tts.speak(u); } catch (e) { /* abaikan */ }
        }
      },
      // backsound memudar saat halaman portofolio terbuka
      fadeOut(ms) {
        if (!latar || latar.paused) return;
        fade(latar, 0, ms, () => latar.pause());
      },
      // sapaan "Hello, welcome to my portfolio"; onStart dipanggil tepat saat suara mulai terdengar
      greet(onStart) {
        if (!on) return false;
        if (rekaman) {
          rekaman.currentTime = 0;
          rekaman.muted = false;
          const p = rekaman.play();
          if (p && p.then) p.then(() => { if (onStart) onStart(); }).catch(() => speak(onStart, false));
          else if (onStart) onStart();
          return true;
        }
        return speak(onStart, false);
      },
    };
  })();

  let threads = null;   // benang WebThreads di hero (dibuat di bagian 5b saat tirai merah muda surut)

  function startHero() {
    startThreads();
    root.classList.add('is-ready');
    setTimeout(greet, 300);   // saat "HELLO," mulai muncul
  }

  // Sapaan suara + tulisan sambutan menyala kata demi kata + kilau cahaya berjalan di benang
  function greet() {
    const headline = $('.hero__headline');
    let done = false;
    const glow = () => {
      if (done) return;
      done = true;
      if (headline) headline.classList.add('is-speaking');
      if (threads) threads.pulse(0.05);
    };
    if (sound.greet(glow)) setTimeout(glow, 1800);   // cadangan bila suara telat atau tidak tersedia
    else glow();
  }

  function runPreloader() {
    const preloader = $('.preloader');
    if (!preloader) { startHero(); return; }
    lockScroll();

    const volume = $('[data-volume]', preloader);
    const note = $('[data-note]', preloader);
    const flask = $('.preloader__svg', preloader);
    const gate = $('[data-gate]', preloader);
    const heroImg = $('.hero__photo img');
    const tasks = [
      document.fonts ? document.fonts.ready : Promise.resolve(),
      heroImg && !heroImg.complete
        ? new Promise((resolve) => {
            heroImg.addEventListener('load', resolve, { once: true });
            heroImg.addEventListener('error', resolve, { once: true });
          })
        : Promise.resolve(),
    ];
    let loaded = 0;
    tasks.forEach((task) => task.then(() => { loaded++; }));

    // selama pembuka tampil, isi halaman di belakangnya tidak bisa difokus atau diklik
    const behind = $$('body > *').filter((el) => el !== preloader && !/^(script|svg)$/i.test(el.tagName));
    behind.forEach((el) => { el.inert = true; });

    let t0 = 0;
    let MIN = PRELOADER.MIN;
    let shown = 0;
    let last = 0;

    // Mulai menuang. withSound = true bila pengunjung memilih "Masuk ke portofolio" (bersuara).
    function begin(withSound) {
      if (t0) return;                               // cegah klik ganda
      if (withSound) sound.start();                 // harus langsung di dalam klik, sebelum hal lain
      MIN = reduced ? 900 : withSound ? PRELOADER.MIN_BERSUARA : PRELOADER.MIN;
      preloader.classList.remove('is-waiting');
      if (gate) gate.classList.add('is-gone');
      note.textContent = 'Menuang tinta, menunggu titik akhir…';
      t0 = last = performance.now();
      requestAnimationFrame(tick);
    }

    if (gate) {
      preloader.classList.add('is-waiting');        // labu kosong, tetesan belum jatuh
      gate.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-enter]');
        if (btn) begin(btn.dataset.enter === 'sound');
      });
    } else {
      begin(false);
    }

    function tick(now) {
      const elapsed = now - t0;
      const allLoaded = loaded === tasks.length;
      let goal = Math.min(elapsed / MIN, allLoaded ? 1 : 0.85);   // tahan di 85% sampai foto & font siap
      if (elapsed > PRELOADER.MAX) goal = 1;
      const k = 1 - Math.pow(0.88, (now - last) / 16.7);          // halus & sama cepat di layar 60/120 Hz
      last = now;
      shown += (goal - shown) * k;
      if (goal === 1 && shown > 0.995) shown = 1;
      preloader.style.setProperty('--p', shown.toFixed(4));
      volume.textContent = (shown * 25).toFixed(2).replace('.', ',');   // pembacaan buret 0,00 → 25,00 mL
      if (shown < 1) requestAnimationFrame(tick);
      else finish();
    }

    function finish() {
      preloader.classList.add('is-endpoint');       // cairan berubah merah muda = titik akhir
      note.textContent = 'Titik akhir tercapai';
      if (reduced) { setTimeout(leave, 500); return; }
      setTimeout(() => {
        // merah muda menyebar dari tengah labu ke seluruh layar
        const r = flask.getBoundingClientRect();
        preloader.style.setProperty('--fx', `${Math.round(r.left + r.width / 2)}px`);
        preloader.style.setProperty('--fy', `${Math.round(r.top + r.height * 0.8)}px`);
        void preloader.offsetWidth;                 // pastikan titik asal terpasang sebelum transisi
        preloader.classList.add('is-flooding');
        setTimeout(leave, PRELOADER.FLOOD);
      }, PRELOADER.HOLD);
    }

    function leave() {
      preloader.classList.add('is-leaving');        // surut ke bawah, halaman terbuka dari atas
      behind.forEach((el) => { el.inert = false; });
      unlockScroll();
      sound.fadeOut(1400);                          // backsound memudar, berganti sapaan
      startThreads();                               // benang mulai digambar saat tirai surut
      if (hero) {                                   // fokus keyboard pindah ke awal halaman
        if (!hero.hasAttribute('tabindex')) hero.setAttribute('tabindex', '-1');
        hero.focus({ preventScroll: true });
      }
      setTimeout(startHero, 450);                   // mulai animasi masuk saat merah muda mulai surut
      setTimeout(() => preloader.remove(), 1100);
    }
  }

  // ---------- 4. Animasi saat elemen terlihat ----------
  function setupReveal() {
    // Kotak keahlian: posisi acak sebelum berkumpul
    $$('.ptable .el').forEach((el, i) => {
      el.style.setProperty('--tx', `${((Math.random() - 0.5) * 120).toFixed(1)}px`);
      el.style.setProperty('--ty', `${(50 + Math.random() * 130).toFixed(1)}px`);
      el.style.setProperty('--tr', `${((Math.random() - 0.5) * 60).toFixed(1)}deg`);
      el.style.setProperty('--d', `${(i * 0.018 + Math.random() * 0.12).toFixed(3)}s`);
    });

    const targets = $$('[data-reveal], [data-split], .project__visual--catalyst');
    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
    targets.forEach((el) => io.observe(el));
  }

  // ---------- 5. Efek mengikuti gulir ----------
  const header = $('.site-header');
  const hero = $('.hero');
  const heroHeadline = $('.hero__headline');
  const heroHello = $('.hero__hello');
  const heroWord = $('.hero__word');
  const heroPhoto = $('.hero__photo');
  const burette = $('.burette');
  const projects = $('.projects');
  const pin = $('.projects__pin');
  const track = $('.projects__track');
  const contact = $('.contact');
  const tickerTrack = $('.ticker__track');
  const sections = $$('main section[id]').filter((s) => s.id !== 'top');
  const navLinks = $$('.site-nav a, .burette__marks a, .mm-link');
  let inks = [];

  const state = {
    vh: window.innerHeight,
    maxScroll: 1,
    pinOn: false,
    pinDistance: 0,
    projectsTop: 0,
    marks: [],
    lastY: window.scrollY,
    active: '',
    menuOpen: false,
    heroBottom: 0,
    headerH: 72,
  };

  // Atur ukuran tulisan sambutan: PORTFOLIO selebar mungkin (tetapi tidak terlalu tinggi di layar
  // laptop yang pendek, dan di laptop/desktop berhenti sebelum kepala di foto), lalu baris
  // "HELLO, WELCOME TO MY" disamakan lebarnya dengan PORTFOLIO.
  function fitHeadline() {
    const wordFit = heroWord && $('.hero__fit', heroWord);
    if (!wordFit) return;
    heroWord.style.fontSize = '';
    const size = parseFloat(getComputedStyle(heroWord).fontSize);
    const width = wordFit.offsetWidth;                  // offsetWidth tidak terpengaruh animasi huruf
    let available = heroWord.clientWidth * 0.95;
    if (!mqNarrow.matches && heroPhoto) {               // foto di kanan: kata boleh masuk 10% ke kotak foto
      const start = parseFloat(getComputedStyle(heroHeadline).paddingLeft) || 0;
      available = Math.min(available, heroPhoto.offsetLeft + heroPhoto.offsetWidth * 0.1 - start);
    }
    const maxByHeight = state.vh * 0.255;               // tinggi kata ≈ 0,8 × ukuran huruf
    if (width > 0) heroWord.style.fontSize = `${Math.min((size * available) / width, 340, maxByHeight).toFixed(2)}px`;

    const helloFit = heroHello && $('.hero__fit', heroHello);
    if (!helloFit) return;
    heroHello.style.fontSize = '';
    const helloSize = parseFloat(getComputedStyle(heroHello).fontSize);
    const helloWidth = helloFit.offsetWidth;
    if (helloWidth > 0) heroHello.style.fontSize = `${Math.min((helloSize * wordFit.offsetWidth * 0.97) / helloWidth, 150).toFixed(2)}px`;
  }

  function measure() {
    state.vh = window.innerHeight;
    fitHeadline();
    state.headerH = header.offsetHeight;
    state.heroBottom = hero ? hero.getBoundingClientRect().bottom + window.scrollY : 0;

    // Bagian proyek: tinggi = jarak geser horizontal + satu layar
    state.pinOn = !reduced && mqPin.matches && !!track;
    root.classList.toggle('has-pin', state.pinOn);
    if (projects) {
      track.style.transform = '';
      if (state.pinOn) {
        state.pinDistance = Math.max(0, track.offsetWidth - pin.clientWidth);
        projects.style.height = `${state.pinDistance + state.vh}px`;
      } else {
        state.pinDistance = 0;
        projects.style.height = '';
      }
      state.projectsTop = projects.getBoundingClientRect().top + window.scrollY;
    }

    state.maxScroll = Math.max(1, root.scrollHeight - state.vh);
    state.marks = sections.map((s) => ({ id: s.id, top: s.getBoundingClientRect().top + window.scrollY }));

    // Letakkan tanda-tanda pada buret sesuai posisi tiap bagian
    if (burette) {
      $$('.burette__marks a', burette).forEach((a) => {
        const mark = state.marks.find((m) => m.id === a.dataset.mark);
        if (mark) a.parentElement.style.setProperty('--pos', `${(clamp(mark.top / state.maxScroll, 0, 1) * 100).toFixed(2)}%`);
      });
    }
    update();
  }

  // Pita berjalan melaju lebih cepat (dan berbalik arah) saat digulir
  const tickerAnim = tickerTrack && tickerTrack.getAnimations ? tickerTrack.getAnimations()[0] : null;
  let boost = 0;
  let boostDir = 1;
  let boostRaf = 0;
  function kickTicker(dy) {
    if (!tickerAnim || reduced) return;
    boost = Math.min(6, boost + Math.abs(dy) * 0.05);
    boostDir = dy < 0 ? -1 : 1;
    if (!boostRaf) boostRaf = requestAnimationFrame(boostLoop);
  }
  function boostLoop() {
    boost *= 0.92;
    tickerAnim.playbackRate = boostDir * (1 + boost);
    boostRaf = boost > 0.02 ? requestAnimationFrame(boostLoop) : 0;
  }

  function update() {
    const y = window.scrollY;
    const vh = state.vh;
    const dy = y - state.lastY;
    state.lastY = y;

    // Header: muncul saat menggulir ke atas, sembunyi saat ke bawah
    header.classList.toggle('is-scrolled', y > 20);
    header.classList.toggle('is-on-dark', y + state.headerH * 0.5 < state.heroBottom);   // di atas hero hitam: teks putih
    if (!state.menuOpen) {
      if (dy > 4 && y > vh * 0.7) header.classList.add('is-hidden');
      else if (dy < -4 || y < vh * 0.3) header.classList.remove('is-hidden');
    }

    // Progres halaman: garis di header (seluler) & cairan buret (desktop)
    const progress = clamp(y / state.maxScroll, 0, 1);
    header.style.setProperty('--progress', progress.toFixed(4));

    // Bagian yang sedang aktif
    let active = '';
    for (const mark of state.marks) if (y + vh * 0.4 >= mark.top) active = mark.id;
    if (active !== state.active) {
      state.active = active;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${active}`));
    }
    if (burette) {
      burette.style.setProperty('--level', (1 - progress).toFixed(4));
      // sembunyikan di hero & saat proyek digeser horizontal (agar tidak menutupi kartu)
      burette.classList.toggle('is-visible', y > vh * 0.6 && !(state.pinOn && active === 'proyek'));
    }

    if (!reduced) {
      // Hero: tulisan sambutan bergerak lebih lambat dari foto (efek kedalaman)
      if (y < vh * 1.3 && heroHeadline) {
        heroHeadline.style.transform = `translate3d(0, ${(y * 0.3).toFixed(1)}px, 0)`;
        heroPhoto.style.transform = `translate3d(0, ${(y * 0.12).toFixed(1)}px, 0)`;
      }
      // Kontak: cairan merah muda naik saat bagian ini masuk layar
      if (contact) {
        const r = contact.getBoundingClientRect();
        const fill = clamp((vh - r.top) / (vh * 0.8), 0, 1);
        contact.style.setProperty('--fill', fill.toFixed(4));
      }
      if (Math.abs(dy) > 0) kickTicker(dy);
    }

    inks.forEach((ink) => updateInk(ink, vh));

    // Proyek: geser horizontal selama bagian "disematkan"
    if (state.pinOn && state.pinDistance > 0) {
      const p = clamp((y - state.projectsTop) / state.pinDistance, 0, 1);
      track.style.transform = `translate3d(${(-p * state.pinDistance).toFixed(1)}px, 0, 0)`;
    }
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
  }, { passive: true });

  // Saat kartu proyek difokus dengan keyboard, gulir halaman ke posisi kartu itu
  if (track) {
    track.addEventListener('focusin', (e) => {
      if (!state.pinOn) return;
      if (pin) pin.scrollLeft = 0;
      const card = e.target.closest('.project, .projects__intro');
      if (!card) return;
      const p = clamp((card.offsetLeft - 48) / state.pinDistance, 0, 1);
      window.scrollTo(0, state.projectsTop + p * state.pinDistance);
    });
  }

  // ---------- 5b. Hero: animasi benang WebThreads (React Bits) ----------
  // Benang bercahaya merah muda & putih di latar hitam hero. Benang terdekat dengan kursor menyala,
  // dan klik di area hero mengirim kilau cahaya di sepanjang benang.
  // Daftar lengkap pengaturan (sama dengan tabel props React Bits) ada di js/web-threads.js.
  const BENANG = {
    colors: ['#C8306F', '#F0559B', '#FFC4DE'],   // merah muda tua → merah muda → merah muda pucat
    coreColor: '#FFFFFF',                         // putih di titik benang bertemu
    threadCount: 6,                               // jumlah benang (maks. 24)
    speed: 0.22,                                  // kecepatan anyaman
    spread: 0.2,                                  // seberapa lebar benang menyebar
    taper: 0.55,                                  // benang luar mengayun lebih lebar (kecil = lebih rapat)
    position: 0.5,                                // tinggi anyaman: 0 bawah … 1 atas
    pinch: 0.64,                                  // titik temu benang: 0 kiri … 1 kanan (di samping foto)
    glow: 0.018,                                  // kuat cahaya
    brightness: 0.6,                              // kecerahan
    depth: 0.4,                                   // benang memelintir 3D (yang di belakang lebih tipis)
    fade: 0.35,                                   // ujung kiri-kanan memudar
    pulses: 0.35,                                 // denyut cahaya yang berjalan menuju titik temu
    shimmer: true,                                // ayunan halus yang tidak seragam
    dpr: 1.25,                                    // ketajaman kanvas (lebih kecil = lebih ringan di laptop lama)
    respectReducedMotion: IKUTI_KURANGI_GERAKAN,
  };
  // HP & tablet: foto berada di tengah, jadi titik temu benang di tengah, setinggi badan di foto
  const BENANG_HP = { pinch: 0.5, position: 0.64, spread: 0.12 };
  const benangSekarang = () => ({ ...BENANG, ...(mqNarrow.matches ? BENANG_HP : {}) });

  function startThreads() {
    if (threads || !window.WebThreads) return;   // sudah jalan, atau web-threads.js gagal dimuat
    const el = $('.hero__threads');
    if (!el) return;
    threads = window.WebThreads(el, benangSekarang());
    mqNarrow.addEventListener('change', () => threads.set(benangSekarang()));
  }

  // ---------- 6. Header, menu "tabel periodik", tautan jangkar ----------
  // Di HP & tablet, tombol Menu membuka panel kecil (bukan layar penuh).
  // Animasi buka (lihat CSS bagian 6): tinta merah muda menyebar dari tombol Menu,
  // disusul kertas berisi ubin unsur yang terbalik masuk satu per satu. Menutup = kebalikannya.
  const menuBtn = $('.menu-toggle');
  const menu = $('#mobile-menu');
  const menuPanel = menu && $('.mobile-menu__panel', menu);
  const menuLabel = menuBtn && $('.menu-toggle__label', menuBtn);
  const mqWideNav = window.matchMedia('(min-width: 1024px)');
  let menuTimer = 0;

  // Titik asal "tetesan" = tengah tombol Menu, dihitung relatif terhadap panel
  function setMenuOrigin() {
    const b = menuBtn.getBoundingClientRect();
    const p = menuPanel.getBoundingClientRect();
    const ox = b.left + b.width / 2 - p.left;
    const oy = b.top + b.height / 2 - p.top;
    const far = Math.max(
      Math.hypot(ox, oy), Math.hypot(p.width - ox, oy),
      Math.hypot(ox, p.height - oy), Math.hypot(p.width - ox, p.height - oy)
    );
    menuPanel.style.setProperty('--ox', `${ox.toFixed(1)}px`);
    menuPanel.style.setProperty('--oy', `${oy.toFixed(1)}px`);
    menuPanel.style.setProperty('--rmax', `${Math.ceil(far + 12)}px`);   // +12: ikut menutupi bayangan panel
  }

  function openMenu() {
    if (state.menuOpen) return;
    state.menuOpen = true;
    clearTimeout(menuTimer);
    menu.hidden = false;
    setMenuOrigin();
    void menu.offsetWidth;                      // gambar keadaan awal dulu supaya transisinya jalan
    menu.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuLabel.textContent = 'Tutup';
    header.classList.remove('is-hidden');
    header.classList.add('menu-open');
    lockScroll();
    const first = $('.mm-link.is-active', menu) || $('.mm-link', menu);
    if (first) first.focus({ preventScroll: true });
  }

  function closeMenu(returnFocus) {
    if (!state.menuOpen) return;
    state.menuOpen = false;
    setMenuOrigin();
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuLabel.textContent = 'Menu';
    header.classList.remove('menu-open');
    unlockScroll();
    clearTimeout(menuTimer);
    menuTimer = setTimeout(() => { menu.hidden = true; }, reduced ? 0 : 640);   // tunggu animasi menutup
    if (returnFocus) menuBtn.focus({ preventScroll: true });
  }

  if (menuBtn && menu && menuPanel) {
    menuBtn.addEventListener('click', () => (state.menuOpen ? closeMenu() : openMenu()));
    $$('[data-menu-close]', menu).forEach((el) => el.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', (e) => {
      if (!state.menuOpen) return;
      if (e.key === 'Escape') { closeMenu(true); return; }
      if (e.key !== 'Tab') return;
      // jaga fokus keyboard tetap di tombol Menu & isi panel selama menu terbuka
      const items = [menuBtn, ...$$('a, button', menuPanel)];
      const i = items.indexOf(document.activeElement);
      e.preventDefault();
      items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
    });
    // layar diputar/diperlebar sampai navigasi lengkap muncul: tutup panel
    mqWideNav.addEventListener('change', (e) => { if (e.matches) closeMenu(); });
    window.addEventListener('resize', () => { if (state.menuOpen) setMenuOrigin(); });
  }

  // Semua tautan "#bagian" digulir halus + fokus dipindahkan untuk pengguna keyboard
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    closeMenu();
    const y = id === 'top' ? 0 : target.getBoundingClientRect().top + window.scrollY;
    smooth.to(y);
    history.replaceState(null, '', `#${id}`);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  // ---------- 7. Kursor, tombol magnetis, kemiringan 3D (khusus mouse) ----------
  function setupPointerEffects() {
    if (!finePointer || reduced) return;

    // Kursor kontekstual: lingkaran berlabel hanya di atas foto/galeri
    const cursor = $('.cursor');
    if (cursor) {
      root.classList.add('has-cursor');
      const label = $('.cursor__label', cursor);
      let x = -200; let y = -200; let cx = x; let cy = y; let raf = 0;
      const loop = () => {
        cx = lerp(cx, x, 0.22);
        cy = lerp(cy, y, 0.22);
        cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
        raf = Math.abs(cx - x) > 0.1 || Math.abs(cy - y) > 0.1 ? requestAnimationFrame(loop) : 0;
      };
      window.addEventListener('pointermove', (e) => {
        x = e.clientX; y = e.clientY;
        if (!cursor.classList.contains('is-active')) { cx = x; cy = y; }
        if (!raf) raf = requestAnimationFrame(loop);
      }, { passive: true });
      document.addEventListener('pointerover', (e) => {
        const t = e.target.closest('[data-cursor]');
        if (!t) return;
        label.textContent = t.dataset.cursor;
        cursor.classList.add('is-active');
      });
      document.addEventListener('pointerout', (e) => {
        const t = e.target.closest('[data-cursor]');
        if (t && !t.contains(e.relatedTarget)) cursor.classList.remove('is-active');
      });
    }

    // Tombol magnetis: sedikit "tertarik" ke arah kursor
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        el.classList.add('is-pulling');
        el.style.translate = `${(mx * 0.3).toFixed(1)}px ${(my * 0.35).toFixed(1)}px`;
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-pulling');
        el.style.translate = '';
      });
    });

    // Kemiringan 3D pada halaman makalah
    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${(px * 14).toFixed(2)}deg) rotateX(${(-py * 14).toFixed(2)}deg) translateY(-8px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // ---------- 8. Foto profil berubah menjadi rumus kimia ----------
  // Arahkan kursor ke foto (hero & "Tentang saya"): hanya bagian di sekitar kursor (sebuah
  // "lensa" bulat) yang berubah menjadi potret dari rumus senyawa kimia, berwarna navy → magenta
  // seperti fenolftalein. Lensa mengikuti kursor; keluar dari foto = foto kembali utuh.
  // Di HP/tablet: ketuk foto memunculkan lensa, seret jari agar lensa mengikuti, ketuk di dalam lensa menutup (menutup sendiri setelah 3,5 detik).
  // Daftar rumus boleh diubah; angka setelah huruf otomatis menjadi subskrip (C20 → C₂₀).
  const FORMULAS = [
    'C20H14O4',   // fenolftalein (indikator titrasi)
    'NiFe2O4',    // nikel ferit (katalis skripsi)
    '–SO3H',      // gugus asam sulfonat
    'C16H32O2',   // asam palmitat (minyak sawit)
    'CH3OH',      // metanol (esterifikasi)
    'C6H10O5',    // selulosa (serat sawit)
    'H2SO4', 'Al2O3', 'C18H34O2', 'NaOH', 'H2O', 'KMnO4', 'CO2', 'CaCO3',
    'C6H12O6', 'Fe3O4', 'SiO2', 'HCl', 'NH3', 'C2H5OH', 'KOH', 'NaCl',
  ];
  // warna huruf menurut terang-gelap foto: gelap = navy, sedang = ungu → magenta, terang = merah muda
  const INK_STOPS = [
    [0, [6, 26, 45]], [0.3, [16, 50, 79]], [0.52, [110, 40, 104]],
    [0.68, [200, 48, 111]], [0.84, [236, 102, 160]], [1, [246, 178, 206]],
  ];
  // versi untuk foto di hero yang berlatar hitam: gelap = merah muda tua, terang = putih
  const INK_STOPS_DARK = [
    [0, [104, 24, 66]], [0.3, [160, 36, 98]], [0.52, [210, 58, 124]],
    [0.68, [240, 85, 155]], [0.84, [255, 168, 208]], [1, [255, 246, 250]],
  ];
  const makePalette = (stops) => Array.from({ length: 32 }, (_, i) => {
    const t = i / 31;
    let j = 0;
    while (j < stops.length - 2 && t > stops[j + 1][0]) j++;
    const [t1, c1] = stops[j];
    const [t2, c2] = stops[j + 1];
    const k = (t - t1) / (t2 - t1);
    return `rgb(${c1.map((v, n) => Math.round(v + (c2[n] - v) * k)).join(',')})`;
  });
  const PALETTE = makePalette(INK_STOPS);
  const PALETTE_DARK = makePalette(INK_STOPS_DARK);
  const GLYPHS = [];
  FORMULAS.forEach((f) => {
    for (const ch of f) GLYPHS.push({ ch, sub: /\d/.test(ch) });
    GLYPHS.push({ ch: '·', sub: false });
  });
  const SCRAMBLE = ['C', 'H', 'O', 'N', 'S', 'K', 'P', 'Fe', 'Na', 'Cl', 'Al', 'Si', 'Ni', 'Ca', '2', '3', '4', '+', '→', '='];
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // Letak gambar di dalam kotak <img> (memperhitungkan object-fit: contain & object-position)
  function imageBox(img, w, h) {
    const cs = getComputedStyle(img);
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!/contain|scale-down/.test(cs.objectFit) || !nw || !nh) return { x: 0, y: 0, w, h };
    const s = Math.min(w / nw, h / nh);
    const pos = cs.objectPosition.split(/\s+/).map((v) => {
      if (v === 'left' || v === 'top') return 0;
      if (v === 'right' || v === 'bottom') return 1;
      return v.endsWith('%') ? parseFloat(v) / 100 : 0.5;
    });
    const fx = pos[0] !== undefined ? pos[0] : 0.5;
    const fy = pos[1] !== undefined ? pos[1] : 0.5;
    return { x: (w - nw * s) * fx, y: (h - nh * s) * fy, w: nw * s, h: nh * s };
  }

  function setupFormulaPhotos() {
    $$('[data-formula]').forEach((fig) => {
      const img = $('img', fig);
      if (img) formulaPhoto(fig, img);
    });
  }

  function formulaPhoto(fig, img) {
    const palette = fig.closest('.hero') ? PALETTE_DARK : PALETTE;   // hero berlatar hitam
    const canvas = document.createElement('canvas');
    canvas.className = 'formula-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    fig.appendChild(canvas);

    let W = 0; let H = 0; let dpr = 1; let box = null; let mosaic = null;
    let r = 0; let rFrom = 0; let rTo = 0; let t0 = 0; let dur = 0; let easing = easeOutCubic;
    let cx = 0; let cy = 0;                 // pusat tetesan indikator
    let px = 0; let py = 0; let stir = 0;   // posisi kursor & kekuatan "adukan"
    let tx = 0; let ty = 0;                 // titik tujuan lensa (posisi kursor terbaru)
    let on = false; let raf = 0; let frameNo = 0; let lastType = 'mouse';

    const ready = () => img.complete && img.naturalWidth > 0;
    const lensR = () => clamp(Math.min(W, H) * 0.24, 56, 110);   // jari-jari lensa rumus (px)
    const farthest = (x, y) => Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y));
    const local = (e) => { const b = img.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };

    // Samakan ukuran & posisi kanvas dengan foto
    function layout() {
      const w = img.offsetWidth;
      const h = img.offsetHeight;
      if (!w || !h) return false;
      const d = Math.min(window.devicePixelRatio || 1, 2);
      if (w !== W || h !== H || d !== dpr) {
        W = w; H = h; dpr = d;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width = `${W}px`;
        canvas.style.height = `${H}px`;
        mosaic = null;
      }
      canvas.style.left = `${img.offsetLeft}px`;
      canvas.style.top = `${img.offsetTop}px`;
      box = imageBox(img, W, H);
      return true;
    }

    // Susun potret dari rumus kimia (dibuat sekali, disimpan di kanvas cadangan)
    function buildMosaic() {
      const cell = clamp(W / 46, 6.5, 9.5);   // lebar satu huruf (px)
      const rowH = cell * 1.2;
      const fs = cell * 1.3;                   // ukuran huruf dasar

      // 1) baca warna foto pada resolusi kecil
      const SW = Math.max(3, Math.round(W / 2));
      const SH = Math.max(3, Math.round(H / 2));
      const sc = document.createElement('canvas');
      sc.width = SW; sc.height = SH;
      const sctx = sc.getContext('2d', { willReadFrequently: true });
      sctx.drawImage(img, box.x / 2, box.y / 2, box.w / 2, box.h / 2);
      let data = null;
      try { data = sctx.getImageData(0, 0, SW, SH).data; } catch (e) { data = null; }   // dibuka via file:// → piksel tidak boleh dibaca

      // 2) rentang terang-gelap foto, supaya kontras potretnya pas
      let lo = 0; let hi = 1;
      if (data) {
        const hist = new Uint32Array(256);
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          hist[Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2])]++;
          n++;
        }
        let acc = 0; lo = -1; hi = -1;
        for (let v = 0; v < 256; v++) {
          acc += hist[v];
          if (lo < 0 && acc >= n * 0.04) lo = v / 255;
          if (hi < 0 && acc >= n * 0.97) hi = v / 255;
        }
        if (!(hi - lo > 0.2)) { lo = 0; hi = 1; }
      }
      const sample = (x, y) => {
        if (!data) return { a: 1, t: clamp(0.15 + 0.7 * (y / H), 0, 1) };   // cadangan: gradasi atas → bawah
        const sx = clamp(Math.round(x / 2), 1, SW - 2);
        const sy = clamp(Math.round(y / 2), 1, SH - 2);
        let a = 0; let l = 0;
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            const i = ((sy + oy) * SW + sx + ox) * 4;
            const al = data[i + 3] / 255;
            a += al;
            l += al * (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
          }
        }
        return { a: a / 9, t: a > 0 ? clamp((l / a - lo) / (hi - lo), 0, 1) : 1 };
      };

      // 3) susun huruf baris demi baris; tiap baris mulai dari rumus yang berbeda
      const glyphs = [];
      for (let row = 0, y = rowH / 2; y < H; row++, y += rowH) {
        let x = (row % 2) * cell * 0.5;
        let k = (row * 23) % GLYPHS.length;
        while (x < W) {
          const g = GLYPHS[k++ % GLYPHS.length];
          const adv = g.sub ? cell * 0.68 : cell;
          const gx = x + adv / 2;
          x += adv;
          const s = sample(gx, y);
          if (s.a < 0.42) continue;                           // di luar siluet: kosong
          const t = Math.pow(s.t, 0.9);
          const big = t < 0.34 ? 0 : t < 0.67 ? 1 : 2;      // bagian gelap = huruf lebih besar & tebal
          glyphs.push({
            x: gx, y: g.sub ? y + fs * 0.24 : y, ch: g.ch, f: big * 2 + (g.sub ? 1 : 0),
            c: Math.round(t * 31), al: clamp(s.a * (0.66 + 0.5 * (1 - t)), 0, 1), h: (Math.random() * 997) | 0,
          });
        }
      }

      // 4) gambar semua huruf ke kanvas cadangan
      const SIZES = [1.14, 0.98, 0.84];
      const fonts = [];
      SIZES.forEach((m, b) => {
        fonts.push(`${b === 0 ? 700 : 600} ${(fs * m).toFixed(2)}px ${b === 0 ? '"Inter Display", ' : ''}Inter, system-ui, sans-serif`);
        fonts.push(`600 ${(fs * m * 0.68).toFixed(2)}px Inter, system-ui, sans-serif`);   // subskrip
      });
      const off = document.createElement('canvas');
      off.width = canvas.width; off.height = canvas.height;
      const o = off.getContext('2d');
      o.setTransform(dpr, 0, 0, dpr, 0, 0);
      o.textAlign = 'center';
      o.textBaseline = 'middle';
      fonts.forEach((font, f) => {
        o.font = font;
        glyphs.forEach((g) => {
          if (g.f !== f) return;
          o.globalAlpha = g.al;
          o.fillStyle = palette[g.c];
          o.fillText(g.ch, g.x, g.y);
        });
      });
      o.globalAlpha = 1;
      if (!data) {   // cadangan: potong huruf mengikuti siluet foto
        o.globalCompositeOperation = 'destination-in';
        o.drawImage(img, box.x, box.y, box.w, box.h);
        o.globalCompositeOperation = 'source-over';
      }
      mosaic = { canvas: off, glyphs, fonts };
    }

    // Gambar satu frame: foto di luar tetesan, potret rumus di dalamnya
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const band = reduced ? 0 : Math.min(14, r * 0.25);  // tepi lensa yang sedang "bereaksi"
      const inner = Math.max(0, r - band);
      const stirR = 0;
      if (r < farthest(cx, cy)) {
        ctx.drawImage(img, box.x, box.y, box.w, box.h);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
      if (inner > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, inner, 0, Math.PI * 2);
        if (stirR > 1) { ctx.moveTo(px + stirR, py); ctx.arc(px, py, stirR, 0, Math.PI * 2); }
        ctx.clip('evenodd');
        ctx.drawImage(mosaic.canvas, 0, 0, W, H);
        ctx.restore();
      }
      if (band > 0 || stirR > 1) drawExcited(inner, r, band > 0, stirR);
      if (r > 2) {                               // garis tepi lensa
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(200, 48, 111, .65)';
        ctx.stroke();
      }
    }

    // Huruf yang "bereaksi" (di tepi tetesan & di sekitar kursor) teracak dan menyala merah muda
    function drawExcited(inner, outer, hasBand, stirR) {
      const tick = frameNo >> 2;                 // ganti huruf tiap 4 frame
      let font = '';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const g of mosaic.glyphs) {
        let heat = 0; let dx = 0; let dy = 0;
        const d = Math.hypot(g.x - cx, g.y - cy);
        if (hasBand && d >= inner && d < outer) {
          heat = 1 - ((d - inner) / (outer - inner + 0.01)) * 0.7;
        } else if (stirR > 1 && d < inner) {
          const ex = g.x - px; const ey = g.y - py;
          const ds = Math.hypot(ex, ey);
          if (ds < stirR) {
            const f = 1 - ds / stirR;
            heat = 0.35 + 0.65 * f;
            const push = (f * 9 * stir) / (ds || 1);   // terdorong menjauhi kursor
            dx = ex * push; dy = ey * push;
          }
        }
        if (!heat) continue;
        if (font !== mosaic.fonts[g.f]) { font = mosaic.fonts[g.f]; ctx.font = font; }
        ctx.globalAlpha = clamp(heat, 0.3, 1);
        ctx.fillStyle = heat > 0.6 ? '#E23A82' : '#C8306F';
        const ch = SCRAMBLE[(g.h + tick) % SCRAMBLE.length];
        ctx.fillText(g.f % 2 ? ch.charAt(0) : ch, g.x + dx, g.y + dy);
      }
      ctx.globalAlpha = 1;
    }

    function frame(now) {
      raf = 0;
      frameNo++;
      if (r !== rTo) {
        const k = dur > 0 ? clamp((now - t0) / dur, 0, 1) : 1;
        r = k >= 1 ? rTo : rFrom + (rTo - rFrom) * easing(k);
      }
      cx += (tx - cx) * 0.3;                     // lensa mengikuti kursor dengan halus
      cy += (ty - cy) * 0.3;
      if (r <= 0 && rTo === 0) {                 // kembali ke foto asli
        fig.classList.remove('is-reacting');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      draw();
      if (on || r !== rTo) raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    function animate(target, duration, ease) {
      rFrom = r; rTo = target; t0 = performance.now(); dur = duration; easing = ease;
      kick();
    }

    function show(x, y) {
      if (!ready() || !layout()) return;
      if (!mosaic) buildMosaic();
      if (r <= 0.5) { cx = x; cy = y; }          // lensa muncul di titik kursor/ketukan
      tx = x; ty = y;
      on = true;
      fig.classList.add('is-reacting');
      animate(lensR(), reduced ? 0 : 320, easeOutCubic);
    }

    function hide() {
      if (!on) return;
      on = false;
      animate(0, reduced ? 0 : 260, easeInOutCubic);
    }

    // Mouse: arahkan untuk mengubah, gerakkan untuk mengaduk, keluar untuk kembali
    fig.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(...local(e)); });
    fig.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hide(); });

    // Layar sentuh / pena: ketuk untuk memunculkan lensa, lalu seret jari agar lensa mengikuti
    // (seperti kursor). Ketuk di dalam lensa untuk menutup; lensa juga menutup sendiri
    // setelah 3,5 detik tanpa disentuh, supaya halaman bisa digulir lagi.
    let down = false; let dragged = false; let sx = 0; let sy = 0; let idle = 0;
    const armIdle = () => { clearTimeout(idle); if (lastType !== 'mouse') idle = setTimeout(hide, 3500); };

    fig.addEventListener('pointerdown', (e) => {
      lastType = e.pointerType;
      if (e.pointerType === 'mouse') return;
      down = true; dragged = false;
      [sx, sy] = local(e);
      clearTimeout(idle);
    });
    fig.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse') {
        if (!on) return;
        [tx, ty] = local(e);
        kick();
        return;
      }
      if (!down || !on) return;
      const [x, y] = local(e);
      if (!dragged && Math.hypot(x - sx, y - sy) < 8) return;   // abaikan getaran kecil
      dragged = true;
      tx = x; ty = y;
      kick();
    });
    const release = (e) => {
      if (e.pointerType === 'mouse') return;
      down = false;
      if (on) armIdle();
    };
    fig.addEventListener('pointerup', release);
    fig.addEventListener('pointercancel', release);

    fig.addEventListener('click', (e) => {
      if (lastType === 'mouse') return;
      if (dragged) { dragged = false; return; }   // ini akhir dari seretan, bukan ketukan
      const [x, y] = local(e);
      if (!on) show(x, y);
      else if (Math.hypot(x - cx, y - cy) > r) { tx = x; ty = y; kick(); }   // ketuk di luar lensa: lensa pindah
      else { clearTimeout(idle); hide(); }
      if (on) armIdle();
    });

    // Ukuran foto berubah (layar diputar/diperbesar): mulai lagi dari foto asli
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => {
        if (!W || (img.offsetWidth === W && img.offsetHeight === H)) return;
        W = 0; H = 0; mosaic = null; r = 0; rTo = 0; on = false;
        cancelAnimationFrame(raf); raf = 0;
        fig.classList.remove('is-reacting');
      }).observe(img);
    }

    // Siapkan potret lebih awal saat browser senggang, supaya hover pertama tetap mulus
    if (finePointer) {
      const prebuild = () => {
        const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 300));
        idle(() => { if (!mosaic && ready() && layout()) buildMosaic(); });
      };
      const whenFonts = () => (document.fonts ? document.fonts.ready : Promise.resolve()).then(prebuild);
      if (ready()) whenFonts();
      else img.addEventListener('load', whenFonts, { once: true });
    }
  }

  // ---------- 9. Lightbox ----------
  function setupLightbox() {
    const lb = $('.lightbox');
    if (!lb) return;
    const img = $('.lightbox__img', lb);
    const caption = $('.lightbox__caption', lb);
    const count = $('.lightbox__count', lb);
    const prev = $('.lightbox__prev', lb);
    const next = $('.lightbox__next', lb);
    let items = [];
    let index = 0;
    let trigger = null;
    let swiped = false;

    function show(dir) {
      const source = $('img', items[index]);
      img.src = source.currentSrc || source.src;
      img.alt = source.alt;
      caption.textContent = source.alt;
      count.textContent = `${index + 1} / ${items.length}`;
      prev.hidden = next.hidden = items.length < 2;
      if (dir && !reduced) {
        img.style.setProperty('--dir', `${dir * 34}px`);
        img.classList.remove('is-switching');
        void img.offsetWidth;   // mulai ulang animasi
        img.classList.add('is-switching');
      }
    }
    function step(dir) {
      index = (index + dir + items.length) % items.length;
      show(dir);
    }
    function open(t) {
      items = $$(`[data-gallery="${t.dataset.gallery}"]`);
      index = Math.max(0, items.indexOf(t));
      trigger = t;
      show(0);
      lb.hidden = false;
      requestAnimationFrame(() => lb.classList.add('is-open'));
      lockScroll();
      document.addEventListener('keydown', onKey);
      $('.lightbox__close', lb).focus({ preventScroll: true });
    }
    function close() {
      lb.classList.remove('is-open');
      lb.hidden = true;
      unlockScroll();
      document.removeEventListener('keydown', onKey);
      if (trigger) trigger.focus({ preventScroll: true });
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight' && items.length > 1) step(1);
      else if (e.key === 'ArrowLeft' && items.length > 1) step(-1);
      else if (e.key === 'Tab') {   // jaga fokus tetap di dalam lightbox
        const focusables = $$('button', lb).filter((b) => !b.hidden);
        const i = focusables.indexOf(document.activeElement);
        e.preventDefault();
        focusables[(i + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length].focus();
      }
    }

    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-gallery]');
      if (!t || lb.contains(t)) return;
      e.preventDefault();
      open(t);
    });
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    $$('[data-lb-close]', lb).forEach((b) => b.addEventListener('click', () => { if (!swiped) close(); }));

    // Geser (swipe) di layar sentuh untuk pindah foto
    let startX = null;
    lb.addEventListener('pointerdown', (e) => { startX = e.clientX; swiped = false; });
    lb.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 50 && items.length > 1) { swiped = true; step(dx < 0 ? 1 : -1); }
      startX = null;
      setTimeout(() => { swiped = false; }, 0);
    });
  }

  // ---------- 10. Galeri yang bisa digeser ----------
  function setupDragStrips() {
    $$('[data-drag]').forEach((strip) => {
      let down = false; let moved = false;
      let startX = 0; let startScroll = 0;
      let lastX = 0; let lastT = 0; let velocity = 0; let raf = 0;

      strip.addEventListener('dragstart', (e) => e.preventDefault());
      strip.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;   // sentuhan memakai gulir bawaan
        down = true; moved = false;
        startX = lastX = e.clientX;
        startScroll = strip.scrollLeft;
        lastT = performance.now();
        velocity = 0;
        cancelAnimationFrame(raf);
      });
      window.addEventListener('pointermove', (e) => {
        if (!down) return;
        const dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > 5) { moved = true; strip.classList.add('is-dragging'); }
        if (!moved) return;
        strip.scrollLeft = startScroll - dx;
        const now = performance.now();
        velocity = (e.clientX - lastX) / Math.max(1, now - lastT);
        lastX = e.clientX; lastT = now;
      });
      window.addEventListener('pointerup', () => {
        if (!down) return;
        down = false;
        strip.classList.remove('is-dragging');
        if (!moved || reduced) return;
        let v = velocity * 16;   // inersia: terus meluncur lalu melambat
        const glide = () => {
          strip.scrollLeft -= v;
          v *= 0.94;
          if (Math.abs(v) > 0.3) raf = requestAnimationFrame(glide);
        };
        raf = requestAnimationFrame(glide);
      });
      // Jangan membuka foto jika pengguna baru saja menggeser
      strip.addEventListener('click', (e) => {
        if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
      }, true);
    });
  }

  // ---------- 11. Pratinjau sertifikat ----------
  function setupCertPreview() {
    const preview = $('.cert-preview');
    const list = $('.cert-list');
    if (!preview || !list || !finePointer || reduced) return;
    const pImg = $('img', preview);
    let tx = 0; let ty = 0; let px = 0; let py = 0; let rot = 0; let raf = 0;

    const loop = () => {
      const dx = tx - px;
      px = lerp(px, tx, 0.16);
      py = lerp(py, ty, 0.16);
      rot = lerp(rot, clamp(dx * 0.1, -14, 14), 0.18);
      const w = preview.offsetWidth;
      const h = preview.offsetHeight;
      const offsetX = px + w + 40 > window.innerWidth ? -w - 32 : 32;   // pindah ke kiri bila mepet tepi
      const top = clamp(py - h / 2, 12, window.innerHeight - h - 12);
      preview.style.transform = `translate3d(${(px + offsetX).toFixed(1)}px, ${top.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
      raf = Math.abs(dx) > 0.2 || Math.abs(ty - py) > 0.2 || Math.abs(rot) > 0.05 ? requestAnimationFrame(loop) : 0;
    };
    list.addEventListener('pointerenter', (e) => { tx = px = e.clientX; ty = py = e.clientY; });
    list.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    list.addEventListener('pointerover', (e) => {
      const btn = e.target.closest('.cert__btn');
      if (!btn) return;
      const src = $('img', btn).getAttribute('src');
      if (pImg.getAttribute('src') !== src) pImg.src = src;
      preview.classList.add('is-visible');
    });
    list.addEventListener('pointerleave', () => preview.classList.remove('is-visible'));
  }

  // ---------- 12. Dialog detail proyek ----------
  function setupDialogs() {
    $$('[data-dialog]').forEach((btn) => {
      const dialog = document.getElementById(btn.dataset.dialog);
      if (!dialog || typeof dialog.showModal !== 'function') return;
      btn.addEventListener('click', () => { dialog.showModal(); lockScroll(); });
    });
    $$('dialog.sheet').forEach((dialog) => {
      const close = () => {
        if (reduced) { dialog.close(); return; }
        dialog.classList.add('is-closing');
        dialog.addEventListener('animationend', () => {
          dialog.classList.remove('is-closing');
          dialog.close();
        }, { once: true });
      };
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog || e.target.closest('[data-close]')) close();   // klik latar = tutup
      });
      dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });   // tombol Esc
      dialog.addEventListener('close', unlockScroll);
    });
  }

  // ---------- 13. Salin email + toast ----------
  function setupCopy() {
    const toast = $('.toast');
    let timer = 0;
    const showToast = (message) => {
      toast.textContent = message;
      toast.classList.add('is-visible');
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
    };
    $$('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const text = btn.dataset.copy;
        try {
          await navigator.clipboard.writeText(text);
        } catch (err) {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.cssText = 'position:fixed;opacity:0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch (e) { /* abaikan */ }
          ta.remove();
        }
        showToast('Email disalin');
      });
    });
  }

  // ---------- 14. Mulai! ----------
  $$('[data-split]').forEach(splitChars);
  splitHeadline();
  inks = $$('[data-ink]').map(setupInk);
  if (reduced) inks.forEach((ink) => { ink.words.forEach((w) => w.classList.add('is-lit')); ink.marks.forEach((m) => m.el.classList.add('is-marked')); });

  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  setupReveal();
  setupPointerEffects();
  setupFormulaPhotos();
  setupLightbox();
  setupDragStrips();
  setupCertPreview();
  setupDialogs();
  setupCopy();
  measure();
  runPreloader();

  // Ukur ulang saat ukuran layar, font, atau gambar berubah
  let resizeTimer = 0;
  const remeasure = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(measure, 120); };
  window.addEventListener('resize', remeasure);
  mqPin.addEventListener('change', remeasure);
  if (document.fonts) document.fonts.ready.then(measure);
  if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.body);
  window.addEventListener('load', () => {
    measure();
    // Bila halaman dibuka dengan alamat #bagian, pastikan posisinya tepat setelah tata letak final
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (target) window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);
  });

  window.__portfolioReady = true;
})();
