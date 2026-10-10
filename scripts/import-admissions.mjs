// Deterministic, lossless conversion of supplied audits. No web research or inferred facts.
import fs from 'node:fs';
import path from 'node:path';
import { BATCH2_DEADLINES } from './batch2-deadlines.mjs';
import { writeAdmissionsJson } from './admissions-files.mjs';
const root = process.cwd();
if(JSON.parse(fs.readFileSync('data/universities/cmuq.json','utf8')).batch===3)throw Error('Legacy full importer is disabled after Batch 3: it would restore September data. Use scripts/admissions-batch3.mjs for the reviewed Batch 3 source.');
const source = process.argv[2];
if (!source) throw new Error('Pass the supplied October audit path');
const updated = fs.readFileSync(source, 'utf8').replace(/\r/g, '');
const batch2Source = process.argv[3];
const batch2Text = batch2Source ? fs.readFileSync(batch2Source,'utf8').replace(/\r/g,'') : null;
const old = fs.readFileSync(path.join(root, 'public/data/fall-2027-admissions-audit-ru.md'), 'utf8').replace(/\r/g, '');
const names = ['KAIST', 'POSTECH', 'KFUPM', 'HKUST', 'DGIST', 'UNIST', 'MBZUAI', 'CityUHK', 'Qatar University', 'UDST', 'AUS', 'GIST', 'CMU-Q', 'NYUAD', 'Nazarbayev University'];
const slugs = ['kaist','postech','kfupm','hkust','dgist','unist','mbzuai','cityuhk','qatar','udst','aus','gist','cmuq','nyuad','nu'];
const countries = ['South Korea','South Korea','Saudi Arabia','Hong Kong','South Korea','South Korea','United Arab Emirates','Hong Kong','Qatar','Qatar','United Arab Emirates','South Korea','Qatar','United Arab Emirates','Kazakhstan'];
const cities = ['Daejeon','Pohang','Dhahran','Hong Kong','Daegu','Ulsan','Abu Dhabi','Hong Kong','Doha','Doha','Sharjah','Gwangju','Doha','Abu Dhabi','Astana'];
const batch1 = ['kaist','postech','dgist','unist','gist'];
// Only categories established for the supplied Batch 2 applicant route.
// A maximum package is not an automatic award; an unpublished form is not a separate-application requirement.
const batch2FundingTags={
  kfupm:['full-tuition'],
  hkust:['full-tuition','automatic','separate-application','need-based','partial'],
  cityuhk:['full-tuition','automatic','partial'],
  mbzuai:['full-tuition','full-coa','need-based'],
  aus:['full-tuition','full-coa','automatic','separate-application','need-based','partial'],
};
const clean = s => s.trim().replace(/^[-*] /, '');
function tabFor(title) {
  if (/recommended timeline/i.test(title)) return 'deadlines';
  if (/snapshot|измен|changes|статус|стратег|strategic|best programme/i.test(title)) return 'overview';
  if (/source|источник|tba|confirmation|email|перепровер|не опублик/i.test(title)) return 'sources';
  if (/after admission|после|виз|registration|enrolment/i.test(title)) return 'after-admission';
  if (/real annual gap|housing|жиль|общежит/i.test(title)) return 'housing';
  if (/coverage|scholar|funding|aid|финанс|поддерж|покрыт/i.test(title)) return 'funding';
  if (/recommend|рекомендац/i.test(title)) return 'recommendations';
  if (/essay|эссе|statement/i.test(title)) return 'essays';
  if (/program|major|направлен|программ/i.test(title)) return 'programs';
  if (/deadline|timeline|round|срок|раунд|calendar/i.test(title)) return 'deadlines';
  if (/document|документ|checklist/i.test(title)) return 'documents';
  if (/platform|fee|подач|стоим/i.test(title)) return 'application';
  if (/NIS|academic|test|exam|interview|eligib|тест|требован|интервью/i.test(title)) return 'requirements';
  return 'overview';
}
function parseSection(raw, id, legacy = false) {
  const blocks = []; let block; let inherited = 'overview';
  const start = (title, level = 2) => {
    const detected = tabFor(title);
    const tab = level >= 3 && detected === 'overview' && !/analysis|стратег/i.test(title) ? inherited : detected;
    if (level < 3) inherited = tab;
    block = { id: `${id}-block-${blocks.length}`, title, tab, paragraphs: [], lists: [], tables: [], analysis: /analysis|анализ|стратег|competitive target/i.test(title) }; blocks.push(block);
  };
  start('Overview');
  const lines = raw.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || /^---+$/.test(line)) continue;
    const heading = line.match(/^(#{2,4})\s+(.+)/);
    const oldHeading = line.match(/^\*\*([^*]+)\*\*\s*(.*)/);
    if (heading) { start(heading[2], heading[1].length); continue; }
    if (legacy && oldHeading && oldHeading[1].length < 100 && /[.:]$/.test(oldHeading[1])) { start(oldHeading[1].replace(/[.:]$/, '')); if (oldHeading[2]) block.paragraphs.push(oldHeading[2]); continue; }
    if (line.startsWith('|') && lines[i+1]?.trim().match(/^\|[\s:|-]+\|$/)) {
      const cells = s => s.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(clean);
      const columns = cells(line);
      // Test policy tables following a strategy paragraph are official facts, not analysis.
      if (block.analysis && /Test|Item/.test(columns[0])) start('Academic and English test policy', 2);
      block.tab = /Test/.test(columns[0]) ? 'requirements' : block.tab;
      const table = { columns, rows: [] }; i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const values = cells(lines[i]);
        table.rows.push({ id: `${block.id}-table-${block.tables.length}-row-${table.rows.length}`, fields: Object.fromEntries(columns.map((key,j) => [key || `Field ${j+1}`, values[j] ?? 'TBA'])) }); i++;
      }
      i--; block.tables.push(table); continue;
    }
    if (/^[-*] |^\d+\. /.test(line)) block.lists.push(clean(line)); else block.paragraphs.push(line.replace(/^>\s?/, ''));
  }
  return blocks.filter(b => b.paragraphs.length || b.lists.length || b.tables.length);
}
const definitions = {
  kaist: [
    ['Early opens','2026-09-22',null,'Opening'],['Early application + documents','2026-10-22','18:00','Application'],['Early optional recommendations','2026-10-29',null,'Recommendation'],['Possible Early interview','2026-12-22',null,'Interview'],['Early decision','2027-01-07','10:00','Decision'],['Regular opens','2026-11-10',null,'Opening'],['Regular application + documents','2027-01-14','18:00','Application'],['Regular optional recommendations','2027-01-21',null,'Recommendation'],['Possible Regular interview','2027-03-03',null,'Interview'],['Regular decision','2027-03-25','10:00','Decision'],['Offer confirmation — within two weeks after verification',null,null,'Registration'],['Final verified documents — decision-specific',null,null,'Final documents'],['Semester begins — late August 2027',null,null,'Semester']],
  postech: [['Fall guide — expected late January 2027',null,null,'Guide'],['Application opens — expected March–April 2027',null,null,'Opening'],['Application deadline — Fall 2027 TBA',null,null,'Application'],['Documents / recommendations deadline',null,null,'Documents'],['Decision',null,null,'Decision'],['Deposit / registration',null,null,'Deposit'],['Final documents / visa / housing',null,null,'Final documents']],
  dgist: [['Application opens','2026-12-02','10:00','Opening'],['Application + optional recommendation','2027-01-28','18:00','Application'],['Evaluation / possible interview — through April 2027',null,null,'Interview'],['Acceptance / enrolment — by 11 May','2027-05-11',null,'Registration'],['Final documents',null,null,'Final documents'],['Semester — late August / early September 2027',null,null,'Semester']],
  unist: [['Application opens','2026-12-02','09:00','Opening'],['Application + documents','2027-01-22','16:00','Application'],['Review','2027-03-08',null,'Review','2027-04-09'],['Selected interviews','2027-03-29',null,'Interview','2027-04-09'],['Decision','2027-05-07',null,'Decision'],['Registration / non-refundable deposit','2027-05-07',null,'Deposit','2027-05-18'],['Final apostilled documents after registration',null,null,'Final documents'],['Housing / visa',null,null,'Housing']],
  gist: [['Application opens','2026-12-01',null,'Opening'],['Application + required recommendation','2027-01-29',null,'Application'],['Evaluation','2027-02-01',null,'Review','2027-03-31'],['Selected interview within evaluation period',null,null,'Interview'],['Decision','2027-04-30',null,'Decision'],['Registration','2027-05-04',null,'Registration','2027-06-25'],['Final diploma / apostille — timing conflict, confirm with admissions',null,null,'Final documents'],['Semester — Fall 2027',null,null,'Semester']],
  hkust: [['Priority application','2026-11-25',null,'Application'],['Rolling closes','2027-06-30',null,'Application']],
  mbzuai: [['Application opens','2026-09-07','08:00','Opening'],['Early Admission','2026-11-01','17:00','Application'],['Early decision','2027-01-15',null,'Decision'],['Regular','2027-02-01','17:00','Application'],['Regular decision','2027-04-01',null,'Decision']],
  cmuq: [['Early Decision','2026-11-01',null,'Application'],['ED QF aid','2026-11-20',null,'Funding'],['Regular Decision','2027-01-15',null,'Application'],['RD QF aid','2027-02-01',null,'Funding'],['Enrolment reply','2027-05-01',null,'Registration']],
  nyuad: [['Early Decision I','2026-11-01',null,'Application'],['ED I CSS','2026-11-10',null,'Funding'],['Early Decision II','2027-01-01',null,'Application'],['ED II CSS','2027-01-10',null,'Funding'],['Regular Decision','2027-01-05',null,'Application'],['RD CSS','2027-02-01',null,'Funding']],
};
const funding = {
  kaist: 'Full tuition · KRW 350,000/month · health insurance; housing paid separately',
  postech: 'Full tuition · KRW 500,000/month · conditional arrival reimbursement; 2027 guide TBA',
  dgist: 'Full tuition · living support schemes are alternatives, not additive · dorm paid',
  unist: 'Tuition + tiered living scholarship; non-scholarship offers possible · dorm paid',
  gist: 'Full tuition · allowances · one-way flight · health insurance; dorm paid',
};
const output = path.join(root,'data/universities'); fs.mkdirSync(output,{recursive:true});
let totalBlocks = 0;
for (let i=0;i<names.length;i++) {
  const slug=slugs[i], id=`audit-${slug}`, fresh1=batch1.includes(slug), fresh2=!!batch2Text&&!!BATCH2_DEADLINES[slug], fresh=fresh1||fresh2;
  const pattern = fresh ? new RegExp(`^# \\d+\\. ${names[i]}\\s*$`,'m') : new RegExp(`^## ${i+1}\\. .+$`,'m');
  const text=fresh2?batch2Text:fresh1?updated:old;
  const actualPattern=fresh2?new RegExp(`^# \\d+\\. (?:${slug==='cityuhk'?'City University of Hong Kong — CityUHK':slug==='aus'?'American University of Sharjah — AUS':names[i]})\\s*$`,'m'):pattern;
  const match=actualPattern.exec(text); if(!match) throw new Error(`Missing ${slug}`);
  const rest=text.slice(match.index); const next=rest.slice(1).search(fresh?/^# \d+\. /m:/^## \d+\. /m);
  const raw=(next<0?rest:rest.slice(0,next+1)).trim();
  const blocks=parseSection(raw,id,!fresh); totalBlocks+=blocks.length;
  const urls=[...raw.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g)];
  const sources=[...new Map(urls.map(m=>[m[2],{id:`${id}-source-${urls.indexOf(m)}`,title:m[1],url:m[2]}])).values()];
  const deadlines=fresh2?BATCH2_DEADLINES[slug].map(({key,...d})=>({...d,id:`${id}-official-${key}`,universityId:id,display:d.display??d.date??d.title,sourceIds:sources.map(s=>s.id)})):(definitions[slug]??[['Fall 2027 application — dates TBA',null,null,'Application']]).map(([title,date,time,type,endDate],j)=>({id:`${id}-official-${j}`,universityId:id,title,type,date,endDate:endDate??null,time,timezone:slug==='mbzuai'?'Asia/Dubai':countries[i]==='South Korea'?'Asia/Seoul':null,precision:endDate?'range':date?'exact':'tba',evidence:fresh?(slug==='postech'?'partial':date?'confirmed':'tba'):(date?'partial':'tba'),display:date?`${date}${endDate?` — ${endDate}`:''}${time?` ${time}`:''}${time?(slug==='mbzuai'?' GST':' KST'):''}`:title,sourceIds:sources.map(s=>s.id)}));
  const snapshot=blocks.find(b=>/snapshot/i.test(b.title));
  const snapshotRows=snapshot?.tables[0]?.rows??[];
  const snapshotValue=key=>Object.values(snapshotRows.find(r=>Object.values(r.fields)[0]===key)?.fields??{})[1];
  const programmeBlock=blocks.find(b=>b.tab==='programs');
  const programs=programmeBlock?.tables.flatMap(t=>t.rows.map(r=>Object.values(r.fields)[0]))??[];
  if(!programs.length) programs.push(...(raw.match(/Computer Science|Artificial Intelligence|Data Science|Software Engineering|Computer Engineering|CSE|EECS|AI/g)??[]));
  if(slug==='gist')deadlines.forEach(d=>{d.timezone=null;});
  if(slug==='kaist') {
    const confirmation=deadlines.find(d=>d.title.startsWith('Offer confirmation'));
    confirmation.precision='relative'; confirmation.evidence='confirmed';
  }
  deadlines.filter(d=>!d.date&&/through April|Semester/i.test(d.title)).forEach(d=>{d.evidence='partial';});
  const assessment=blocks.filter(b=>/strategic assessment/i.test(b.title)).flatMap(b=>[...b.lists,...b.paragraphs]).map(s=>s.replaceAll('**',''));
  const admissionDifficulty=assessment.find(s=>s.startsWith('Admission difficulty:'))?.replace('Admission difficulty:','').trim()??'Not assessed in October audit';
  const fundingDifficulty=assessment.find(s=>s.startsWith('Full-funding difficulty:'))?.replace('Full-funding difficulty:','').trim()??'Awaiting October re-audit';
  const oldFunding=blocks.filter(b=>b.tab==='funding').flatMap(b=>b.paragraphs).join(' ');
  const oldStatus=/\*\*Статус Fall 2027: TBA/.test(raw)?'tba':'partial';
  const batch2Funding={kfupm:'Tuition waiver for eligible outside-Saudi undergraduates; scholarship housing covered; other benefits need offer confirmation',hkust:'Up to full tuition + HKD 60,000/year combined allowance; not automatic for NIS; housing is paid from allowance',cityuhk:'Top: full tuition + up to HKD 60,000/year including housing and partial living costs; Fall 2027 renewal threshold TBA',mbzuai:'Up to 100% tuition + cost of attendance; individual award, stipend and summer coverage not guaranteed',aus:"President’s Scholarship: tuition/lab, housing, stipend, insurance and three round trips during study; separate competitive award, 2027 deadline TBA"};
  const data={id,name:names[i],country:countries[i],city:cities[i],batch:fresh1?1:fresh2?2:3,checkedAt:fresh?'2026-10-04':'2026-09-13',evidence:fresh?(['postech','kfupm','aus'].includes(slug)?'partial':'confirmed'):oldStatus,awaitingAudit:!fresh,platform:snapshotValue('Application platform')??snapshotValue('Application platform / URL')??snapshotValue('Platform')??(raw.includes('Common App')?'Common App':'University portal — September audit; October review pending'),programs:[...new Set(programs)],fundingTags:['full-tuition',...(['mbzuai','qatar','udst','aus','cmuq','nyuad'].includes(slug)?['full-coa','separate-application']:['automatic']),...(['cmuq','nyuad','mbzuai'].includes(slug)?['need-based']:[]),...(/half|partial tuition|частич/i.test(raw)?['partial']:[])],fundingSummary:batch2Funding[slug]&&fresh2?batch2Funding[slug]:funding[slug]??oldFunding??'October re-audit pending',admissionDifficulty,fundingDifficulty,blocks,deadlines,sources,sourceFile:fresh2?'/data/batch-2-ru-2026-10-04.md':fresh1?'/data/official-fall-2027-2026-10-04.md':'/data/fall-2027-admissions-audit-ru.md',sourceSection:raw};
  if(fresh2)data.fundingTags=batch2FundingTags[slug];
  writeAdmissionsJson(path.join(output,`${slug}.json`),data);
}
fs.copyFileSync(source,path.join(root,'public/data/official-fall-2027-2026-10-04.md'));
if(batch2Source)fs.copyFileSync(batch2Source,path.join(root,'public/data/batch-2-ru-2026-10-04.md'));
const first=updated.indexOf('# 3. KAIST'); const last=updated.indexOf('# 8. Batch 1');
const overview1=parseSection(updated.slice(0,first)+'\n'+updated.slice(last),'overview');
const overview2=batch2Text?parseSection(batch2Text.slice(0,batch2Text.indexOf('# 3. KFUPM'))+'\n'+batch2Text.slice(batch2Text.indexOf('# 8. Master matrices')),'overview-batch2'):[];
writeAdmissionsJson(path.join(root,'data/admissions-overview.json'),{checkedAt:'2026-10-04',blocks:[...overview1,...overview2],sourceFile:'/data/official-fall-2027-2026-10-04.md',batch2SourceFile:batch2Source?'/data/batch-2-ru-2026-10-04.md':null});
console.log(`Imported 15 universities, ${totalBlocks} structured sections. ${batch2Text?'Ten':'Five'} October records; ${batch2Text?'five':'ten'} preserved September records.`);
await import('./localize-admissions.mjs');
