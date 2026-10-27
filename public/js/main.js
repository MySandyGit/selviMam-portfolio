/**
 * Dr. Selvi Shanmugi · Psychotherapy (Chennai and Online)
 * Quiet Wellness Magazine Editorial Engine
 * Strict Implementation of Sections 1, 2, 3, Recorder Mode (?rec=1),
 * Native Dialogs, Formspree POST, and Web Audio.
 */

(function () {
  'use strict';

  /* ==========================================================================
     0. Configuration & Defensive Utilities
     ========================================================================== */
  // TODO: Confirm Formspree endpoint with Dr. Selvi Shanmugi before production
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
  const FALLBACK_PHONE = '+91 98401 23456';
  const FALLBACK_WHATSAPP = 'https://wa.me/919840123456';

  function safeStorageGet(key, fallback = null) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Storage restricted or private mode
    }
  }

  function safeRun(fn, label) {
    try {
      fn();
    } catch (err) {
      console.warn(`[Shanmugi Init] Error during ${label}:`, err);
    }
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. Theme Toggle & Flash Prevention
     ========================================================================== */
  function initTheme() {
    const toggleBtns = document.querySelectorAll('.js-theme-toggle');
    const root = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    function applyTheme(theme) {
      root.setAttribute('data-theme', theme);
      safeStorageSet('shanmugi_theme', theme);
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#131A29' : '#EAEFF6');
      }
    }

    toggleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = root.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';

        if (document.startViewTransition && !prefersReducedMotion) {
          document.startViewTransition(() => applyTheme(next));
        } else {
          applyTheme(next);
        }
      });
    });
  }

  /* ==========================================================================
     2. Native <dialog> Modal Controller (Esc, Focus Trap, Backdrop Click)
     ========================================================================== */
  function initDialogs() {
    const dialogs = document.querySelectorAll('dialog.editorial-dialog');

    dialogs.forEach((dialog) => {
      // Backdrop click closes dialog
      dialog.addEventListener('click', (event) => {
        const card = dialog.querySelector('.dialog-card');
        if (card && !card.contains(event.target)) {
          dialog.close();
        }
      });

      // Close buttons
      const closeBtns = dialog.querySelectorAll('.js-dialog-close, .dialog-close-btn');
      closeBtns.forEach((btn) => {
        btn.addEventListener('click', () => dialog.close());
      });
    });

    // Booking modal triggers
    const bookingTriggers = document.querySelectorAll('.js-open-booking, a[href="#booking-modal"]');
    const bookingDialog = document.getElementById('booking-modal');
    bookingTriggers.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (bookingDialog && typeof bookingDialog.showModal === 'function') {
          bookingDialog.showModal();
        }
      });
    });

    // Menu modal triggers
    const menuTriggers = document.querySelectorAll('.js-open-menu, a[href="#menu-modal"]');
    const menuDialog = document.getElementById('menu-modal');
    menuTriggers.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (menuDialog && typeof menuDialog.showModal === 'function') {
          menuDialog.showModal();
        }
      });
    });

    if (menuDialog) {
      const menuLinks = menuDialog.querySelectorAll('a[href^="#"]');
      menuLinks.forEach((link) => {
        link.addEventListener('click', () => menuDialog.close());
      });
    }

    // Breathing modal triggers
    const breathingBadge = document.getElementById('start-breathing-badge');
    const breathingDialog = document.getElementById('breathing-modal');
    if (breathingBadge && breathingDialog) {
      breathingBadge.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof breathingDialog.showModal === 'function') {
          breathingDialog.showModal();
        }
      });
    }
  }

  /* ==========================================================================
     3. SECTION 1 · HERO SEQUENCE & SCROLL MELT
     - Photo settles 1.06 to 1 over 2.2s
     - Eyebrow and nav fade down into place
     - Letters of SHANMUGI rise .18em out of 10px blur, 95ms apart
     - Pills rise in last at 1.05s
     - Scroll: stage drifts down .32x scroll, bottom gradient grows to 100%
     ========================================================================== */
  function initHeroSequence() {
    const nav = document.querySelector('.hero-nav');
    const eyebrow = document.querySelector('.hero-title-label');
    const photoImg = document.getElementById('hero-bg-img');
    const bottomActions = document.getElementById('hero-bottom-actions');
    const heroChars = document.querySelectorAll('.hero-char');

    // 1. Photo settles
    if (photoImg) {
      photoImg.classList.add('is-settled');
    }

    // 2. Eyebrow and nav fade down
    setTimeout(() => {
      if (nav) nav.classList.add('is-loaded');
      if (eyebrow) eyebrow.classList.add('is-loaded');
    }, 150);

    // 3. Letters of SHANMUGI rise out of blur, 95ms apart
    setTimeout(() => {
      heroChars.forEach((ch) => ch.classList.add('is-revealed'));
    }, 280);

    // 4. Pills rise in last at ~1.05s
    setTimeout(() => {
      if (bottomActions) bottomActions.classList.add('is-loaded');
    }, 1050);
  }

  function applyHeroScroll(scrollY) {
    if (prefersReducedMotion) return;
    const stage = document.getElementById('hero-stage');
    const meltGradient = document.getElementById('hero-melt-gradient');
    const bottomActions = document.getElementById('hero-bottom-actions');
    const vh = window.innerHeight || 800;

    // Only apply while hero is in view
    if (scrollY <= vh * 1.5) {
      // Stage drifts down at 0.32x scroll
      if (stage && window.innerWidth > 760) {
        stage.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.32}px))`;
      }

      // Paper gradient grows from 34% to 100% of hero height, full opacity by 60% viewport
      if (meltGradient) {
        const progress = Math.min(1, Math.max(0, scrollY / (vh * 0.60)));
        meltGradient.style.opacity = progress.toFixed(3);
        const heightPercent = 34 + (progress * 66);
        meltGradient.style.height = `${heightPercent}%`;
      }

      // Pills sit under gradient and disappear with photo
      if (bottomActions && window.innerWidth > 760) {
        const fadeProgress = Math.max(0, 1 - (scrollY / (vh * 0.45)));
        bottomActions.style.opacity = fadeProgress.toFixed(3);
      }
    }
  }

  /* ==========================================================================
     4. SECTION 2 · STATEMENT REVEAL (IntersectionObserver 35% visible)
     - Letter rise from .55em below with 4deg tilt, 26ms apart
     - Pills spring in scale 0 with overshoot, photo zooms 1.5 to 1
     - Emblem turns in from -90deg and scale .6
     ========================================================================== */
  function initStatementSection() {
    const statementSection = document.getElementById('statement');
    if (!statementSection) return;

    // Split text into per-letter spans (preserving inline photo pills)
    const textParts = statementSection.querySelectorAll('.stmt-text-part');
    let charIndex = 0;

    textParts.forEach((part) => {
      const text = part.getAttribute('data-text') || part.textContent;
      part.textContent = '';
      for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.textContent = text[i];
        if (text[i] === ' ') {
          span.style.width = '0.3em';
          span.style.display = 'inline-block';
        } else {
          span.className = 'stmt-char';
          span.setAttribute('aria-hidden', 'true');
          span.style.transitionDelay = `${charIndex * 26}ms`;
          charIndex++;
        }
        part.appendChild(span);
      }
    });

    if (prefersReducedMotion) {
      statementSection.querySelectorAll('.stmt-char').forEach((c) => c.classList.add('is-revealed'));
      statementSection.querySelectorAll('.pill-photo-inline').forEach((p) => p.classList.add('is-revealed'));
      const emblem = document.getElementById('stmt-emblem');
      if (emblem) emblem.classList.add('is-revealed');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Reveal letters
            statementSection.querySelectorAll('.stmt-char').forEach((c) => c.classList.add('is-revealed'));

            // Pills spring in
            const pills = statementSection.querySelectorAll('.pill-photo-inline');
            pills.forEach((pill, idx) => {
              setTimeout(() => {
                pill.classList.add('is-revealed');
              }, 180 + idx * 120);
            });

            // Emblem turns in
            const emblem = document.getElementById('stmt-emblem');
            if (emblem) {
              setTimeout(() => {
                emblem.classList.add('is-revealed');
              }, 450);
            }

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(statementSection);
  }

  /* ==========================================================================
     5. SECTION 3 · QUICK FACTS REVEAL & PORTRAIT PARALLAX (±7%)
     - Title letters rise 30ms apart
     - Middle column paragraph & table rise 22px, rows fade in
     - Portrait wipes up with clip-path 1.2s, image settles from scale 1.25
     - Parallax: drifts ±7% with scroll
     ========================================================================== */
  function initQuickFactsSection() {
    const factsSection = document.getElementById('quick-facts');
    if (!factsSection) return;

    // Split words in left title into letter spans
    const wordLines = factsSection.querySelectorAll('.facts-display-title .word-line');
    let factsCharIndex = 0;

    wordLines.forEach((wordEl) => {
      const word = wordEl.getAttribute('data-text') || wordEl.textContent;
      wordEl.textContent = '';
      for (let i = 0; i < word.length; i++) {
        const span = document.createElement('span');
        span.textContent = word[i];
        span.className = 'facts-char';
        span.setAttribute('aria-hidden', 'true');
        span.style.transitionDelay = `${factsCharIndex * 30}ms`;
        wordEl.appendChild(span);
        factsCharIndex++;
      }
    });

    if (prefersReducedMotion) {
      factsSection.querySelectorAll('.facts-char').forEach((c) => c.classList.add('is-revealed'));
      const mid = document.getElementById('facts-col-middle');
      if (mid) mid.classList.add('is-revealed');
      factsSection.querySelectorAll('.facts-row').forEach((r) => r.classList.add('is-revealed'));
      const frame = document.getElementById('facts-portrait-frame');
      if (frame) frame.classList.add('is-revealed');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 1. Title letters rise
            factsSection.querySelectorAll('.facts-char').forEach((c) => c.classList.add('is-revealed'));

            // 2. Middle column & table rows
            const mid = document.getElementById('facts-col-middle');
            if (mid) mid.classList.add('is-revealed');

            const rows = factsSection.querySelectorAll('.facts-row');
            rows.forEach((row, idx) => {
              setTimeout(() => {
                row.classList.add('is-revealed');
              }, 200 + idx * 60);
            });

            // 3. Portrait wipe up & image settle
            const frame = document.getElementById('facts-portrait-frame');
            if (frame) {
              setTimeout(() => {
                frame.classList.add('is-revealed');
              }, 250);
            }

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.30 }
    );

    observer.observe(factsSection);
  }

  function applyPortraitParallax(scrollY) {
    if (prefersReducedMotion) return;
    const portraitImg = document.getElementById('facts-portrait-img');
    const factsSection = document.getElementById('quick-facts');
    if (!portraitImg || !factsSection) return;

    const rect = factsSection.getBoundingClientRect();
    const vh = window.innerHeight;

    if (rect.top < vh && rect.bottom > 0) {
      // Progress from 0 (entering view) to 1 (leaving view)
      const progress = (vh - rect.top) / (vh + rect.height);
      // Drift +/- 7%
      const driftPercent = ((progress - 0.5) * 14).toFixed(2);
      portraitImg.style.transform = `translateY(${driftPercent}%)`;
    }
  }

  /* ==========================================================================
     6. RECORDER MODE (?rec=1) — Development Only
     Translates page via 6.5s Web Animation, deterministic reveals at 0, 2.65s, 4.85s
     ========================================================================== */
  function initRecorderMode() {
    const wrapper = document.getElementById('site-wrapper');
    if (!wrapper) return;

    // Prevent default scroll
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const sec2 = document.getElementById('statement');
    const sec3 = document.getElementById('quick-facts');

    const sec2Top = sec2 ? sec2.offsetTop : window.innerHeight;
    const sec3Top = sec3 ? sec3.offsetTop : window.innerHeight * 2;

    // Deterministic reveals created up front
    // Turn 1: immediate at 0s
    initHeroSequence();

    // Turn 2: Section 2 reveal at 2.65s
    setTimeout(() => {
      document.querySelectorAll('.stmt-char').forEach((c) => c.classList.add('is-revealed'));
      document.querySelectorAll('.pill-photo-inline').forEach((p) => p.classList.add('is-revealed'));
      const emblem = document.getElementById('stmt-emblem');
      if (emblem) emblem.classList.add('is-revealed');
    }, 2650);

    // Turn 3: Section 3 reveal at 4.85s
    setTimeout(() => {
      document.querySelectorAll('.facts-char').forEach((c) => c.classList.add('is-revealed'));
      const mid = document.getElementById('facts-col-middle');
      if (mid) mid.classList.add('is-revealed');
      document.querySelectorAll('.facts-row').forEach((r) => r.classList.add('is-revealed'));
      const frame = document.getElementById('facts-portrait-frame');
      if (frame) frame.classList.add('is-revealed');
    }, 4850);

    // 6.5s Web Animation translation
    const keyframes = [
      { transform: 'translateY(0px)', offset: 0 },
      { transform: 'translateY(0px)', offset: 0.30 }, // hold to 1.95s (1.95/6.5 = 0.30)
      { transform: `translateY(-${sec2Top}px)`, offset: 0.515 }, // glide to sec 2 by 3.35s (3.35/6.5 = 0.515)
      { transform: `translateY(-${sec2Top}px)`, offset: 0.654 }, // hold to 4.25s (4.25/6.5 = 0.654)
      { transform: `translateY(-${sec3Top}px)`, offset: 0.854 }, // glide to sec 3 by 5.55s (5.55/6.5 = 0.854)
      { transform: `translateY(-${sec3Top}px)`, offset: 1.0 }   // hold to 6.5s
    ];

    const anim = wrapper.animate(keyframes, {
      duration: 6500,
      fill: 'forwards',
      easing: 'ease-in-out'
    });

    // rAF loop reads wrapper translate and drives hero melt & portrait parallax
    function syncRecorderFrame() {
      const transform = window.getComputedStyle(wrapper).transform;
      if (transform && transform !== 'none') {
        const matrix = new DOMMatrixReadOnly(transform);
        const virtualScrollY = Math.abs(matrix.m42);
        applyHeroScroll(virtualScrollY);
        applyPortraitParallax(virtualScrollY);
      }
      if (anim.playState !== 'finished') {
        requestAnimationFrame(syncRecorderFrame);
      }
    }
    requestAnimationFrame(syncRecorderFrame);
  }

  /* ==========================================================================
     7. GENERAL SCROLL LISTENER (Standard Mode)
     ========================================================================== */
  function initScrollController() {
    if (window.location.search.includes('rec=1')) {
      initRecorderMode();
      return;
    }

    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrollY = window.scrollY || window.pageYOffset;
            applyHeroScroll(scrollY);
            applyPortraitParallax(scrollY);
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ==========================================================================
     8. 1-MINUTE GUIDED BREATHING ENGINE (Box 4-4-4-4 & Calming 4-7-8, 60s Cap)
     ========================================================================== */
  function initBreathingExercise() {
    const dialog = document.getElementById('breathing-modal');
    if (!dialog) return;

    const core = document.getElementById('breath-core');
    const counter = document.getElementById('breath-phase-count');
    const actionText = document.getElementById('breath-phase-text');
    const toggleBtn = document.getElementById('btn-toggle-breath');
    const restartBtn = document.getElementById('btn-restart-breath');
    const timerDisplay = document.getElementById('breath-session-timer');
    const ariaLive = document.getElementById('breath-aria-live');
    const btnBox = document.getElementById('btn-mode-box');
    const btnRelax = document.getElementById('btn-mode-relax');

    let currentMode = 'box'; // 'box' or 'relax'
    let isRunning = false;
    let totalSecondsElapsed = 0;
    let phaseIndex = 0;
    let secondsLeftInPhase = 4;
    let intervalId = null;

    const patterns = {
      box: [
        { name: 'Inhale', duration: 4, scale: 1.8 },
        { name: 'Hold', duration: 4, scale: 1.8 },
        { name: 'Exhale', duration: 4, scale: 1.0 },
        { name: 'Hold', duration: 4, scale: 1.0 }
      ],
      relax: [
        { name: 'Inhale', duration: 4, scale: 1.8 },
        { name: 'Hold', duration: 7, scale: 1.8 },
        { name: 'Exhale', duration: 8, scale: 1.0 }
      ]
    };

    function updateStep() {
      const plan = patterns[currentMode];
      const cur = plan[phaseIndex];

      if (secondsLeftInPhase <= 0) {
        phaseIndex = (phaseIndex + 1) % plan.length;
        secondsLeftInPhase = plan[phaseIndex].duration;
      }

      const activePhase = plan[phaseIndex];
      if (actionText) actionText.textContent = activePhase.name;
      if (counter) counter.textContent = secondsLeftInPhase;
      if (core) {
        core.style.transitionDuration = `${activePhase.duration}s`;
        core.style.transform = `scale(${activePhase.scale})`;
      }
      if (ariaLive) {
        ariaLive.textContent = `${activePhase.name}, ${secondsLeftInPhase} seconds remaining`;
      }

      secondsLeftInPhase--;
      totalSecondsElapsed++;

      if (timerDisplay) {
        timerDisplay.textContent = `Elapsed: ${totalSecondsElapsed}s / 60s`;
      }

      // 60-Second Cap: End session with "Well done / Start again"
      if (totalSecondsElapsed >= 60) {
        stopSession();
        if (actionText) actionText.textContent = 'Well Done';
        if (counter) counter.textContent = '✓';
        if (timerDisplay) timerDisplay.textContent = 'Session Complete · Take a quiet breath.';
        if (toggleBtn) toggleBtn.style.display = 'none';
        if (restartBtn) restartBtn.style.display = 'inline-flex';
      }
    }

    function startSession() {
      if (isRunning) return;
      isRunning = true;
      if (toggleBtn) toggleBtn.textContent = 'PAUSE EXERCISE';
      intervalId = setInterval(updateStep, 1000);
      updateStep();
    }

    function stopSession() {
      isRunning = false;
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
      if (toggleBtn) toggleBtn.textContent = 'RESUME EXERCISE';
    }

    function resetSession() {
      stopSession();
      totalSecondsElapsed = 0;
      phaseIndex = 0;
      secondsLeftInPhase = patterns[currentMode][0].duration;
      if (toggleBtn) {
        toggleBtn.textContent = 'START EXERCISE';
        toggleBtn.style.display = 'inline-flex';
      }
      if (restartBtn) restartBtn.style.display = 'none';
      if (timerDisplay) timerDisplay.textContent = 'Elapsed: 0s / 60s';
      if (actionText) actionText.textContent = 'Ready';
      if (counter) counter.textContent = secondsLeftInPhase;
      if (core) {
        core.style.transform = 'scale(1)';
      }
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (isRunning) stopSession();
        else startSession();
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        resetSession();
        startSession();
      });
    }

    if (btnBox) {
      btnBox.addEventListener('click', () => {
        currentMode = 'box';
        btnBox.classList.add('is-selected');
        if (btnRelax) btnRelax.classList.remove('is-selected');
        resetSession();
      });
    }

    if (btnRelax) {
      btnRelax.addEventListener('click', () => {
        currentMode = 'relax';
        btnRelax.classList.add('is-selected');
        if (btnBox) btnBox.classList.remove('is-selected');
        resetSession();
      });
    }

    // Auto-start on dialog open, pause on close
    dialog.addEventListener('close', () => stopSession());
  }

  /* ==========================================================================
     9. WEB AUDIO AMBIENT SOUND SYNTHESIZER (Opt-In, Never Autoplay)
     ========================================================================== */
  function initAmbientAudio() {
    const soundBtns = document.querySelectorAll('.js-toggle-sound');
    let audioCtx = null;
    let masterGain = null;
    let isPlaying = false;
    let oscillators = [];

    function startSound() {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.045, audioCtx.currentTime + 2.5);
      masterGain.connect(audioCtx.destination);

      // Warm pentatonic chord (F2, C3, F3, A3) creating a quiet sanctuary hum
      const frequencies = [87.31, 130.81, 174.61, 220.0];
      oscillators = frequencies.map((freq) => {
        const osc = audioCtx.createOscillator();
        const panner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        if (panner) {
          panner.pan.value = (Math.random() - 0.5) * 0.8;
          osc.connect(panner);
          panner.connect(masterGain);
        } else {
          osc.connect(masterGain);
        }

        osc.start();
        return osc;
      });

      isPlaying = true;
      document.body.classList.add('is-playing');
      soundBtns.forEach((b) => {
        const lbl = b.querySelector('.btn-calm-label');
        if (lbl) lbl.textContent = 'SOUNDING';
      });
    }

    function stopSound() {
      if (masterGain && audioCtx) {
        masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2);
        setTimeout(() => {
          oscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch (e) {}
          });
          oscillators = [];
        }, 1300);
      }
      isPlaying = false;
      document.body.classList.remove('is-playing');
      soundBtns.forEach((b) => {
        const lbl = b.querySelector('.btn-calm-label');
        if (lbl) lbl.textContent = 'CALM SOUND';
      });
    }

    soundBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isPlaying) stopSound();
        else startSound();
      });
    });
  }

  /* ==========================================================================
     10. FORMSPREE AJAX SUBMISSION WITH PHONE / WHATSAPP FALLBACK
     ========================================================================== */
  function initForms() {
    const forms = document.querySelectorAll('form.booking-form-element');

    forms.forEach((form) => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const statusMsg = form.querySelector('.form-status-msg');
        const originalText = submitBtn ? submitBtn.textContent : 'CONFIRM';

        if (statusMsg) {
          statusMsg.className = 'form-status-msg';
          statusMsg.textContent = '';
          statusMsg.style.display = 'none';
        }

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'SENDING INQUIRY...';
        }

        const formData = new FormData(form);

        try {
          const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            body: formData,
            headers: {
              Accept: 'application/json'
            }
          });

          if (response.ok) {
            form.reset();
            if (statusMsg) {
              statusMsg.className = 'form-status-msg is-success';
              statusMsg.textContent = 'Thank you. Your confidential message has been sent directly to Dr. Selvi. You will receive a personal response within 1 business day.';
              statusMsg.style.display = 'block';
            }
            if (submitBtn) {
              submitBtn.textContent = 'MESSAGE SENT ✓';
            }
          } else {
            throw new Error(`Server returned status ${response.status}`);
          }
        } catch (err) {
          console.warn('[Formspree Notice] Inquiry form network fallback handled:', err);
          if (statusMsg) {
            statusMsg.className = 'form-status-msg is-error';
            statusMsg.innerHTML = `Unable to send via web form right now. Please message Dr. Selvi directly via <a href="${FALLBACK_WHATSAPP}" target="_blank" rel="noopener" style="text-decoration:underline; font-weight:600;">WhatsApp</a> or call <a href="tel:${FALLBACK_PHONE.replace(/\s+/g, '')}" style="text-decoration:underline; font-weight:600;">${FALLBACK_PHONE}</a>.`;
            statusMsg.style.display = 'block';
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        }
      });
    });
  }

  /* ==========================================================================
     11. GENERAL SCROLL REVEALS FOR REMAINING SECTIONS
     ========================================================================== */
  function initGeneralScrollReveals() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal-fade').forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal-fade').forEach((el) => {
      observer.observe(el);
    });
  }

  /* ==========================================================================
     12. BOOTSTRAP ALL MODULES WITH TRY/CATCH DEFENSE
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    safeRun(initTheme, 'Theme Controller');
    safeRun(initDialogs, 'Native Dialogs');
    safeRun(initHeroSequence, 'Hero Load Sequence');
    safeRun(initStatementSection, 'Statement Reveal');
    safeRun(initQuickFactsSection, 'Quick Facts Reveal');
    safeRun(initScrollController, 'Scroll & Parallax Engine');
    safeRun(initBreathingExercise, 'Guided Breathing Engine');
    safeRun(initAmbientAudio, 'Web Audio Synthesizer');
    safeRun(initForms, 'Formspree POST Handlers');
    safeRun(initGeneralScrollReveals, 'General Scroll Reveals');

    // Sync copyright year
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });

})();
