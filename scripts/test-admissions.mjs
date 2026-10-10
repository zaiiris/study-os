import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url), root=process.cwd(), cache=new Map();
// Compile the real TS modules in memory. Never modify the user's IndexedDB.
function load(file) {
  const filename=path.resolve(root,file);if(cache.has(filename))return cache.get(filename);
  if(filename.endsWith('.json'))return JSON.parse(fs.readFileSync(filename,'utf8'));
  const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const compiledModule={exports:{}};cache.set(filename,compiledModule.exports);
  const localRequire=name=>{if(!name.startsWith('.')&&!name.startsWith('@/'))return require(name);let resolved=name.startsWith('@/')?path.join(root,name.slice(2)):path.resolve(path.dirname(filename),name);if(!path.extname(resolved))resolved+='.ts';return load(resolved);};
  new Function('require','module','exports',output)(localRequire,compiledModule,compiledModule.exports);cache.set(filename,compiledModule.exports);return compiledModule.exports;
}
const data=load('lib/admissions-data.ts'), migration=load('lib/admissions-progress.ts');
const {UNIVERSITIES,rowsFor,progressSummary,emptyProgress,allDeadlines,nextDeadline,deadlineInstant,isUpcoming}=data;
const kaist=UNIVERSITIES.find(u=>u.id==='audit-kaist');
const dates=load('lib/admissions-dates.ts'),localization=load('lib/admissions-localization.ts');
const normal=s=>s.replace(/\s+/g,' ').trim();
test('All 15 universities use October audit records',()=>{
  assert.equal(UNIVERSITIES.length,15);assert.equal(new Set(UNIVERSITIES.map(u=>u.id)).size,15);
  assert.equal(UNIVERSITIES.filter(u=>!u.awaitingAudit).length,15);
  for(const u of UNIVERSITIES){assert.ok(u.sources.length);assert.ok(u.sourceSection.length>1000);assert.equal(u.checkedAt,u.awaitingAudit?'2026-09-13':'2026-10-04');}
});
test('All nonstructural source lines and table cells preserved in structured fields',()=>{
  for(const u of UNIVERSITIES){
    const contents=u.blocks.flatMap(b=>[b.title,...b.paragraphs,...b.lists,...b.tables.flatMap(t=>[...t.columns,...t.rows.flatMap(r=>Object.values(r.fields))])]).map(normal).join('\n');
    for(const raw of u.sourceSection.split('\n')){
      const line=raw.trim();if(!line||/^#{1,4} |^---+$/.test(line)||/^\|[\s:|-]+\|$/.test(line))continue;
      if(line.startsWith('|')){for(const cell of line.replace(/^\||\|$/g,'').split(/(?<!\\)\|/).map(normal))assert.ok(contents.includes(cell),u.id+' missing cell '+cell);}
      else if(/^\*\*[^*]+[.:]\*\*/.test(line)&&u.awaitingAudit){const parts=line.match(/^\*\*([^*]+)\*\*\s*(.*)/);assert.ok(contents.includes(normal(parts[1].replace(/[.:]$/,''))));if(parts[2])assert.ok(contents.includes(normal(parts[2])));}
      else assert.ok(contents.includes(normal(line.replace(/^[-*] |^>\s?/,''))),u.id+' missing line '+line);
    }
  }
});
test('Batch 1 checklist, published essay counts and corrected platforms',()=>{
  for(const [slug,count]of [['kaist',18],['postech',14],['dgist',15],['unist',16],['gist',16]])assert.equal(rowsFor(UNIVERSITIES.find(u=>u.id==='audit-'+slug),'documents').length,count);
  assert.equal(progressSummary(kaist).essays.length,5);assert.equal(progressSummary(UNIVERSITIES.find(u=>u.id==='audit-unist')).essays.length,4);assert.equal(progressSummary(UNIVERSITIES.find(u=>u.id==='audit-postech')).essays.length,0);
  assert.equal(UNIVERSITIES.find(u=>u.id==='audit-dgist').platform,'**Study in Korea**');assert.equal(UNIVERSITIES.find(u=>u.id==='audit-unist').platform,'**Study in Korea**');
  assert.equal(data.recommendationRows(UNIVERSITIES.find(u=>u.id==='audit-unist')).length,0,'UNIST must not acquire a fake recommendation requirement');
});
test('KAIST 18:00 KST evaluated as 09:00 UTC',()=>{
  const d=kaist.deadlines.find(d=>d.type==='Application');assert.equal(new Date(deadlineInstant(d)).toISOString(),'2026-10-22T09:00:00.000Z');assert.equal(isUpcoming(d,new Date('2026-10-22T08:59:59Z')),true);assert.equal(isUpcoming(d,new Date('2026-10-22T09:00:01Z')),false);
});
test('Date-only, ranges and TBA do not invent exact closing times',()=>{
  const d=UNIVERSITIES.find(u=>u.id==='audit-gist').deadlines.find(d=>d.type==='Application');assert.equal(d.time,null);assert.equal(d.timezone,null);assert.equal(isUpcoming(d,new Date('2027-01-29T15:00Z')),true);
  const window=UNIVERSITIES.find(u=>u.id==='audit-unist').deadlines.find(d=>d.type==='Deposit');assert.equal(window.precision,'range');assert.equal(window.endDate,'2027-05-18');assert.equal(isUpcoming(window,new Date('2027-05-15T00:00Z')),true);
  for(const d of UNIVERSITIES.find(u=>u.id==='audit-postech').deadlines){assert.equal(d.date,null);assert.equal(deadlineInstant(d),null);}
});
test('Targets and completion use one engine without changing official dates',()=>{
  const p=emptyProgress(kaist.id), d=kaist.deadlines.find(d=>d.type==='Application');p.targets[d.id]='2026-10-15';const entries=allDeadlines({[kaist.id]:p});assert.equal(entries.find(x=>x.id===d.id).date,'2026-10-22');assert.equal(entries.find(x=>x.id===d.id+':target').date,'2026-10-15');p.completedDeadlines.push(d.id);assert.notEqual(nextDeadline(kaist,{[kaist.id]:p},new Date('2026-10-04')).id,d.id);assert.equal(nextDeadline(UNIVERSITIES.find(u=>u.id==='audit-postech'),{},new Date('2026-10-04')),undefined);
});
test('Migration preserves notes, originals, progress and user-created dates',()=>{
  const legacy={id:kaist.id,status:'Preparing',notes:'My private note',documents:[{documentName:'Passport or national ID',uploaded:true,notes:'Original note',deadline:'2026-10-12'}],deadlines:[{id:'kaist-early',deadlineDate:'2026-10-22T23:59',round:'old seeded wrong time',type:'Application'},{id:'personal-example',deadlineDate:'2026-10-10',round:'My target',type:'Application'}]};const result=migration.migrateLegacyProgress(kaist,legacy,{applicationStatus:'Submitted'});assert.equal(result.notes,legacy.notes);assert.equal(result.applicationStatus,'Submitted');assert.deepEqual(result.legacyData.university,legacy);assert.equal(result.customDeadlines.length,1);const passport=rowsFor(kaist,'documents').find(r=>Object.values(r.fields)[0]==='Passport or national ID');assert.equal(result.items[passport.id].status,'submitted');assert.equal(result.items[passport.id].notes,'Original note');
});
test('Backup contains progress store; invalid backup rejected before opening database',async()=>{
  const db=load('lib/indexed-db.ts');assert.ok(db.STORE_NAMES.includes('admissionsProgress'));let opens=0;const original=globalThis.indexedDB;globalThis.indexedDB={open(){opens++;throw Error('should not open');}};try{await assert.rejects(db.importBackup({app:'Wrong',version:1,data:{}}));assert.equal(opens,0);}finally{globalThis.indexedDB=original;}
});

test('RU exact date and compact card date',()=>{
  assert.equal(dates.formatAdmissionsDate('2026-10-22','ru'),'22 октября 2026');
  assert.match(dates.formatAdmissionsDate('2026-10-22','ru',true),/^22 окт\.? 2026$/);
});
test('EN exact date consistently uses day-month-year',()=>{
  assert.equal(dates.formatAdmissionsDate('2026-10-22','en'),'22 Oct 2026');
});
test('Date ranges retain both endpoints, including one month and cross-year',()=>{
  assert.equal(dates.formatAdmissionsDateRange('2026-09-22','2026-10-22','ru'),'22 сентября – 22 октября 2026');
  assert.equal(dates.formatAdmissionsDateRange('2026-09-22','2026-10-22','en'),'22 Sep – 22 Oct 2026');
  assert.equal(dates.formatAdmissionsDateRange('2026-12-02','2026-12-28','ru'),'2–28 декабря 2026');
  assert.equal(dates.formatAdmissionsDateRange('2026-12-02','2027-01-28','en'),'2 Dec 2026 – 28 Jan 2027');
});
test('TBA, invalid dates and month-only estimates never become fake dates',()=>{
  for(const value of [null,undefined,'TBA','26-10-22','2026-02-30'])assert.equal(dates.formatAdmissionsDate(value,'ru'),'Дата пока не опубликована');
  const postech=UNIVERSITIES.find(u=>u.id==='audit-postech');
  assert.equal(dates.formatOfficialDeadline(postech.deadlines.find(d=>d.type==='Opening'),'ru'),'март–апрель 2027');
  const unknown=UNIVERSITIES.find(u=>u.id==='audit-aus').deadlines.find(d=>d.id.endsWith('official-0'));
  assert.equal(dates.formatOfficialDeadline(unknown,'en'),'Date not yet published');assert.equal(unknown.date,null);
});
test('Official time zone is retained; relative day labels use existing engine',()=>{
  const d=kaist.deadlines.find(d=>d.type==='Application');
  assert.equal(dates.formatOfficialDeadline(d,'ru'),'22 октября 2026, 18:00 KST');
  assert.equal(dates.formatDeadlineRelative(d,'ru',new Date('2026-10-04T06:00Z')),'Осталось 18 дней');
  assert.equal(dates.formatDeadlineRelative(d,'en',new Date('2026-10-21T06:00Z')),'1 day left');
  assert.equal(dates.formatDeadlineRelative(d,'ru',new Date('2026-10-22T06:00Z')),'Сегодня');
  assert.equal(dates.formatDeadlineRelative(d,'ru',new Date('2026-10-22T10:00Z')),'Дедлайн прошёл');
});
test('Changing locale changes actual factual paragraphs for all 15 October universities',()=>{
  for(const u of UNIVERSITIES.filter(u=>!u.awaitingAudit)) {
    assert.ok(Object.keys(u.localizedText).length>100);
    for(const tab of ['overview','requirements','funding','sources']) {
      const texts=u.blocks.filter(b=>b.tab===tab).flatMap(b=>[...b.paragraphs,...b.lists,...b.tables.flatMap(t=>t.rows.flatMap(r=>Object.values(r.fields)))]);
      const prose=texts.filter(s=>s.length>70&&!/^\[.*\)\.?$/.test(s));
      assert.ok(prose.some(s=>/[а-яё]/i.test(localization.admissionsText(s,'ru'))),`${u.id} ${tab} has Russian factual content`);
      assert.ok(prose.some(s=>localization.admissionsText(s,'ru')!==localization.admissionsText(s,'en')),`${u.id} ${tab} switches factual language`);
    }
  }
});
test('English task wording survives Russian localization; paraphrases are not called exact prompts',()=>{
  const essays=kaist.blocks.filter(b=>b.tab==='essays').flatMap(b=>b.tables.flatMap(t=>t.rows)).filter(r=>r.prompt);
  assert.equal(essays.length,5);
  for(const row of essays) {
    assert.match(row.prompt.promptRu,/[а-яё]/i);assert.equal(row.prompt.sourceEnglish,Object.values(row.fields)[1]);
    assert.equal(row.prompt.officialPrompt,null);assert.equal(row.prompt.wording,'paraphrase');
  }
  const video=UNIVERSITIES.find(u=>u.id==='audit-aus').blocks.flatMap(b=>b.tables.flatMap(t=>t.rows)).find(r=>r.prompt?.officialPrompt);
  assert.equal(video.prompt.officialPrompt,'why they should be considered for the scholarship');
  assert.equal(video.prompt.wording,'exact');assert.match(video.prompt.promptRu,/стипендии/);
  const component=fs.readFileSync('components/study-os/admissions-shared.tsx','utf8');assert.ok(component.includes('prompt?.officialPrompt??prompt?.sourceEnglish'));assert.ok(component.includes('<details>'));
  const form=kaist.blocks.filter(b=>b.tab==='recommendations').flatMap(b=>b.tables.flatMap(t=>t.rows)).find(r=>/Written fields/i.test(data.rowName(r)));
  assert.ok(form.prompt);assert.match(form.prompt.promptRu,/[а-яё]/i);assert.equal(form.prompt.sourceEnglish,Object.values(form.fields)[1]);assert.equal(form.prompt.officialPrompt,null);
});

test('All 15 bilingual records and the shared overview have English versions of Russian factual prose',()=>{
  const overview=JSON.parse(fs.readFileSync('data/admissions-overview.json','utf8'));
  for(const source of [...UNIVERSITIES,overview]) {
    for(const [original,pair] of Object.entries(source.localizedText)) {
      assert.equal(/[а-яё]/i.test(pair.en),false,`Untranslated English field: ${source.id??'overview'} ${original.slice(0,90)}`);
      assert.ok(pair.ru.length&&pair.en.length);
    }
  }
});
test('Batch 2 replaces September current records; historical conflicts stay in change logs',()=>{
  for(const slug of ['kfupm','hkust','cityuhk','mbzuai','aus']) {
    const u=UNIVERSITIES.find(u=>u.id==='audit-'+slug);
    assert.equal(u.batch,2);assert.equal(u.awaitingAudit,false);assert.equal(u.checkedAt,'2026-10-04');
    assert.equal(u.sourceFile,'/data/batch-2-ru-2026-10-04.md');assert.ok(u.blocks.some(b=>/Changes since/i.test(b.title)));
  }
  const city=UNIVERSITIES.find(u=>u.id==='audit-cityuhk');assert.ok(city.sourceSection.includes('HKD 600'));assert.ok(city.sourceSection.includes('20 000'));assert.ok(city.sourceSection.includes('Correction'));
  assert.equal(UNIVERSITIES.find(u=>u.id==='audit-kfupm').deadlines.find(d=>d.id.endsWith('official-0')).date,'2027-02-11');
  const aus=UNIVERSITIES.find(u=>u.id==='audit-aus');assert.equal(aus.deadlines.find(d=>d.id.endsWith('official-president')).date,null);
  assert.equal(aus.deadlines.some(d=>d.date==='2027-03-19'),false);
  assert.ok(UNIVERSITIES.find(u=>u.id==='audit-hkust').fundingTags.includes('separate-application'));
  assert.equal(UNIVERSITIES.find(u=>u.id==='audit-mbzuai').fundingTags.includes('separate-application'),false,'unpublished award form is not a confirmed separate application');
  assert.ok(aus.fundingTags.includes('need-based'));
});
test('ISO ordering is unchanged by human-readable labels and global deadlines include Batch 2',()=>{
  const events=allDeadlines({}).filter(d=>d.date);
  assert.ok(events.every(d=>/^\d{4}-\d{2}-\d{2}$/.test(d.date)));
  assert.deepEqual(events.map(d=>deadlineInstant(d)),events.map(d=>deadlineInstant(d)).toSorted((a,b)=>a-b));
  for(const slug of ['kfupm','hkust','cityuhk','mbzuai','aus'])assert.ok(events.some(d=>d.universityId==='audit-'+slug));
  assert.ok(events.some(d=>d.id==='audit-cityuhk-official-main'&&d.date==='2027-01-15'));
  assert.equal(data.recommendationRows(UNIVERSITIES.find(u=>u.id==='audit-hkust')).some(r=>/Academic reference/.test(data.rowName(r))),true);
});
test('Language preference retains existing storage key and subscribes to changes',()=>{
  const source=fs.readFileSync('components/study-os/i18n.tsx','utf8');
  assert.ok(source.includes("localStorage.getItem('study-os-language')"));assert.ok(source.includes("localStorage.setItem('study-os-language',next)"));assert.ok(source.includes('useSyncExternalStore'));assert.ok(source.includes("window.addEventListener('storage',storage)"));
});
test('IndexedDB personal progress survives official audit re-import and localization',async()=>{
  const {IDBFactory}=await import('fake-indexeddb');
  const original=globalThis.indexedDB;globalThis.indexedDB=new IDBFactory();
  const db=load('lib/indexed-db.ts');
  const p=emptyProgress('audit-hkust');p.applicationStatus='Submitted';p.notes='Private note — do not replace';p.completedDeadlines=['audit-hkust-official-0'];p.targets={'audit-hkust-official-0':'2026-11-12'};
  const reference=data.recommendationRows(UNIVERSITIES.find(u=>u.id===p.id))[0];p.items[reference.id]={status:'requested',notes:'Teacher contacted',teacher:'My recommender',targetDate:'2026-11-20'};
  const essay=data.rowsFor(UNIVERSITIES.find(u=>u.id===p.id),'essays')[0];p.items[essay.id]={status:'draft',notes:'Personal essay idea'};
  try {
    await db.saveRecord('admissionsProgress',p);
    const {buildBatch3Records}=await import('./admissions-batch3.mjs');
    const {localizeBatch3}=await import('./localize-admissions-batch3.mjs');
    const before=fs.readdirSync('data/universities').filter(f=>f.endsWith('.json')).map(f=>fs.readFileSync('data/universities/'+f,'utf8'));
    const rebuilt=localizeBatch3(buildBatch3Records(UNIVERSITIES.filter(u=>u.batch===3).map(u=>u.sourceSection).join('\n\n'))).records;
    assert.deepEqual(rebuilt.toSorted((a,b)=>a.id.localeCompare(b.id)),UNIVERSITIES.filter(u=>u.batch===3).toSorted((a,b)=>a.id.localeCompare(b.id)));
    assert.deepEqual(await db.getAll('admissionsProgress'),[p]);
    const after=fs.readdirSync('data/universities').filter(f=>f.endsWith('.json')).map(f=>fs.readFileSync('data/universities/'+f,'utf8'));
    assert.deepEqual(after,before,'import is deterministic and does not reset official IDs');
  }finally{globalThis.indexedDB=original;}
});

test('Batch 1/2 JSON remains byte-for-byte unchanged',async()=>{
  const {createHash}=await import('node:crypto');
  const baseline=JSON.parse(fs.readFileSync('data/batch12-integrity.json','utf8'));
  assert.equal(Object.keys(baseline).length,10);
  for(const [slug,hash]of Object.entries(baseline))assert.equal(createHash('sha256').update(fs.readFileSync(`data/universities/${slug}.json`)).digest('hex'),hash,slug);
});
test('Batch 3 corrects current facts and preserves uncertainty and source changes',()=>{
  for(const slug of ['cmuq','qatar','udst','nyuad','nu']) {
    const u=UNIVERSITIES.find(u=>u.id==='audit-'+slug);
    assert.equal(u.batch,3);assert.equal(u.checkedAt,'2026-10-04');assert.equal(u.awaitingAudit,false);
    assert.equal(u.sourceFile,'/data/batch-3-october-2026.md');
    assert.ok(u.blocks.some(b=>/Changes since/i.test(b.title)));assert.ok(rowsFor(u,'documents').length>10);
  }
  for(const slug of ['qatar','udst'])assert.ok(UNIVERSITIES.find(u=>u.id==='audit-'+slug).deadlines.filter(d=>d.evidence!=='previous-cycle').every(d=>d.date===null));
  const nyu=UNIVERSITIES.find(u=>u.id==='audit-nyuad');assert.deepEqual(nyu.programs,['Computer Science (BS)','Computer Engineering (BS)']);
  const nu=UNIVERSITIES.find(u=>u.id==='audit-nu');assert.equal(nu.deadlines.find(d=>d.id.endsWith('official-0')).date,null);assert.ok(nu.sourceSection.includes('Financial Support Application'));
});
test('Batch 3 joins global deadlines/documents without duplicate events or invented times',()=>{
  const events=allDeadlines({});assert.equal(new Set(events.map(d=>d.id)).size,events.length);
  for(const slug of ['cmuq','qatar','udst','nyuad','nu'])assert.ok(events.some(d=>d.universityId==='audit-'+slug));
  const d=events.find(d=>d.id==='audit-nyuad-official-0');
  assert.equal(new Date(deadlineInstant(d)).toISOString(),'2026-11-02T04:59:00.000Z');
  assert.equal(dates.formatOfficialDeadline(d,'ru'),'1 ноября 2026, 23:59 EST');
  assert.equal(events.find(d=>d.id==='audit-cmuq-official-2').time,null);
});
test('Cards cap actionable deadlines at two, respect completion/targets and never use prior cycles',()=>{
  const cards=load('lib/admissions-card-facts.ts'),now=new Date('2026-10-10T06:00Z');
  for(const u of UNIVERSITIES){const a=cards.cardDeadlines(u,{},now);assert.ok(a.length<=2);assert.ok(a.every(d=>d.evidence!=='previous-cycle'));assert.ok(cards.UNIVERSITY_CARD_FACTS[u.id].requirements.ru.length<=3);}
  assert.deepEqual(cards.cardDeadlines(UNIVERSITIES.find(u=>u.id==='audit-cmuq'),{},now).map(d=>d.date),['2027-01-15','2027-02-01']);
  for(const id of ['audit-qatar','audit-udst'])assert.equal(cards.cardDeadlines(UNIVERSITIES.find(u=>u.id===id),{},now).length,0);
  const p=emptyProgress(kaist.id);p.targets['audit-kaist-official-0']='2026-10-15';
  assert.ok(cards.cardDeadlines(kaist,{[p.id]:p},now).some(d=>d.kind==='target'));
  p.completedDeadlines.push('audit-kaist-official-0');assert.ok(cards.cardDeadlines(kaist,{[p.id]:p},now).every(d=>!d.id.includes('official-0')));
  assert.equal(cards.applicationStatusLabel('Accepted','ru'),'Поступила');assert.equal(cards.applicationStatusLabel('Submitted','ru'),'Подано');
});
test('Native fees are authoritative; KZT helper needs dated, sourced rates and is explicitly approximate',()=>{
 const {UNIVERSITY_CARD_FACTS:cards}=load('lib/admissions-card-facts.ts'),currency=load('lib/admissions-currency.ts');
 for(const [id,amount,unit]of [['audit-cmuq',70,'USD'],['audit-qatar',200,'QAR'],['audit-udst',300,'QAR'],['audit-nyuad',85,'USD'],['audit-nu',10000,'KZT']])assert.deepEqual([cards[id].fee.amount,cards[id].fee.currency],[amount,unit]);
 const fee=cards['audit-kaist'].fee;assert.equal(currency.formatNativeFee(fee,'en'),'USD 80');assert.equal(currency.approximateKzt(fee,'ru'),null);
 const config={updatedAt:'2026-10-10',source:'test fixture, NOT a current FX quote',rates:{USD:500}};
 assert.match(currency.approximateKzt(fee,'ru',config),/^≈ 40\s000 ₸ · курс обновлён 10 окт\.? 2026$/);
 assert.equal(currency.approximateKzt(fee,'ru',{...config,source:null}),null);
 assert.equal(currency.approximateKzt(cards['audit-nu'].fee,'ru',config),null);
});
test('Shared Common App appendix retains all seven source paraphrases without seven mandatory essay tasks',()=>{
 for(const id of ['audit-cmuq','audit-nyuad']) {
  const u=UNIVERSITIES.find(u=>u.id===id),appendix=u.blocks.find(b=>b.id.endsWith('common-essay-appendix'));
  assert.equal(appendix.tables[0].rows.length,7);
  for(const r of appendix.tables[0].rows){assert.equal(r.prompt.wording,'paraphrase');assert.equal(r.prompt.officialPrompt,null);assert.match(r.prompt.promptRu,/[а-яё]/i);}
  assert.ok(progressSummary(u).essays.every(r=>!r.id.includes('common-prompt-')));
 }
});
test('Batch 3 section headings are readable in RU, with existing stable tabs',()=>{
 const tabs=new Set(['overview','deadlines','application','requirements','documents','essays','recommendations','funding','programs','housing','after-admission','sources']);
 for(const u of UNIVERSITIES.filter(u=>u.batch===3))for(const b of u.blocks){assert.ok(tabs.has(b.tab));const title=b.title.replace(/^[A-Z]\. /,'');assert.match(localization.admissionsText(title,'ru'),/[а-яё]/i,`${u.id}: ${title}`);}
});
test('Portable launchers use 5173 strictly and never include a private machine path',()=>{
 const bat=fs.readFileSync('START_STUDY_OS.bat','utf8'),ps=fs.readFileSync('start-study-os.ps1','utf8'),config=fs.readFileSync('vite.config.ts','utf8');
 assert.ok(bat.includes('%~dp0'));assert.ok(ps.includes('$PSScriptRoot'));assert.ok(config.includes('strictPort: true'));
 for(const file of ['START_STUDY_OS.bat','start-study-os.ps1','Study OS Autostart.vbs'])assert.equal(/C:[\\/].*Users/i.test(fs.readFileSync(file,'utf8')),false,file);
});
