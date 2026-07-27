export const CALCULATION_ENGINE='AVALON-5668.8766';
export const CALCULATION_SCALE='integer_cents_and_basis_points';

export type FilingStatus='SINGLE'|'MFJ'|'MFS'|'HOH'|'QSS';
export type CalculationStatus='PASS'|'FLAG'|'HOLD'|'UNSUPPORTED';
export type MoneyCents=number;

export type Bracket={upToCents:number|null;rateBasisPoints:number};
export type AnnualRulePack={
 taxYear:number;
 revision:string;
 effectiveForReturnsFiledIn:number;
 officialSources:{title:string;url:string;locator:string}[];
 standardDeduction:Record<FilingStatus,MoneyCents>;
 brackets:Record<FilingStatus,Bracket[]>;
 childTaxCredit:{maximumPerChildCents:MoneyCents;refundableMaximumPerChildCents:MoneyCents|null;phaseoutStartCents:Record<FilingStatus,MoneyCents>;phaseoutPerThousandCents:MoneyCents};
 dependentStandardDeduction:{minimumCents:MoneyCents;earnedIncomeIncrementCents:MoneyCents};
 saltLimit:{maximumCents:Record<FilingStatus,MoneyCents>;phaseoutStartCents:Record<FilingStatus,MoneyCents>|null;minimumCents:Record<FilingStatus,MoneyCents>|null};
 engineNotes:string[];
};

const dollars=(amount:number):MoneyCents=>Math.round(amount*100);
const pct=(rate:number)=>Math.round(rate*100);
const MAX_SAFE_CENTS=Number.MAX_SAFE_INTEGER;

const individual2025Sources=[
 {title:'Revenue Procedure 2024-40 as modified by Revenue Procedure 2025-32',url:'https://www.irs.gov/irb/2025-45_IRB',locator:'2025 and 2026 inflation-adjusted provisions'},
 {title:'Working Families Tax Cuts — Individuals and workers',url:'https://www.irs.gov/newsroom/working-families-tax-cuts-individuals-and-workers',locator:'2025 standard deduction, credits, and deductions'},
 {title:'Instructions for Schedule A (Form 1040) (2025)',url:'https://www.irs.gov/instructions/i1040sca',locator:'2025 itemized deductions and SALT limitation'}
];

const individual2026Sources=[
 {title:'Revenue Procedure 2025-32',url:'https://www.irs.gov/irb/2025-45_IRB',locator:'Section 4 — 2026 adjusted items'},
 {title:'IRS tax inflation adjustments for tax year 2026',url:'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill',locator:'2026 rates, deductions, and credits'},
 {title:'Revenue Procedure 2025-19',url:'https://www.irs.gov/irb/2025-21_IRB',locator:'2026 HSA limitations'}
];

const brackets2025={
 SINGLE:[[11925,1000],[48475,1200],[103350,2200],[197300,2400],[250525,3200],[626350,3500],[null,3700]],
 MFJ:[[23850,1000],[96950,1200],[206700,2200],[394600,2400],[501050,3200],[751600,3500],[null,3700]],
 MFS:[[11925,1000],[48475,1200],[103350,2200],[197300,2400],[250525,3200],[375800,3500],[null,3700]],
 HOH:[[17000,1000],[64850,1200],[103350,2200],[197300,2400],[250500,3200],[626350,3500],[null,3700]],
 QSS:[[23850,1000],[96950,1200],[206700,2200],[394600,2400],[501050,3200],[751600,3500],[null,3700]]
} satisfies Record<FilingStatus,(readonly [number|null,number])[]>;

const brackets2026={
 SINGLE:[[12400,1000],[50400,1200],[105700,2200],[201775,2400],[256225,3200],[640600,3500],[null,3700]],
 MFJ:[[24800,1000],[100800,1200],[211400,2200],[403550,2400],[512450,3200],[768700,3500],[null,3700]],
 MFS:[[12400,1000],[50400,1200],[105700,2200],[201775,2400],[256225,3200],[384350,3500],[null,3700]],
 HOH:[[17700,1000],[67450,1200],[105700,2200],[201750,2400],[256200,3200],[640600,3500],[null,3700]],
 QSS:[[24800,1000],[100800,1200],[211400,2200],[403550,2400],[512450,3200],[768700,3500],[null,3700]]
} satisfies Record<FilingStatus,(readonly [number|null,number])[]>;

const convertBrackets=(raw:Record<FilingStatus,(readonly [number|null,number])[]>):Record<FilingStatus,Bracket[]>=>Object.fromEntries(Object.entries(raw).map(([status,rows])=>[status,rows.map(([limit,rate])=>({upToCents:limit===null?null:dollars(limit),rateBasisPoints:rate}))])) as Record<FilingStatus,Bracket[]>;

