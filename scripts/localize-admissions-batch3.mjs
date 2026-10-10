import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {admissionsTexts} from './admissions-texts.mjs';
import {createAdmissionsLoader} from './load-admissions-module.mjs';
import {cmuqLocales} from './admissions-batch3-cmuq-locales.mjs';
import {qatarLocales} from './admissions-batch3-qatar-locales.mjs';
import {udstLocales} from './admissions-batch3-udst-locales.mjs';
import {nyuadLocales} from './admissions-batch3-nyuad-locales.mjs';
import {nuLocales} from './admissions-batch3-nu-locales.mjs';
import {batch3Labels} from './admissions-batch3-labels.mjs';
import {addCommonEssayAppendix} from './admissions-batch3-common-essay.mjs';

export function localizeBatch3(records) {
 const catalog=JSON.parse(fs.readFileSync('data/admissions-translations.json','utf8'));
 const seals=JSON.parse(fs.readFileSync('data/admissions-batch3-source-fingerprints.json','utf8'));
 const locales={cmuq:cmuqLocales,qatar:qatarLocales,udst:udstLocales,nyuad:nyuadLocales,nu:nuLocales};
 const {admissionsText}=createAdmissionsLoader()('lib/admissions-localization.ts');
 for(const u of records) {
  const slug=u.id.slice(6),originals=admissionsTexts(u);
  const hash=createHash('sha256').update(originals.join('\0')).digest('hex');
  if(hash!==seals[slug])throw Error(`Batch 3 source changed: ${slug}. Review translations before updating fingerprint.`);
  for(const line of locales[slug].trim().split('\n')) {
   const [index,ru,en]=line.split('\t'),source=originals[Number(index)];
   if(!source||!ru||!en)throw Error(`Invalid Batch 3 translation ${slug}:${index}`);
   // Never overwrite existing Batch 1/2 translations.
   catalog[source]??={ru:ru==='='?source:ru,en:en==='='?source:en};
  }
 }
 // Upgrade only identical untranslated UI-label fallbacks. Reviewed translations
 // and every Batch 1/2 university record remain untouched.
 for(const [en,ru]of Object.entries(batch3Labels))if(!catalog[en]||catalog[en].ru===en)catalog[en]={ru,en};
 for(const u of records) {
  u.localizedText=Object.fromEntries(admissionsTexts(u).map(source=>[source,{
   ru:catalog[source]?.ru??admissionsText(source,'ru'),en:catalog[source]?.en??admissionsText(source,'en')
  }]));
  for(const [source,pair]of Object.entries(u.localizedText)) {
   if(/[а-яё]/i.test(pair.en))throw Error(`English translation missing ${u.id}: ${source}`);
   catalog[source]??=pair;
  }
  for(const block of u.blocks)for(const table of block.tables)for(const row of table.rows) {
   if(!['essays','recommendations'].includes(block.tab))continue;
   const key=table.columns.find(c=>/official.*(task|prompt)|exact.*(questions|prompt)/i.test(c));
   if(!key)continue;
   const source=row.fields[key],pair=u.localizedText[source];
   row.prompt={officialPrompt:null,promptRu:pair.ru,sourceEnglish:pair.en,sourceField:key,wording:/TBA|not published|not publicly|не опубликован/i.test(source)?'unpublished':'paraphrase'};
  }
 }
 for(const u of records)addCommonEssayAppendix(u,catalog);
 return {records,catalog};
}
