export const PROFET_PLAN={
 code:'PROFET-IAPP-ANNUAL',
 name:'PROFET Internal Audit Protection Program',
 annualPriceCents:8999,
 billingInterval:'annual' as const,
 currency:'USD',
 renewal:'manual_or_authorized_auto_renewal' as const,
 status:'implemented_contract' as const,
 description:'An internal preparation-quality, documentation, notice-readiness, and audit-support add-on for eligible tax engagements.',
 disclaimers:[
  'This is not insurance and does not guarantee that a return will not be examined, adjusted, delayed, rejected, or subject to penalties or interest.',
  'The plan does not itself create Form 2848 or Form 8821 authority and does not authorize representation before the IRS.',
  'Coverage is subject to eligibility, source-document completeness, timely client cooperation, signed engagement terms, and human review.',
  'Government notices, deadlines, payment obligations, and appeal rights remain controlled by applicable law and official agency correspondence.'
 ]
};

export type ProfetPersonaId='intake_guardian'|'identity_risk_analyst'|'income_reconciler'|'credit_deduction_reviewer'|'workpaper_auditor'|'citation_researcher'|'notice_triage'|'ero_compliance_monitor'|'client_explainer'|'supervisor_router';

export type ProfetPersona={
 id:ProfetPersonaId;
 name:string;
 mission:string;
 allowedActions:string[];
 prohibitedActions:string[];
 humanReviewTriggers:string[];
};

const universalProhibitions=[
 'May not sign a return, authorization, response, affidavit, or representation document.',
 'May not transmit a return or communicate with the IRS as the taxpayer or practitioner.',
 'May not invent facts, source documents, citations, eligibility, expenses, dependents, credits, or deductions.',
 'May not override a HOLD, alter banking instructions, or promise an audit, refund, penalty, or collection outcome.'
];

export const profetPersonas:ProfetPersona[]=[
 {id:'intake_guardian',name:'Intake Guardian',mission:'Detect missing engagement, identity, consent, deadline, and source-document requirements before preparation begins.',allowedActions:['Create missing-item tasks','Classify intake completeness','Draft client-safe requests'],prohibitedActions:universalProhibitions,humanReviewTriggers:['Identity mismatch','Expired authorization','Conflicting filing status or dependent facts']},
 {id:'identity_risk_analyst',name:'Identity Risk Analyst',mission:'Evaluate TPP, duplicate-return, IP PIN, bank ownership, and taxpayer-identity risk indicators.',allowedActions:['Run pre-file identity assessment','Recommend internal HOLD','Create enhanced verification checklist'],prohibitedActions:universalProhibitions,humanReviewTriggers:['4883C/5071C family notice','TC 570/810','Duplicate return','Tax ID mismatch']},
 {id:'income_reconciler',name:'Income Reconciler',mission:'Reconcile W-2, 1099, K-1, transcript, and taxpayer-provided income evidence to seeded return fields.',allowedActions:['Map documented fields','Identify duplicates and corrected forms','Prepare reconciliation workpapers'],prohibitedActions:universalProhibitions,humanReviewTriggers:['Unreported income','Withholding variance','Corrected or duplicate document','Transcript mismatch']},
 {id:'credit_deduction_reviewer',name:'Credit and Deduction Reviewer',mission:'Evaluate eligibility evidence, year-specific calculations, limitations, and unresolved substantiation for claimed credits and deductions.',allowedActions:['Run versioned calculation modules','Create substantiation checklists','Flag unsupported provisions'],prohibitedActions:universalProhibitions,humanReviewTriggers:['Refundable credit','Schedule C loss','Unusual itemized deduction','Unsupported tax year','Material prior-year variance']},
 {id:'workpaper_auditor',name:'Workpaper Auditor',mission:'Review source lineage, calculations, preparer conclusions, review notes, and unresolved exceptions.',allowedActions:['Score workpaper completeness','Detect missing source hashes','Generate review findings'],prohibitedActions:universalProhibitions,humanReviewTriggers:['Missing source evidence','Calculation override','Open exception','Material tax position']},
 {id:'citation_researcher',name:'Citation Researcher',mission:'Attach official, tax-year-scoped authority to workpapers, recommendations, and client explanations.',allowedActions:['Retrieve official IRS sources','Link IRC, regulations, instructions, publications and IRM material','Identify stale citations'],prohibitedActions:universalProhibitions,humanReviewTriggers:['Conflicting authority','Non-IRS source used for filing position','Unclear effective date']},
 {id:'notice_triage',name:'Notice Triage Specialist',mission:'Classify notices, identify apparent deadlines, create evidence checklists, and route the matter to qualified staff.',allowedActions:['Classify notice type','Draft factual chronology','Create response workpaper'],prohibitedActions:universalProhibitions,humanReviewTriggers:['Examination','Appeal deadline','Levy or lien','Identity verification','Math-error adjustment','Penalty assessment']},
 {id:'ero_compliance_monitor',name:'ERO Compliance Monitor',mission:'Evaluate ERO duties, signature evidence, retention, e-file provider controls, security, and transmission readiness.',allowedActions:['Evaluate Publication 1345 controls','Check 8879/8453 evidence','Verify retention and audit events'],prohibitedActions:universalProhibitions,humanReviewTriggers:['Missing signature authorization','Environment mismatch','Provider-status issue','Security incident']},
 {id:'client_explainer',name:'Client Explanation Assistant',mission:'Convert approved workpaper conclusions into plain-language client messages without changing tax facts.',allowedActions:['Draft explanations','Grammar and clarity review','Translate approved status into client-safe language'],prohibitedActions:universalProhibitions,humanReviewTriggers:['Legal advice','Representation advice','Outcome guarantee','Sensitive personal data in free text']},
 {id:'supervisor_router',name:'Supervisor Router',mission:'Assign FLAG, HOLD, and ESCALATE events to the appropriate preparer, reviewer, ERO, compliance lead, or representative.',allowedActions:['Create assignments','Apply SLA priority','Preserve escalation evidence'],prohibitedActions:universalProhibitions,humanReviewTriggers:['Every material HOLD','Missed deadline risk','Potential misconduct','Data-security event']}
];

