import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function serviceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Firebase Admin is not configured");
  return JSON.parse(raw);
}

function adminApp() {
  return getApps()[0] ?? initializeApp({ credential: cert(serviceAccount()) });
}

export function getAdminAuth() {
  return getAuth(adminApp());
}

export function getAdminDb() {
  return getFirestore(adminApp());
}
