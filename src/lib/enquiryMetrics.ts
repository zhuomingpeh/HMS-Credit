import "server-only";
import { prisma } from "./prisma";

// Aggregate saved records only. No visitor tracking, borrower data or third-party analytics.
export async function enquiryMetrics(now = new Date()) {
  const windows = [{ label: "Past 7 days", days: 7 }, { label: "Past 30 days", days: 30 }, { label: "All saved enquiries", days: null }];
  return Promise.all(windows.map(async window => {
    const createdAt = window.days === null ? undefined : { gte: new Date(now.getTime() - window.days * 86400000), lte: now };
    const [manual, myinfo] = await Promise.all([
      prisma.lead.count({ where: { createdAt } }),
      prisma.applicant.count({ where: { createdAt, sourceEnvironment: "production" } }),
    ]);
    return { label: window.label, manual, myinfo, total: manual + myinfo };
  }));
}
