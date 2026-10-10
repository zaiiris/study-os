"use client";

import { useCallback, useEffect, useState } from "react";
import { AUDIT_FILE_URL, AUDIT_UNIVERSITIES, createAuditUniversity, extractOverview, extractUniversitySection } from "@/lib/admissions-audit";
import { getAll, saveRecord } from "@/lib/indexed-db";
import type { University } from "@/lib/models";

let cachedMarkdown = "";

export function useAdmissionsAudit() {
  const [markdown, setMarkdown] = useState(cachedMarkdown);
  const [loading, setLoading] = useState(!cachedMarkdown);

  const load = useCallback(async () => {
    try {
      if (!cachedMarkdown) {
        const response = await fetch(AUDIT_FILE_URL);
        if (!response.ok) throw new Error("Admissions audit is unavailable");
        cachedMarkdown = await response.text();
      }
      setMarkdown(cachedMarkdown);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const seedUniversities = useCallback(async () => {
    const stored = await getAll("universities");
    const ids = new Set(stored.map((item) => item.id));
    const missing = AUDIT_UNIVERSITIES.filter((meta) => !ids.has(meta.id));
    await Promise.all(missing.map((meta) => saveRecord("universities", createAuditUniversity(meta))));
    return missing.length;
  }, []);

  return {
    markdown,
    loading,
    overview: markdown ? extractOverview(markdown) : "",
    getUniversitySection: (number: number) => markdown ? extractUniversitySection(markdown, number) : "",
    seedUniversities,
  };
}

export function mergeAuditUniversity(record: University | undefined, id: string): University | undefined {
  const meta = AUDIT_UNIVERSITIES.find((item) => item.id === id);
  if (!meta) return record;
  const base = createAuditUniversity(meta);
  if (!record) return base;
  return {
    ...base,
    ...record,
    majors: record.majors ?? [],
    deadlines: record.deadlines?.length ? record.deadlines : base.deadlines,
    requirements: record.requirements ?? [],
    tests: record.tests ?? [],
    documents: record.documents ?? [],
    scholarships: record.scholarships ?? [],
    costs: record.costs?.length ? record.costs : base.costs,
  };
}