export const annualRulePacks:Record<number,AnnualRulePack>={
 2025:{
  taxYear:2025,revision:'2025.OBBBA.1',effectiveForReturnsFiledIn:2026,officialSources:individual2025Sources,
  standardDeduction:{SINGLE:dollars(15750),MFS:dollars(15750),MFJ:dollars(31500),QSS:dollars(31500),HOH:dollars(23625)},
  brackets:convertBrackets(brackets2025),
  childTaxCredit:{maximumPerChildCents:dollars(2200),refundableMaximumPerChildCents:null,phaseoutStartCents:{SINGLE:dollars(200000),HOH:dollars(200000),MFS:dollars(200000),MFJ:dollars(400000),QSS:dollars(400000)},phaseoutPerThousandCents:dollars(50)},
  dependentStandardDeduction:{minimumCents:dollars(1350),earnedIncomeIncrementCents:dollars(450)},
  saltLimit:{maximumCents:{SINGLE:dollars(40000),HOH:dollars(40000),MFJ:dollars(40000),QSS:dollars(40000),MFS:dollars(20000)},phaseoutStartCents:{SINGLE:dollars(500000),HOH:dollars(500000),MFJ:dollars(500000),QSS:dollars(500000),MFS:dollars(250000)},minimumCents:{SINGLE:dollars(10000),HOH:dollars(10000),MFJ:dollars(10000),QSS:dollars(10000),MFS:dollars(5000)}},
  engineNotes:['2025 amounts include post-enactment modifications and must be reconciled to final form instructions.','Refundable CTC/ACTC requires a separate earned-income and statutory eligibility module; this pack does not infer it.']
 },
 2026:{
  taxYear:2026,revision:'2026.REVPROC-2025-32.1',effectiveForReturnsFiledIn:2027,officialSources:individual2026Sources,
  standardDeduction:{SINGLE:dollars(16100),MFS:dollars(16100),MFJ:dollars(32200),QSS:dollars(32200),HOH:dollars(24150)},
  brackets:convertBrackets(brackets2026),
  childTaxCredit:{maximumPerChildCents:dollars(2200),refundableMaximumPerChildCents:null,phaseoutStartCents:{SINGLE:dollars(200000),HOH:dollars(200000),MFS:dollars(200000),MFJ:dollars(400000),QSS:dollars(400000)},phaseoutPerThousandCents:dollars(50)},
  dependentStandardDeduction:{minimumCents:dollars(1350),earnedIncomeIncrementCents:dollars(450)},
  saltLimit:{maximumCents:{SINGLE:dollars(40000),HOH:dollars(40000),MFJ:dollars(40000),QSS:dollars(40000),MFS:dollars(20000)},phaseoutStartCents:null,minimumCents:null},
  engineNotes:['2026 pack follows Revenue Procedure 2025-32 for published indexed amounts.','Certain 2026 deductions, credits, phaseouts, and expired provisions require final form-specific instructions and are not inferred by this core pack.']
 }
};

function assertCents(value:number,name:string){
 if(!Number.isSafeInteger(value)||value<0||value>MAX_SAFE_CENTS)throw new Error(`${name} must be a nonnegative safe integer number of cents.`);
}

export function calculateProgressiveTax(taxableIncomeCents:MoneyCents,brackets:Bracket[]){
 assertCents(taxableIncomeCents,'taxableIncomeCents');
 let remaining=taxableIncomeCents,lower=0,tax=0;
 const lines:{fromCents:number;toCents:number;taxableBandCents:number;rateBasisPoints:number;taxCents:number}[]=[];
 for(const bracket of brackets){
  const upper=bracket.upToCents??taxableIncomeCents;
  const width=Math.max(0,upper-lower);
  const band=Math.min(remaining,width);
  if(band>0){const bandTax=Math.round((band*bracket.rateBasisPoints)/10000);tax+=bandTax;lines.push({fromCents:lower,toCents:upper,taxableBandCents:band,rateBasisPoints:bracket.rateBasisPoints,taxCents:bandTax});remaining-=band;}
  lower=upper;
  if(remaining<=0)break;
 }
 return {taxCents:tax,lines};
}

export function calculateStandardDeduction(input:{taxYear:number;filingStatus:FilingStatus;dependent:boolean;earnedIncomeCents?:MoneyCents;age65OrOlderCount?:number;blindCount?:number}){
 const pack=annualRulePacks[input.taxYear];
 if(!pack)return {status:'UNSUPPORTED' as CalculationStatus,amountCents:0,reason:`No approved rule pack exists for tax year ${input.taxYear}.`};
 let amount=pack.standardDeduction[input.filingStatus];
 const notes:string[]=[];
 if(input.dependent){const earned=input.earnedIncomeCents??0;assertCents(earned,'earnedIncomeCents');amount=Math.min(amount,Math.max(pack.dependentStandardDeduction.minimumCents,earned+pack.dependentStandardDeduction.earnedIncomeIncrementCents));notes.push('Dependent standard-deduction limitation applied.');}
 const extraCount=Math.max(0,Math.floor(input.age65OrOlderCount??0)+Math.floor(input.blindCount??0));
 if(extraCount>0)notes.push('Additional age/blind standard deduction requires a year- and filing-status-specific supplemental rule not included in this core pack.');
 return {status:extraCount>0?'HOLD' as CalculationStatus:'PASS' as CalculationStatus,amountCents:amount,notes,citations:pack.officialSources};
}

