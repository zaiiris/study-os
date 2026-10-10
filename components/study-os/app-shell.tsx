"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Flag, FileText, GraduationCap, LayoutDashboard, Library, Menu, Settings, Trophy, University } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useI18n, type MessageKey } from "@/components/study-os/i18n";
import { useStudyData } from "@/hooks/use-study-data";

const navigation = [
  ["dashboard", "/", LayoutDashboard],
  ["planner", "/planner", CalendarDays],
  ["tasks", "/tasks", CheckCircle2],
  ["universities", "/universities", University],
  ["applications", "/applications", Flag],
  ["deadlines", "/deadlines", CalendarDays],
  ["documents", "/documents", FileText],
  ["competitions", "/competitions", Trophy],
  ["resources", "/resources", Library],
  ["settings", "/settings", Settings],
] as const;

function Nav({ active, compact = false, close }: { active: string; compact?: boolean; close?: () => void }) {
  const { language, t } = useI18n();
  const admissions = language === "ru" ? "Поступление" : "Admissions";
  return <nav className="space-y-1 p-3" aria-label="Study OS navigation">{navigation.map(([key, href, Icon]) => <Link key={key} href={href} onClick={close} title={compact ? (key === "applications" ? admissions : t(key as MessageKey)) : undefined} aria-current={active === key ? "page" : undefined} className={`flex h-11 items-center gap-3 overflow-hidden rounded-xl px-3 text-sm font-semibold transition ${active === key ? "bg-[#172137] text-white shadow-[0_5px_14px_rgba(23,33,55,.16)]" : "text-[#687386] hover:bg-[#f0f4fa] hover:text-[#172137]"}`}><Icon className="size-[18px] shrink-0" strokeWidth={1.8} /><span className={compact ? "whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100" : "whitespace-nowrap"}>{key === "applications" ? admissions : t(key as MessageKey)}</span></Link>)}</nav>;
}

export function AppShell({ active, title, intro, action, children }: { active: string; title: string; intro?: string; action?: React.ReactNode; children: React.ReactNode }) {
  const { language, setLanguage, t } = useI18n();
  const { profile } = useStudyData();
  const [mobile, setMobile] = useState(false);
  return <div className="min-h-screen bg-[#f6f8fb] text-[#172137]">
    <aside className="group/sidebar fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col overflow-hidden border-r border-[#e4e8ef] bg-white shadow-[6px_0_24px_rgba(23,33,55,.03)] transition-[width] duration-200 hover:w-[246px] lg:flex">
      <Link href="/" className="flex h-[76px] shrink-0 items-center gap-3 border-b border-[#edf0f5] px-5"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#2859d8] text-white"><GraduationCap className="size-5" /></span><div className="whitespace-nowrap opacity-0 transition-opacity group-hover/sidebar:opacity-100"><p className="text-[17px] font-bold tracking-[-.03em]">Study OS</p><p className="text-xs font-medium text-[#8a94a7]">{t("workspace")}</p></div></Link>
      <div className="flex-1 overflow-y-auto overflow-x-hidden"><Nav active={active} compact /></div>
      <div className="border-t border-[#edf0f5] p-3"><div className="flex h-12 items-center gap-3 overflow-hidden rounded-xl bg-[#f6f8fb] px-2"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#dfe7fb] text-sm font-bold text-[#2859d8]">{profile.name?.trim().charAt(0).toUpperCase() || "Z"}</span><div className="whitespace-nowrap opacity-0 transition-opacity group-hover/sidebar:opacity-100"><p className="text-sm font-bold">{profile.name || "ZIYADA"}</p>{profile.graduationYear ? <p className="text-xs text-[#8a94a7]">{language === "ru" ? "Выпуск" : "Class of"} {profile.graduationYear}</p> : null}</div></div></div>
    </aside>
    <div className="lg:pl-[76px]">
      <header className="sticky top-0 z-30 flex h-[76px] items-center border-b border-[#e4e8ef] bg-white/92 px-4 backdrop-blur-xl sm:px-8 lg:px-10"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobile(true)} aria-label="Menu"><Menu className="size-5" /></Button><div className="ml-auto flex items-center gap-3"><div className="flex rounded-xl border border-[#e1e5ed] bg-[#f8f9fb] p-1"><button onClick={() => setLanguage("en")} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${language === "en" ? "bg-white text-[#2859d8] shadow-sm" : "text-[#7b8698]"}`}>EN</button><button onClick={() => setLanguage("ru")} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${language === "ru" ? "bg-white text-[#2859d8] shadow-sm" : "text-[#7b8698]"}`}>RU</button></div>{action}</div></header>
      <main className="mx-auto max-w-[1480px] p-4 sm:p-8 lg:p-10">{title && <div className="mb-8"><p className="mb-2 text-sm font-bold uppercase tracking-[.12em] text-[#2859d8]">Study OS / {title}</p><h1 className="text-3xl font-bold tracking-[-.04em] sm:text-[38px]">{title}</h1>{intro && <p className="mt-3 max-w-3xl text-base leading-7 text-[#707b8e]">{intro}</p>}</div>}{children}</main>
    </div>
    <Sheet open={mobile} onOpenChange={setMobile}><SheetContent side="left" className="w-[290px] bg-white p-0"><SheetHeader className="border-b p-5"><SheetTitle className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#2859d8] text-white"><GraduationCap className="size-5" /></span>Study OS</SheetTitle></SheetHeader><Nav active={active} close={() => setMobile(false)} /></SheetContent></Sheet>
  </div>;
}
