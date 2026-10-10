import { UniversityDetail } from "@/components/study-os/university-detail";

export default async function UniversityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UniversityDetail id={id} />;
}
