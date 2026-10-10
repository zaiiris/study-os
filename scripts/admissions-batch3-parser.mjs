const tabFor=title=>{
  if(/recommended timeline|round|deadline/i.test(title))return 'deadlines';
  if(/snapshot|Changes since|Strategic|difficulty.*analysis/i.test(title))return 'overview';
  if(/Official sources|Still TBA|Email question/i.test(title))return 'sources';
  if(/After admission/i.test(title))return 'after-admission';
  if(/Housing|annual gap/i.test(title))return 'housing';
  if(/Scholarship|Financial Aid|Funding coverage|Renewal|Financial evidence|Aid categories/i.test(title))return 'funding';
  if(/Recommendation/i.test(title))return 'recommendations';
  if(/Essay/i.test(title))return 'essays';
  if(/Programme/i.test(title))return 'programs';
  if(/Documents|Document checklist/i.test(title))return 'documents';
  if(/Platform|application fee/i.test(title))return 'application';
  if(/NIS|Academic|test|English|minimum|exam|interview/i.test(title))return 'requirements';
  return null;
};
export function parseBatch3Section(raw,id) {
  const blocks=[];let block,inherited='overview';
  const start=(title,level=2)=>{
    const tab=tabFor(title)??(level>=3?inherited:'overview');if(level<3)inherited=tab;
    block={id:`${id}-b3-block-${blocks.length}`,title,tab,paragraphs:[],lists:[],tables:[],analysis:/analysis|strategic assessment/i.test(title)};blocks.push(block);
  };
  start('Overview');const lines=raw.split('\n');
  const cells=s=>s.trim().replace(/^\||\|$/g,'').split(/(?<!\\)\|/).map(s=>s.trim());
  for(let i=1;i<lines.length;i++) {
    const line=lines[i].trim();if(!line||/^---+$/.test(line)||/^<a id=/.test(line))continue;
    const h=line.match(/^(#{2,4})\s+(.+)/);if(h){start(h[2],h[1].length);continue;}
    if(line.startsWith('|')&&/^\|[\s:|-]+\|$/.test(lines[i+1]?.trim()??'')) {
      const columns=cells(line),table={columns,rows:[]};i+=2;
      while(i<lines.length&&lines[i].trim().startsWith('|')) {
        const values=cells(lines[i]);table.rows.push({id:`${block.id}-table-${block.tables.length}-row-${table.rows.length}`,fields:Object.fromEntries(columns.map((c,j)=>[c,values[j]??'TBA']))});i++;
      }
      i--;block.tables.push(table);continue;
    }
    if(/^[-*] |^\d+\. /.test(line))block.lists.push(line.replace(/^[-*] /,''));else block.paragraphs.push(line.replace(/^>\s?/,''));
  }
  return blocks.filter(b=>b.paragraphs.length||b.lists.length||b.tables.length);
}
