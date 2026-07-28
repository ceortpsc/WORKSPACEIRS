export type SourceSystem='IRS_TDS'|'IRS_ONLINE_ACCOUNT'|'TREASURY_BFS'|'TREASURY_TOP'|'TREASURY_DMS'|'BANK_SBTPG'|'BANK_EPS'|'BANK_REFUNDO'|'TAXSLAYER_PRO'|'CLOUD_TAX_OFFICE'|'IDENTITY_PROVIDER'|'OTHER';
export type EvidenceType='TRANSCRIPT'|'TREASURY_PAYMENT'|'NOTICE'|'BANK_PRODUCT'|'RETURN'|'IDENTITY'|'AUTHORIZATION';
export type Station='S0_INTAKE'|'S1_IDENTITY'|'S2_TRANSCRIPT'|'S3_TREASURY'|'S4_NOTICE'|'S5_CLIENT'|'S6_COMPLIANCE';
export type Trigger='CASE_CREATED'|'AUTH_SCOPE_UPDATED'|'IDENTITY_VERIFIED'|'RISK_ELEVATED'|'TRANSCRIPT_RECEIVED'|'TREASURY_EVENT'|'BANK_PRODUCT_EVENT'|'NOTICE_UPLOADED'|'REFUND_STATE_CHANGED'|'NOTICE_DEADLINE_APPROACHING'|'CASE_CLOSED';

export type EvidenceEnvelope={id:string;sourceSystem:SourceSystem;evidenceType:EvidenceType;receivedAt:string;authorizationRef:string;scopeTags:string[];rawPayloadRef:string;sha256?:string};
export type TransactionCode={code:string;date:string;amount?:number;description?:string};
export type TranscriptEvent={id:string;taxpayerId:string;taxYear:number;moduleType:'IMF'|'BMF'|'OTHER';transactionCodes:TransactionCode[];accountBalance?:number;refundAmount?:number;penalties?:number;interest?:number;statusFlags?:string[]};
export type TreasuryEvent={id:string;taxpayerId:string;taxYear:number;paymentTraceId?:string;amount?:number;paymentDate?:string;paymentChannel?:'DIRECT_DEPOSIT'|'CHECK'|'OTHER';offsets?:{amount:number;agency:string;reason?:string}[];status:'SCHEDULED'|'ISSUED'|'RETURNED'|'OFFSET'|'UNKNOWN'};
export type RefundEvent={id:string;taxpayerId:string;taxYear:number;productId?:string;bankPartner:'SBTPG'|'EPS'|'REFUNDO'|'OTHER';amount?:number;fundedAt?:string;disbursedAt?:string;fees?:number;status:'APPROVED'|'FUNDED'|'DISBURSED'|'REJECTED'|'RETURNED'|'PENDING'};
export type NoticeEvent={id:string;taxpayerId:string;taxYear:number;noticeId:string;noticeType:string;issueDate:string;responseDeadline?:string;balanceImpacted?:number;penalties?:number;proposedChanges?:string;status:'OPEN'|'RESPONDED'|'RESOLVED'|'CLOSED'};
export type IdentityEvent={id:string;taxpayerId:string;identityProvider:string;verificationResult:'VERIFIED'|'FAILED'|'MANUAL_REVIEW';riskScore?:number;methods?:string[];status:'VERIFIED'|'FAILED'|'PENDING'|'MANUAL_REVIEW'};
export type ReturnEvent={id:string;taxpayerId:string;taxYear:number;softwareSystem:string;efileId?:string;filingStatus?:string;transmissionDate?:string;acceptanceStatus:'DRAFT'|'TRANSMITTED'|'ACCEPTED'|'REJECTED'|'PENDING';refundOrBalanceDue?:number;paymentMethod?:string};
export type AuthorizationEvent={id:string;taxpayerId:string;formType:'FORM_8821'|'FORM_2848'|'FORM_8655'|'ENGAGEMENT'|'OTHER';effectiveDate:string;expirationDate?:string;scope:{taxYears:number[];forms:string[]};status:'ACTIVE'|'REVOKED'|'EXPIRED'|'PENDING'};

