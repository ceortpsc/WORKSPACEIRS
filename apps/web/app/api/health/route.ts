import {NextResponse} from 'next/server';
import {platformRoutes} from '../../../lib/routes';

export const dynamic='force-dynamic';

export async function GET(){
 const checks={
  application:'ok',
  routing:platformRoutes.length>0?'ok':'error',
  buildMetadata:process.env.AWS_COMMIT_ID||process.env.COMMIT_SHA?'available':'not_provided'
 };
 const healthy=Object.values(checks).every(value=>value!=='error');
 return NextResponse.json({service:'workspaceirs-web',status:healthy?'ok':'degraded',checks,routeCount:platformRoutes.length,version:process.env.APP_VERSION||'0.1.0',environment:process.env.NEXT_PUBLIC_DEPLOY_ENV??process.env.AWS_BRANCH??process.env.NODE_ENV??'unknown',timestamp:new Date().toISOString()},{status:healthy?200:503,headers:{'Cache-Control':'no-store, max-age=0','X-Robots-Tag':'noindex, nofollow'}});
}
