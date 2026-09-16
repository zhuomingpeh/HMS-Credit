"use server";

import { prisma } from "@/lib/prisma";
import { sendNewLeadAdminEmail } from "@/lib/email";
import type { IdHolderType } from "@/generated/prisma/enums";

export type LeadFormState = {
  ok: boolean;
  error?: string;
};

const ID_HOLDER_TYPES: IdHolderType[] = ["IC", "WORK_PERMIT", "SPASS", "EPASS", "OTHER"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SG_PHONE_RE = /^(\+65)?\s*[3689]\d{7}$/;

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const employedRaw = String(formData.get("employed") ?? "");
  const idHolderTypeRaw = String(formData.get("idHolderType") ?? "");
  const loanAmountRaw = String(formData.get("loanAmount") ?? "");
  const loanType = String(formData.get("loanType") ?? "").trim() || undefined;

  if (!firstName || !lastName) return { ok: false, error: "Please enter your first and last name." };
  if (!SG_PHONE_RE.test(phone.replace(/[\s-]/g, ""))) return { ok: false, error: "Please enter a valid Singapore phone number." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email address." };
  if (employedRaw !== "yes" && employedRaw !== "no") return { ok: false, error: "Please let us know if you're currently employed." };
  if (!ID_HOLDER_TYPES.includes(idHolderTypeRaw as IdHolderType)) return { ok: false, error: "Please select your IC or pass type." };

  const loanAmount = Number(loanAmountRaw);
  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return { ok: false, error: "Please enter a loan amount." };

  const lead = await prisma.lead.create({
    data: {
      firstName,
      lastName,
      phone,
      email,
      employed: employedRaw === "yes",
      idHolderType: idHolderTypeRaw as IdHolderType,
      loanAmount: Math.round(loanAmount),
      loanType,
    },
  });

  await sendNewLeadAdminEmail({
    firstName: lead.firstName,
    lastName: lead.lastName,
    phone: lead.phone,
    email: lead.email,
    loanAmount: lead.loanAmount,
    loanType: lead.loanType ?? undefined,
  });

  return { ok: true };
}
