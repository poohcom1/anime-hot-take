import admin, { credential } from "firebase-admin";

let init = false;

export function initFirebase(serviceAccount: string) {
  if (init) return;
  admin.initializeApp({
    credential: credential.cert(JSON.parse(serviceAccount)),
  });
  init = true;
}

export function getDB(serviceAccount: string) {
  initFirebase(serviceAccount);
  return admin.firestore();
}
