export const PLATFORM_VERSION='1.0.0';

export const CONTROL_GATES=[
 'INTAKE','IDENTITY','CONFLICT','ENGAGEMENT','PAYMENT','DOCUMENTS','DUE_DILIGENCE','PREP','REVIEW','CLIENT_APPROVAL','SIGNATURE','TRANSMIT','ACK','DELIVERY','RETENTION'
] as const;

export const TASK_STATES=[
 'REQUESTED','AUTHENTICATED','SCOPED','PRICED_APPROVED','QUEUED','IN_PROGRESS','HUMAN_REVIEW','DELIVERED','ACKNOWLEDGED','RETAINED','NEEDS_INFO','FLAG','HOLD','ESCALATED','CANCELLED','DISENGAGED'
] as const;

export type TaskState=typeof TASK_STATES[number];
export type GateStatus='PASS'|'FLAG'|'HOLD'|'DENY';
export type RiskTier='low'|'moderate'|'high'|'critical';

const normalTransitions:Record<TaskState,TaskState[]>={
 REQUESTED:['AUTHENTICATED','NEEDS_INFO','CANCELLED'],
 AUTHENTICATED:['SCOPED','FLAG','HOLD','CANCELLED'],
 SCOPED:['PRICED_APPROVED','NEEDS_INFO','FLAG','HOLD','CANCELLED'],
 PRICED_APPROVED:['QUEUED','NEEDS_INFO','HOLD','CANCELLED'],
 QUEUED:['IN_PROGRESS','HOLD','CANCELLED'],
 IN_PROGRESS:['HUMAN_REVIEW','NEEDS_INFO','FLAG','HOLD','ESCALATED'],
 HUMAN_REVIEW:['DELIVERED','NEEDS_INFO','FLAG','HOLD','ESCALATED'],
 DELIVERED:['ACKNOWLEDGED','NEEDS_INFO','ESCALATED'],
 ACKNOWLEDGED:['RETAINED','ESCALATED'],
 RETAINED:[],
 NEEDS_INFO:['SCOPED','IN_PROGRESS','CANCELLED'],
 FLAG:['IN_PROGRESS','HUMAN_REVIEW','HOLD','ESCALATED'],
 HOLD:['HUMAN_REVIEW','ESCALATED','CANCELLED'],
 ESCALATED:['HUMAN_REVIEW','HOLD','CANCELLED'],
 CANCELLED:[],
 DISENGAGED:[]
};

export type TransitionRequest={
 from:TaskState;
 to:TaskState;
 taskId?:string;
 riskTier?:RiskTier;
 humanApproved?:boolean;
 approvalToken?:string;
 actorRole?:string;
 reason?:string;
};

export function transitionWorkflow(input:TransitionRequest){
 if(!TASK_STATES.includes(input.from)||!TASK_STATES.includes(input.to)){
  return {allowed:false,status:'DENY' as GateStatus,code:'INVALID_STATE',message:'Unknown workflow state.'};
 }
 if(!normalTransitions[input.from].includes(input.to)){
  return {allowed:false,status:'DENY' as GateStatus,code:'INVALID_TRANSITION',message:`Transition ${input.from} -> ${input.to} is not permitted.`};
 }
 const material=input.from==='HOLD'||input.to==='DELIVERED'||input.to==='RETAINED'||input.riskTier==='high'||input.riskTier==='critical';
 if(material&&(!input.humanApproved||!input.approvalToken)){
  return {allowed:false,status:'HOLD' as GateStatus,code:'HUMAN_APPROVAL_REQUIRED',message:'Material transitions require a qualified human approval and short-lived approval token.'};
 }
 return {
  allowed:true,
  status:'PASS' as GateStatus,
  code:'TRANSITION_APPROVED',
  taskId:input.taskId??`task_${crypto.randomUUID()}`,
  from:input.from,
  to:input.to,
  actorRole:input.actorRole??'system',
  auditEventId:`evt_${crypto.randomUUID()}`,
  timestamp:new Date().toISOString()
 };
}

