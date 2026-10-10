// Run only after reviewing translations against the supplied audits.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {admissionsTexts} from './admissions-texts.mjs';
const seals={};
for(const file of fs.readdirSync('data/universities').filter(f=>f.endsWith('.json'))) {
  const u=JSON.parse(fs.readFileSync(`data/universities/${file}`,'utf8'));
  seals[file.replace('.json','')]=createHash('sha256').update(admissionsTexts(u).join('\0')).digest('hex');
}
const overview=JSON.parse(fs.readFileSync('data/admissions-overview.json','utf8'));
seals.overview=createHash('sha256').update(admissionsTexts({...overview,programs:[],deadlines:[],sources:[]}).join('\0')).digest('hex');
fs.writeFileSync('data/admissions-source-fingerprints.json',JSON.stringify(seals,null,2)+'\n');
