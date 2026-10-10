"use client";
import { useState } from 'react';
import {UniversityCard} from './university-card';
import {cardDeadlines,applicationStatusLabel} from '@/lib/admissions-card-facts';
import { AppShell } from './app-shell';
import { useI18n } from './i18n';
import { useAdmissions } from '@/hooks/use-admissions';
import { daysUntil, deadlineInstant, progressSummary } from '@/lib/admissions-data';
import { SearchField } from './controls';
import { AdmissionsNav, APPLICATION_STATUSES, Choice } from './admissions-shared';

export function UniversitiesWorkspace() {
  const {language}=useI18n(); const ru=language==='ru'; const {universities,progress,ready,error}=useAdmissions();
  const [query,setQuery]=useState(''); const [country,setCountry]=useState('all'); const [program,setProgram]=useState('all'); const [status,setStatus]=useState('all'); const [evidence,setEvidence]=useState('all'); const [funding,setFunding]=useState('all'); const [deadline,setDeadline]=useState('all'); const [sort,setSort]=useState('deadline');
  const visible=universities.filter(u=>{
    const next=cardDeadlines(u,progress)[0]; const days=next?daysUntil(next):null;
    const haystack=JSON.stringify({name:u.name,programs:u.programs,funding:u.blocks.filter(b=>b.tab==='funding'),localized:u.localizedText}).toLowerCase();
    return (!query||haystack.includes(query.toLowerCase()))&&(country==='all'||u.country===country)&&(program==='all'||u.programs.join(' ').toLowerCase().includes(program))&&(status==='all'||(progress[u.id]?.applicationStatus??'Researching')===status)&&(evidence==='all'||(evidence==='awaiting'?u.awaitingAudit:u.evidence===evidence))&&(funding==='all'||u.fundingTags.includes(funding))&&(deadline==='all'||(deadline==='tba'?days===null:days!==null&&(deadline==='later'?days>60:days<=Number(deadline))));
  }).sort((a,b)=>{
    if(sort==='name')return a.name.localeCompare(b.name);
    if(sort==='country')return a.country.localeCompare(b.country);
    if(sort==='progress')return progressSummary(b,progress[b.id]).percent-progressSummary(a,progress[a.id]).percent;
    if(sort==='funding')return Number(b.fundingTags.includes('full-coa'))-Number(a.fundingTags.includes('full-coa'));
    const ad=cardDeadlines(a,progress)[0],bd=cardDeadlines(b,progress)[0];
    return (ad?deadlineInstant(ad)??Infinity:Infinity)-(bd?deadlineInstant(bd)??Infinity:Infinity);
  });
  const all={value:'all',label:ru?'Все':'All'};
  const filters=[
    {label:ru?'Страна':'Country',value:country,set:setCountry,options:[all,...[...new Set(universities.map(u=>u.country))].map(s=>({value:s,label:s}))]},
    {label:ru?'Направление':'Programme',value:program,set:setProgram,options:[all,...[['computer science','CS'],['ai','AI'],['software','Software Engineering'],['data','Data Science'],['computer engineering','Computer Engineering']].map(([value,label])=>({value,label}))]},
    {label:ru?'Моя заявка':'My application',value:status,set:setStatus,options:[all,...APPLICATION_STATUSES.map(s=>({value:s,label:applicationStatusLabel(s,language)}))]},
    {label:ru?'Официальная информация':'Official information',value:evidence,set:setEvidence,options:[all,...['confirmed','partial','tba','previous-cycle','awaiting'].map(s=>({value:s,label:s==='awaiting'?(ru?'Ожидается повторный аудит за октябрь':'Awaiting October re-audit'):s}))]},
    {label:ru?'Финансирование':'Funding',value:funding,set:setFunding,options:[all,...['full-coa','full-tuition','partial','need-based','automatic','separate-application'].map(s=>({value:s,label:s==='partial'?(ru?'Частичное покрытие':'Partial funding'):s}))]},
    {label:ru?'Ближайший срок':'Next deadline',value:deadline,set:setDeadline,options:[all,...[['7',ru?'≤ 7 дней':'≤ 7 days'],['30',ru?'≤ 30 дней':'≤ 30 days'],['60',ru?'≤ 60 дней':'≤ 60 days'],['later',ru?'> 60 дней':'> 60 days'],['tba','TBA']].map(([value,label])=>({value,label}))]},
    {label:ru?'Сортировка':'Sort',value:sort,set:setSort,options:[['deadline',ru?'Ближайший дедлайн':'Next deadline'],['name',ru?'Название':'Name'],['country',ru?'Страна':'Country'],['funding',ru?'Full COA, затем tuition':'Full COA, then tuition'],['progress',ru?'Мой прогресс':'My progress']].map(([value,label])=>({value,label}))}
  ];
  return <AppShell active="universities" title={ru?'Университеты':'Universities'} intro={ru?'15 личных рабочих пространств. Официальные факты отдельно от вашей подготовки.':'15 personal workspaces. Official facts separate from your preparation.'}><AdmissionsNav active="/universities"/>
    <section className="mb-6 rounded-2xl border bg-white p-5"><SearchField value={query} onChange={setQuery} placeholder={ru?'Университет, программа или стипендия…':'University, programme or scholarship…'}/><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{filters.map(f=><label key={f.label} className="space-y-1 text-xs font-medium text-slate-500"><span>{f.label}</span><Choice value={f.value} onChange={f.set} options={f.options} label={f.label}/></label>)}</div></section>
    <div className="mb-4 flex items-center justify-between gap-2 text-sm text-slate-500"><span>{visible.length} / 15</span><span>{ru?'Данные проверены: 4 октября 2026':'Data checked: 4 Oct 2026'}</span></div>{error&&<p role="alert" className="mb-4 text-red-600">{error}</p>}
    <div className="grid items-start gap-5 md:grid-cols-2 2xl:grid-cols-3">{visible.map(u=><UniversityCard key={u.id} university={u} progress={progress} ready={ready}/>)}</div>{visible.length===0&&<div className="rounded-2xl border border-dashed p-12 text-center text-slate-500">{ru?'Нет совпадений. Измените фильтры.':'No matches. Adjust filters.'}</div>}
  </AppShell>;
}
