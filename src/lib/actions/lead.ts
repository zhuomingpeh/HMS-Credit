"use server";

import { prisma } from "@/lib/prisma";
import { sendNewLeadAdminEmail } from "@/lib/email";
import type { Residency } from "@/generated/prisma/enums";
import { allowRequest } from "@/lib/rateLimit";
import { LOAN_TYPES } from "@/lib/loans";

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
  if (formData.get("website")) return { ok: true };
  if (name.length > 150 || phone.length > 30 || email.length > 254 || (loanType?.length ?? 0) > 100) return { ok: false, error: "Please check your details and try again." };
  if (loanType && !LOAN_TYPES.some(loan => loan.name === loanType)) return { ok: false, error: "Please select a loan from our loan options." };

  if (!name) return { ok: false, error: "Please enter your name." };
  if (!SG_PHONE_RE.test(phone.replace(/[\s-]/g, ""))) return { ok: false, error: "Please enter a valid Singapore phone number." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email address." };
  if (!RESIDENCY_VALUES.includes(residencyRaw as Residency)) return { ok: false, error: "Please select your residency status." };

  const loanAmount = Number(loanAmountRaw);
  if (!Number.isSafeInteger(loanAmount) || loanAmount < 500 || loanAmount > 1000000) return { ok: false, error: "Please enter a loan amount between S$500 and S$1,000,000." };
  let lead;
  try {
    if (!await allowRequest("lead-submit", email.toLowerCase(), { ip: 10, identity: 3, seconds: 900 })) return { ok: false, error: "Too many submissions. Please wait 15 minutes or call us for assistance." };
    lead = await prisma.lead.create({
    data: {
      name,
      phone,
      email,
      residency: residencyRaw as Residency,
      loanAmount: Math.round(loanAmount),
      loanType,
    },
    });
  } catch {
    console.error("Manual enquiry could not be saved");
    return { ok: false, error: "We could not confirm that your enquiry was saved. Please call 6333 9061 before trying again." };
  }

  await sendNewLeadAdminEmail({
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    loanAmount: lead.loanAmount,
    loanType: lead.loanType ?? undefined,
  }).catch(() => console.error("Saved lead notification failed"));

  return { ok: true };
}
