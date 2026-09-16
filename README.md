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

## Outstanding before this can go live

- Real logo/brand assets (favicon, OG image) — currently a plain text "$" mark placeholder
- Company UEN and Moneylender's Licence No. in `/privacy` (marked `[to be confirmed]`)
- A Supabase Postgres project + `DATABASE_URL`
- Domain + Vercel project wiring (Vercel project "HMS-Credit" already created)
