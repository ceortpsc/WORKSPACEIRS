import {NextRequest} from 'next/server';
import {apiError,apiResponse,authorizeOperationalRequest,readJson,requestContext,validateTenantScope} from '../../../../../../lib/api';
import type {RefundCase,RefundState} from '../../../../../../lib/refund-case';
import {synchronizeMasterfiles} from '../../../../../../lib/masterfile-sync';

export const dynamic='force-dynamic';
const roles=['OWNER_SUPER_ADMIN','ERO_ADMIN','REVIEWER','PREPARER','COMPLIANCE_OFFICER'];

export async function POST(request:NextRequest){
 const context=requestContext(request);const auth=authorizeOperationalRequest(request,{allowSynthetic:true,roles});
 if(!auth.allowed)return apiError(auth.code??'ACCESS_DENIED',auth.message??'Access denied.',auth.httpStatus??403,context.correlationId);
 try{
  const payload=await readJson(request);const tenantError=validateTenantScope(auth,payload);if(tenantError)return apiError('TENANT_SCOPE_MISMATCH',tenantError,403,context.correlationId);
  const cases=Array.isArray(payload.cases)?payload.cases as RefundCase[]:[];
  if(!cases.length)return apiError('REFUND_CASES_REQUIRED','At least one RefundCase is required.',400,context.correlationId);
  if(cases.length>500)return apiError('BATCH_LIMIT_EXCEEDED','A maximum of 500 RefundCases may be synchronized per request.',400,context.correlationId);
  if(cases.some(item=>!item||typeof item!=='object'||item.tenantId!==auth.tenantId))return apiError('CASE_TENANT_MISMATCH','Every RefundCase must match the authenticated tenant.',403,context.correlationId);
  if(cases.some(item=>!item.caseId||!item.taxpayerId||!Number.isInteger(item.taxYear)))return apiError('INVALID_REFUND_CASE','Each RefundCase requires caseId, taxpayerId, and integer taxYear.',400,context.correlationId);
  const previousStates=(payload.previousStates&&typeof payload.previousStates==='object'&&!Array.isArray(payload.previousStates)?payload.previousStates:{}) as Record<string,RefundState>;
  const snapshots=synchronizeMasterfiles(cases,previousStates);
  return apiResponse({ok:true,synchronized:snapshots.length,received:cases.length,snapshots,controls:{authorizedDownstreamOnly:true,externalRetrievalPerformed:false,agencyStateClaimed:false,humanReviewPreserved:true}},200,context.correlationId);
 }catch(error){return apiError('REFUND_SYNC_FAILED',error instanceof Error?error.message:'Refund masterfile synchronization failed.',400,context.correlationId);}
}
