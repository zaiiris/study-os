import type {AdmissionsLocale} from './admissions-dates';
import type {AdmissionsProgress, OfficialUniversity} from './admissions-types';
import {allDeadlines,isUpcoming} from './admissions-data';

export interface ApplicationFee {amount:number|null;currency:string|null;note?:{ru:string;en:string}}
interface CardFacts {programme:string;platform:string;fee:ApplicationFee;requirements:{ru:string[];en:string[]};preferredDeadlines?:string[]}
// Presentation index into the existing audit, not a second university record.
// Amounts are native university fees; conditional fees are explicitly labelled.
export const UNIVERSITY_CARD_FACTS:Record<string,CardFacts>={
 'audit-kaist':{programme:'Computer Science / AI Computing',platform:'KAIST Online Application',fee:{amount:80,currency:'USD'},requirements:{ru:['Академический тест обязателен','До 2 необязательных рекомендаций','5 эссе'],en:['Academic test required','Up to 2 optional recommendations','5 essays']}},
 'audit-postech':{programme:'Computer Science & Engineering',platform:'Study in Korea — TBA',fee:{amount:null,currency:null},requirements:{ru:['Правила Fall 2027 ещё TBA','Поступление без выбора major'],en:['Fall 2027 requirements TBA','Undeclared entry']}},
 'audit-dgist':{programme:'Computer Science and Engineering track',platform:'Study in Korea',fee:{amount:50000,currency:'KRW'},requirements:{ru:['SAT / ACT необязательны','Английский тест необязателен'],en:['SAT / ACT optional','English test optional']}},
 'audit-unist':{programme:'Computer Science and Engineering',platform:'Study in Korea',fee:{amount:50000,currency:'KRW'},requirements:{ru:['Подтверждение английского','Рекомендации не требуются','4 эссе'],en:['English evidence required','No recommendations required','4 essays']}},
 'audit-gist':{programme:'Artificial Intelligence / EECS',platform:'GIST Online Application',fee:{amount:null,currency:null},requirements:{ru:['Академический тест обязателен','IELTS / TOEFL принимаются'],en:['Academic test required','IELTS / TOEFL accepted']}},
 'audit-kfupm':{programme:'Computer Science / Software Engineering',platform:'KFUPM Admissions Portal',fee:{amount:null,currency:null},requirements:{ru:['Подача через SAT Track','1 письмо администратора школы','Statement of Purpose'],en:['SAT Track application','1 school administrator letter','Statement of Purpose']}},
 'audit-hkust':{programme:'Computer Science and Engineering / AI',platform:'HKUST UGOAS',fee:{amount:600,currency:'HKD'},requirements:{ru:['SAT необязателен','1 академический рекомендатель','Прогнозные оценки принимаются'],en:['SAT optional','1 academic referee','Predicted grades accepted']}},
 'audit-cityuhk':{programme:'Computer Science / Data Science',platform:'CityUHK Online Application (EID)',fee:{amount:600,currency:'HKD'},requirements:{ru:['Прогнозные оценки NIS','Нет универсального требования писем'],en:['NIS predicted grades','No universal recommendation requirement']}},
 'audit-mbzuai':{programme:'BSc Artificial Intelligence (Engineering)',platform:'MBZUAI Application Portal',fee:{amount:200,currency:'AED',note:{ru:'После screening; возможен waiver',en:'After screening; waiver possible'}},requirements:{ru:['До 2 рекомендованных писем','Сбор после screening'],en:['Up to 2 recommended letters','Fee after screening']}},
 'audit-aus':{programme:'Computer Science / Computer Engineering',platform:'AUS Ellucian Recruit',fee:{amount:420,currency:'AED',note:{ru:'Включая НДС; тариф Fall 2027 TBA',en:'Including VAT; Fall 2027 tariff TBA'}},requirements:{ru:['Отдельная заявка President’s','2 письма для President’s'],en:['Separate President’s application','2 letters for President’s']}},
 'audit-cmuq':{programme:'BS Artificial Intelligence / Computer Science',platform:'Common App',fee:{amount:70,currency:'USD'},preferredDeadlines:['2','3'],requirements:{ru:['SAT / ACT обязателен','2 школьных рекомендателя','QF aid — отдельная заявка'],en:['SAT / ACT required','2 school recommendations','QF aid separate']}},
 'audit-qatar':{programme:'B.Sc. Artificial Intelligence / Computer Science',platform:'Qatar University Online Admission',fee:{amount:200,currency:'QAR'},requirements:{ru:['Для ISS: школьные оценки ≥ 95%','IELTS ≥ 5.5','Сроки Fall 2027 TBA'],en:['ISS: school grades ≥ 95%','IELTS ≥ 5.5','Fall 2027 dates TBA']}},
 'audit-udst':{programme:'BSc Data Science and Artificial Intelligence',platform:'UDST Online Admission',fee:{amount:300,currency:'QAR',note:{ru:'Первый placement test включён',en:'First placement test included'}},requirements:{ru:['Amiri — отдельная заявка','Amiri: 2 академических письма','Сроки Fall 2027 TBA'],en:['Amiri application separate','Amiri: 2 academic references','Fall 2027 dates TBA']}},
 'audit-nyuad':{programme:'Computer Science (BS) / Computer Engineering (BS)',platform:'Common App → NYU Portal',fee:{amount:85,currency:'USD'},preferredDeadlines:['4','5'],requirements:{ru:['SAT / ACT необязателен','1 рекомендательное письмо','CSS — отдельная заявка'],en:['SAT / ACT optional','1 recommendation','CSS application separate']}},
 'audit-nu':{programme:'BSc Computer Science — CS / AI / Data Science tracks',platform:'admissions.nu.edu.kz',fee:{amount:10000,currency:'KZT',note:{ru:'В последние 2 недели: 30 000 ₸; NUET отдельно',en:'Last 2 weeks: KZT 30,000; NUET separate'}},requirements:{ru:['NIS: финальные оценки','Financial Support — отдельно','Грантовый путь NIS 2027 уточнить'],en:['NIS: final grades','Financial Support separate','NIS 2027 grant eligibility unresolved']}}
};
export function applicationStatusLabel(status:string,locale:AdmissionsLocale) {
 const ru:Record<string,string>={Researching:'Не начато',Preparing:'Готовлю',ReadyToSubmit:'Готово к подаче',Submitted:'Подано',Interview:'Интервью',Accepted:'Поступила',Rejected:'Отказ',Waitlisted:'Лист ожидания'};
 return locale==='ru'?ru[status]??status:status==='Researching'?'Not started':status==='ReadyToSubmit'?'Ready to submit':status;
}
export function cardDeadlines(u:OfficialUniversity,progress:Record<string,AdmissionsProgress>,now=new Date()) {
 const preferred=UNIVERSITY_CARD_FACTS[u.id]?.preferredDeadlines;
 const relevant=allDeadlines(progress).filter(d=>d.universityId===u.id&&!d.completed&&d.evidence!=='previous-cycle'&&isUpcoming(d,now)&&(!preferred||preferred.some(key=>d.id===`${u.id}-official-${key}`||d.id===`${u.id}-official-${key}:target`)));
 const seen=new Set<string>();
 return relevant.filter(d=>d.kind==='target'||['Application','Recommendation','Documents','Funding','Deposit','Registration','Final documents'].includes(d.type)||(d.type==='Test'&&d.evidence==='confirmed')).filter(d=>{
  const key=d.id.replace(/:target$/,'');if(seen.has(key))return false;seen.add(key);return true;
 }).slice(0,2);
}
