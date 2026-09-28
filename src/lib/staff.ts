import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, createHmac } from "node:crypto";
import { prisma } from "./prisma";

export const STAFF_COOKIE = "hms_staff_session";
export const staffHash = (value: string) => createHash("sha256").update(value).digest("hex");
export function allowedStaff(email: string) {
  return (process.env.STAFF_EMAILS ?? "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
}
export function otpHash(email: string, code: string) {
  const secret = process.env.STAFF_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("Staff authentication is not configured");
  return createHmac("sha256", secret).update(`${email}:${code}`).digest("hex");
}
export async function staffSession() {
  const token = (await cookies()).get(STAFF_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const session = await prisma.staffSession.findUnique({ where: { tokenHash: staffHash(token) } });
  if (!session || session.expiresAt.getTime() <= Date.now() || !allowedStaff(session.email)) return null;
  return session;
}
export async function requireStaff() {
  const session = await staffSession();
  if (!session) redirect("/staff/login");
  return session.email;
}
