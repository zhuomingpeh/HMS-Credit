import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { SUPABASE_CA } from "./supabase-ca";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const databaseUrl = new URL(process.env.DATABASE_URL!);
// Do not let URL sslmode options override verified TLS configuration.
for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) databaseUrl.searchParams.delete(key);
const local = ["localhost", "127.0.0.1", "::1"].includes(databaseUrl.hostname);
const adapter = new PrismaPg({ connectionString: databaseUrl.toString(),
  ssl: local ? undefined : { rejectUnauthorized: true, ca: SUPABASE_CA },
  max: 5, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000,
});

export const prisma = globalThis.prismaGlobal ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
