import { daysUntil, isUpcoming } from './admissions-data';
import type { OfficialDeadline } from './admissions-types';
export type AdmissionsLocale = 'ru' | 'en';
const MONTHS = {
  ru: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
};
const MONTH_NAMES_RU = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
export function formatAdmissionsDate(value: string | null | undefined, locale: AdmissionsLocale, compact=false): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return locale==='ru'?'Дата пока не опубликована':'Date not yet published';
  const [year,month,day]=value.split('-').map(Number);
  const parsed=new Date(Date.UTC(year,month-1,day));
  if(parsed.getUTCFullYear()!==year || parsed.getUTCMonth()!==month-1 || parsed.getUTCDate()!==day) return locale==='ru'?'Дата пока не опубликована':'Date not yet published';
  if(compact && locale==='ru') return `${day} ${new Intl.DateTimeFormat('ru-RU',{month:'short',timeZone:'UTC'}).format(parsed)} ${year}`;
  return `${day} ${MONTHS[locale][month-1]} ${year}`;
}
export function formatAdmissionsDateRange(start: string | null, end: string | null, locale: AdmissionsLocale): string {
  if(!start || !end) return formatAdmissionsDate(start??end,locale);
  const a=formatAdmissionsDate(start,locale),b=formatAdmissionsDate(end,locale);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end)||a===formatAdmissionsDate(null,locale)||b===formatAdmissionsDate(null,locale))return formatAdmissionsDate(null,locale);
  if(start===end)return a;
  if(start.slice(0,4)!==end.slice(0,4))return `${a} – ${b}`;
  const [year,month,day]=start.split('-').map(Number);
  const [,endMonth,endDay]=end.split('-').map(Number);
  if(month===endMonth)return `${day}–${endDay} ${MONTHS[locale][month-1]} ${year}`;
  return `${day} ${MONTHS[locale][month-1]} – ${b}`;
}
export function formatAdmissionsMonth(value: string, locale: AdmissionsLocale) {
  const [year,month]=value.split('-').map(Number);
  return month>=1&&month<=12?`${locale==='ru'?MONTH_NAMES_RU[month-1]:MONTHS.en[month-1]} ${year}`:value;
}
// Audit prose can contain published dates/ranges too. This changes presentation only,
// never the structured ISO fields, unknown days, or URLs.
export function formatAdmissionsAuditDates(text:string,locale:AdmissionsLocale):string {
  const months='Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?';
  const number=(name:string)=>MONTHS.en.findIndex(m=>name.toLowerCase().startsWith(m.toLowerCase()))+1;
  const iso=(day:string,month:string,year:string)=>`${year}-${String(number(month)).padStart(2,'0')}-${day.padStart(2,'0')}`;
  return text.split(/(https?:\/\/[^\s)]+)/g).map(part=>{
    if(part.startsWith('http'))return part;
    let output=part.replace(new RegExp(`\\b(\\d{1,2})\\s*(${months})\\s+(20\\d{2})\\s*[–—-]\\s*(\\d{1,2})\\s*(${months})\\s+(20\\d{2})\\b`,'gi'),(_,a,m,y,b,n,z)=>formatAdmissionsDateRange(iso(a,m,y),iso(b,n,z),locale));
    output=output.replace(new RegExp(`\\b(\\d{1,2})\\s*(${months})\\s*[–—-]\\s*(\\d{1,2})\\s*(${months})\\s+(20\\d{2})\\b`,'gi'),(_,a,m,b,n,y)=>formatAdmissionsDateRange(iso(a,m,y),iso(b,n,y),locale));
    output=output.replace(new RegExp(`\\b(\\d{1,2})\\s*[–—-]\\s*(\\d{1,2})\\s*(${months})\\s+(20\\d{2})\\b`,'gi'),(_,a,b,m,y)=>formatAdmissionsDateRange(iso(a,m,y),iso(b,m,y),locale));
    output=output.replace(new RegExp(`\\b(\\d{1,2})\\s*(${months})\\s+(20\\d{2})\\b`,'gi'),(_,d,m,y)=>formatAdmissionsDate(iso(d,m,y),locale));
    if(locale==='ru') {
      output=output.replace(new RegExp(`\\b(\\d{1,2})\\s*(${months})\\b`,'gi'),(_,d,m)=>`${d} ${MONTHS.ru[number(m)-1]}`);
      output=output.replace(new RegExp(`\\b(Late|Early|Mid[- ]?)\\s*(${months})(?:\\s+(20\\d{2}))?\\b`,'gi'),(_,which,m,y)=>`${/^Late/i.test(which)?'конец':/^Early/i.test(which)?'начало':'середина'} ${MONTHS.ru[number(m)-1]}${y?' '+y:''}`);
      output=output.replace(new RegExp(`\\b(${months})\\s*[–—-]\\s*(${months})\\s+(20\\d{2})\\b`,'gi'),(_,a,b,y)=>`${MONTH_NAMES_RU[number(a)-1]}–${MONTH_NAMES_RU[number(b)-1]} ${y}`);
      output=output.replace(new RegExp(`\\b(${months})\\s+(20\\d{2})\\b`,'gi'),(_,m,y)=>`${MONTH_NAMES_RU[number(m)-1]} ${y}`);
    }
    return output.replace(/\b\d{4}-\d{2}-\d{2}\b/g,date=>formatAdmissionsDate(date,locale));
  }).join('');
}
const ZONES:Record<string,string>={'Asia/Seoul':'KST','Asia/Dubai':'GST','Asia/Hong_Kong':'HKT','Asia/Riyadh':'Saudi UTC+3','Asia/Qatar':'Qatar UTC+3','EST':'EST','Asia/Qyzylorda':'UTC+5'};
export function formatOfficialDeadline(deadline: OfficialDeadline, locale: AdmissionsLocale): string {
  if(!deadline.date) {
    if(deadline.precision==='relative')return deadline.approximate?.[locale]??deadline.display;
    return deadline.approximate?.[locale] ?? formatAdmissionsDate(null,locale);
  }
  const date=deadline.endDate?formatAdmissionsDateRange(deadline.date,deadline.endDate,locale):formatAdmissionsDate(deadline.date,locale);
  return `${date}${deadline.time?`, ${deadline.time}${deadline.timezone?` ${ZONES[deadline.timezone]??deadline.timezone}`:''}`:''}`;
}
export function formatDeadlineRelative(deadline: OfficialDeadline, locale: AdmissionsLocale, now=new Date()): string {
  const days=daysUntil(deadline,now);
  if(days===null)return locale==='ru'?'Дата пока не опубликована':'Date not yet published';
  if(!isUpcoming(deadline,now))return locale==='ru'?'Дедлайн прошёл':'Deadline passed';
  if(days===0)return locale==='ru'?'Сегодня':'Today';
  if(locale==='en')return `${days} ${days===1?'day':'days'} left`;
  const n=days%100,word=n>=11&&n<=14?'дней':days%10===1?'день':days%10>=2&&days%10<=4?'дня':'дней';
  return `Осталось ${days} ${word}`;
}
