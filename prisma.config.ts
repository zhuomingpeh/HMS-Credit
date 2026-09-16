import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Direct connection for CLI/DDL (migrate, db push) — same reasoning as Loanify's
    // prisma.config.ts: falls back to DATABASE_URL until a separate pooled connection
    // string (DIRECT_URL / pooled DATABASE_URL split) is set up for production.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
