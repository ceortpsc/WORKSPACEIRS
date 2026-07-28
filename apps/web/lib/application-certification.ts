export type EvidenceStatus='PASS'|'FAIL'|'BLOCKED'|'NOT_TESTED';
export type EvidenceDomain='APPLICATION'|'EFILE'|'SECURITY'|'INFRASTRUCTURE'|'INTEGRATIONS';
export type CertificationEvidence={id:string;domain:EvidenceDomain;title:string;description:string;status:EvidenceStatus;required:boolean;evidence:string[];blockers:string[];owner:string;lastEvaluatedAt:string};

const truthy=(name:string)=>['1','true','yes','enabled','pass'].includes((process.env[name]??'').toLowerCase());
const present=(name:string)=>Boolean((process.env[name]??'').trim());
const now=()=>new Date().toISOString();
const result=(input:Omit<CertificationEvidence,'lastEvaluatedAt'>):CertificationEvidence=>({...input,lastEvaluatedAt:now()});
const gate=(id:string,domain:EvidenceDomain,title:string,description:string,owner:string,requirements:{flag?:string;refs?:string[];evidence?:string[]}):CertificationEvidence=>{
 const missing=(requirements.refs??[]).filter(name=>!present(name));
 const enabled=requirements.flag?truthy(requirements.flag):true;
 const pass=enabled&&missing.length===0;
 return result({id,domain,title,description,status:pass?'PASS':'BLOCKED',required:true,owner,evidence:pass?[...(requirements.evidence??[]),...(requirements.refs??[]).map(name=>`${name} configured`)]:[],blockers:[...(!enabled&&requirements.flag?[`${requirements.flag} is not verified`]:[]),...missing.map(name=>`${name} is missing`)]});
};

