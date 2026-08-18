export type RegistrationType='TAXPAYER'|'PRACTITIONER'|'STAFF'|'PROVIDER'|'TENANT_ADMIN';
export type RegistrationStatus='DRAFT'|'IDENTITY_PENDING'|'DOCUMENTS_PENDING'|'REVIEW_PENDING'|'APPROVED'|'REJECTED'|'SUSPENDED';

export type RegistrationInput={
 tenantId:string;
 registrationType:RegistrationType;
 legalName:string;
 email:string;
 phone?:string;
 organizationName?:string;
 taxYear?:number;
 consentAccepted:boolean;
 privacyAccepted:boolean;
 attestationAccepted:boolean;
};

export type RegistrationRecord=RegistrationInput&{
 registrationId:string;
 status:RegistrationStatus;
 createdAt:string;
 updatedAt:string;
 requiredActions:string[];
 audit:{event:string;at:string}[];
};

export const registrationTypes:RegistrationType[]=['TAXPAYER','PRACTITIONER','STAFF','PROVIDER','TENANT_ADMIN'];

export function validateRegistration(input:RegistrationInput){
 const errors:string[]=[];
 if(!input.tenantId?.trim())errors.push('tenantId is required.');
 if(!registrationTypes.includes(input.registrationType))errors.push('A supported registrationType is required.');
 if(input.legalName.trim().length<2)errors.push('legalName is required.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))errors.push('A valid email is required.');
 if(!input.consentAccepted)errors.push('Service consent must be accepted.');
 if(!input.privacyAccepted)errors.push('Privacy notice must be accepted.');
 if(!input.attestationAccepted)errors.push('Registration attestation must be accepted.');
 if(['PROVIDER','TENANT_ADMIN'].includes(input.registrationType)&&!input.organizationName?.trim())errors.push('organizationName is required for this registration type.');
 return errors;
}

export function createRegistration(input:RegistrationInput):RegistrationRecord{
 const now=new Date().toISOString();
 const suffix=crypto.randomUUID();
 const requiredActions=input.registrationType==='TAXPAYER'?['Verify email','Complete identity verification','Upload engagement documents']:input.registrationType==='PROVIDER'?['Verify organization','Upload enrollment evidence','Complete security review','Obtain owner approval']:['Verify email','Complete identity verification','Await role approval'];
 return {...input,registrationId:`reg_${suffix}`,status:'IDENTITY_PENDING',createdAt:now,updatedAt:now,requiredActions,audit:[{event:'REGISTRATION_SUBMITTED',at:now}]};
}
