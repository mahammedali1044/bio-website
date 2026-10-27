# ⚡ My Portfolio — Progress, Projects & Achievements

**🌐 Live website: https://mahammedali1044.github.io/bio-website/**

A personal website that stores **everything**: your progress log, ECE project details with
code, PPTs, images and videos, achievements, certificates, resume and your social/work links.
You edit everything through the site itself, and you can send it to recruiters in one click.

---

## 1. Quick start (run it on your computer)

**Option A — PowerShell (recommended):**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "tools\serve.ps1"
```

Then open **http://localhost:8765** in your browser.

**Option B — just double-click `index.html`.**
It works too (file storage falls back gracefully), but a local server is more reliable
for uploads, so prefer Option A.

---

## 2. Editing your site

1. **Open the secret owner panel** — visitors see no admin controls at all:
   - **Desktop:** click anywhere on the page and type `owner`
   - **Phone / mouse:** **press and hold the ⚡ logo** (top-left) for ~1 second

   The first time, you create an **owner passcode** (min 4 characters).
   Keep it safe — it unlocks editing on this device. While unlocked, a **Lock**
   button appears top-right; clicking it hides every edit control again.
2. Edit buttons (✎ / 🗑 / "+ Add …") appear on every section:
   - **Hero** — click the **✎ pencil** beside your name (or the name itself) to edit it, and click the
     **📷 camera badge** on your avatar to upload your own profile photo;
     headline, bio, email, phone, location and links live in the same **Edit profile** form
     (also reachable via ⚙ Settings → Edit profile)
   - **Progress** — dated entries with status (Planned / In progress / Completed / On hold)
   - **Projects** — write-up, tags, repo/demo links, **code files**, and **uploads**
     (photos, videos, PPT, PDF, schematics — first image becomes the card cover)
   - **Code Library** — searchable, copy-ready snippets
   - **Achievements** — awards with evidence files (image/PDF)
   - **Certificates** — certifications with the certificate file attached
   - **Connections** — email, phone and all social/work profile links (tile grid)
   - **Resume** — upload/view/download a PDF
3. Click **Lock** (top-right) when you're done.

Everything saves automatically.

> ⚠️ **Local mode stores data in this browser only** (per device). To edit from your
> phone *and* PC with a real login, set up **cloud mode** below — it takes ~5 minutes.

---

## 3. Sending it to recruiters

Click **⇪ Share** (top-right):

| Option | What it does |
|---|---|
| **Your live link** | Shown once the site is hosted — send this URL (visitors can't edit). |
| **Export site (ZIP)** | Builds a **read-only copy**: one ZIP with `index.html` + all your media. Works **offline** — unzip and double-click `index.html`, or drag the folder onto [Netlify Drop](https://app.netlify.com/drop) to get a link. No login, no edit buttons. |
| **Backup everything** | Full backup (all data + files) for restoring later — not meant for recruiters. |
| **Import backup** | Restores a backup ZIP (data + files). |

---

## 4. Hosting it (so you can open it from anywhere)

The site is 100% static — any static host works.

**Easiest: Netlify Drop (no account needed to try)**
1. Export the site ZIP (Share → Export site), unzip it.
2. Go to https://app.netlify.com/drop and drag the **folder** in.
3. You get a public URL — send it to anyone.

**GitHub Pages (permanent, free)**
1. Create a repo → upload these files (`index.html`, `assets/`, `tools/` optional).
2. Repo → Settings → Pages → Deploy from branch → `main` / root.
3. Your site appears at `https://<you>.github.io/<repo>/`.

**Vercel / Cloudflare Pages** — same idea: drag the folder in.

> In local (passcode) mode, hosted visitors see a clean read-only site with **no admin
> controls at all** — the owner panel opens only via the secret gesture above. If someone
> discovers the gesture and sets their own passcode, it only edits *their* browser, never yours.
> For a proper shared login across your devices, use cloud mode below.

---

## 5. Cloud mode — one login, all devices (optional, free)

Use Firebase (Google's free tier) so your site + files live in the cloud and follow your
login to any phone/PC.

1. Go to https://console.firebase.google.com → **Add project** (no analytics needed).
2. In the project: **Build → Authentication → Get started → Sign-in method → Email/Password → Enable**.
3. **Build → Firestore Database → Create database** (production mode, pick a nearby region).
4. **Build → Storage → Get started** (production mode).
5. **Project settings → General → Your apps → Web (</>)** → register app → copy the
   `firebaseConfig` object (it looks like `{ apiKey: "...", authDomain: "...", ... }`).
6. On your site: **⚙ Settings → Cloud sync** → paste that object → **Connect & reload**.
7. Open the secret owner panel (type `owner` / long-press ⚡) → **Create account**
   with your email + password.

**Set the security rules** (console → Firestore → Rules and Storage → Rules):

Firestore rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /portfolio/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

> 🔒 **Lock it to your account only** (recommended): after your owner account exists,
> copy your UID (console → **Authentication → Users → UID**) and replace
> `request.auth != null` with `request.auth.uid == "YOUR_UID"` above, then put the
> same UID in `assets/js/config.js` (`ownerUid: "YOUR_UID"`). That hides the public
> "Create account" button **and** makes Firestore reject every write except yours.

Storage rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /files/{file} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

*Public read = recruiters see the site without logging in. Writes require your login.*

---

## 6. Backups

- **Share → Backup everything** regularly → keeps a ZIP with *all* text + media.
- **Share → Import backup** to restore it on any device/browser.
- Local files live in your browser's IndexedDB; text lives in localStorage.
  Cloud mode keeps everything in Firebase, but a backup ZIP is still your safety net.

---

## 7. Project structure

```
index.html              → page shell
assets/css/styles.css   → all styling (dark + light themes)
assets/js/config.js     → optional Firebase config (or paste in Settings)
assets/js/idb.js        → local file (blob) storage
assets/js/store.js      → data model, local/cloud persistence, auth, uploads
assets/js/ui.js         → rendering, modals, forms, lightbox
assets/js/export.js     → recruiter ZIP export, backup & restore
assets/js/app.js        → boot, navigation, actions
tools/serve.ps1         → tiny local web server (no install needed)
```

---

## 8. Good to know

- **Sample content**: the site starts with sample projects/achievements — edit or delete
  them and add your own (Settings → Data → *Reset to sample* brings them back).
- **Big files**: videos/PPTs work fine; keep individual files under ~50 MB for smooth uploads.
- **Themes**: ◐ toggles dark/light; Settings → Site changes title, tagline and accent colour.
- **The two PDFs** you mentioned earlier were ignored as requested — upload your real
  resume/certificates through the site's editor.
