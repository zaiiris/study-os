import { emptyProgress, rowName, rowsFor } from './admissions-data';
import type { OfficialUniversity } from './admissions-types';
import type { Application, University } from './models';

export function migrateLegacyProgress(university: OfficialUniversity, previous?: University, application?: Application) {
  const progress=emptyProgress(university.id);
  if(application)progress.applicationStatus=application.applicationStatus;
  if(!previous)return progress;
  progress.applicationStatus=application?.applicationStatus??previous.status;
  progress.notes=previous.notes??'';
  progress.legacyData={university:previous,application};
  for(const doc of previous.documents??[]) {
    const row=rowsFor(university,'documents').find(r=>rowName(r).toLowerCase()===doc.documentName.toLowerCase());
    if(row)progress.items[row.id]={status:doc.uploaded?'submitted':/ready|готов/i.test(doc.status)?'ready':'not-started',notes:doc.notes??'',targetDate:doc.deadline};
  }
  progress.customDeadlines=(previous.deadlines??[]).filter(d=>!(/^(kaist|dgist|unist|gist|hkust|mbzuai|cmuq|nyuad)-/.test(d.id))).map(d=>({id:d.id,universityId:university.id,title:d.round,type:d.type,date:d.deadlineDate.slice(0,10)||null,endDate:null,time:d.deadlineDate.includes('T')?d.deadlineDate.slice(11,16):null,timezone:'Asia/Qyzylorda',precision:'exact',evidence:'tba',display:d.deadlineDate,sourceIds:[]}));
  return progress;
}
