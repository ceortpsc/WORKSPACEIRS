import {NextResponse} from 'next/server';
import {platformRoutes} from '../../../lib/routes';

export const dynamic='force-dynamic';

export async function GET(){
 const routes=platformRoutes.map(({slug,title,category,access,status,description,integrations})=>({path:`/${slug}`,slug,title,category,access,status,description,integrations}));
 return NextResponse.json({platform:'WORKSPACEIRS',count:routes.length,routes,timestamp:new Date().toISOString()},{headers:{'Cache-Control':'no-store, max-age=0','X-Robots-Tag':'noindex, nofollow'}});
}
