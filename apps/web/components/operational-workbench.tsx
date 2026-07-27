'use client';

import {useMemo,useState} from 'react';

type Props={routeSlug:string;triggers:string[];apiEndpoints:string[]};
type Result={ok?:boolean;[key:string]:unknown};

export default function OperationalWorkbench({routeSlug,triggers,apiEndpoints}:Props){
 const [result,setResult]=useState<Result|null>(null);
 const [busy,setBusy]=useState(false);
 const defaultTrigger=useMemo(()=>triggers[0]??'INTAKE_SUBMITTED',[triggers]);
 const [trigger,setTrigger]=useState(defaultTrigger);

 async function run(path:string,body:Record<string,unknown>){
  setBusy(true);setResult(null);
  try{
   const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json','X-Correlation-ID':crypto.randomUUID()},body:JSON.stringify(body)});
   const payload=await response.json() as Result;
   setResult({ok:response.ok,httpStatus:response.status,...payload});
  }catch(error){setResult({ok:false,error:error instanceof Error?error.message:'Request failed'});}finally{setBusy(false);}
 }

 return <section className="workbench" aria-labelledby={`workbench-${routeSlug}`}>
  <div className="workbench__heading">
   <div><div className="eyebrow">Operational Wiring</div><h2 id={`workbench-${routeSlug}`}>Run a synthetic control-path check</h2></div>
   <span className="workbench__mode">No taxpayer data</span>
  </div>
  <p>This verifier exercises the deployed workflow and trigger engines with synthetic identifiers. It does not transmit, retrieve, or modify external records.</p>
  <div className="workbench__controls">
   <label><span>Task trigger</span><select value={trigger} onChange={event=>setTrigger(event.target.value)}>{triggers.map(item=><option key={item} value={item}>{item}</option>)}</select></label>
   <button className="ross-btn ross-btn--gold" disabled={busy||triggers.length===0} onClick={()=>run('/api/v1/workflows/triggers',{event:trigger,scope:{tenantId:'synthetic-tenant',caseId:`demo-${routeSlug}`}})}>{busy?'Running…':'Evaluate trigger'}</button>
   <button className="ross-btn ross-btn--outline" disabled={busy} onClick={()=>run('/api/v1/workflows/transition',{from:'REQUESTED',to:'AUTHENTICATED',taskId:`demo-${routeSlug}`,riskTier:'low',actorRole:'synthetic-verifier'})}>Validate transition</button>
  </div>
  <div className="workbench__apis"><strong>Registered contracts</strong>{apiEndpoints.map(endpoint=><code key={endpoint}>{endpoint}</code>)}</div>
  {result&&<pre className="workbench__result" aria-live="polite">{JSON.stringify(result,null,2)}</pre>}
 </section>;
}
