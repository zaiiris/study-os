"use client";

import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  const pattern = /(\[[^\]]+\]\(https?:\/\/[^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;
  return text.split(pattern).filter(Boolean).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer" className="font-semibold text-[#2859d8] underline decoration-[#b8c7ed] underline-offset-2 hover:decoration-[#2859d8]">{link[1]}</a>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index} className="rounded bg-[#eef2f8] px-1.5 py-0.5 text-[.9em]">{part.slice(1, -1)}</code>;
    return part;
  });
}

export function MarkdownContent({ markdown }: { markdown: string }) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const nodes: ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line || line === "---") { index += 1; continue; }
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) { tableLines.push(lines[index].trim()); index += 1; }
      const rows = tableLines.map((row) => row.slice(1, -1).split("|").map((cell) => cell.trim()));
      const body = rows.filter((_, rowIndex) => rowIndex !== 1);
      nodes.push(<div key={`table-${index}`} className="my-6 overflow-x-auto rounded-xl border border-[#e1e6ef]"><table className="min-w-full border-collapse text-left text-sm"><thead className="bg-[#f4f7fb]"><tr>{body[0]?.map((cell, cellIndex) => <th key={cellIndex} className="border-b border-[#e1e6ef] px-4 py-3 font-bold text-[#39455a]">{inline(cell)}</th>)}</tr></thead><tbody>{body.slice(1).map((row, rowIndex) => <tr key={rowIndex} className="border-b border-[#edf0f5] last:border-0">{row.map((cell, cellIndex) => <td key={cellIndex} className="min-w-[150px] px-4 py-3 align-top leading-6 text-[#596579]">{inline(cell)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (line.startsWith("### ")) nodes.push(<h3 key={index} className="mb-3 mt-8 text-xl font-bold tracking-[-.02em]">{inline(line.slice(4))}</h3>);
    else if (line.startsWith("## ")) nodes.push(<h2 key={index} className="mb-4 mt-10 text-2xl font-bold tracking-[-.03em] first:mt-0">{inline(line.slice(3))}</h2>);
    else if (line.startsWith("# ")) nodes.push(<h1 key={index} className="mb-5 text-3xl font-bold tracking-[-.04em]">{inline(line.slice(2))}</h1>);
    else if (/^\d+\. /.test(line)) nodes.push(<div key={index} className="my-2 flex gap-3 leading-7 text-[#4f5b6f]"><span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-[#e8eefc] text-xs font-bold text-[#2859d8]">{line.match(/^\d+/)?.[0]}</span><p>{inline(line.replace(/^\d+\. /, ""))}</p></div>);
    else if (line.startsWith("- ")) nodes.push(<div key={index} className="my-2 flex gap-3 leading-7 text-[#4f5b6f]"><span className="mt-[.7rem] size-1.5 shrink-0 rounded-full bg-[#2859d8]" /><p>{inline(line.slice(2))}</p></div>);
    else nodes.push(<p key={index} className="my-4 leading-7 text-[#4f5b6f]">{inline(line)}</p>);
    index += 1;
  }
  return <article className="min-w-0">{nodes}</article>;
}
