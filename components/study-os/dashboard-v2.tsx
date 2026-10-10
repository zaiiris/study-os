"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Check, ChevronRight, Clock3, Edit3, Flag, Plus, TimerReset, Trophy, University } from "lucide-react";
import { AppShell } from "@/components/study-os/app-shell";
import { AppModal, FormField } from "@/components/study-os/controls";
import { useI18n } from "@/components/study-os/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStudyData } from "@/hooks/use-study-data";
import { useStudyWebMCP } from "@/hooks/use-study-webmcp";
import { useCollection } from "@/hooks/use-collection";
import { AdmissionsSummary } from "./admissions-workspace";
import type { Competition, Countdown } from "@/lib/models";

const EMPTY_COMPETITIONS: Competition[] = [];

function splitTime(date: string, now: number) {
  if (!date) return null;
  const diff = Math.max(0, new Date(date).getTime() - now);
  return { days: Math.floor(diff / 86400000), hours: Math.floor(diff / 3600000) % 24, minutes: Math.floor(diff / 60000) % 60, seconds: Math.floor(diff / 1000) % 60 };
}

export function DashboardV2() {
  const { language } = useI18n();
  const { tasks, profile, countdowns, upsertCountdown, upsertTask, completeTask } = useStudyData();
  const { records: competitions } = useCollection<Competition>("competitions", EMPTY_COMPETITIONS);
  const [now, setNow] = useState(() => Date.now());
  const [editing, setEditing] = useState<Countdown | null>(null);
  const [date, setDate] = useState("");
  useStudyWebMCP(tasks, upsertTask);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  const ru = language === "ru";
  const locale = ru ? "ru-RU" : "en";
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((task) => task.deadline.slice(0, 10) === todayKey && task.status !== "Cancelled");
  const activeTasks = tasks.filter((task) => task.status !== "Completed" && task.status !== "Cancelled");
  const deadlines = useMemo(() => {
    const taskItems = activeTasks.map((task) => ({ id: task.id, title: task.title, type: ru ? "Задача" : "Task", date: task.deadline, href: "/tasks", color: "#2859d8" }));
    const competitionItems = competitions.map((item) => ({ id: item.id, title: item.name, type: ru ? "Конкурс" : "Competition", date: item.deadline, href: "/competitions", color: "#cf6c14" }));
    return [...taskItems, ...competitionItems].filter((item) => item.date && new Date(item.date).getTime() >= new Date(todayKey).getTime()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
  }, [activeTasks, competitions, ru, todayKey]);
  const countdownOrder = ["countdown-sat", "countdown-ielts"];
  const orderedCountdowns = countdownOrder.map((id) => countdowns.find((item) => item.id === id)).filter(Boolean) as Countdown[];
  const editCountdown = (item: Countdown) => { setEditing(item); setDate(item.date.slice(0, 16)); };
  const saveCountdown = async () => { if (!editing) return; await upsertCountdown({ ...editing, date }); setEditing(null); };

  return <AppShell active="dashboard" title="" intro="" action={<Button asChild className="rounded-xl bg-[#2859d8] hover:bg-[#214dbf]"><Link href="/tasks"><Plus className="size-4" />{ru ? "Задача" : "Task"}</Link></Button>}>
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-[#2859d8]">{new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</p><h1 className="mt-2 text-3xl font-bold tracking-[-.04em] sm:text-[40px]">{ru ? "Доброе утро" : "Good morning"}, {profile.name}</h1><p className="mt-2 text-base text-[#707b8e]">{ru ? "Сегодня — только реальные задачи и дедлайны." : "Today — only your real tasks and deadlines."}</p></div><Badge variant="outline" className="h-9 px-3 text-sm">{activeTasks.length} {ru ? "активных задач" : "active tasks"}</Badge></div>

    <section className="grid gap-4 lg:grid-cols-2" aria-label={ru ? "Обратные отсчёты" : "Countdowns"}>{orderedCountdowns.map((item) => { const time = splitTime(item.date, now); return <Card key={item.id} className="relative overflow-hidden rounded-2xl border-[#e1e6ef] py-0 shadow-[0_8px_30px_rgba(23,33,55,.05)]"><div className="h-1.5" style={{ background: item.color }} /><CardHeader className="flex-row items-center justify-between px-5 pt-5"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl" style={{ background: `${item.color}14`, color: item.color }}>{item.id.includes("application") ? <Flag className="size-[18px]" /> : <TimerReset className="size-[18px]" />}</span><CardTitle className="text-base">{item.id === "countdown-application" ? (ru ? "Главная заявка" : "Main application") : item.name}</CardTitle></div><Button variant="ghost" size="icon-sm" onClick={() => editCountdown(item)} aria-label={ru ? "Изменить дату" : "Edit date"}><Edit3 className="size-4" /></Button></CardHeader><CardContent className="px-5 pb-5">{time ? <><div className="grid grid-cols-4 gap-2">{[[time.days, ru ? "дн" : "days"], [time.hours, ru ? "ч" : "hrs"], [time.minutes, ru ? "мин" : "min"], [time.seconds, ru ? "сек" : "sec"]].map(([value, label]) => <div key={String(label)} className="rounded-xl bg-[#f6f8fb] px-2 py-3 text-center"><p className="text-2xl font-bold tabular-nums">{String(value).padStart(2, "0")}</p><p className="mt-1 text-[11px] font-semibold uppercase text-[#8a94a7]">{label}</p></div>)}</div><p className="mt-4 text-sm text-[#707b8e]">{new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" }).format(new Date(item.date))}</p></> : <button onClick={() => editCountdown(item)} className="w-full rounded-xl border border-dashed border-[#cbd3df] py-7 text-sm font-semibold text-[#2859d8]">{ru ? "Установить дату и время" : "Set date and time"}</button>}</CardContent></Card>; })}</section>

    <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <Card className="gap-0 rounded-2xl border-[#e1e6ef] py-0 shadow-none"><CardHeader className="flex-row items-center justify-between border-b px-6 py-5"><div><CardTitle>{ru ? "Сегодня" : "Today"}</CardTitle><p className="mt-1 text-sm text-[#7b8698]">{todayTasks.length ? (ru ? `${todayTasks.length} задач на сегодня` : `${todayTasks.length} tasks today`) : (ru ? "На сегодня задач нет" : "No tasks scheduled today")}</p></div><Button asChild variant="ghost"><Link href="/tasks">{ru ? "Все задачи" : "All tasks"}<ChevronRight className="size-4" /></Link></Button></CardHeader><CardContent className="p-0">{todayTasks.length ? todayTasks.map((task) => <div key={task.id} className="flex items-center gap-4 border-b px-6 py-4 last:border-0"><button onClick={() => void completeTask(task)} className={`grid size-5 place-items-center rounded-full border-2 ${task.status === "Completed" ? "border-[#2859d8] bg-[#2859d8] text-white" : "border-[#c9d0dc]"}`}>{task.status === "Completed" && <Check className="size-3" />}</button><div className="flex-1"><p className={task.status === "Completed" ? "font-semibold text-[#9aa3b1] line-through" : "font-semibold"}>{task.title}</p><p className="mt-1 text-sm text-[#7b8698]">{task.category} · {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(task.deadline))}</p></div><Badge variant="outline">{task.status}</Badge></div>) : <div className="p-10 text-center"><Check className="mx-auto mb-3 size-8 text-[#0f8a71]" /><p className="font-semibold">{ru ? "Свободный день" : "Clear day"}</p><p className="mt-1 text-sm text-[#7b8698]">{ru ? "Добавьте задачу, если она появится." : "Add a task when something comes up."}</p></div>}</CardContent></Card>

      <Card className="gap-0 rounded-2xl border-[#e1e6ef] py-0 shadow-none"><CardHeader className="flex-row items-center justify-between border-b px-6 py-5"><div><CardTitle>{ru ? "Ближайшие дедлайны" : "Upcoming deadlines"}</CardTitle><p className="mt-1 text-sm text-[#7b8698]">{ru ? "От ближайшего к позднему" : "Nearest first"}</p></div><CalendarDays className="size-5 text-[#2859d8]" /></CardHeader><CardContent className="p-0">{deadlines.length ? deadlines.map((item) => <Link key={`${item.type}-${item.id}`} href={item.href} className="flex items-center gap-4 border-b px-6 py-4 transition hover:bg-[#f8faff] last:border-0"><span className="h-10 w-1 rounded-full" style={{ background: item.color }} /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{item.title}</p><p className="mt-1 text-sm text-[#7b8698]">{item.type}</p></div><div className="text-right"><p className="text-sm font-bold">{new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(new Date(item.date))}</p><p className="mt-1 text-xs text-[#8a94a7]">{Math.max(0, Math.ceil((new Date(item.date).getTime() - now) / 86400000))} {ru ? "дн." : "days"}</p></div></Link>) : <div className="p-10 text-center text-sm text-[#7b8698]">{ru ? "Добавьте задачи, конкурсы или дедлайны университетов." : "Add tasks, competitions, or university deadlines."}</div>}</CardContent></Card>
    </section>

    <div className="mt-8"><AdmissionsSummary compact/></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-3"><QuickLink href="/planner" icon={<Clock3 />} title={ru ? "Календарь и таймер" : "Calendar & timer"} text={ru ? "Месяц, неделя и фокус-сессия" : "Month, week, and focus session"} /><QuickLink href="/applications" icon={<University />} title={ru ? "Этапы поступления" : "Admission timeline"} text={ru ? "Все дедлайны по порядку" : "All deadlines in chronological order"} /><QuickLink href="/competitions" icon={<Trophy />} title={ru ? "Конкурсы" : "Competitions"} text={ru ? "Таблица, фильтры и импорт" : "Table, filters, and import"} /></div>

    <AppModal open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)} title={ru ? "Изменить обратный отсчёт" : "Edit countdown"} description={editing?.name ?? ""} footer={<><Button variant="outline" onClick={() => setEditing(null)}>{ru ? "Отмена" : "Cancel"}</Button><Button onClick={() => void saveCountdown()}>{ru ? "Сохранить" : "Save"}</Button></>}><FormField label={ru ? "Дата и время" : "Date and time"}><Input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} /></FormField></AppModal>
  </AppShell>;
}

function QuickLink({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) { return <Link href={href} className="group rounded-2xl border border-[#e1e6ef] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#aabce9] hover:shadow-[0_10px_28px_rgba(23,33,55,.06)]"><div className="mb-4 grid size-10 place-items-center rounded-xl bg-[#eef3ff] text-[#2859d8] [&>svg]:size-5">{icon}</div><p className="font-bold">{title}</p><p className="mt-1 text-sm text-[#707b8e]">{text}</p></Link>; }