export type TriggerEvent='INTAKE_SUBMITTED'|'DOCUMENT_UPLOADED'|'SIGNATURE_COMPLETED'|'EFILE_ACK_RECEIVED'|'NOTICE_UPLOADED'|'REFUND_EVIDENCE_ADDED'|'SECURITY_ANOMALY'|'PAYMENT_CONFIRMED';

const triggerMap:Record<TriggerEvent,{tasks:string[];gate:typeof CONTROL_GATES[number];humanReview:boolean}>={
 INTAKE_SUBMITTED:{tasks:['verify_identity','screen_conflict','validate_engagement'],gate:'IDENTITY',humanReview:false},
 DOCUMENT_UPLOADED:{tasks:['malware_scan','classify_document','detect_missing_pages','preserve_original'],gate:'DOCUMENTS',humanReview:false},
 SIGNATURE_COMPLETED:{tasks:['verify_signature_evidence','lock_approved_return','queue_transmission_review'],gate:'SIGNATURE',humanReview:true},
 EFILE_ACK_RECEIVED:{tasks:['correlate_acknowledgment','store_immutable_artifact','route_reject_or_accept','notify_authorized_parties'],gate:'ACK',humanReview:false},
 NOTICE_UPLOADED:{tasks:['classify_notice','extract_apparent_deadline','open_response_workpaper','assign_qualified_reviewer'],gate:'REVIEW',humanReview:true},
 REFUND_EVIDENCE_ADDED:{tasks:['normalize_evidence','infer_refund_lane','calculate_confidence','route_exception'],gate:'DELIVERY',humanReview:false},
 SECURITY_ANOMALY:{tasks:['open_security_incident','preserve_evidence','suspend_material_action','page_security_lead'],gate:'IDENTITY',humanReview:true},
 PAYMENT_CONFIRMED:{tasks:['reconcile_service_order','release_approved_queue','record_payment_evidence'],gate:'PAYMENT',humanReview:false}
};

export function evaluateTrigger(event:TriggerEvent,scope:{tenantId?:string;clientId?:string;caseId?:string}={}){
 const definition=triggerMap[event];
 if(!definition)return {accepted:false,status:'DENY' as GateStatus,code:'UNKNOWN_TRIGGER'};
 return {
  accepted:true,
  status:event==='SECURITY_ANOMALY'?'HOLD' as GateStatus:'PASS' as GateStatus,
  triggerId:`trg_${crypto.randomUUID()}`,
  event,
  gate:definition.gate,
  tasks:definition.tasks.map((task,index)=>({taskId:`${event.toLowerCase()}_${index+1}_${crypto.randomUUID()}`,task,state:event==='SECURITY_ANOMALY'?'HOLD':'QUEUED',humanReviewRequired:definition.humanReview})),
  scope,
  auditEventId:`evt_${crypto.randomUUID()}`,
  timestamp:new Date().toISOString()
 };
}

export type ReconcileItem={code:string;reported?:number|null;observed?:number|null;sourceConfidence?:number;materialityFloor?:number};
const reconcileWeights:Record<string,number>={WAGES:.8,WITHHOLDING:1,SELF_EMPLOYMENT:1.2,ESTIMATED_PAYMENTS:.7,REFUND:.9,OTHER:.6};

