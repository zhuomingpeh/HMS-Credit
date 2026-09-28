import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { draftHash, encryptDraft, decryptDraft } from "./draftCrypto";
import type { MyInfoPersonInfo } from "./myinfo";

export const DRAFT_COOKIE = "hms_myinfo_review";
export const DRAFT_SECONDS = 15 * 60;
export type DraftData = { personInfo: MyInfoPersonInfo; singpassSub: string; loanAmount?: number; loanType?: string };
export async function createDraft(data: DraftData) {
  const encrypted = encryptDraft(data);
  const token = randomBytes(32).toString("base64url");
  await prisma.myinfoDraft.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await prisma.myinfoDraft.create({ data: { tokenHash: draftHash(token), encrypted, expiresAt: new Date(Date.now() + DRAFT_SECONDS * 1000) } });
  return token;
}
export async function readDraft() {
  const token = (await cookies()).get(DRAFT_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const tokenHash = draftHash(token);
  const row = await prisma.myinfoDraft.findUnique({ where: { tokenHash } });
  if (!row) return null;
  if (row.expiresAt.getTime() <= Date.now()) {
    await prisma.myinfoDraft.deleteMany({ where: { tokenHash } });
    return null;
  }
  try { return { tokenHash, data: decryptDraft(row.encrypted) as DraftData }; }
  catch { return null; }
}
