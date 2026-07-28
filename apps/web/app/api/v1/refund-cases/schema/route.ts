import {apiResponse,requestContext} from '../../../../../lib/api';
import {routing} from '../../../../../lib/refund-case';

export const dynamic='force-dynamic';

export async function GET(request:Request){
 const context=requestContext(request);
 return apiResponse({ok:true,aggregate:'RefundCase',version:'1.0.0',flow:['AUTHORIZED','CAPTURED','NORMALIZED','RECONCILED','DECISIONED','ROUTED','LOGGED','RETAINED'],requiredCollections:['evidence','transcripts','treasury','refundProducts','notices','identities','returns','authorizations','audit'],stations:Object.keys(routing),routing,contracts:{process:'POST /api/v1/refund-cases/process'},controls:['No external retrieval is performed by this endpoint.','No agency state is invented.','Inactive authorization causes a HOLD.','Conflicts and refund-hold indicators require human review.','Client-safe narratives remain evidence scoped.']},200,context.correlationId);
}
