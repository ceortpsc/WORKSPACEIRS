import {createHmac,timingSafeEqual} from 'node:crypto';
import {NextResponse} from 'next/server';

export type OperationalAuth={
 allowed:boolean;
 mode:'trusted_identity'|'synthetic'|'denied';
 subject:string|null;
 tenantId:string|null;
 role:string|null;
 code?:string;
 message?:string;
 httpStatus?:number;
};

export function requestContext(request:Request){
 const supplied=request.headers.get('x-correlation-id')?.trim();
 return {correlationId:supplied||`cor_${crypto.randomUUID()}`,idempotencyKey:request.headers.get('x-idempotency-key')?.trim()||null,approvalToken:request.headers.get('x-approval-token')?.trim()||null,schemaVersion:request.headers.get('x-schema-version')?.trim()||null};
}

export function apiResponse(body:Record<string,unknown>,status=200,correlationId?:string){
 return NextResponse.json({...body,correlationId:correlationId??`cor_${crypto.randomUUID()}`,timestamp:new Date().toISOString()},{status,headers:{'Cache-Control':'no-store, max-age=0','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'}});
}

export function apiError(code:string,message:string,status:number,correlationId:string,details?:Record<string,unknown>){
 return apiResponse({ok:false,error:{code,message,retryable:status>=500,...(details??{})}},status,correlationId);
}

export async function readJson(request:Request):Promise<Record<string,unknown>>{
 const contentLength=Number(request.headers.get('content-length')??0);
 if(contentLength>64_000)throw new Error('REQUEST_TOO_LARGE');
 const payload=await request.json();
 if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new Error('JSON_OBJECT_REQUIRED');
 return payload as Record<string,unknown>;
}

const envTrue=(name:string)=>process.env[name]?.toLowerCase()==='true';
const productionStage=()=>['production','prod','main'].includes((process.env.DEPLOYMENT_STAGE??process.env.NEXT_PUBLIC_DEPLOY_ENV??process.env.AWS_BRANCH??'development').toLowerCase());
const normalizedRole=(role:string|null)=>role?.trim().toUpperCase()??null;

function safeSignatureEqual(expected:string,provided:string){
 if(!/^[a-f0-9]{64}$/i.test(provided))return false;
 const left=Buffer.from(expected,'hex');const right=Buffer.from(provided,'hex');
 return left.length===right.length&&timingSafeEqual(left,right);
}