export type RefundCase={
 caseId:string;tenantId:string;taxpayerId:string;taxYear:number;currentStation:Station;status:'OPEN'|'HOLD'|'CLOSED';
 evidence:EvidenceEnvelope[];transcripts:TranscriptEvent[];treasury:TreasuryEvent[];refundProducts:RefundEvent[];notices:NoticeEvent[];identities:IdentityEvent[];returns:ReturnEvent[];authorizations:AuthorizationEvent[];
 audit:{timestamp:string;actor:string;event:string;details:string}[];
};

export type RefundState='NO_RETURN_EVENT'|'RETURN_DRAFT'|'RETURN_TRANSMITTED'|'RETURN_REJECTED'|'RETURN_ACCEPTED'|'IRS_REVIEW_OBSERVED'|'REFUND_ISSUED_OBSERVED'|'TREASURY_SCHEDULED'|'TREASURY_ISSUED'|'TREASURY_RETURNED'|'OFFSET_OBSERVED'|'BANK_FUNDED'|'BANK_DISBURSED'|'CONFLICT'|'INSUFFICIENT_EVIDENCE';

export const routing:Record<Station,Partial<Record<Trigger,Station[]>>>={
 S0_INTAKE:{CASE_CREATED:['S1_IDENTITY'],AUTH_SCOPE_UPDATED:['S2_TRANSCRIPT']},
 S1_IDENTITY:{IDENTITY_VERIFIED:['S2_TRANSCRIPT'],RISK_ELEVATED:['S6_COMPLIANCE']},
 S2_TRANSCRIPT:{TRANSCRIPT_RECEIVED:['S3_TREASURY','S4_NOTICE'],NOTICE_UPLOADED:['S4_NOTICE']},
 S3_TREASURY:{TREASURY_EVENT:['S5_CLIENT'],BANK_PRODUCT_EVENT:['S5_CLIENT','S6_COMPLIANCE'],REFUND_STATE_CHANGED:['S5_CLIENT']},
 S4_NOTICE:{NOTICE_UPLOADED:['S4_NOTICE'],NOTICE_DEADLINE_APPROACHING:['S4_NOTICE','S5_CLIENT']},
 S5_CLIENT:{REFUND_STATE_CHANGED:[],CASE_CLOSED:[]},
 S6_COMPLIANCE:{RISK_ELEVATED:['S5_CLIENT'],TREASURY_EVENT:['S3_TREASURY']}
};

export function activeAuthorization(refundCase:RefundCase){
 const now=Date.now();
 return refundCase.authorizations.some(a=>a.status==='ACTIVE'&&a.scope.taxYears.includes(refundCase.taxYear)&&(!a.expirationDate||new Date(a.expirationDate).getTime()>=now));
}

