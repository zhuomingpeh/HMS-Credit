"use server";

import { prisma } from "@/lib/prisma";
import { sendNewLeadAdminEmail } from "@/lib/email";
import type { Residency } from "@/generated/prisma/enums";

export type LeadFormState = {
  ok: boolean;
  error?: string;
};

const RESIDENCY_VALUES: Residency[] = ["SG_PR", "FOREIGNER"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SG_PHONE_RE = /^(\+65)?\s*[3689]\d{7}$/;

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const residencyRaw = String(formData.get("residency") ?? "");
  const loanAmountRaw = String(formData.get("loanAmount") ?? "");
  const loanType = String(formData.get("loanType") ?? "").trim() || undefined;

  if (!name) return { ok: false, error: "Please enter your name." };
  if (!SG_PHONE_RE.test(phone.replace(/[\s-]/g, ""))) return { ok: false, error: "Please enter a valid Singapore phone number." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email address." };
  if (!RESIDENCY_VALUES.includes(residencyRaw as Residency)) return { ok: false, error: "Please select your residency status." };

  const loanAmount = Number(loanAmountRaw);
  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return { ok: false, error: "Please enter a loan amount." };

  const lead = await prisma.lead.create({
    data: {
      name,
      phone,
      email,
      residency: residencyRaw as Residency,
      loanAmount: Math.round(loanAmount),
      loanType,
    },
  });

  await sendNewLeadAdminEmail({
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    loanAmount: lead.loanAmount,
    loanType: lead.loanType ?? undefined,
  });

  return { ok: true };
}
