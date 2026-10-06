import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { staffSession } from "@/lib/staff";
import { StaffSubmitButton } from "./StaffSubmitButton";
import { requestStaffCode, verifyStaffCode, changeStaffEmail } from "./actions";
export const metadata = { title: "Staff Sign In", robots: { index: false, follow: false } };
export default async function StaffLogin({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const state = await searchParams;
  if (await staffSession()) redirect("/staff");
  const jar = await cookies();
  const pendingEmail = jar.get("hms_staff_pending_email")?.value ?? "";
  const requestedAt = Number(jar.get("hms_staff_code_requested_at")?.value ?? 0);
  // Request-time server component: calculate remaining time before serialising it to the client.
  // eslint-disable-next-line react-hooks/purity
  const cooldown = Number.isFinite(requestedAt) ? Math.min(60, Math.max(0, Math.ceil((requestedAt + 60000 - Date.now()) / 1000))) : 0;
  return <main id="main-content" className="page staff-login">
    <header className="staff-login-heading"><span className="staff-login-eyebrow">HMS CREDIT · STAFF PORTAL</span><h1>Staff sign in</h1><p>Use your authorised staff email to receive a sign-in code.</p></header>
    {state.sent && <p className="staff-login-notice" role="status">Code requested. If this address is authorised, check its inbox and spam folder. Use the newest email code; requesting a replacement invalidates the previous code.</p>}
    {state.error && <p className="error-banner" role="alert">{state.error === "limit" ? "Too many sign-in attempts. Please wait 15 minutes before trying again." : state.error === "unavailable" ? "Email sign-in is temporarily unavailable. Please try again later." : "The code is invalid or expired. Request a new code and try again."}</p>}
    <div className="staff-login-steps">
      {!pendingEmail ? <form className="card staff-login-form" action={requestStaffCode}>
        <div><span className="staff-step">STEP 1</span><h2>Request a code</h2><p>We’ll email you an 8-digit sign-in code.</p></div>
        <div className="field"><label htmlFor="requestEmail">Staff email</label><input id="requestEmail" type="email" name="email" required autoComplete="email" placeholder="you@example.com" /></div>
        <StaffSubmitButton busyLabel="Requesting code…">Send sign-in code</StaffSubmitButton>
      </form> : <>
      <form className="card staff-login-form" action={verifyStaffCode}>
        <div><span className="staff-step">STEP 2</span><h2>Enter your code</h2><p>Enter the code for <strong>{pendingEmail}</strong>.</p></div>
        <input type="hidden" name="email" value={pendingEmail} />
        <div className="field"><label htmlFor="code">8-digit code</label><input id="code" name="code" inputMode="numeric" pattern="[0-9]{8}" required minLength={8} maxLength={8} autoComplete="one-time-code" placeholder="12345678" aria-describedby="codeHelp" /><small id="codeHelp">Codes expire after 10 minutes.</small></div>
        <StaffSubmitButton busyLabel="Signing in…">Sign in</StaffSubmitButton>
      </form>
      <div className="staff-login-links">
      <form action={requestStaffCode}><input type="hidden" name="email" value={pendingEmail} /><StaffSubmitButton key={requestedAt} link cooldown={cooldown} busyLabel="Requesting code…">Resend code</StaffSubmitButton></form>
      <form action={changeStaffEmail}><button className="staff-text-link" type="submit">Change email</button></form>
      </div>
      </>}
    </div>
    <p className="staff-login-footer">Access is limited to authorised HMS Credit staff.</p>
  </main>;
}
