"use client";

import { useMemo, useState } from "react";
import { Download, ExternalLink, FileUp, Pencil, Plus, Search, Trash2, Trophy } from "lucide-react";
import { toast, Toaster } from "sonner";
import { AppShell } from "@/components/study-os/app-shell";
import { AppModal, FilterSelect, FormField } from "@/components/study-os/controls";
import { useI18n } from "@/components/study-os/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection } from "@/hooks/use-collection";
import type { Competition } from "@/lib/models";

const EMPTY: Competition[] = [];
const STATUSES: Competition["status"][] = ["Not submitted", "Soon", "Submitted", "Result", "Accepted", "Rejected"];
const PRIORITIES: Competition["priority"][] = ["Low", "Medium", "High", "Urgent"];
const blank = { name: "", type: "", description: "", requirements: "", deadline: "", status: "Not submitted" as Competition["status"], link: "", priority: "Medium" as Competition["priority"] };

export function CompetitionsWorkspace() {
  const { language } = useI18n();
  const ru = language === "ru";
  const locale = ru ? "ru-RU" : "en";
  const { records, upsert, remove } = useCollection<Competition>("competitions", EMPTY);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(blank);
  const [importText, setImportText] = useState("");
  const [today] = useState(() => Date.now());

  const soon = records.filter((item) => item.deadline && new Date(item.deadline).getTime() >= today && new Date(item.deadline).getTime() - today <= 14 * 86400000).length;
  const filtered = useMemo(() => records.map((item) => ({ ...item, requirements: item.requirements ?? [], priority: item.priority ?? "Medium" as const, status: STATUSES.includes(item.status) ? item.status : "Not submitted" as const })).filter((item) => (filter === "All" || item.status === filter) && [item.name, item.type, item.description, item.requirements.join(" ")].join(" ").toLowerCase().includes(search.toLowerCase())).sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? "")), [records, filter, search]);
  const openNew = () => { setEditing(null); setForm(blank); setModal(true); };
  const openEdit = (item: Competition) => { setEditing(item.id); setForm({ name: item.name, type: item.type ?? "", description: item.description ?? "", requirements: (item.requirements ?? []).join(", "), deadline: (item.deadline ?? "").slice(0, 16), status: STATUSES.includes(item.status) ? item.status : "Not submitted", link: item.link ?? "", priority: PRIORITIES.includes(item.priority) ? item.priority : "Medium" }); setModal(true); };
  const save = async () => { if (!form.name.trim() || !form.deadline) return toast.error(ru ? "Нужны название и дедлайн" : "Name and deadline are required"); await upsert({ id: editing ?? crypto.randomUUID(), name: form.name.trim(), type: form.type.trim(), description: form.description.trim(), requirements: form.requirements.split(",").map((item) => item.trim()).filter(Boolean), deadline: form.deadline, status: form.status, link: form.link.trim() || undefined, priority: form.priority }); setModal(false); toast.success(ru ? "Сохранено" : "Saved"); };
  const bulkImport = async () => {
    const lines = importText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    let imported = 0;
    for (const line of lines) {
      const parts = line.split(/\s+[—-]\s+/).map((part) => part.trim());
      if (parts.length < 2) continue;
      const [name, deadline, type = "", status = "Not submitted", requirements = "", description = "", link = "", priority = "Medium"] = parts;
      const parsedStatus = STATUSES.includes(status as Competition["status"]) ? status as Competition["status"] : "Not submitted";
      const parsedPriority = PRIORITIES.includes(priority as Competition["priority"]) ? priority as Competition["priority"] : "Medium";
      await upsert({ id: crypto.randomUUID(), name, deadline, type, status: parsedStatus, requirements: requirements.split(",").map((item) => item.trim()).filter(Boolean), description, link: link || undefined, priority: parsedPriority }); imported++;
    }
    setImportModal(false); setImportText(""); toast.success(ru ? `Импортировано: ${imported}` : `Imported: ${imported}`);
  };

  return <AppShell active="competitions" title={ru ? "Конкурсы и дедлайны" : "Competitions & deadlines"} intro={ru ? "Все конкурсы в одной редактируемой таблице — с требованиями, статусами, ссылками и приоритетами." : "Every competition in one editable table, with requirements, statuses, links, and priorities."} action={<div className="flex gap-2"><Button variant="outline" onClick={() => setImportModal(true)}><FileUp className="size-4" /><span className="hidden sm:inline">{ru ? "Импорт" : "Import"}</span></Button><Button onClick={openNew} className="bg-[#2859d8]"><Plus className="size-4" />{ru ? "Добавить дедлайн" : "Add deadline"}</Button></div>}>
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label={ru ? "Всего" : "Total"} value={records.length} tone="blue" /><Stat label={ru ? "Подано" : "Submitted"} value={records.filter((item) => item.status === "Submitted").length} tone="violet" /><Stat label={ru ? "Принято" : "Accepted"} value={records.filter((item) => item.status === "Accepted").length} tone="green" /><Stat label={ru ? "Скоро дедлайн" : "Due soon"} value={soon} tone="amber" /></div>
    <Card className="gap-0 overflow-hidden rounded-2xl border-[#e1e6ef] py-0 shadow-none"><div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a94a7]" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={ru ? "Поиск по названию, типу, описанию…" : "Search name, type, description…"} className="pl-10" /></div><div className="flex flex-wrap gap-2">{["All", ...STATUSES].map((status) => <button key={status} onClick={() => setFilter(status)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${filter === status ? "bg-[#172137] text-white" : "bg-[#f2f4f8] text-[#657188] hover:bg-[#e9edf4]"}`}>{statusLabel(status, ru)}</button>)}</div></div><CardContent className="p-0">{filtered.length ? <Table><TableHeader><TableRow className="bg-[#f8f9fb]"><TableHead className="px-5">{ru ? "Название" : "Name"}</TableHead><TableHead>{ru ? "Тип" : "Type"}</TableHead><TableHead>{ru ? "Требования" : "Requirements"}</TableHead><TableHead>{ru ? "Дедлайн" : "Deadline"}</TableHead><TableHead>{ru ? "Статус" : "Status"}</TableHead><TableHead>{ru ? "Приоритет" : "Priority"}</TableHead><TableHead className="w-32" /></TableRow></TableHeader><TableBody>{filtered.map((item) => <TableRow key={item.id} onClick={() => openEdit(item)} className="cursor-pointer"><TableCell className="max-w-[280px] px-5 py-4"><p className="font-semibold">{item.name}</p><p className="mt-1 truncate text-sm text-[#7b8698]">{item.description || "—"}</p></TableCell><TableCell>{item.type || "—"}</TableCell><TableCell className="max-w-64"><p className="truncate text-sm text-[#657188]">{item.requirements.join(", ") || "—"}</p></TableCell><TableCell className="font-semibold">{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(item.deadline))}</TableCell><TableCell><Badge variant="outline">{statusLabel(item.status, ru)}</Badge></TableCell><TableCell><Badge className={item.priority === "Urgent" ? "bg-red-100 text-red-700" : item.priority === "High" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}>{priorityLabel(item.priority, ru)}</Badge></TableCell><TableCell><div className="flex justify-end"><Button variant="ghost" size="icon-sm" onClick={(event) => { event.stopPropagation(); openEdit(item); }}><Pencil className="size-4" /></Button>{item.link && <Button variant="ghost" size="icon-sm" asChild onClick={(event) => event.stopPropagation()}><a href={item.link} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /></a></Button>}<Button variant="ghost" size="icon-sm" className="text-red-600" onClick={(event) => { event.stopPropagation(); void remove(item.id); }}><Trash2 className="size-4" /></Button></div></TableCell></TableRow>)}</TableBody></Table> : <div className="p-16 text-center"><Trophy className="mx-auto mb-4 size-9 text-[#aab4c4]" /><p className="font-semibold">{ru ? "Конкурсов пока нет" : "No competitions yet"}</p><p className="mt-1 text-sm text-[#7b8698]">{ru ? "Добавьте первый дедлайн или импортируйте список." : "Add your first deadline or import a list."}</p></div>}</CardContent></Card>

    <AppModal open={modal} onOpenChange={setModal} title={editing ? (ru ? "Редактировать конкурс" : "Edit competition") : (ru ? "Добавить дедлайн" : "Add deadline")} footer={<><Button variant="outline" onClick={() => setModal(false)}>{ru ? "Отмена" : "Cancel"}</Button><Button onClick={() => void save()}>{ru ? "Сохранить" : "Save"}</Button></>}><div className="grid gap-4"><FormField label={ru ? "Название" : "Name"}><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></FormField><div className="grid gap-4 sm:grid-cols-2"><FormField label={ru ? "Тип" : "Type"}><Input value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} /></FormField><FormField label={ru ? "Дедлайн" : "Deadline"}><Input type="datetime-local" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></FormField></div><FormField label={ru ? "Описание" : "Description"}><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></FormField><FormField label={ru ? "Требования — через запятую" : "Requirements — comma separated"}><Input value={form.requirements} onChange={(event) => setForm({ ...form, requirements: event.target.value })} /></FormField><div className="grid gap-4 sm:grid-cols-2"><FormField label={ru ? "Статус" : "Status"}><FilterSelect value={form.status} onChange={(value) => setForm({ ...form, status: value as Competition["status"] })} options={STATUSES} label="Status" /></FormField><FormField label={ru ? "Приоритет" : "Priority"}><FilterSelect value={form.priority} onChange={(value) => setForm({ ...form, priority: value as Competition["priority"] })} options={PRIORITIES} label="Priority" /></FormField></div><FormField label={ru ? "Ссылка" : "Link"}><Input type="url" value={form.link} onChange={(event) => setForm({ ...form, link: event.target.value })} /></FormField></div></AppModal>

    <AppModal open={importModal} onOpenChange={setImportModal} title={ru ? "Импорт дедлайнов" : "Import deadlines"} description={ru ? "Одна строка — один дедлайн. Поля разделяются тире с пробелами." : "One line per deadline. Separate fields with a spaced dash."} footer={<><Button variant="outline" onClick={() => setImportModal(false)}>{ru ? "Отмена" : "Cancel"}</Button><Button onClick={() => void bulkImport()}><Download className="size-4" />{ru ? "Импортировать" : "Import"}</Button></>}><div><Textarea value={importText} onChange={(event) => setImportText(event.target.value)} className="min-h-48 font-mono text-sm" placeholder={ru ? "Название — 2026-11-15 — Тип — Not submitted — Требование 1, Требование 2 — Описание — https://... — High" : "Name — 2026-11-15 — Type — Not submitted — Requirement 1, Requirement 2 — Description — https://... — High"} /><p className="mt-3 text-xs leading-5 text-[#7b8698]">{ru ? "Порядок: название — дедлайн — тип — статус — требования — описание — ссылка — приоритет" : "Order: name — deadline — type — status — requirements — description — link — priority"}</p></div></AppModal><Toaster position="bottom-right" richColors />
  </AppShell>;
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "blue" | "violet" | "green" | "amber" }) { const color = { blue: "text-blue-700 bg-blue-50", violet: "text-violet-700 bg-violet-50", green: "text-emerald-700 bg-emerald-50", amber: "text-amber-700 bg-amber-50" }[tone]; return <Card className="rounded-2xl border-[#e1e6ef] py-0 shadow-none"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm font-semibold text-[#707b8e]">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div><span className={`grid size-10 place-items-center rounded-xl ${color}`}><Trophy className="size-5" /></span></CardContent></Card>; }
function statusLabel(status: string, ru: boolean) { if (!ru) return status; return ({ All: "Все", "Not submitted": "Не подано", Soon: "Скоро", Submitted: "Подано", Result: "Результат", Accepted: "Принято", Rejected: "Отклонено" } as Record<string, string>)[status] ?? status; }
function priorityLabel(priority: string, ru: boolean) { if (!ru) return priority; return ({ Low: "Низкий", Medium: "Средний", High: "Высокий", Urgent: "Срочно" } as Record<string, string>)[priority] ?? priority; }
