import kaist from '@/data/universities/kaist.json';
import postech from '@/data/universities/postech.json';
import kfupm from '@/data/universities/kfupm.json';
import hkust from '@/data/universities/hkust.json';
import dgist from '@/data/universities/dgist.json';
import unist from '@/data/universities/unist.json';
import mbzuai from '@/data/universities/mbzuai.json';
import cityuhk from '@/data/universities/cityuhk.json';
import qatar from '@/data/universities/qatar.json';
import udst from '@/data/universities/udst.json';
import aus from '@/data/universities/aus.json';
import gist from '@/data/universities/gist.json';
import cmuq from '@/data/universities/cmuq.json';
import nyuad from '@/data/universities/nyuad.json';
import nu from '@/data/universities/nu.json';
import type { AdmissionsProgress, AuditRow, DeadlineEntry, OfficialDeadline, OfficialUniversity } from './admissions-types';

export const UNIVERSITIES = [kaist,postech,kfupm,hkust,dgist,unist,mbzuai,cityuhk,qatar,udst,aus,gist,cmuq,nyuad,nu] as OfficialUniversity[];
export const emptyProgress = (id: string): AdmissionsProgress => ({id,version:1,applicationStatus:'Researching',items:{},completedDeadlines:[],targets:{},notes:'',customDeadlines:[],updatedAt:new Date().toISOString()});
export function rowsFor(university: OfficialUniversity, tab: string): AuditRow[] {
  return university.blocks.filter(b=>b.tab===tab).flatMap(b=>b.tables.flatMap(t=>t.rows));
}
export const rowName = (row: AuditRow) => Object.values(row.fields)[0] ?? 'TBA';
export function recommendationRows(university: OfficialUniversity) {
  return rowsFor(university,'documents').filter(row=>/recommendation|teacher rec|academic reference|рекомендац/i.test(rowName(row))&&!/^—|not requested|not listed|none|не требуется/i.test((Object.values(row.fields)[1]??'').replaceAll('**','').trim()));
}
export function progressSummary(university: OfficialUniversity, progress?: AdmissionsProgress) {
  const required=rowsFor(university,'documents').filter(r => /^(\*\*)?R\b/.test(Object.values(r.fields)[1]??''));
  const essays=university.blocks.filter(b=>b.tab==='essays').flatMap(b=>b.tables.filter(t=>t.columns.some(c=>/official.*(task|prompt)/i.test(c))).flatMap(t=>t.rows));
  const items=[...required,...essays];
  const done=items.filter(r=>['ready','submitted','verified','final'].includes(progress?.items[r.id]?.status??'')).length;
  return {total:items.length,done,percent:items.length?Math.round(done/items.length*100):0,missing:required.filter(r=>!['ready','submitted','verified'].includes(progress?.items[r.id]?.status??'')),essays:essays.filter(r=>!['final','submitted'].includes(progress?.items[r.id]?.status??''))};
}
// A date-only deadline is a calendar date, NOT an invented 23:59 timestamp.
export function deadlineInstant(deadline: OfficialDeadline, useEnd=true): number | null {
  const date=useEnd?(deadline.endDate??deadline.date):deadline.date;
  if(!date) return null;
  const offset=deadline.timezone==='Asia/Seoul'?'+09:00':deadline.timezone==='Asia/Dubai'?'+04:00':deadline.timezone==='Asia/Hong_Kong'?'+08:00':deadline.timezone==='Asia/Qyzylorda'?'+05:00':deadline.timezone==='Asia/Qatar'||deadline.timezone==='Asia/Riyadh'?'+03:00':deadline.timezone==='EST'?'-05:00':'Z';
  return Date.parse(`${date}T${deadline.time??'00:00'}:00${offset}`);
}
export function calendarDate(now: Date, timezone: string|null) {
  return new Intl.DateTimeFormat('en-CA',{timeZone:timezone??'Asia/Qyzylorda',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
export function isUpcoming(deadline: OfficialDeadline, now=new Date()) {
  const date=deadline.endDate??deadline.date;
  if(!date) return false;
  return deadline.time ? (deadlineInstant(deadline)??0)>=now.getTime() : date>=calendarDate(now,deadline.timezone);
}
export function daysUntil(deadline: OfficialDeadline, now=new Date()) {
  const date=deadline.endDate??deadline.date;
  if(!date) return null;
  return Math.ceil((Date.parse(`${date}T00:00:00Z`)-Date.parse(`${calendarDate(now,deadline.timezone)}T00:00:00Z`))/86400000);
}
export function allDeadlines(progress: Record<string,AdmissionsProgress>): DeadlineEntry[] {
  return UNIVERSITIES.flatMap(university=>{
    const p=progress[university.id];
    return [...university.deadlines,...(p?.customDeadlines??[])].flatMap(deadline=>{
      const completed=p?.completedDeadlines.includes(deadline.id)??false;
      const official: DeadlineEntry={...deadline,university,kind:p?.customDeadlines.some(d=>d.id===deadline.id)?'target':'official',completed};
      const target=p?.targets[deadline.id];
      return target?[official,{...official,id:`${deadline.id}:target`,title:deadline.title,date:target,endDate:null,time:null,timezone:'Asia/Qyzylorda',precision:'exact' as const,display:target,kind:'target' as const}]:[official];
    });
  }).sort((a,b)=>(deadlineInstant(a)??Infinity)-(deadlineInstant(b)??Infinity)||a.university.name.localeCompare(b.university.name));
}
export function nextDeadline(university: OfficialUniversity, progress: Record<string,AdmissionsProgress>, now=new Date()) {
  return allDeadlines(progress).find(d=>d.universityId===university.id&&d.kind==='official'&&d.evidence!=='previous-cycle'&&!d.completed&&isUpcoming(d,now));
}
