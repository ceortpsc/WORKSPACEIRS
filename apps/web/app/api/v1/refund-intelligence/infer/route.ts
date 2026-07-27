import {apiError,apiResponse,authorizeOperationalRequest,readJson,requestContext,validateTenantScope} from '../../../../../lib/api';
import {inferRefundLane,type RefundEvidence} from '../../../../../lib/operations';

const roles=['OWNER_SUPER_ADMIN','PLATFORM_ADMIN','FIRM_ADMIN','ERO_ADMIN','PREPARER','REVIEWER','COMPLIANCE','CLIENT_SERVICE'];

export async function POST(request:Request){
 const context=requestContext(request);const auth=authorizeOperationalRequest(request,{allowSynthetic:true,roles});
 if(!auth.allowed)return apiError(auth.code??'ACCESS_DENIED',auth.message??'Access denied.',auth.httpStatus??403,context.correlationId);
 try{
  const body=await readJson(request);const scopeError=validateTenantScope(auth,body);
  if(scopeError)return apiError('TENANT_OR_SYNTHETIC_SCOPE_DENIED',scopeError,403,context.correlationId);
  const clientId=String(body.clientId??'');const rawEvidence=Array.isArray(body.evidence)?body.evidence:[];
  if(clientId.length<8)return apiError('CLIENT_SCOPE_REQUIRED','A non-PII internal clientId of at least 8 characters is required.',400,context.correlationId);
  if(rawEvidence.length===0)return apiError('EVIDENCE_REQUIRED','At least one evidence observation is required.',400,context.correlationId);
  const evidence:RefundEvidence[]=rawEvidence.map(raw=>{const item=raw as Record<string,unknown>;return {source:String(item.source??'unknown'),observedAt:String(item.observedAt??new Date().toISOString()),reliability:typeof item.reliability==='number'?item.reliability:.5,fact:String(item.fact??'')};}).filter(item=>item.fact.trim().length>0);
  if(evidence.length===0)return apiError('VALID_EVIDENCE_REQUIRED','Evidence facts cannot be blank.',400,context.correlationId);
  return apiResponse({ok:true,result:inferRefundLane({clientId,evidence}),auth:{mode:auth.mode,tenantId:auth.tenantId,role:auth.role},disclaimer:'This is an evidence-linked operational inference, not an official IRS determination or delivery guarantee.'},200,context.correlationId);
 }catch(error){return apiError('INVALID_REQUEST',error instanceof Error?error.message:'Invalid request.',400,context.correlationId);}
}
