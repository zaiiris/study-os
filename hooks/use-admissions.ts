"use client";
import { useCallback, useEffect, useState } from 'react';
import { getAll, saveRecord, updateRecord } from '@/lib/indexed-db';
import { emptyProgress, UNIVERSITIES } from '@/lib/admissions-data';
import { migrateLegacyProgress } from '@/lib/admissions-progress';
import type { AdmissionsProgress } from '@/lib/admissions-types';

let migration: Promise<void>|null=null;
async function migrate() {
  const [records,legacy,applications]=await Promise.all([getAll('admissionsProgress'),getAll('universities'),getAll('applications')]);
  for(const university of UNIVERSITIES) {
    if(records.some(p=>p.id===university.id)) continue;
    const previous=legacy.find(u=>u.id===university.id); const application=applications.find(a=>a.universityId===university.id);
    const progress=migrateLegacyProgress(university,previous,application);
    await saveRecord('admissionsProgress',progress);
  }
}
export function useAdmissions() {
  const [,tick]=useState(0);
  useEffect(()=>{const timer=window.setInterval(()=>tick(n=>n+1),60000);return()=>window.clearInterval(timer);},[]);
  const [progress,setProgress]=useState<Record<string,AdmissionsProgress>>({}); const [ready,setReady]=useState(false); const [error,setError]=useState('');
  const refresh=useCallback(async()=>{ try { migration??=migrate().catch(err=>{migration=null;throw err;}); await migration; const rows=await getAll('admissionsProgress'); setProgress(Object.fromEntries(rows.map(p=>[p.id,p]))); setReady(true); setError(''); } catch(err) {setError(String(err));setReady(true);} },[]);
  useEffect(()=>{void Promise.resolve().then(refresh); window.addEventListener('study-os-data',refresh); return()=>window.removeEventListener('study-os-data',refresh);},[refresh]);
  const update=useCallback(async(id:string,change:(previous:AdmissionsProgress)=>AdmissionsProgress)=>{
    try {
      migration??=migrate().catch(err=>{migration=null;throw err;}); await migration;
      await updateRecord('admissionsProgress',id,emptyProgress(id),previous=>({...change(previous),id,version:1,updatedAt:new Date().toISOString()})); window.dispatchEvent(new Event('study-os-data')); return true;
    } catch(err) {setError(String(err));return false;}
  },[]);
  return {universities:UNIVERSITIES,progress,ready,error,update,refresh};
}