export function calculateChildTaxCredit(input:{taxYear:number;filingStatus:FilingStatus;magiCents:MoneyCents;qualifyingChildren:number;allRequiredSsnsValidForEmployment:boolean}){
 const pack=annualRulePacks[input.taxYear];
 if(!pack)return {status:'UNSUPPORTED' as CalculationStatus,creditCents:0,reason:`No approved rule pack exists for tax year ${input.taxYear}.`};
 assertCents(input.magiCents,'magiCents');
 if(!input.allRequiredSsnsValidForEmployment)return {status:'HOLD' as CalculationStatus,creditCents:0,reason:'Required valid-for-employment SSN condition is unresolved.',citations:pack.officialSources};
 const children=Math.max(0,Math.floor(input.qualifyingChildren));
 const gross=children*pack.childTaxCredit.maximumPerChildCents;
 const excess=Math.max(0,input.magiCents-pack.childTaxCredit.phaseoutStartCents[input.filingStatus]);
 const increments=Math.ceil(excess/dollars(1000));
 const reduction=increments*pack.childTaxCredit.phaseoutPerThousandCents;
 return {status:'PASS' as CalculationStatus,creditCents:Math.max(0,gross-reduction),grossCreditCents:gross,phaseoutReductionCents:reduction,refundablePortionStatus:'REQUIRES_SEPARATE_ACTC_MODULE',citations:pack.officialSources};
}

export function calculateCoreIndividualReturn(input:{taxYear:number;filingStatus:FilingStatus;grossIncomeCents:MoneyCents;adjustmentsCents:MoneyCents;itemizedDeductionCents:MoneyCents;dependent:boolean;earnedIncomeCents?:MoneyCents;qualifyingChildren:number;magiCents:MoneyCents;allRequiredSsnsValidForEmployment:boolean}){
 const pack=annualRulePacks[input.taxYear];
 if(!pack)return {engine:CALCULATION_ENGINE,status:'UNSUPPORTED' as CalculationStatus,reason:`No approved rule pack exists for tax year ${input.taxYear}.`};
 for(const [name,value] of Object.entries({grossIncomeCents:input.grossIncomeCents,adjustmentsCents:input.adjustmentsCents,itemizedDeductionCents:input.itemizedDeductionCents,magiCents:input.magiCents}))assertCents(value,name);
 const agiCents=Math.max(0,input.grossIncomeCents-input.adjustmentsCents);
 const standard=calculateStandardDeduction({taxYear:input.taxYear,filingStatus:input.filingStatus,dependent:input.dependent,earnedIncomeCents:input.earnedIncomeCents});
 const deductionCents=Math.max(standard.amountCents,input.itemizedDeductionCents);
 const deductionMethod=input.itemizedDeductionCents>standard.amountCents?'ITEMIZED':'STANDARD';
 const taxableIncomeCents=Math.max(0,agiCents-deductionCents);
 const incomeTax=calculateProgressiveTax(taxableIncomeCents,pack.brackets[input.filingStatus]);
 const ctc=calculateChildTaxCredit({taxYear:input.taxYear,filingStatus:input.filingStatus,magiCents:input.magiCents,qualifyingChildren:input.qualifyingChildren,allRequiredSsnsValidForEmployment:input.allRequiredSsnsValidForEmployment});
 const taxAfterCoreCreditCents=Math.max(0,incomeTax.taxCents-ctc.creditCents);
 const holds=[...(standard.status==='HOLD'?standard.notes:[]),...(ctc.status==='HOLD'?[ctc.reason]:[])].filter(Boolean);
 return {engine:CALCULATION_ENGINE,engineScale:CALCULATION_SCALE,rulePack:{taxYear:pack.taxYear,revision:pack.revision},status:holds.length?'HOLD' as CalculationStatus:'PASS' as CalculationStatus,results:{agiCents,deductionMethod,deductionCents,taxableIncomeCents,incomeTaxCents:incomeTax.taxCents,childTaxCreditCents:ctc.creditCents,taxAfterCoreCreditCents},calculationTrace:{brackets:incomeTax.lines,standardDeduction:standard,childTaxCredit:ctc},holds,citations:pack.officialSources,limitations:['This core engine does not yet calculate every federal credit, deduction, recapture, AMT, NIIT, self-employment tax, QBI, education credit, premium tax credit, foreign tax credit, estate/trust item, business credit, or state tax.','Unsupported provisions must be routed to a versioned form-specific module and human review; they are never estimated silently.'],auditEventId:`calc_${crypto.randomUUID()}`,calculatedAt:new Date().toISOString()};
}
