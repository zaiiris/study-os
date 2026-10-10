import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=process.cwd();
// A command-scoped exception trusts only this explicitly selected project.
const files=execFileSync('git',['-c',`safe.directory=${root}`,'ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const findings=[];
const secrets=[
 ['GitHub token',/\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/],
 ['OpenAI token',/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{30,}\b/],
 ['AWS access key',/\bAKIA[0-9A-Z]{16}\b/],
 ['Private key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
 ['Literal credential assignment',/\b(?:password|api_key|apiKey|client_secret|access_token|authToken)\s*[:=]\s*["'][A-Za-z0-9_+/=-]{16,}["']/i]
];
let bytes=0;
for(const filename of [...new Set(files)]) {
 if(/^(node_modules|dist|build|\.next|\.vinext|\.wrangler|\.sites-runtime|verification|backups)\//.test(filename)||/(^|\/)\.env($|\.(?!example$))/.test(filename)||/\.lnk$/.test(filename))findings.push({file:filename,issue:'Local-only file is not ignored'});
 const resolved=path.resolve(root,filename);if(!fs.existsSync(resolved))continue;
 const buffer=fs.readFileSync(resolved);bytes+=buffer.length;if(buffer.includes(0))continue;
 const content=buffer.toString('utf8');
 for(const [issue,pattern]of secrets)if(pattern.test(content))findings.push({file:filename,issue});
 if(filename==='.npmrc'&&/\b_authToken\s*=\s*(?!\$\{)\S+/.test(content))findings.push({file:filename,issue:'Literal npm credential'});
}
// Findings expose names only, never matched secret values.
console.log(JSON.stringify({files:new Set(files).size,sourceMegabytes:Math.round(bytes/1048576*100)/100,findings},null,2));
if(findings.length)process.exitCode=1;
