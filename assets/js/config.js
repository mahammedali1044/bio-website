/* ============================================================
   config.js — global site configuration
   ------------------------------------------------------------
   CLOUD MODE: this project's Firebase config (public by design —
   Firebase web API keys are identifiers, not secrets; security
   is enforced by the Firestore rules in the Firebase console).

   Create the owner account on the live site (secret gesture →
   Sign in → Create account), then put your Firebase UID in
   ownerUid below to hide the public "Create account" button and
   lock Firestore writes to your account only.
   ============================================================ */
window.SITE_CONFIG = window.SITE_CONFIG || {
  firebase: {
    apiKey: "AIzaSyDj5T9r67OScPshZ-R7mSF05NRYJu8aswg",
    authDomain: "bio-website-199b4.firebaseapp.com",
    projectId: "bio-website-199b4",
    storageBucket: "bio-website-199b4.firebasestorage.app",
    messagingSenderId: "229596316593",
    appId: "1:229596316593:web:38d665275c1e6a63177390"
  },
  /* Your Firebase UID (console → Authentication → Users). Hides the
     public "Create account" button; Firestore rules accept writes from
     this UID only. */
  ownerUid: "viFapXlxujdcywSaSWu8WFOU7vq2"
};
