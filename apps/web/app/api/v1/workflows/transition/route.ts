import {apiError,apiResponse,readJson,requestContext} from '../../../../../lib/api';
import {TASK_STATES,transitionWorkflow,type RiskTier,type TaskState} from '../../../../../lib/operations';

export async function POST(request:Request){
 const context=requestContext(request);
 try{
  const body=await readJson(request);const from=String(body.from??'') as TaskState;const to=String(body.to??'') as TaskState;
  if(!TASK_STATES.includes(from)||!TASK_STATES.includes(to))return apiError('INVALID_STATE','from and to must be registered workflow states.',400,context.correlationId);
  const decision=transitionWorkflow({from,to,taskId:typeof body.taskId==='string'?body.taskId:undefined,riskTier:(typeof body.riskTier==='string'?body.riskTier:'low') as RiskTier,humanApproved:body.humanApproved===true,approvalToken:context.approvalToken??(typeof body.approvalToken==='string'?body.approvalToken:undefined),actorRole:typeof body.actorRole==='string'?body.actorRole:undefined,reason:typeof body.reason==='string'?body.reason:undefined});
  return apiResponse({ok:decision.allowed,decision},decision.allowed?200:decision.status==='HOLD'?409:400,context.correlationId);
 }catch(error){return apiError('INVALID_REQUEST',error instanceof Error?error.message:'Invalid request.',400,context.correlationId);}
}
