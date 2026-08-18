export type ProviderGate='ACTIVE'|'BLOCKED'|'REVIEW';
export type EnrollmentStage='DRAFT'|'SUBMITTED'|'UNDER_REVIEW'|'APPROVED'|'REJECTED'|'SUSPENDED';
export type CheckStatus='NOT_FOUND'|'AUTHORIZED'|'PRINTED'|'MAILED'|'DELIVERED'|'RETURNED'|'VOIDED'|'STOPPED';

export type ProviderContract={id:string;name:string;protocol:'REST_JSON'|'XHR_JSON'|'XML_HTTPS'|'SFTP';gate:ProviderGate;requiredEvidence:string[];description:string};

export const providerContracts:ProviderContract[]=[
 {id:'refund-product-provider',name:'Refund product provider',protocol:'XML_HTTPS',gate:process.env.REFUND_PROVIDER_GATE_VERIFIED==='true'?'ACTIVE':'BLOCKED',requiredEvidence:['REFUND_PROVIDER_ENROLLMENT_REF','REFUND_PROVIDER_CLIENT_ID_REF','REFUND_PROVIDER_CERTIFICATE_REF'],description:'Enrollment, fee authorization, funding status, check metadata, acknowledgments, and settlement events.'},
 {id:'check-fulfillment',name:'Check fulfillment service',protocol:'XHR_JSON',gate:process.env.CHECK_LOOKUP_GATE_VERIFIED==='true'?'ACTIVE':'BLOCKED',requiredEvidence:['CHECK_LOOKUP_CONTRACT_REF','CHECK_LOOKUP_SECURITY_TEST_REF'],description:'Authorized check-status lookup using tenant-scoped references without exposing full account or identity values.'},
 {id:'fee-ledger',name:'Client fee ledger',protocol:'REST_JSON',gate:'ACTIVE',requiredEvidence:['INTERNAL_LEDGER_SCHEMA_REF'],description:'Internal preparation, transmission, service, bank-product, and disbursement fee calculations with approval evidence.'}
];

export const enrollmentStages:EnrollmentStage[]=['DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','SUSPENDED'];
export const checkStatuses:CheckStatus[]=['NOT_FOUND','AUTHORIZED','PRINTED','MAILED','DELIVERED','RETURNED','VOIDED','STOPPED'];

export function redactReference(value:string){const normalized=value.trim();if(normalized.length<8)return '••••';return `${normalized.slice(0,3)}••••${normalized.slice(-3)}`;}

export function buildXmlEnvelope(input:{tenantId:string;correlationId:string;operation:string;reference:string}){
 const escape=(value:string)=>value.replace(/[<>&'\"]/g,char=>({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','\"':'&quot;'}[char]??char));
 return `<?xml version="1.0" encoding="UTF-8"?>\n<ProviderRequest version="1.0">\n  <TenantId>${escape(input.tenantId)}</TenantId>\n  <CorrelationId>${escape(input.correlationId)}</CorrelationId>\n  <Operation>${escape(input.operation)}</Operation>\n  <Reference>${escape(input.reference)}</Reference>\n</ProviderRequest>`;
}
