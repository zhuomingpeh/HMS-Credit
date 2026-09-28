import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RECEIPT_COOKIE, verifyReceipt } from "@/lib/singpass/receipt";

export const metadata: Metadata = {
  title: "Application Received",
  robots: { index: false },
};

export default async function ApplySuccessPage() {
  const receipt = (await cookies()).get(RECEIPT_COOKIE)?.value;
  if (!receipt || !(await verifyReceipt(receipt))) redirect("/apply");

  return (
    <main className="page">
      <div className="submission-done">
        <div className="submission-done-icon">✓</div>
        <h1 style={{ marginBottom: 0 }}>Thanks — we&apos;ve got your details</h1>
        <p>
          Your application has been received and verified via Singpass. Our team will call or WhatsApp you shortly.
          You can also reach us directly at +65 6333 9061.
        </p>
      </div>
    </main>
  );
}
