"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteRecord, getAll, saveEntity } from "@/lib/indexed-db";
import type { StoreName } from "@/lib/models";

export function useCollection<T extends { id: string }>(storeName: StoreName, initial: T[] = []) {
  const [records, setRecords] = useState<T[]>([]);
  const [ready, setReady] = useState(false);
  const refresh = useCallback(async () => { setRecords(await getAll(storeName) as unknown as T[]); setReady(true); }, [storeName]);
  useEffect(() => { void (async () => { const current = await getAll(storeName) as unknown as T[]; if (!current.length && initial.length) await Promise.all(initial.map((item) => saveEntity(storeName, item))); await refresh(); })(); }, [initial, refresh, storeName]);
  const upsert = useCallback(async (record: T) => { await saveEntity(storeName, record); await refresh(); }, [refresh, storeName]);
  const remove = useCallback(async (id: string) => { await deleteRecord(storeName, id); await refresh(); }, [refresh, storeName]);
  return { records, ready, refresh, upsert, remove };
}
