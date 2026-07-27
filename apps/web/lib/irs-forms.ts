export type IrsProductType='form'|'schedule'|'instruction'|'publication'|'other';
export type IrsFilingCategory='individual'|'business'|'employment'|'information-reporting'|'estate-gift-trust'|'tax-exempt'|'international'|'excise'|'representation-collection'|'retirement'|'general';
export type IrsUsageTier='common'|'specialized'|'rare';

export type IrsProduct={
 productNumber:string;
 title:string;
 revisionDate:string;
 postedDate:string;
 officialUrl:string;
 sourceUrl:string;
 productType:IrsProductType;
 filingCategory:IrsFilingCategory;
 usageTier:IrsUsageTier;
 language:'English'|'Spanish'|'Other';
 efileFamily:string|null;
};

const commonProducts=new Set([
 'Form 1040','Form 1040-SR','Form 1040-X','Form 1040-ES','Form 1040 (Schedule 1)','Form 1040 (Schedule 1-A)','Form 1040 (Schedule 2)','Form 1040 (Schedule 3)','Form 1040 (Schedule A)','Form 1040 (Schedule B)','Form 1040 (Schedule C)','Form 1040 (Schedule D)','Form 1040 (Schedule E)','Form 1040 (Schedule EIC)','Form 1040 (Schedule F)','Form 1040 (Schedule H)','Form 1040 (Schedule J)','Form 1040 (Schedule R)','Form 1040 (Schedule SE)','Form 8812','Form 8863','Form 8867','Form 8879','Form 8889','Form 8962','Form 8995','Form W-2','Form W-3','Form W-4','Form W-9','Form 1099-MISC','Form 1099-NEC','Form 1099-INT','Form 1099-DIV','Form 1099-R','Form 1098','Form 1098-T','Form 941','Form 940','Form 944','Form 1065','Form 1120','Form 1120-S','Form 1041','Form 7004','Form 4868','Form 2848','Form 8821','Form 4506-T','Form 9465','Form SS-4'
]);

const specializedPrefixes=['Form 706','Form 709','Form 990','Form 1042','Form 1120-F','Form 1120-PC','Form 1120-L','Form 1120-REIT','Form 1120-RIC','Form 2290','Form 720','Form 8849','Form 5500','Form 3520','Form 5471','Form 5472','Form 8858','Form 8865','Form 8938','Form 1116','Form 2555','Form 8594','Form 3115','Form 433','Form 656','Form 843'];

const normalize=(value:string)=>value.replace(/\s+/g,' ').trim();

export function classifyProduct(productNumber:string,title:string){
 const product=normalize(productNumber);const combined=`${product} ${title}`.toLowerCase();
 const productType:IrsProductType=product.toLowerCase().startsWith('instruction')?'instruction':product.toLowerCase().startsWith('publication')?'publication':/schedule/i.test(product)?'schedule':product.toLowerCase().startsWith('form')?'form':'other';
 let filingCategory:IrsFilingCategory='general';
 if(/1040|individual|earned income|child tax|education credit|estimated tax for individuals/.test(combined))filingCategory='individual';
 if(/1065|1120|business|partnership|corporation|schedule c|schedule f|self-employed/.test(combined))filingCategory='business';
 if(/941|940|943|944|945|w-2|w-3|w-4|employment|payroll|withholding certificate/.test(combined))filingCategory='employment';
 if(/1099|1098|w-9|information return|1096|3921|3922|5498/.test(combined))filingCategory='information-reporting';
 if(/706|709|1041|estate|gift|trust|generation-skipping/.test(combined))filingCategory='estate-gift-trust';
 if(/990|1023|1024|tax-exempt|charit|nonprofit/.test(combined))filingCategory='tax-exempt';
 if(/1042|foreign|international|5471|5472|8858|8865|8938|1116|2555|3520/.test(combined))filingCategory='international';
 if(/720|2290|8849|excise|fuel tax|heavy highway/.test(combined))filingCategory='excise';
 if(/2848|8821|4506|433|656|9465|843|appeal|collection|power of attorney|authorization|installment agreement|offer in compromise/.test(combined))filingCategory='representation-collection';
 if(/retirement|pension|ira|5500|5498|1099-r/.test(combined))filingCategory='retirement';
 const usageTier:IrsUsageTier=commonProducts.has(product)?'common':specializedPrefixes.some(prefix=>product.startsWith(prefix))?'specialized':'rare';
 const language:'English'|'Spanish'|'Other'=/\(sp\)|spanish/i.test(combined)?'Spanish':'English';
 return {productType,filingCategory,usageTier,language,efileFamily:resolveEfileFamily(product)};
}

