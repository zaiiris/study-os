export type AdmissionTab = "overview" | "deadlines" | "application" | "requirements" | "documents" | "essays" | "recommendations" | "funding" | "programs" | "housing" | "after-admission" | "sources";
export type EvidenceStatus = "confirmed" | "partial" | "tba" | "previous-cycle";
export interface AuditRow { id: string; fields: Record<string, string>; prompt?: {officialPrompt:string|null;promptRu:string;sourceEnglish:string;sourceField?:string;wording:'exact'|'paraphrase'|'unpublished'}; }
export interface AuditBlock { id: string; title: string; tab: AdmissionTab; paragraphs: string[]; lists: string[]; tables: { columns: string[]; rows: AuditRow[] }[]; analysis: boolean; }
export interface OfficialDeadline {
  id: string; universityId: string; title: string; type: string; date: string | null;
  endDate: string | null; time: string | null; timezone: string | null;
  precision: "exact" | "range" | "tba" | "relative"; evidence: EvidenceStatus; display: string; sourceIds: string[];
  approximate?: { ru: string; en: string };
}
export interface OfficialUniversity {
  id: string; name: string; country: string; city: string; batch: number; checkedAt: string;
  evidence: EvidenceStatus; awaitingAudit: boolean; platform: string; programs: string[];
  fundingTags: string[]; fundingSummary: string; admissionDifficulty: string; fundingDifficulty: string;
  blocks: AuditBlock[]; deadlines: OfficialDeadline[]; sources: { id: string; title: string; url: string }[];
  sourceFile: string; sourceSection: string;
  localizedText?: Record<string,{ru:string;en:string}>;
  strategicAssessment?: string;
}
export type PreparationStatus = "not-started" | "requested" | "ready" | "submitted" | "verified" | "idea" | "draft" | "editing" | "final";
export interface ItemProgress { status: PreparationStatus; notes: string; teacher?: string; targetDate?: string; }
export interface AdmissionsProgress {
  id: string; version: 1; applicationStatus: string; items: Record<string, ItemProgress>;
  completedDeadlines: string[]; targets: Record<string, string>; notes: string; updatedAt: string;
  customDeadlines: OfficialDeadline[]; legacyData?: unknown;
}
export interface DeadlineEntry extends OfficialDeadline { university: OfficialUniversity; kind: "official" | "target"; completed: boolean; }
