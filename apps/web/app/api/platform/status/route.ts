import {NextResponse} from 'next/server';
import {platformRoutes} from '../../../../lib/routes';

const enabled=(name:string)=>process.env[name]?.toLowerCase()==='true';
const configured=(names:string[])=>names.length===0||names.every(name=>Boolean(process.env[name]?.trim()));
const integration=(flag:string,requirements:string[],disabledStatus='disabled_pending_configuration')=>{
 const isEnabled=enabled(flag);
 const isConfigured=configured(requirements);
 return {enabled:isEnabled,configured:isConfigured,status:isEnabled?(isConfigured?'ready':'misconfigured'):disabledStatus};
};

export const dynamic='force-dynamic';

export async function GET(){
 const integrations={
  identity:integration('IDENTITY_ENABLED',['COGNITO_USER_POOL_ID','COGNITO_CLIENT_ID']),
  documentVault:integration('DOCUMENT_VAULT_ENABLED',['DOCUMENT_BUCKET_NAME','AWS_REGION']),
  notifications:integration('NOTIFICATIONS_ENABLED',['NOTIFICATION_FROM_ADDRESS','AWS_REGION']),
  irsGateway:integration('IRS_GATEWAY_ENABLED',['IRS_GATEWAY_BASE_URL','IRS_GATEWAY_CLIENT_ID'],'disabled_pending_approval'),
  tds:integration('IRS_TDS_ENABLED',['IRS_TDS_BASE_URL','IRS_TDS_CERTIFICATE_ARN'],'disabled_pending_approval'),
  sor:integration('IRS_SOR_ENABLED',['IRS_SOR_BASE_URL','IRS_SOR_CERTIFICATE_ARN'],'disabled_pending_approval'),
  tinMatching:integration('IRS_TIN_MATCHING_ENABLED',['IRS_TIN_MATCHING_BASE_URL'],'disabled_pending_approval'),
  iris:integration('IRS_IRIS_ENABLED',['IRS_IRIS_BASE_URL','IRS_IRIS_CLIENT_ID'],'disabled_pending_testing'),
  payroll:integration('PAYROLL_ENGINE_ENABLED',['PAYROLL_API_BASE_URL']),
  sbtpg:{enabled:false,configured:false,status:'portal_assisted'}
 };
 const routeSummary={total:platformRoutes.length,available:platformRoutes.filter(route=>route.status==='available').length,gated:platformRoutes.filter(route=>route.status==='gated').length,planned:platformRoutes.filter(route=>route.status==='planned').length};
 const response={platform:'WORKSPACEIRS',operational:true,environment:process.env.NEXT_PUBLIC_DEPLOY_ENV??process.env.AWS_BRANCH??process.env.NODE_ENV??'unknown',version:process.env.APP_VERSION??'0.1.0',commit:process.env.AWS_COMMIT_ID??process.env.COMMIT_SHA??null,routeSummary,integrations,timestamp:new Date().toISOString()};
 return NextResponse.json(response,{headers:{'Cache-Control':'no-store, max-age=0','X-Robots-Tag':'noindex, nofollow'}});
}
