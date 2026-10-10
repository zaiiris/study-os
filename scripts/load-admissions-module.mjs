import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
// Evaluate only the project's own pure data/formatting modules for import validation/tests.
export function createAdmissionsLoader(root=process.cwd()) {
  const cache=new Map();
  function load(file) {
    const filename=path.resolve(root,file);if(cache.has(filename))return cache.get(filename);
    if(filename.endsWith('.json'))return JSON.parse(fs.readFileSync(filename,'utf8'));
    const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
    const compiledModule={exports:{}};cache.set(filename,compiledModule.exports);
    const localRequire=name=>{if(!name.startsWith('.')&&!name.startsWith('@/'))return require(name);let resolved=name.startsWith('@/')?path.join(root,name.slice(2)):path.resolve(path.dirname(filename),name);if(!path.extname(resolved))resolved+='.ts';return load(resolved);};
    new Function('require','module','exports',output)(localRequire,compiledModule,compiledModule.exports);cache.set(filename,compiledModule.exports);return compiledModule.exports;
  }
  return load;
}
