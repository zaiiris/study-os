export function admissionsTexts(u) {
  return [...new Set([u.country,u.city,u.platform,...u.programs,u.fundingSummary,u.admissionDifficulty,u.fundingDifficulty,...u.blocks.flatMap(b=>[b.title.replace(/^[A-Z]\. /,''),...b.paragraphs,...b.lists,...b.tables.flatMap(t=>[...t.columns,...t.rows.flatMap(r=>Object.values(r.fields))])]),...u.deadlines.flatMap(d=>[d.title,d.type]),...u.sources.map(s=>s.title)].filter(Boolean))];
}
