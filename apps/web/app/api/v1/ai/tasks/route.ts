import {apiError,apiResponse,authorizeOperationalRequest,readJson,requestContext,validateTenantScope} from '../../../../../lib/api';
import {createAITask,type RiskTier} from '../../../../../lib/operations';

const personas=['concierge','intake','due_diligence','document_analyst','tds_reconciliation','refund_status','notice_triage','service_order','security_triage','analytics','customer_service','supervisor_router'];
const risks=['low','moderate','high','critical'];
const roles=['OWNER_SUPER_ADMIN','PLATFORM_ADMIN','FIRM_ADMIN','ERO_ADMIN','PREPARER','REVIEWER','COMPLIANCE','CLIENT_SERVICE'];

export async function POST(request:Request){
 const context=requestContext(request);const auth=authorizeOperationalRequest(request,{allowSynthetic:true,roles});
 if(!auth.allowed)return apiError(auth.code??'ACCESS_DENIED',auth.message??'Access denied.',auth.httpStatus??403,context.correlationId);
 try{
  const body=await readJson(request);const scopeError=validateTenantScope(auth,body);
  if(scopeError)return apiError('TENANT_OR_SYNTHETIC_SCOPE_DENIED',scopeError,403,context.correlationId);
  const persona=String(body.persona??'');const instruction=String(body.instruction??'');const riskTier=String(body.riskTier??'low') as RiskTier;
  if(!personas.includes(persona))return apiError('UNKNOWN_PERSONA','persona must be registered in the AI workforce policy.',400,context.correlationId,{personas});
  if(instruction.trim().length<8||instruction.length>4000)return apiError('INVALID_INSTRUCTION','instruction must contain 8 to 4000 characters.',400,context.correlationId);
  if(!risks.includes(riskTier))return apiError('INVALID_RISK_TIER','riskTier must be low, moderate, high, or critical.',400,context.correlationId);
  const result=createAITask({clientId:typeof body.clientId==='string'?body.clientId:undefined,persona,instruction,riskTier});
  return apiResponse({ok:true,result,auth:{mode:auth.mode,tenantId:auth.tenantId,role:auth.role},prohibitedActions:['sign','transmit','represent','change_bank_data','clear_material_hold','make_final_tax_or_legal_decision']},result.state==='HOLD'?409:202,context.correlationId);
 }catch(error){return apiError('INVALID_REQUEST',error instanceof Error?error.message:'Invalid request.',400,context.correlationId);}
}