export function applicationCertificationEvidence():CertificationEvidence[]{
 const buildPass=present('BUILD_COMMIT')&&present('APP_VERSION');
 const records:CertificationEvidence[]=[
  result({id:'APP-BUILD-001',domain:'APPLICATION',title:'Immutable production build',description:'Application version and commit metadata are attached to the running release.',status:buildPass?'PASS':'BLOCKED',required:true,owner:'Release Engineering',evidence:buildPass?[`Commit ${process.env.BUILD_COMMIT}`,`Version ${process.env.APP_VERSION}`]:[],blockers:buildPass?[]:['BUILD_COMMIT and APP_VERSION are required']}),
  gate('APP-SMOKE-002','APPLICATION','Production server smoke suite','Critical pages, APIs, access-denial controls, and readiness behavior passed against a production build.','Quality Engineering',{flag:'SMOKE_TESTS_VERIFIED',evidence:['Server smoke suite attested']}),
  gate('APP-ROUTES-003','APPLICATION','Multi-page Next.js route suite','Public, authenticated, restricted, and certification dashboards are compiled and route-tested.','Web Engineering',{flag:'ROUTE_SUITE_VERIFIED',evidence:['Next.js route suite attested']}),
  gate('APP-ROLLBACK-004','APPLICATION','Release rollback validation','A documented rollback path has been tested for this release.','Release Engineering',{flag:'ROLLBACK_VERIFIED',evidence:['Rollback exercise attested']}),

  gate('EF-SCHEMA-001','EFILE','Schema and business-rule gate','Active tax-year schemas and business rules are versioned, verified, and isolated by ATS or production environment.','ERO / E-file Engineering',{flag:'EFILE_SCHEMA_VERIFIED',refs:['EFILE_SCHEMA_REGISTRY_REF','EFILE_BUSINESS_RULES_REF']}),
  gate('EF-APPROVAL-002','EFILE','Human approval and signature gate','8879 or applicable authorization, taxpayer approval, reviewer disposition, and ERO release evidence are complete.','ERO Owner',{flag:'EFILE_APPROVAL_GATE_VERIFIED',refs:['EFILE_APPROVAL_POLICY_REF']}),
  gate('EF-IDEMPOTENCY-003','EFILE','Idempotency and duplicate protection','Submission keys, duplicate detection, retry policy, and immutable submission intent are verified.','E-file Engineering',{flag:'EFILE_IDEMPOTENCY_VERIFIED',refs:['EFILE_IDEMPOTENCY_STORE_REF']}),
  gate('EF-ACK-004','EFILE','Acknowledgment and reject correlation','Submission identifiers, acknowledgments, rejects, retry lineage, and delivery evidence are correlated.','E-file Operations',{flag:'EFILE_ACK_CORRELATION_VERIFIED',refs:['EFILE_ACK_VAULT_REF']}),
  gate('EF-MEF-005','EFILE','IRS MeF gateway','Provider authorization, ATS evidence, certificates, approved endpoints, and production release approval are verified.','ERO Owner',{flag:'IRS_MEF_GATE_VERIFIED',refs:['IRS_MEF_PROVIDER_REF','IRS_MEF_CERTIFICATE_REF','IRS_MEF_ENDPOINT_REF','IRS_MEF_ATS_EVIDENCE_REF']}),

  gate('SEC-IAM-001','SECURITY','Identity, MFA, and tenant isolation','Production identity provider, MFA enforcement, role policy, and tenant isolation tests are verified.','Security Officer',{flag:'ACCESS_CONTROL_TESTS_VERIFIED',refs:['IDENTITY_PROVIDER_REF','TENANT_POLICY_REF']}),
  gate('SEC-ENC-002','SECURITY','Encryption and key management','Encryption at rest and in transit, managed keys, rotation, and secret storage are verified.','Security Officer',{flag:'ENCRYPTION_VERIFIED',refs:['KMS_KEY_REF','SECRETS_STORE_REF']}),
  gate('SEC-WAF-003','SECURITY','Firewall, WAF, rate limits, and bot controls','Edge firewall, managed rules, rate limiting, abuse detection, and bot mitigation are verified.','Security Operations',{flag:'EDGE_SECURITY_VERIFIED',refs:['WAF_ACL_REF','RATE_LIMIT_POLICY_REF']}),
  gate('SEC-MALWARE-004','SECURITY','Malware scanning and quarantine','Uploads are scanned, quarantined on failure, and released only after clean disposition.','Security Operations',{flag:'MALWARE_PIPELINE_VERIFIED',refs:['MALWARE_SCANNER_REF','QUARANTINE_BUCKET_REF']}),
  gate('SEC-AUDIT-005','SECURITY','Immutable audit and retention','Material events, approvals, transmissions, acknowledgments, and administrator actions are retained immutably.','Compliance Officer',{flag:'AUDIT_CONFIGURED',refs:['AUDIT_STORE_NAME','RETENTION_POLICY_REF']}),

  gate('INF-DB-001','INFRASTRUCTURE','Production database','Encrypted database, migrations, backups, restore evidence, and row-level tenant controls are verified.','Platform Engineering',{flag:'DATABASE_CONFIGURED',refs:['DATABASE_URL','DATABASE_MIGRATION_REF','DATABASE_BACKUP_REF']}),
  gate('INF-QUEUE-002','INFRASTRUCTURE','Worker queue and DLQ','Work queue, dead-letter queue, retry limits, alarms, and replay procedures are verified.','Platform Engineering',{flag:'EVENTS_CONFIGURED',refs:['WORK_QUEUE_URL','DEAD_LETTER_QUEUE_URL','QUEUE_ALARM_REF']}),
  gate('INF-VAULT-003','INFRASTRUCTURE','Immutable acknowledgment vault','Acknowledgments and regulated evidence are encrypted, versioned, immutable, and retention-controlled.','Platform Engineering',{flag:'DOCUMENT_VAULT_CONFIGURED',refs:['DOCUMENT_BUCKET_NAME','EFILE_ACK_VAULT_REF']}),
  gate('INF-DNS-004','INFRASTRUCTURE','Domain, DNS, and TLS certificate','Production domain, Route 53 records, certificate validation, and HTTPS enforcement are verified.','Platform Engineering',{flag:'DOMAIN_TLS_VERIFIED',refs:['NEXT_PUBLIC_SITE_URL','ROUTE53_HOSTED_ZONE_REF','ACM_CERTIFICATE_REF']}),
  gate('INF-OBS-005','INFRASTRUCTURE','Monitoring, alarms, and incident response','Health, logs, alarms, dashboards, paging, incident runbook, and recovery contacts are verified.','Site Reliability',{flag:'OBSERVABILITY_VERIFIED',refs:['MONITORING_DASHBOARD_REF','INCIDENT_RUNBOOK_REF']}),

  gate('INT-MEF-001','INTEGRATIONS','Connected MeF contract','The MeF adapter contract is enabled only after the external evidence gate passes.','ERO Owner',{flag:'IRS_MEF_GATE_VERIFIED',refs:['IRS_MEF_PROVIDER_REF']}),
  gate('INT-SCHEMA-002','INTEGRATIONS','Connected schema registry','Schema artifacts are signed, versioned, and resolvable by tax year and environment.','E-file Engineering',{flag:'EFILE_SCHEMA_VERIFIED',refs:['EFILE_SCHEMA_REGISTRY_REF']}),
  gate('INT-WORKERS-003','INTEGRATIONS','Connected worker execution plane','Workers consume controlled jobs, enforce idempotency, emit audit events, and route failures to DLQ.','Platform Engineering',{flag:'WORKER_RUNTIME_VERIFIED',refs:['WORK_QUEUE_URL','DEAD_LETTER_QUEUE_URL','WORKER_SERVICE_REF']}),
  gate('INT-ACK-004','INTEGRATIONS','Connected acknowledgment vault','Acknowledgments and reject payloads are correlated and stored in the immutable evidence vault.','E-file Operations',{flag:'EFILE_ACK_CORRELATION_VERIFIED',refs:['EFILE_ACK_VAULT_REF']}),
 ];
 return records;
}

export function certificationSummary(domain?:EvidenceDomain){
 const evidence=applicationCertificationEvidence().filter(item=>!domain||item.domain===domain);
 const counts={PASS:0,FAIL:0,BLOCKED:0,NOT_TESTED:0};
 for(const item of evidence)counts[item.status]++;
 return {domain:domain??'ALL',total:evidence.length,counts,certified:evidence.every(item=>!item.required||item.status==='PASS'),evidence};
}
