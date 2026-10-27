/* ============================================================
   ui.js — rendering, modals, form engine, toasts, lightbox
   ============================================================ */

/* ---------------- shared helpers ---------------- */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
window.esc = esc;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtDate(d) {
  if (!d) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return d;
  return String(m[3]).padStart(2, '0') + ' ' + MONTHS[Number(m[2]) - 1] + ' ' + m[1];
}
window.fmtDate = fmtDate;

const ICONS = {
  github: 'M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.2 1.9 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.9 18.3 5.2 18.3 5.2c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3',
  linkedin: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2.1 1.4-2.1 2.8V21H9z',
  twitter: 'M18.9 2H22l-6.8 7.8L23.3 22h-6.3l-4.9-6.4L6.5 22H3.4l7.3-8.3L2.7 2h6.4l4.4 5.9zm-1.1 18h1.7L7.1 3.8H5.3z',
  email: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z',
  website: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-2.9a15.7 15.7 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8zM12 4c.8 1.2 1.5 2.5 1.9 4h-3.8c.4-1.5 1.1-2.8 1.9-4zM4.3 14a8 8 0 0 1 0-4h3.3a16.4 16.4 0 0 0 0 4zm.8 2h2.9c.3 1.3.8 2.5 1.4 3.6A8 8 0 0 1 5.1 16zm2.9-8H5.1a8 8 0 0 1 4.3-3.6C8.8 5.5 8.3 6.7 8 8zm4 12c-.8-1.2-1.5-2.5-1.9-4h3.8c-.4 1.5-1.1 2.8-1.9 4zm2.3-6H9.7a14.6 14.6 0 0 1 0-4h4.6a14.6 14.6 0 0 1 0 4zm.6 5.6c.6-1.1 1.1-2.3 1.4-3.6h2.9a8 8 0 0 1-4.3 3.6zm1.7-5.6a16.4 16.4 0 0 0 0-4h3.3a8 8 0 0 1 0 4z',
  youtube: 'M23.5 12s0-3.6-.5-5.3a2.8 2.8 0 0 0-2-2C18.8 4.2 12 4.2 12 4.2s-6.8 0-9.5.5a2.8 2.8 0 0 0-2 2C0 8.4 0 12 0 12s0 3.6.5 5.3a2.8 2.8 0 0 0 2 2c2.7.5 9.5.5 9.5.5s6.8 0 9.5-.5a2.8 2.8 0 0 0 2-2c.5-1.7.5-5.3.5-5.3zM9.8 15.5v-7l6.2 3.5z',
  instagram: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 4.9a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8zm0 8.1a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm6.2-8.3a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0z',
  phone: 'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.3 21 3 12.7 3 2.3 3 1.7 3.4 1.3 4 1.3h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1z',
  location: 'M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z',
  link: 'M14 3h7v7h-2V6.4l-7.3 7.3-1.4-1.4L17.6 5H14zM5 5h5v2H7v10h10v-3h2v5H5z',
  trophy: 'M5 3h14v2.5a5 5 0 0 1-4.2 4.94A6 6 0 0 1 13 13.4V16h2.5a1.5 1.5 0 0 1 0 3H13v2h3.5v2h-9v-2H11v-2H8.5a1.5 1.5 0 0 1 0-3H11v-2.6a6 6 0 0 1-1.8-.96A5 5 0 0 1 5 5.5V3zm2 2v.5a3 3 0 0 0 2.2 2.9A14 14 0 0 1 7 5zm10 0a14 14 0 0 1-2.2.4A3 3 0 0 0 17 5.5V5zM5 8H3v1.5A3.5 3.5 0 0 0 6.5 13H5V8zm14 0h2v5a3.5 3.5 0 0 1-3.5-3.5V8z',
  seal: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.4 14.6l-4.2-4.2 1.4-1.4 2.8 2.8 5.6-5.6 1.4 1.4z',
  camera: 'M9 4l-1.2 2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.8L15 4H9zm3 4.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5z',
  doc: 'M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1.5V7h3.5zM7.5 11h9v1.7h-9zm0 3.4h9v1.7h-9zm0 3.4h6V19h-6z'
};
function icon(name) {
  const p = ICONS[name] || ICONS.link;
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + p + '"/></svg>';
}
window.icon = icon;

const canEdit = () => window.Auth && Auth.canEdit();
window.canEdit = canEdit;

/* minimal status marker: coloured dot + label */
function statusBadge(status) {
  const s = (status || '').toLowerCase();
  let cls = 's-dim';
  if (s.includes('complete') || s.includes('done')) cls = 's-ok';
  else if (s.includes('progress') || s.includes('active')) cls = 's-warn';
  return '<span class="status ' + cls + '">' + esc(status || 'Planned') + '</span>';
}
window.statusBadge = statusBadge;