export function reconcileMasterfile(input:{clientId:string;taxYear:number;items:ReconcileItem[]}){
 let weighted=0,totalWeight=0;
 const variances=input.items.map(item=>{
  const reported=item.reported??0,observed=item.observed??0,variance=observed-reported;
  const materiality=Math.abs(variance)/Math.max(Math.abs(reported),item.materialityFloor??100);
  const weight=reconcileWeights[item.code.toUpperCase()]??reconcileWeights.OTHER;
  const component=weight*materiality*Math.min(1,Math.max(0,item.sourceConfidence??1));
  weighted+=component;totalWeight+=weight;
  return {code:item.code,reported:item.reported??null,observed:item.observed??null,variance:Number(variance.toFixed(2)),materiality:Number(materiality.toFixed(4)),componentScore:Number(component.toFixed(4))};
 });
 const score=weighted/Math.max(totalWeight,1);
 const status:GateStatus=score>=.4?'HOLD':score>=.15?'FLAG':'PASS';
 return {clientId:input.clientId,taxYear:input.taxYear,score:Number(score.toFixed(4)),status,variances,requiresHumanReview:status!=='PASS',auditEventId:`evt_${crypto.randomUUID()}`};
}

export type RefundEvidence={source:string;observedAt:string;reliability:number;fact:string};
export function inferRefundLane(input:{clientId:string;evidence:RefundEvidence[]}){
 const text=input.evidence.map(item=>item.fact).join(' ').toLowerCase();
 let lane='UNFUNDED',recommendedAction='Continue evidence-based monitoring; do not promise a date.';
 if(/identity|verify identity/.test(text)){lane='IDENTITY_REVIEW';recommendedAction='Route to identity-review guidance and a human reviewer.';}
 else if(/offset|debt/.test(text)){lane='OFFSET_REVIEW';recommendedAction='Explain observed offset evidence and approved agency guidance.';}
 else if(/treasury hold|frozen/.test(text)){lane='TREASURY_HOLD';recommendedAction='Open a manual review and preserve all current evidence.';}
 else if(/deposit scheduled|pending deposit/.test(text)){lane='PENDING_DEPOSIT';recommendedAction='Display the observed deposit status with source and timestamp.';}
 else if(/funded|issued/.test(text)){lane='FUNDED';recommendedAction='Confirm the observed funding event and delivery channel.';}
 else if(/review|additional processing/.test(text)){lane='RISK_REVIEW';recommendedAction='Explain that review is observed or inferred; provide no completion date.';}
 const average=input.evidence.reduce((sum,item)=>sum+Math.min(1,Math.max(0,item.reliability)),0)/Math.max(input.evidence.length,1);
 const confidence=Math.min(.99,Math.max(.25,average*(.65+.05*input.evidence.length)));
 return {clientId:input.clientId,lane,confidence:Number(confidence.toFixed(3)),observedFacts:input.evidence.map(item=>item.fact),recommendedAction,prohibitedLanguage:['Refund guarantees','Specific delivery promises without official evidence','Claims that the firm controls agency processing','Presenting an inference as an official determination'],auditEventId:`evt_${crypto.randomUUID()}`};
}

export function createAITask(input:{clientId?:string;persona:string;instruction:string;riskTier?:RiskTier}){
 const risk=input.riskTier??'low';
 const humanReviewRequired=risk==='high'||risk==='critical';
 return {
  taskId:`ait_${crypto.randomUUID()}`,
  state:risk==='critical'?'HOLD':humanReviewRequired?'HUMAN_REVIEW':'DELIVERABLE_DRAFT',
  humanReviewRequired,
  policyNotes:['AI output is assistive and remains within the assigned persona tool scope.','AI may not sign, transmit, represent, change bank data, or clear a material HOLD.'],
  output:`Draft task created for ${input.persona}.`,
  auditEventId:`evt_${crypto.randomUUID()}`
 };
}

