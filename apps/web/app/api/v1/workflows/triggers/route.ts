import {apiError,apiResponse,authorizeOperationalRequest,readJson,requestContext,validateTenantScope} from '../../../../../lib/api';
import {evaluateTrigger,type TriggerEvent} from '../../../../../lib/operations';

const events=['INTAKE_SUBMITTED','DOCUMENT_UPLOADED','SIGNATURE_COMPLETED','EFILE_ACK_RECEIVED','NOTICE_UPLOADED','REFUND_EVIDENCE_ADDED','SECURITY_ANOMALY','PAYMENT_CONFIRMED'] as const;
const roles=['OWNER_SUPER_ADMIN','PLATFORM_ADMIN','FIRM_ADMIN','ERO_ADMIN','PREPARER','REVIEWER','COMPLIANCE','CLIENT_SERVICE','CLIENT'];

export async function POST(request:Request){
 const context=requestContext(request);const auth=authorizeOperationalRequest(request,{allowSynthetic:true,roles});
 if(!auth.allowed)return apiError(auth.code??'ACCESS_DENIED',auth.message??'Access denied.',auth.httpStatus??403,context.correlationId);
 try{
  const body=await readJson(request);const scopeError=validateTenantScope(auth,body);
  if(scopeError)return apiError('TENANT_OR_SYNTHETIC_SCOPE_DENIED',scopeError,403,context.correlationId);
  const event=String(body.event??'') as TriggerEvent;
  if(!events.includes(event))return apiError('UNKNOWN_TRIGGER','event must be a registered trigger.',400,context.correlationId,{registeredEvents:events});
  const scope=body.scope&&typeof body.scope==='object'&&!Array.isArray(body.scope)?body.scope as Record<string,unknown>:{};
  const result=evaluateTrigger(event,{tenantId:auth.tenantId??undefined,clientId:typeof scope.clientId==='string'?scope.clientId:undefined,caseId:typeof scope.caseId==='string'?scope.caseId:undefined});
  return apiResponse({ok:result.accepted,result,auth:{mode:auth.mode,subject:auth.subject,tenantId:auth.tenantId,role:auth.role}},result.accepted?202:400,context.correlationId);
 }catch(error){return apiError('INVALID_REQUEST',error instanceof Error?error.message:'Invalid request.',400,context.correlationId);}
}
