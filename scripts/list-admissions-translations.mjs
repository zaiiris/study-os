import fs from 'node:fs';
import {admissionsTexts} from './admissions-texts.mjs';
const file=fs.readFileSync('lib/admissions-localization.ts','utf8');
const labels=Function('return '+file.match(/const labels:Record<string,string>=(\{[\s\S]*?\n\});/)[1])();
const catalog=JSON.parse(fs.readFileSync('data/admissions-translations.json','utf8'));
const slug=process.argv[2];const u=slug==='overview'?{...JSON.parse(fs.readFileSync('data/admissions-overview.json','utf8')),programs:[],deadlines:[],sources:[]}:JSON.parse(fs.readFileSync(`data/universities/${slug}.json`,'utf8'));
admissionsTexts(u).forEach((text,index)=>{if(index>=Number(process.argv[3]??0)&&index<Number(process.argv[4]??Infinity)&&!labels[text]&&!catalog[text])console.log(index+'\t'+text);});
