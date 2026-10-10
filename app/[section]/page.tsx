import { SectionWorkspace } from "@/components/study-os/section-workspace";
import { PlannerWorkspace } from "@/components/study-os/planner-workspace";
import { CompetitionsWorkspace } from "@/components/study-os/competitions-workspace";
import { UniversitiesWorkspace } from "@/components/study-os/universities-workspace";
import { AdmissionsWorkspace } from "@/components/study-os/admissions-workspace";
import { SettingsWorkspace } from "@/components/study-os/settings-workspace";
import { DeadlinesWorkspace } from "@/components/study-os/deadlines-workspace";
import { DocumentsWorkspace } from "@/components/study-os/documents-workspace";
import { notFound } from "next/navigation";

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (section === "planner") return <PlannerWorkspace />;
  if (section === "competitions") return <CompetitionsWorkspace />;
  if (section === "universities") return <UniversitiesWorkspace />;
  if (section === "applications") return <AdmissionsWorkspace />;
  if (section === "settings") return <SettingsWorkspace />;
  if (section === "deadlines") return <DeadlinesWorkspace />;
  if (section === "documents") return <DocumentsWorkspace />;
  if (!["tasks", "resources"].includes(section)) notFound();
  return <SectionWorkspace section={section} />;
}
