# HMS Credit

Marketing site + lead capture for HMS Credit, a licensed moneylender in Singapore (Sim Lim Square).

Built with Next.js (App Router) + Prisma, following the same conventions as the Loanify codebase
(plain CSS, no UI framework; server actions for forms; Resend for email).

## v1 scope

- Public marketing pages: home, loan types (`/loans/[slug]`), loan calculator, about, FAQ, contact
- Lead capture form → `Lead` table in Postgres, with an admin email notification via Resend
- No Singpass integration yet, no borrower/admin portal — that's phase 2, once Singpass API
  credentials for HMS Credit are registered (separate approval process from Loanify's)

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL at minimum
npx prisma generate
npx prisma db push
npm run dev
```

Without `RESEND_API_KEY` set, lead notifications just log to the console instead of sending —
useful for local dev.

## Status

Deployed at https://hms-credit.vercel.app (Vercel project "loanify/hms-credit"). Supabase Postgres
is live (ap-southeast-1). Real logo/favicon and storefront photos are in. UEN 201703408D and
Moneylender's Licence No. 91/2026 are in `/privacy`, the footer, and the JSON-LD.

## Outstanding before this can go live on hmsmoney.com

- Custom domain not yet attached — waiting deliberately until Singpass is ready (see below)
- Singpass integration not started — needs its own API client registration/approval (separate
  from Loanify's), then the borrower application portal itself (phase 2)
- No git remote (GitHub) yet — deploys go straight from the local working tree via `vercel deploy`
