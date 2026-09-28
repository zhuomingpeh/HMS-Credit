import Link from "next/link";
import { requireStaff } from "@/lib/staff";
import { prisma } from "@/lib/prisma";
import { signOutStaff } from "./login/actions";
export const metadata = { title: "Staff Applications", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function StaffHome() {
  const email = await requireStaff();
  const [applicants, leads] = await Promise.all([
    prisma.applicant.findMany({ orderBy: { createdAt: "desc" }, take: 50, select: { id: true, name: true, createdAt: true, loanAmount: true } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 50, select: { id: true, name: true, createdAt: true, loanAmount: true } }),
  ]);
  await prisma.staffAudit.create({ data: { email, action: "VIEW_APPLICATION_LIST" } });
  return <main className="page"><h1>Applications</h1><p>Signed in as {email}. Showing the 50 most recent records in each category.</p>
    {process.env.SINGPASS_ENV !== "production" && <p>Singpass is in staging. Myinfo records are test applications.</p>}
    <h2>Myinfo applications</h2><ul>{applicants.map(a => <li key={a.id}><Link href={`/staff/applicant/${a.id}`} prefetch={false}>{a.name}</Link> — S${a.loanAmount?.toLocaleString("en-SG") ?? "—"} — {a.createdAt.toLocaleDateString("en-SG")}</li>)}</ul>
    <h2>Manual enquiries</h2><ul>{leads.map(a => <li key={a.id}><Link href={`/staff/lead/${a.id}`} prefetch={false}>{a.name}</Link> — S${a.loanAmount.toLocaleString("en-SG")} — {a.createdAt.toLocaleDateString("en-SG")}</li>)}</ul>
    <form action={signOutStaff}><button className="button">Sign out</button></form>
  </main>;
}
