import { requestStaffCode, verifyStaffCode } from "./actions";
export const metadata = { title: "Staff Sign In", robots: { index: false, follow: false } };
export default async function StaffLogin({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const state = await searchParams;
  return <main className="page staff-login">
    <header className="staff-login-heading"><span className="staff-login-eyebrow">HMS CREDIT · STAFF PORTAL</span><h1>Staff sign in</h1><p>Use your authorised staff email to receive a sign-in code.</p></header>
    {state.sent && <p className="staff-login-notice" role="status">If this address is authorised, a code has been sent. Please wait one minute before requesting another.</p>}
    {state.error && <p className="error-banner" role="alert">The code is invalid or expired. Request a new code and try again.</p>}
    <div className="staff-login-steps">
      <form className="card staff-login-form" action={requestStaffCode}>
        <div><span className="staff-step">STEP 1</span><h2>Request a code</h2><p>We’ll email you an 8-digit sign-in code.</p></div>
        <div className="field"><label htmlFor="requestEmail">Staff email</label><input id="requestEmail" type="email" name="email" required autoComplete="email" placeholder="you@example.com" /></div>
        <button className="button" type="submit">Send sign-in code</button>
      </form>
      <form className="card staff-login-form" action={verifyStaffCode}>
        <div><span className="staff-step">STEP 2</span><h2>Enter your code</h2><p>Use the same email address you entered above.</p></div>
        <div className="field"><label htmlFor="verifyEmail">Staff email</label><input id="verifyEmail" type="email" name="email" required autoComplete="email" placeholder="you@example.com" /></div>
        <div className="field"><label htmlFor="code">8-digit code</label><input id="code" name="code" inputMode="numeric" pattern="[0-9]{8}" required minLength={8} maxLength={8} autoComplete="one-time-code" placeholder="12345678" aria-describedby="codeHelp" /><small id="codeHelp">Codes expire after 10 minutes.</small></div>
        <button className="button" type="submit">Sign in</button>
      </form>
    </div>
    <p className="staff-login-footer">Access is limited to authorised HMS Credit staff.</p>
  </main>;
}
