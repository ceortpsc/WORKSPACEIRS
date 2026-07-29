import {NextRequest} from 'next/server';
import {apiError,apiResponse,authorizeOperationalRequest,readJson,requestContext,validateTenantScope} from '../../../../lib/api';
import {createRegistration,validateRegistration} from '../../../../lib/registration';
import type {RegistrationInput} from '../../../../lib/registration';

export const dynamic='force-dynamic';
const roles=['OWNER_SUPER_ADMIN','ERO_ADMIN','TENANT_ADMIN','CLIENT','PREPARER','STAFF'];

export async function POST(request:NextRequest){
 const context=requestContext(request);
 const auth=authorizeOperationalRequest(request,{allowSynthetic:true,roles});
 if(!auth.allowed)return apiError(auth.code??'ACCESS_DENIED',auth.message??'Access denied.',auth.httpStatus??403,context.correlationId);
 try{
  const payload=await readJson(request) as RegistrationInput;
  const tenantError=validateTenantScope(auth,payload);if(tenantError)return apiError('TENANT_SCOPE_MISMATCH',tenantError,403,context.correlationId);
  const errors=validateRegistration(payload);if(errors.length)return apiError('REGISTRATION_INVALID',errors.join(' '),400,context.correlationId);
  const registration=createRegistration(payload);
  return apiResponse({ok:true,registration,controls:{identityVerificationRequired:true,humanApprovalRequired:true,externalEnrollmentNotImplied:true,auditPreserved:true}},201,context.correlationId);
 }catch(error){return apiError('REGISTRATION_FAILED',error instanceof Error?error.message:'Registration failed.',400,context.correlationId);}
}
