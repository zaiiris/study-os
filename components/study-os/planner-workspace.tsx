"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, Pause, Play, Plus, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/study-os/app-shell";
import { AppModal, FormField } from "@/components/study-os/controls";
import { useI18n } from "@/components/study-os/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStudyData } from "@/hooks/use-study-data";
import { useCollection } from "@/hooks/use-collection";
import type { Event } from "@/lib/models";

const EMPTY_EVENTS: Event[] = [];
const pad = (value: number) => String(value).padStart(2, "0");
const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function PlannerWorkspace() {
  const { language } = useI18n();
  const ru = language === "ru";
  const locale = ru ? "ru-RU" : "en";
  const { tasks } = useStudyData();
  const { records: events, upsert } = useCollection<Event>("events", EMPTY_EVENTS);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => dateKey(new Date()));
  const [eventModal, setEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({ title: "", time: "09:00", description: "" });
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => { if (!running) return; const interval = window.setInterval(() => setSeconds((value) => value + 1), 1000); return () => window.clearInterval(interval); }, [running]);
  const firstOffset = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(firstOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  const selectedTasks = tasks.filter((task) => task.deadline.slice(0, 10) === selected);
  const selectedEvents = events.filter((event) => event.date === selected);
  const weekStart = useMemo(() => { const date = new Date(); const day = (date.getDay() + 6) % 7; date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - day); return date; }, []);
  const week = Array.from({ length: 7 }, (_, index) => { const date = new Date(weekStart); date.setDate(weekStart.getDate() + index); return date; });
  const saveEvent = async () => { if (!eventForm.title.trim()) return; await upsert({ id: crypto.randomUUID(), title: eventForm.title.trim(), date: selected, startTime: eventForm.time, type: "Personal", description: eventForm.description, relatedEntity: undefined }); setEventModal(false); setEventForm({ title: "", time: "09:00", description: "" }); };
  const clock = `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;

  return <AppShell active="planner" title={ru ? "Планер" : "Planner"} intro={ru ? "Месяц, выбранный день, обзор недели и фокус-таймер в одном месте." : "Month calendar, selected day, weekly overview, and focus timer in one place."} action={<Button onClick={() => setEventModal(true)} className="rounded-xl bg-[#2859d8]"><Plus className="size-4" />{ru ? "Событие" : "Event"}</Button>}>
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <Card className="gap-0 rounded-2xl border-[#e1e6ef] py-0 shadow-none"><CardHeader className="flex-row items-center justify-between border-b px-6 py-5"><div><CardTitle className="capitalize">{new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month)}</CardTitle></div><div className="flex gap-1"><Button variant="outline" size="icon-sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft className="size-4" /></Button><Button variant="outline" onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>{ru ? "Сегодня" : "Today"}</Button><Button variant="outline" size="icon-sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight className="size-4" /></Button></div></CardHeader><CardContent className="p-4 sm:p-6"><div className="mb-2 grid grid-cols-7">{(ru ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map((day) => <div key={day} className="py-2 text-center text-xs font-bold uppercase text-[#8a94a7]">{day}</div>)}</div><div className="grid grid-cols-7 gap-1.5">{cells.map((day, index) => { if (!day) return <div key={`blank-${index}`} />; const key = dateKey(new Date(month.getFullYear(), month.getMonth(), day)); const items = tasks.filter((task) => task.deadline.slice(0, 10) === key).length + events.filter((event) => event.date === key).length; const isToday = key === dateKey(new Date()); const isSelected = key === selected; return <button key={key} onClick={() => setSelected(key)} className={`min-h-20 rounded-xl border p-2 text-left transition sm:min-h-24 ${isSelected ? "border-[#2859d8] bg-[#eef3ff]" : "border-transparent bg-[#f8f9fb] hover:border-[#b7c6ec]"}`}><span className={`grid size-7 place-items-center rounded-lg text-sm font-bold ${isToday ? "bg-[#2859d8] text-white" : ""}`}>{day}</span>{items > 0 && <div className="mt-2 flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#2859d8]" /><span className="text-xs font-semibold text-[#657188]">{items}</span></div>}</button>; })}</div></CardContent></Card>

      <div className="space-y-6"><Card className="gap-0 rounded-2xl border-[#e1e6ef] py-0 shadow-none"><CardHeader className="border-b px-5 py-5"><CardTitle className="capitalize">{new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${selected}T12:00`))}</CardTitle></CardHeader><CardContent className="space-y-3 p-5">{[...selectedTasks.map((task) => ({ id: task.id, title: task.title, time: task.deadline.slice(11, 16), kind: ru ? "Задача" : "Task" })), ...selectedEvents.map((event) => ({ id: event.id, title: event.title, time: event.startTime ?? "", kind: ru ? "Событие" : "Event" }))].sort((a, b) => a.time.localeCompare(b.time)).map((item) => <div key={`${item.kind}-${item.id}`} className="flex items-start gap-3 rounded-xl bg-[#f6f8fb] p-3"><span className="mt-1 grid size-8 place-items-center rounded-lg bg-white text-[#2859d8]"><Clock3 className="size-4" /></span><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm text-[#707b8e]">{item.time || "—"} · {item.kind}</p></div></div>)}{selectedTasks.length + selectedEvents.length === 0 && <p className="py-5 text-center text-sm text-[#7b8698]">{ru ? "На этот день ничего нет." : "Nothing scheduled for this day."}</p>}<Button variant="outline" className="w-full" onClick={() => setEventModal(true)}><Plus className="size-4" />{ru ? "Добавить событие" : "Add event"}</Button></CardContent></Card>

      <Card className="rounded-2xl border-[#e1e6ef] shadow-none"><CardHeader><CardTitle>{ru ? "Фокус-таймер" : "Focus timer"}</CardTitle></CardHeader><CardContent><p className="mb-5 text-center font-mono text-4xl font-bold tabular-nums">{clock}</p><div className="flex justify-center gap-2"><Button onClick={() => setRunning((value) => !value)}>{running ? <Pause className="size-4" /> : <Play className="size-4" />}{running ? (ru ? "Пауза" : "Pause") : (ru ? "Старт" : "Start")}</Button><Button variant="outline" onClick={() => { setRunning(false); setSeconds(0); }}><RotateCcw className="size-4" />{ru ? "Сброс" : "Reset"}</Button></div></CardContent></Card></div>
    </div>

    <Card className="mt-6 rounded-2xl border-[#e1e6ef] shadow-none"><CardHeader><CardTitle>{ru ? "Обзор недели" : "Weekly overview"}</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">{week.map((date) => { const key = dateKey(date); const dayTasks = tasks.filter((task) => task.deadline.slice(0, 10) === key); return <button key={key} onClick={() => setSelected(key)} className="min-h-32 rounded-xl border border-[#e5e9f0] p-3 text-left hover:border-[#9fb3e8]"><p className="text-xs font-bold uppercase text-[#8a94a7]">{new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date)}</p><p className="mt-1 text-xl font-bold">{date.getDate()}</p><div className="mt-3 space-y-1">{dayTasks.slice(0, 2).map((task) => <p key={task.id} className="truncate text-xs font-semibold text-[#556177]">{task.title}</p>)}{dayTasks.length > 2 && <Badge variant="secondary">+{dayTasks.length - 2}</Badge>}</div></button>; })}</CardContent></Card>

    <AppModal open={eventModal} onOpenChange={setEventModal} title={ru ? "Новое событие" : "New event"} description={new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(`${selected}T12:00`))} footer={<><Button variant="outline" onClick={() => setEventModal(false)}>{ru ? "Отмена" : "Cancel"}</Button><Button onClick={() => void saveEvent()}>{ru ? "Сохранить" : "Save"}</Button></>}><div className="grid gap-4"><FormField label={ru ? "Название" : "Title"}><Input value={eventForm.title} onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })} /></FormField><FormField label={ru ? "Время" : "Time"}><Input type="time" value={eventForm.time} onChange={(event) => setEventForm({ ...eventForm, time: event.target.value })} /></FormField><FormField label={ru ? "Описание" : "Description"}><Input value={eventForm.description} onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })} /></FormField></div></AppModal>
  </AppShell>;
}
