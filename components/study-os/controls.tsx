"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function SearchField({ value, onChange, placeholder = "Search…", className }: { value: string; onChange: (value: string) => void; placeholder?: string; className?: string }) {
  return <div className={cn("relative", className)}><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a94a7]" /><Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 rounded-xl border-[#e1e5ed] bg-[#f8f9fb] pl-10 focus-visible:ring-[#2859d8]/15" /></div>;
}

export function FilterSelect({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: string[]; label: string }) {
  return <Select value={value} onValueChange={(next) => next && onChange(next)}><SelectTrigger aria-label={label} className="h-10 w-[150px] rounded-xl border-[#e1e5ed] bg-white"><SelectValue /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select>;
}

export function AppModal({ open, onOpenChange, title, description, children, footer }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="rounded-2xl border-[#e1e5ed] sm:max-w-xl"><DialogHeader><DialogTitle>{title}</DialogTitle>{description && <DialogDescription>{description}</DialogDescription>}</DialogHeader>{children}{footer && <DialogFooter>{footer}</DialogFooter>}</DialogContent></Dialog>;
}

export function FormField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2 text-sm font-semibold text-[#344159]"><span>{label}</span>{children}</label>; }

export function ProgressBar({ value, className }: { value: number; className?: string }) { return <Progress value={value} className={cn("h-2 bg-[#e9edf5] [&_[data-slot=progress-indicator]]:bg-[#2859d8]", className)} />; }
