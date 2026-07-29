import {NextRequest} from 'next/server';
import {apiError,apiResponse,authorizeOperationalRequest,readJson,requestContext,validateTenantScope} from '../../../../../lib/api';
import {createCredential,listCredentials,validateCredential,type CredentialInput} from '../../../../../lib/access-governance';

export const dynamic='force-dynamic';
const roles=['OWNER_SUPER_ADMIN','ERO_ADMIN','COMPLIANCE_OFFICER','TENANT_ADMIN'];

export async function GET(request:NextRequest){const context=requestContext(request);const auth=authorizeOperationalRequest(request,{allowSynthetic:true,roles});if(!auth.allowed)return apiError(auth.code??'ACCESS_DENIED',auth.message??'Access denied.',auth.httpStatus??403,context.correlationId);return apiResponse({ok:true,credentials:listCredentials(auth.tenantId),controls:{maskedIdentifiersOnly:true,encryptedReferenceOnly:true,externalAuthorityNotImplied:true}},200,context.correlationId);}

export async function POST(request:NextRequest){const context=requestContext(request);const auth=authorizeOperationalRequest(request,{allowSynthetic:true,roles});if(!auth.allowed)return apiError(auth.code??'ACCESS_DENIED',auth.message??'Access denied.',auth.httpStatus??403,context.correlationId);try{const payload=await readJson(request) as CredentialInput;const tenantError=validateTenantScope(auth,payload);if(tenantError)return apiError('TENANT_SCOPE_MISMATCH',tenantError,403,context.correlationId);const errors=validateCredential(payload);if(errors.length)return apiError('CREDENTIAL_INVALID',errors.join(' '),400,context.correlationId);const credential=createCredential(payload);return apiResponse({ok:true,credential,controls:{status:'PENDING_VERIFICATION',humanVerificationRequired:true,selfApprovalProhibited:true,externalAuthorityNotImplied:true}},201,context.correlationId);}catch(error){return apiError('CREDENTIAL_CREATE_FAILED',error instanceof Error?error.message:'Credential creation failed.',400,context.correlationId);}}