export function resolveEfileFamily(productNumber:string){
 const value=productNumber.toUpperCase();
 if(/1040|4868/.test(value))return '1040 series and extensions';
 if(/1041/.test(value))return '1041 fiduciary';
 if(/1042/.test(value))return '1042 withholding';
 if(/1065/.test(value))return '1065 partnership';
 if(/1120/.test(value))return '1120 corporate';
 if(/7004/.test(value))return '7004 business extensions';
 if(/720|2290|8849/.test(value))return 'ETEC excise';
 if(/940|941|943|944|945/.test(value))return '94x employment tax';
 if(/990/.test(value))return '990 exempt organization';
 return null;
}

export const officialIrsSources={
 currentCatalog:'https://www.irs.gov/forms-instructions-and-publications',
 currentSearch:'https://www.irs.gov/forms-instructions',
 priorYears:'https://www.irs.gov/prior-year-forms-and-instructions',
 postReleaseChanges:'https://www.irs.gov/forms-pubs/changes-to-current-forms-instructions',
 mefSchemas:'https://www.irs.gov/e-file-providers/modernized-e-file-mef-schemas-and-business-rules'
};

export const mefFamilies=[
 {name:'Individual',forms:'1040 / 1040-SR / 1040-X / 4868',source:'https://www.irs.gov/tax-professionals/tax-year-2026-modernized-e-file-schema-and-business-rules-for-individual-tax-returns-and-extensions'},
 {name:'Fiduciary',forms:'1041',source:'https://www.irs.gov/e-file-providers/valid-xml-schemas-and-business-rules-for-form-1041-modernized-e-file-mef'},
 {name:'Partnership',forms:'1065',source:'https://www.irs.gov/e-file-providers/valid-xml-schemas-and-business-rules-for-1065-modernized-e-file-mef'},
 {name:'Corporate',forms:'1120 family',source:'https://www.irs.gov/e-file-providers/modernized-e-file-mef-schemas-and-business-rules'},
 {name:'Employment tax',forms:'94x family',source:'https://www.irs.gov/e-file-providers/tax-year-2026-schemas-and-business-rules-for-employment-tax-modernized-e-file-mef-forms'},
 {name:'Excise',forms:'720 / 2290 / 8849',source:'https://www.irs.gov/e-file-providers/valid-xml-schemas-and-business-rules-for-form-720-modernized-e-file-mef'}
];

export const starterFilingSets=[
 {name:'Individual core return',forms:['Form 1040','Form 1040 (Schedule 1)','Form 1040 (Schedule 2)','Form 1040 (Schedule 3)','Form 8879']},
 {name:'Self-employed individual',forms:['Form 1040','Form 1040 (Schedule C)','Form 1040 (Schedule SE)','Form 8995','Form 8879']},
 {name:'Partnership return',forms:['Form 1065','Form 1065 (Schedule K-1)','Form 8825','Form 8879-PE']},
 {name:'S corporation return',forms:['Form 1120-S','Form 1120-S (Schedule K-1)','Form 8879-S']},
 {name:'Employer quarterly filing',forms:['Form 941','Form 941 (Schedule B)','Form 8974']},
 {name:'Representation and transcripts',forms:['Form 2848','Form 8821','Form 4506-T']}
];
