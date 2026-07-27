import {NextResponse} from 'next/server';
import {platformRoutes} from '../../../lib/routes';

export const dynamic='force-dynamic';

export async function GET(){
 const routes=platformRoutes.map(({slug,title,category,access,status,description,capabilities,integrations,workflow,triggers,apiEndpoints})=>({path:`/${slug}`,slug,title,category,access,status,description,capabilities,integrations,workflow,triggers,apiEndpoints}));
 const summary={total:routes.length,implemented:routes.filter(route=>route.status==='implemented').length,controlled:routes.filter(route=>route.status==='controlled').length,externalGates:routes.filter(route=>route.status==='external-gate').length};
 return NextResponse.json({platform:'WORKSPACEIRS',product:'RTPSC Operations Fabric',summary,routes,timestamp:new Date().toISOString()},{headers:{'Cache-Control':'no-store, max-age=0','X-Robots-Tag':'noindex, nofollow'}});
}
