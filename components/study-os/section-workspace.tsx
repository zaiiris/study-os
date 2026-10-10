"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Check, ExternalLink, FileText, Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
import { toast, Toaster } from "sonner";
import { AppShell } from "@/components/study-os/app-shell";
import { AppModal, FormField, ProgressBar } from "@/components/study-os/controls";
import { useI18n, type MessageKey } from "@/components/study-os/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCollection } from "@/hooks/use-collection";
import { useStudyData } from "@/hooks/use-study-data";
import type { StoreName, Task } from "@/lib/models";

type Section = "planner" | "tasks" | "exams" | "universities" | "applications" | "documents" | "competitions" | "projects" | "resources" | "analytics" | "settings";
type SimpleEntity = { id: string; name?: string; title?: string; description?: string; status?: string; date?: string; deadline?: string; link?: string; meta?: string };

const storeMap: Record<Section, StoreName> = { planner: "events", tasks: "tasks", exams: "exams", universities: "universities", applications: "applications", documents: "documents", competitions: "competitions", projects: "projects", resources: "resources", analytics: "events", settings: "userProfiles" };
const introMap: Record<Section, MessageKey> = { planner: "plannerIntro", tasks: "tasksIntro", exams: "examsIntro", universities: "universitiesIntro", applications: "applicationsIntro", documents: "documentsIntro", competitions: "competitionsIntro", projects: "projectsIntro", resources: "resourcesIntro", analytics: "analyticsIntro", settings: "settingsIntro" };
const initialMap: Record<Section, SimpleEntity[]> = {
  planner: [{ id: "event-sat", title: "SAT Math — timed practice", description: "90 minutes", date: "2026-09-20T17:00", status: "Study block" }, { id: "event-ielts", title: "IELTS Writing review", description: "60 minutes", date: "2026-09-20T19:30", status: "Study block" }],
  tasks: [], exams: [],
  universities: [],
  applications: [],
  documents: [],
  competitions: [],
  projects: [],
  resources: [],
  analytics: [], settings: [],
};

const sectionSet = new Set<Section>(Object.keys(storeMap) as Section[]);

