import type { University, UniversityDeadline } from "@/lib/models";

export type AuditStatus = "Подтверждено" | "Частично TBA" | "TBA";
export type FundingGroup = "Очень сильное" | "Полный пакет — конкурс" | "Сильная tuition scholarship";
export type TestPolicy = "Обязательный SAT/academic test" | "Route-specific" | "Optional";

export interface AuditUniversityMeta {
  id: string;
  number: number;
  name: string;
  shortName: string;
  country: string;
  city: string;
  auditStatus: AuditStatus;
  fundingGroup: FundingGroup;
  testPolicy: TestPolicy;
  applicationPlatform: "Common App" | "Собственный портал";
  applicationFee: string;
}

export const AUDIT_FILE_URL = "/data/fall-2027-admissions-audit-ru.md";

export const AUDIT_UNIVERSITIES: AuditUniversityMeta[] = [
  { id: "audit-kaist", number: 1, name: "KAIST — Korea Advanced Institute of Science and Technology", shortName: "KAIST", country: "South Korea", city: "Daejeon", auditStatus: "Подтверждено", fundingGroup: "Очень сильное", testPolicy: "Обязательный SAT/academic test", applicationPlatform: "Собственный портал", applicationFee: "2027 TBA; old reference USD 80 / KRW 80,000" },
  { id: "audit-postech", number: 2, name: "POSTECH", shortName: "POSTECH", country: "South Korea", city: "Pohang", auditStatus: "Частично TBA", fundingGroup: "Очень сильное", testPolicy: "Route-specific", applicationPlatform: "Собственный портал", applicationFee: "TBA" },
  { id: "audit-kfupm", number: 3, name: "KFUPM", shortName: "KFUPM", country: "Saudi Arabia", city: "Dhahran", auditStatus: "TBA", fundingGroup: "Сильная tuition scholarship", testPolicy: "Route-specific", applicationPlatform: "Собственный портал", applicationFee: "Не опубликовано" },
  { id: "audit-hkust", number: 4, name: "HKUST", shortName: "HKUST", country: "Hong Kong", city: "Hong Kong", auditStatus: "Подтверждено", fundingGroup: "Сильная tuition scholarship", testPolicy: "Optional", applicationPlatform: "Собственный портал", applicationFee: "HKD 600" },
  { id: "audit-dgist", number: 5, name: "DGIST", shortName: "DGIST", country: "South Korea", city: "Daegu", auditStatus: "Подтверждено", fundingGroup: "Очень сильное", testPolicy: "Optional", applicationPlatform: "Собственный портал", applicationFee: "KRW 50,000" },
  { id: "audit-unist", number: 6, name: "UNIST", shortName: "UNIST", country: "South Korea", city: "Ulsan", auditStatus: "Подтверждено", fundingGroup: "Очень сильное", testPolicy: "Optional", applicationPlatform: "Собственный портал", applicationFee: "KRW 50,000" },
  { id: "audit-mbzuai", number: 7, name: "MBZUAI", shortName: "MBZUAI", country: "United Arab Emirates", city: "Abu Dhabi", auditStatus: "Подтверждено", fundingGroup: "Полный пакет — конкурс", testPolicy: "Optional", applicationPlatform: "Собственный портал", applicationFee: "AED 200 после exam; возможен waiver/refund" },
  { id: "audit-cityuhk", number: 8, name: "City University of Hong Kong", shortName: "CityUHK", country: "Hong Kong", city: "Hong Kong", auditStatus: "TBA", fundingGroup: "Сильная tuition scholarship", testPolicy: "Optional", applicationPlatform: "Собственный портал", applicationFee: "HKD 450" },
  { id: "audit-qatar", number: 9, name: "Qatar University", shortName: "Qatar University", country: "Qatar", city: "Doha", auditStatus: "TBA", fundingGroup: "Полный пакет — конкурс", testPolicy: "Route-specific", applicationPlatform: "Собственный портал", applicationFee: "QAR 200" },
  { id: "audit-udst", number: 10, name: "University of Doha for Science and Technology (UDST)", shortName: "UDST", country: "Qatar", city: "Doha", auditStatus: "TBA", fundingGroup: "Полный пакет — конкурс", testPolicy: "Route-specific", applicationPlatform: "Собственный портал", applicationFee: "QAR 300" },
  { id: "audit-aus", number: 11, name: "American University of Sharjah (AUS)", shortName: "AUS", country: "United Arab Emirates", city: "Sharjah", auditStatus: "TBA", fundingGroup: "Полный пакет — конкурс", testPolicy: "Route-specific", applicationPlatform: "Собственный портал", applicationFee: "AED 400–420" },
  { id: "audit-gist", number: 12, name: "GIST", shortName: "GIST", country: "South Korea", city: "Gwangju", auditStatus: "Подтверждено", fundingGroup: "Очень сильное", testPolicy: "Обязательный SAT/academic test", applicationPlatform: "Собственный портал", applicationFee: "0" },
  { id: "audit-cmuq", number: 13, name: "Carnegie Mellon University in Qatar (CMU-Q)", shortName: "CMU-Q", country: "Qatar", city: "Doha", auditStatus: "Подтверждено", fundingGroup: "Полный пакет — конкурс", testPolicy: "Обязательный SAT/academic test", applicationPlatform: "Common App", applicationFee: "USD 70" },
  { id: "audit-nyuad", number: 14, name: "NYU Abu Dhabi", shortName: "NYUAD", country: "United Arab Emirates", city: "Abu Dhabi", auditStatus: "Подтверждено", fundingGroup: "Полный пакет — конкурс", testPolicy: "Optional", applicationPlatform: "Common App", applicationFee: "USD 85" },
  { id: "audit-nu", number: 15, name: "Nazarbayev University", shortName: "Nazarbayev University", country: "Kazakhstan", city: "Astana", auditStatus: "TBA", fundingGroup: "Сильная tuition scholarship", testPolicy: "Route-specific", applicationPlatform: "Собственный портал", applicationFee: "KZT 10,000; до KZT 30,000" },
];

