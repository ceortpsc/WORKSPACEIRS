import {NextResponse} from 'next/server';

const enabled=(name:string)=>process.env[name]==='true';
export const dynamic='force-dynamic';
export async function GET(){
 const integrations={
  irsGateway:{enabled:enabled('IRS_GATEWAY_ENABLED'),status:enabled('IRS_GATEWAY_ENABLED')?'configured':'disabled_pending_approval'},
  tds:{enabled:enabled('IRS_TDS_ENABLED'),status:enabled('IRS_TDS_ENABLED')?'configured':'disabled_pending_approval'},
  sor:{enabled:enabled('IRS_SOR_ENABLED'),status:enabled('IRS_SOR_ENABLED')?'configured':'disabled_pending_approval'},
  tinMatching:{enabled:enabled('IRS_TIN_MATCHING_ENABLED'),status:enabled('IRS_TIN_MATCHING_ENABLED')?'configured':'disabled_pending_approval'},
  iris:{enabled:enabled('IRS_IRIS_ENABLED'),status:enabled('IRS_IRIS_ENABLED')?'configured':'disabled_pending_testing'},
  sbtpg:{enabled:false,status:'portal_assisted'}
 };
 return NextResponse.json({platform:'WORKSPACEIRS',operational:true,integrations,timestamp:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
}
