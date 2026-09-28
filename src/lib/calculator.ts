export function calculateRepayment(amount: number, months: number, monthlyRate: number) {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(months) || months < 1 || !Number.isFinite(monthlyRate) || monthlyRate < 0) throw new Error("Invalid loan inputs");
  const r = monthlyRate / 100;
  const installment = r === 0 ? amount / months : amount * r / (1 - Math.pow(1 + r, -months));
  let balance = amount;
  const schedule = Array.from({ length: months }, (_, i) => {
    const interest = balance * r;
    const principal = i === months - 1 ? balance : installment - interest;
    const payment = principal + interest;
    balance = Math.max(0, balance - principal);
    return { month: i + 1, payment, interest, principal, balance };
  });
  const totalPayment = schedule.reduce((sum, row) => sum + row.payment, 0);
  return { installment, totalPayment, totalInterest: totalPayment - amount, schedule };
}
