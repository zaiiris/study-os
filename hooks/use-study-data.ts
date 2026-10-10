"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteRecord, getAll, saveRecord } from "@/lib/indexed-db";
import type { Countdown, Exam, Task, UserProfile } from "@/lib/models";

const now = new Date().toISOString();
const defaultProfile: UserProfile = { id: "profile-main", name: "ZIYADA", school: "", country: "", city: "", curriculum: "", graduationYear: 0, targetMajor: [], targetCountries: [], createdAt: now, updatedAt: now };
const defaultCountdowns: Countdown[] = [
  { id: "countdown-sat", name: "SAT", date: "2026-10-03T08:00", type: "Exam", color: "#2859d8" },
  { id: "countdown-ielts", name: "IELTS", date: "", type: "Exam", color: "#0f8a71" },
  { id: "countdown-application", name: "Application", date: "", type: "Deadline", color: "#7c4ed8" },
];

export function useStudyData() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [exams, setExams] = useState<Exam[]>([]);
  const [countdowns, setCountdowns] = useState<Countdown[]>(defaultCountdowns);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const [storedTasks, profiles, storedExams, storedCountdowns] = await Promise.all([getAll("tasks"), getAll("userProfiles"), getAll("exams"), getAll("countdowns")]);
    const storedProfile = profiles[0];
    if (storedProfile) {
      const corrected = { ...storedProfile };
      if (corrected.name === "Karina") corrected.name = "ZIYADA";
      corrected.targetMajor ??= []; corrected.targetCountries ??= [];
      corrected.school ??= ""; corrected.country ??= ""; corrected.city ??= ""; corrected.curriculum ??= "";
      corrected.updatedAt = new Date().toISOString();
      await saveRecord("userProfiles", corrected); setProfile(corrected);
    } else setProfile(defaultProfile);
    const mergedCountdowns = defaultCountdowns.map((fallback) => {
      const stored = storedCountdowns.find((item) => item.id === fallback.id);
      if (fallback.id === "countdown-sat" && stored?.date === "2026-12-07") return fallback;
      return stored ?? fallback;
    });
    setTasks(storedTasks); setExams(storedExams); setCountdowns(mergedCountdowns); setReady(true);
  }, []);

  useEffect(() => {
    async function initialize() {
      const [profiles, storedCountdowns] = await Promise.all([getAll("userProfiles"), getAll("countdowns")]);
      if (!profiles.length) await saveRecord("userProfiles", defaultProfile);
      await Promise.all(defaultCountdowns.filter((countdown) => !storedCountdowns.some((stored) => stored.id === countdown.id)).map((countdown) => saveRecord("countdowns", countdown)));
      await refresh();
    }
    void initialize().catch(() => { setTasks([]); setReady(true); });
  }, [refresh]);

  const upsertTask = useCallback(async (task: Task) => { await saveRecord("tasks", task); await refresh(); }, [refresh]);
  const removeTask = useCallback(async (id: string) => { await deleteRecord("tasks", id); await refresh(); }, [refresh]);
  const completeTask = useCallback(async (task: Task) => { const completed = task.status !== "Completed"; await upsertTask({ ...task, status: completed ? "Completed" : "Todo", completedDate: completed ? new Date().toISOString() : undefined }); }, [upsertTask]);

  const sat = useMemo(() => exams.find((exam) => exam.name === "SAT"), [exams]);
  const ielts = useMemo(() => exams.find((exam) => exam.name === "IELTS"), [exams]);
  const upsertCountdown = useCallback(async (countdown: Countdown) => { await saveRecord("countdowns", countdown); await refresh(); }, [refresh]);
  const upsertProfile = useCallback(async (nextProfile: UserProfile) => { await saveRecord("userProfiles", nextProfile); await refresh(); }, [refresh]);
  return { tasks, profile, exams, countdowns, sat, ielts, ready, refresh, upsertTask, removeTask, completeTask, upsertCountdown, upsertProfile };
}
