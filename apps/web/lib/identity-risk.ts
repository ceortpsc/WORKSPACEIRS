export type InterventionStatus='PASS'|'FLAG'|'HOLD'|'ESCALATE';
export type NoticeType='4883C'|'CP5071'|'5071C'|'5447C'|'5747C'|'TC570'|'TC810';

export type IdentityRiskInput={
 taxYear:number;
 returnId:string;
 taxpayerIdentity:{governmentIdVerified:boolean;taxIdEvidenceVerified:boolean;nameExactMatch:boolean;dateOfBirthMatch:boolean;addressConsistency:boolean;ipPinRequired:boolean;ipPinPresent:boolean;priorYearReturnAvailable:boolean};
 filingSignals:{duplicateReturnKnown:boolean;priorRejectedIdentityCode:boolean;newBankAccount:boolean;bankAccountOwnerMatch:boolean;largeRefundVariance:boolean;unusualCreditPattern:boolean;wageTranscriptCompared:boolean;incomeDocumentsReconciled:boolean;dependentConflict:boolean;filingStatusChanged:boolean};
 evidence:{sourceHashes:string[];interviewCompleted:boolean;preparerReviewed:boolean;reviewerApproved:boolean};
};

const officialSources={
 letter4883C:'https://www.irs.gov/individuals/understanding-your-letter-4883c',
 verifyReturn:'https://www.irs.gov/identity-theft-fraud-scams/verify-your-return',
 tppIrm:'https://www.irs.gov/irm/part25/irm_25-025-006r',
 freezeCodes:'https://www.irs.gov/irm/part21/irm_21-005-006r',
 examinationIssues:'https://www.irs.gov/irm/part21/irm_21-005-010r',
 ipPin:'https://www.irs.gov/identity-theft-fraud-scams/get-an-identity-protection-pin'
};

export function evaluatePrefileIdentityRisk(input:IdentityRiskInput){
 const findings:{code:string;severity:'low'|'moderate'|'high'|'critical';message:string;intervention:string}[]=[];
 const add=(code:string,severity:'low'|'moderate'|'high'|'critical',message:string,intervention:string)=>findings.push({code,severity,message,intervention});
 const id=input.taxpayerIdentity;const signals=input.filingSignals;const evidence=input.evidence;
 if(!id.governmentIdVerified)add('IDENTITY_PHOTO_ID_MISSING','critical','Government-issued identity evidence has not been verified.','Place the return on HOLD and complete authenticated identity review.');
 if(!id.taxIdEvidenceVerified)add('TAX_ID_EVIDENCE_MISSING','critical','SSN, ITIN, or EIN evidence has not been verified.','Do not transmit until the tax identifier evidence is reviewed.');
 if(!id.nameExactMatch||!id.dateOfBirthMatch)add('CORE_IDENTITY_MISMATCH','critical','Core identity attributes are inconsistent.','Resolve the discrepancy against authoritative evidence and document the disposition.');
 if(id.ipPinRequired&&!id.ipPinPresent)add('IPPIN_REQUIRED','critical','An Identity Protection PIN is required but not present.','Obtain the current-year IP PIN from the taxpayer; do not guess or reuse a prior-year PIN.');
 if(signals.duplicateReturnKnown)add('POSSIBLE_DUPLICATE_RETURN','critical','A known or suspected duplicate return exists for the taxpayer and tax year.','Stop filing and open an identity-theft/duplicate-return escalation case.');
 if(signals.priorRejectedIdentityCode)add('PRIOR_IDENTITY_REJECT','high','A prior identity-related reject or verification event is recorded.','Require enhanced identity evidence and reviewer approval before submission.');
 if(signals.newBankAccount&&!signals.bankAccountOwnerMatch)add('BANK_OWNERSHIP_MISMATCH','critical','Refund bank ownership could not be matched to the taxpayer.','Remove or correct the deposit instruction and obtain documented authorization.');
 if(signals.largeRefundVariance)add('REFUND_VARIANCE','high','The expected refund materially differs from prior patterns or documented facts.','Reconcile credits, withholding, estimated payments, and source documents.');
 if(signals.unusualCreditPattern)add('QUESTIONABLE_CREDIT_PATTERN','high','One or more credit claims require enhanced substantiation.','Complete credit-specific due-diligence workpapers and independent review.');
 if(!signals.wageTranscriptCompared)add('WAGE_MATCH_NOT_COMPLETED','moderate','Available wage and income evidence has not been compared.','Compare authorized transcripts or source records when available; document unavailable evidence.');
 if(!signals.incomeDocumentsReconciled)add('INCOME_RECONCILIATION_OPEN','high','W-2, 1099, K-1, or other income documents remain unreconciled.','Hold the return until duplicate, corrected, and missing-document issues are resolved.');
 if(signals.dependentConflict)add('DEPENDENT_CONFLICT','high','A dependent eligibility or duplicate-claim conflict exists.','Complete relationship, residency, support, and release-form review.');
 if(signals.filingStatusChanged)add('FILING_STATUS_CHANGE','moderate','Filing status changed from the prior filing pattern.','Document the factual basis and obtain preparer/reviewer approval.');
 if(!id.addressConsistency)add('ADDRESS_INCONSISTENCY','moderate','Current and source-document addresses are inconsistent.','Confirm the taxpayer mailing address and preserve the explanation.');
 if(evidence.sourceHashes.length<2)add('INSUFFICIENT_SOURCE_LINEAGE','high','Insufficient source-document lineage is attached to the return.','Attach immutable source hashes for identity and income evidence.');
 if(!evidence.interviewCompleted)add('INTERVIEW_INCOMPLETE','high','The taxpayer verification and due-diligence interview is incomplete.','Complete the taxpayer interview before review or transmission.');
 if(!evidence.preparerReviewed)add('PREPARER_REVIEW_REQUIRED','high','Preparer review is not complete.','Route to the assigned preparer.');
 if(!evidence.reviewerApproved)add('REVIEWER_APPROVAL_REQUIRED','high','Independent reviewer approval is not complete.','Keep the return in HOLD until reviewer disposition.');
 const critical=findings.filter(item=>item.severity==='critical').length;const high=findings.filter(item=>item.severity==='high').length;
 const status:InterventionStatus=critical?'HOLD':high?'HOLD':findings.length?'FLAG':'PASS';
 return {status,riskScore:Math.min(100,critical*25+high*12+findings.filter(item=>item.severity==='moderate').length*5),findings,transmissionAllowed:status==='PASS',requiredApprovals:status==='PASS'?[]:['PREPARER','REVIEWER'],officialSources,auditEventId:`evt_${crypto.randomUUID()}`};
}

