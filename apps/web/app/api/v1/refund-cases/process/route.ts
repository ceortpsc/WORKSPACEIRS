import {apiError,apiResponse,authorizeOperationalRequest,readJson,requestContext,validateTenantScope} from '../../../../../lib/api';
import {buildRefundReport,runWorkflow,type RefundCase,type RefundState} from '../../../../../lib/refund-case';

const roles=['OWNER_SUPER_ADMIN','PLATFORM_ADMIN','FIRM_ADMIN','ERO_ADMIN','PREPARER','REVIEWER','COMPLIANCE','CLIENT_SERVICE'];

export async function POST(request:Request){
 const context=requestContext(request);const auth=authorizeOperationalRequest(request,{allowSynthetic:true,roles});
 if(!auth.allowed)return apiError(auth.code??'ACCESS_DENIED',auth.message??'Access denied.',auth.httpStatus??403,context.correlationId);
 try{
  const body=await readJson(request);const scopeError=validateTenantScope(auth,body);
  if(scopeError)return apiError('TENANT_OR_SYNTHETIC_SCOPE_DENIED',scopeError,403,context.correlationId);
  const refundCase=body.refundCase as RefundCase|undefined;
  if(!refundCase||typeof refundCase!=='object')return apiError('REFUND_CASE_REQUIRED','refundCase is required.',400,context.correlationId);
  if(refundCase.tenantId!==auth.tenantId)return apiError('TENANT_SCOPE_DENIED','RefundCase tenant does not match the authenticated tenant.',403,context.correlationId);
  if(!refundCase.caseId||!refundCase.taxpayerId||!Number.isInteger(refundCase.taxYear))return apiError('INVALID_REFUND_CASE','caseId, taxpayerId, and taxYear are required.',400,context.correlationId);
  const previousState=typeof body.previousState==='string'?body.previousState as RefundState:undefined;
  const workflow=runWorkflow(refundCase,previousState);
  const report=buildRefundReport(refundCase);
  return apiResponse({ok:true,workflow,report,auth:{mode:auth.mode,tenantId:auth.tenantId,role:auth.role},controls:{externalRetrievalPerformed:false,agencyStateClaimed:false,humanApprovalRequired:workflow.requiresHumanReview}},workflow.caseStatus==='HOLD'?409:200,context.correlationId);
 }catch(error){return apiError('INVALID_REQUEST',error instanceof Error?error.message:'Invalid request.',400,context.correlationId);}
}
