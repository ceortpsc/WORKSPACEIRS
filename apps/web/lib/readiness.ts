import {getIntegrationRegistry,getRuntimeInfo} from './operations';

export type ReadinessCheck={
 key:string;
 label:string;
 category:'runtime'|'core-service'|'security-evidence'|'release-evidence'|'external-adapter';
 required:boolean;
 passed:boolean;
 status:'pass'|'block'|'warning';
 detail:string;
};

const trueFlag=(name:string)=>process.env[name]?.trim().toLowerCase()==='true';
const present=(name:string)=>Boolean(process.env[name]?.trim());

const requiredCore=[
 ['identity','Trusted identity and MFA','IDENTITY_ENABLED','IDENTITY_CONFIGURED',['IDENTITY_ASSERTION_SECRET']],
 ['tenantIsolation','Tenant isolation','TENANT_ISOLATION_ENABLED','TENANT_ISOLATION_CONFIGURED',[]],
 ['database','Durable PostgreSQL data plane','DATABASE_ENABLED','DATABASE_CONFIGURED',['DATABASE_URL']],
 ['documentVault','Encrypted document and evidence vault','DOCUMENT_VAULT_ENABLED','DOCUMENT_VAULT_CONFIGURED',['DOCUMENT_BUCKET_NAME','AWS_REGION']],
 ['audit','Immutable audit persistence','AUDIT_ENABLED','AUDIT_CONFIGURED',['AUDIT_STORE_NAME']],
 ['events','Event bus, worker queue, and dead-letter handling','EVENTS_ENABLED','EVENTS_CONFIGURED',['EVENT_BUS_NAME','WORK_QUEUE_URL','DEAD_LETTER_QUEUE_URL']]
] as const;

const requiredEvidence=[
 ['MIGRATIONS_VERIFIED','Database migrations applied and verified'],
 ['BACKUP_RESTORE_VERIFIED','Backup and restore exercise passed'],
 ['ACCESS_CONTROL_TESTS_VERIFIED','Authentication, RBAC, and tenant-isolation tests passed'],
 ['SECURITY_SCAN_VERIFIED','Dependency, secret, and application security scans passed'],
 ['SMOKE_TESTS_VERIFIED','Production smoke tests passed against the release candidate'],
 ['INCIDENT_RUNBOOK_VERIFIED','Incident response and escalation runbook approved'],
 ['RETENTION_POLICY_VERIFIED','Retention, legal hold, and deletion controls approved'],
 ['ROLLBACK_VERIFIED','Deployment rollback procedure tested']
] as const;

export function buildReadinessReport(){
 const runtime=getRuntimeInfo();
 const checks:ReadinessCheck[]=[];
 const productionStage=['production','prod','main'].includes(runtime.environment.toLowerCase());

 checks.push({key:'runtime_environment',label:'Production deployment stage',category:'runtime',required:true,passed:productionStage,status:productionStage?'pass':'block',detail:productionStage?`Deployment stage is ${runtime.environment}.`:`Deployment stage is ${runtime.environment}; production certification requires main/production.`});
 checks.push({key:'runtime_commit',label:'Immutable build commit metadata',category:'runtime',required:true,passed:runtime.commit!=='unavailable'&&runtime.commit!=='unknown',status:runtime.commit!=='unavailable'&&runtime.commit!=='unknown'?'pass':'block',detail:`Build commit: ${runtime.commit}.`});
 checks.push({key:'runtime_site_url',label:'Canonical HTTPS site URL',category:'runtime',required:true,passed:Boolean(process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https://')),status:process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https://')?'pass':'block',detail:process.env.NEXT_PUBLIC_SITE_URL??'NEXT_PUBLIC_SITE_URL is not configured.'});

 for(const [key,label,enabledFlag,configuredFlag,requiredVariables] of requiredCore){
  const enabled=trueFlag(enabledFlag);const configured=trueFlag(configuredFlag);const missing=requiredVariables.filter(name=>!present(name));
  const passed=enabled&&configured&&missing.length===0;
  checks.push({key,label,category:'core-service',required:true,passed,status:passed?'pass':'block',detail:passed?'Enabled, configured, and required runtime references are present.':`enabled=${enabled}; configured=${configured}; missing=${missing.join(', ')||'none'}`});
 }

 for(const [flag,label] of requiredEvidence){
  const passed=trueFlag(flag);
  checks.push({key:flag.toLowerCase(),label,category:'release-evidence',required:true,passed,status:passed?'pass':'block',detail:passed?'Verified release evidence is recorded.':`${flag}=true has not been recorded for this release.`});
 }

 const secretLength=process.env.IDENTITY_ASSERTION_SECRET?.length??0;
 checks.push({key:'identity_secret_strength',label:'Identity assertion signing secret strength',category:'security-evidence',required:true,passed:secretLength>=32,status:secretLength>=32?'pass':'block',detail:secretLength>=32?'Signing secret meets the minimum length contract.':'IDENTITY_ASSERTION_SECRET must contain at least 32 characters.'});
 checks.push({key:'synthetic_disabled',label:'Synthetic workbench disabled in production',category:'security-evidence',required:true,passed:!productionStage||!trueFlag('SYNTHETIC_WORKBENCH_ENABLED'),status:!productionStage||!trueFlag('SYNTHETIC_WORKBENCH_ENABLED')?'pass':'block',detail:trueFlag('SYNTHETIC_WORKBENCH_ENABLED')?'Synthetic mode is enabled.':'Synthetic mode is disabled.'});

 for(const integration of getIntegrationRegistry().filter(item=>item.category==='external')){
  const passed=!integration.enabled||integration.configured;
  checks.push({key:`external_${integration.key}`,label:integration.label,category:'external-adapter',required:integration.enabled,passed,status:passed?'pass':'block',detail:integration.enabled?`Adapter status: ${integration.status}.`:'Adapter is disabled and therefore cannot perform external actions.'});
 }

 const blockers=checks.filter(check=>check.required&&!check.passed);
 const warnings=checks.filter(check=>!check.required&&!check.passed);
 return {
  platform:'WORKSPACEIRS',
  product:'RTPSC Operations Fabric',
  runtime,
  productionReady:blockers.length===0,
  certification:blockers.length===0?'READY':'BLOCKED',
  summary:{total:checks.length,passed:checks.filter(check=>check.passed).length,blocked:blockers.length,warnings:warnings.length},
  blockers:blockers.map(check=>({key:check.key,label:check.label,detail:check.detail})),
  checks,
  generatedAt:new Date().toISOString()
 };
}
