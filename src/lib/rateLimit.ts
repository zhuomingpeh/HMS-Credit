import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "./prisma";

// Shared database counters work across Vercel instances. Never store raw IPs/emails.
export async function takeRateLimit(scope: string, identity: string, limit: number, seconds: number) {
  const secret = process.env.STAFF_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("Rate limiting is not configured");
  const key = createHmac("sha256", secret).update(`${process.env.VERCEL_ENV ?? "local"}:${scope}:${identity}`).digest("hex");
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" (key, count, "expiresAt")
    VALUES (${key}, 1, NOW() + ${seconds} * INTERVAL '1 second')
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN "RateLimit"."expiresAt" <= NOW() THEN 1 ELSE LEAST("RateLimit".count + 1, ${limit + 1}) END,
      "expiresAt" = CASE WHEN "RateLimit"."expiresAt" <= NOW() THEN NOW() + ${seconds} * INTERVAL '1 second' ELSE "RateLimit"."expiresAt" END
    RETURNING count`;
  return rows[0].count <= limit;
}

export async function requestIp() {
  const h = await headers();
  // Vercel overwrites this header at its edge. Do not trust supplied forwarding
  // headers on local deployments or behind an unconfigured additional proxy.
  return process.env.VERCEL === "1" ? (h.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) || "unknown") : "local";
}

export async function allowRequest(scope: string, identity: string, limits: { ip: number; identity: number; seconds: number }) {
  if (!await takeRateLimit(`${scope}:ip`, await requestIp(), limits.ip, limits.seconds)) return false;
  return takeRateLimit(`${scope}:identity`, identity, limits.identity, limits.seconds);
}
