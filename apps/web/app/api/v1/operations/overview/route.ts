import {platformRoutes} from '../../../../../lib/routes';
import {CONTROL_GATES,TASK_STATES,getIntegrationRegistry,getRuntimeInfo} from '../../../../../lib/operations';
import {apiResponse,requestContext} from '../../../../../lib/api';

export const dynamic='force-dynamic';

export async function GET(request:Request){
 const context=requestContext(request);const runtime=getRuntimeInfo();const integrations=getIntegrationRegistry();
 return apiResponse({ok:true,platform:'WORKSPACEIRS',product:'RTPSC Operations Fabric',runtime,registries:{routes:platformRoutes.length,controlGates:CONTROL_GATES,taskStates:TASK_STATES,integrations:integrations.map(item=>({key:item.key,label:item.label,category:item.category,status:item.status}))},execution:{workflowTransition:'/api/v1/workflows/transition',taskTriggers:'/api/v1/workflows/triggers',masterfileReconciliation:'/api/v1/masterfile/reconcile',refundInference:'/api/v1/refund-intelligence/infer',aiTasks:'/api/v1/ai/tasks',efileSubmissionGate:'/api/v1/efile/submissions'},discipline:['deny_by_default','least_privilege','human_approval_for_material_actions','immutable_audit_identifier','idempotency_for_side_effects','external_adapters_fail_closed']},200,context.correlationId);
}
