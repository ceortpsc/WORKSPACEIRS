import {apiError,apiResponse,authorizeOperationalRequest,readJson,requestContext,validateTenantScope} from '../../../../../../lib/api';
import {evaluatePrefileIdentityRisk,type IdentityRiskInput} from '../../../../../../lib/identity-risk';

const roles=['OWNER_SUPER_ADMIN','PLATFORM_ADMIN','FIRM_ADMIN','ERO_ADMIN','PREPARER','REVIEWER','COMPLIANCE'];

export async function POST(request:Request){
 const context=requestContext(request);const auth=authorizeOperationalRequest(request,{allowSynthetic:true,roles});
 if(!auth.allowed)return apiError(auth.code??'ACCESS_DENIED',auth.message??'Access denied.',auth.httpStatus??403,context.correlationId);
 try{
  const body=await readJson(request);const scopeError=validateTenantScope(auth,body);
  if(scopeError)return apiError('TENANT_OR_SYNTHETIC_SCOPE_DENIED',scopeError,403,context.correlationId);
  const input=body as unknown as IdentityRiskInput;
  if(typeof input.returnId!=='string'||input.returnId.length<8)return apiError('RETURN_SCOPE_REQUIRED','A non-PII returnId of at least 8 characters is required.',400,context.correlationId);
  if(!Number.isInteger(input.taxYear)||input.taxYear<2010||input.taxYear>2100)return apiError('INVALID_TAX_YEAR','taxYear is outside the supported range.',400,context.correlationId);
  if(!input.taxpayerIdentity||!input.filingSignals||!input.evidence)return apiError('ASSESSMENT_INPUT_REQUIRED','taxpayerIdentity, filingSignals, and evidence are required.',400,context.correlationId);
  const result=evaluatePrefileIdentityRisk(input);
  return apiResponse({ok:true,result,disclaimer:'This assessment reduces avoidable filing risk but cannot guarantee that the IRS will not issue a TPP notice or apply a refund hold.'},result.status==='PASS'?200:409,context.correlationId);
 }catch(error){return apiError('INVALID_REQUEST',error instanceof Error?error.message:'Invalid request.',400,context.correlationId);}
}
