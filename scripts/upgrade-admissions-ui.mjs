// Mechanical integration of the shared locale/date helpers into the existing views.
import fs from 'node:fs';
const dir='components/study-os/';
const change=(name,replacements)=>{let text=fs.readFileSync(dir+name,'utf8');for(const [before,after]of replacements){if(!text.includes(before))throw new Error(`${name}: missing ${before}`);text=text.replaceAll(before,after);}fs.writeFileSync(dir+name,text);};
change('admissions-shared.tsx',[
 ['>{c}</TableHead>','><Fact text={c}/></TableHead>'],
 ["{block.title.replace(/^[A-Z]\\. /,'')}","<Fact text={block.title.replace(/^[A-Z]\\. /,'')}/>"],
 ['>Analysis</Badge>',">{language==='ru'?'Анализ':'Analysis'}</Badge>"],
 ['>{key}</dt>','><Fact text={key}/></dt>'],
 ["{essay?Object.values(row.fields)[1]||rowName(row):rowName(row)}","{rowName(row)}"],
 ['<dl className="mt-4',`{essay&&<section className="mt-4 space-y-2 text-sm leading-6"><h4 className="font-medium">{ru?'Вопрос / задание эссе':'Essay question / task'}</h4><p><Fact text={Object.values(row.fields)[1]??'TBA'}/></p><p className="text-xs text-amber-700">{ru?'Формулировка из аудита; пересказ не является дословным официальным вопросом.':'Audit wording; a summary is not an exact official prompt.'}</p><details><summary className="cursor-pointer text-blue-700">{ru?'Исходная формулировка':'Source wording'}</summary><p className="mt-2"><Fact original text={Object.values(row.fields)[1]??'TBA'}/></p></details></section>}<dl className="mt-4`],
 ]);
change('deadlines-workspace.tsx',[
 ["import { SearchField }", "import { formatOfficialDeadline,formatDeadlineRelative,formatAdmissionsMonth } from '@/lib/admissions-dates';\nimport { admissionsText } from '@/lib/admissions-localization';\nimport { SearchField }"],
 ["{d.date?d.display:'TBA'}",'{formatOfficialDeadline(d,language)}'],
 ['{d.title}</p>','{d.kind===\'official\'?admissionsText(d.title,language):d.title}</p>'],
 ['{d.type} ·','{admissionsText(d.type,language)} ·'],
 ['{d.precision} ·',"{ru?({exact:'Точная дата',range:'Период',relative:'Относительный срок',tba:'TBA'}[d.precision]):d.precision} ·"],
 ["{daysUntil(d)} {ru?'дн.':'days'}",'{formatDeadlineRelative(d,language)}'],
 ["sort().map(s=>({value:s,label:s}))",'sort().map(s=>({value:s,label:formatAdmissionsMonth(s,language)}))'],
 ["`${d.title} ${d.university.name} ${d.type}`", "`${d.title} ${admissionsText(d.title,language)} ${d.university.name} ${d.type} ${admissionsText(d.type,language)}`"],
 ]);
change('university-detail.tsx',[
 ["import { DeadlineList }", "import { formatAdmissionsDate,formatOfficialDeadline } from '@/lib/admissions-dates';\nimport { admissionsText } from '@/lib/admissions-localization';\nimport { DeadlineList }"],
 ['intro={`${university.city} · ${university.country}`}','intro={`${admissionsText(university.city,language)} · ${admissionsText(university.country,language)}`}'],
 ['{university.checkedAt}','{formatAdmissionsDate(university.checkedAt,language)}'],
 ["Batch 2/3 ожидает перепроверки",'Batch 3 ожидает перепроверки'],['Batch 2/3 awaits re-audit','Batch 3 awaits re-audit'],
 ["{next?.title??'TBA'}","{next?admissionsText(next.title,language):'TBA'}"],
 ["{next?.display??(ru?", "{(next?formatOfficialDeadline(next,language):null)??(ru?"],
 ['{university.fundingSummary}','<Fact text={university.fundingSummary}/>'],
 ["ru?'Full tuition ≠ full cost of attendance'", "ru?'Полное покрытие обучения ≠ полное покрытие всех расходов (COA)'"],
 ['{d.title} · {d.date}','{d.title} · {formatAdmissionsDate(d.date,language)}'],
 ["R — требуется, O — optional, POST",'R — требуется, O — необязательно, REC — рекомендуется, C — условно, NP — не установлено, POST'],
 ]);
change('universities-workspace.tsx',[
 ["import { Badge }", "import { formatOfficialDeadline,formatDeadlineRelative } from '@/lib/admissions-dates';\nimport { admissionsText } from '@/lib/admissions-localization';\nimport { Badge }"],
 ['{u.city} · {u.country}','{admissionsText(u.city,language)} · {admissionsText(u.country,language)}'],
 ["{progress[u.id]?.applicationStatus??'Researching'}", "{admissionsText(progress[u.id]?.applicationStatus??'Researching',language)}"],
 ["{next?.title??(ru?", "{(next?admissionsText(next.title,language):null)??(ru?"],
 ["`${next.display} · ${daysUntil(next)} ${ru?'дн.':'days'}`", "`${formatOfficialDeadline(next,language)} · ${formatDeadlineRelative(next,language)}`"],
 ['Analysis · {u.admissionDifficulty}',"{ru?'Анализ':'Analysis'} · <Fact text={u.admissionDifficulty}/>"],
 ['{u.fundingDifficulty}','<Fact text={u.fundingDifficulty}/>'],
 ]);
change('admissions-workspace.tsx',[
 ["AdmissionsNav,AuditSection,EvidenceBadge",'AdmissionsNav,AuditSection,EvidenceBadge,Fact'],
 ["import { ProgressBar }", "import { formatOfficialDeadline,formatDeadlineRelative } from '@/lib/admissions-dates';\nimport { admissionsText } from '@/lib/admissions-localization';\nimport { ProgressBar }"],
 [":d.type}",":admissionsText(d.type,language)}"],
 ['{d.title}</span>',"{d.kind==='official'?admissionsText(d.title,language):d.title}</span>"],
 ['{d.date}</span>','{formatOfficialDeadline(d,language)}</span>'],
 ["{d.time??''} {d.timezone==='Asia/Seoul'?'KST':d.timezone==='Asia/Dubai'?'GST':''}<br/>{daysUntil(d)} {ru?'дн.':'days'}",'{formatDeadlineRelative(d,language)}'],
 ['{u.fundingSummary}','<Fact text={u.fundingSummary}/>'],
 ['Batch 2/3, аудит октября ожидается','Batch 3, ожидается повторный аудит за октябрь'],['Batch 2/3, October audit pending','Batch 3, awaiting October re-audit'],
 ['{block.title}</summary>','<Fact text={block.title}/></summary>'],
 ]);
change('documents-workspace.tsx',[
 ['{group} <span','<Fact text={group}/> <span'],
 ["Для Batch 2/3 сохранены",'Для Batch 3 сохранены'],['Batch 2/3 original','Batch 3 original'],
 ]);
