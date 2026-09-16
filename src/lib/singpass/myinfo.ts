// Maps MyInfo's `person_info` payload into the shape src/lib/actions/singpass.ts persists onto
// an Applicant row. Field set is deliberately exactly the 28 fields this project's Singpass app
// registration requests (see client.ts's SCOPES) — no more, no fewer.
//
// Mapping conventions (field shapes, quirks) are ported from Loanify's production-approved
// integration (src/lib/singpass/myinfo.ts there), which checked these directly against
// Singpass's own Person API OpenAPI schema rather than guessing:
// - mobileno is prefix/areacode/nbr, not a flat value
// - cpfcontributions.history / noahistory.noas rows wrap every subfield in {value}
// - regadd/hdbownership/vehicles wrap Meta (incl. `source`) on the PARENT object only — their
//   sub-fields carry just {value}, so source must be inherited manually (withParentSource)
// - residentialstatus returns a genuinely blank desc for a foreigner (FIN holder), not an
//   explicit "Foreigner" string — `desc === undefined` (field absent) and `desc === ""` (field
//   present but blank) are different signals and must not collapse to the same branch
//
// Fails soft throughout: an unexpected shape leaves that one field unset rather than throwing,
// so a single unusual persona/record can't break the whole callback.

export type MyInfoMeta = { value?: unknown; code?: string; desc?: string; source?: string; unavailable?: boolean };
export type MyInfoPersonInfo = Record<string, MyInfoMeta | Record<string, unknown> | unknown>;

function readField(info: MyInfoPersonInfo, key: string): MyInfoMeta | null {
  const raw = info[key];
  if (!raw || typeof raw !== "object") return null;
  const field = raw as MyInfoMeta;
  if (field.unavailable) return null;
  return field;
}

/** The value a field should show — prefers `desc` (human-readable) over a coded `value`. */
function fieldText(field: MyInfoMeta | null | undefined): string | undefined {
  if (!field) return undefined;
  if (typeof field.desc === "string") return field.desc;
  if (typeof field.value === "string") return field.value;
  return undefined;
}

function stringValue(field: MyInfoMeta | undefined): string | undefined {
  return typeof field?.value === "string" ? field.value : undefined;
}

function numberValue(field: MyInfoMeta | undefined): number | undefined {
  return typeof field?.value === "number" ? field.value : undefined;
}

/** regadd/hdbownership/vehicles wrap Meta (incl. `source`) on the PARENT object only — their
 * sub-fields carry just {value}, no source of their own. */
function withParentSource(sub: MyInfoMeta | undefined, parent: MyInfoMeta | null | undefined): MyInfoMeta | undefined {
  if (!sub) return sub;
  return { ...sub, source: sub.source ?? parent?.source };
}

/** mobileno has no flat `value` — it's split into prefix/areacode/nbr, each its own
 * {value}-wrapped subfield. Builds e.g. "+65 91234567". */
function mobileNumberText(raw: unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const field = raw as Record<string, MyInfoMeta>;
  const nbr = typeof field.nbr?.value === "string" ? field.nbr.value : undefined;
  if (!nbr) return undefined;
  const prefix = typeof field.prefix?.value === "string" ? field.prefix.value : "+";
  const areacode = typeof field.areacode?.value === "string" ? field.areacode.value : "65";
  return `${prefix}${areacode} ${nbr}`;
}

function normaliseSex(desc: string | undefined): "MALE" | "FEMALE" | undefined {
  if (!desc) return undefined;
  const upper = desc.toUpperCase();
  if (upper.startsWith("M")) return "MALE";
  if (upper.startsWith("F")) return "FEMALE";
  return undefined;
}

// See file header — a foreigner (FIN holder) gets a blank desc, not an explicit string, so
// `desc === undefined` (absent) must be distinguished from `desc === ""` (present but blank).
function normaliseResidentialStatus(desc: string | undefined): "CITIZEN" | "PR" | "FOREIGNER" | undefined {
  if (desc === undefined) return undefined;
  const upper = desc.toUpperCase();
  if (upper.includes("CITIZEN")) return "CITIZEN";
  if (upper.includes("PERMANENT") || upper === "PR") return "PR";
  return "FOREIGNER";
}

