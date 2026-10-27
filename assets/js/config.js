/* ============================================================
   config.js — global site configuration
   ------------------------------------------------------------
   CLOUD MODE (optional): paste your Firebase config object below
   to enable login + sync across devices. You can also paste it
   later from the in-app Settings panel (stored on each device).

   Example:
   window.SITE_CONFIG = {
     firebase: {
       apiKey: "...",
       authDomain: "...",
       projectId: "...",
       storageBucket: "...",
       messagingSenderId: "...",
       appId: "..."
     }
   };
   ============================================================ */
window.SITE_CONFIG = window.SITE_CONFIG || {
  firebase: null,
  /* After you create your owner account, put your Firebase UID here
     (console → Authentication → Users → UID). It hides the public
     "Create account" button; Firestore rules then accept writes from
     your UID only. Leave null until the account exists. */
  ownerUid: null
};
