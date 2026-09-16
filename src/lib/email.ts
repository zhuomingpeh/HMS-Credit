import "server-only";
import { escapeHtml } from "@/lib/html";
import { Resend } from "resend";

// No RESEND_API_KEY in dev — sends just log to console instead of failing the lead submission.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type NewLeadEmailParams = {
  name: string;
  phone: string;
  email: string;
  loanAmount: number;
  loanType?: string;
};

export async function sendNewLeadAdminEmail(params: NewLeadEmailParams): Promise<void> {
  const { name, phone, email, loanAmount, loanType } = params;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL ?? "support@hmsmoney.com";
  const amount = loanAmount.toLocaleString("en-SG");
  const subject = `New loan enquiry: ${name} — S$${amount}`;
  const purposeLine = loanType ? `\nInterested in: ${loanType}` : "";

  if (process.env.NODE_ENV !== "production") {
    console.log(`[dev] Admin notification: ${subject} — ${phone} / ${email}`);
  }

  if (!resend) return;

  const from = process.env.EMAIL_FROM ?? "HMS Credit <noreply@hmsmoney.com>";
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text: `New loan enquiry.\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nLoan amount: S$${amount}${purposeLine}`,
    html: `<p>New loan enquiry.</p><p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Phone:</strong> ${escapeHtml(phone)}<br><strong>Email:</strong> ${escapeHtml(email)}<br><strong>Loan amount:</strong> S$${amount}${loanType ? `<br><strong>Interested in:</strong> ${escapeHtml(loanType)}` : ""}</p>`,
  });

  if (error) {
    console.error(`Failed to send new-lead admin email: ${error.message}`);
  }
}
