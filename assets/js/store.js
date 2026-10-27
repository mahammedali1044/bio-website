/* ============================================================
   store.js — data model, persistence (local / Firebase cloud),
              file storage and owner authentication
   ============================================================ */
window.Store = (function () {
  'use strict';

  const LS_DATA = 'portfolio.data.v1';
  const LS_FB_CONFIG = 'portfolio.firebase.config';

  /* ---------------- helpers ---------------- */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function today() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  /* ---------------- sample content (edit or delete it all) ---------------- */
  function seed() {
    return {
      version: 1,
      settings: {
        siteTitle: 'Portfolio',
        tagline: 'Projects · Progress · Achievements',
        accent: ''
      },
      profile: {
        name: 'Mahammed Ali B',
        role: 'ECE Engineer · Embedded & Hardware',
        studying: 'B.Tech ECE · 2nd Year, 3rd Semester · GMIT University, Davanagere',
        kicker: 'Electronics & Communication',
        bio: 'Electronics & Communication engineering student focused on embedded systems, PCB design and IoT. Every project, experiment and milestone I collect lives right here — code, slides, photos and videos included.',
        email: 'you@example.com',
        phone: '',
        location: 'India',
        avatar: null,
        resume: null,
        links: [
          { id: uid(), label: 'GitHub', type: 'github', url: 'https://github.com/yourhandle' },
          { id: uid(), label: 'LinkedIn', type: 'linkedin', url: 'https://linkedin.com/in/yourhandle' }
        ]
      },
      progress: [
        {
          id: uid(), date: today(), title: 'Built this portfolio site',
          detail: 'Set up a personal hub for all my project files, code and achievements.',
          status: 'Completed'
        },
        {
          id: uid(), date: '2026-08-01', title: 'Started embedded systems track',
          detail: 'Working through STM32 / ESP32 peripherals, RTOS concepts and sensor interfacing.',
          status: 'In progress'
        },
        {
          id: uid(), date: '2026-06-15', title: 'First PCB fabricated',
          detail: 'Ordered a 2-layer board for a sensor node — learned schematic capture, DRC and assembly.',
          status: 'Completed'
        }
      ],
      projects: [
        {
          id: uid(),
          title: 'IoT Air Quality Monitor',
          period: '2026 — present',
          status: 'In progress',
          summary: 'ESP32 node that logs temperature, humidity, CO₂ and particulates to a dashboard.',
          description: 'A battery-friendly environmental monitor built around the ESP32.\n\n• SHT31 + MH-Z19B + PMS5003 sensor interfacing over I²C/UART\n• Deep-sleep duty cycling for multi-day battery life\n• MQTT publishing with local SPIFFS buffering when offline\n• Enclosure designed in Fusion 360',
          tags: ['ESP32', 'C', 'MQTT', 'IoT'],
          repo: 'https://github.com/yourhandle/air-quality-monitor',
          demo: '',
          code: [
            {
              id: uid(), name: 'sensor_task.c', lang: 'c',
              content: 'void sensor_task(void *arg) {\n    sht31_t env;\n    for (;;) {\n        if (sht31_read(&env) == 0) {\n            mqtt_publish("home/aq/temp", env.temp_c);\n            mqtt_publish("home/aq/hum",  env.hum_pct);\n        }\n        vTaskDelay(pdMS_TO_TICKS(30000)); // sample every 30 s\n    }\n}'
            }
          ],
          attachments: []
        },
        {
          id: uid(),
          title: 'Adjustable Bench Power Supply',
          period: '2026',
          status: 'Completed',
          summary: '0–30 V / 3 A linear supply with constant-current mode and digital readout.',
          description: 'Design project covering power electronics fundamentals:\n\n• Transformer → bridge rectifier → pass transistor regulation\n• LM317 current-limiting loop with thermal shutdown\n• 12-bit ADC readout on an STM32 with a 16×2 LCD\n• Full schematic, BOM and layout in KiCad',
          tags: ['KiCad', 'STM32', 'Power Electronics'],
          repo: '', demo: '',
          code: [],
          attachments: []
        },
        {
          id: uid(),
          title: 'FreeRTOS Scheduler Study',
          period: '2026',
          status: 'Planned',
          summary: 'Notes, benchmarks and demo tasks comparing preemptive vs. cooperative scheduling.',
          description: 'A study project: implement priority-based task switching on an STM32 board, measure context-switch latency and document the results as slides.',
          tags: ['FreeRTOS', 'C', 'RTOS'],
          repo: '', demo: '',
          code: [],
          attachments: []
        }
      ],
      snippets: [
        {
          id: uid(), title: 'ESP32 Wi-Fi auto-reconnect helper', lang: 'c', tags: ['ESP32', 'Wi-Fi'],
          note: 'Keeps the station interface alive across AP drops.',
          content: 'void wifi_ensure_connected(void) {\n    if (WiFi.status() == WL_CONNECTED) return;\n    WiFi.disconnect(true);\n    delay(100);\n    WiFi.begin(WIFI_SSID, WIFI_PASS);\n    uint32_t start = millis();\n    while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {\n        delay(200);\n    }\n}'
        },
        {
          id: uid(), title: 'Serial plotter parser', lang: 'python', tags: ['tools', 'serial'],
          note: 'Reads "name:value" lines and streams them to a live plot.',
          content: 'import serial, matplotlib.pyplot as plt\n\nser = serial.Serial("COM5", 115200, timeout=1)\nfig, ax = plt.subplots()\nlines = {}\n\nwhile True:\n    line = ser.readline().decode(errors="ignore").strip()\n    if ":" not in line:\n        continue\n    name, value = line.split(":", 1)\n    if name not in lines:\n        lines[name], = ax.plot([], [], label=name)\n        ax.legend()\n    xs, ys = lines[name].get_data()\n    lines[name].set_data(list(xs) + [len(xs)], list(ys) + [float(value)])\n    ax.relim(); ax.autoscale_view(); plt.pause(0.01)'
        }
      ],
      achievements: [
        {
          id: uid(), date: '2026-03-01', title: '1st place — College Innovation Challenge',
          issuer: 'Dept. of ECE', description: 'Led a 3-member team to build an IoT soil-monitoring prototype in 24 hours.',
          attachment: null
        },
        {
          id: uid(), date: '2025-11-01', title: 'Smart India Hackathon finalist',
          issuer: 'SIH 2025', description: 'Selected among 40 teams from 600+ registrations at institute level.',
          attachment: null
        }
      ],
      certificates: [
        {
          id: uid(), date: '2026-01-15', title: 'Embedded Systems — Internship',
          issuer: 'Sample Company Pvt. Ltd.', description: '8-week internship on firmware bring-up and device drivers.',
          attachment: null
        }
      ]
    };
  }

  /* ---------------- state ---------------- */
  const state = {
    mode: 'local',          // 'local' | 'cloud' | 'export'
    data: seed(),
    ready: false
  };

  function sanitize(d) {
    return JSON.parse(JSON.stringify(d));
  }

  /* ---------------- persistence ---------------- */
  function saveLocal() {
    try {
      localStorage.setItem(LS_DATA, JSON.stringify(state.data));
    } catch (e) {
      console.error(e);
      if (window.UI) UI.toast('Could not save locally (storage full?)', 'err');
    }
  }

  let cloudTimer = null;
  function saveCloud() {
    if (!window.Auth || !Auth.user) return;          // visitors cannot write
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(() => {
      const db = firebase.firestore();
      db.collection('portfolio').doc('main')
        .set(sanitize(state.data))
        .then(() => { if (window.UI) UI.toast('Saved to cloud', 'ok'); })
        .catch((e) => { console.error(e); if (window.UI) UI.toast('Cloud save failed: ' + e.message, 'err'); });
    }, 600);
  }

  function save() {
    if (state.mode === 'local') saveLocal();
    else if (state.mode === 'cloud') saveCloud();
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(LS_DATA);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.profile) return parsed;
      }
    } catch (e) { console.error(e); }
    return null;
  }

  /* ---------------- init ---------------- */
  async function init() {
    if (window.__EXPORT__) {
      state.mode = 'export';
      state.data = window.__EXPORT_DATA__ || seed();
      state.ready = true;
      return state;
    }

    const fbCfg = window.Auth ? Auth.cloudConfigured() : null;
    if (fbCfg) {
      const ok = await Auth.initCloud();
      if (ok) {
        state.mode = 'cloud';
        try {
          const snap = await firebase.firestore().collection('portfolio').doc('main').get();
          if (snap.exists) state.data = sanitize(snap.data());
          else state.data = loadLocal() || seed();
        } catch (e) {
          console.error(e);
          state.data = loadLocal() || seed();
          if (window.UI) UI.toast('Cloud read failed — check Firestore rules', 'warn');
        }
        state.ready = true;
        return state;
      }
    }

    state.mode = 'local';
    state.data = loadLocal() || seed();
    state.ready = true;
    return state;
  }

  function reset() {
    state.data = seed();
    save();
  }

  function update(mutator) {
    mutator(state.data);
    save();
  }

  /* ---------------- attachment helpers ---------------- */
  function allAttachments(d) {
    d = d || state.data;
    const out = [];
    if (d.profile) {
      if (d.profile.avatar) out.push(d.profile.avatar);
      if (d.profile.resume) out.push(d.profile.resume);
    }
    (d.projects || []).forEach((p) => (p.attachments || []).forEach((a) => out.push(a)));
    (d.achievements || []).forEach((a) => a.attachment && out.push(a.attachment));
    (d.certificates || []).forEach((c) => c.attachment && out.push(c.attachment));
    return out;
  }

  function attIndex() {
    const map = new Map();
    allAttachments().forEach((a) => map.set(a.id, a));
    return map;
  }

  return {
    get mode() { return state.mode; },
    get data() { return state.data; },
    get ready() { return state.ready; },
    uid: uid,
    today: today,
    seed: seed,
    init: init,
    save: save,
    update: update,
    reset: reset,
    loadLocal: loadLocal,
    allAttachments: allAttachments,
    attIndex: attIndex,
    LS_DATA: LS_DATA,
    LS_FB_CONFIG: LS_FB_CONFIG
  };
})();

