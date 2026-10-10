import type { StoreName, StudyOSBackup, StudyOSSchema } from "@/lib/models";

const DB_NAME = "study-os";
const DB_VERSION = 6;
export const STORE_NAMES: StoreName[] = ["userProfiles", "tasks", "dailyPlans", "events", "countdowns", "exams", "universities", "applications", "documents", "competitions", "projects", "resources", "aiImports", "admissionsProgress"];

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
}

export function openStudyDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("IndexedDB is not available in this browser."));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      STORE_NAMES.forEach((name) => { if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: "id" }); });
      // Additive upgrades only. Never remove a user's edited record based on a seed ID.
    };
    request.onsuccess = () => { request.result.onversionchange = () => request.result.close(); resolve(request.result); };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Close other Study OS tabs, then reload to finish the local database upgrade."));
  });
}

export async function getAll<K extends StoreName>(storeName: K): Promise<StudyOSSchema[K][]> {
  const db = await openStudyDB();
  try { return await requestToPromise(db.transaction(storeName, "readonly").objectStore(storeName).getAll()); }
  finally { db.close(); }
}

export async function saveRecord<K extends StoreName>(storeName: K, value: StudyOSSchema[K]): Promise<void> {
  const db = await openStudyDB();
  try { await new Promise<void>((resolve,reject) => { const tx=db.transaction(storeName,"readwrite"); tx.objectStore(storeName).put(value); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error); tx.onabort=()=>reject(tx.error); }); }
  finally { db.close(); }
}

export async function deleteRecord(storeName: StoreName, id: string): Promise<void> {
  const db = await openStudyDB();
  try { await requestToPromise(db.transaction(storeName, "readwrite").objectStore(storeName).delete(id)); }
  finally { db.close(); }
}

export async function updateRecord<K extends StoreName>(storeName: K, id: string, fallback: StudyOSSchema[K], change: (previous: StudyOSSchema[K]) => StudyOSSchema[K]): Promise<void> {
  const db = await openStudyDB();
  try { await new Promise<void>((resolve,reject)=>{
    const tx=db.transaction(storeName,"readwrite"); const store=tx.objectStore(storeName); const request=store.get(id);
    request.onsuccess=()=>{try { store.put(change(request.result??fallback)); } catch(error) {reject(error);tx.abort();}};
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  }); } finally {db.close();}
}

export async function saveEntity(storeName: StoreName, value: { id: string }): Promise<void> {
  const db = await openStudyDB();
  try { await requestToPromise(db.transaction(storeName, "readwrite").objectStore(storeName).put(value)); }
  finally { db.close(); }
}

export async function exportBackup(): Promise<StudyOSBackup> {
  const entries = await Promise.all(STORE_NAMES.map(async (name) => [name, await getAll(name)] as const));
  return { app: "Study OS", version: 1, exportedAt: new Date().toISOString(), data: Object.fromEntries(entries) as StudyOSBackup["data"] };
}

export async function importBackup(backup: StudyOSBackup): Promise<void> {
  if (backup.app !== "Study OS" || backup.version !== 1 || !backup.data) throw new Error("This is not a valid Study OS backup.");
  STORE_NAMES.forEach(name=>{ const records=backup.data[name]; if(records!==undefined && (!Array.isArray(records)||records.some(record=>!record||typeof record.id!=="string"))) throw new Error("Invalid backup records"); });
  const db = await openStudyDB();
  try {
    // Validate every store before writing; a restore is one atomic transaction.
    await new Promise<void>((resolve,reject)=>{
      const transaction=db.transaction(STORE_NAMES,"readwrite");
      STORE_NAMES.forEach(name=>{ if(backup.data[name]===undefined) return; const store=transaction.objectStore(name); store.clear(); backup.data[name].forEach(record=>store.put(record)); });
      transaction.oncomplete=()=>{ window.dispatchEvent(new Event("study-os-data")); resolve(); }; transaction.onerror=()=>reject(transaction.error); transaction.onabort=()=>reject(transaction.error);
    });
  } finally { db.close(); }
}
