import { reviewSections } from "@/lib/singpass/reviewFields";

type Row = Record<string, unknown>;
function value(raw: unknown): string {
  if (raw == null) return "—";
  if (typeof raw === "object") {
    const field = raw as Row;
    if (field.unavailable) return "Not available";
    return value(field.desc ?? field.value);
  }
  return String(raw) || "—";
}
function money(raw: unknown) {
  const text = value(raw);
  return text !== "—" && Number.isFinite(Number(text)) ? Number(text).toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : text;
}
function rows(info: Row, key: string, collection: string): Row[] {
  const raw = info[key] as Row | undefined;
  return raw && !raw.unavailable && Array.isArray(raw[collection]) ? (raw[collection] as unknown[]).filter((r): r is Row => !!r && typeof r === "object" && !Array.isArray(r)) : [];
}
export function FinancialHistory({ info, readOnly = false }: { info: Row; readOnly?: boolean }) {
  const cpf = rows(info, "cpfcontributions", "history").sort((a,b) => value(a.date).localeCompare(value(b.date)) || value(a.month).localeCompare(value(b.month)));
  const noa = rows(info, "noahistory", "noas");
  return <>
    <section className="card"><h2>CPF contribution history</h2><p className="review-caption">Employer contributions · up to 15 months</p>
      {cpf.length ? <div className="review-table-scroll"><table className="review-table"><thead><tr><th>For month</th><th>Paid on</th><th>Amount (S$)</th><th>Employer contribution</th></tr></thead><tbody>{cpf.map((row,i) => <tr key={i}><td>{value(row.month)}</td><td>{value(row.date)}</td><td>{money(row.amount)}</td><td>{value(row.employer)}</td></tr>)}</tbody></table></div> : <p>Not available from Myinfo</p>}
    </section>
    <section className="card"><h2>Notice of Assessment</h2>
      {noa.length ? <div className="noa-grid">{noa.map((row,i) => <div className="noa-record" key={i}>
        <div className="noa-heading"><strong>Year of Assessment:</strong> {value(row.yearofassessment)}</div>
        <div><strong>Type:</strong> {value(row.category)}{value(row.taxclearance) === "Y" ? " (Clearance)" : ""}</div>
        <div><strong>Assessable income:</strong> {value(row.amount) === "—" ? "—" : `S$${money(row.amount)}`}</div>
        <div><strong>Income breakdown</strong><ul>{["employment","trade","rent","interest"].map(key => <li key={key}>{key[0].toUpperCase()+key.slice(1)}: {value(row[key]) === "—" ? "—" : `S$${money(row[key])}`}</li>)}</ul></div>
      </div>)}</div> : <p>Not available from Myinfo</p>}
    </section>
    {!readOnly && reviewSections(info).filter(s => ["cpfcontributions","noahistory"].includes(s.key)).flatMap(s => s.fields.filter(f => f.editable)).map(f => <div className="field" key={f.path}><label htmlFor={f.path}>{f.label}</label><input id={f.path} name={`myinfo:${f.path}`} defaultValue={f.value} maxLength={500} /></div>)}
  </>;
}