export function authorizeOperationalRequest(request:Request,options:{allowSynthetic?:boolean;roles?:string[]}={}):OperationalAuth{
 const synthetic=request.headers.get('x-rtpsc-synthetic')?.toLowerCase()==='true';
 if(synthetic){
  if(!options.allowSynthetic||productionStage()||!envTrue('SYNTHETIC_WORKBENCH_ENABLED'))return {allowed:false,mode:'denied',subject:null,tenantId:null,role:null,code:'SYNTHETIC_MODE_DISABLED',message:'Synthetic execution is disabled for this environment or endpoint.',httpStatus:403};
  const tenantId=request.headers.get('x-tenant-id')?.trim()??null;
  if(tenantId!=='synthetic-tenant')return {allowed:false,mode:'denied',subject:null,tenantId,role:'SYNTHETIC_VERIFIER',code:'SYNTHETIC_TENANT_REQUIRED',message:'Synthetic requests are restricted to synthetic-tenant.',httpStatus:403};
  return {allowed:true,mode:'synthetic',subject:'synthetic-verifier',tenantId,role:'SYNTHETIC_VERIFIER'};
 }

 if(!envTrue('IDENTITY_ENABLED')||!envTrue('IDENTITY_CONFIGURED'))return {allowed:false,mode:'denied',subject:null,tenantId:null,role:null,code:'IDENTITY_GATE_CLOSED',message:'The trusted identity boundary is not enabled and configured.',httpStatus:423};
 const authorization=request.headers.get('authorization')?.trim()??'';
 const subject=request.headers.get('x-rtpsc-subject')?.trim()??null;
 const tenantId=request.headers.get('x-tenant-id')?.trim()??null;
 const role=normalizedRole(request.headers.get('x-rtpsc-role'));
 const issuedAt=request.headers.get('x-rtpsc-auth-ts')?.trim()??'';
 const providedSignature=request.headers.get('x-rtpsc-auth-signature')?.trim()??'';
 const secret=process.env.IDENTITY_ASSERTION_SECRET?.trim()??'';
 if(!authorization.startsWith('Bearer ')||!subject||!tenantId||!role||!issuedAt||!providedSignature||secret.length<32)return {allowed:false,mode:'denied',subject,tenantId,role,code:'AUTHENTICATION_REQUIRED',message:'A bearer token and complete trusted identity assertion are required.',httpStatus:401};
 const issuedAtMs=Number(issuedAt);const now=Date.now();
 if(!Number.isFinite(issuedAtMs)||Math.abs(now-issuedAtMs)>300_000)return {allowed:false,mode:'denied',subject,tenantId,role,code:'IDENTITY_ASSERTION_EXPIRED',message:'The trusted identity assertion is expired or invalid.',httpStatus:401};
 const tokenDigest=createHmac('sha256',secret).update(authorization.slice(7)).digest('hex');
 const signedMaterial=[subject,tenantId,role,issuedAt,tokenDigest].join('\n');
 const expected=createHmac('sha256',secret).update(signedMaterial).digest('hex');
 if(!safeSignatureEqual(expected,providedSignature))return {allowed:false,mode:'denied',subject,tenantId,role,code:'INVALID_IDENTITY_ASSERTION',message:'The trusted identity assertion signature is invalid.',httpStatus:401};
 const allowedRoles=(options.roles??[]).map(item=>item.toUpperCase());
 if(allowedRoles.length&&!allowedRoles.includes(role))return {allowed:false,mode:'denied',subject,tenantId,role,code:'ROLE_FORBIDDEN',message:'The authenticated role is not authorized for this operation.',httpStatus:403};
 return {allowed:true,mode:'trusted_identity',subject,tenantId,role};
}

const sensitiveKey=/(^|_)(ssn|tin|ein|dob|birth|email|phone|address|routing|account|bank|password|secret|token|name)($|_)/i;
const sensitiveValue=/(\b\d{3}-?\d{2}-?\d{4}\b|\b\d{9}\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)/i;

export function validateSyntheticPayload(payload:unknown,path='payload'):string|null{
 if(payload===null||payload===undefined)return null;
 if(typeof payload==='string')return payload.length>5000?`${path} exceeds the synthetic length limit.`:sensitiveValue.test(payload)?`${path} appears to contain prohibited real-world identifying data.`:null;
 if(typeof payload==='number'||typeof payload==='boolean')return null;
 if(Array.isArray(payload)){
  if(payload.length>100)return `${path} exceeds the synthetic item limit.`;
  for(let index=0;index<payload.length;index++){const error=validateSyntheticPayload(payload[index],`${path}[${index}]`);if(error)return error;}
  return null;
 }
 if(typeof payload==='object'){
  for(const [key,value] of Object.entries(payload as Record<string,unknown>)){
   if(sensitiveKey.test(key))return `${path}.${key} is not permitted in synthetic mode.`;
   const error=validateSyntheticPayload(value,`${path}.${key}`);if(error)return error;
  }
 }
 return null;
}

export function validateTenantScope(auth:OperationalAuth,payload:Record<string,unknown>):string|null{
 const bodyTenant=typeof payload.tenantId==='string'?payload.tenantId:payload.scope&&typeof payload.scope==='object'&&!Array.isArray(payload.scope)&&typeof (payload.scope as Record<string,unknown>).tenantId==='string'?String((payload.scope as Record<string,unknown>).tenantId):null;
 if(!auth.tenantId)return 'Authenticated tenant scope is missing.';
 if(bodyTenant&&bodyTenant!==auth.tenantId)return 'Request tenant scope does not match the authenticated tenant.';
 if(auth.mode==='synthetic'){
  const syntheticError=validateSyntheticPayload(payload);if(syntheticError)return syntheticError;
  const serialized=JSON.stringify(payload);
  if(!/(synthetic|demo)/i.test(serialized))return 'Synthetic requests must use clearly synthetic identifiers.';
 }
 return null;
}
