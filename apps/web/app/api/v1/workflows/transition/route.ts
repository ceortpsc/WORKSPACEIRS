import {apiError,apiResponse,authorizeOperationalRequest,readJson,requestContext,validateTenantScope} from '../../../../../lib/api';
import {TASK_STATES,transitionWorkflow,type RiskTier,type TaskState} from '../../../../../lib/operations';

const roles=['OWNER_SUPER_ADMIN','PLATFORM_ADMIN','FIRM_ADMIN','ERO_ADMIN','PREPARER','REVIEWER','COMPLIANCE','CLIENT_SERVICE','CLIENT'];

export async function POST(request:Request){
 const context=requestContext(request);const auth=authorizeOperationalRequest(request,{allowSynthetic:true,roles});
 if(!auth.allowed)return apiError(auth.code??'ACCESS_DENIED',auth.message??'Access denied.',auth.httpStatus??403,context.correlationId);
 try{
  const body=await readJson(request);const scopeError=validateTenantScope(auth,body);
  if(scopeError)return apiError('TENANT_OR_SYNTHETIC_SCOPE_DENIED',scopeError,403,context.correlationId);
  const from=String(body.from??'') as TaskState;const to=String(body.to??'') as TaskState;
  if(!TASK_STATES.includes(from)||!TASK_STATES.includes(to))return apiError('INVALID_STATE','from and to must be registered workflow states.',400,context.correlationId);
  const decision=transitionWorkflow({from,to,taskId:typeof body.taskId==='string'?body.taskId:undefined,riskTier:(typeof body.riskTier==='string'?body.riskTier:'low') as RiskTier,humanApproved:body.humanApproved===true,approvalToken:context.approvalToken??(typeof body.approvalToken==='string'?body.approvalToken:undefined),actorRole:auth.role??undefined,reason:typeof body.reason==='string'?body.reason:undefined});
  return apiResponse({ok:decision.allowed,decision,auth:{mode:auth.mode,subject:auth.subject,tenantId:auth.tenantId,role:auth.role}},decision.allowed?200:decision.status==='HOLD'?409:400,context.correlationId);
 }catch(error){return apiError('INVALID_REQUEST',error instanceof Error?error.message:'Invalid request.',400,context.correlationId);}
}