export function reconcileRefundCase(refundCase:RefundCase){
 const accepted=refundCase.returns.find(e=>e.acceptanceStatus==='ACCEPTED');
 const rejected=refundCase.returns.find(e=>e.acceptanceStatus==='REJECTED');
 const transmitted=refundCase.returns.find(e=>e.acceptanceStatus==='TRANSMITTED');
 const tc=(code:string)=>refundCase.transcripts.flatMap(t=>t.transactionCodes.map(x=>({...x,evidenceId:t.id}))).find(x=>x.code===code);
 const tc846=tc('846'),tc570=tc('570'),tc810=tc('810');
 const treasuryIssued=refundCase.treasury.find(e=>e.status==='ISSUED');
 const treasuryScheduled=refundCase.treasury.find(e=>e.status==='SCHEDULED');
 const treasuryReturned=refundCase.treasury.find(e=>e.status==='RETURNED');
 const offset=refundCase.treasury.find(e=>e.status==='OFFSET');
 const bankDisbursed=refundCase.refundProducts.find(e=>e.status==='DISBURSED');
 const bankFunded=refundCase.refundProducts.find(e=>e.status==='FUNDED');
 const facts:string[]=[];const conflicts:string[]=[];const evidenceIds:string[]=[];
 let state:RefundState='INSUFFICIENT_EVIDENCE';let confidence=0;let humanReviewRequired=true;
 if(rejected&&!accepted){state='RETURN_REJECTED';confidence=1;humanReviewRequired=true;facts.push('Tax software reported a rejected return.');evidenceIds.push(rejected.id);}
 else if(bankDisbursed&&treasuryReturned){state='CONFLICT';confidence=.95;conflicts.push('Bank provider reports disbursement while Treasury evidence reports returned payment.');evidenceIds.push(bankDisbursed.id,treasuryReturned.id);}
 else if(bankDisbursed){state='BANK_DISBURSED';confidence=.95;humanReviewRequired=false;facts.push('Bank-product provider reported client disbursement.');evidenceIds.push(bankDisbursed.id);}
 else if(bankFunded){state='BANK_FUNDED';confidence=.9;humanReviewRequired=false;facts.push('Bank-product provider reported funded status.');evidenceIds.push(bankFunded.id);}
 else if(offset){state='OFFSET_OBSERVED';confidence=1;facts.push('Treasury evidence reported an offset.');evidenceIds.push(offset.id);}
 else if(treasuryReturned){state='TREASURY_RETURNED';confidence=1;facts.push('Treasury evidence reported a returned payment.');evidenceIds.push(treasuryReturned.id);}
 else if(treasuryIssued){state='TREASURY_ISSUED';confidence=1;humanReviewRequired=false;facts.push('Treasury evidence reported payment issued.');evidenceIds.push(treasuryIssued.id);}
 else if(treasuryScheduled){state='TREASURY_SCHEDULED';confidence=1;humanReviewRequired=false;facts.push('Treasury evidence reported payment scheduled.');evidenceIds.push(treasuryScheduled.id);}
 else if(tc846){state='REFUND_ISSUED_OBSERVED';confidence=1;humanReviewRequired=false;facts.push(`Authorized transcript contained TC 846 dated ${tc846.date}.`);evidenceIds.push(tc846.evidenceId);}
 else if(tc570||tc810){state='IRS_REVIEW_OBSERVED';confidence=1;facts.push(...(tc570?[`Authorized transcript contained TC 570 dated ${tc570.date}.`]:[]),...(tc810?[`Authorized transcript contained TC 810 dated ${tc810.date}.`]:[]));evidenceIds.push(...(tc570?[tc570.evidenceId]:[]),...(tc810?[tc810.evidenceId]:[]));}
 else if(accepted){state='RETURN_ACCEPTED';confidence=1;humanReviewRequired=false;facts.push('Tax software reported IRS acceptance.');evidenceIds.push(accepted.id);}
 else if(transmitted){state='RETURN_TRANSMITTED';confidence=1;humanReviewRequired=false;facts.push('Tax software reported transmission.');evidenceIds.push(transmitted.id);}
 else if(refundCase.returns.length){state='RETURN_DRAFT';confidence=1;humanReviewRequired=false;facts.push('Return event exists but no transmission or acceptance event was observed.');evidenceIds.push(refundCase.returns[0].id);}
 return {state,confidence,observedFacts:facts,conflicts,controllingEvidenceIds:[...new Set(evidenceIds)],humanReviewRequired,officialAgencyDetermination:false as const};
}

export function deriveTriggers(refundCase:RefundCase,previousState?:RefundState):Trigger[]{
 const triggers:Trigger[]=[];
 if(refundCase.identities.some(i=>i.status==='VERIFIED'))triggers.push('IDENTITY_VERIFIED');
 if(refundCase.identities.some(i=>(i.riskScore??0)>=.75||i.status==='FAILED'))triggers.push('RISK_ELEVATED');
 if(refundCase.transcripts.length)triggers.push('TRANSCRIPT_RECEIVED');
 if(refundCase.treasury.length)triggers.push('TREASURY_EVENT');
 if(refundCase.refundProducts.length)triggers.push('BANK_PRODUCT_EVENT');
 if(refundCase.notices.length)triggers.push('NOTICE_UPLOADED');
 if(!activeAuthorization(refundCase))triggers.push('AUTH_SCOPE_UPDATED');
 const state=reconcileRefundCase(refundCase).state;
 if(previousState&&previousState!==state)triggers.push('REFUND_STATE_CHANGED');
 if(refundCase.notices.some(n=>n.status==='OPEN'&&n.responseDeadline&&((new Date(n.responseDeadline).getTime()-Date.now())/86400000)<=7))triggers.push('NOTICE_DEADLINE_APPROACHING');
 if(refundCase.status==='CLOSED')triggers.push('CASE_CLOSED');
 return [...new Set(triggers)];
}