/* ============================================================
   Files — upload / resolve media (IndexedDB local, Firebase cloud)
   ============================================================ */
window.Files = (function () {
  'use strict';

  const urlCache = new Map();   // attId -> objectURL

  function kindOf(mime) {
    mime = (mime || '').toLowerCase();
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime === 'application/pdf') return 'pdf';
    if (mime.includes('presentation') || mime.includes('powerpoint') || mime.endsWith('.ppt') || mime.includes('msword') || mime.includes('officedocument') || mime.includes('text/')) return 'doc';
    return 'other';
  }

  function extOf(name) {
    const i = name.lastIndexOf('.');
    return i > -1 ? name.slice(i + 1).toLowerCase() : '';
  }

  function fmtSize(bytes) {
    if (!bytes && bytes !== 0) return '';
    const u = ['B', 'KB', 'MB', 'GB'];
    let i = 0, n = bytes;
    while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
    return (i === 0 ? n : n.toFixed(1)) + ' ' + u[i];
  }

  /* Store a File/Blob, return attachment descriptor */
  async function add(file) {
    const att = {
      id: Store.uid(),
      name: file.name || 'file',
      mime: file.type || '',
      size: file.size || 0,
      kind: kindOf(file.type || ''),
      when: Date.now()
    };

    if (Store.mode === 'cloud' && window.firebase && firebase.storage) {
      const safe = att.name.replace(/[^\w.\-]+/g, '_');
      const ref = firebase.storage().ref('files/' + att.id + '_' + safe);
      await ref.put(file);
      att.src = await ref.getDownloadURL();
    } else {
      if (!IDB.available) throw new Error('Local file storage is unavailable in this browser. Use a local server or connect cloud mode.');
      await IDB.put(att.id, file);
      att.ref = att.id;
    }
    return att;
  }

  /* Resolve an attachment to a usable URL (async) */
  async function url(att) {
    if (!att) return null;
    if (att.exportSrc) return att.exportSrc;
    if (att.src) return att.src;
    if (att.ref) {
      if (urlCache.has(att.id)) return urlCache.get(att.id);
      try {
        const blob = await IDB.get(att.ref);
        if (!blob) return null;
        const u = URL.createObjectURL(blob);
        urlCache.set(att.id, u);
        return u;
      } catch (e) { console.error(e); return null; }
    }
    return null;
  }

  /* Raw bytes (for exports) */
  async function bytes(att) {
    if (att.src) {
      const r = await fetch(att.src);
      if (!r.ok) throw new Error('Download failed: ' + att.name);
      return await r.blob();
    }
    if (att.exportSrc) {
      const r = await fetch(att.exportSrc);
      if (!r.ok) throw new Error('Download failed: ' + att.name);
      return await r.blob();
    }
    if (att.ref) {
      const b = await IDB.get(att.ref);
      if (!b) throw new Error('File missing locally: ' + att.name);
      return b;
    }
    throw new Error('No file data: ' + att.name);
  }

  /* Fill every [data-att] element in a rendered subtree */
  async function hydrate(root) {
    const nodes = Array.from((root || document).querySelectorAll('[data-att]'));
    if (!nodes.length) return;
    const index = Store.attIndex();
    await Promise.all(nodes.map(async (el) => {
      const att = index.get(el.getAttribute('data-att'));
      const u = att ? await url(att) : null;
      if (!u) { el.setAttribute('data-missing', '1'); return; }
      if (el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.tagName === 'IFRAME') {
        el.src = u;
      } else {
        el.href = u;
        if (el.hasAttribute('download')) el.setAttribute('download', att.name);
      }
      el.dispatchEvent(new CustomEvent('att:resolved', { bubbles: true }));
    }));
  }

  /* Remove attachment meta + underlying blob (best effort) */
  async function remove(att) {
    if (!att) return;
    if (att.ref) { try { await IDB.del(att.ref); } catch (e) { /* ignore */ } }
    if (urlCache.has(att.id)) {
      URL.revokeObjectURL(urlCache.get(att.id));
      urlCache.delete(att.id);
    }
    if (att.src && Store.mode === 'cloud' && window.firebase && firebase.storage) {
      try { await firebase.storage().refFromURL(att.src).delete(); } catch (e) { /* best effort */ }
    }
  }

  function revokeAll() {
    urlCache.forEach((u) => URL.revokeObjectURL(u));
    urlCache.clear();
  }

  return { kindOf, extOf, fmtSize, add, url, bytes, hydrate, remove, revokeAll };
})();

