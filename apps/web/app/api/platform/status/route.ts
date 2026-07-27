import {NextResponse} from 'next/server';
import {platformRoutes} from '../../../../lib/routes';
import {CONTROL_GATES,TASK_STATES,getIntegrationRegistry,getRuntimeInfo} from '../../../../lib/operations';
import {buildReadinessReport} from '../../../../lib/readiness';

export const dynamic='force-dynamic';

export async function GET(){
 const runtime=getRuntimeInfo();
 const registry=getIntegrationRegistry();
 const certification=buildReadinessReport();
 const integrations=Object.fromEntries(registry.map(item=>[item.key,{label:item.label,category:item.category,enabled:item.enabled,configured:item.configured,authorizationRequired:item.authorizationRequired,status:item.status}]));
 const routeSummary={
  total:platformRoutes.length,
  implemented:platformRoutes.filter(route=>route.status==='implemented').length,
  controlled:platformRoutes.filter(route=>route.status==='controlled').length,
  externalGates:platformRoutes.filter(route=>route.status==='external-gate').length,
  public:platformRoutes.filter(route=>route.access==='public').length,
  protected:platformRoutes.filter(route=>route.access!=='public').length
 };
 const core=registry.filter(item=>item.category==='core');
 const external=registry.filter(item=>item.category==='external');
 const coreReady=core.every(item=>item.enabled&&item.configured);
 const enabledExternal=external.filter(item=>item.enabled);
 const externalReady=enabledExternal.length>0&&enabledExternal.every(item=>item.configured);
 const response={
  platform:'WORKSPACEIRS',
  product:'RTPSC Operations Fabric',
  operational:true,
  productionReady:certification.productionReady,
  certification:certification.certification,
  occupancy:coreReady?'controlled_core_ready':'application_ready_core_configuration_pending',
  environment:runtime.environment,
  version:runtime.version,
  commit:runtime.commit,
  routeSummary,
  workflowRegistry:{controlGates:CONTROL_GATES.length,taskStates:TASK_STATES.length,transitionEngine:'operational',triggerEngine:'operational',decisionMode:'deny_by_default'},
  readiness:{application:true,coreServices:coreReady,externalAdapters:externalReady,liveIrs:false,certificationSummary:certification.summary,readinessEndpoint:'/api/ready',reason:certification.productionReady?'All required production certification checks passed.':'Production certification remains blocked; inspect /api/ready for exact blockers.'},
  integrations,
  timestamp:new Date().toISOString()
 };
 return NextResponse.json(response,{headers:{'Cache-Control':'no-store, max-age=0','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'}});
}
