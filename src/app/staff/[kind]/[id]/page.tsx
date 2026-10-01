import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/staff";
import { prisma } from "@/lib/prisma";
import ApplicationDetail from "../../ApplicationDetail";
export const metadata = { title: "Application Details", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function StaffDetail({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const email = await requireStaff();
  const { kind, id } = await params;
  if (!["applicant", "lead"].includes(kind) || id.length > 100) notFound();
  if (kind === "lead") {
    const row = await prisma.lead.findUnique({ where: { id } }); if (!row) notFound();
    await prisma.staffAudit.create({ data: { email, action: "VIEW_LEAD", recordId: id } });
    return <ApplicationDetail record={{ ...row, kind: "lead" }} />;
  }
  const row = await prisma.applicant.findUnique({ where: { id } }); if (!row) notFound();
  await prisma.staffAudit.create({ data: { email, action: "VIEW_MYINFO_APPLICATION", recordId: id } });
  const personInfo = row.rawMyInfo && typeof row.rawMyInfo === "object" && !Array.isArray(row.rawMyInfo) ? row.rawMyInfo as Record<string, unknown> : {};
  return <ApplicationDetail record={{ ...row, kind: "applicant", phone: row.mobileNumber, residency: row.residentialStatus, isTest: row.sourceEnvironment !== "production", personInfo }} />;
}
