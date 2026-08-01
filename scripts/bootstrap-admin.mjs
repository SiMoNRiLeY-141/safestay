import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { cert, initializeApp } from "firebase-admin/app";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const email = process.argv[2];
if (!email) throw new Error("Usage: node scripts/bootstrap-admin.mjs admin@example.com");
function localEnvValue(name) {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return undefined;
  const line = readFileSync(envPath, "utf8").split(/\r?\n/).find((item) => item.startsWith(`${name}=`));
  if (!line) return undefined;
  const value = line.slice(name.length + 1).trim();
  return (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")) ? value.slice(1, -1) : value;
}

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? localEnvValue("FIREBASE_SERVICE_ACCOUNT_JSON");
if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is required in the shell environment or .env.local");
const app = initializeApp({ credential: cert(JSON.parse(raw)) });
const user = await getAuth(app).getUserByEmail(email);
await getFirestore(app).collection("admins").doc(user.uid).set({ createdAt: FieldValue.serverTimestamp() });
console.log(`Admin access granted to ${user.email} (${user.uid}).`);