export function buildNoticeIntervention(notice:NoticeType,input:{taxYear:number;returnId:string;taxpayerFiledReturn:boolean;letterAvailable:boolean;currentReturnAvailable:boolean;priorYearReturnAvailable:boolean;supportingDocumentsAvailable:boolean;economicHardship?:boolean}){
 const common={notice,taxYear:input.taxYear,returnId:input.returnId,officialSources,auditEventId:`evt_${crypto.randomUUID()}`,createdAt:new Date().toISOString()};
 if(['4883C','CP5071','5071C','5447C','5747C'].includes(notice)){
  const route=notice==='4883C'?'PHONE_TPP':notice==='5747C'?'IN_PERSON_TAC':'ONLINE_OR_NOTICE_INSTRUCTIONS';
  return {...common,status:'HOLD' as InterventionStatus,category:'TAXPAYER_PROTECTION_PROGRAM',route,requiredEvidence:[...(!input.letterAvailable?['IRS notice or letter']:[]),...(!input.currentReturnAvailable&&input.taxpayerFiledReturn?['Return referenced by the notice']:[]),...(!input.priorYearReturnAvailable?['Prior-year return, if available']:[]),...(!input.supportingDocumentsAvailable?['Supporting W-2, 1099, schedules, and other source records']:[])],instructions:input.taxpayerFiledReturn?'Follow the notice exactly and verify both identity and the filed return.':'Follow the notice exactly and inform the IRS that the taxpayer did not file the return.',prohibitions:['Do not file Form 14039 solely because a TPP notice was received unless the IRS instructs the taxpayer to do so.','Do not promise a release date or refund date.','Do not attempt to bypass IRS authentication.']};
 }
 const freezeType=notice==='TC810'?'REFUND_FREEZE':'ADDITIONAL_ACCOUNT_ACTION_PENDING';
 return {...common,status:'ESCALATE' as InterventionStatus,category:'REFUND_HOLD',freezeType,requiredResearch:['Verify transcript source and transaction date','Identify the controlling IRS function or notice','Reconcile claimed credits, withholding, payments, and return facts','Preserve all source documents and practitioner notes',...(input.economicHardship?['Evaluate Taxpayer Advocate Service referral criteria']:[])],prohibitions:['Do not represent TC 570 or TC 810 as a guaranteed fraud finding.','Do not claim the practitioner can release the freeze.','Do not submit unsupported amendments or duplicate returns to force release.'],disposition:'Route to qualified transcript/notice review and follow the controlling IRS correspondence or function-specific procedure.'};
}
