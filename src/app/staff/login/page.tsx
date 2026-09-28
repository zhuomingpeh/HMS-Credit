import { requestStaffCode, verifyStaffCode } from "./actions";
export const metadata = { title: "Staff Sign In", robots: { index: false, follow: false } };
export default async function StaffLogin({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const state = await searchParams;
  return <main className="page"><h1>Staff sign in</h1><p>Access is limited to authorised HMS Credit staff.</p>
    {state.sent && <p role="status">If this address is authorised, a code has been sent. Please wait one minute before requesting another.</p>}
    {state.error && <p role="alert">The code is invalid or expired. Request a new code and try again.</p>}
    <form className="card" action={requestStaffCode}><h2>Request a code</h2><label htmlFor="requestEmail">Staff email</label><input id="requestEmail" type="email" name="email" required autoComplete="email" /><button className="button">Send sign-in code</button></form>
    <form className="card" action={verifyStaffCode}><h2>Enter your code</h2><label htmlFor="verifyEmail">Staff email</label><input id="verifyEmail" type="email" name="email" required autoComplete="email" /><label htmlFor="code">8-digit code</label><input id="code" name="code" inputMode="numeric" pattern="[0-9]{8}" required maxLength={8} autoComplete="one-time-code" /><button className="button">Sign in</button></form>
  </main>;
}
