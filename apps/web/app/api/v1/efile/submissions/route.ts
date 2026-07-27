import {apiError,apiResponse,authorizeOperationalRequest,readJson,requestContext,validateTenantScope} from '../../../../../lib/api';
import {getIntegrationRegistry} from '../../../../../lib/operations';

const roles=['OWNER_SUPER_ADMIN','ERO_ADMIN','REVIEWER'];

export async function POST(request:Request){
 const context=requestContext(request);const auth=authorizeOperationalRequest(request,{allowSynthetic:false,roles});
 if(!auth.allowed)return apiError(auth.code??'ACCESS_DENIED',auth.message??'Access denied.',auth.httpStatus??403,context.correlationId);
 try{
  const body=await readJson(request);const scopeError=validateTenantScope(auth,body);
  if(scopeError)return apiError('TENANT_SCOPE_DENIED',scopeError,403,context.correlationId);
  const missing=[!context.idempotencyKey?'X-Idempotency-Key':null,!context.schemaVersion?'X-Schema-Version':null,!context.approvalToken?'X-Approval-Token':null].filter(Boolean);
  if(missing.length)return apiError('GATE_INPUT_MISSING','Required e-file control headers are missing.',400,context.correlationId,{missing});
  const required=['tenantId','officeId','returnId','environment'];
  const missingBody=required.filter(key=>typeof body[key]!=='string'||String(body[key]).trim()==='');
  if(missingBody.length)return apiError('SUBMISSION_SCOPE_MISSING','Submission scope is incomplete.',400,context.correlationId,{missing:missingBody});
  const requestedEnvironment=String(body.environment);const adapterMode=process.env.IRS_ADAPTER_MODE??'disabled';
  if(!['ats','production'].includes(requestedEnvironment))return apiError('INVALID_EFILE_ENVIRONMENT','environment must be ats or production.',400,context.correlationId);
  if(adapterMode!==requestedEnvironment)return apiError('ENVIRONMENT_ISOLATION_FAILURE','The requested environment does not match the configured adapter mode.',409,context.correlationId,{requestedEnvironment,configuredMode:adapterMode});
  const efile=getIntegrationRegistry().find(item=>item.key==='efile');
  if(!efile?.enabled||!efile.configured)return apiError('EXTERNAL_ADAPTER_GATED','IRS MeF transmission remains disabled until provider authorization, schemas, ATS evidence, certificates, endpoints, credentials, and owner approval are verified.',423,context.correlationId,{adapterStatus:efile?.status??'unregistered',transmitted:false});
  return apiResponse({ok:true,status:'READY_FOR_WORKER_DISPATCH',transmitted:false,submissionIntentId:`sub_${crypto.randomUUID()}`,idempotencyKey:context.idempotencyKey,schemaVersion:context.schemaVersion,environment:requestedEnvironment,auth:{subject:auth.subject,tenantId:auth.tenantId,role:auth.role},message:'All application gates passed. An authorized transmission worker and immutable outbox must perform the external side effect.'},202,context.correlationId);
 }catch(error){return apiError('INVALID_REQUEST',error instanceof Error?error.message:'Invalid request.',400,context.correlationId);}
}
