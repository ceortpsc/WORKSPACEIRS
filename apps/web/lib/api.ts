import {NextResponse} from 'next/server';

export function requestContext(request:Request){
 const supplied=request.headers.get('x-correlation-id')?.trim();
 return {correlationId:supplied||`cor_${crypto.randomUUID()}`,idempotencyKey:request.headers.get('x-idempotency-key')?.trim()||null,approvalToken:request.headers.get('x-approval-token')?.trim()||null,schemaVersion:request.headers.get('x-schema-version')?.trim()||null};
}

export function apiResponse(body:Record<string,unknown>,status=200,correlationId?:string){
 return NextResponse.json({...body,correlationId:correlationId??`cor_${crypto.randomUUID()}`,timestamp:new Date().toISOString()},{status,headers:{'Cache-Control':'no-store, max-age=0','X-Robots-Tag':'noindex, nofollow'}});
}

export function apiError(code:string,message:string,status:number,correlationId:string,details?:Record<string,unknown>){
 return apiResponse({ok:false,error:{code,message,retryable:status>=500,...(details??{})}},status,correlationId);
}

export async function readJson(request:Request):Promise<Record<string,unknown>>{
 const payload=await request.json();
 if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new Error('JSON_OBJECT_REQUIRED');
 return payload as Record<string,unknown>;
}