/* ============================================================
   Auth — cloud login (Firebase) + local owner passcode
   ============================================================ */
window.Auth = (function () {
  'use strict';

  const LS_SALT = 'portfolio.owner.salt';
  const LS_HASH = 'portfolio.owner.hash';
  const LS_UNLOCK = 'portfolio.owner.unlocked';

  const listeners = [];
  const state = { user: null, unlocked: localStorage.getItem(LS_UNLOCK) === '1', cloudReady: false };

  function emit() { listeners.forEach((cb) => { try { cb(); } catch (e) { console.error(e); } }); }
  function onChange(cb) { listeners.push(cb); }

  /* ---------- cloud config ---------- */
  function cloudConfigured() {
    let cfg = null;
    try {
      const stored = localStorage.getItem(Store.LS_FB_CONFIG);
      if (stored) cfg = JSON.parse(stored);
    } catch (e) { /* ignore */ }
    if (!cfg && window.SITE_CONFIG && SITE_CONFIG.firebase) cfg = SITE_CONFIG.firebase;
    return (cfg && cfg.apiKey && cfg.projectId) ? cfg : null;
  }

  function setCloudConfig(cfg) {
    if (cfg) localStorage.setItem(Store.LS_FB_CONFIG, JSON.stringify(cfg));
    else localStorage.removeItem(Store.LS_FB_CONFIG);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src="' + src + '"]')) return resolve();
      const s = document.createElement('script');
      s.src = src; s.onload = resolve;
      s.onerror = () => reject(new Error('Could not load ' + src));
      document.head.appendChild(s);
    });
  }

  let initPromise = null;
  function initCloud() {
    if (initPromise) return initPromise;
    const cfg = cloudConfigured();
    if (!cfg) return Promise.resolve(false);

    initPromise = (async () => {
      try {
        const base = 'https://www.gstatic.com/firebasejs/10.12.2/';
        await loadScript(base + 'firebase-app-compat.js');
        await loadScript(base + 'firebase-auth-compat.js');
        await loadScript(base + 'firebase-firestore-compat.js');
        await loadScript(base + 'firebase-storage-compat.js');
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        firebase.auth().onAuthStateChanged((user) => {
          state.user = user || null;
          state.cloudReady = true;
          emit();
        });
        return true;
      } catch (e) {
        console.error(e);
        if (window.UI) UI.toast('Cloud init failed: ' + e.message, 'err');
        return false;
      }
    })();
    return initPromise;
  }

  function signIn(email, pass) {
    return firebase.auth().signInWithEmailAndPassword(email, pass);
  }
  function signUp(email, pass) {
    return firebase.auth().createUserWithEmailAndPassword(email, pass);
  }
  function signOut() {
    return firebase.auth().signOut();
  }

  /* ---------- local passcode ---------- */
  async function hashPass(salt, pass) {
    const data = new TextEncoder().encode(salt + '::' + pass);
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    /* fallback (non-secure contexts) */
    let h = 0;
    const s = salt + '::' + pass;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return 'fb' + (h >>> 0).toString(16);
  }

  async function setPasscode(pass) {
    const salt = Store.uid() + Store.uid();
    const hash = await hashPass(salt, pass);
    localStorage.setItem(LS_SALT, salt);
    localStorage.setItem(LS_HASH, hash);
    return true;
  }
  function hasPasscode() { return !!localStorage.getItem(LS_HASH); }
  async function verifyPasscode(pass) {
    const salt = localStorage.getItem(LS_SALT) || '';
    const hash = await hashPass(salt, pass);
    const ok = hash === localStorage.getItem(LS_HASH);
    if (ok) unlock();
    return ok;
  }
  function unlock() {
    state.unlocked = true;
    localStorage.setItem(LS_UNLOCK, '1');
    emit();
  }
  function lock() {
    state.unlocked = false;
    localStorage.removeItem(LS_UNLOCK);
    emit();
  }

  const isCloud = () => Store.mode === 'cloud';
  const canEdit = () => Store.mode !== 'export' && (isCloud() ? !!state.user : state.unlocked);

  return {
    get user() { return state.user; },
    get unlocked() { return state.unlocked; },
    canEdit, isCloud,
    cloudConfigured, setCloudConfig, initCloud,
    signIn, signUp, signOut,
    hasPasscode, setPasscode, verifyPasscode, unlock, lock,
    onChange
  };
})();