function normaliseMaritalStatus(desc: string | undefined): "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | undefined {
  if (!desc) return undefined;
  const upper = desc.toUpperCase();
  if (upper.startsWith("SINGLE")) return "SINGLE";
  if (upper.startsWith("MARRIED")) return "MARRIED";
  if (upper.startsWith("DIVORCED")) return "DIVORCED";
  if (upper.startsWith("WIDOWED")) return "WIDOWED";
  return undefined;
}

export type MyInfoAddress = {
  block?: string;
  street?: string;
  building?: string;
  floor?: string;
  unit?: string;
  postal?: string;
};

function mapAddress(raw: unknown, parentSource?: MyInfoMeta | null): MyInfoAddress | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const rec = raw as Record<string, MyInfoMeta>;
  const block = fieldText(withParentSource(rec["block"], parentSource));
  const street = fieldText(withParentSource(rec["street"], parentSource));
  const building = fieldText(withParentSource(rec["building"], parentSource));
  const floor = fieldText(withParentSource(rec["floor"], parentSource));
  const unit = fieldText(withParentSource(rec["unit"], parentSource));
  const postal = fieldText(withParentSource(rec["postal"], parentSource));
  if (!block && !street && !building && !floor && !unit && !postal) return undefined;
  return { block, street, building, floor, unit, postal };
}

export type CpfContributionRow = { date?: string; month?: string; employerName?: string; amount?: number };

function mapCpfContributions(info: MyInfoPersonInfo): CpfContributionRow[] {
  const raw = info["cpfcontributions"] as { history?: Array<Record<string, MyInfoMeta>> } | undefined;
  const history = raw?.history ?? [];
  return history
    .map((row) => ({
      date: stringValue(row.date),
      month: stringValue(row.month),
      employerName: stringValue(row.employer),
      amount: numberValue(row.amount),
    }))
    .filter((row) => row.date !== undefined || row.employerName !== undefined || row.amount !== undefined);
}

export type NoticeOfAssessmentRow = { yearOfAssessment?: number; amount?: number; assessmentType?: string };

function mapNoticeOfAssessments(info: MyInfoPersonInfo): NoticeOfAssessmentRow[] {
  const noaHistory = info["noahistory"] as { noas?: Array<Record<string, MyInfoMeta>> } | undefined;
  const rows = noaHistory?.noas ?? [];
  return rows
    .map((row) => {
      const year = stringValue(row.yearofassessment);
      return {
        yearOfAssessment: year !== undefined ? Number(year) : undefined,
        amount: numberValue(row.amount),
        assessmentType: stringValue(row.category),
      };
    })
    .filter((row) => row.yearOfAssessment !== undefined || row.amount !== undefined);
}

export type HdbOwnership = {
  numberOfOwners?: number;
  address?: MyInfoAddress;
  dwellingType?: string;
  leaseCommencementDate?: string;
  dateOfPurchase?: string;
  outstandingLoanBalance?: number;
  monthlyLoanInstalment?: number;
};

function mapHdbOwnership(info: MyInfoPersonInfo): HdbOwnership | undefined {
  const raw = info["hdbownership"];
  const entry = (Array.isArray(raw) ? raw[0] : raw) as (Record<string, MyInfoMeta> & MyInfoMeta) | undefined;
  if (!entry || typeof entry !== "object") return undefined;

  const numberOfOwners = withParentSource(entry["noofowners"], entry);
  const dwellingType = withParentSource(entry["hdbtype"], entry);
  const leaseCommencement = withParentSource(entry["leasecommencementdate"], entry);
  const dateOfPurchase = withParentSource(entry["dateofpurchase"], entry);
  const outstandingLoan = withParentSource(entry["outstandingloanbalance"], entry);
  const monthlyInstalment = withParentSource(entry["monthlyloaninstalment"], entry);
  const address = mapAddress(entry["address"], entry);

  return {
    numberOfOwners: numberValue(numberOfOwners),
    address,
    dwellingType: fieldText(dwellingType),
    leaseCommencementDate: stringValue(leaseCommencement),
    dateOfPurchase: stringValue(dateOfPurchase),
    outstandingLoanBalance: numberValue(outstandingLoan),
    monthlyLoanInstalment: numberValue(monthlyInstalment),
  };
}

