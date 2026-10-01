"use client";
import { useState } from "react";
import Link from "next/link";

type RecordItem = { id: string; name: string; kind: "applicant" | "lead"; createdAt: string; loanAmount: number | null; sourceEnvironment?: string };
const date = new Intl.DateTimeFormat("en-SG", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Singapore" });
const time = new Intl.DateTimeFormat("en-SG", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Singapore" });

export default function ApplicationList({ records }: { records: RecordItem[] }) {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("all");
  const filtered = records.filter(r => (channel === "all" || r.kind === channel) && r.name.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="staff-inbox" aria-label="Applications list">
    <div className="staff-inbox-heading"><h2>Application inbox</h2><span>Newest first · Singapore time</span></div>
    <div className="staff-inbox-controls">
      <div className="staff-filters" role="group" aria-label="Filter by channel">{[["all", "All"], ["lead", "Manual"], ["applicant", "Myinfo"]].map(([value,label]) => <button key={value} type="button" aria-pressed={channel === value} onClick={() => setChannel(value)}>{label}<span>{value === "all" ? records.length : records.filter(r => r.kind === value).length}</span></button>)}</div>
      <div className="staff-search"><label htmlFor="staff-search">Search applicants</label><input id="staff-search" type="search" placeholder="Search by name…" value={query} onChange={e => setQuery(e.target.value)} /></div>
    </div>
    <p className="staff-result-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? "record" : "records"}{query ? ` matching “${query}”` : ""}</p>
    {filtered.length ? <div className="staff-table-wrap"><table className="staff-table"><thead><tr><th scope="col">Applicant</th><th scope="col">Channel</th><th scope="col">Requested amount</th><th scope="col">Submitted</th><th scope="col"><span className="staff-sr-only">Open application</span></th></tr></thead><tbody>{filtered.map(r => <tr key={`${r.kind}-${r.id}`}>
      <td data-label="Applicant"><Link className="staff-applicant-name" href={`/staff/${r.kind}/${r.id}`} prefetch={false}>{r.name}</Link></td>
      <td data-label="Channel"><span className={`staff-badge ${r.kind === "lead" ? "staff-badge-manual" : r.sourceEnvironment !== "production" ? "staff-badge-test" : ""}`}>{r.kind === "lead" ? "Manual" : "Myinfo"}{r.kind === "applicant" && r.sourceEnvironment !== "production" ? " · Test" : ""}</span></td>
      <td data-label="Requested amount" className="staff-amount">{r.loanAmount == null ? <span className="staff-muted">Not provided</span> : `S$${r.loanAmount.toLocaleString("en-SG")}`}</td>
      <td data-label="Submitted"><time dateTime={r.createdAt}>{date.format(new Date(r.createdAt))}<small>{time.format(new Date(r.createdAt))}</small></time></td>
      <td className="staff-open-cell"><Link className="staff-open" href={`/staff/${r.kind}/${r.id}`} prefetch={false} aria-label={`View application for ${r.name}`}>View details <span aria-hidden="true">→</span></Link></td>
    </tr>)}</tbody></table></div> : <div className="staff-empty"><h3>{query ? "No matching applications" : "No enquiries here yet"}</h3><p>{query ? "Try another name or a different channel." : "Submitted applications will appear here automatically when you open this page."}</p>{(query || channel !== "all") && <button className="staff-text-link" onClick={() => {setQuery("");setChannel("all");}}>Show all applications</button>}</div>}
  </section>;
}