const deadline = (universityId: string, id: string, round: string, deadlineDate: string, type: string, openingDate?: string, decisionDate?: string): UniversityDeadline => ({ id, universityId, round, deadlineDate, type, openingDate, decisionDate, status: "Confirmed 2027" });

const DEADLINES: Record<string, UniversityDeadline[]> = {
  "audit-kaist": [deadline("audit-kaist", "kaist-early", "Early application", "2026-10-22T23:59", "Application", "2026-09-22", "2027-01-07"), deadline("audit-kaist", "kaist-early-rec", "Early recommendation", "2026-10-29T23:59", "Recommendation"), deadline("audit-kaist", "kaist-regular", "Regular application", "2027-01-14T23:59", "Application", "2026-11-10", "2027-03-25"), deadline("audit-kaist", "kaist-regular-rec", "Regular recommendation", "2027-01-21T23:59", "Recommendation")],
  "audit-hkust": [deadline("audit-hkust", "hkust-priority", "Priority deadline", "2026-11-25T23:59", "Application"), deadline("audit-hkust", "hkust-rolling", "Rolling application closes", "2027-06-30T23:59", "Application")],
  "audit-dgist": [deadline("audit-dgist", "dgist-application", "Application window closes", "2027-01-28T23:59", "Application", "2026-12-02", "2027-05-11")],
  "audit-unist": [deadline("audit-unist", "unist-application", "Application window closes", "2027-01-22T23:59", "Application", "2026-12-02", "2027-05-07"), deadline("audit-unist", "unist-deposit", "Enrolment deposit", "2027-05-18T23:59", "Deposit", "2027-05-07")],
  "audit-mbzuai": [deadline("audit-mbzuai", "mbzuai-ea", "Early Action", "2026-11-01T23:59", "Application", "2026-09-07", "2027-01-15"), deadline("audit-mbzuai", "mbzuai-regular", "Regular", "2027-02-01T23:59", "Application", undefined, "2027-04-01")],
  "audit-gist": [deadline("audit-gist", "gist-application", "Application and documents", "2027-01-29T23:59", "Application", "2026-12-01", "2027-04-30"), deadline("audit-gist", "gist-registration", "Registration closes", "2027-06-25T23:59", "Registration", "2027-05-04")],
  "audit-cmuq": [deadline("audit-cmuq", "cmuq-ed", "Early Decision", "2026-11-01T23:59", "Application", undefined, "2026-12-15"), deadline("audit-cmuq", "cmuq-ed-aid", "ED QF financial aid", "2026-11-20T23:59", "Financial aid"), deadline("audit-cmuq", "cmuq-rd", "Regular Decision", "2027-01-15T23:59", "Application", undefined, "2027-04-01"), deadline("audit-cmuq", "cmuq-rd-aid", "RD QF financial aid", "2027-02-01T23:59", "Financial aid"), deadline("audit-cmuq", "cmuq-enrol", "Enrolment reply", "2027-05-01T23:59", "Enrolment")],
  "audit-nyuad": [deadline("audit-nyuad", "nyuad-ed1", "Early Decision I", "2026-11-01T23:59", "Application", undefined, "2026-12-15"), deadline("audit-nyuad", "nyuad-ed1-css", "ED I CSS Profile", "2026-11-10T23:59", "Financial aid"), deadline("audit-nyuad", "nyuad-ed2", "Early Decision II", "2027-01-01T23:59", "Application", undefined, "2027-02-15"), deadline("audit-nyuad", "nyuad-rd", "Regular Decision", "2027-01-05T23:59", "Application", undefined, "2027-04-01"), deadline("audit-nyuad", "nyuad-ed2-css", "ED II CSS Profile", "2027-01-10T23:59", "Financial aid"), deadline("audit-nyuad", "nyuad-rd-css", "RD CSS Profile", "2027-02-01T23:59", "Financial aid")],
};

export function createAuditUniversity(meta: AuditUniversityMeta): University {
  const now = new Date().toISOString();
  return { id: meta.id, name: meta.name, country: meta.country, city: meta.city, website: "", status: "Researching", majors: [], deadlines: DEADLINES[meta.id] ?? [], requirements: [], tests: [], documents: [], scholarships: [], costs: [meta.applicationFee], notes: "", sourceInformation: `audit-section-${meta.number}`, createdAt: now, updatedAt: now };
}

export function extractUniversitySection(markdown: string, number: number): string {
  const start = markdown.search(new RegExp(`^## ${number}\\. `, "m"));
  if (start < 0) return "";
  const rest = markdown.slice(start);
  const next = rest.slice(1).search(/^## \d+\. /m);
  return next < 0 ? rest.trim() : rest.slice(0, next + 1).trim();
}

export function extractOverview(markdown: string): string {
  const start = markdown.indexOf("## Как читать отчёт");
  const end = markdown.search(/^## 1\. /m);
  return markdown.slice(start >= 0 ? start : 0, end >= 0 ? end : markdown.length).trim();
}
