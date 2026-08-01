import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/server-auth";
import { hashStayToken, newStayToken } from "@/lib/stays";
import QRCode from "qrcode";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const sessions = await getAdminDb()
      .collection("guestSessions")
      .where("active", "==", true)
      .get();
    return NextResponse.json({
      stays: sessions.docs.map((session) => {
        const data = session.data();
        return {
          id: session.id,
          roomId: data.roomId,
          active: true,
          createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
          expiresAt: data.expiresAt?.toDate?.().toISOString() ?? null,
        };
      }),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Unable to list stays", error);
    return NextResponse.json({ error: "Unable to load active stays" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    const { roomId } = await request.json();
    if (typeof roomId !== "string" || !/^[A-Za-z0-9_-]{1,80}$/.test(roomId)) {
      return NextResponse.json({ error: "Invalid room" }, { status: 400 });
    }
    const adminDb = getAdminDb();
    const room = adminDb.collection("rooms").doc(roomId);
    if (!(await room.get()).exists) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    const token = newStayToken();
    const session = adminDb.collection("guestSessions").doc();
    await adminDb.runTransaction(async (tx) => {
      const active = await tx.get(adminDb.collection("guestSessions").where("roomId", "==", roomId).where("active", "==", true));
      active.docs.forEach((item) => tx.update(item.ref, { active: false, endedAt: FieldValue.serverTimestamp() }));
      tx.set(session, { roomId, tokenHash: hashStayToken(token), active: true, createdAt: FieldValue.serverTimestamp(), expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), createdBy: admin.uid });
    });
    const url = `${new URL(request.url).origin}/report/${token}`;
    return NextResponse.json({
      id: session.id,
      url,
      qrDataUrl: await QRCode.toDataURL(url, { width: 320, margin: 1 }),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Unable to start stay", error);
    return NextResponse.json({ error: "Unable to start stay" }, { status: 500 });
  }
}