export function runWorkflow(refundCase:RefundCase,previousState?:RefundState){
 const triggers=deriveTriggers(refundCase,previousState);
 const routes=triggers.flatMap(trigger=>(routing[refundCase.currentStation][trigger]??[]).map(target=>({trigger,from:refundCase.currentStation,to:target,actions:actionsForTrigger(trigger)})));
 const result=reconcileRefundCase(refundCase);
 const hold=!activeAuthorization(refundCase)||result.state==='CONFLICT'||result.humanReviewRequired&&['IRS_REVIEW_OBSERVED','OFFSET_OBSERVED','TREASURY_RETURNED'].includes(result.state);
 return {triggers,routes,reconciliation:result,caseStatus:hold?'HOLD':refundCase.status,requiresHumanReview:hold||result.humanReviewRequired};
}

function actionsForTrigger(trigger:Trigger){
 const map:Record<Trigger,string[]>={CASE_CREATED:['CREATE_CASE_SHELL','CREATE_AUTHORIZATION_REGISTRY'],AUTH_SCOPE_UPDATED:['LOCK_SCOPE_RETRIEVALS','REQUEST_AUTHORIZATION_RENEWAL'],IDENTITY_VERIFIED:['UNLOCK_AUTHORIZED_WORKFLOWS'],RISK_ELEVATED:['PLACE_MATERIAL_ACTION_HOLD','CREATE_COMPLIANCE_REVIEW'],TRANSCRIPT_RECEIVED:['VALIDATE_SCHEMA','REBUILD_ACCOUNT_TIMELINE','RECONCILE_REFUND'],TREASURY_EVENT:['NORMALIZE_TREASURY_EVENT','RECONCILE_REFUND'],BANK_PRODUCT_EVENT:['NORMALIZE_BANK_EVENT','RECONCILE_BANK_VS_TREASURY'],NOTICE_UPLOADED:['CLASSIFY_NOTICE','CREATE_NOTICE_WORKPAPER'],REFUND_STATE_CHANGED:['GENERATE_CLIENT_SAFE_NARRATIVE','GENERATE_REFUND_REPORT'],NOTICE_DEADLINE_APPROACHING:['CREATE_URGENT_TASK','ESCALATE_SUPERVISOR'],CASE_CLOSED:['FREEZE_EVIDENCE_MANIFEST','GENERATE_FINAL_AUDIT_REPORT','APPLY_RETENTION_POLICY']};
 return map[trigger];
}

