"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitLead, type LeadFormState } from "@/lib/actions/lead";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="button" disabled={pending} style={{ width: "100%" }}>
      {pending ? "Submitting…" : "Submit"}
    </button>
  );
}

const initialState: LeadFormState = { ok: false };

export function LeadForm({ loanType }: { loanType?: string }) {
  const [state, action] = useActionState<LeadFormState, FormData>(submitLead, initialState);

  if (state.ok) {
    return (
      <div className="submission-done">
        <div className="submission-done-icon">✓</div>
        <h2>Thanks — we&apos;ve got your details</h2>
        <p>Our team will call or WhatsApp you shortly. You can also reach us directly at +65 6333 9061.</p>
      </div>
    );
  }

  return (
    <form action={action}>
      {state.error && <div className="error-banner">{state.error}</div>}
      {loanType && <input type="hidden" name="loanType" value={loanType} />}

      <div className="field-row">
        <div className="field">
          <label htmlFor="firstName">First name</label>
          <input id="firstName" name="firstName" type="text" required autoComplete="given-name" />
        </div>
        <div className="field">
          <label htmlFor="lastName">Last name</label>
          <input id="lastName" name="lastName" type="text" required autoComplete="family-name" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="9123 4567" />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="field">
        <label>Are you currently employed?</label>
        <div className="radio-row">
          <label className="radio-option">
            <input type="radio" name="employed" value="yes" required /> Yes
          </label>
          <label className="radio-option">
            <input type="radio" name="employed" value="no" /> No
          </label>
        </div>
      </div>

      <div className="field">
        <label htmlFor="idHolderType">IC or PASS holder</label>
        <select id="idHolderType" name="idHolderType" required defaultValue="">
          <option value="" disabled>
            Select an option
          </option>
          <option value="IC">I/C</option>
          <option value="WORK_PERMIT">Work Permit</option>
          <option value="SPASS">S Pass</option>
          <option value="EPASS">E Pass</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="loanAmount">Loan amount</label>
        <input id="loanAmount" name="loanAmount" type="number" min={500} step={100} required placeholder="$" />
      </div>

      <SubmitButton />
    </form>
  );
}