/* compact file-type chip (PDF / PPTX / PNG / MP4 …) */
function kindIcon(kind, name) {
  const ext = name && name.includes('.') ? name.split('.').pop() : '';
  let label = ext && ext.length <= 4 && /^[a-z0-9]+$/i.test(ext) ? ext.toUpperCase() : '';
  if (['JPEG', 'JPG', 'GIF', 'WEBP', 'SVG'].includes(label)) label = 'IMG';
  if (['MP4', 'WEBM', 'MOV', 'AVI', 'MKV'].includes(label)) label = 'VID';
  if (label === 'PPTX') label = 'PPT';
  if (label === 'DOCX') label = 'DOC';
  if (!label) label = { image: 'IMG', video: 'VID', pdf: 'PDF', doc: 'DOC', other: 'FILE' }[kind] || 'FILE';
  return '<span class="kind">' + label + '</span>';
}
window.kindIcon = kindIcon;

/* ============================================================
   UI — toasts, modals, forms, lightbox
   ============================================================ */
window.UI = (function () {
  'use strict';

  /* ---------------- toast ---------------- */
  function toast(msg, type) {
    const root = document.getElementById('toast-root');
    const t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = msg;
    root.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'opacity .3s, transform .3s';
      t.style.opacity = '0';
      t.style.transform = 'translateX(24px)';
      setTimeout(() => t.remove(), 320);
    }, 3200);
  }

  /* ---------------- modal ---------------- */
  let currentModal = null;
  function modal(opts) {
    const root = document.getElementById('modal-root');
    root.innerHTML = '';

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const box = document.createElement('div');
    box.className = 'modal' + (opts.wide ? ' wide' : '');

    const head = document.createElement('div');
    head.className = 'modal-head';
    head.innerHTML = '<h3 class="modal-title">' + esc(opts.title || '') + '</h3>';
    const x = document.createElement('button');
    x.className = 'x-btn'; x.innerHTML = '&times;'; x.title = 'Close';
    x.onclick = () => close();
    head.appendChild(x);

    const body = document.createElement('div');
    body.className = 'modal-body';
    if (typeof opts.body === 'string') body.innerHTML = opts.body;
    else if (opts.body) body.appendChild(opts.body);

    const foot = document.createElement('div');
    foot.className = 'modal-foot';

    box.appendChild(head); box.appendChild(body); box.appendChild(foot);
    backdrop.appendChild(box);
    root.appendChild(backdrop);

    backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) close(); });
    document.addEventListener('keydown', escHandler);

    function escHandler(e) { if (e.key === 'Escape') close(); }

    function close() {
      document.removeEventListener('keydown', escHandler);
      if (currentModal === api) currentModal = null;
      root.innerHTML = '';
      if (opts.onClose) opts.onClose();
    }

    const api = { close, body, foot, box };
    currentModal = api;

    if (opts.foot) {
      opts.foot.forEach((b) => {
        const el = document.createElement('button');
        el.className = 'btn ' + (b.className || 'ghost');
        el.innerHTML = b.html || esc(b.label);
        el.onclick = (e) => b.onClick(e, api);
        foot.appendChild(el);
      });
    }
    return api;
  }

  function confirm(message, title) {
    return new Promise((resolve) => {
      let done = false;
      const m = modal({
        title: title || 'Are you sure?',
        body: '<p style="margin:0;color:var(--muted)">' + esc(message) + '</p>',
        foot: [
          { label: 'Cancel', className: 'ghost', onClick: () => { done = true; m.close(); resolve(false); } },
          { label: 'Yes, continue', className: 'danger', onClick: () => { done = true; m.close(); resolve(true); } }
        ],
        onClose: () => { if (!done) resolve(false); }
      });
    });
  }

  /* ---------------- lightbox ---------------- */
  let lbState = null;
  function lightbox(items, index) {
    lbState = { items: items, index: index || 0 };
    paintLightbox();
  }
  function paintLightbox() {
    const root = document.getElementById('lightbox-root');
    const it = lbState.items[lbState.index];
    const multi = lbState.items.length > 1;
    root.innerHTML =
      '<div class="lightbox">' +
        (it.kind === 'video'
          ? '<video controls autoplay src="' + esc(it.url) + '"></video>'
          : '<img src="' + esc(it.url) + '" alt="' + esc(it.name || '') + '">') +
        '<button class="lb-close" data-lb="close">&times;</button>' +
        (multi ? '<button class="lb-nav lb-prev" data-lb="prev">&#10094;</button>' : '') +
        (multi ? '<button class="lb-nav lb-next" data-lb="next">&#10095;</button>' : '') +
        (multi ? '<div class="lb-count">' + (lbState.index + 1) + ' / ' + lbState.items.length + '</div>' : '') +
      '</div>';
    root.onclick = (e) => {
      const b = e.target.closest('[data-lb]');
      if (!b && e.target.classList.contains('lightbox')) return closeLightbox();
      if (!b) return;
      const a = b.getAttribute('data-lb');
      if (a === 'close') closeLightbox();
      if (a === 'prev') { lbState.index = (lbState.index - 1 + lbState.items.length) % lbState.items.length; paintLightbox(); }
      if (a === 'next') { lbState.index = (lbState.index + 1) % lbState.items.length; paintLightbox(); }
    };
  }
  function closeLightbox() {
    document.getElementById('lightbox-root').innerHTML = '';
    lbState = null;
  }
  document.addEventListener('keydown', (e) => {
    if (!lbState) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { lbState.index = (lbState.index - 1 + lbState.items.length) % lbState.items.length; paintLightbox(); }
    if (e.key === 'ArrowRight') { lbState.index = (lbState.index + 1) % lbState.items.length; paintLightbox(); }
  });

  /* ---------------- copy ---------------- */
  function copy(text, okMsg) {
    const done = () => toast(okMsg || 'Copied', 'ok');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallback());
    } else fallback();
    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('Copy failed', 'err'); }
      ta.remove();
    }
  }

  /* ============================================================
     Form engine
     ============================================================ */
  function formModal(opts) {
    const state = JSON.parse(JSON.stringify(opts.values || {}));
    const body = document.createElement('div');

    function paintFields() {
      body.innerHTML = '';
      (opts.fields || []).forEach((f) => body.appendChild(fieldEl(f, state)));
    }
    paintFields();

    const m = modal({ title: opts.title, wide: opts.wide, body: body, foot: [] });

    if (opts.onDelete) {
      const del = document.createElement('button');
      del.className = 'btn danger'; del.style.marginRight = 'auto';
      del.textContent = opts.deleteLabel || 'Delete';
      del.onclick = async () => {
        const ok = await confirm(opts.deleteMessage || 'This cannot be undone.');
        if (ok) { m.close(); opts.onDelete(); }
      };
      m.foot.appendChild(del);
    }

    const cancel = document.createElement('button');
    cancel.className = 'btn ghost'; cancel.textContent = 'Cancel';
    cancel.onclick = () => m.close();

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn primary';
    submitBtn.textContent = opts.submitLabel || 'Save';
    submitBtn.onclick = async () => {
      const missing = (opts.fields || []).find((f) => {
        if (!f.required) return false;
        const v = state[f.key];
        return v == null || v === '' || (Array.isArray(v) && !v.length);
      });
      if (missing) { toast('Please fill: ' + missing.label, 'warn'); return; }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Saving…';
      try {
        await opts.onSubmit(JSON.parse(JSON.stringify(state)));
        m.close();
      } catch (e) {
        console.error(e);
        toast(e.message || 'Save failed', 'err');
        submitBtn.disabled = false;
        submitBtn.textContent = opts.submitLabel || 'Save';
      }
    };

    m.foot.appendChild(cancel);
    m.foot.appendChild(submitBtn);
    return m;
  }

  /* ---------------- field renderer ---------------- */
  function fieldEl(f, state) {
    const wrap = document.createElement('div');
    wrap.className = 'field';

    if (f.type === 'static') {
      wrap.innerHTML = '<label>' + esc(f.label) + '</label><div class="hint">' + (f.html || esc(state[f.key] || '')) + '</div>';
      return wrap;
    }

    const isComplex = ['codeList', 'linkList', 'files', 'image', 'fileSingle'].includes(f.type);

    const label = document.createElement('label');
    if (f.required) label.className = 'required';
    label.textContent = f.label;
    const inputId = 'fld_' + f.key + '_' + Math.random().toString(36).slice(2, 7);

    if (isComplex) {
      wrap.appendChild(label);
      if (f.hint) { const h = document.createElement('div'); h.className = 'hint'; h.textContent = f.hint; wrap.appendChild(h); }
      wrap.appendChild(complexField(f, state));
      return wrap;
    }

    label.htmlFor = inputId;
    wrap.appendChild(label);

    let input;
    if (f.type === 'textarea') {
      input = document.createElement('textarea');
      if (f.mono) input.className = 'code-input';
      input.rows = f.rows || 5;
      input.value = state[f.key] == null ? '' : state[f.key];
      input.addEventListener('input', () => { state[f.key] = input.value; });
    } else if (f.type === 'select') {
      input = document.createElement('select');
      (f.options || []).forEach((o) => {
        const opt = document.createElement('option');
        const val = typeof o === 'string' ? o : o.value;
        const lab = typeof o === 'string' ? o : o.label;
        opt.value = val; opt.textContent = lab;
        input.appendChild(opt);
      });
      input.value = state[f.key] != null ? state[f.key] : (f.options && f.options[0]);
      input.addEventListener('change', () => { state[f.key] = input.value; });
    } else if (f.type === 'tags') {
      input = document.createElement('input');
      input.type = 'text';
      input.placeholder = f.placeholder || 'Comma separated';
      input.value = Array.isArray(state[f.key]) ? state[f.key].join(', ') : (state[f.key] || '');
      input.addEventListener('input', () => {
        state[f.key] = input.value.split(',').map((t) => t.trim()).filter(Boolean);
      });
    } else {
      input = document.createElement('input');
      input.type = f.type || 'text';
      input.value = state[f.key] == null ? '' : state[f.key];
      input.addEventListener('input', () => { state[f.key] = input.value; });
      input.addEventListener('change', () => { state[f.key] = input.value; });
    }
    if (f.placeholder) input.placeholder = f.placeholder;
    if (f.required) input.required = true;
    input.id = inputId;
    wrap.appendChild(input);
    if (f.hint) { const h = document.createElement('div'); h.className = 'hint'; h.textContent = f.hint; wrap.appendChild(h); }
    return wrap;
  }

  /* ---------------- complex fields ---------------- */
  function complexField(f, state) {
    if (f.type === 'linkList') return listEditor(state[f.key] || (state[f.key] = []), [
      { key: 'label', label: 'Label', placeholder: 'GitHub' },
      { key: 'url', label: 'URL', placeholder: 'https://…' },
      { key: 'type', label: 'Icon', type: 'select', options: ['github', 'linkedin', 'twitter', 'email', 'website', 'youtube', 'instagram', 'phone', 'location', 'link'] }
    ], 'Add link');

    if (f.type === 'codeList') return listEditor(state[f.key] || (state[f.key] = []), [
      { key: 'name', label: 'File name', placeholder: 'main.c' },
      { key: 'lang', label: 'Language', placeholder: 'c' },
      { key: 'content', label: 'Code', type: 'code' }
    ], 'Add code file');

    if (f.type === 'files') return filesField(f, state, true);
    if (f.type === 'image') return filesField(f, state, false, 'image/*');
    if (f.type === 'fileSingle') return filesField(f, state, false, f.accept || '');
    return document.createElement('div');
  }

  function listEditor(items, itemFields, addLabel) {
    const wrap = document.createElement('div');
    wrap.className = 'list-editor';

    function paint() {
      wrap.innerHTML = '';
      items.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'list-row';

        const main = document.createElement('div');
        main.className = 'lr-main';

        const hasCode = itemFields.some((x) => x.type === 'code');
        if (hasCode) {
          const r1 = document.createElement('div'); r1.className = 'row';
          itemFields.filter((x) => x.type !== 'code').forEach((sf) => {
            const inp = document.createElement('input');
            inp.type = 'text'; inp.placeholder = sf.placeholder || sf.label; inp.value = item[sf.key] || '';
            inp.style.flex = '1';
            inp.addEventListener('input', () => { item[sf.key] = inp.value; });
            r1.appendChild(inp);
          });
          main.appendChild(r1);
          itemFields.filter((x) => x.type === 'code').forEach((sf) => {
            const ta = document.createElement('textarea');
            ta.placeholder = sf.placeholder || sf.label;
            ta.value = item[sf.key] || '';
            ta.spellcheck = false;
            ta.addEventListener('input', () => { item[sf.key] = ta.value; });
            main.appendChild(ta);
          });
        } else {
          itemFields.forEach((sf) => {
            if (sf.type === 'select') {
              const sel = document.createElement('select');
              sf.options.forEach((o) => {
                const op = document.createElement('option'); op.value = o; op.textContent = o;
                sel.appendChild(op);
              });
              sel.value = item[sf.key] || sf.options[0];
              sel.addEventListener('change', () => { item[sf.key] = sel.value; });
              main.appendChild(sel);
            } else {
              const inp = document.createElement('input');
              inp.type = 'text'; inp.placeholder = sf.placeholder || sf.label;
              inp.value = item[sf.key] || '';
              inp.addEventListener('input', () => { item[sf.key] = inp.value; });
              main.appendChild(inp);
            }
          });
        }

        const del = document.createElement('button');
        del.type = 'button'; del.className = 'lr-del'; del.title = 'Remove'; del.innerHTML = '&times;';
        del.onclick = () => { items.splice(idx, 1); paint(); };

        row.appendChild(main);
        row.appendChild(del);
        wrap.appendChild(row);
      });

      const add = document.createElement('button');
      add.type = 'button'; add.className = 'add-row'; add.textContent = '+ ' + addLabel;
      add.onclick = () => {
        const blank = {};
        itemFields.forEach((sf) => { blank[sf.key] = sf.type === 'select' ? sf.options[0] : ''; });
        blank.id = Store.uid();
        items.push(blank);
        paint();
      };
      wrap.appendChild(add);
    }
    paint();
    return wrap;
  }

  function filesField(f, state, multi, accept) {
    const wrap = document.createElement('div');
    const isSingle = !multi;
    const key = f.key;

    function current() {
      if (isSingle) return state[key] ? [state[key]] : [];
      return state[key] || (state[key] = []);
    }

    function paint() {
      wrap.innerHTML = '';
      const list = current();

      if (list.length) {
        const pool = document.createElement('div');
        pool.className = 'att-pool';
        list.forEach((att, idx) => {
          const pill = document.createElement('span');
          pill.className = 'att-pill';
          pill.innerHTML = kindIcon(att.kind, att.name) +
            '<span class="ap-name" title="' + esc(att.name) + '">' + esc(att.name) + '</span>' +
            '<span class="muted">' + Files.fmtSize(att.size) + '</span>' +
            '<button type="button" title="Remove">&times;</button>';
          pill.querySelector('button').onclick = async () => {
            await Files.remove(att);
            if (isSingle) state[key] = null;
            else list.splice(idx, 1);
            paint();
          };
          pool.appendChild(pill);
        });
        wrap.appendChild(pool);

        if (f.previewImages && list[0] && list[0].kind === 'image') {
          const img = document.createElement('img');
          img.className = 'avatar-preview';
          img.alt = 'preview';
          wrap.appendChild(img);
          Files.url(list[0]).then((u) => { if (u) img.src = u; }).catch(() => {});
        }
      }

      const drop = document.createElement('label');
      drop.className = 'file-drop';
      drop.innerHTML = 'Drop ' + (isSingle ? 'a file' : 'files') + ' here or click to browse' +
        (accept ? ' <span class="muted">· ' + esc(accept) + '</span>' : '');
      const input = document.createElement('input');
      input.type = 'file';
      if (accept) input.accept = accept;
      if (multi) input.multiple = true;

      input.onchange = () => handleFiles(Array.from(input.files));
      drop.appendChild(input);

      drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
      drop.addEventListener('dragleave', () => drop.classList.remove('over'));
      drop.addEventListener('drop', (e) => {
        e.preventDefault(); drop.classList.remove('over');
        handleFiles(Array.from(e.dataTransfer.files));
      });

      wrap.appendChild(drop);
    }

    async function handleFiles(files) {
      for (const file of files) {
        try {
          const att = await Files.add(file);
          if (isSingle) state[key] = att;
          else current().push(att);
          UI.toast('Added ' + file.name, 'ok');
        } catch (e) {
          console.error(e);
          UI.toast(e.message || 'Upload failed', 'err');
        }
      }
      paint();
    }

    paint();
    return wrap;
  }

  return { toast, modal, confirm, lightbox, closeLightbox, formModal, copy, icon };
})();

