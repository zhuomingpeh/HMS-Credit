# HMS Credit

Marketing site + lead capture + Singpass application intake for HMS Credit, a licensed
moneylender in Singapore (Sim Lim Square).

Built with Next.js (App Router) + Prisma, following the same conventions as the Loanify codebase
(plain CSS, no UI framework; server actions for forms; Resend for email). The Singpass/MyInfo
integration (`src/lib/singpass/`) is adapted from Loanify's own production-approved
implementation — same FAPI 2.0 + PAR + DPoP mechanics, a different app registration and field set.

## Scope

- Public marketing pages: home, loan types (`/loans/[slug]`), loan calculator, about, FAQ, contact
- Lead capture form (`/`, `/contact`, `/apply`) → `Lead` table, admin email via Resend
- `/apply` — "Apply with Singpass" (MyInfo-prefilled, verified) alongside the manual form. Creates
  an `Applicant` row with the 28 fields below. Fails soft to the manual form until Singpass is
  actually registered (see below) — safe to have live before that happens.
- No staff/admin portal yet — an `Applicant`/`Lead` row is something staff review directly in the
  database (or a future portal), not an account a borrower logs back into.

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL at minimum
npx prisma generate
npx prisma db push
npm run dev
```

Without `RESEND_API_KEY` set, notifications just log to the console. Without the `SINGPASS_*`
vars set, "Apply with Singpass" redirects back to `/apply` with a friendly error — the manual
form still works.

## Status (2026-09-16)

Deployed at https://hms-credit.vercel.app (Vercel project "loanify/hms-credit", GitHub repo
[zhuomingpeh/HMS-Credit](https://github.com/zhuomingpeh/HMS-Credit) — pushing to `main` auto-
deploys). Supabase Postgres is live (ap-southeast-1). Real logo/favicon and storefront photos are
in, including the homepage hero background. UEN 201703408D and Moneylender's Licence No. 91/2026
are in `/privacy`, the footer, and the JSON-LD.

Singpass: the OIDC/MyInfo plumbing, key material, and `/apply` UI are built and deployed, but the
app itself isn't registered with Singpass yet — see below for what's needed to actually turn it on.

## Singpass — what's left, and what only you can do

Everything code-side is ready (`src/lib/singpass/`, the `Applicant` table, `/apply`,
`/.well-known/jwks.json`, and a keypair already generated — its public half is committed in
`src/lib/singpass/jwks.ts`, private half in the gitignored `.env` and in Vercel's env vars). What's
missing is the actual relationship with Singpass, which only you (as HMS Credit) can set up:

1. **Register at the [Singpass Developer Portal](https://developer.singpass.gov.sg/)** using HMS
   Credit's UEN (201703408D). Create a **Staging Myinfo app** first — production comes later,
   after staging testing passes.
2. **Set the security profile to FAPI 2.0** (this is the default/required profile for any new
   Myinfo app now — nothing to choose).
3. **Request exactly these 28 scopes** — paste the justification column straight from the table
   you already wrote; Singpass reviews scopes against stated purpose:
   `uinfin name sex race dob residentialstatus nationality passtype passstatus passexpirydate
   mobileno email regadd housingtype cpfcontributions noahistory ownerprivate employment
   occupation marital vehicles.vehicleno hdbownership.noofowners hdbownership.address
   hdbownership.hdbtype hdbownership.leasecommencementdate hdbownership.dateofpurchase
   hdbownership.outstandingloanbalance hdbownership.monthlyloaninstalment`
4. **Redirect URI**: register `https://hms-credit.vercel.app/api/auth/singpass/callback` for now
   (matches `SINGPASS_REDIRECT_URI`'s default in `src/lib/singpass/config.ts`). You'll need to add
   `https://hmsmoney.com/api/auth/singpass/callback` (and update the env var) once the domain
   cutover happens.
5. **JWKS / token-based authentication endpoint**: point it at
   `https://hms-credit.vercel.app/.well-known/jwks.json` — already live, already has the right
   keys.
6. Once approved, the Developer Portal gives you a **Client ID**. Send that to me (or set it
   yourself): `SINGPASS_CLIENT_ID` in Vercel's env vars (Production + Preview + Development). That
   one value is the only missing piece — everything else is already deployed and wired up.
7. Test against Singpass's [test personas](https://docs.developer.singpass.gov.sg/docs/testing/myinfo-test-personas)
   in staging before requesting production approval.

Nothing above touches `hmsmoney.com` or requires the domain — it all runs against the current
`hms-credit.vercel.app` URL, matching your call to hold off on the domain until everything (this
included) is ready.

## Outstanding before this goes live on hmsmoney.com

- Custom domain not yet attached — deliberately, until Singpass + everything else is ready
- Singpass `SINGPASS_CLIENT_ID` — see above, needs you to register the app
- No staff/admin portal to review `Lead`/`Applicant` rows through — currently direct DB access
