export const MYINFO_SCOPES = [
  "uinfin",
  "name",
  "sex",
  "race",
  "dob",
  "residentialstatus",
  "nationality",
  "passtype",
  "passstatus",
  "passexpirydate",
  "mobileno",
  "email",
  "regadd",
  "housingtype",
  "cpfcontributions",
  "noahistory",
  "ownerprivate",
  "employment",
  "occupation",
  "marital",
  "vehicles.vehicleno",
  "hdbownership.noofowners",
  "hdbownership.address",
  "hdbownership.hdbtype",
  "hdbownership.leasecommencementdate",
  "hdbownership.dateofpurchase",
  "hdbownership.outstandingloanbalance",
  "hdbownership.monthlyloaninstalment",
] as const;

export type ReviewField = { path: string; label: string; value: string; editable: boolean; source?: string };
export const MARITAL_STATUSES = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"] as const;
const labels: Record<string, string> = {
  uinfin: "NRIC / FIN", name: "Principal name", sex: "Sex", race: "Race", dob: "Date of birth",
  residentialstatus: "Residential status", nationality: "Nationality / citizenship", passtype: "Pass type",
  passstatus: "Pass status", passexpirydate: "Pass expiry date", mobileno: "Mobile number", email: "Email",
  regadd: "Registered address", housingtype: "Housing type", cpfcontributions: "CPF contribution history",
  noahistory: "Notice of Assessment history", ownerprivate: "Ownership of private residential property",
  employment: "Employment income / employer", occupation: "Occupation", marital: "Marital status",
  vehicles: "Vehicles", vehicleno: "Vehicle number", hdbownership: "HDB ownership", noofowners: "Number of owners",
  address: "Address", hdbtype: "HDB dwelling type", leasecommencementdate: "Lease commencement date",
  dateofpurchase: "Date of purchase", outstandingloanbalance: "Outstanding HDB loan balance (S$)",
  monthlyloaninstalment: "Monthly HDB loan instalment (S$)", date: "Paid on", month: "For month",
  employer: "Employer", amount: "Amount (S$)", category: "Type", yearofassessment: "Year of Assessment",
  taxclearance: "Tax clearance", trade: "Trade income (S$)", rent: "Rental income (S$)", interest: "Interest income (S$)",
  prefix: "Prefix", areacode: "Country code", nbr: "Number", block: "Block", street: "Street", building: "Building",
  floor: "Floor", unit: "Unit", postal: "Postal code", country: "Country", type: "Type", line1: "Address line 1", line2: "Address line 2",
};
export const fieldLabel = (key: string) => labels[key] ?? key;

// Traverse every returned field, retaining source-based editability and original values.
export function reviewFields(data: unknown, path = "", parentSource?: string, prefix = ""): ReviewField[] {
  // MSF marital status is explicitly editable, even when source is government-verified.
  if (path === "marital") {
    const item = data && typeof data === "object" ? data as Record<string, unknown> : {};
    return [{ path: "marital.desc", label: "Marital status", value: String(item.desc ?? item.value ?? ""), editable: true, source: typeof item.source === "string" ? item.source : undefined }];
  }
  if (data == null) return [{ path, label: prefix, value: "Not available", editable: false }];
  if (Array.isArray(data)) {
    const rows = data.map((row, i) => ({ row, i }));
    if (path === "cpfcontributions.history") rows.sort((a, b) =>
      String(a.row?.date?.value ?? "").localeCompare(String(b.row?.date?.value ?? "")) ||
      String(a.row?.month?.value ?? "").localeCompare(String(b.row?.month?.value ?? "")));
    return rows.length ? rows.flatMap(({ row, i }, displayIndex) => reviewFields(row, `${path}.${i}`, parentSource, `${prefix} ${displayIndex + 1}`)) : [{ path, label: prefix, value: "No records", editable: false }];
  }
  if (typeof data !== "object") return [{ path, label: prefix, value: String(data), editable: false }];
  const item = data as Record<string, unknown>;
  const source = typeof item.source === "string" ? item.source : parentSource;
  if (item.unavailable === true) return [{ path, label: prefix, value: "Not available from source", editable: false, source }];
  if ("value" in item || "desc" in item) {
    const raw = item.desc ?? item.value;
    return [{ path: `${path}.${"desc" in item ? "desc" : "value"}`, label: prefix, value: raw == null ? "" : String(raw), editable: source === "2" && path !== "name", source }];
  }
  return Object.entries(item).filter(([key]) => !["source", "classification", "lastupdated", "unavailable"].includes(key))
    .flatMap(([key, val]) => {
      const fields = reviewFields(val, path ? `${path}.${key}` : key, source, prefix ? `${prefix} — ${fieldLabel(key)}` : fieldLabel(key));
      if (path.startsWith("noahistory.noas.") && key === "category" && (item.taxclearance as { value?: string })?.value === "Y") {
        return fields.map((field) => ({ ...field, label: `${field.label} (Clearance)` }));
      }
      return fields;
    });
}
export function applyUserEdits(info: Record<string, unknown>, form: FormData): Record<string, unknown> {
  const clone = structuredClone(info);
  const originalMarital = reviewFields(info.marital, "marital")[0].value;
  const marital = form.get("myinfo:marital.desc");
  if (marital !== null) {
    if (typeof marital !== "string" || (marital !== originalMarital && !MARITAL_STATUSES.includes(marital as typeof MARITAL_STATUSES[number]))) throw new Error("Invalid marital status");
    // Retain the original payload when unchanged; a correction is user-provided,
    // and must not retain a conflicting government code or verification source.
    if (marital !== originalMarital) clone.marital = { value: marital, desc: marital, source: "2" };
  }
  for (const field of reviewFields(info).filter((f) => f.editable)) {
    if (field.path === "marital.desc") continue;
    const update = form.get(`myinfo:${field.path}`);
    if (typeof update !== "string" || update.length > 500) throw new Error("Invalid editable field");
    const parts = field.path.split(".");
    if (parts.some((p) => ["__proto__", "constructor", "prototype"].includes(p))) throw new Error("Invalid field path");
    let node: Record<string, unknown> = clone;
    for (const part of parts.slice(0, -1)) node = node[part] as Record<string, unknown>;
    const leaf = parts.at(-1)!;
    if (typeof node[leaf] === "number") {
      if (!update.trim() || !Number.isFinite(Number(update))) throw new Error("Invalid number");
      node[leaf] = Number(update);
    } else if (typeof node[leaf] === "boolean") {
      if (update !== "true" && update !== "false") throw new Error("Invalid boolean");
      node[leaf] = update === "true";
    } else node[leaf] = update;
  }
  return clone;
}

// Display placeholders without modifying the retrieved payload or making missing data editable.
export function reviewSections(info: Record<string, unknown>) {
  const roots = [...new Set(MYINFO_SCOPES.map(scope => scope.split(".")[0]))];
  return roots.map(key => {
    const fields = key in info || key === "marital" ? reviewFields(info[key], key) : [];
    for (const scope of MYINFO_SCOPES.filter(scope => scope.split(".")[0] === key)) {
      const covered = fields.some(field => {
        const path = field.path.split(".").filter(part => !/^\d+$/.test(part)).join(".");
        return path === scope || path.startsWith(scope + ".");
      });
      if (!covered) fields.push({ path: scope, label: fieldLabel(scope.split(".").at(-1)!), value: "Not available from Myinfo", editable: false });
    }
    return { key, fields };
  });
}