export function buildRefundReport(refundCase:RefundCase){
 const workflow=runWorkflow(refundCase);
 const timeline=[
  ...refundCase.returns.map(e=>({source:e.softwareSystem,eventType:`RETURN_${e.acceptanceStatus}`,eventDate:e.transmissionDate??refundCase.evidence.find(x=>x.id===e.id)?.receivedAt??'',description:`Return status observed: ${e.acceptanceStatus}.`,evidenceRef:e.id})),
  ...refundCase.transcripts.flatMap(t=>t.transactionCodes.map(code=>({source:'IRS_TDS',eventType:`TC_${code.code}`,eventDate:code.date,description:`Authorized transcript event TC ${code.code} observed.`,evidenceRef:t.id}))),
  ...refundCase.treasury.map(e=>({source:'TREASURY',eventType:`PAYMENT_${e.status}`,eventDate:e.paymentDate??'',description:`Treasury payment status observed: ${e.status}.`,evidenceRef:e.id})),
  ...refundCase.refundProducts.map(e=>({source:e.bankPartner,eventType:`BANK_${e.status}`,eventDate:e.disbursedAt??e.fundedAt??'',description:`Bank-product status observed: ${e.status}.`,evidenceRef:e.id}))
 ].filter(e=>e.eventDate).sort((a,b)=>a.eventDate.localeCompare(b.eventDate)).map((e,index)=>({sequence:index+1,...e}));
 return {
  reportType:'REFUND_LIFECYCLE_EVIDENCE_REPORT',version:'1.0.0',branding:{firmName:'ROSS TAX PRO SOFTWARE CO / 254 TAX CONSULTANTS',platformName:'WORKSPACEIRS',primaryColor:'#001F3F',secondaryColor:'#F5F7FA'},
  caseContext:{caseId:refundCase.caseId,taxpayerMaskedId:maskTaxpayer(refundCase.taxpayerId),taxYear:refundCase.taxYear,createdAt:new Date().toISOString(),preparedBy:'RTPSC Operations Fabric'},
  authorizationScope:{authorizations:refundCase.authorizations,scopeStatement:activeAuthorization(refundCase)?`This report covers refund lifecycle evidence for tax year ${refundCase.taxYear} under active authorization.`:`Authorization scope is inactive or incomplete for tax year ${refundCase.taxYear}.`},
  evidenceInventory:{items:refundCase.evidence.map(e=>({evidenceEnvelopeId:e.id,sourceSystem:e.sourceSystem,evidenceType:e.evidenceType,receivedAt:e.receivedAt,authorizationRef:e.authorizationRef,sha256:e.sha256??null}))},
  refundTimeline:{events:timeline,derivedState:{refundStatus:workflow.reconciliation.state,lastEventDate:timeline.at(-1)?.eventDate??null,hasOffsets:refundCase.treasury.some(e=>e.status==='OFFSET'),hasReturns:refundCase.treasury.some(e=>e.status==='RETURNED')}},
  conflictsAndRisk:{conflicts:workflow.reconciliation.conflicts,riskFlags:workflow.requiresHumanReview?[{ruleId:'R.REFUND.REVIEW',severity:'HIGH',description:'Human review required before client communication or case closure.'}]:[{ruleId:'R.REFUND.CLEAR',severity:'LOW',description:'No unresolved workflow hold detected.'}]},
  decisionsAndRecommendations:{caseState:{refundStatus:workflow.reconciliation.state,investigationRequired:workflow.requiresHumanReview},recommendations:recommendations(workflow.reconciliation.state)},
  workflow:{triggers:workflow.triggers,routes:workflow.routes,caseStatus:workflow.caseStatus},
  auditTrail:{logEntries:[...refundCase.audit,{timestamp:new Date().toISOString(),actor:'SYSTEM',event:'RECONCILIATION_COMPLETED',details:`Refund lifecycle state set to ${workflow.reconciliation.state}.`},{timestamp:new Date().toISOString(),actor:'SYSTEM',event:'REPORT_MODEL_GENERATED',details:'Refund Lifecycle Evidence Report model generated.'}]},
  disclaimer:'This report summarizes authorized evidence and internal reconciliation. It is not an official IRS, Treasury, or bank determination and does not guarantee a refund date or outcome.'
 };
}

function recommendations(state:RefundState){
 const common={id:'REC-PRACTITIONER-001',audience:'PRACTITIONER',text:'Review controlling evidence and archive the finalized report with the engagement file.'};
 const byState:Partial<Record<RefundState,string>>={BANK_DISBURSED:'Available bank-product evidence indicates client disbursement. Confirm delivery evidence before closing the case.',BANK_FUNDED:'Bank-product evidence indicates funded status. Continue monitoring for disbursement confirmation.',TREASURY_ISSUED:'Treasury evidence indicates payment issued. Continue approved downstream monitoring; do not promise a bank posting date.',REFUND_ISSUED_OBSERVED:'An authorized transcript shows a refund-issued transaction. Continue monitoring approved Treasury or bank channels.',IRS_REVIEW_OBSERVED:'A refund-hold or additional-action indicator was observed. Route to qualified practitioner review and avoid delivery-date predictions.',OFFSET_OBSERVED:'Treasury offset evidence was observed. Review the controlling evidence and approved taxpayer guidance.',CONFLICT:'Evidence sources conflict. Maintain HOLD and escalate to compliance.'};
 return [{id:'REC-CLIENT-001',audience:'CLIENT',text:byState[state]??'Current evidence is insufficient for a final refund status. Additional authorized evidence or practitioner review is required.'},common];
}

function maskTaxpayer(value:string){return value.length<=4?'***':`***${value.slice(-4)}`;}
