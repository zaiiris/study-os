import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import net from 'node:net';

const root=fileURLToPath(new URL('../',import.meta.url));
const occupied=await new Promise(resolve=>{
  const socket=net.connect({host:'localhost',port:5173});
  socket.once('connect',()=>{socket.destroy();resolve(true);});
  socket.once('error',()=>{socket.destroy();resolve(false);});
});
if(occupied) {
  let isStudyOs=false;
  try {
    const response=await fetch('http://localhost:5173/universities',{signal:AbortSignal.timeout(5000)});
    isStudyOs=response.ok&&/Study OS/.test(await response.text());
  }catch{/* A busy unrelated or unhealthy server must not cause a port fallback. */}
  if(isStudyOs){console.log('Study OS is already running: http://localhost:5173');process.exit(0);}
  console.error('Port 5173 is in use, but Study OS did not respond. Close the conflicting server and try again. No process was stopped; the port will not change.');
  process.exit(1);
}
console.log('Starting Study OS at http://localhost:5173. Closing this terminal stops the server.');
const server=spawn(process.execPath,['scripts/run-framework.mjs','dev'],{cwd:root,stdio:'inherit'});
server.once('error',error=>{console.error(error.message);process.exitCode=1;});
server.once('exit',code=>{process.exitCode=code??1;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.kill(signal));