/* ============================================================
   Render — draws every section from Store.data
   ============================================================ */
window.Render = (function () {
  'use strict';

  const DEFAULT_FAVICON = document.querySelector('link[rel="icon"]').getAttribute('href');

  const sectionHead = (eyebrow, title, sub, actionsHtml) =>
    '<div class="section-head">' +
      '<div>' +
        '<div class="eyebrow">' + esc(eyebrow) + '</div>' +
        '<h2>' + esc(title) + '</h2>' +
        (sub ? '<p class="sub">' + esc(sub) + '</p>' : '') +
      '</div>' +
      (actionsHtml ? '<div class="head-actions">' + actionsHtml + '</div>' : '') +
    '</div>';

  const btnSmall = (action, id, label, cls) =>
    canEdit() ? '<button class="btn small ' + (cls || 'ghost') + '" data-action="' + action + '" data-id="' + esc(id) + '">' + esc(label) + '</button>' : '';

  const addBtn = (action, label) =>
    canEdit() ? '<button class="btn primary small" data-action="' + action + '">+ ' + esc(label) + '</button>' : '';

  const emptyState = (tag, text, actionHtml) =>
    '<div class="empty"><div class="e-ico">' + esc(tag) + '</div><p>' + esc(text) + '</p>' + (actionHtml || '') + '</div>';

  /* clean profile links: drop empty rows and email entries duplicating profile.email */
  function profileLinks(p) {
    const email = (p.email || '').trim().toLowerCase();
    return (p.links || []).filter((l) => {
      if (!l || !(l.url || '').trim()) return false;
      if ((l.type || 'link') === 'email') {
        const v = (l.url || '').replace(/^mailto:/i, '').trim().toLowerCase();
        if (email && v === email) return false;
      }
      return true;
    });
  }

  /* ---------------- hero ---------------- */
  function hero(d) {
    const p = d.profile || {};
    const links = profileLinks(p);
    const projects = d.projects || [];
    const awards = (d.achievements || []).length + (d.certificates || []).length;
    const snippets = d.snippets || [];
    const progress = d.progress || [];

    const avatarHtml = p.avatar
      ? '<img class="hero-avatar" data-att="' + esc(p.avatar.id) + '" alt="' + esc(p.name) + '">'
      : '<div class="hero-avatar">' + esc((p.name || '?').trim().charAt(0).toUpperCase()) + '</div>';

    const editAvatar = canEdit()
      ? '<button class="avatar-edit" data-action="change-avatar" title="Change photo" aria-label="Change photo">' + icon('camera') + '</button>'
      : '';

    const statsParts = [
      [projects.length, 'Project' + (projects.length === 1 ? '' : 's')],
      [awards, 'Award' + (awards === 1 ? '' : 's')],
      [snippets.length, 'Code note' + (snippets.length === 1 ? '' : 's')],
      [progress.length, 'Update' + (progress.length === 1 ? '' : 's')]
    ];
    const stats = statsParts.map((s) => '<b>' + s[0] + '</b> ' + s[1]).join('<span>·</span>');

    const linkItems = links.map((l) =>
      '<a class="hero-link" href="' + esc(l.url) + '" target="_blank" rel="noopener">' +
        icon(l.type || 'link') + esc(l.label || 'Link') + '</a>'
    );
    if (p.email) linkItems.unshift(
      '<a class="hero-link" href="mailto:' + esc(p.email) + '">' + icon('email') + esc(p.email) + '</a>');

    document.getElementById('hero-root').innerHTML =
      '<div class="hero-inner">' +
        '<div class="hero-avatar-wrap">' + avatarHtml + editAvatar + '</div>' +
        '<div class="eyebrow center">' + esc(p.kicker || 'Portfolio') + '</div>' +
        '<div class="hero-name-row">' +
          '<h1 class="hero-name' + (canEdit() ? ' editable' : '') + '"' +
            (canEdit() ? ' data-action="edit-profile" title="Click to edit your name and profile"' : '') +
            '>Hi, I\'m <em>' + esc(p.name || 'Your Name') + '.</em></h1>' +
          (canEdit()
            ? '<button class="name-edit" data-action="edit-profile" title="Edit name &amp; profile" aria-label="Edit name and profile">✎</button>'
            : '') +
        '</div>' +
        (p.role ? '<p class="hero-role">' + esc(p.role) + '</p>' : '') +
        (p.bio ? '<p class="hero-bio">' + esc(p.bio) + '</p>' : '') +
        '<div class="hero-actions">' +
          '<a class="btn primary" href="#projects">View my work</a>' +
          (p.resume
            ? '<button class="btn" data-action="view-resume">Resume</button>'
            : (canEdit() ? '<button class="btn" data-action="upload-resume">Upload resume</button>' : '')) +
        '</div>' +
        '<div class="hero-stats">' + stats + '</div>' +
        (linkItems.length ? '<div class="hero-links">' + linkItems.join('') + '</div>' : '') +
      '</div>';
  }

  /* ---------------- progress ---------------- */
  function progress(d) {
    const items = (d.progress || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const body = items.length
      ? '<div class="rows">' + items.map((it) =>
          '<div class="row-item">' +
            '<div class="row-date">' + esc(fmtDate(it.date)) + '</div>' +
            '<div class="row-main">' +
              '<div class="row-top"><h3>' + esc(it.title) + '</h3>' + statusBadge(it.status) + '</div>' +
              (it.detail ? '<p>' + esc(it.detail) + '</p>' : '') +
            '</div>' +
            '<div class="row-actions">' +
              btnSmall('edit-progress', it.id, 'Edit') +
              btnSmall('del-progress', it.id, 'Delete', 'danger') +
            '</div>' +
          '</div>'
        ).join('') + '</div>'
      : emptyState('No updates yet', 'Your progress log is empty — add your first milestone.',
          canEdit() ? '<button class="btn primary" data-action="add-progress">Add update</button>' : '');

    document.getElementById('progress-root').innerHTML =
      sectionHead('01 · Progress', 'Progress', 'A running record of what I am learning, building and shipping.',
        addBtn('add-progress', 'Add update')) +
      body;
  }

  /* ---------------- projects ---------------- */
  function projects(d) {
    const list = d.projects || [];

    const body = list.length
      ? '<div class="grid projects">' + list.map((p) => {
          const cover = (p.attachments || []).find((a) => a.kind === 'image');
          return '<article class="card" data-action="open-project" data-id="' + esc(p.id) + '" tabindex="0" role="button" aria-label="Open ' + esc(p.title) + '">' +
            '<div class="card-actions">' + btnSmall('edit-project', p.id, 'Edit') + btnSmall('del-project', p.id, 'Delete', 'danger') + '</div>' +
            (cover ? '<div class="card-cover"><img data-att="' + esc(cover.id) + '" alt="' + esc(p.title) + '" loading="lazy"></div>' : '') +
            '<div class="card-body">' +
              '<div class="card-meta">' + (p.period ? '<span>' + esc(p.period) + '</span>' : '') + statusBadge(p.status) + '</div>' +
              '<h3>' + esc(p.title) + '<span class="card-arrow">→</span></h3>' +
              '<p class="card-desc">' + esc(p.summary || '') + '</p>' +
              (p.tags && p.tags.length ? '<div class="tagline">' + p.tags.map(esc).join(' · ') + '</div>' : '') +
            '</div>' +
          '</article>';
        }).join('') + '</div>'
      : emptyState('No projects yet', 'Add your first project with code, photos, slides or videos.',
          canEdit() ? '<button class="btn primary" data-action="add-project">Add project</button>' : '');

    document.getElementById('projects-root').innerHTML =
      sectionHead('02 · Projects', 'Projects', 'Detailed write-ups with code, slides, photos and videos for every build.',
        addBtn('add-project', 'Add project')) +
      body;
  }

  /* ---------------- code library ---------------- */
  function code(d, filter) {
    const q = (filter || '').trim().toLowerCase();
    const nq = q.replace(/[^a-z0-9]+/g, '');
    const all = d.snippets || [];
    const list = q
      ? all.filter((s) => {
          const hay = [s.title, s.lang, (s.tags || []).join(' '), s.note].join(' ').toLowerCase();
          if (hay.includes(q)) return true;
          return !!nq && hay.replace(/[^a-z0-9]+/g, '').includes(nq);
        })
      : all;

    const body = list.length
      ? '<div class="grid codes">' + list.map((s) =>
          '<div class="code-card">' +
            '<div class="code-head">' +
              '<span class="cname">' + esc(s.title) + '</span>' +
              '<span class="clang">' + esc(s.lang || 'text') + '</span>' +
              '<span class="cact">' +
                '<button class="btn small ghost" data-action="copy-snippet" data-id="' + esc(s.id) + '">Copy</button>' +
                btnSmall('edit-snippet', s.id, 'Edit') +
                btnSmall('del-snippet', s.id, 'Delete', 'danger') +
              '</span>' +
            '</div>' +
            '<pre class="code"><code>' + esc(s.content || '') + '</code></pre>' +
            (s.note ? '<div class="code-note">' + esc(s.note) + '</div>' : '') +
          '</div>'
        ).join('') + '</div>'
      : emptyState(q ? 'Nothing matches your search' : 'No code saved yet',
          q ? 'Try a different name, language or tag.' : 'Save reusable snippets and study code here.',
          !q && canEdit() ? '<button class="btn primary" data-action="add-snippet">Add snippet</button>' : '');

    document.getElementById('code-root').innerHTML =
      sectionHead('03 · Code', 'Code Library', 'Reusable snippets and study code — searchable and copy-ready.',
        addBtn('add-snippet', 'Add snippet')) +
      '<div class="code-toolbar"><input class="search" id="code-search" type="search" placeholder="Search by name, language or tag…" value="' + esc(filter || '') + '"></div>' +
      body;

    const input = document.getElementById('code-search');
    if (input) {
      input.addEventListener('input', () => {
        const pos = input.selectionStart;
        code(Store.data, input.value);
        const again = document.getElementById('code-search');
        again.focus();
        again.setSelectionRange(pos, pos);
      });
    }
  }

  /* ---------------- award rows (achievements / certificates) ---------------- */
  function awardRows(items, editAction, delAction, glyph, emptyTag, emptyText, addAction, addLabel) {
    const rows = items.map((it) => {
      const att = it.attachment;
      const thumb = att && att.kind === 'image'
        ? '<div class="row-thumb"><img data-att="' + esc(att.id) + '" alt="" loading="lazy"></div>'
        : '<div class="row-thumb">' + icon(glyph) + '</div>';

      const actions = [];
      if (att) {
        actions.push('<a class="btn small ghost" data-att="' + esc(att.id) + '" href="#" target="_blank" rel="noopener">View file</a>');
      }
      if (canEdit()) {
        actions.push(btnSmall(editAction, it.id, 'Edit'));
        actions.push(btnSmall(delAction, it.id, 'Delete', 'danger'));
      }

      return '<div class="row-item award">' +
        thumb +
        '<div class="row-main">' +
          '<div class="row-top"><h3>' + esc(it.title) + '</h3></div>' +
          (it.issuer ? '<div class="row-issuer">' + esc(it.issuer) + '</div>' : '') +
          (it.description ? '<p>' + esc(it.description) + '</p>' : '') +
          (actions.length
            ? '<div class="row-actions" style="opacity:1;margin-top:10px;gap:8px">' + actions.join('') + '</div>'
            : '') +
        '</div>' +
        '<div class="row-date">' + esc(fmtDate(it.date)) + '</div>' +
      '</div>';
    }).join('');

    return items.length
      ? '<div class="rows">' + rows + '</div>'
      : emptyState(emptyTag, emptyText, canEdit() ? '<button class="btn primary" data-action="' + addAction + '">' + addLabel + '</button>' : '');
  }

  /* ---------------- achievements ---------------- */
  function achievements(d) {
    const items = (d.achievements || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    document.getElementById('achievements-root').innerHTML =
      sectionHead('04 · Achievements', 'Achievements', 'Awards and recognitions, with evidence attached.',
        addBtn('add-achievement', 'Add achievement')) +
      awardRows(items, 'edit-achievement', 'del-achievement', 'trophy',
        'No achievements yet', 'Add your awards, hackathon results and honours.',
        'add-achievement', 'Add achievement');
  }

  /* ---------------- certificates ---------------- */
  function certificates(d) {
    const items = (d.certificates || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    document.getElementById('certificates-root').innerHTML =
      sectionHead('05 · Certificates', 'Certificates', 'Courses, internships and certifications — open the file to verify.',
        addBtn('add-certificate', 'Add certificate')) +
      awardRows(items, 'edit-certificate', 'del-certificate', 'seal',
        'No certificates yet', 'Upload certificate images or PDFs so recruiters can verify them.',
        'add-certificate', 'Add certificate');
  }

  /* ---------------- connections ---------------- */
  function connections(d) {
    const p = d.profile || {};
    const links = profileLinks(p);

    const tile = (ico, label, value, href) => {
      const inner = '<div>' + icon(ico) + '</div><div class="ct-text"><strong>' + esc(label) + '</strong><span>' + esc(value) + '</span></div>';
      return href
        ? '<a class="conn-tile" href="' + esc(href) + '" target="_blank" rel="noopener">' + inner + '</a>'
        : '<div class="conn-tile">' + inner + '</div>';
    };

    const tiles = [];
    if (p.email) tiles.push(tile('email', 'Email', p.email, 'mailto:' + p.email));
    if (p.phone) tiles.push(tile('phone', 'Phone', p.phone, 'tel:' + p.phone));
    links.forEach((l) => {
      const display = (l.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
      tiles.push(tile(l.type || 'link', l.label || 'Link', display, l.url));
    });
    if (p.location) tiles.push(tile('location', 'Location', p.location, null));

    const body = tiles.length
      ? '<div class="conn-grid">' + tiles.join('') + '</div>' +
        (p.email ? '<div class="conn-cta"><a class="btn primary" href="mailto:' + esc(p.email) + '">Send me an email</a></div>' : '')
      : emptyState('No connections yet', 'Add your GitHub, LinkedIn and other profile links.',
          canEdit() ? '<button class="btn primary" data-action="edit-profile">Add links</button>' : '');

    document.getElementById('connections-root').innerHTML =
      sectionHead('06 · Connections', 'Connections', 'Everywhere you can find me or reach out.',
        canEdit() ? '<button class="btn small" data-action="edit-profile">Edit profile</button>' : '') +
      body;
  }

  /* ---------------- resume ---------------- */
  function resume(d) {
    const p = d.profile || {};
    const r = p.resume;

    const actions = r
      ? '<div class="resume-actions">' +
          '<button class="btn primary" data-action="view-resume">View resume</button>' +
          '<a class="btn" data-att="' + esc(r.id) + '" href="#" download="' + esc(r.name) + '">Download</a>' +
          (canEdit() ? '<button class="btn ghost" data-action="upload-resume">Replace</button>' +
                       '<button class="btn danger" data-action="remove-resume">Remove</button>' : '') +
        '</div>'
      : '<div class="resume-actions">' +
          (canEdit()
            ? '<button class="btn primary" data-action="upload-resume">Upload resume (PDF)</button>'
            : '<p class="muted" style="margin:0">Resume coming soon.</p>') +
        '</div>';

    document.getElementById('resume-root').innerHTML =
      sectionHead('07 · Resume', 'Resume', 'One click for recruiters to read or download the latest version.', '') +
      '<div class="resume-block">' +
        '<div class="resume-doc">' + icon('doc') + '</div>' +
        '<h3>' + esc(p.name || 'My Resume') + '</h3>' +
        '<p class="muted">' + esc(p.role || '') + '</p>' +
        (r ? '<div class="resume-file">' + esc(r.name) + ' · ' + Files.fmtSize(r.size) + '</div>' : '<div class="resume-file">PDF</div>') +
        actions +
      '</div>';
  }

  /* ---------------- footer ---------------- */
  function footer(d) {
    const p = d.profile || {};
    const stamp = window.__EXPORT__
      ? 'Read-only copy · ' + new Date(window.__EXPORT_GENERATED__ || Date.now()).toLocaleDateString()
      : (Store.mode === 'cloud' ? 'Synced cloud edition' : 'Saved on this device');

    document.getElementById('footer-root').innerHTML =
      '<div class="footer-inner">' +
        '<div>© ' + new Date().getFullYear() + ' <strong>' + esc(p.name || 'Portfolio') + '</strong>' +
          (d.settings && d.settings.tagline ? ' · ' + esc(d.settings.tagline) : '') + '</div>' +
        '<div class="footer-right"><span>' + esc(stamp) + '</span></div>' +
      '</div>';
  }

  /* ---------------- brand mark & favicon ---------------- */
  function syncBrand() {
    const att = Store.data.profile && Store.data.profile.avatar;
    const mark = document.getElementById('brand-mark');
    const fav = document.querySelector('link[rel="icon"]');
    if (att) {
      Files.url(att).then((u) => {
        if (!u) return;
        if (mark) { mark.style.backgroundImage = 'url("' + u + '")'; mark.textContent = ''; }
        if (fav) fav.href = u;
      }).catch(() => {});
    } else {
      if (mark) { mark.style.backgroundImage = ''; mark.textContent = '⚡'; }
      if (fav) fav.href = DEFAULT_FAVICON;
    }
  }

  /* ---------------- all ---------------- */
  function all() {
    const d = Store.data;
    if (d.settings && d.settings.siteTitle) {
      document.getElementById('brand-name').textContent = d.settings.siteTitle;
    }
    document.title = (d.profile && d.profile.name ? d.profile.name + ' — ' : '') +
      (d.settings && d.settings.tagline ? d.settings.tagline : 'Portfolio');

    hero(d);
    progress(d);
    projects(d);
    code(d, (document.getElementById('code-search') || {}).value || '');
    achievements(d);
    certificates(d);
    connections(d);
    resume(d);
    footer(d);
    syncBrand();
    Files.hydrate(document.body);
  }

  return { all, hero, progress, projects, code, achievements, certificates, connections, resume, footer, syncBrand };
})();
