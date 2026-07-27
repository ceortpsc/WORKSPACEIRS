import {NextResponse} from 'next/server';
import {platformRoutes} from '../../../lib/routes';
import {CONTROL_GATES,TASK_STATES,getIntegrationRegistry,getRuntimeInfo} from '../../../lib/operations';

export const dynamic='force-dynamic';

export async function GET(){
 const runtime=getRuntimeInfo();
 const integrations=getIntegrationRegistry();
 const checks={
  application:'ok',
  routing:platformRoutes.length>=20?'ok':'error',
  workflowEngine:CONTROL_GATES.length===15&&TASK_STATES.length>=16?'ok':'error',
  adapterRegistry:integrations.length>=10?'ok':'error',
  buildMetadata:runtime.commit==='unavailable'?'warning':'ok'
 };
 const healthy=Object.values(checks).every(value=>value!=='error');
 return NextResponse.json({service:'workspaceirs-web',product:'RTPSC Operations Fabric',status:healthy?'ok':'degraded',checks,routeCount:platformRoutes.length,controlGateCount:CONTROL_GATES.length,taskStateCount:TASK_STATES.length,integrationCount:integrations.length,version:runtime.version,environment:runtime.environment,commit:runtime.commit,timestamp:new Date().toISOString()},{status:healthy?200:503,headers:{'Cache-Control':'no-store, max-age=0','X-Robots-Tag':'noindex, nofollow'}});
}
