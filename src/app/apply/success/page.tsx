import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Application Received",
  robots: { index: false },
};

export default async function ApplySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const applicant = id ? await prisma.applicant.findUnique({ where: { id }, select: { name: true } }) : null;

  return (
    <main className="page">
      <div className="submission-done">
        <div className="submission-done-icon">✓</div>
        <h1 style={{ marginBottom: 0 }}>{applicant ? `Thanks, ${applicant.name.split(" ")[0]}!` : "Thanks — we've got your details"}</h1>
        <p>
          Your application has been received and verified via Singpass. Our team will call or WhatsApp you shortly.
          You can also reach us directly at +65 6333 9061.
        </p>
      </div>
    </main>
  );
}
