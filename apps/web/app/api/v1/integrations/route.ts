import {apiResponse,requestContext} from '../../../../lib/api';
import {getIntegrationRegistry,getRuntimeInfo} from '../../../../lib/operations';

export const dynamic='force-dynamic';

export async function GET(request:Request){
 const context=requestContext(request);const registry=getIntegrationRegistry();
 return apiResponse({ok:true,runtime:getRuntimeInfo(),summary:{total:registry.length,ready:registry.filter(item=>item.status==='ready').length,misconfigured:registry.filter(item=>item.status==='misconfigured').length,disabled:registry.filter(item=>item.status.startsWith('disabled_')).length},integrations:registry.map(item=>({key:item.key,label:item.label,category:item.category,enabled:item.enabled,configured:item.configured,authorizationRequired:item.authorizationRequired,status:item.status})),rules:['Disabled adapters cannot fall back to another environment.','Enabled but unconfigured adapters are treated as misconfigured and must fail closed.','Government and regulated adapters require independent authorization evidence.','This endpoint never returns credentials, tokens, certificates, keys, or private endpoint secrets.']},200,context.correlationId);
}
