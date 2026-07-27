import {apiError,apiResponse,authorizeOperationalRequest,readJson,requestContext,validateTenantScope} from '../../../../../lib/api';
import {reconcileMasterfile,type ReconcileItem} from '../../../../../lib/operations';

const roles=['OWNER_SUPER_ADMIN','PLATFORM_ADMIN','FIRM_ADMIN','ERO_ADMIN','PREPARER','REVIEWER','COMPLIANCE'];

export async function POST(request:Request){
 const context=requestContext(request);const auth=authorizeOperationalRequest(request,{allowSynthetic:true,roles});
 if(!auth.allowed)return apiError(auth.code??'ACCESS_DENIED',auth.message??'Access denied.',auth.httpStatus??403,context.correlationId);
 try{
  const body=await readJson(request);const scopeError=validateTenantScope(auth,body);
  if(scopeError)return apiError('TENANT_OR_SYNTHETIC_SCOPE_DENIED',scopeError,403,context.correlationId);
  const clientId=String(body.clientId??'');const taxYear=Number(body.taxYear);const rawItems=Array.isArray(body.items)?body.items:[];
  if(clientId.length<8)return apiError('CLIENT_SCOPE_REQUIRED','A non-PII internal clientId of at least 8 characters is required.',400,context.correlationId);
  if(!Number.isInteger(taxYear)||taxYear<2010||taxYear>2100)return apiError('INVALID_TAX_YEAR','taxYear is outside the supported contract range.',400,context.correlationId);
  if(rawItems.length===0)return apiError('RECONCILE_ITEMS_REQUIRED','At least one reported-versus-observed item is required.',400,context.correlationId);
  const items:ReconcileItem[]=rawItems.map(raw=>{const item=raw as Record<string,unknown>;return {code:String(item.code??'OTHER'),reported:typeof item.reported==='number'?item.reported:null,observed:typeof item.observed==='number'?item.observed:null,sourceConfidence:typeof item.sourceConfidence==='number'?item.sourceConfidence:1,materialityFloor:typeof item.materialityFloor==='number'?item.materialityFloor:100};});
  const result=reconcileMasterfile({clientId,taxYear,items});
  return apiResponse({ok:true,result,auth:{mode:auth.mode,tenantId:auth.tenantId,role:auth.role},disclaimer:'This compares authorized observations to practitioner records; it does not claim direct access to the IRS internal Master File.'},200,context.correlationId);
 }catch(error){return apiError('INVALID_REQUEST',error instanceof Error?error.message:'Invalid request.',400,context.correlationId);}
}