export type IntegrationDefinition={key:string;label:string;category:'core'|'external';enabledFlag:string;configuredFlag:string;authorizationRequired:boolean};
export const integrationDefinitions:IntegrationDefinition[]=[
 {key:'identity',label:'Identity and MFA',category:'core',enabledFlag:'IDENTITY_ENABLED',configuredFlag:'IDENTITY_CONFIGURED',authorizationRequired:false},
 {key:'tenantIsolation',label:'Tenant isolation',category:'core',enabledFlag:'TENANT_ISOLATION_ENABLED',configuredFlag:'TENANT_ISOLATION_CONFIGURED',authorizationRequired:false},
 {key:'database',label:'PostgreSQL data plane',category:'core',enabledFlag:'DATABASE_ENABLED',configuredFlag:'DATABASE_CONFIGURED',authorizationRequired:false},
 {key:'documentVault',label:'Encrypted evidence vault',category:'core',enabledFlag:'DOCUMENT_VAULT_ENABLED',configuredFlag:'DOCUMENT_VAULT_CONFIGURED',authorizationRequired:false},
 {key:'audit',label:'Immutable audit trail',category:'core',enabledFlag:'AUDIT_ENABLED',configuredFlag:'AUDIT_CONFIGURED',authorizationRequired:false},
 {key:'events',label:'Event bus and worker queue',category:'core',enabledFlag:'EVENTS_ENABLED',configuredFlag:'EVENTS_CONFIGURED',authorizationRequired:false},
 {key:'notifications',label:'Email and SMS notifications',category:'external',enabledFlag:'NOTIFICATIONS_ENABLED',configuredFlag:'NOTIFICATIONS_CONFIGURED',authorizationRequired:false},
 {key:'efile',label:'IRS MeF gateway',category:'external',enabledFlag:'IRS_GATEWAY_ENABLED',configuredFlag:'IRS_GATEWAY_CONFIGURED',authorizationRequired:true},
 {key:'tds',label:'IRS TDS',category:'external',enabledFlag:'IRS_TDS_ENABLED',configuredFlag:'IRS_TDS_CONFIGURED',authorizationRequired:true},
 {key:'sor',label:'IRS SOR',category:'external',enabledFlag:'IRS_SOR_ENABLED',configuredFlag:'IRS_SOR_CONFIGURED',authorizationRequired:true},
 {key:'tinMatching',label:'IRS TIN Matching',category:'external',enabledFlag:'IRS_TIN_MATCHING_ENABLED',configuredFlag:'IRS_TIN_MATCHING_CONFIGURED',authorizationRequired:true},
 {key:'iris',label:'IRS IRIS',category:'external',enabledFlag:'IRS_IRIS_ENABLED',configuredFlag:'IRS_IRIS_CONFIGURED',authorizationRequired:true},
 {key:'payroll',label:'Payroll engine',category:'external',enabledFlag:'PAYROLL_ENGINE_ENABLED',configuredFlag:'PAYROLL_ENGINE_CONFIGURED',authorizationRequired:false},
 {key:'payments',label:'Payment processor',category:'external',enabledFlag:'PAYMENTS_ENABLED',configuredFlag:'PAYMENTS_CONFIGURED',authorizationRequired:false},
 {key:'apple',label:'Apple release pipeline',category:'external',enabledFlag:'APPLE_RELEASE_ENABLED',configuredFlag:'APPLE_RELEASE_CONFIGURED',authorizationRequired:true}
];

const envTrue=(name:string)=>process.env[name]?.toLowerCase()==='true';
export function getIntegrationRegistry(){
 return integrationDefinitions.map(definition=>{
  const enabled=envTrue(definition.enabledFlag),configured=envTrue(definition.configuredFlag);
  return {...definition,enabled,configured,status:enabled?(configured?'ready':'misconfigured'):definition.authorizationRequired?'disabled_pending_authorization':'disabled_pending_configuration'};
 });
}

export function getRuntimeInfo(){
 return {
  environment:process.env.DEPLOYMENT_STAGE??process.env.NEXT_PUBLIC_DEPLOY_ENV??process.env.AWS_BRANCH??'local',
  version:process.env.APP_VERSION??PLATFORM_VERSION,
  commit:process.env.BUILD_COMMIT??process.env.AWS_COMMIT_ID??process.env.COMMIT_SHA??'unavailable'
 };
}
