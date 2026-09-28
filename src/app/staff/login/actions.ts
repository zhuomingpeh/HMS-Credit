"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { allowedStaff, otpHash, STAFF_COOKIE, staffHash, staffSession } from "@/lib/staff";
import { allowRequest } from "@/lib/rateLimit";

export async function requestStaffCode(form: FormData) {
  // A global configuration outage is safe to disclose and must not claim delivery.
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) redirect("/staff/login?error=unavailable");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/staff/login?error=1");
  if (!await allowRequest("staff-send", email, { ip: 20, identity: 5, seconds: 900 })) redirect("/staff/login?error=limit");
  if (allowedStaff(email) && process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
    const code = String(randomInt(10000000, 100000000));
    const now = new Date();
    const data = { codeHash: otpHash(email, code), expiresAt: new Date(Date.now() + 600000), attempts: 0, sentAt: now };
    const existing = await prisma.staffLogin.findUnique({ where: { email } });
    let reserved = false;
    if (existing) {
      const updated = await prisma.staffLogin.updateMany({ where: { email, sentAt: { lt: new Date(Date.now() - 60000) } }, data });
      reserved = updated.count === 1;
    } else {
      reserved = await prisma.staffLogin.create({ data: { email, ...data } }).then(() => true).catch(() => false);
    }
    if (reserved) {
      try {
        const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.EMAIL_FROM,
          to: email, subject: "Your HMS Credit staff sign-in code", text: `Your HMS Credit staff sign-in code is ${code}. It expires in 10 minutes. If you did not request this code, ignore this email.` });
        if (error) throw new Error("Delivery failed");
      } catch {
        console.error("Staff code delivery failed");
        await prisma.staffLogin.deleteMany({ where: { email, codeHash: data.codeHash } });
        // Keep the same public response for unknown and known addresses.
      }
    }
  }
  // Convenience only: this cookie grants no access; verification still checks the OTP and allowlist.
  (await cookies()).set("hms_staff_pending_email", email.slice(0,254), { httpOnly:true, secure:process.env.NODE_ENV === "production", sameSite:"strict", path:"/staff/login", maxAge:600 });
  // Uniform response avoids disclosing staff membership or delivery state.
  redirect("/staff/login?sent=1");
}

export async function verifyStaffCode(form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const code = String(form.get("code") ?? "").trim();
  if (email.length > 254 || code.length > 8) redirect("/staff/login?error=1");
  if (!await allowRequest("staff-verify", email, { ip: 40, identity: 10, seconds: 900 })) redirect("/staff/login?error=limit");
  let valid = false;
  if (allowedStaff(email) && /^\d{8}$/.test(code)) {
    const row = await prisma.staffLogin.findUnique({ where: { email } });
    if (row && row.expiresAt.getTime() > Date.now()) {
      const attempts = await prisma.staffLogin.updateMany({ where: { email, codeHash: row.codeHash, attempts: { lt: 5 }, expiresAt: { gt: new Date() } }, data: { attempts: { increment: 1 } } });
      const supplied = otpHash(email, code);
      if (attempts.count === 1 && supplied.length === row.codeHash.length && timingSafeEqual(Buffer.from(supplied), Buffer.from(row.codeHash))) {
        const used = await prisma.staffLogin.deleteMany({ where: { email, codeHash: row.codeHash, expiresAt: { gt: new Date() } } });
        valid = used.count === 1;
      }
    }
  }
  if (!valid) redirect("/staff/login?error=1");
  const token = randomBytes(32).toString("base64url");
  await prisma.staffSession.create({ data: { tokenHash: staffHash(token), email, expiresAt: new Date(Date.now() + 3600000) } });
  await prisma.staffAudit.create({ data: { email, action: "SIGN_IN" } });
  (await cookies()).set(STAFF_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/staff", maxAge: 3600 });
  (await cookies()).set("hms_staff_pending_email", "", { path:"/staff/login", maxAge:0 });
  redirect("/staff");
}

export async function signOutStaff() {
  const session = await staffSession();
  if (session) await prisma.staffSession.deleteMany({ where: { tokenHash: session.tokenHash } });
  (await cookies()).set(STAFF_COOKIE, "", { path: "/staff", maxAge: 0 });
  redirect("/staff/login");
}

export async function changeStaffEmail() {
  (await cookies()).set("hms_staff_pending_email", "", { path:"/staff/login", maxAge:0 });
  redirect("/staff/login");
}
