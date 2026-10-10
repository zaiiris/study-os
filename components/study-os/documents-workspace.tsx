"use client";
import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from './app-shell';
import { useI18n } from './i18n';
import { useAdmissions } from '@/hooks/use-admissions';
import { useCollection } from '@/hooks/use-collection';
import type { Document } from '@/lib/models';
import { rowsFor,rowName,recommendationRows } from '@/lib/admissions-data';
import { AdmissionsNav,Choice,Fact,LocalNotes,PreparationItem,StatusChoice } from './admissions-shared';
import { SearchField } from './controls';
import type { AuditRow,ItemProgress,OfficialUniversity } from '@/lib/admissions-types';
import { Button } from '@/components/ui/button';
import { admissionsText } from '@/lib/admissions-localization';
const EMPTY_DOCUMENTS:Document[]=[];

function documentCategory(name:string) {
  if(/recommend|academic reference|рекомендац/i.test(name))return 'Recommendations';
  if(/essay|response|statement|эссе/i.test(name))return 'Essays / application';
  if(/apostill|legaliz|апостил/i.test(name))return 'Apostille / legalization';
  if(/final|diploma|certificate\/transcript|диплом/i.test(name))return 'Final school qualification';
  if(/transcript|grades|school record|табель/i.test(name))return 'Transcripts';
  if(/predict|current|expected graduation|прогноз/i.test(name))return 'Predicted / expected graduation';
  if(/profile|профиль/i.test(name))return 'School profile';
  if(/parent|family|birth|родител|свидетель/i.test(name))return 'Family / parents';
  if(/passport|national ID|паспорт/i.test(name))return 'Passport / identity';
  if(/English|IELTS|TOEFL|англий/i.test(name))return 'English evidence';
  if(/test|standard|SAT|ACT|academic/i.test(name))return 'Academic tests';
  if(/bank|financial|финанс|банк/i.test(name))return 'Financial evidence';
  if(/awards|honors|награ/i.test(name))return 'Awards';
  return 'Other materials';
}
export function DocumentsWorkspace() {
  const {language}=useI18n();const ru=language==='ru';const {universities,progress,ready,error,update}=useAdmissions();
  const {records:personalDocuments,upsert:saveDocument}=useCollection<Document>('documents',EMPTY_DOCUMENTS);
  const [query,setQuery]=useState('');const [university,setUniversity]=useState('all');const [status,setStatus]=useState('all');const [category,setCategory]=useState('all');const [mode,setMode]=useState('documents');
  const entries:{university:OfficialUniversity;row:AuditRow;category:string}[]=universities.flatMap(u=>{
    const docs=rowsFor(u,'documents');
    const essays=u.blocks.filter(b=>b.tab==='essays').flatMap(b=>b.tables.filter(t=>t.columns.some(c=>/official.*(task|prompt)/i.test(c))).flatMap(t=>t.rows));
    const selected=mode==='essays'?essays:mode==='recommendations'?recommendationRows(u):docs;
    return selected.map(row=>({university:u,row,category:documentCategory(rowName(row))}));
  });
  const visible=entries.filter(e=>(university==='all'||e.university.id===university)&&(status==='all'||(progress[e.university.id]?.items[e.row.id]?.status??'not-started')===status)&&(category==='all'||e.category===category)&&(!query||`${e.university.name} ${JSON.stringify(e.row.fields)} ${Object.values(e.row.fields).map(v=>admissionsText(v,language)).join(' ')}`.toLowerCase().includes(query.toLowerCase())));
  const groups=[...new Set(visible.map(e=>e.category))].sort();const all={value:'all',label:ru?'Все':'All'};
  const readyCount=entries.filter(e=>['ready','final','submitted','verified'].includes(progress[e.university.id]?.items[e.row.id]?.status??'')).length;
  return <AppShell active="documents" title={ru?'Документы и подготовка':'Documents & preparation'} intro={ru?'Одна сводка требований из университетов. Каждая отметка связана с исходной карточкой, без копий данных.':'One view derived from university requirements. Progress is linked to its original item, never duplicated.'}><AdmissionsNav active="/documents"/><div className="mb-5 flex flex-wrap gap-2">{[['documents',ru?'Документы':'Documents'],['essays',ru?'Эссе':'Essays'],['recommendations',ru?'Рекомендации':'Recommendations']].map(([key,label])=><Button key={key} variant={mode===key?'default':'outline'} onClick={()=>{setMode(key);setCategory('all');setStatus('all');}}>{label}</Button>)}</div><div className="mb-5 rounded-2xl border bg-white p-5"><div className="mb-4 flex justify-between text-sm"><span>{ready?readyCount:'…'} / {entries.length} {ru?'готово':'ready'}</span><span>{visible.length} {ru?'в выборке':'in view'}</span></div><SearchField value={query} onChange={setQuery} placeholder={ru?'Документ, требование, университет…':'Document, requirement, university…'}/><div className="mt-4 grid gap-3 sm:grid-cols-3"><Choice value={university} onChange={setUniversity} options={[all,...universities.map(u=>({value:u.id,label:u.name}))]} label={ru?'Университет':'University'}/><Choice value={category} onChange={setCategory} options={[all,...[...new Set(entries.map(e=>e.category))].sort().map(s=>({value:s,label:s}))]} label={ru?'Категория':'Category'}/><Choice value={status} onChange={setStatus} options={[all,...(mode==='essays'?['not-started','idea','draft','editing','final','submitted']:['not-started','requested','ready','submitted','verified']).map(s=>({value:s,label:s}))]} label={ru?'Готовность':'Readiness'}/></div></div>{error&&<p role="alert" className="text-red-600">{error}</p>}
    <div className="space-y-4">{groups.map(group=><details key={group} className="rounded-2xl border bg-white p-5" open={groups.length===1}><summary className="cursor-pointer font-semibold"><Fact text={group}/> <span className="ml-2 text-sm font-normal text-slate-400">{visible.filter(e=>e.category===group).length} · {ru?'связанные требования':'linked requirements'}</span></summary><div className="mt-5 space-y-5">{visible.filter(e=>e.category===group).map(e=><div key={e.row.id}><Link href={`/university/${e.university.id}`} className="mb-2 inline-block text-sm font-semibold text-blue-700">{e.university.name} ↗</Link><PreparationItem row={e.row} essay={mode==='essays'} recommendation={mode==='recommendations'} progress={progress[e.university.id]?.items[e.row.id]} onSave={(change:Partial<ItemProgress>)=>update(e.university.id,p=>({...p,items:{...p.items,[e.row.id]:{...(p.items[e.row.id]??{status:'not-started',notes:''}),...change}}}))}/></div>)}</div></details>)}</div>
    {!visible.length&&<p className="rounded-xl border border-dashed p-10 text-center text-slate-500">{ru?'Нет совпадений. Неопубликованные требования не превращаем в выдуманный checklist.':'No matches. Unpublished requirements are not invented.'}</p>}
    {personalDocuments.length>0&&<details className="mt-8 rounded-2xl border bg-white p-5"><summary className="cursor-pointer font-semibold">{ru?'Мои ранее добавленные документы':'My previously added documents'} · {personalDocuments.length}</summary><div className="mt-4 grid gap-4 md:grid-cols-2">{personalDocuments.map(doc=><div key={doc.id} className="rounded-xl border p-4"><h3 className="font-semibold">{doc.name}</h3><p className="mb-3 mt-2 text-xs text-slate-500">{doc.type} · {doc.filePath??''}</p><StatusChoice value={doc.status||'not-started'} onChange={status=>void saveDocument({...doc,status})}/><div className="mt-4"><LocalNotes key={doc.id+doc.notes} value={doc.notes??''} label={ru?'Заметка':'Note'} onSave={async notes=>{await saveDocument({...doc,notes});return true;}}/></div></div>)}</div></details>}
    <section className="mt-8 rounded-xl bg-amber-50 p-5 text-sm leading-6 text-amber-900"><Fact text={ru?'Для Batch 3 сохранены исходные требования в рабочих пространствах университетов. Их подробные checklist будут структурированы при следующем аудите; неизвестное не отмечается как «не требуется».':'Batch 3 original requirements remain in university workspaces. Detailed checklists await their next audit; unknown never means not required.'}/></section>
  </AppShell>;
}
