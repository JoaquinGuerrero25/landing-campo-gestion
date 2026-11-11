/* Certera Agro — landing. JS puro, sin dependencias. */
(() => {
  'use strict';

  const FAQ_COUNT = 7;
  const EMPTY = { nombre: '', contacto: '', ha: '', prov: '', soy: '', msg: '' };
  const state = { menu: false, faq: { 0: true }, f: { ...EMPTY }, err: {}, sent: false };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- render: refleja `state` en el DOM ---------- */
  function visibility() {
    const v = { menuOpen: state.menu, menuClosed: !state.menu, sent: state.sent, notSent: !state.sent };
    for (let i = 0; i < FAQ_COUNT; i++) {
      v['faqOpen' + i] = !!state.faq[i];
      v['faqClosed' + i] = !state.faq[i];
    }
    return v;
  }

  function render() {
    const v = visibility();
    $$('[data-if]').forEach((el) => { el.hidden = !v[el.dataset.if]; });

    const btn = $('#menu-btn');
    if (btn) btn.setAttribute('aria-expanded', String(state.menu));

    for (let i = 0; i < FAQ_COUNT; i++) {
      const b = document.getElementById('faq-b' + i);
      const p = document.getElementById('faq-p' + i);
      if (!b || !p) continue;
      b.setAttribute('aria-expanded', String(!!state.faq[i]));
      p.hidden = !state.faq[i];
    }

    $$('[data-err]').forEach((el) => {
      const msg = state.err[el.dataset.err];
      el.textContent = msg || '';
      el.hidden = !msg;
    });
    ['nombre', 'contacto', 'ha', 'prov'].forEach((k) => {
      const input = document.getElementById('f-' + k);
      if (input) input.setAttribute('aria-invalid', String(!!state.err[k]));
    });
    const soyErr = !!state.err.soy;
    $$('input[name="soy"]').forEach((r) => r.setAttribute('aria-invalid', String(soyErr)));

    $$('[data-name]').forEach((el) => { el.textContent = state.f.nombre.trim(); });
  }

  /* ---------- menú móvil ---------- */
  function setMenu(open, focusBtn) {
    state.menu = open;
    render();
    if (focusBtn) { const b = $('#menu-btn'); if (b) b.focus(); }
  }
  $$('[data-toggle-menu]').forEach((b) => b.addEventListener('click', () => setMenu(!state.menu)));
  $$('[data-close-menu]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.menu) setMenu(false, true);
  });
  const desktop = window.matchMedia('(min-width: 920px)');
  const onDesktop = () => { if (desktop.matches && state.menu) setMenu(false); };
  desktop.addEventListener ? desktop.addEventListener('change', onDesktop) : desktop.addListener(onDesktop);

  /* ---------- preguntas frecuentes ---------- */
  $$('[data-faq]').forEach((b) => {
    b.addEventListener('click', () => {
      const i = +b.dataset.faq;
      state.faq[i] = !state.faq[i];
      render();
    });
  });

  /* ---------- formulario ---------- */
  const form = $('form[aria-labelledby="form-t"]');

  function syncFieldsFromState() {
    if (!form) return;
    ['nombre', 'contacto', 'ha', 'prov', 'msg'].forEach((k) => { if (form.elements[k]) form.elements[k].value = state.f[k]; });
    $$('input[name="soy"]', form).forEach((r) => { r.checked = r.value === state.f.soy; });
  }

  function onField(e) {
    const { name, value } = e.target;
    if (!(name in state.f)) return;
    state.f[name] = value;
    if (state.err[name]) { state.err = { ...state.err, [name]: undefined }; render(); }
  }

  function validate(f) {
    const err = {};
    if (!f.nombre.trim()) err.nombre = 'Escribí tu nombre.';
    const c = f.contacto.trim();
    if (!c) err.contacto = 'Dejanos un correo o un número de WhatsApp.';
    else {
      const isMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c);
      const digits = c.replace(/\D/g, '');
      const isPhone = !/[a-z@]/i.test(c) && digits.length >= 8;
      if (!isMail && !isPhone) err.contacto = 'Revisá el correo o el número: no parece completo.';
    }
    if (!f.ha) err.ha = 'Elegí un rango de hectáreas.';
    if (!f.prov) err.prov = 'Elegí tu provincia.';
    if (!f.soy) err.soy = 'Contanos si sos productor, asesor o cooperativa.';
    return err;
  }

  async function submit(e) {
    e.preventDefault();
    const err = validate(state.f);
    const keys = ['nombre', 'contacto', 'ha', 'prov', 'soy'].filter((k) => err[k]);
    if (keys.length) {
      state.err = err;
      render();
      const el = document.getElementById('f-' + keys[0]);
      if (el) el.focus();
      return;
    }

    // Si el <form> tiene data-endpoint (p. ej. Formspree, Getform, un webhook propio),
    // se envían los datos. Sin endpoint, solo se muestra la confirmación.
    const endpoint = form.dataset.endpoint;
    if (endpoint) {
      const submitBtn = $('button[type="submit"]', form);
      if (submitBtn) submitBtn.disabled = true;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(state.f),
        });
        if (!res.ok) throw new Error(String(res.status));
      } catch (_) {
        if (submitBtn) submitBtn.disabled = false;
        state.err = { contacto: 'No pudimos enviar tus datos. Probá de nuevo en unos minutos.' };
        render();
        const c = document.getElementById('f-contacto');
        if (c) c.focus();
        return;
      }
    }

    state.sent = true;
    state.err = {};
    render();
    setTimeout(() => { const ok = document.getElementById('form-ok'); if (ok) ok.focus({ preventScroll: true }); }, 30);
  }

  if (form) {
    form.addEventListener('input', onField);
    form.addEventListener('change', onField);
    form.addEventListener('submit', submit);
  }

  function preset(p) {
    const f = { ...state.f, ...p };
    if (p.msg && state.f.msg.trim()) f.msg = state.f.msg;
    state.f = f;
    state.sent = false;
    state.menu = false;
    render();
    syncFieldsFromState();
  }
  $$('[data-pick]').forEach((a) => a.addEventListener('click', () => preset({ ha: a.dataset.pick })));
  $$('[data-preset="founder"]').forEach((a) => a.addEventListener('click', () => preset({ soy: 'productor', msg: 'Quiero sumarme al programa de fundadores.' })));
  $$('[data-preset="channel"]').forEach((a) => a.addEventListener('click', () => preset({ soy: 'asesor', msg: 'Quiero ser canal.' })));
  $$('[data-reset-form]').forEach((b) => b.addEventListener('click', () => {
    state.sent = false;
    state.f = { ...EMPTY };
    render();
    syncFieldsFromState();
  }));

  /* ---------- modo claro / oscuro ---------- */
  const THEME_KEY = 'gc-theme';
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  const currentTheme = () => root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');

  function syncThemeButtons() {
    const next = currentTheme() === 'dark' ? 'claro' : 'oscuro';
    $$('[data-theme-toggle]').forEach((b) => {
      b.setAttribute('aria-label', `Cambiar a modo ${next}`);
      b.setAttribute('title', `Cambiar a modo ${next}`);
    });
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    $$('meta[name="theme-color"]').forEach((m) => {
      m.removeAttribute('media');
      m.setAttribute('content', theme === 'dark' ? '#161411' : '#faf9f6');
    });
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) { /* sin almacenamiento: dura hasta cerrar la pestaña */ }
    syncThemeButtons();
  }

  $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark')));
  // Si todavía no eligió, acompaña los cambios del sistema.
  const onSystemTheme = () => { if (!root.hasAttribute('data-theme')) syncThemeButtons(); };
  systemDark.addEventListener ? systemDark.addEventListener('change', onSystemTheme) : systemDark.addListener(onSystemTheme);
  syncThemeButtons();

  /* ---------- movimiento ---------- */
  function setupMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate) return;
    const ease = 'cubic-bezier(.16,1,.3,1)';

    $$('[data-hero]').forEach((el) => {
      const i = +el.getAttribute('data-hero') || 0;
      el.animate(
        [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }],
        { duration: 900, delay: 60 + i * 75, easing: ease, fill: 'both' }
      );
    });

    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { if (en.target._rv) en.target._rv.play(); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    const vh = window.innerHeight;
    $$('[data-reveal]').forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.95) return;
      const line = el.getAttribute('data-reveal') === 'line';
      const d = +(el.getAttribute('data-delay') || 0);
      const kf = line
        ? [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }]
        : [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }];
      const a = el.animate(kf, { duration: line ? 1400 : 750, delay: line ? 150 : d * 70, easing: ease, fill: 'both' });
      a.pause();
      el._rv = a;
      io.observe(el);
    });
  }

  render();
  setupMotion();
})();
