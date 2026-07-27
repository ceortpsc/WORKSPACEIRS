import {apiError,apiResponse,readJson,requestContext} from '../../../../../lib/api';
import {evaluateTrigger,type TriggerEvent} from '../../../../../lib/operations';

const events=['INTAKE_SUBMITTED','DOCUMENT_UPLOADED','SIGNATURE_COMPLETED','EFILE_ACK_RECEIVED','NOTICE_UPLOADED','REFUND_EVIDENCE_ADDED','SECURITY_ANOMALY','PAYMENT_CONFIRMED'] as const;

export async function POST(request:Request){
 const context=requestContext(request);
 try{
  const body=await readJson(request);const event=String(body.event??'') as TriggerEvent;
  if(!events.includes(event))return apiError('UNKNOWN_TRIGGER','event must be a registered trigger.',400,context.correlationId,{registeredEvents:events});
  const scope=body.scope&&typeof body.scope==='object'&&!Array.isArray(body.scope)?body.scope as Record<string,unknown>:{};
  const result=evaluateTrigger(event,{tenantId:typeof scope.tenantId==='string'?scope.tenantId:undefined,clientId:typeof scope.clientId==='string'?scope.clientId:undefined,caseId:typeof scope.caseId==='string'?scope.caseId:undefined});
  return apiResponse({ok:result.accepted,result},result.accepted?202:400,context.correlationId);
 }catch(error){return apiError('INVALID_REQUEST',error instanceof Error?error.message:'Invalid request.',400,context.correlationId);}
}
