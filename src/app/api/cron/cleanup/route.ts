import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { timingSafeEqual } from "node:crypto";

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : "";
  const received = request.headers.get("authorization") ?? "";
  if (!expected || Buffer.byteLength(expected) !== Buffer.byteLength(received) || !timingSafeEqual(Buffer.from(expected), Buffer.from(received))) return new NextResponse(null, { status: 401 });
  const drafts = await prisma.myinfoDraft.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  const sessions = await prisma.singpassAuthSession.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 600000) } } });
  await prisma.staffLogin.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await prisma.staffSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return NextResponse.json({ drafts: drafts.count, sessions: sessions.count });
}
