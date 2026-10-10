// Batch 3 only. Batch 1/2 records and browser-local progress are not written.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {parseBatch3Section} from './admissions-batch3-parser.mjs';
import {batch3Deadlines} from './admissions-batch3-deadlines.mjs';
import {writeAdmissionsJson} from './admissions-files.mjs';

export const BATCH3_SLUGS=['cmuq','qatar','udst','nyuad','nu'];
const settings={
  cmuq:{name:'CMU-Q',country:'Qatar',city:'Doha',evidence:'confirmed',fundingTags:['full-tuition','full-coa','separate-application','need-based'],fundingSummary:'Индивидуальный QF Need-Based Grant до full COA; отдельно через FAS, для этого профиля RD. Размер и продление по условиям award.',programs:['Bachelor of Science in Artificial Intelligence','Bachelor of Science in Computer Science','Bachelor of Science in Information Systems']},
  qatar:{name:'Qatar University',country:'Qatar',city:'Doha',evidence:'tba',fundingTags:['full-tuition','separate-application'],fundingSummary:'International Students Scholarship / Talent Scholarship: обучение, книги, жильё и другие условия award; Fall 2027 календарь TBA, NIS June timing не разрешён.',programs:['B.Sc. Artificial Intelligence','B.Sc. Computer Science','B.Sc. Computer Engineering']},
  udst:{name:'UDST',country:'Qatar',city:'Doha',evidence:'tba',fundingTags:['full-tuition','separate-application'],fundingSummary:'Amiri Scholarship — отдельная конкурсная заявка; обучение, книги, жильё, страхование и другие опубликованные benefits. Сумма stipend и летнее покрытие неизвестны.',programs:['Bachelor of Science in Data Science and Artificial Intelligence','Bachelor of Science in Software Engineering','Bachelor of Science in Data and Cyber Security','Bachelor of Science in Information Systems','Bachelor of Science in Information Technology']},
  nyuad:{name:'NYUAD',country:'United Arab Emirates',city:'Abu Dhabi',evidence:'confirmed',fundingTags:['full-tuition','full-coa','separate-application','need-based'],fundingSummary:'Индивидуальная need-based помощь через CSS 2027–28; не автоматическая полная стипендия. IDOC только по запросу; CSS обычно один раз.',programs:['Computer Science (BS)','Computer Engineering (BS)']},
  nu:{name:'Nazarbayev University',country:'Kazakhstan',city:'Astana',evidence:'partial',fundingTags:['full-tuition','separate-application'],fundingSummary:'Отдельная Financial Support Application после regular offer. Принятие платного offer исключает рассмотрение финансирования; жильё/питание не гарантируются грантом.',programs:['BSc in Computer Science','BSc in Robotics Engineering','Bachelor of Engineering in Electrical and Computer Engineering']},
};
const markers={cmuq:/^# 11\. Carnegie Mellon University in Qatar — CMU-Q\s*$/m,qatar:/^# Batch 3 — 12\. Qatar University\s*$/m,udst:/^# Batch 3 — 13\. University of Doha for Science and Technology \(UDST\)\s*$/m,nyuad:/^# Batch 3 — 14\. NYU Abu Dhabi\s*$/m,nu:/^# Batch 3 — 15\. Nazarbayev University\s*$/m};
export function buildBatch3Records(text) {
  text=text.replace(/\r/g,'');
  return BATCH3_SLUGS.map(slug=>{
    const match=markers[slug].exec(text);if(!match)throw Error(`Missing Batch 3 section: ${slug}`);
    const remainder=text.slice(match.index),boundary=remainder.slice(1).search(/^# /m);
    const sourceSection=(boundary<0?remainder:remainder.slice(0,boundary+1)).replace(/<a id="all-15-master-matrices"><\/a>\s*$/,'').trim();
    const id=`audit-${slug}`,blocks=parseBatch3Section(sourceSection,id);
    const sources=[...new Map([...sourceSection.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g)].map((m,i)=>[m[2],{id:`${id}-b3-source-${i}`,title:m[1],url:m[2]}])).values()];
    const snapshot=blocks.find(b=>/snapshot/i.test(b.title));
    const platform=Object.values(snapshot.tables[0].rows.find(r=>/Application (platform|system)|Platform \/ application/i.test(Object.values(r.fields)[0])).fields)[1];
    const strategic=blocks.find(b=>/difficulty|Strategic assessment/i.test(b.title));
    const assessment=strategic?.paragraphs.find(p=>/Admission:/i.test(p)||/Admission difficulty:/i.test(p))??'Assessment in audit';
    return {id,...settings[slug],batch:3,checkedAt:'2026-10-04',awaitingAudit:false,platform,admissionDifficulty:assessment,fundingDifficulty:assessment,strategicAssessment:assessment,blocks,deadlines:batch3Deadlines(slug,id,sources),sources,sourceFile:'/data/batch-3-october-2026.md',sourceSection};
  });
}
export function importBatch3(source) {
  if(!source)throw Error('Pass the supplied combined October audit path. Only Batch 3 will be imported.');
  const records=buildBatch3Records(fs.readFileSync(source,'utf8'));
  const protectedHashes=JSON.parse(fs.readFileSync('data/batch12-integrity.json','utf8'));
  for(const [slug,hash]of Object.entries(protectedHashes))if(createHash('sha256').update(fs.readFileSync(`data/universities/${slug}.json`)).digest('hex')!==hash)throw Error(`Protected Batch 1/2 data differs: ${slug}. Inspect before importing.`);
  // Validate and localize all five records in memory before writing any official data.
  return records;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===fileURLToPath(new URL(`file:///${process.argv[1].replaceAll('\\','/')}`))) {
  const source=process.argv[2],records=importBatch3(source);
  const {localizeBatch3}=await import('./localize-admissions-batch3.mjs');
  const localized=localizeBatch3(records);
  for(const u of localized.records)writeAdmissionsJson(`data/universities/${u.id.slice(6)}.json`,u);
  writeAdmissionsJson('data/admissions-translations.json',localized.catalog);
  fs.writeFileSync('public/data/batch-3-october-2026.md',records.map(u=>u.sourceSection).join('\n\n')+'\n');
  console.log('Imported only Batch 3: CMU-Q, Qatar University, UDST, NYUAD, Nazarbayev University. Batch 1/2 and IndexedDB untouched.');
}
