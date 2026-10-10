export type EntityId = string;
export type TaskCategory = "SAT" | "IELTS" | "University" | "School" | "Project" | "Competition" | "Personal";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
export type TaskStatus = "Todo" | "In Progress" | "Completed" | "Cancelled";

export interface UserProfile {
  id: EntityId; name: string; school: string; country: string; city: string; curriculum: string;
  graduationYear: number; targetMajor: string[]; targetCountries: string[]; satScore?: number;
  satTarget?: number; ieltsScore?: number; ieltsTarget?: number; createdAt: string; updatedAt: string;
}

export interface Task {
  id: EntityId; title: string; description: string; category: TaskCategory; priority: TaskPriority;
  status: TaskStatus; deadline: string; createdDate: string; linkedUniversityId?: EntityId;
  linkedProjectId?: EntityId; completedDate?: string;
}

export interface TimeBlock { startTime: string; endTime: string; title: string; category: TaskCategory; }
export interface DailyPlan { id: EntityId; date: string; timeBlocks: TimeBlock[]; dailyGoals: string[]; reflection: string; }
export interface Event { id: EntityId; title: string; date: string; startTime?: string; endTime?: string; type: "Exam" | "Deadline" | "Meeting" | "Competition" | "University" | "Personal"; description: string; relatedEntity?: EntityId; }
export interface Countdown { id: EntityId; name: string; date: string; type: string; color: string; }
export interface PracticeTest { date: string; name: string; score: number; math?: number; readingWriting?: number; notes: string; }
export interface Exam { id: EntityId; name: string; date: string; targetScore: number; currentScore: number; sections: string[]; practiceTests: PracticeTest[]; weakAreas: string[]; }
export interface UniversityDeadline { id: EntityId; universityId: EntityId; round: string; openingDate?: string; deadlineDate: string; decisionDate?: string; type: string; status: string; }
export interface Requirement { category: "Academic" | "English" | "Documents" | "Essay" | "Recommendation" | "Interview" | "Financial"; name: string; required: boolean; status: string; notes: string; }
export interface TestRequirement { testName: string; required: boolean; minimum?: string; notes: string; }
export interface UniversityDocument { documentName: string; status: string; deadline?: string; uploaded: boolean; notes: string; }
export interface Scholarship { name: string; coverage: string[]; amount?: string; automatic: boolean; applicationRequired: boolean; requirements: string[]; renewalConditions: string; }
export interface University {
  id: EntityId; name: string; country: string; city: string; website: string; logo?: string;
  status: "Researching" | "Preparing" | "Submitted" | "Interview" | "Accepted" | "Rejected" | "Waitlisted";
  majors: string[]; deadlines: UniversityDeadline[]; requirements: Requirement[]; tests: TestRequirement[];
  documents: UniversityDocument[]; scholarships: Scholarship[]; costs: string[]; notes: string;
  sourceInformation: string; createdAt: string; updatedAt: string;
}
export interface Application { id: EntityId; universityId: EntityId; applicationStatus: string; submittedDate?: string; portalLink?: string; loginNote?: string; feePaid: boolean; documentsCompleted: number; }
export interface Document { id: EntityId; name: string; type: "Passport" | "Transcript" | "Certificate" | "Score Report" | "Essay" | "CV" | "Recommendation" | "Financial"; status: string; filePath?: string; expirationDate?: string; notes: string; }
export interface Competition { id: EntityId; name: string; type: string; deadline: string; description: string; requirements: string[]; status: "Not submitted" | "Soon" | "Submitted" | "Result" | "Accepted" | "Rejected"; link?: string; result?: string; priority: "Low" | "Medium" | "High" | "Urgent"; }
export interface Project { id: EntityId; name: string; description: string; goals: string[]; tasks: EntityId[]; deadlines: string[]; files: string[]; links: string[]; status: string; }
export interface Resource { id: EntityId; title: string; category: "SAT" | "IELTS" | "University" | "Programming" | "Finance" | "Research"; link: string; description: string; tags: string[]; }
export interface AIImport { id: EntityId; inputText: string; createdDate: string; convertedData: unknown; }

export interface StudyOSSchema {
  admissionsProgress: import('./admissions-types').AdmissionsProgress;
  userProfiles: UserProfile; tasks: Task; dailyPlans: DailyPlan; events: Event; countdowns: Countdown;
  exams: Exam; universities: University; applications: Application; documents: Document;
  competitions: Competition; projects: Project; resources: Resource; aiImports: AIImport;
}

export type StoreName = keyof StudyOSSchema;
export interface StudyOSBackup { app: "Study OS"; version: 1; exportedAt: string; data: { [K in StoreName]: StudyOSSchema[K][] }; }
