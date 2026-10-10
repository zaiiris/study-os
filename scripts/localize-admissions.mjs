import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {admissionsTexts} from './admissions-texts.mjs';
import {ru} from './admissions-ru.mjs';
import {batch2Locales} from './admissions-batch2-locales.mjs';
import {supplementLocales} from './admissions-supplement-locales.mjs';
import {overviewLocales} from './admissions-overview-locales.mjs';
import {extraLocales} from './admissions-extra-locales.mjs';
import {createAdmissionsLoader} from './load-admissions-module.mjs';
import {writeAdmissionsJson} from './admissions-files.mjs';
if(JSON.parse(fs.readFileSync('data/universities/cmuq.json','utf8')).batch===3)throw Error('Legacy positional localizer is disabled after Batch 3. Use the matching batch-scoped importer/localizer; do not overwrite reviewed Batch 1/2.');
const catalog={};
const seals=JSON.parse(fs.readFileSync('data/admissions-source-fingerprints.json','utf8'));
function readSource(slug) {
  const source=slug==='overview'?{...JSON.parse(fs.readFileSync('data/admissions-overview.json','utf8')),programs:[],deadlines:[],sources:[]}:JSON.parse(fs.readFileSync(`data/universities/${slug}.json`,'utf8'));
  const digest=createHash('sha256').update(admissionsTexts(source).join('\0')).digest('hex');
  if(digest!==seals[slug])throw Error(`Source fields changed for ${slug}; review translations before updating the source fingerprint. No positional translation may be reused blindly.`);
  return source;
}
// Validate every reviewed source before writing any bilingual records.
for(const slug of Object.keys(seals))readSource(slug);
for(const [slug,lines]of Object.entries(ru)) {
  const u=readSource(slug);
  const originals=admissionsTexts(u);
  for(const line of lines.trim().split('\n')) {
    const [key,...rest]=line.split('\t');const original=originals[Number(key)];
    if(!original||!rest.length)throw Error(`Invalid translation ${slug} ${key}`);
    catalog[original]={en:original,ru:rest.join('\t')};
  }
}
for(const [slug,lines]of [...Object.entries({...supplementLocales,...batch2Locales,overview:overviewLocales}),...Object.entries(extraLocales)]) {
  const u=readSource(slug),originals=admissionsTexts(u);
  for(const line of lines.trim().split('\n')) {
    const [key,ru,en]=line.split('\t'),original=originals[Number(key)];
    if(!original||!ru||!en)throw Error(`Invalid bilingual translation ${slug} ${key}`);
    catalog[original]={ru:ru==='='?original:ru,en:en==='='?original:en};
  }
}
writeAdmissionsJson('data/admissions-translations.json',catalog);
const {admissionsText}=createAdmissionsLoader()('lib/admissions-localization.ts');
for(const filename of fs.readdirSync('data/universities').filter(f=>f.endsWith('.json'))) {
  const file=`data/universities/${filename}`,u=JSON.parse(fs.readFileSync(file,'utf8'));
  u.localizedText=Object.fromEntries(admissionsTexts(u).map(t=>[t,{ru:admissionsText(t,'ru'),en:admissionsText(t,'en')}]));
  u.strategicAssessment=u.blocks.find(b=>/Strategic assessment/i.test(b.title))?.paragraphs.find(p=>/Admission:/i.test(p));
  for(const d of u.deadlines)if(!d.date&&!d.approximate) {
    if(/late January/i.test(d.title))d.approximate={ru:'конец января 2027',en:'Late January 2027'};
    else if(/March–April/i.test(d.title))d.approximate={ru:'март–апрель 2027',en:'March–April 2027'};
    else if(/within two weeks/i.test(d.title))d.approximate={ru:'В течение двух недель после проверки',en:'Within two weeks after verification'};
    else if(/through April/i.test(d.title))d.approximate={ru:'до конца апреля 2027',en:'Through April 2027'};
    else if(/late August \/ early September/i.test(d.title))d.approximate={ru:'конец августа / начало сентября 2027',en:'Late August / early September 2027'};
    else if(/late August/i.test(d.title))d.approximate={ru:'конец августа 2027',en:'Late August 2027'};
    else if(/Semester — Fall 2027/i.test(d.title))d.approximate={ru:'осень 2027; точная дата пока не опубликована',en:'Fall 2027; exact date not yet published'};
  }
  for(const block of u.blocks)for(const table of block.tables)for(const row of table.rows) {
    if(block.tab!=='essays'&&block.tab!=='recommendations')continue;
    const promptKey=table.columns.find(c=>/official.*(task|prompt)|written fields|exact questions/i.test(c))??(/written fields|exact questions|recommendation questions|interview questions|form questions/i.test(Object.values(row.fields)[0]??'')?table.columns[1]:undefined);
    if(!promptKey)continue;
    const source=row.fields[promptKey];
    const exact=u.id==='audit-aus'&&source.includes('why they should be considered for the scholarship');
    row.prompt={officialPrompt:exact?'why they should be considered for the scholarship':null,promptRu:exact?'Почему их следует рассматривать для стипендии':admissionsText(source,'ru'),sourceEnglish:admissionsText(source,'en'),sourceField:promptKey,wording:exact?'exact':/TBA|NP|not published|не опубликован/i.test(source)?'unpublished':'paraphrase'};
  }
  writeAdmissionsJson(file,u);
}
const overviewFile='data/admissions-overview.json',overview=JSON.parse(fs.readFileSync(overviewFile,'utf8'));
overview.localizedText=Object.fromEntries(admissionsTexts({...overview,programs:[],deadlines:[],sources:[]}).map(t=>[t,{ru:admissionsText(t,'ru'),en:admissionsText(t,'en')}]));
writeAdmissionsJson(overviewFile,overview);
console.log(`Installed ${Object.keys(catalog).length} reviewed bilingual fields.`);
