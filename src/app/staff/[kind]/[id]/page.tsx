import { notFound } from "next/navigation";
import Link from "next/link";
import { requireStaff } from "@/lib/staff";
import { prisma } from "@/lib/prisma";
import { reviewFields } from "@/lib/singpass/reviewFields";
export const metadata = { title: "Application Details", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function StaffDetail({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const email = await requireStaff();
  const { kind, id } = await params;
  if (!["applicant", "lead"].includes(kind) || id.length > 100) notFound();
  if (kind === "lead") {
    const row = await prisma.lead.findUnique({ where: { id } }); if (!row) notFound();
    await prisma.staffAudit.create({ data: { email, action: "VIEW_LEAD", recordId: id } });
    return <main className="page"><Link href="/staff">Back to applications</Link><h1>{row.name}</h1><dl><dt>Phone</dt><dd>{row.phone}</dd><dt>Email</dt><dd>{row.email}</dd><dt>Residency</dt><dd>{row.residency}</dd><dt>Requested amount</dt><dd>S${row.loanAmount}</dd></dl></main>;
  }
  const row = await prisma.applicant.findUnique({ where: { id } }); if (!row) notFound();
  await prisma.staffAudit.create({ data: { email, action: "VIEW_MYINFO_APPLICATION", recordId: id } });
  return <main className="page page-wide"><Link href="/staff">Back to applications</Link><h1>{row.name}</h1><p>Requested amount: S${row.loanAmount ?? "Not specified"}. Identity verification does not constitute loan approval.</p>
    {reviewFields(row.rawMyInfo).map((field, i) => <div className="myinfo-field" key={i}><strong>{field.label}</strong><div>{field.value || "Not provided"}</div></div>)}
  </main>;
}
