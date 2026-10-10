import fs from 'node:fs';

// Vite must never observe half-written JSON while an audit is regenerated.
export function writeAdmissionsJson(filename,value) {
  const temporary=`${filename}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporary,JSON.stringify(value,null,2)+'\n');
    fs.renameSync(temporary,filename);
  } finally {
    if(fs.existsSync(temporary))fs.unlinkSync(temporary);
  }
}
