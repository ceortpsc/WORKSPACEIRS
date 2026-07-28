import {NextRequest} from 'next/server';
import {apiResponse,requestContext} from '../../../../../lib/api';
import {certificationSummary} from '../../../../../lib/application-certification';

export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const context=requestContext(request);
 const raw=request.nextUrl.searchParams.get('domain');
 const allowed=['APPLICATION','EFILE','SECURITY','INFRASTRUCTURE','INTEGRATIONS'] as const;
 const domain=allowed.includes(raw as typeof allowed[number])?raw as typeof allowed[number]:undefined;
 return apiResponse({ok:true,...certificationSummary(domain),controls:{evidenceRequiredForPass:true,externalAuthorizationNotImplied:true,failClosed:true}},200,context.correlationId);
}
