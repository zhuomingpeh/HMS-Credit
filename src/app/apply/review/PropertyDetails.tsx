import { fieldLabel, reviewFields, MYINFO_SCOPES } from "@/lib/singpass/reviewFields";

type Data = Record<string, unknown>;
function text(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "object") { const row = raw as Data; return row.unavailable ? "" : text(row.desc ?? row.value); }
  return String(raw);
}
function address(raw: unknown) {
  if (!raw || typeof raw !== "object") return text(raw);
  const row = raw as Data;
  if (row.unavailable) return "Not available from Myinfo";
  const floor = text(row.floor), unit = text(row.unit);
  return [
    [text(row.block), text(row.street)].filter(Boolean).join(" "),
    text(row.building),
    floor || unit ? `#${floor}${floor && unit ? "-" : ""}${unit}` : "",
    text(row.line1), text(row.line2),
    [text(row.country), text(row.postal)].filter(Boolean).join(" "),
  ].filter(Boolean).join(", ");
}
function ScopeField({ label, path, raw, source }: { label: string; path: string; raw: unknown; source?: string }) {
  const fields = reviewFields(raw, path, source);
  const editable = fields.some(field => field.editable);
  const isAddress = path === "regadd" || path.endsWith(".address");
  const display = isAddress ? address(raw) : fields.map(field => field.value).filter(Boolean).join(" · ");
  return <div className={`review-detail${isAddress ? " review-address" : ""}`}>
    <div className="review-field-label">{label}</div>
    {editable ? fields.map(field => field.editable ? <div key={field.path}><label className="review-sub-label" htmlFor={field.path}>{field.label || label}</label><input id={field.path} name={`myinfo:${field.path}`} defaultValue={field.value} maxLength={500} /></div> : <div className="review-readonly" key={field.path}>{field.value}</div>) : <div className="review-readonly">{display || "Not available from Myinfo"}</div>}
  </div>;
}
export function AddressEmployment({ info }: { info: Data }) {
  return <section className="card"><h2>Address and employment</h2><div className="review-grid">
    {["regadd", "hdbtype", "employment", "occupation", "ownerprivate", "vehicles"].map(key => <ScopeField key={key} path={key} raw={info[key]} label={key === "employment" ? "Employer's name" : key === "hdbtype" ? "Type of HDB (registered address)" : fieldLabel(key)} />)}
  </div></section>;
}
export function HdbDetails({ info }: { info: Data }) {
  const raw = info.hdbownership;
  const records = Array.isArray(raw) && raw.length ? raw : [raw];
  return <section className="card"><h2>HDB ownership</h2>{records.map((record, index) => {
    const item = record && typeof record === "object" ? record as Data : {};
    const base = Array.isArray(raw) ? `hdbownership.${index}` : "hdbownership";
    return <div className="review-property" key={index}>
      {records.length > 1 && <h3>Property {index + 1}</h3>}
      <div className="review-grid">{MYINFO_SCOPES.filter(scope => scope.startsWith("hdbownership.")).map(scope => {
        const key = scope.split(".")[1];
        return <ScopeField key={scope} path={`${base}.${key}`} raw={item.unavailable ? undefined : item[key]} source={typeof item.source === "string" ? item.source : undefined} label={fieldLabel(key)} />;
      })}</div>
    </div>;
  })}</section>;
}