/** vehicles — array of {classification, source, lastupdated, vehicleno: {value}, ...}. Only
 * `vehicleno` is requested (see client.ts's SCOPES: "vehicles.vehicleno"), so that's the only
 * subfield read here even though Singpass's schema has many more per entry. */
function mapVehicleNumbers(info: MyInfoPersonInfo): string[] {
  const raw = info["vehicles"];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => (entry && typeof entry === "object" ? stringValue((entry as Record<string, MyInfoMeta>)["vehicleno"]) : undefined))
    .filter((v): v is string => v !== undefined);
}

export type ApplicantMyInfoData = {
  nric?: string;
  name?: string;
  sex?: "MALE" | "FEMALE";
  race?: string;
  dateOfBirth?: string;
  residentialStatus?: "CITIZEN" | "PR" | "FOREIGNER";
  nationality?: string;
  passType?: string;
  passStatus?: string;
  passExpiryDate?: string;
  mobileNumber?: string;
  email?: string;
  address?: MyInfoAddress;
  housingType?: string;
  ownsPrivateProperty?: boolean;
  employerName?: string;
  occupation?: string;
  maritalStatus?: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  vehicleNumbers: string[];
  hdbOwnership?: HdbOwnership;
  cpfContributions: CpfContributionRow[];
  noticeOfAssessments: NoticeOfAssessmentRow[];
};

export function mapMyInfoToApplicant(info: MyInfoPersonInfo): ApplicantMyInfoData {
  const uinfin = readField(info, "uinfin");
  const name = readField(info, "name");
  const sex = readField(info, "sex");
  const race = readField(info, "race");
  const dob = readField(info, "dob");
  const residentialStatus = readField(info, "residentialstatus");
  const nationality = readField(info, "nationality");
  const passType = readField(info, "passtype");
  const passStatus = readField(info, "passstatus");
  const passExpiryDate = readField(info, "passexpirydate");
  const email = readField(info, "email");
  const housingType = readField(info, "housingtype");
  const ownerPrivate = readField(info, "ownerprivate");
  const employment = readField(info, "employment");
  const occupation = readField(info, "occupation");
  const marital = readField(info, "marital");

  return {
    nric: fieldText(uinfin),
    name: fieldText(name),
    sex: normaliseSex(fieldText(sex)),
    race: fieldText(race),
    dateOfBirth: typeof dob?.value === "string" ? dob.value : undefined,
    residentialStatus: normaliseResidentialStatus(fieldText(residentialStatus)),
    nationality: fieldText(nationality),
    passType: fieldText(passType),
    passStatus: fieldText(passStatus),
    passExpiryDate: typeof passExpiryDate?.value === "string" ? passExpiryDate.value : undefined,
    mobileNumber: mobileNumberText(info["mobileno"]),
    email: fieldText(email),
    address: mapAddress(info["regadd"], readField(info, "regadd")),
    housingType: fieldText(housingType),
    ownsPrivateProperty: ownerPrivate ? /^y/i.test(fieldText(ownerPrivate) ?? "") : undefined,
    employerName: fieldText(employment),
    occupation: fieldText(occupation),
    maritalStatus: normaliseMaritalStatus(fieldText(marital)),
    vehicleNumbers: mapVehicleNumbers(info),
    hdbOwnership: mapHdbOwnership(info),
    cpfContributions: mapCpfContributions(info),
    noticeOfAssessments: mapNoticeOfAssessments(info),
  };
}
