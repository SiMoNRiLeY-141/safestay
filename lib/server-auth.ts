import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export async function requireAdmin(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Response("Unauthorized", { status: 401 });
  const decoded = await getAdminAuth().verifyIdToken(token);
  const role = await getAdminDb().collection("admins").doc(decoded.uid).get();
  if (!role.exists) throw new Response("Forbidden", { status: 403 });
  return decoded;
}
