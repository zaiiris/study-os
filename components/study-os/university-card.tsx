"use client";
import Link from 'next/link';
import {ArrowUpRight,CalendarDays,MapPin} from 'lucide-react';
import type {AdmissionsProgress,OfficialUniversity} from '@/lib/admissions-types';
import {UNIVERSITY_CARD_FACTS,applicationStatusLabel,cardDeadlines} from '@/lib/admissions-card-facts';
import {approximateKzt,formatNativeFee,EXCHANGE_RATES} from '@/lib/admissions-currency';
import {formatOfficialDeadline,formatDeadlineRelative} from '@/lib/admissions-dates';
import {admissionsText} from '@/lib/admissions-localization';
import {Badge} from '@/components/ui/badge';
import {EvidenceBadge} from './admissions-shared';
import {useI18n} from './i18n';

export function UniversityCard({university:u,progress,ready}:{university:OfficialUniversity;progress:Record<string,AdmissionsProgress>;ready:boolean}) {
 const {language}=useI18n(),ru=language==='ru',facts=UNIVERSITY_CARD_FACTS[u.id],deadlines=cardDeadlines(u,progress),kzt=approximateKzt(facts.fee,language);
 return <article className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300">
  <h2 className="text-xl font-bold"><Link href={`/university/${u.id}`} className="hover:text-blue-700">{u.name}</Link></h2>
  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin className="size-3 shrink-0"/>{admissionsText(u.city,language)} · {admissionsText(u.country,language)}</p>
  <div className="mt-3 flex flex-wrap gap-2"><EvidenceBadge status={u.evidence}/><Badge variant="secondary">{ready?applicationStatusLabel(progress[u.id]?.applicationStatus??'Researching',language):(ru?'Загрузка статуса…':'Loading status…')}</Badge></div>
  <div className="mt-4"><p className="text-xs text-slate-500">{ru?'Программа':'Programme'}</p><p className="mt-1 text-sm font-medium leading-5">{facts.programme}</p></div>
  <div className="my-4 rounded-xl bg-slate-50 p-3"><p className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500"><CalendarDays className="size-4"/>{ru?'Ближайшее':'Next deadline'}</p>
   {deadlines.length?deadlines.map(d=><div key={d.id} className="mt-2 first:mt-0"><p className="text-sm font-medium">{admissionsText(d.title,language)}{d.kind==='target'&&<span className="ml-1 text-xs text-violet-700">({ru?'моя цель':'my target'})</span>}</p><p className="mt-1 text-sm">{formatOfficialDeadline(d,language)}</p><p className="text-xs text-blue-700">{formatDeadlineRelative(d,language)}</p></div>):<><p className="text-sm">{ru?'Нет опубликованных ближайших сроков':'No published upcoming deadlines'}</p><p className="mt-1 text-xs text-slate-500">{ru?'TBA остаётся TBA; прошлый цикл не подставляется':'TBA stays TBA; no previous-cycle dates substituted'}</p></>}
  </div>
  <dl className="grid gap-3 text-sm"><div><dt className="text-xs text-slate-500">{ru?'Стоимость подачи':'Application fee'}</dt><dd className="mt-1 font-medium">{formatNativeFee(facts.fee,language)}</dd>{facts.fee.note&&<dd className="mt-1 text-xs text-slate-500">{facts.fee.note[language]}</dd>}{kzt&&<dd className="mt-1 text-xs text-slate-500"><span title={EXCHANGE_RATES.source??undefined}>{kzt}</span></dd>}</div><div><dt className="text-xs text-slate-500">{ru?'Подача':'Application platform'}</dt><dd className="mt-1 break-words">{facts.platform}</dd></div></dl>
  <div className="mb-4 mt-4 flex flex-wrap gap-1.5">{facts.requirements[language].slice(0,3).map(text=><Badge key={text} variant="outline" className="whitespace-normal font-normal">{text}</Badge>)}</div>
  <Link href={`/university/${u.id}`} className="mt-auto flex items-center justify-between border-t pt-3 text-sm font-medium text-blue-700">{ru?'Открыть университет':'View university'}<ArrowUpRight className="size-4"/></Link>
 </article>;
}
