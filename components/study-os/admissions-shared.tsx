"use client";
import Link from 'next/link';
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Table,TableBody,TableCell,TableHead,TableHeader,TableRow } from '@/components/ui/table';
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from '@/components/ui/select';
import { useI18n } from './i18n';
import { rowName } from '@/lib/admissions-data';
import { admissionsText } from '@/lib/admissions-localization';
import type { AdmissionsProgress, AuditBlock, AuditRow, EvidenceStatus, ItemProgress, PreparationStatus } from '@/lib/admissions-types';

export const APPLICATION_STATUSES=['Researching','Preparing','ReadyToSubmit','Submitted','Interview','Accepted','Rejected','Waitlisted'];
const STATUS_RU:Record<string,string>={Researching:'Не начато',Preparing:'Готовлю',ReadyToSubmit:'Готово к подаче',Submitted:'Подано',Interview:'Интервью',Accepted:'Поступила',Rejected:'Отказ',Waitlisted:'Лист ожидания','not-started':'Не начато',requested:'Запрошено',ready:'Готово',submitted:'Отправлено',verified:'Проверено',idea:'Идея',draft:'Черновик',editing:'Редактирую',final:'Финальная версия'};
export function Choice({value,onChange,options,label,className}:{value:string;onChange:(value:string)=>void;options:{value:string;label:string}[];label:string;className?:string}) {
  const {language}=useI18n();
  return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className={className??'w-full min-w-[150px] bg-white'}><SelectValue /></SelectTrigger><SelectContent>{options.map(o=><SelectItem key={o.value} value={o.value}>{admissionsText(o.label,language)}</SelectItem>)}</SelectContent></Select>;
}
export function StatusChoice({value,onChange,essay=false,application=false}:{value:string;onChange:(value:string)=>void;essay?:boolean;application?:boolean}) {
  const {language}=useI18n(); const statuses=application?APPLICATION_STATUSES:essay?['not-started','idea','draft','editing','final','submitted']:['not-started','requested','ready','submitted','verified'];
  return <Choice value={value} onChange={onChange} label={language==='ru'?'Личный статус':'Personal status'} options={[...new Set([...statuses,value])].map(s=>({value:s,label:language==='ru'?STATUS_RU[s]??s:s.replaceAll('-',' ')}))}/>;
}
export function EvidenceBadge({status,awaiting=false}:{status:EvidenceStatus;awaiting?:boolean}) {
  const {language}=useI18n(); const ru=language==='ru'; const labels={confirmed:ru?'Подтверждено для Fall 2027':'Confirmed for Fall 2027',partial:ru?'Частично подтверждено':'Partially confirmed',tba:ru?'Пока не опубликовано · TBA':'Not yet published · TBA','previous-cycle':ru?'Данные прошлого цикла':'Previous cycle reference'};
  return <Badge variant="outline" className={`whitespace-normal ${awaiting||status!=='confirmed'?'border-amber-200 bg-amber-50 text-amber-800':'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{awaiting?(ru?'Ожидается повторный аудит за октябрь':'Awaiting October re-audit'):labels[status]}</Badge>;
}
export function AdmissionsNav({active}:{active:string}) {
  const {language}=useI18n(); const ru=language==='ru';
  return <nav aria-label={ru?'Разделы поступления':'Admissions sections'} className="mb-6 flex gap-2 overflow-x-auto pb-1">{[['/applications',ru?'Обзор':'Overview'],['/universities',ru?'Университеты':'Universities'],['/deadlines',ru?'Дедлайны':'Deadlines'],['/documents',ru?'Документы и подготовка':'Documents & preparation']].map(([href,label])=><Button key={href} asChild variant={active===href?'default':'outline'} className="shrink-0 rounded-xl"><Link href={href}>{label}</Link></Button>)}</nav>;
}
// Inline formatting within structured fields, not a Markdown page viewer.
export function Fact({text:source,original=false,links=true}:{text:string;original?:boolean;links?:boolean}) {
  const {language}=useI18n();const text=original?source:admissionsText(source,language);
  return <>{text.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g).map((part,i)=>{const link=part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/); if(link)return links?<a key={i} href={link[2]} target="_blank" rel="noreferrer" className="text-[#2859d8] underline decoration-blue-200 underline-offset-4">{link[1]}<ExternalLink className="ml-1 inline size-3"/></a>:<span key={i}>{link[1]}</span>; if(part.startsWith('**'))return <strong key={i}>{part.slice(2,-2)}</strong>; if(part.startsWith('`'))return <span key={i} className="rounded bg-slate-100 px-1">{part.slice(1,-1)}</span>; return part;})}</>;
}
export function FactsTable({columns,rows}:{columns:string[];rows:AuditRow[]}) {
  const {language}=useI18n();
  return <Table><TableHeader><TableRow>{columns.map(c=><TableHead key={c} className="min-w-[145px] whitespace-normal"><Fact text={c}/></TableHead>)}</TableRow></TableHeader><TableBody>{rows.map(row=><TableRow key={row.id}>{columns.map((c,i)=><TableCell key={c} className={`min-w-[145px] max-w-md whitespace-normal align-top leading-6 ${i===0?'font-medium':'text-slate-600'}`}><Fact text={row.fields[c]||'TBA'}/>{row.prompt?.sourceField===c&&<details className="mt-2"><summary className="cursor-pointer text-xs text-blue-700">{language==='ru'?'Исходная формулировка на английском':'English source wording'}</summary><p className="mt-2"><Fact original text={row.prompt.officialPrompt??row.prompt.sourceEnglish}/></p>{row.prompt.wording!=='exact'&&<p className="mt-2 text-xs text-amber-700">{language==='ru'?'Описание из аудита, не дословный официальный вопрос.':'Audit description, not an exact official question.'}</p>}</details>}</TableCell>)}</TableRow>)}</TableBody></Table>;
}
export function AuditSection({block,children}:{block:AuditBlock;children?:React.ReactNode}) {
  const {language}=useI18n();
  return <Card className="min-w-0 rounded-2xl border-slate-200 shadow-none"><CardHeader><div className="flex items-start justify-between gap-4"><CardTitle className="text-lg leading-7"><Fact text={block.title.replace(/^[A-Z]\. /,'')}/></CardTitle>{block.analysis&&<Badge className="shrink-0 bg-violet-50 text-violet-700">{language==='ru'?'Анализ':'Analysis'}</Badge>}</div></CardHeader><CardContent className="space-y-4 text-sm leading-7">{block.paragraphs.map((p,i)=><p key={i} className="whitespace-pre-line text-slate-600"><Fact text={p}/></p>)}{block.lists.length>0&&<ul className="list-disc space-y-2 pl-5 text-slate-600">{block.lists.map((p,i)=><li key={i}><Fact text={p}/></li>)}</ul>}{block.tables.map((table,i)=><FactsTable key={i} {...table}/>)}{children}{block.analysis&&<p className="text-xs text-violet-700">{language==='ru'?'Оценка из аудита, не официальное требование или статистика университета.':'Audit analysis, not an official requirement or university statistic.'}</p>}</CardContent></Card>;
}
export function LocalNotes({value,onSave,label}:{value:string;onSave:(value:string)=>Promise<boolean>;label:string}) {
  const [draft,setDraft]=useState(value); const [message,setMessage]=useState(''); const {language}=useI18n();
  return <div className="space-y-2"><label className="text-sm font-medium">{label}<Textarea value={draft} onChange={e=>{setDraft(e.target.value);setMessage('');}} className="mt-2 bg-white" rows={3}/></label><div className="flex items-center gap-3"><Button variant="outline" size="sm" onClick={async()=>setMessage(await onSave(draft)?(language==='ru'?'Сохранено локально':'Saved locally'):(language==='ru'?'Не удалось сохранить':'Save failed'))}>{language==='ru'?'Сохранить заметку':'Save note'}</Button><span role="status" className="text-xs text-slate-500">{message}</span></div></div>;
}
export function PreparationItem({row,progress,onSave,essay=false,recommendation=false}:{row:AuditRow;progress?:ItemProgress;onSave:(change:Partial<ItemProgress>)=>Promise<boolean>;essay?:boolean;recommendation?:boolean}) {
  const {language}=useI18n(); const ru=language==='ru';
  const promptSource=Object.values(row.fields)[1]??'TBA';
  const prompt=row.prompt;
  return <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex flex-col justify-between gap-4 sm:flex-row"><h3 className="max-w-2xl font-semibold"><Fact text={rowName(row)}/></h3><div className="w-full shrink-0 sm:w-48"><StatusChoice value={progress?.status??'not-started'} onChange={status=>void onSave({status:status as PreparationStatus})} essay={essay}/></div></div>
    {essay&&<section className="mt-4 space-y-2 text-sm leading-6"><h4 className="font-medium">{ru?'Вопрос / задание эссе':'Essay question / task'}</h4><p><Fact original text={ru?(prompt?.promptRu??admissionsText(promptSource,'ru')):(prompt?.officialPrompt??prompt?.sourceEnglish??admissionsText(promptSource,'en'))}/></p>
      <p className="text-xs text-amber-700">{prompt?.wording==='exact'?(ru?'Дословное опубликованное задание; статус цикла указан в аудите.':'Exact published task; cycle status is specified in the audit.'):(ru?'Пересказ из аудита или неопубликованное поле — не дословный официальный вопрос.':'Audit paraphrase or unpublished field — not an exact official prompt.')}</p>
      <details><summary className="cursor-pointer text-blue-700">{ru?(prompt?.officialPrompt?'Оригинал на английском':'Исходное описание задания на английском'):'English source wording'}</summary><p className="mt-2"><Fact original text={prompt?.officialPrompt??prompt?.sourceEnglish??admissionsText(promptSource,'en')}/></p></details>
    </section>}
    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">{Object.entries(row.fields).slice(essay?2:1).map(([key,value])=><div key={key}><dt className="text-xs font-medium text-slate-400"><Fact text={key}/></dt><dd className="mt-1 leading-6 text-slate-600"><Fact text={value||'TBA'}/>{/written fields|questions|вопрос/i.test(key)&&<details className="mt-2"><summary className="cursor-pointer text-xs text-blue-700">{ru?'Исходное описание на английском':'English source description'}</summary><Fact original text={admissionsText(value,'en')}/></details>}</dd></div>)}</dl>
    <details className="mt-4 border-t pt-3"><summary className="cursor-pointer text-sm font-medium text-blue-700">{ru?'Мои заметки и план':'My notes & planning'}</summary><div className="mt-4 grid gap-4">{recommendation&&<label className="text-sm">{ru?'Учитель / рекомендатель':'Teacher / recommender'}<Input defaultValue={progress?.teacher??''} onBlur={e=>void onSave({teacher:e.target.value})}/></label>}<label className="text-sm">{ru?'Личная целевая дата (не официальный дедлайн)':'Personal target date (not official deadline)'}<Input type="date" defaultValue={progress?.targetDate??''} onBlur={e=>void onSave({targetDate:e.target.value})}/></label><LocalNotes key={row.id+progress?.notes} value={progress?.notes??''} onSave={notes=>onSave({notes})} label={ru?'Личная заметка':'Personal note'}/></div></details>
  </div>;
}
export function AfterChecklist({blocks,progress,onSave}:{blocks:AuditBlock[];progress:AdmissionsProgress;onSave:(key:string,done:boolean)=>Promise<boolean>}) {
  const {language}=useI18n(); const ru=language==='ru'; const entries=blocks.flatMap(b=>[...b.lists.map((text,i)=>({id:`${b.id}-step-${i}`,text})),...b.tables.flatMap(t=>t.rows.map(row=>({id:row.id,text:Object.entries(row.fields).map(([key,value])=>`${admissionsText(key,language)}: ${admissionsText(value,language)}`).join(' · ')})))]);
  const done=entries.filter(e=>progress.items[e.id]?.status==='verified').length;
  return <Card className="rounded-2xl shadow-none"><CardHeader><CardTitle>{ru?'После зачисления':'After admission'} · {done}/{entries.length}</CardTitle></CardHeader><CardContent className="space-y-4">{entries.map(entry=><label key={entry.id} className="flex items-start gap-3 rounded-xl border p-4 text-sm leading-6"><input type="checkbox" className="mt-1 size-4 shrink-0 accent-blue-600" checked={progress.items[entry.id]?.status==='verified'} onChange={e=>void onSave(entry.id,e.target.checked)}/><span><Fact text={entry.text}/></span></label>)}{!entries.length&&<p className="text-slate-500">{ru?'Точный checklist Fall 2027 пока не опубликован.':'Exact Fall 2027 checklist not published.'}</p>}</CardContent></Card>;
}
