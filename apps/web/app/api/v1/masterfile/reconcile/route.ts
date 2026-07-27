import {apiError,apiResponse,readJson,requestContext} from '../../../../../lib/api';
import {reconcileMasterfile,type ReconcileItem} from '../../../../../lib/operations';

export async function POST(request:Request){
 const context=requestContext(request);
 try{
  const body=await readJson(request);const clientId=String(body.clientId??'');const taxYear=Number(body.taxYear);const rawItems=Array.isArray(body.items)?body.items:[];
  if(clientId.length<8)return apiError('CLIENT_SCOPE_REQUIRED','A non-PII internal clientId of at least 8 characters is required.',400,context.correlationId);
  if(!Number.isInteger(taxYear)||taxYear<2010||taxYear>2100)return apiError('INVALID_TAX_YEAR','taxYear is outside the supported contract range.',400,context.correlationId);
  if(rawItems.length===0)return apiError('RECONCILE_ITEMS_REQUIRED','At least one reported-versus-observed item is required.',400,context.correlationId);
  const items:ReconcileItem[]=rawItems.map(raw=>{const item=raw as Record<string,unknown>;return {code:String(item.code??'OTHER'),reported:typeof item.reported==='number'?item.reported:null,observed:typeof item.observed==='number'?item.observed:null,sourceConfidence:typeof item.sourceConfidence==='number'?item.sourceConfidence:1,materialityFloor:typeof item.materialityFloor==='number'?item.materialityFloor:100};});
  const result=reconcileMasterfile({clientId,taxYear,items});
  return apiResponse({ok:true,result,disclaimer:'This compares authorized observations to practitioner records; it does not claim direct access to the IRS internal Master File.'},200,context.correlationId);
 }catch(error){return apiError('INVALID_REQUEST',error instanceof Error?error.message:'Invalid request.',400,context.correlationId);}
}
