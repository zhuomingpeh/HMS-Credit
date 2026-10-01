"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { readDraft, DRAFT_COOKIE } from "@/lib/singpass/drafts";
import { mapMyInfoToApplicant } from "@/lib/singpass/myinfo";
import { applyUserEdits } from "@/lib/singpass/reviewFields";
import { createReceipt, RECEIPT_COOKIE } from "@/lib/singpass/receipt";
import { sendNewApplicantAdminEmail } from "@/lib/email";

export async function cancelApplication() {
  const draft = await readDraft();
  if (draft) await prisma.myinfoDraft.deleteMany({ where: { tokenHash: draft.tokenHash } });
  (await cookies()).set(DRAFT_COOKIE, "", { path: "/apply", maxAge: 0 });
  redirect("/apply");
}

export async function submitReviewedApplication(form: FormData) {
  const draft = await readDraft();
  if (!draft) redirect("/apply?reviewError=session");
  const loanAmount = Number(form.get("loanAmount"));
  if (form.get("consent") !== "yes" || !Number.isSafeInteger(loanAmount) || loanAmount < 1 || loanAmount > 1000000) {
    redirect("/apply/review?error=details");
  }
  let personInfo;
  try { personInfo = applyUserEdits(draft.data.personInfo, form); }
  catch { redirect("/apply/review?error=details"); }
  const contactMobile = String(form.get("contactMobile") ?? "").trim();
  const contactEmail = String(form.get("contactEmail") ?? "").trim();
  if (!/^[+\d ()-]{7,30}$/.test(contactMobile) || contactMobile.replace(/\D/g, "").length < 7 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) || contactEmail.length > 254) redirect("/apply/review?error=details");
  const mapped = { ...mapMyInfoToApplicant(personInfo), mobileNumber: contactMobile, email: contactEmail };
  if (!mapped.nric || !mapped.name || !mapped.residentialStatus) redirect("/apply/review?error=details");
  // JSON round-trip removes undefined object properties without altering zero/false values.
  const json = (value: unknown) => value === undefined ? Prisma.DbNull : JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  const { address, hdbOwnership, cpfContributions, noticeOfAssessments, ...fields } = mapped;
  const data = { ...fields, nric: mapped.nric, name: mapped.name, residentialStatus: mapped.residentialStatus,
    address: json(address), hdbOwnership: json(hdbOwnership), cpfContributions: json(cpfContributions),
    noticeOfAssessments: json(noticeOfAssessments), rawMyInfo: json(personInfo) as Prisma.InputJsonValue,
    loanAmount, loanType: draft.data.loanType, singpassSub: draft.data.singpassSub,
    sourceEnvironment: process.env.SINGPASS_ENV === "production" ? "production" : "staging" };
  const receipt = await createReceipt();
  const applicant = await prisma.$transaction(async (tx) => {
    const claimed = await tx.myinfoDraft.deleteMany({ where: { tokenHash: draft.tokenHash, expiresAt: { gt: new Date() } } });
    if (claimed.count !== 1) return null;
    return tx.applicant.upsert({ where: { singpassSub: data.singpassSub }, create: data, update: data });
  });
  if (!applicant) redirect("/apply?reviewError=session");
  const jar = await cookies();
  jar.set(DRAFT_COOKIE, "", { path: "/apply", maxAge: 0 });
  jar.set(RECEIPT_COOKIE, receipt, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/apply/success", maxAge: 300 });
  // A notification outage must never turn a committed application into a failed submission.
  await sendNewApplicantAdminEmail({ name: applicant.name, residentialStatus: applicant.residentialStatus, loanAmount }).catch(() => console.error("Application notification failed"));
  redirect("/apply/success");
}
