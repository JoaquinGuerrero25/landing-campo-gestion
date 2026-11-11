/*
 * Select propio, igual al de la aplicación (components/ui/select.tsx, Radix Select):
 * - con mouse: botón + lista redondeada, filas de 44 px, tilde en la elegida, flechas / Home / End /
 *   escribir para saltar / Enter / Escape;
 * - en celular (sin hover) queda el <select> nativo, que es lo mejor para tocar.
 * El <select> nativo sigue siendo la fuente del valor: al elegir se le asigna y se emite `input` y `change`.
 */
(() => {
  'use strict';

  const CHEVRON = '<svg class="gc-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  const CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const mouse = window.matchMedia('(hover: hover) and (pointer: fine)');
  const OFFSET = 4;      // sideOffset de la app
  const PADDING = 16;    // collisionPadding de la app
  const MAX_HEIGHT = 320;
  let current = null;    // el select abierto

  function enhance(select) {
    const wrap = select.closest('.gc-select');
    if (!wrap) return;
    const label = document.querySelector(`label[for="${select.id}"]`);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'gc-control gc-trigger';
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    if (label) trigger.setAttribute('aria-labelledby', label.id || (label.id = `${select.id}-label`));
    const described = select.getAttribute('aria-describedby');
    if (described) trigger.setAttribute('aria-describedby', described);
    trigger.innerHTML = `<span class="gc-trigger-text"></span>${CHEVRON}`;
    wrap.insertBefore(trigger, select);
    wrap.classList.add('is-custom');
    const text = trigger.querySelector('.gc-trigger-text');

    let list = null, items = [], highlighted = -1, typed = '', typedAt = 0, closing = null;

    const selectedIndex = () => select.selectedIndex;
    function sync() {
      const o = select.options[select.selectedIndex];
      text.textContent = o ? o.textContent : '';
      trigger.setAttribute('aria-invalid', select.getAttribute('aria-invalid') || 'false');
    }
    select._gcSync = sync;
    new MutationObserver(sync).observe(select, { attributes: true, attributeFilter: ['aria-invalid'] });
    sync();

    // La etiqueta lleva al botón (el nativo está oculto con mouse); los errores también.
    if (label) label.addEventListener('click', (e) => { if (mouse.matches) { e.preventDefault(); trigger.focus(); } });
    select.focus = (opts) => (mouse.matches ? trigger.focus(opts) : HTMLSelectElement.prototype.focus.call(select, opts));

    function place() {
      if (!list) return;
      const r = trigger.getBoundingClientRect();
      const vh = window.innerHeight, vw = window.innerWidth;
      const below = vh - r.bottom - OFFSET - PADDING;
      const above = r.top - OFFSET - PADDING;
      list.style.width = `${r.width}px`;
      list.style.maxHeight = 'none';
      const need = Math.min(MAX_HEIGHT, list.scrollHeight);
      const down = below >= need || below >= above;
      list.style.maxHeight = `${Math.max(120, Math.min(MAX_HEIGHT, down ? below : above))}px`;
      const h = list.offsetHeight;
      list.style.top = `${down ? r.bottom + OFFSET : Math.max(PADDING, r.top - OFFSET - h)}px`;
      list.style.left = `${Math.min(Math.max(PADDING, r.left), Math.max(PADDING, vw - list.offsetWidth - PADDING))}px`;
    }

    function highlight(i, scroll = true) {
      if (highlighted >= 0 && items[highlighted]) items[highlighted].removeAttribute('data-highlighted');
      highlighted = i;
      const el = items[i];
      if (!el) return;
      el.setAttribute('data-highlighted', '');
      list.setAttribute('aria-activedescendant', el.id);
      if (scroll) el.scrollIntoView({ block: 'nearest' });
    }

    const enabled = (i) => items[i] && items[i].getAttribute('aria-disabled') !== 'true';
    function move(step) {
      let i = highlighted;
      do { i += step; } while (i >= 0 && i < items.length && !enabled(i));
      if (i >= 0 && i < items.length) highlight(i);
    }

    function choose(i) {
      if (!enabled(i)) return;
      const value = select.options[i].value;
      const changed = select.value !== value;
      select.value = value;
      sync();
      close(true);
      if (changed) {
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    function onKey(e) {
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); move(1); return;
        case 'ArrowUp': e.preventDefault(); move(-1); return;
        case 'Home': e.preventDefault(); highlight([...items.keys()].find(enabled)); return;
        case 'End': e.preventDefault(); highlight([...items.keys()].reverse().find(enabled)); return;
        case 'Enter': e.preventDefault(); choose(highlighted); return;
        case ' ': if (!typed) { e.preventDefault(); choose(highlighted); return; } break;
        case 'Escape': e.preventDefault(); e.stopPropagation(); close(true); return;
        case 'Tab': close(true); return;
        default:
      }
      // Escribir para saltar a la opción que empieza con esas letras.
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const now = Date.now();
        typed = now - typedAt > 700 ? e.key.toLowerCase() : typed + e.key.toLowerCase();
        typedAt = now;
        const order = [...items.keys()];
        const start = typed.length === 1 ? highlighted + 1 : highlighted;
        const rotated = order.slice(start).concat(order.slice(0, start));
        const hit = rotated.find((i) => enabled(i) && select.options[i].textContent.toLowerCase().startsWith(typed));
        if (hit !== undefined) highlight(hit);
        setTimeout(() => { if (Date.now() - typedAt >= 700) typed = ''; }, 720);
      }
    }

    const onOutside = (e) => { if (list && !list.contains(e.target) && !trigger.contains(e.target)) close(false); };
    const onReflow = () => place();

    function open() {
      if (current && current !== api) current.close(false);
      if (list) return;
      if (closing) { clearTimeout(closing); closing = null; document.querySelectorAll('.gc-listbox').forEach((n) => n.remove()); }
      list = document.createElement('div');
      list.className = 'gc-listbox';
      list.id = `${select.id}-list`;
      list.setAttribute('role', 'listbox');
      list.setAttribute('tabindex', '-1');
      list.setAttribute('data-gc', 'popover');
      list.setAttribute('data-state', 'open');
      if (trigger.getAttribute('aria-labelledby')) list.setAttribute('aria-labelledby', trigger.getAttribute('aria-labelledby'));
      const viewport = document.createElement('div');
      viewport.className = 'gc-viewport';
      items = [...select.options].map((o, i) => {
        const el = document.createElement('div');
        el.className = 'gc-item';
        el.id = `${select.id}-opt-${i}`;
        el.setAttribute('role', 'option');
        el.setAttribute('aria-selected', String(i === selectedIndex()));
        if (o.disabled) el.setAttribute('aria-disabled', 'true');
        const t = document.createElement('span');
        t.textContent = o.textContent;
        el.append(t);
        if (i === selectedIndex()) el.insertAdjacentHTML('beforeend', `<span class="gc-item-check">${CHECK}</span>`);
        el.addEventListener('pointermove', () => { if (highlighted !== i && enabled(i)) highlight(i, false); });
        el.addEventListener('click', () => choose(i));
        viewport.append(el);
        return el;
      });
      list.append(viewport);
      document.body.append(list);
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-controls', list.id);
      place();
      const start = selectedIndex() >= 0 && enabled(selectedIndex()) ? selectedIndex() : [...items.keys()].find(enabled);
      highlight(start);
      list.focus({ preventScroll: true });
      list.addEventListener('keydown', onKey);
      document.addEventListener('pointerdown', onOutside, true);
      window.addEventListener('resize', onReflow);
      window.addEventListener('scroll', onReflow, true);
      current = api;
    }

    function close(restoreFocus) {
      if (!list) return;
      const node = list;
      list = null; items = []; highlighted = -1; typed = '';
      document.removeEventListener('pointerdown', onOutside, true);
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
      trigger.setAttribute('aria-expanded', 'false');
      trigger.removeAttribute('aria-controls');
      node.setAttribute('data-state', 'closed');
      closing = setTimeout(() => { node.remove(); closing = null; }, 120);
      if (current === api) current = null;
      if (restoreFocus) trigger.focus({ preventScroll: true });
    }

    const api = { close };
    trigger.addEventListener('click', () => (list ? close(true) : open()));
    trigger.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); if (!list) open(); }
    });
  }

  document.querySelectorAll('.gc-select select').forEach(enhance);
})();
