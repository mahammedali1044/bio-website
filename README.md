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

   **Changing your passcode:** unlock → ⚙ Settings → Owner access → **Change passcode**
   → enter the current passcode, then the new one twice.

   **Forgot it?** On the unlock panel, click **Forgot passcode?** → confirm.
   It clears the passcode **on this device only** so you can set a new one.
   (Visitors and your other devices are never affected; the passcode cannot be
   recovered because it's stored only as a salted hash.)
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

## 5. Cloud mode — one login, all devices (active)

Your site now syncs through Firebase (Google's free Spark tier): edits you make while
signed in go to Firestore, and **every visitor on phone or desktop sees them on their
next page load** — no git push needed.

**What's already configured** (project `bio-website-199b4`):
- `firebaseConfig` committed in `assets/js/config.js` → cloud mode is on for everyone
- Firestore database in **asia-south1** (production mode), document `portfolio/main`
- Authentication → **Email/Password** enabled
- Firestore rules: public **read**, authenticated **write**

**Your daily workflow:**
1. Open the site → secret gesture (type `owner` / long-press ⚡) → **Sign in**
   (email + password).
2. Edit anything → **Save** (or it autosaves) → **"Saved to cloud"** toast.
3. Every visitor sees the update on their next load. No git, no deploy.

**To lock writes to your account only** (recommended once your account exists):
console → Authentication → Users → copy your UID → replace `request.auth != null`
with `request.auth.uid == "YOUR_UID"` in the Firestore rules → Publish, and put the
same UID in `assets/js/config.js` (`ownerUid: "YOUR_UID"`). That also hides the
public "Create account" button, so nobody else can ever create an account.

**Firebase Storage** (optional, needs the paid Blaze card) is auto-detected. Without it,
uploaded files (photos, PDFs, your resume) are embedded directly in Firestore as data
URLs — **they sync to every device automatically.** Maximum file size is **400 KB** per
file (keeps the shared document safely under Firestore's 1 MB limit); larger uploads are
rejected with a clear message, so use a hosted link for big videos. Your profile photo
ships with the site (`images/avatar.jpg`) and always works.

> **Note:** while signed out, visitors see the site read-only (cloud data, no edit
> controls). Your old device passcode still works as a fallback on any device where
> cloud sign-in is not available — it only unlocks that device.

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
