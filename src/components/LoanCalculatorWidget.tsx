"use client";

import { useMemo, useState } from "react";

const MAX_MONTHLY_RATE = 4; // Ministry of Law cap for licensed moneylenders, unsecured loans.

export function LoanCalculatorWidget() {
  const [amount, setAmount] = useState(3000);
  const [tenure, setTenure] = useState(12);
  const [rate, setRate] = useState(4);

  const result = useMemo(() => {
    const r = rate / 100;
    const n = tenure;
    const p = amount;
    // Standard amortising-loan formula.
    const installment = r === 0 ? p / n : (p * r) / (1 - Math.pow(1 + r, -n));
    const totalPayment = installment * n;
    const totalInterest = totalPayment - p;
    return { installment, totalPayment, totalInterest };
  }, [amount, tenure, rate]);

  const fmt = (value: number) =>
    value.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="calc-layout">
      <div>
        <div className="field">
          <label htmlFor="calc-amount">Loan amount: ${amount.toLocaleString("en-SG")}</label>
          <input
            id="calc-amount"
            type="range"
            min={500}
            max={50000}
            step={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div className="field">
          <label htmlFor="calc-tenure">Term: {tenure} month{tenure === 1 ? "" : "s"}</label>
          <input
            id="calc-tenure"
            type="range"
            min={1}
            max={36}
            step={1}
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
          />
        </div>

        <div className="field">
          <label htmlFor="calc-rate">Interest (monthly): {rate}%</label>
          <input
            id="calc-rate"
            type="range"
            min={1}
            max={MAX_MONTHLY_RATE}
            step={0.5}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="card calc-result">
        <span className="calc-result-label">Estimated Monthly Installment</span>
        <span className="calc-result-figure">${fmt(result.installment)}</span>

        <div className="calc-result-rows">
          <div>
            <span>Principal</span>
            <span>${fmt(amount)}</span>
          </div>
          <div>
            <span>Monthly Interest Rate</span>
            <span>{rate}%</span>
          </div>
          <div>
            <span>Total Interest</span>
            <span>${fmt(result.totalInterest)}</span>
          </div>
          <div>
            <span>Total Repayment</span>
            <span>${fmt(result.totalPayment)}</span>
          </div>
        </div>

        <p className="calc-disclaimer">
          This calculator provides an estimate only, using the Ministry of Law&apos;s maximum permitted rate for
          unsecured loans. Actual loan approval, interest rate, fees, and repayment terms are subject to assessment.
        </p>
      </div>
    </div>
  );
}
