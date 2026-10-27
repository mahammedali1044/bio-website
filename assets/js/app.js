/* ============================================================
   app.js — boot, navigation, action dispatch, owner flows
   ============================================================ */
window.App = (function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const findIn = (arr, id) => (arr || []).find((x) => x.id === id);

  /* ================= theme & accent ================= */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('portfolio.theme', t); } catch (e) { /* ignore */ }
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme');
    applyTheme(cur === 'light' ? 'dark' : 'light');
  }
  function applyAccent() {
    const root = document.documentElement;
    const a = Store.data && Store.data.settings && Store.data.settings.accent;
    if (a && /^#[0-9a-f]{6}$/i.test(a)) root.style.setProperty('--accent', a);
    else root.style.removeProperty('--accent');
  }

  /* ================= owner button ================= */
  function updateOwnerBtn() {
    const btn = $('#owner-btn');
    if (!btn) return;
    const exported = Store.mode === 'export';
    const owner = !exported && Auth.canEdit();

    btn.classList.toggle('hidden', exported);
    $$('[data-action="share"],[data-action="settings"]').forEach((el) => el.classList.toggle('hidden', !owner));
    if (exported) return;

    if (Store.mode === 'cloud') btn.textContent = Auth.user ? 'Sign out' : 'Sign in';
    else btn.textContent = owner ? 'Lock' : 'Owner';
  }

  /* ================= helpers ================= */
  function pickFile(accept, cb) {
    const i = document.createElement('input');
    i.type = 'file';
    if (accept) i.accept = accept;
    i.onchange = () => { if (i.files && i.files[0]) cb(i.files[0]); };
    i.click();
  }

  function fbMsg(e) {
    const c = (e && e.code) || '';
    const map = {
      'auth/invalid-credential': 'Wrong email or password',
      'auth/wrong-password': 'Wrong email or password',
      'auth/user-not-found': 'No account with that email',
      'auth/email-already-in-use': 'That email already has an account — use Sign in instead',
      'auth/weak-password': 'Password must be at least 6 characters',
      'auth/invalid-email': 'That email address looks invalid',
      'auth/too-many-requests': 'Too many attempts — wait a minute and try again',
      'auth/network-request-failed': 'Network error — check your connection'
    };
    return map[c] || (e && e.message) || 'Authentication failed';
  }

  /* ================= gallery ================= */
  async function openGallery(root, startEl) {
    const els = $$('[data-att-item]', root);
    const items = [];
    let start = 0;
    for (const el of els) {
      const id = el.getAttribute('data-att-item');
      const att = Store.attIndex().get(id);
      if (!att) continue;
      const u = await Files.url(att);
      if (!u) continue;
      if (el === startEl) start = items.length;
      items.push({ url: u, name: att.name, kind: att.kind });
    }
    if (items.length) UI.lightbox(items, start);
  }

  /* ================= project detail ================= */
  function projectDetail(id) {
    const p = findIn(Store.data.projects, id);
    if (!p) return;

    const atts = p.attachments || [];
    const imgs = atts.filter((a) => a.kind === 'image');
    const vids = atts.filter((a) => a.kind === 'video');
    const docs = atts.filter((a) => a.kind !== 'image' && a.kind !== 'video');

    const gallery =
      imgs.map((a) =>
        '<div class="media-item" data-att-item="' + esc(a.id) + '">' +
          '<img data-att="' + esc(a.id) + '" alt="' + esc(a.name) + '">' +
          '<span class="mi-name">' + esc(a.name) + '</span></div>').join('') +
      vids.map((a) =>
        '<div class="media-item" data-att-item="' + esc(a.id) + '">' +
          '<video data-att="' + esc(a.id) + '" muted preload="metadata"></video>' +
          '<span class="mi-name">' + esc(a.name) + '</span></div>').join('');

    const docRows = docs.map((a) =>
      '<a class="file-row" data-att="' + esc(a.id) + '" href="#" target="_blank" rel="noopener" download>' +
        '<span class="fico">' + kindIcon(a.kind, a.name) + '</span>' +
        '<span class="fname">' + esc(a.name) + '</span>' +
        '<span class="fsize">' + Files.fmtSize(a.size) + '</span></a>').join('');

    const codeBlocks = (p.code || []).map((c, i) =>
      '<div class="code-card" style="margin-bottom:12px">' +
        '<div class="code-head"><span class="cname">' + esc(c.name || 'code') + '</span>' +
          '<span class="clang">' + esc(c.lang || '') + '</span>' +
          '<span class="cact"><button class="btn small ghost" data-action="copy-project-code" data-id="' + esc(p.id) + '" data-idx="' + i + '">Copy</button></span>' +
        '</div>' +
        '<pre class="code"><code>' + esc(c.content || '') + '</code></pre>' +
      '</div>').join('');

    const bodyHtml =
      (gallery ? '<div class="detail-block"><div class="media-grid">' + gallery + '</div></div>' : '') +
      '<div class="detail-block"><div class="row">' +
        (p.period ? '<span class="tl-date">' + esc(p.period) + '</span>' : '') +
        statusBadge(p.status) +
        (p.tags || []).map((t) => '<span class="tag">' + esc(t) + '</span>').join('') +
      '</div></div>' +
      (p.summary ? '<div class="detail-block"><p><strong>' + esc(p.summary) + '</strong></p></div>' : '') +
      (p.description ? '<div class="detail-block"><h4>Write-up</h4><p class="muted">' + esc(p.description) + '</p></div>' : '') +
      (docRows ? '<div class="detail-block"><h4>Documents &amp; media</h4><div style="display:flex;flex-direction:column;gap:8px">' + docRows + '</div></div>' : '') +
      (codeBlocks ? '<div class="detail-block"><h4>Code</h4>' + codeBlocks + '</div>' : '') +
      ((p.repo || p.demo)
        ? '<div class="detail-block"><div class="row">' +
            (p.repo ? '<a class="btn" href="' + esc(p.repo) + '" target="_blank" rel="noopener">Repository</a>' : '') +
            (p.demo ? '<a class="btn" href="' + esc(p.demo) + '" target="_blank" rel="noopener">Live demo</a>' : '') +
          '</div></div>'
        : '');

    const foot = [];
    if (canEdit()) foot.push({ label: '✎ Edit project', className: 'ghost', onClick: () => { m.close(); projectForm(p); } });
    foot.push({ label: 'Close', className: 'primary', onClick: () => m.close() });

    const m = UI.modal({ title: p.title, wide: true, body: bodyHtml, foot: foot });
    Files.hydrate(m.body);

    m.body.addEventListener('click', (e) => {
      const item = e.target.closest('[data-att-item]');
      if (item) openGallery(m.body, item);
    });
  }

  /* ================= forms ================= */
  function profileForm() {
    const p = JSON.parse(JSON.stringify(Store.data.profile || {}));
    UI.formModal({
      title: 'Edit profile',
      wide: true,
      fields: [
        { key: 'name', label: 'Full name', type: 'text', required: true },
        { key: 'role', label: 'Headline / role', type: 'text', placeholder: 'ECE Engineer · Embedded & Hardware' },
        { key: 'kicker', label: 'Small label above name', type: 'text', placeholder: 'Electronics & Communication' },
        { key: 'studying', label: 'Currently studying', type: 'text', placeholder: 'B.Tech ECE · 2nd Year, 3rd Semester · GMIT University, Davanagere' },
        { key: 'bio', label: 'Bio', type: 'textarea', rows: 4 },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'location', label: 'Location', type: 'text' },
        { key: 'avatar', label: 'Profile photo', type: 'image', previewImages: true, hint: 'Square image works best.' },
        { key: 'resume', label: 'Resume (PDF)', type: 'fileSingle', accept: 'application/pdf' },
        { key: 'links', label: 'Social & work profile links', type: 'linkList' }
      ],
      values: p,
      submitLabel: 'Save profile',
      onSubmit: (v) => {
        Store.update((d) => { d.profile = v; });
        Render.all();
        UI.toast('Profile updated', 'ok');
      }
    });
  }

  function progressForm(item) {
    const isNew = !item;
    const src = item || { id: Store.uid(), date: Store.today(), title: '', status: 'In progress', detail: '' };
    const id = src.id;
    UI.formModal({
      title: isNew ? 'Add progress update' : 'Edit update',
      fields: [
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'What did you achieve?' },
        { key: 'status', label: 'Status', type: 'select', options: ['Planned', 'In progress', 'Completed', 'On hold'] },
        { key: 'detail', label: 'Details', type: 'textarea', rows: 4 }
      ],
      values: src,
      onDelete: isNew ? null : () => {
        Store.update((d) => { d.progress = d.progress.filter((x) => x.id !== id); });
        Render.all();
        UI.toast('Update deleted', 'ok');
      },
      onSubmit: (v) => {
        Store.update((d) => {
          const i = d.progress.findIndex((x) => x.id === v.id);
          if (i >= 0) d.progress[i] = v; else d.progress.push(v);
        });
        Render.all();
        UI.toast('Saved', 'ok');
      }
    });
  }

  function projectForm(item) {
    const isNew = !item;
    const src = item || {
      id: Store.uid(), title: '', period: '', status: 'In progress',
      summary: '', description: '', tags: [], repo: '', demo: '', code: [], attachments: []
    };
    const id = src.id;
    UI.formModal({
      title: isNew ? 'Add project' : 'Edit project',
      wide: true,
      fields: [
        { key: 'title', label: 'Project title', type: 'text', required: true },
        { key: 'period', label: 'Timeline', type: 'text', placeholder: '2026 — present' },
        { key: 'status', label: 'Status', type: 'select', options: ['Planned', 'In progress', 'Completed', 'On hold'] },
        { key: 'summary', label: 'One-line summary (card text)', type: 'text' },
        { key: 'description', label: 'Full write-up', type: 'textarea', rows: 7 },
        { key: 'tags', label: 'Tags', type: 'tags', placeholder: 'ESP32, C, IoT' },
        { key: 'repo', label: 'Repository URL', type: 'url' },
        { key: 'demo', label: 'Demo URL', type: 'url' },
        { key: 'code', label: 'Code files', type: 'codeList', hint: 'Paste code with a file name — recruiters can copy it in one click.' },
        { key: 'attachments', label: 'Files (photos, videos, PPT, PDF, schematics)', type: 'files', hint: 'First image becomes the card cover. Everything appears in project details.' }
      ],
      values: src,
      onDelete: isNew ? null : async () => {
        const p = findIn(Store.data.projects, id);
        if (p) for (const att of p.attachments || []) await Files.remove(att);
        Store.update((d) => { d.projects = d.projects.filter((x) => x.id !== id); });
        Render.all();
        UI.toast('Project deleted', 'ok');
      },
      onSubmit: (v) => {
        Store.update((d) => {
          const i = d.projects.findIndex((x) => x.id === v.id);
          if (i >= 0) d.projects[i] = v; else d.projects.push(v);
        });
        Render.all();
        UI.toast('Project saved', 'ok');
      }
    });
  }

  function snippetForm(item) {
    const isNew = !item;
    const src = item || { id: Store.uid(), title: '', lang: 'c', tags: [], note: '', content: '' };
    const id = src.id;
    UI.formModal({
      title: isNew ? 'Add code snippet' : 'Edit snippet',
      wide: true,
      fields: [
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'lang', label: 'Language', type: 'text', placeholder: 'c, python, verilog…' },
        { key: 'tags', label: 'Tags', type: 'tags' },
        { key: 'note', label: 'Short note', type: 'text' },
        { key: 'content', label: 'Code', type: 'textarea', mono: true, rows: 12, required: true }
      ],
      values: src,
      onDelete: isNew ? null : () => {
        Store.update((d) => { d.snippets = d.snippets.filter((x) => x.id !== id); });
        Render.all();
        UI.toast('Snippet deleted', 'ok');
      },
      onSubmit: (v) => {
        Store.update((d) => {
          const i = d.snippets.findIndex((x) => x.id === v.id);
          if (i >= 0) d.snippets[i] = v; else d.snippets.push(v);
        });
        Render.all();
        UI.toast('Snippet saved', 'ok');
      }
    });
  }

  function awardForm(kind, item) {
    const listName = kind === 'achievement' ? 'achievements' : 'certificates';
    const isNew = !item;
    const src = item || { id: Store.uid(), date: Store.today(), title: '', issuer: '', description: '', attachment: null };
    const id = src.id;
    UI.formModal({
      title: (isNew ? 'Add ' : 'Edit ') + (kind === 'achievement' ? 'achievement' : 'certificate'),
      wide: true,
      fields: [
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'issuer', label: 'Issuer / organisation', type: 'text' },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'attachment', label: 'Certificate / evidence file (image or PDF)', type: 'fileSingle', accept: 'image/*,application/pdf', previewImages: true }
      ],
      values: src,
      onDelete: isNew ? null : async () => {
        const it = findIn(Store.data[listName], id);
        if (it && it.attachment) await Files.remove(it.attachment);
        Store.update((d) => { d[listName] = d[listName].filter((x) => x.id !== id); });
        Render.all();
        UI.toast('Deleted', 'ok');
      },
      onSubmit: (v) => {
        Store.update((d) => {
          const arr = d[listName] || (d[listName] = []);
          const i = arr.findIndex((x) => x.id === v.id);
          if (i >= 0) arr[i] = v; else arr.push(v);
        });
        Render.all();
        UI.toast('Saved', 'ok');
      }
    });
  }

  /* ================= resume ================= */
  async function viewResume() {
    const r = Store.data.profile.resume;
    if (!r) return;
    const url = await Files.url(r);
    if (!url) return UI.toast('Resume file not found', 'err');
    const m = UI.modal({
      title: 'Resume — ' + r.name,
      wide: true,
      body: '<iframe src="' + esc(url) + '" style="width:100%;height:72vh;border:0;border-radius:10px;background:#fff"></iframe>',
      foot: [
        { label: 'Download', className: 'ghost', onClick: () => { const a = document.createElement('a'); a.href = url; a.download = r.name; a.click(); } },
        { label: 'Close', className: 'primary', onClick: () => m.close() }
      ]
    });
  }

  function uploadResume() {
    pickFile('application/pdf', async (file) => {
      try {
        const att = await Files.add(file);
        const old = Store.data.profile.resume;
        if (old) await Files.remove(old);
        Store.update((d) => { d.profile.resume = att; });
        Render.all();
        UI.toast('Resume uploaded', 'ok');
      } catch (e) { UI.toast(e.message || 'Upload failed', 'err'); }
    });
  }

  /* ================= owner flows ================= */
  function passcodeModal() {
    if (!Auth.hasPasscode()) {
      UI.formModal({
        title: 'Set your owner passcode',
        submitLabel: 'Create passcode',
        fields: [
          { key: 'pass', label: 'Passcode (min 4 characters)', type: 'password', required: true, hint: 'Locks editing on this device. Visitors still see the site.' },
          { key: 'again', label: 'Repeat passcode', type: 'password', required: true }
        ],
        values: { pass: '', again: '' },
        onSubmit: async (v) => {
          if (v.pass.length < 4) throw new Error('Use at least 4 characters');
          if (v.pass !== v.again) throw new Error('Passcodes do not match');
          await Auth.setPasscode(v.pass);
          updateOwnerBtn(); Render.all();
          UI.toast('Passcode set — editing unlocked', 'ok');
        }
      });
    } else {
      UI.formModal({
        title: 'Owner unlock',
        submitLabel: 'Unlock',
        fields: [{ key: 'pass', label: 'Passcode', type: 'password', required: true }],
        values: { pass: '' },
        onSubmit: async (v) => {
          const ok = await Auth.verifyPasscode(v.pass);
          if (!ok) throw new Error('Wrong passcode');
          updateOwnerBtn(); Render.all();
          UI.toast('Unlocked — happy editing', 'ok');
        }
      });
    }
  }

  function signInModal() {
    const body = document.createElement('div');
    body.innerHTML =
      '<div class="notice">Sign in with your owner account to edit this portfolio from any device.</div>' +
      '<div class="field"><label>Email</label><input type="email" id="si-email" autocomplete="username" placeholder="you@example.com"></div>' +
      '<div class="field"><label>Password</label><input type="password" id="si-pass" autocomplete="current-password"></div>' +
      '<div id="si-err" style="color:var(--danger);font-size:13.5px;min-height:18px"></div>';

    const m = UI.modal({ title: 'Owner login', body: body, foot: [] });
    const emailEl = $('#si-email', body), passEl = $('#si-pass', body), errEl = $('#si-err', body);
    const setErr = (msg) => { errEl.textContent = msg || ''; };

    function busy(btn, on, label) {
      btn.disabled = on;
      btn.innerHTML = on ? '<span class="spinner"></span> Working…' : label;
    }

    const create = document.createElement('button');
    create.className = 'btn ghost'; create.style.marginRight = 'auto';
    create.textContent = 'Create account';
    create.onclick = async () => {
      setErr('');
      const email = emailEl.value.trim(), pass = passEl.value;
      if (!email || !pass) return setErr('Enter email and password first.');
      busy(create, true, 'Create account');
      try {
        await Auth.signUp(email, pass);
        m.close();
        Store.save();
        Render.all();
        UI.toast('Account created — you are the owner', 'ok');
      } catch (e) { setErr(fbMsg(e)); busy(create, false, 'Create account'); }
    };

    const cancel = document.createElement('button');
    cancel.className = 'btn ghost'; cancel.textContent = 'Cancel';
    cancel.onclick = () => m.close();

    const sign = document.createElement('button');
    sign.className = 'btn primary'; sign.textContent = 'Sign in';
    sign.onclick = async () => {
      setErr('');
      const email = emailEl.value.trim(), pass = passEl.value;
      if (!email || !pass) return setErr('Enter email and password first.');
      busy(sign, true, 'Sign in');
      try {
        await Auth.signIn(email, pass);
        m.close();
        Store.save();
        Render.all();
        UI.toast('Signed in — editing unlocked', 'ok');
      } catch (e) { setErr(fbMsg(e)); busy(sign, false, 'Sign in'); }
    };
    passEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') sign.click(); });

    /* hide public sign-up once the owner UID is configured */
    if (!(window.SITE_CONFIG && SITE_CONFIG.ownerUid)) m.foot.appendChild(create);
    m.foot.appendChild(cancel);
    m.foot.appendChild(sign);
  }

  function toggleOwner() {
    if (Store.mode === 'export') return;
    if (Auth.canEdit()) {
      if (Auth.isCloud()) {
        Auth.signOut().then(() => UI.toast('Signed out', 'ok')).catch((e) => UI.toast(fbMsg(e), 'err'));
      } else {
        Auth.lock();
        UI.toast('Site locked', 'ok');
      }
      updateOwnerBtn(); Render.all();
      return;
    }
    if (Auth.isCloud()) signInModal();
    else passcodeModal();
  }

  /* ================= share & settings ================= */
  function shareModal() {
    const isHttp = location.protocol === 'http:' || location.protocol === 'https:';
    const bodyHtml =
      (isHttp
        ? '<div class="settings-block"><h4>🔗 Your live link</h4><p>Send this to recruiters — they see the site, no login needed.</p>' +
          '<div class="row"><input class="search" id="share-url" readonly value="' + esc(location.href) + '">' +
          '<button class="btn primary" data-action="copy-url">Copy</button></div></div>'
        : '<div class="settings-block"><h4>🔗 Get a shareable link</h4><p>You are running from a local file. Host the folder (Netlify Drop, GitHub Pages — see README) to get a link you can send.</p></div>') +
      '<div class="settings-block"><h4>📦 Export a recruiter copy</h4>' +
        '<p>Downloads a ZIP with a read-only version of your site + all media. Works offline — just unzip and open <span class="kbd">index.html</span>, or drag the folder onto Netlify Drop.</p>' +
        '<div class="row"><button class="btn primary" data-action="export-site">Export site (ZIP)</button>' +
        '<button class="btn" data-action="export-backup">Backup everything</button></div></div>' +
      '<div class="settings-block"><h4>♻️ Restore a backup</h4>' +
        '<p>Import a previously exported backup zip (data + files).</p>' +
        '<button class="btn" data-action="import-backup">Import backup…</button></div>';

    UI.modal({
      title: 'Share & export',
      body: bodyHtml,
      foot: [{ label: 'Close', className: 'ghost', onClick: (e, api) => api.close() }]
    });
  }

  function settingsModal() {
    const cloud = !!Auth.cloudConfigured();
    const bodyHtml =
      '<div class="settings-block"><h4>👤 Profile</h4><p>Your name, headline, bio, photo, email, links and resume — everything shown on the site.</p>' +
        '<button class="btn" data-action="edit-profile">Edit profile</button></div>' +

      '<div class="settings-block"><h4>🎨 Site</h4><p>Title, tagline and accent colour shown across the site.</p>' +
        '<button class="btn" data-action="site-settings">Edit site settings</button></div>' +

      '<div class="settings-block"><h4>👤 Owner access</h4>' +
        '<p>Mode: <strong>' + (Store.mode === 'cloud' ? '☁️ Cloud (login + sync)' : '🔒 This device (passcode)') + '</strong>' +
        (Store.mode === 'cloud' && Auth.user ? ' · signed in as ' + esc(Auth.user.email || '') : '') + '</p>' +
        (Store.mode === 'cloud'
          ? '<button class="btn" data-action="sign-out-now">Sign out</button>'
          : '<button class="btn" data-action="change-passcode">' + (Auth.hasPasscode() ? 'Change passcode' : 'Set passcode') + '</button>') +
      '</div>' +

      '<div class="settings-block"><h4>☁️ Cloud sync (optional)</h4>' +
        '<p>Connect Firebase so your site and files follow you to any device with your login. Paste your Firebase web config object:</p>' +
        '<textarea id="fb-cfg" class="code-input" style="width:100%;min-height:110px;background:var(--code-bg);color:#dbe6ff;border:1px solid var(--border);border-radius:10px;padding:10px;font-family:var(--mono);font-size:12.5px" placeholder=\'{"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}\'></textarea>' +
        '<div class="row" style="margin-top:10px"><button class="btn primary" data-action="cloud-connect">Connect &amp; reload</button>' +
        (cloud ? '<button class="btn danger" data-action="cloud-disconnect">Disconnect</button>' : '') + '</div></div>' +

      '<div class="settings-block"><h4>💾 Data</h4><p>Export, restore, or reset your content.</p>' +
        '<div class="row"><button class="btn" data-action="export-backup">Backup everything</button>' +
        '<button class="btn" data-action="import-backup">Import backup…</button>' +
        '<button class="btn danger" data-action="reset-data">Reset to sample</button>' +
        '<button class="btn danger" data-action="clear-files">Clear local files</button></div></div>';

    UI.modal({
      title: 'Settings',
      body: bodyHtml,
      foot: [{ label: 'Close', className: 'primary', onClick: (e, api) => api.close() }]
    });
  }

  /* ================= dispatch ================= */
  async function dispatch(action, el) {
    const id = el.getAttribute('data-id');

    switch (action) {
      /* header */
      case 'theme': toggleTheme(); break;
      case 'menu': $('#nav').classList.toggle('open'); break;
      case 'owner': toggleOwner(); break;
      case 'share': shareModal(); break;
      case 'settings': settingsModal(); break;

      /* profile */
      case 'edit-profile': {
        const sel = window.getSelection();
        if (sel && sel.toString().trim()) break; // ignore drag-selects over the name
        profileForm();
        break;
      }
      case 'change-avatar':
        pickFile('image/*', async (file) => {
          try {
            const att = await Files.add(file);
            const old = Store.data.profile.avatar;
            Store.update((d) => { d.profile.avatar = att; });
            if (old) await Files.remove(old);
            Render.all();
            UI.toast('Profile photo updated', 'ok');
          } catch (e) { UI.toast(e.message || 'Upload failed', 'err'); }
        });
        break;

      /* progress */
      case 'add-progress': progressForm(null); break;
      case 'edit-progress': progressForm(findIn(Store.data.progress, id)); break;
      case 'del-progress':
        if (await UI.confirm('Delete this update?')) {
          Store.update((d) => { d.progress = d.progress.filter((x) => x.id !== id); });
          Render.all(); UI.toast('Deleted', 'ok');
        }
        break;

      /* projects */
      case 'add-project': projectForm(null); break;
      case 'edit-project': projectForm(findIn(Store.data.projects, id)); break;
      case 'open-project': projectDetail(id); break;
      case 'del-project': {
        const p = findIn(Store.data.projects, id);
        if (p && await UI.confirm('Delete "' + p.title + '" and its files?')) {
          for (const att of p.attachments || []) await Files.remove(att);
          Store.update((d) => { d.projects = d.projects.filter((x) => x.id !== id); });
          Render.all(); UI.toast('Project deleted', 'ok');
        }
        break;
      }

      /* snippets */
      case 'add-snippet': snippetForm(null); break;
      case 'edit-snippet': snippetForm(findIn(Store.data.snippets, id)); break;
      case 'del-snippet':
        if (await UI.confirm('Delete this snippet?')) {
          Store.update((d) => { d.snippets = d.snippets.filter((x) => x.id !== id); });
          Render.all(); UI.toast('Deleted', 'ok');
        }
        break;
      case 'copy-snippet': {
        const s = findIn(Store.data.snippets, id);
        if (s) UI.copy(s.content, 'Snippet copied');
        break;
      }
      case 'copy-project-code': {
        const p = findIn(Store.data.projects, id);
        const c = p && (p.code || [])[Number(el.getAttribute('data-idx'))];
        if (c) UI.copy(c.content, 'Code copied');
        break;
      }

      /* awards */
      case 'add-achievement': awardForm('achievement', null); break;
      case 'edit-achievement': awardForm('achievement', findIn(Store.data.achievements, id)); break;
      case 'del-achievement':
        if (await UI.confirm('Delete this achievement?')) {
          const it = findIn(Store.data.achievements, id);
          if (it && it.attachment) await Files.remove(it.attachment);
          Store.update((d) => { d.achievements = d.achievements.filter((x) => x.id !== id); });
          Render.all(); UI.toast('Deleted', 'ok');
        }
        break;
      case 'add-certificate': awardForm('certificate', null); break;
      case 'edit-certificate': awardForm('certificate', findIn(Store.data.certificates, id)); break;
      case 'del-certificate':
        if (await UI.confirm('Delete this certificate?')) {
          const it = findIn(Store.data.certificates, id);
          if (it && it.attachment) await Files.remove(it.attachment);
          Store.update((d) => { d.certificates = d.certificates.filter((x) => x.id !== id); });
          Render.all(); UI.toast('Deleted', 'ok');
        }
        break;

      /* resume */
      case 'view-resume': viewResume(); break;
      case 'upload-resume': uploadResume(); break;
      case 'remove-resume':
        if (await UI.confirm('Remove the uploaded resume?')) {
          const r = Store.data.profile.resume;
          if (r) await Files.remove(r);
          Store.update((d) => { d.profile.resume = null; });
          Render.all(); UI.toast('Resume removed', 'ok');
        }
        break;
      case 'print-resume': {
        const r = Store.data.profile.resume;
        if (r) { const u = await Files.url(r); if (u) window.open(u, '_blank'); }
        break;
      }

      /* share / export */
      case 'copy-url': UI.copy(location.href, 'Link copied'); break;
      case 'export-site':
        UI.toast('Building your export…');
        Exporter.site().catch((e) => UI.toast(e.message, 'err'));
        break;
      case 'export-backup':
        UI.toast('Packing backup…');
        Exporter.backup().catch((e) => UI.toast(e.message, 'err'));
        break;
      case 'import-backup':
        pickFile('.zip,application/zip', (f) => {
          Exporter.restore(f).catch((e) => UI.toast(e.message || 'Import failed', 'err'));
        });
        break;

      /* settings */
      case 'site-settings':
        document.getElementById('modal-root').innerHTML = '';
        UI.formModal({
          title: 'Site settings',
          fields: [
            { key: 'siteTitle', label: 'Site title (top-left)', type: 'text' },
            { key: 'tagline', label: 'Tagline (footer + title)', type: 'text' },
            { key: 'accent', label: 'Accent colour', type: 'color' }
          ],
          values: Object.assign({ siteTitle: 'Portfolio', tagline: 'Projects · Progress · Achievements', accent: '#6c8cff' }, Store.data.settings || {}),
          onSubmit: (v) => {
            Store.update((d) => { d.settings = Object.assign({}, d.settings, v); });
            applyAccent(); Render.all();
            UI.toast('Site settings saved', 'ok');
          }
        });
        break;
      case 'change-passcode': passcodeModal(); break;
      case 'sign-out-now':
        Auth.signOut().catch(() => {});
        document.getElementById('modal-root').innerHTML = '';
        updateOwnerBtn(); Render.all();
        UI.toast('Signed out', 'ok');
        break;
      case 'cloud-connect': {
        const ta = $('#fb-cfg');
        if (!ta || !ta.value.trim()) return UI.toast('Paste your Firebase config first', 'warn');
        let cfg;
        try { cfg = JSON.parse(ta.value.trim()); } catch (e) { return UI.toast('That is not valid JSON', 'err'); }
        if (!cfg.apiKey || !cfg.projectId) return UI.toast('Config must include apiKey and projectId', 'err');
        Auth.setCloudConfig(cfg);
        UI.toast('Connected — reloading…', 'ok');
        setTimeout(() => location.reload(), 700);
        break;
      }
      case 'cloud-disconnect':
        if (await UI.confirm('Disconnect cloud sync? Your data stays on this device.')) {
          Auth.setCloudConfig(null);
          location.reload();
        }
        break;
      case 'reset-data':
        if (await UI.confirm('Replace ALL your content with the sample data? This cannot be undone (export a backup first).')) {
          Store.reset(); applyAccent(); Render.all();
          UI.toast('Reset to sample content', 'ok');
        }
        break;
      case 'clear-files':
        if (await UI.confirm('Delete every locally stored file (images, videos, PDFs)? Text content stays.')) {
          Files.revokeAll();
          try { await IDB.clear(); } catch (e) { /* ignore */ }
          UI.toast('Local files cleared — re-upload them as needed', 'ok');
        }
        break;
      default: break;
    }
  }

  /* ================= wiring ================= */
  function wire() {
    document.addEventListener('click', async (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      if (el.tagName === 'A' && (el.getAttribute('href') || '#') === '#') e.preventDefault();
      try {
        await dispatch(el.getAttribute('data-action'), el, e);
      } catch (err) {
        console.error(err);
        UI.toast(err.message || 'Something went wrong', 'err');
      }
    });

    $$('#nav a').forEach((a) => a.addEventListener('click', () => $('#nav').classList.remove('open')));

    /* active nav section */
    const secs = ['home', 'progress', 'projects', 'code', 'achievements', 'certificates', 'connections', 'resume']
      .map((s) => document.getElementById(s)).filter(Boolean);
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          $$('#nav a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      secs.forEach((s) => obs.observe(s));
    }

    window.addEventListener('beforeunload', () => Files.revokeAll());
  }

  /* ================= boot ================= */
  async function boot() {
    let theme = 'dark';
    try { theme = localStorage.getItem('portfolio.theme') || 'dark'; } catch (e) { /* ignore */ }
    applyTheme(theme);

    try {
      await Store.init();
    } catch (e) {
      console.error(e);
      UI.toast('Startup error: ' + e.message, 'err');
    }

    applyAccent();
    Auth.onChange(() => { updateOwnerBtn(); Render.all(); });
    wire();
    updateOwnerBtn();
    Render.all();

    if (Store.mode === 'local' && Auth.unlocked) updateOwnerBtn();
  }

  return { boot, toggleTheme, applyAccent, updateOwnerBtn, projectDetail };
})();

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => App.boot());
else App.boot();

/* ============================================================
   Live update check — GitHub Pages caches HTML/assets for
   10 minutes (max-age=600). Every open tab polls for a newer
   data-build marker (fetched with a cache-busting query, so the
   response is always fresh) and reloads when this build differs.
   Bump data-build AND the ?v= number on every asset tag in
   index.html whenever you push an update (keep them equal).
   ============================================================ */
(function () {
  'use strict';
  if (window.__EXPORT__) return; // exported copies never poll

  async function checkForNewBuild() {
    try {
      const r = await fetch('index.html?build=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) return;
      const html = await r.text();
      const m = /data-build="([^"]+)"/.exec(html);
      const cur = document.documentElement.getAttribute('data-build');
      if (m && cur && m[1] !== cur) {
        // load through a unique query so the edge cache can never serve stale HTML
        location.href = location.pathname + '?v=' + Date.now();
      }
    } catch (e) { /* offline or transient — try again next minute */ }
  }

  setInterval(checkForNewBuild, 60000);
})();