export const profetGovernanceSources=[
 {title:'Publication 1345',scope:'Authorized IRS e-file Provider duties, signatures, recordkeeping, security, and individual-return e-file controls.',url:'https://www.irs.gov/pub/irs-pdf/p1345.pdf'},
 {title:'Publication 3112',scope:'IRS e-file application and participation requirements.',url:'https://www.irs.gov/pub/irs-pdf/p3112.pdf'},
 {title:'Publication 4557',scope:'Safeguarding taxpayer data and written information security practices.',url:'https://www.irs.gov/pub/irs-pdf/p4557.pdf'},
 {title:'IRM 3.42.10',scope:'Authorized IRS e-file Provider administration and monitoring procedures.',url:'https://www.irs.gov/irm/part3/irm_03-042-010r'},
 {title:'Circular 230',scope:'Competence, diligence, conflicts, standards, and conduct for practice before the IRS.',url:'https://www.irs.gov/tax-professionals/circular-230-tax-professionals'}
];

export type ProfetEvent='RETURN_CREATED'|'IDENTITY_FLAG'|'INCOME_MISMATCH'|'CREDIT_HOLD'|'WORKPAPER_INCOMPLETE'|'SIGNATURE_READY'|'EFILE_REJECT'|'IRS_NOTICE_RECEIVED'|'TC570_OBSERVED'|'TC810_OBSERVED'|'SECURITY_EVENT';

const personaRouting:Record<ProfetEvent,ProfetPersonaId[]>={
 RETURN_CREATED:['intake_guardian','workpaper_auditor'],
 IDENTITY_FLAG:['identity_risk_analyst','supervisor_router'],
 INCOME_MISMATCH:['income_reconciler','workpaper_auditor','supervisor_router'],
 CREDIT_HOLD:['credit_deduction_reviewer','citation_researcher','supervisor_router'],
 WORKPAPER_INCOMPLETE:['workpaper_auditor','supervisor_router'],
 SIGNATURE_READY:['ero_compliance_monitor','workpaper_auditor'],
 EFILE_REJECT:['ero_compliance_monitor','supervisor_router'],
 IRS_NOTICE_RECEIVED:['notice_triage','citation_researcher','supervisor_router'],
 TC570_OBSERVED:['identity_risk_analyst','notice_triage','supervisor_router'],
 TC810_OBSERVED:['identity_risk_analyst','notice_triage','supervisor_router'],
 SECURITY_EVENT:['ero_compliance_monitor','supervisor_router']
};

export function routeProfetEvent(input:{event:ProfetEvent;tenantId:string;returnId:string;taxYear:number;planActive:boolean;material:boolean}){
 if(!input.planActive)return {accepted:false,status:'DENY',code:'PROFET_PLAN_INACTIVE',message:'An active PROFET annual enrollment is required.'};
 const personas=personaRouting[input.event].map(id=>profetPersonas.find(persona=>persona.id===id)).filter((persona):persona is ProfetPersona=>Boolean(persona));
 const hold=input.material||['IDENTITY_FLAG','CREDIT_HOLD','TC570_OBSERVED','TC810_OBSERVED','SECURITY_EVENT'].includes(input.event);
 return {accepted:true,status:hold?'HOLD':'QUEUED',eventId:`profet_evt_${crypto.randomUUID()}`,tenantId:input.tenantId,returnId:input.returnId,taxYear:input.taxYear,personas:personas.map(persona=>({id:persona.id,name:persona.name,state:hold?'HUMAN_REVIEW':'QUEUED'})),humanReviewRequired:hold,governanceSources:profetGovernanceSources,auditEventId:`evt_${crypto.randomUUID()}`,createdAt:new Date().toISOString()};
}
