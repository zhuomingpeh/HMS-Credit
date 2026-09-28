"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { calculateRepayment } from "@/lib/calculator";
const money = (n: number) => n.toLocaleString("en-SG", { style: "currency", currency: "SGD", currencyDisplay: "narrowSymbol" });

export function LoanCalculatorWidget() {
  const [amount, setAmount] = useState(3000);
  const [amountText, setAmountText] = useState("3000");
  const [tenure, setTenure] = useState(12);
  const [rate, setRate] = useState(4);
  const result = useMemo(() => calculateRepayment(amount, tenure, rate), [amount, tenure, rate]);
  const updateAmount = (value: number) => { setAmount(value); setAmountText(String(value)); };
  return <>
    <div className="repayment-calculator">
      <section className="calculator-inputs" aria-label="Loan estimate inputs">
        <span className="staff-login-eyebrow">BUILD YOUR ESTIMATE</span>
        <h2>A repayment plan you can understand</h2>
        <p>Adjust the figures to see how they affect your monthly payment.</p>
        <div className="calculator-control">
          <label htmlFor="calc-amount-number">How much would you like to borrow?</label>
          <div className="calculator-amount-input"><span>S$</span><input id="calc-amount-number" type="number" inputMode="numeric" min={500} max={50000} step={100} value={amountText} onChange={e => { setAmountText(e.target.value); const n=Number(e.target.value); if(Number.isFinite(n) && n>=500 && n<=50000) setAmount(n); }} onBlur={() => updateAmount(Math.round(Math.min(50000, Math.max(500, Number(amountText) || 500))))} /></div>
          <input aria-label="Loan amount slider" type="range" min={500} max={50000} step={100} value={amount} onChange={e => updateAmount(Number(e.target.value))} />
          <div className="calculator-range-labels"><span>S$500</span><span>S$50,000</span></div>
        </div>
        <div className="calculator-control">
          <div className="calculator-label-row"><label htmlFor="calc-tenure">Repayment period</label><output htmlFor="calc-tenure">{tenure} {tenure === 1 ? "month" : "months"}</output></div>
          <input id="calc-tenure" type="range" min={1} max={36} value={tenure} onChange={e => setTenure(Number(e.target.value))} />
          <div className="calculator-presets" role="group" aria-label="Common repayment periods">{[3,6,12,24].map(n => <button type="button" key={n} aria-pressed={tenure===n} onClick={() => setTenure(n)}>{n} months</button>)}</div>
        </div>
        <div className="calculator-control">
          <div className="calculator-label-row"><label htmlFor="calc-rate">Monthly interest rate</label><output htmlFor="calc-rate">{rate}%</output></div>
          <input id="calc-rate" type="range" min={1} max={4} step={0.1} value={rate} onChange={e => setRate(Number(e.target.value))} />
          <div className="calculator-range-labels"><span>1% per month</span><span>4% per month</span></div>
          <p className="calculator-hint">Interest is calculated on the remaining principal each month.</p>
        </div>
      </section>
      <section className="calculator-estimate" aria-label="Repayment estimate">
        <span className="calculator-estimate-tag">REDUCING-BALANCE ESTIMATE</span>
        <p className="calculator-monthly-label">Estimated monthly payment</p>
        <div className="calculator-monthly" aria-live="polite" aria-atomic="true"><span>S$</span>{result.installment.toLocaleString("en-SG",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
        <p className="calculator-monthly-caption">Over {tenure} {tenure === 1 ? "month" : "months"} · {rate}% monthly interest</p>
        <div className="calculator-composition" aria-hidden="true"><span style={{width:`${amount / result.totalPayment * 100}%`}} /></div>
        <dl className="calculator-breakdown"><div><dt>Loan amount</dt><dd>{money(amount)}</dd></div><div><dt>Total interest</dt><dd>{money(result.totalInterest)}</dd></div><div className="calculator-total"><dt>Total repayment</dt><dd>{money(result.totalPayment)}</dd></div></dl>
        <Link className="button" href={`/apply?loanAmount=${amount}`}>Enquire about this amount <span aria-hidden="true">→</span></Link>
        <p className="calculator-estimate-note">An estimate, not a loan offer. Fees and late charges are excluded. Actual terms depend on assessment.</p>
      </section>
    </div>
    <details className="calculator-schedule"><summary>See the monthly repayment breakdown <span>{tenure} {tenure === 1 ? "payment" : "payments"}</span></summary><div className="calculator-schedule-scroll" tabIndex={0} role="region" aria-label="Monthly repayment schedule"><table><caption>Illustrative schedule in Singapore dollars; displayed values rounded to cents.</caption><thead><tr><th>Month</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>{result.schedule.map(row => <tr key={row.month}><th scope="row">{row.month}</th><td>{money(row.payment)}</td><td>{money(row.principal)}</td><td>{money(row.interest)}</td><td>{money(row.balance)}</td></tr>)}</tbody></table></div></details>
    <p className="calculator-footnote">The default 4% monthly rate is the maximum interest rate for licensed moneylenders. This tool does not assess eligibility or borrowing limits. Confirm the full repayment schedule and all fees with our staff before accepting a loan.</p>
  </>;
}
