import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { hashStayToken, HELP_OPTIONS, isHelpOption } from "@/lib/stays";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid report" }, { status: 400 });
    const { token, status, helpType } = body as { token?: unknown; status?: unknown; helpType?: unknown };
    if (typeof token !== "string" || token.length > 200 || (status !== "Safe" && status !== "Need Help")) return NextResponse.json({ error: "Invalid report" }, { status: 400 });
    if (status === "Need Help" && !isHelpOption(helpType)) return NextResponse.json({ error: "Select a help type" }, { status: 400 });
    const adminDb = getAdminDb();
    const session = await adminDb.collection("guestSessions").where("tokenHash", "==", hashStayToken(token)).limit(1).get();
    const stay = session.docs[0];
    if (!stay || !stay.data().active || stay.data().expiresAt.toDate() <= new Date()) return NextResponse.json({ error: "This room link is no longer active" }, { status: 403 });
    const emergency = status === "Need Help" && isHelpOption(helpType) ? HELP_OPTIONS[helpType] : null;
    await adminDb.collection("rooms").doc(stay.data().roomId).update({ guestStatus: status, helpType: emergency?.label ?? null, helpIntensity: emergency?.intensity ?? null, updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Guest report failed", error);
    return NextResponse.json({ error: "Unable to send your status. Please try again." }, { status: 500 });
  }
}
