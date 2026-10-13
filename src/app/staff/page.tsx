import ApplicationList from "./ApplicationList";
import { requireStaff } from "@/lib/staff";
import { prisma } from "@/lib/prisma";
import { signOutStaff } from "./login/actions";
import { enquiryMetrics } from "@/lib/enquiryMetrics";
export const metadata = { title: "Staff Applications", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function StaffHome() {
  const email = await requireStaff();
  const [applicants, leads, metrics] = await Promise.all([
    prisma.applicant.findMany({ orderBy: { createdAt: "desc" }, take: 50, select: { id: true, name: true, createdAt: true, loanAmount: true, sourceEnvironment: true } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 50, select: { id: true, name: true, createdAt: true, loanAmount: true } }),
    enquiryMetrics(),
  ]);
  await prisma.staffAudit.create({ data: { email, action: "VIEW_APPLICATION_LIST" } });
  const staging = process.env.SINGPASS_ENV !== "production";
  const records = [...applicants.map(a => ({ ...a, kind: "applicant" as const, createdAt: a.createdAt.toISOString() })), ...leads.map(a => ({ ...a, kind: "lead" as const, createdAt: a.createdAt.toISOString() }))].sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  return <main id="main-content" className="page staff-dashboard">
    <header className="staff-dashboard-header"><div><span className="staff-login-eyebrow">HMS CREDIT · STAFF PORTAL</span><h1>Applications</h1><p>Review incoming enquiries and borrower details.</p></div><div className="staff-account"><span>{email}</span><form action={signOutStaff}><button className="staff-text-link">Sign out</button></form></div></header>
    {staging && <aside className="staff-staging"><span className="staff-badge staff-badge-test">TEST MODE</span><p><strong>Myinfo is connected to Singpass staging.</strong> Myinfo records below are test applications. Manual enquiries are live.</p></aside>}
    <section className="staff-summary" aria-label="Saved enquiry counts">
      {metrics.map(metric => <div key={metric.label}><span>{metric.label}</span><strong>{metric.total}</strong><small>{metric.manual} manual · {metric.myinfo} Myinfo</small></div>)}
    </section>
    <p className="staff-list-note">Counts include all saved records, not just the list below. Myinfo test records are excluded. Repeat Myinfo submissions update the existing record and retain its first submission date. Deleted records are not counted. These are enquiry counts, not website conversion rates.</p>
    <ApplicationList records={records} />
    <p className="staff-list-note">Includes up to 50 recent records per channel. Amounts are requested loan amounts.</p>
  </main>;
}
