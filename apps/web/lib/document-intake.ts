export type SupportedDocumentType='W2'|'W2G'|'1099NEC'|'1099MISC'|'1099INT'|'1099DIV'|'1099R'|'SSA1099'|'1099K'|'K1'|'1098T'|'1098E'|'1095A'|'NOTICE'|'IDENTITY'|'BANK_STATEMENT'|'BUSINESS_LEDGER'|'OTHER';
export type MappingStatus='PASS'|'FLAG'|'HOLD'|'UNSUPPORTED';

export type UploadedDocument={
 documentId:string;
 fileName:string;
 mimeType:string;
 sizeBytes:number;
 sourceHash:string;
 uploadedAt:string;
 uploadedBy:string;
 tenantId:string;
 returnId:string;
};

export type ExtractedField={
 sourceLabel:string;
 sourceBox?:string;
 rawValue:string;
 normalizedValue:string|number|boolean|null;
 confidence:number;
 page?:number;
 boundingBox?:{x:number;y:number;width:number;height:number};
};

export type DocumentClassification={
 documentType:SupportedDocumentType;
 confidence:number;
 taxYear?:number;
 corrected?:boolean;
 issuerName?:string;
 recipientLast4?:string;
 warnings:string[];
};

const allowedMimeTypes=new Set(['application/pdf','image/jpeg','image/png','image/webp','image/tiff']);
const maxBytes=25*1024*1024;

export function validateUpload(document:UploadedDocument){
 const issues:string[]=[];
 if(!allowedMimeTypes.has(document.mimeType))issues.push('Unsupported file type. Only PDF and approved image formats are accepted.');
 if(!Number.isSafeInteger(document.sizeBytes)||document.sizeBytes<=0||document.sizeBytes>maxBytes)issues.push('File size is invalid or exceeds 25 MB.');
 if(!/^[a-f0-9]{32,128}$/i.test(document.sourceHash))issues.push('A valid immutable source hash is required.');
 if(document.fileName.length>180)issues.push('File name exceeds the supported length.');
 if(/\.(exe|js|bat|cmd|ps1|scr|msi)$/i.test(document.fileName))issues.push('Executable files are prohibited.');
 return {status:issues.length?'HOLD' as MappingStatus:'PASS' as MappingStatus,issues,malwareScanRequired:true,contentDisarmRequired:document.mimeType==='application/pdf'};
}

const mappingCatalog:Record<SupportedDocumentType,Record<string,string>>={
 W2:{'1':'1040.line1a','2':'1040.line25a','3':'workpaper.w2.socialSecurityWages','4':'workpaper.w2.socialSecurityTax','5':'workpaper.w2.medicareWages','6':'workpaper.w2.medicareTax','12':'workpaper.w2.box12','14':'workpaper.w2.box14','15':'state.return.stateCode','16':'state.return.wages','17':'state.return.withholding'},
 W2G:{'1':'1040.schedule1.gamblingWinnings','4':'1040.line25c'},
 '1099NEC':{'1':'scheduleC.grossReceipts','4':'1040.line25c'},
 '1099MISC':{'1':'scheduleE.rents','2':'scheduleE.royalties','3':'1040.schedule1.otherIncome','4':'1040.line25c'},
 '1099INT':{'1':'scheduleB.interest','4':'1040.line25c'},
 '1099DIV':{'1a':'scheduleB.dividends','1b':'1040.line3a','2a':'scheduleD.capitalGainDistributions','4':'1040.line25c'},
 '1099R':{'1':'1040.line5a','2a':'1040.line5b','4':'1040.line25b'},
 SSA1099:{'5':'1040.line6a'},
 '1099K':{'1a':'workpaper.1099k.grossPayments'},
 K1:{'1':'scheduleE.k1OrdinaryIncome','4a':'scheduleE.k1Interest','5':'scheduleE.k1Dividends'},
 '1098T':{'1':'form8863.paymentsReceived','5':'form8863.scholarships'},
 '1098E':{'1':'schedule1.studentLoanInterest'},
 '1095A':{'21':'form8962.annualPremium','22':'form8962.annualSlcsp','23':'form8962.annualAdvancePtc'},
 NOTICE:{},IDENTITY:{},BANK_STATEMENT:{},BUSINESS_LEDGER:{},OTHER:{}
};

