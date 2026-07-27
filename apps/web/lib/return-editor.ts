export type ValidationStatus='PASS'|'FLAG'|'HOLD'|'DENY';
export type ReturnFamily='1040'|'1065'|'1120'|'1120S'|'1041'|'employment'|'information-return';
export type IncomeDocumentType='W2'|'W2G'|'1099NEC'|'1099MISC'|'1099INT'|'1099DIV'|'1099R'|'SSA1099'|'1099K'|'K1'|'OTHER';

export type SourceField={field:string;value:string|number|boolean|null;confidence:number;sourceDocumentId:string;sourcePage?:number;sourceBox?:string;humanApproved?:boolean};
export type IncomeDocument={documentId:string;type:IncomeDocumentType;taxYear:number;issuerName:string;recipientTaxIdLast4?:string;sourceHash:string;corrected?:boolean;fields:SourceField[]};
export type IdentityEvidence={evidenceId:string;type:'government_id'|'social_security_card'|'itin_notice'|'ein_notice'|'ippin_notice'|'prior_year_return';verified:boolean;nameMatch:boolean;taxIdLast4Match?:boolean;expiresAt?:string|null;sourceHash:string};
export type TaxCitation={citationId:string;authorityType:'IRC'|'Treasury Regulation'|'IRS Publication'|'Form Instruction'|'IRM'|'Revenue Procedure'|'IRS Web Guidance';title:string;locator:string;officialUrl:string;taxYearScoped:boolean;applicability:string;retrievedAt:string};

const authorityRegistry:Record<string,Omit<TaxCitation,'retrievedAt'>[]>={
 identity:[
  {citationId:'pub4557',authorityType:'IRS Publication',title:'Safeguarding Taxpayer Data',locator:'Publication 4557',officialUrl:'https://www.irs.gov/pub/irs-pdf/p4557.pdf',taxYearScoped:false,applicability:'Protection of taxpayer identity and return information.'}
 ],
 efile:[
  {citationId:'pub1345',authorityType:'IRS Publication',title:'Authorized IRS e-file Providers of Individual Income Tax Returns',locator:'Publication 1345',officialUrl:'https://www.irs.gov/pub/irs-pdf/p1345.pdf',taxYearScoped:true,applicability:'ERO duties, signatures, recordkeeping, and electronic filing controls.'},
  {citationId:'irm34210',authorityType:'IRM',title:'Authorized IRS e-file Providers',locator:'IRM 3.42.10',officialUrl:'https://www.irs.gov/irm/part3/irm_03-042-010r',taxYearScoped:false,applicability:'IRS e-file provider roles, monitoring, and participation rules.'}
 ],
 w2:[
  {citationId:'pub1141',authorityType:'IRS Publication',title:'General Rules and Specifications for Substitute Forms W-2 and W-3',locator:'Publication 1141',officialUrl:'https://www.irs.gov/forms-pubs/about-publication-1141',taxYearScoped:true,applicability:'Substitute W-2/W-3 formatting and copy requirements.'},
  {citationId:'iw2w3',authorityType:'Form Instruction',title:'General Instructions for Forms W-2 and W-3',locator:'Current-year instructions',officialUrl:'https://www.irs.gov/instructions/iw2w3',taxYearScoped:true,applicability:'W-2 furnishing, correction, and filing requirements.'}
 ],
 informationReturns:[
  {citationId:'pub1179',authorityType:'IRS Publication',title:'General Rules and Specifications for Substitute Information Returns',locator:'Publication 1179',officialUrl:'https://www.irs.gov/forms-pubs/about-publication-1179',taxYearScoped:true,applicability:'Substitute Forms 1096, 1098, 1099, and 5498.'},
  {citationId:'pub1220',authorityType:'IRS Publication',title:'Specifications for Electronic Filing of Information Returns',locator:'Publication 1220',officialUrl:'https://www.irs.gov/pub/irs-pdf/p1220.pdf',taxYearScoped:true,applicability:'Electronic filing record specifications for covered information returns.'}
 ]
};

const official=(url:string)=>{try{const host=new URL(url).hostname;return host==='irs.gov'||host.endsWith('.irs.gov');}catch{return false;}};
export function resolveCitations(topics:string[],taxYear:number){
 const found=new Map<string,TaxCitation>();
 for(const topic of topics)for(const item of authorityRegistry[topic]??[])if(official(item.officialUrl))found.set(item.citationId,{...item,retrievedAt:new Date().toISOString(),applicability:`${item.applicability} Evaluated for tax year ${taxYear}.`});
 return [...found.values()];
}

