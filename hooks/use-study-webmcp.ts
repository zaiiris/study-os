"use client";

import { useEffect } from "react";
import type { Task, TaskCategory, TaskPriority } from "@/lib/models";

type ToolDefinition = { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => unknown | Promise<unknown> };
type ModelContext = { registerTool: (tool: ToolDefinition, options?: { signal?: AbortSignal }) => void | Promise<void> };

export function useStudyWebMCP(tasks: Task[], upsertTask: (task: Task) => Promise<void>) {
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: ToolDefinition) => { try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined); } catch { /* WebMCP is optional. */ } };

    register({ name: "list_study_tasks", title: "List Study OS tasks", description: "Read the tasks currently saved in Study OS, optionally filtered by status.", inputSchema: { type: "object", properties: { status: { type: "string", enum: ["Todo", "In Progress", "Completed", "Cancelled"] } }, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute: (input) => { const status = (input as { status?: string })?.status; return tasks.filter((task) => !status || task.status === status).map(({ id, title, category, priority, status: taskStatus, deadline }) => ({ id, title, category, priority, status: taskStatus, deadline })); } });
    register({ name: "create_study_task", title: "Create a Study OS task", description: "Create and persist a new task in the local Study OS database.", inputSchema: { type: "object", properties: { title: { type: "string", minLength: 1 }, description: { type: "string" }, category: { type: "string", enum: ["SAT", "IELTS", "University", "School", "Project", "Competition", "Personal"] }, priority: { type: "string", enum: ["Low", "Medium", "High", "Urgent"] }, deadline: { type: "string", description: "ISO date or datetime" } }, required: ["title", "category", "priority", "deadline"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: async (input) => { const data = input as { title?: string; description?: string; category?: TaskCategory; priority?: TaskPriority; deadline?: string }; if (!data.title?.trim() || !data.category || !data.priority || !data.deadline || Number.isNaN(Date.parse(data.deadline))) throw new Error("A valid title, category, priority, and deadline are required."); const task: Task = { id: crypto.randomUUID(), title: data.title.trim(), description: data.description?.trim() ?? "", category: data.category, priority: data.priority, status: "Todo", deadline: data.deadline, createdDate: new Date().toISOString() }; await upsertTask(task); return { id: task.id, status: "created" }; } });
    return () => lifecycle.abort();
  }, [tasks, upsertTask]);
}
