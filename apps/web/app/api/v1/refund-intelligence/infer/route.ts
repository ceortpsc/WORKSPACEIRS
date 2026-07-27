import {apiError,apiResponse,readJson,requestContext} from '../../../../../lib/api';
import {inferRefundLane,type RefundEvidence} from '../../../../../lib/operations';

export async function POST(request:Request){
 const context=requestContext(request);
 try{
  const body=await readJson(request);const clientId=String(body.clientId??'');const rawEvidence=Array.isArray(body.evidence)?body.evidence:[];
  if(clientId.length<8)return apiError('CLIENT_SCOPE_REQUIRED','A non-PII internal clientId of at least 8 characters is required.',400,context.correlationId);
  if(rawEvidence.length===0)return apiError('EVIDENCE_REQUIRED','At least one evidence observation is required.',400,context.correlationId);
  const evidence:RefundEvidence[]=rawEvidence.map(raw=>{const item=raw as Record<string,unknown>;return {source:String(item.source??'unknown'),observedAt:String(item.observedAt??new Date().toISOString()),reliability:typeof item.reliability==='number'?item.reliability:.5,fact:String(item.fact??'')};}).filter(item=>item.fact.trim().length>0);
  if(evidence.length===0)return apiError('VALID_EVIDENCE_REQUIRED','Evidence facts cannot be blank.',400,context.correlationId);
  return apiResponse({ok:true,result:inferRefundLane({clientId,evidence}),disclaimer:'This is an evidence-linked operational inference, not an official IRS determination or delivery guarantee.'},200,context.correlationId);
 }catch(error){return apiError('INVALID_REQUEST',error instanceof Error?error.message:'Invalid request.',400,context.correlationId);}
}