export function validateIdentity(evidence:IdentityEvidence[]){
 const verified=evidence.filter(item=>item.verified&&item.nameMatch);
 const hasPhoto=verified.some(item=>item.type==='government_id');
 const hasTaxId=verified.some(item=>['social_security_card','itin_notice','ein_notice'].includes(item.type)&&item.taxIdLast4Match!==false);
 const expired=evidence.filter(item=>item.expiresAt&&Date.parse(item.expiresAt)<Date.now()).map(item=>item.evidenceId);
 const issues=[...(!hasPhoto?['Verified government-issued identity evidence is missing.']:[]),...(!hasTaxId?['Verified SSN, ITIN, or EIN evidence is missing.']:[]),...(expired.length?[`Expired identity evidence: ${expired.join(', ')}.`]:[])];
 const score=(hasPhoto?45:0)+(hasTaxId?45:0)+(verified.some(item=>item.type==='ippin_notice')?10:0);
 const status:ValidationStatus=score>=90&&!expired.length?'PASS':score>=45?'FLAG':'HOLD';
 return {status,score,issues,verifiedEvidenceIds:verified.map(item=>item.evidenceId),requiresHumanReview:status!=='PASS',citations:resolveCitations(['identity'],new Date().getFullYear())};
}

const mappings:Record<IncomeDocumentType,Record<string,string>>={
 W2:{wages:'1040.line1a',federalWithholding:'1040.line25a',socialSecurityWages:'workpaper.w2.socialSecurityWages',medicareWages:'workpaper.w2.medicareWages'},
 W2G:{gamblingWinnings:'1040.schedule1.otherIncome',federalWithholding:'1040.line25c'},
 '1099NEC':{nonemployeeCompensation:'scheduleC.grossReceipts',federalWithholding:'1040.line25c'},
 '1099MISC':{rents:'scheduleE.rents',royalties:'scheduleE.royalties',otherIncome:'1040.schedule1.otherIncome',federalWithholding:'1040.line25c'},
 '1099INT':{interestIncome:'scheduleB.interest',federalWithholding:'1040.line25c'},
 '1099DIV':{ordinaryDividends:'scheduleB.dividends',qualifiedDividends:'1040.line3a',capitalGainDistributions:'scheduleD.capitalGainDistributions',federalWithholding:'1040.line25c'},
 '1099R':{grossDistribution:'1040.line5a',taxableAmount:'1040.line5b',federalWithholding:'1040.line25b'},
 SSA1099:{netBenefits:'1040.line6a',taxableBenefits:'1040.line6b'},
 '1099K':{grossPayments:'workpaper.1099k.grossPayments'},
 K1:{ordinaryIncome:'scheduleE.k1Income',interestIncome:'scheduleE.k1Interest',dividendIncome:'scheduleE.k1Dividends'},
 OTHER:{}
};

export function seedIncomeDocuments(documents:IncomeDocument[]){
 const entries:{targetField:string;value:string|number|boolean|null;documentId:string;sourceBox?:string;confidence:number;status:ValidationStatus}[]=[];
 const issues:string[]=[];
 for(const document of documents){
  if(!document.sourceHash||document.sourceHash.length<16){issues.push(`${document.documentId}: source hash is missing or invalid.`);continue;}
  for(const field of document.fields){
   const target=mappings[document.type][field.field];
   if(!target){issues.push(`${document.documentId}: ${field.field} requires manual mapping.`);continue;}
   const confidence=Math.max(0,Math.min(1,field.confidence));
   entries.push({targetField:target,value:field.value,documentId:document.documentId,sourceBox:field.sourceBox,confidence,status:confidence>=.97?'PASS':confidence>=.8?'FLAG':'HOLD'});
  }
 }
 const duplicateKeys=new Map<string,string[]>();
 for(const entry of entries){const key=`${entry.targetField}:${entry.value}`;duplicateKeys.set(key,[...(duplicateKeys.get(key)??[]),entry.documentId]);}
 const duplicates=[...duplicateKeys.entries()].filter(([,ids])=>new Set(ids).size>1).map(([key,ids])=>({key,documentIds:[...new Set(ids)]}));
 if(duplicates.length)issues.push('Potential duplicate income entries require reconciliation.');
 const status:ValidationStatus=entries.some(item=>item.status==='HOLD')||duplicates.length?'HOLD':entries.some(item=>item.status==='FLAG')||issues.length?'FLAG':'PASS';
 const topics=[documents.some(item=>item.type==='W2')?'w2':'',documents.some(item=>item.type.startsWith('1099'))?'informationReturns':''].filter(Boolean);
 return {status,entries,issues,duplicates,requiresHumanReview:status!=='PASS',citations:resolveCitations(topics,documents[0]?.taxYear??new Date().getFullYear())};
}