export function SectionWorkspace({ section: rawSection }: { section: string }) {
  const section = (sectionSet.has(rawSection as Section) ? rawSection : "tasks") as Section;
  const { language, t } = useI18n();
  const { tasks, exams, completeTask, upsertTask, removeTask } = useStudyData();
  const initial = initialMap[section];
  const { records, upsert, remove } = useCollection<SimpleEntity>(storeMap[section], initial);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<SimpleEntity | null>(null);
  const [form, setForm] = useState({ name: "", description: "", date: "", status: "" });
  const locale = language === "ru" ? "ru-RU" : "en";
  const title = t(section as MessageKey);
  const editable = !["exams", "analytics", "settings"].includes(section);
  const completed = tasks.filter((task) => task.status === "Completed").length;

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", date: "", status: "" }); setModal(true); };
  const openEdit = (record: SimpleEntity) => { setEditing(record); setForm({ name: record.name ?? record.title ?? "", description: record.description ?? "", date: (record.date ?? record.deadline ?? "").slice(0, 16), status: record.status ?? "" }); setModal(true); };
  const save = async () => {
    if (!form.name.trim()) return toast.error(language === "ru" ? "Введите название" : "Add a title");
    if (section === "tasks") {
      const existing = editing ? tasks.find((task) => task.id === editing.id) : undefined;
      const task: Task = { id: existing?.id ?? crypto.randomUUID(), title: form.name.trim(), description: form.description.trim(), category: "Personal", priority: "Medium", status: existing?.status ?? "Todo", deadline: form.date || new Date(Date.now() + 86400000).toISOString().slice(0, 16), createdDate: existing?.createdDate ?? new Date().toISOString() };
      await upsertTask(task);
    } else {
      await upsert({ id: editing?.id ?? crypto.randomUUID(), [section === "resources" ? "title" : "name"]: form.name.trim(), description: form.description.trim(), status: form.status || (language === "ru" ? "Новое" : "New"), ...(form.date ? { deadline: form.date } : {}) });
    }
    setModal(false); toast.success(language === "ru" ? "Сохранено" : "Saved");
  };

  const displayRecords = section === "tasks" ? tasks.map((task) => ({ id: task.id, name: task.title, description: task.description, status: task.status, deadline: task.deadline, meta: `${task.category} · ${task.priority}` })) : records;
  const sortedTasks = useMemo(() => [...tasks].sort((a, b) => a.deadline.localeCompare(b.deadline)), [tasks]);

  return <AppShell active={section} title={title} intro={t(introMap[section])} action={editable ? <Button onClick={openCreate} className="rounded-xl bg-[#2859d8] hover:bg-[#214dbf]"><Plus className="size-4" />{t("add")}</Button> : undefined}>
    {section === "planner" && <div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><RecordTable records={displayRecords} locale={locale} onEdit={openEdit} onDelete={(id) => void remove(id)} t={t} /><Card className="rounded-2xl border-[#e4e8ef] shadow-none"><CardHeader><CardTitle>{t("today")}</CardTitle></CardHeader><CardContent className="space-y-4">{sortedTasks.slice(0, 4).map((task) => <div key={task.id} className="rounded-xl bg-[#f6f8fb] p-4"><p className="font-semibold">{task.title}</p><p className="mt-1 text-sm text-[#707b8e]">{new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(task.deadline))}</p></div>)}</CardContent></Card></div>}

    {section === "tasks" && <RecordTable records={displayRecords} locale={locale} onEdit={openEdit} onDelete={(id) => void removeTask(id)} onToggle={(id) => { const task = tasks.find((item) => item.id === id); if (task) void completeTask(task); }} t={t} />}

    {section === "exams" && <div className="grid gap-5 md:grid-cols-2">{exams.map((exam) => { const progress = Math.round((exam.currentScore / exam.targetScore) * 100); return <Card key={exam.id} className="rounded-2xl border-[#e4e8ef] shadow-none"><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-xl">{exam.name}</CardTitle><Badge variant="outline">{new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(new Date(exam.date))}</Badge></div></CardHeader><CardContent><div className="mb-5 flex items-end gap-2"><span className="text-4xl font-bold">{exam.currentScore}</span><span className="pb-1 text-[#8a94a7]">/ {exam.targetScore}</span></div><ProgressBar value={progress} /><p className="mt-5 text-sm font-semibold text-[#707b8e]">{language === "ru" ? "Слабые темы" : "Weak areas"}</p><div className="mt-2 flex flex-wrap gap-2">{exam.weakAreas.map((area) => <Badge key={area} variant="secondary">{area}</Badge>)}</div></CardContent></Card>; })}</div>}

    {!["planner", "tasks", "exams", "analytics", "settings"].includes(section) && <RecordTable records={displayRecords} locale={locale} onEdit={openEdit} onDelete={(id) => void remove(id)} t={t} />}

    {section === "analytics" && <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={<Check className="size-5" />} label={t("tasksCompleted")} value={`${completed}/${tasks.length}`} progress={tasks.length ? Math.round(completed / tasks.length * 100) : 0} /><Metric icon={<CalendarDays className="size-5" />} label={t("thisWeek")} value={`${tasks.filter((task) => task.status !== "Completed").length}`} progress={68} /><Metric icon={<TrendingUp className="size-5" />} label="SAT" value={`${exams.find((exam) => exam.name === "SAT")?.currentScore ?? 0}`} progress={90} /><Metric icon={<FileText className="size-5" />} label={t("applications")} value="3/8" progress={38} /></div>}

    {section === "settings" && <div className="grid gap-5 md:grid-cols-2"><Card className="rounded-2xl border-[#e4e8ef] shadow-none"><CardHeader><CardTitle>{language === "ru" ? "Профиль" : "Profile"}</CardTitle></CardHeader><CardContent className="space-y-4"><FormField label={language === "ru" ? "Имя" : "Name"}><Input value="ZIYADA" readOnly /></FormField><FormField label={language === "ru" ? "Выпуск" : "Graduation year"}><Input value="2027" readOnly /></FormField></CardContent></Card><Card className="rounded-2xl border-[#e4e8ef] shadow-none"><CardHeader><CardTitle>{t("backup")}</CardTitle></CardHeader><CardContent><p className="mb-5 text-sm leading-6 text-[#707b8e]">{language === "ru" ? "Резервное копирование доступно на главной странице через карточку профиля." : "Backup and restore are available from the profile card on the Dashboard."}</p><Button asChild variant="outline"><Link href="/">{t("dashboard")}</Link></Button></CardContent></Card></div>}

    <AppModal open={modal} onOpenChange={setModal} title={editing ? t("saveChanges") : t("add")} description={t("localSave")} footer={<><Button variant="outline" onClick={() => setModal(false)}>{t("cancel")}</Button><Button onClick={() => void save()}>{editing ? t("saveChanges") : t("add")}</Button></>}><div className="grid gap-4 py-2"><FormField label={t("title")}><Input autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></FormField><FormField label={t("description")}><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></FormField><div className="grid gap-4 sm:grid-cols-2"><FormField label={t("date")}><Input type="datetime-local" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></FormField><FormField label={t("status")}><Input value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} /></FormField></div></div></AppModal>
    <Toaster position="bottom-right" richColors />
  </AppShell>;
}

function RecordTable({ records, locale, onEdit, onDelete, onToggle, t }: { records: SimpleEntity[]; locale: string; onEdit: (record: SimpleEntity) => void; onDelete: (id: string) => void; onToggle?: (id: string) => void; t: (key: MessageKey) => string }) {
  return <Card className="overflow-hidden rounded-2xl border-[#e4e8ef] py-0 shadow-none"><CardContent className="p-0">{records.length ? <Table><TableHeader><TableRow className="bg-[#f8f9fb]"><TableHead className="px-5">{t("title")}</TableHead><TableHead>{t("status")}</TableHead><TableHead>{t("date")}</TableHead><TableHead className="w-28" /></TableRow></TableHeader><TableBody>{records.map((record) => { const date = record.date ?? record.deadline; return <TableRow key={record.id}><TableCell className="px-5 py-4"><div className="flex items-center gap-3">{onToggle && <button onClick={() => onToggle(record.id)} className={`grid size-5 place-items-center rounded-full border-2 ${record.status === "Completed" ? "border-[#2859d8] bg-[#2859d8] text-white" : "border-[#c9d0dc]"}`}>{record.status === "Completed" && <Check className="size-3" />}</button>}<div><p className="font-semibold">{record.name ?? record.title}</p><p className="mt-1 max-w-xl truncate text-sm text-[#7b8698]">{record.description || record.meta || "—"}</p></div></div></TableCell><TableCell><Badge variant="outline">{record.status ?? "—"}</Badge></TableCell><TableCell className="text-[#707b8e]">{date ? new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(new Date(date)) : "—"}</TableCell><TableCell><div className="flex justify-end"><Button variant="ghost" size="icon-sm" onClick={() => onEdit(record)} aria-label="Edit"><Pencil className="size-4" /></Button>{record.link && <Button variant="ghost" size="icon-sm" asChild><a href={record.link} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /></a></Button>}<Button variant="ghost" size="icon-sm" className="text-[#b9404c]" onClick={() => onDelete(record.id)} aria-label="Delete"><Trash2 className="size-4" /></Button></div></TableCell></TableRow>; })}</TableBody></Table> : <div className="p-12 text-center text-[#7b8698]">{t("empty")}</div>}</CardContent></Card>;
}

function Metric({ icon, label, value, progress }: { icon: React.ReactNode; label: string; value: string; progress: number }) { return <Card className="rounded-2xl border-[#e4e8ef] shadow-none"><CardContent className="pt-6"><div className="mb-8 grid size-10 place-items-center rounded-xl bg-[#eef3ff] text-[#2859d8]">{icon}</div><p className="text-sm font-semibold text-[#707b8e]">{label}</p><p className="my-2 text-3xl font-bold">{value}</p><ProgressBar value={progress} /></CardContent></Card>; }
