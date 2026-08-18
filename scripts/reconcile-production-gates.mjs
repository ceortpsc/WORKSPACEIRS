import {access, mkdir, readFile, writeFile} from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const sourcePath=path.join(root,'artifacts/production-evidence/acceptance-gates.json');
const outputDir=path.join(root,'artifacts/production-evidence/reconciliation');
const outputPath=path.join(outputDir,'latest.json');
const allowed=new Set(['PASS','PASS WITH CONDITIONS','BLOCKED','FAILED','NOT EXECUTED']);
const durableReference=/^(https:\/\/github\.com\/|https:\/\/[^\s]+\.amazonaws\.com|arn:aws:|s3:\/\/|cloudwatch:\/\/|github-actions:\/\/|commit:|file:|api:|test:|migration:|deployment:)/i;

async function exists(relative){try{await access(path.join(root,relative),constants.R_OK);return true;}catch{return false;}}
async function verifyEvidence(value){
 if(typeof value!=='string'||!value.trim())return {valid:false,reason:'EVIDENCE_MISSING'};
 const evidence=value.trim();
 if(evidence.startsWith('file:'))return await exists(evidence.slice(5))?{valid:true}:{valid:false,reason:'EVIDENCE_FILE_NOT_FOUND'};
 return durableReference.test(evidence)?{valid:true}:{valid:false,reason:'EVIDENCE_REFERENCE_NOT_DURABLE'};
}

const source=JSON.parse(await readFile(sourcePath,'utf8'));
if(!Array.isArray(source.gates))throw new Error('acceptance-gates.json must contain a gates array.');
const gates=[];
for(const gate of source.gates){
 if(!gate||typeof gate.name!=='string'||!allowed.has(gate.status))throw new Error(`Invalid gate record: ${JSON.stringify(gate)}`);
 const evidenceCheck=await verifyEvidence(gate.evidence);
 let effectiveStatus=gate.status;
 const reasons=[];
 if(gate.status==='PASS'&&!evidenceCheck.valid){effectiveStatus='BLOCKED';reasons.push(evidenceCheck.reason);}
 if(gate.status==='PASS WITH CONDITIONS')reasons.push('CONDITIONS_REMAIN');
 if(['BLOCKED','FAILED','NOT EXECUTED'].includes(gate.status))reasons.push(`DECLARED_${gate.status.replaceAll(' ','_')}`);
 gates.push({...gate,effectiveStatus,evidenceValid:evidenceCheck.valid,reasons});
}
const blockers=gates.filter(g=>g.effectiveStatus!=='PASS');
const result={application:source.application,environment:source.environment,evaluatedAt:new Date().toISOString(),status:blockers.length?'BLOCKED':'PASS',counts:gates.reduce((a,g)=>(a[g.effectiveStatus]=(a[g.effectiveStatus]??0)+1,a),{}),gates,blockers:blockers.map(g=>({name:g.name,status:g.effectiveStatus,reasons:g.reasons}))};
await mkdir(outputDir,{recursive:true});
await writeFile(outputPath,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(result.status!=='PASS')process.exitCode=2;