export function buildWorkpapers(input:{returnId:string;taxYear:number;family:ReturnFamily;identityResult:ReturnType<typeof validateIdentity>;incomeResult:ReturnType<typeof seedIncomeDocuments>}){
 const status:ValidationStatus=input.identityResult.status==='HOLD'||input.incomeResult.status==='HOLD'?'HOLD':input.identityResult.status==='FLAG'||input.incomeResult.status==='FLAG'?'FLAG':'PASS';
 return {workpaperId:`wp_${crypto.randomUUID()}`,returnId:input.returnId,taxYear:input.taxYear,family:input.family,status,sections:[{name:'Identity validation',status:input.identityResult.status,evidence:input.identityResult.verifiedEvidenceIds,issues:input.identityResult.issues},{name:'Income source reconciliation',status:input.incomeResult.status,evidence:input.incomeResult.entries.map(item=>({documentId:item.documentId,targetField:item.targetField,confidence:item.confidence})),issues:input.incomeResult.issues},{name:'Authority citations',status:'PASS',evidence:[...input.identityResult.citations,...input.incomeResult.citations],issues:[]}],reviewRequired:status!=='PASS',auditEventId:`evt_${crypto.randomUUID()}`};
}

export type CopyType='W2_COPY_A'|'W2_COPY_B'|'W2_COPY_C'|'W2_COPY_1'|'W2_COPY_2'|'1099_COPY_A'|'1099_COPY_B'|'1099_COPY_C'|'1099_STATE'|'CLIENT_RETURN'|'PREPARER_FILE'|'SIGNATURE_SET'|'EFILE_RECORD';
export function buildPrintset(input:{returnId:string;taxYear:number;copies:CopyType[];workpaperStatus:ValidationStatus;humanApproved:boolean}){
 const restricted=input.copies.filter(copy=>['W2_COPY_A','1099_COPY_A','EFILE_RECORD'].includes(copy));
 const warnings:string[]=[];
 if(input.workpaperStatus!=='PASS')warnings.push('Workpaper validation has unresolved FLAG or HOLD conditions.');
 if(restricted.length)warnings.push('Copy A and e-file artifacts require approved filing specifications; ordinary office reproductions must not be treated as scannable filing originals.');
 const status:ValidationStatus=input.workpaperStatus!=='PASS'||(restricted.length&&!input.humanApproved)?'HOLD':'PASS';
 return {packetId:`pkt_${crypto.randomUUID()}`,returnId:input.returnId,taxYear:input.taxYear,status,copies:input.copies.map(copy=>({copy,classification:['W2_COPY_A','1099_COPY_A','EFILE_RECORD'].includes(copy)?'restricted_filing_artifact':copy==='PREPARER_FILE'?'internal_workpaper':'recipient_or_client_copy'})),warnings,citations:resolveCitations(['w2','informationReturns','efile'],input.taxYear),humanApprovalRequired:status!=='PASS'||restricted.length>0,generatedAt:new Date().toISOString()};
}

export type WritingMode='grammar'|'clarity'|'professional'|'concise'|'client_friendly'|'workpaper_note';
export function assistWriting(input:{text:string;mode:WritingMode;context?:string}){
 const original=input.text.trim();
 let revised=original.replace(/\s+/g,' ').replace(/\s+([,.;!?])/g,'$1');
 if(revised&&!/[.!?]$/.test(revised))revised+='.';
 revised=revised.replace(/\bi\b/g,'I').replace(/\bdont\b/gi,"don't").replace(/\bcant\b/gi,"can't").replace(/\bwont\b/gi,"won't");
 const suggestions:string[]=[];
 if(original.length>300)suggestions.push('Consider splitting this into shorter paragraphs or workpaper bullets.');
 if(/guarantee|definitely|always|never get audited|irs approved/i.test(original))suggestions.push('Remove absolute or unsupported tax-outcome claims.');
 if(/ssn|social security number|bank account|routing number/i.test(original))suggestions.push('Do not place full taxpayer identifiers or banking information in free-text notes.');
 if(input.mode==='workpaper_note'&&!/source|document|interview|verified|reviewed/i.test(revised))suggestions.push('Add the source, date reviewed, and preparer conclusion.');
 if(input.mode==='client_friendly')revised=revised.replace(/taxpayer/gi,'client').replace(/substantiation/gi,'supporting documents');
 return {original,revised,mode:input.mode,suggestions,requiresHumanApproval:true,prohibitedActions:['Do not overwrite source documents.','Do not create unsupported tax facts.','Do not convert a suggestion into a filed position without preparer review.'],auditEventId:`evt_${crypto.randomUUID()}`};
}

export function speechDraft(input:{transcript:string;fieldType:'client_note'|'workpaper_note'|'interview_answer'|'form_explanation';language?:string}){
 const transcript=input.transcript.trim();
 const redactions:string[]=[];
 const sanitized=transcript.replace(/\b\d{3}-?\d{2}-?\d{4}\b/g,match=>{redactions.push('SSN-like value');return '[REDACTED TAX ID]';}).replace(/\b\d{9,17}\b/g,match=>{redactions.push('long numeric identifier');return '[REDACTED IDENTIFIER]';});
 const writing=assistWriting({text:sanitized,mode:input.fieldType==='workpaper_note'?'workpaper_note':'professional'});
 return {fieldType:input.fieldType,language:input.language??'en-US',transcript:sanitized,redactions,draft:writing.revised,suggestions:writing.suggestions,requiresHumanApproval:true,auditEventId:`evt_${crypto.randomUUID()}`};
}
