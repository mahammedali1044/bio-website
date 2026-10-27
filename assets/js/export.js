/* ============================================================
   export.js — recruiter site export, full backup & restore
   ============================================================ */
window.Exporter = (function () {
  'use strict';

  const JSZIP_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
  const SITE_FILES = [
    'assets/css/styles.css',
    'assets/js/config.js',
    'assets/js/idb.js',
    'assets/js/store.js',
    'assets/js/ui.js',
    'assets/js/export.js',
    'assets/js/app.js'
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.onload = resolve;
      s.onerror = () => reject(new Error('Could not load ' + src));
      document.head.appendChild(s);
    });
  }

  async function zipLib() {
    if (window.JSZip) return;
    try { await loadScript(JSZIP_CDN); } catch (e) { /* offline? */ }
    if (!window.JSZip) throw new Error('Export needs an internet connection the first time (JSZip CDN).');
  }

  function safeName(n) {
    return String(n || 'file').replace(/[^\w.\-]+/g, '_').slice(-70);
  }

  function stamp() {
    const d = new Date(), p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
  }

  function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }

  /* ----------------------------------------------------------
     Full backup (data + every media file) — restorable
     ---------------------------------------------------------- */
  async function backup() {
    await zipLib();
    const zip = new JSZip();
    const data = JSON.parse(JSON.stringify(Store.data));
    const atts = Store.allAttachments(data);

    let ok = 0, failed = 0;
    for (const att of atts) {
      try {
        const blob = await Files.bytes(att);
        zip.file('media/' + att.id, blob);
        ok++;
      } catch (e) {
        console.warn('Backup skipped ' + att.name, e);
        failed++;
      }
    }

    zip.file('backup.json', JSON.stringify({
      app: 'portfolio', version: 1,
      date: new Date().toISOString(),
      data: data
    }, null, 2));

    zip.file('README.txt',
      'PORTFOLIO BACKUP\n' +
      '================\n' +
      'Created: ' + new Date().toLocaleString() + '\n' +
      'Files included: ' + ok + (failed ? ' (' + failed + ' skipped)' : '') + '\n\n' +
      'TO RESTORE:\n' +
      '1. Open your portfolio website.\n' +
      '2. Sign in as owner.\n' +
      '3. Settings -> Data -> Import backup.\n' +
      '4. Choose THIS zip file.\n');

    const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
    download(blob, 'portfolio-backup-' + stamp() + '.zip');
    UI.toast('Backup downloaded (' + ok + ' files)', ok ? 'ok' : 'warn');
  }

  /* ----------------------------------------------------------
     Restore a backup zip
     ---------------------------------------------------------- */
  async function restore(file) {
    await zipLib();
    const zip = await JSZip.loadAsync(file);
    const entry = zip.file('backup.json');
    if (!entry) throw new Error('That file is not a portfolio backup (no backup.json).');

    const parsed = JSON.parse(await entry.async('string'));
    const data = parsed && parsed.data;
    if (!data || !data.profile) throw new Error('Backup data looks damaged.');

    const atts = Store.allAttachments(data);
    let restored = 0;
    for (const att of atts) {
      const media = zip.file('media/' + att.id);
      if (!media) continue;
      try {
        const blob = await media.async('blob');
        if (Store.mode === 'cloud') {
          const nf = await Files.add(new File([blob], att.name || 'file', { type: att.mime || '' }));
          att.src = nf.src;
          delete att.ref; delete att.exportSrc;
        } else {
          await IDB.put(att.id, blob);
          att.ref = att.id;
          delete att.src; delete att.exportSrc;
        }
        restored++;
      } catch (e) {
        console.warn('Could not restore ' + att.name, e);
      }
    }

    const live = Store.data;
    Object.keys(live).forEach((k) => delete live[k]);
    Object.assign(live, data);
    Store.save();
    Render.all();
    UI.toast('Backup restored — ' + restored + ' media files', 'ok');
  }

  /* ----------------------------------------------------------
     Read-only recruiter site (ZIP, works offline, no login)
     ---------------------------------------------------------- */
  async function site() {
    await zipLib();

    let html;
    try {
      const r = await fetch('index.html', { cache: 'no-store' });
      if (!r.ok) throw new Error('bad status');
      html = await r.text();
    } catch (e) {
      throw new Error('Could not read index.html. Export must run from a web server (hosted site or local server) — not from a file:// page.');
    }

    const zip = new JSZip();

    for (const path of SITE_FILES) {
      const r = await fetch(path, { cache: 'no-store' });
      if (!r.ok) throw new Error('Missing site file: ' + path);
      zip.file(path, await r.text());
    }

    /* collect media bytes and rewrite attachment references */
    const data = JSON.parse(JSON.stringify(Store.data));
    const atts = Store.allAttachments(data);
    let ok = 0;
    for (const att of atts) {
      try {
        const blob = await Files.bytes(att);
        const fname = 'files/' + att.id + '__' + safeName(att.name);
        zip.file(fname, blob);
        att.exportSrc = fname;
        delete att.src; delete att.ref;
        ok++;
      } catch (e) {
        console.warn('Export skipped ' + att.name, e);
        delete att.src; delete att.ref; delete att.exportSrc;
      }
    }

    const boot =
      '<scr' + 'ipt>window.__EXPORT__=true;' +
      'window.__EXPORT_GENERATED__=' + Date.now() + ';' +
      'window.__EXPORT_DATA__=' + JSON.stringify(data).replace(/</g, '\\u003c') +
      ';</scr' + 'ipt>\n';

    const marker = '<script src="assets/js/config.js">';
    if (html.indexOf(marker) === -1) throw new Error('Unexpected index.html — cannot inject export data.');
    html = html.replace(marker, boot + marker);

    zip.file('index.html', html);

    zip.file('README.txt',
      'RECRUITER COPY OF THIS PORTFOLIO\n' +
      '================================\n' +
      'Generated: ' + new Date().toLocaleString() + '\n' +
      'Media files included: ' + ok + '\n\n' +
      '1. Unzip this folder.\n' +
      '2. Open index.html in any browser (double-click works, no server needed).\n' +
      '3. Share: send the whole folder as a zip, or upload it to Netlify Drop\n' +
      '   (https://app.netlify.com/drop) to get a shareable link.\n\n' +
      'This copy is read-only: there is no edit mode and no login.\n');

    const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
    download(blob, 'portfolio-site-' + stamp() + '.zip');
    UI.toast('Recruiter site exported (' + ok + ' media files)', 'ok');
  }

  return { backup, restore, site };
})();