export function classifyDocument(input:{fileName:string;textSample:string;declaredType?:SupportedDocumentType}):DocumentClassification{
 const text=`${input.fileName} ${input.textSample}`.toUpperCase();
 const candidates:[SupportedDocumentType,RegExp][]=[
  ['W2',/\bW-?2\b|WAGE AND TAX STATEMENT/],['1099NEC',/1099-?NEC|NONEMPLOYEE COMPENSATION/],['1099MISC',/1099-?MISC/],['1099INT',/1099-?INT|INTEREST INCOME/],['1099DIV',/1099-?DIV|DIVIDENDS AND DISTRIBUTIONS/],['1099R',/1099-?R|PENSIONS.*ANNUITIES/],['1099K',/1099-?K|PAYMENT CARD/],['SSA1099',/SSA-?1099|SOCIAL SECURITY BENEFIT STATEMENT/],['1098T',/1098-?T|TUITION STATEMENT/],['1098E',/1098-?E|STUDENT LOAN INTEREST/],['1095A',/1095-?A|HEALTH INSURANCE MARKETPLACE/],['K1',/SCHEDULE K-?1/],['NOTICE',/DEPARTMENT OF THE TREASURY|INTERNAL REVENUE SERVICE|CP\s?\d{2,4}|LETTER\s?\d{4}/],['IDENTITY',/DRIVER LICENSE|IDENTIFICATION CARD|SOCIAL SECURITY/]
 ];
 const detected=candidates.find(([,pattern])=>pattern.test(text))?.[0]??input.declaredType??'OTHER';
 const confidence=detected==='OTHER'?.35:input.declaredType===detected?.99:.92;
 return {documentType:detected,confidence,taxYear:Number(text.match(/20\d{2}/)?.[0])||undefined,corrected:/CORRECTED/.test(text),warnings:detected==='OTHER'?['Document type could not be confidently classified.']:[]};
}

export function mapExtractedFields(input:{classification:DocumentClassification;fields:ExtractedField[]}){
 const catalog=mappingCatalog[input.classification.documentType];
 const mappings:{sourceLabel:string;sourceBox?:string;targetField:string|null;value:string|number|boolean|null;confidence:number;status:MappingStatus;reason?:string}[]=[];
 for(const field of input.fields){
  const key=(field.sourceBox??field.sourceLabel).trim();
  const target=catalog[key]??null;
  const confidence=Math.min(input.classification.confidence,Math.max(0,Math.min(1,field.confidence)));
  let status:MappingStatus='PASS';let reason:undefined|string;
  if(!target){status='HOLD';reason='No approved target-field mapping exists for this source field.';}
  else if(confidence<.80){status='HOLD';reason='Extraction confidence is below the auto-seeding threshold.';}
  else if(confidence<.97){status='FLAG';reason='Human confirmation is required before acceptance.';}
  mappings.push({sourceLabel:field.sourceLabel,sourceBox:field.sourceBox,targetField:target,value:field.normalizedValue,confidence,status,reason});
 }
 const status:MappingStatus=mappings.some(item=>item.status==='HOLD')?'HOLD':mappings.some(item=>item.status==='FLAG')?'FLAG':'PASS';
 return {status,mappings,autoSeedAllowed:status==='PASS',humanApprovalRequired:status!=='PASS'||mappings.length===0,unmappedCount:mappings.filter(item=>!item.targetField).length,auditEventId:`evt_${crypto.randomUUID()}`};
}

export function buildDocumentNarrative(input:{classification:DocumentClassification;mapping:ReturnType<typeof mapExtractedFields>;purpose:'client_note'|'workpaper_note'|'missing_item_request'}){
 const type=input.classification.documentType;
 const mapped=input.mapping.mappings.filter(item=>item.targetField).length;
 const held=input.mapping.mappings.filter(item=>item.status==='HOLD').length;
 const flagged=input.mapping.mappings.filter(item=>item.status==='FLAG').length;
 if(input.purpose==='missing_item_request')return {text:`We received a ${type} document, but ${held+flagged} field${held+flagged===1?' requires':'s require'} review before the information can be used. Please provide a clearer copy or confirm the requested values.`,requiresApproval:true};
 if(input.purpose==='client_note')return {text:`Your ${type} document was received and reviewed. ${mapped} mapped field${mapped===1?' was':'s were'} identified. Any unresolved items will be sent to you separately.`,requiresApproval:true};
 return {text:`Source document classified as ${type} with ${(input.classification.confidence*100).toFixed(1)}% confidence. ${mapped} field mappings identified; ${flagged} flagged and ${held} held for manual review. Original source hash and extraction lineage preserved.`,requiresApproval:true};
}
