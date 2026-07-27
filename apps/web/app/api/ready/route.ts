import {NextResponse} from 'next/server';
import {buildReadinessReport} from '../../../lib/readiness';

export const dynamic='force-dynamic';

export async function GET(){
 const report=buildReadinessReport();
 return NextResponse.json(report,{status:report.productionReady?200:503,headers:{'Cache-Control':'no-store, max-age=0','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'}});
}
