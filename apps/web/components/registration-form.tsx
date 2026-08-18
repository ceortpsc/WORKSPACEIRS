'use client';

import {FormEvent,useState} from 'react';
import type {RegistrationType} from '../lib/registration';

const types:{value:RegistrationType;label:string;detail:string}[]=[
 {value:'TAXPAYER',label:'Taxpayer / Client',detail:'Secure intake, documents, signatures, payments, notices, and delivery.'},
 {value:'PRACTITIONER',label:'Tax Practitioner',detail:'Preparation, review, due diligence, representation, and controlled e-file access.'},
 {value:'STAFF',label:'Employee / Contractor',detail:'Role-scoped workforce enrollment with supervisor approval.'},
 {value:'PROVIDER',label:'Integration Provider',detail:'Vendor enrollment, contract evidence, certificate verification, and security review.'},
 {value:'TENANT_ADMIN',label:'Office Administrator',detail:'Tenant and office administration subject to privileged approval.'}
];

export default function RegistrationForm(){
 const [type,setType]=useState<RegistrationType>('TAXPAYER');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setMessage('Submitting registration…');const form=new FormData(event.currentTarget);const payload={tenantId:String(form.get('tenantId')||''),registrationType:type,legalName:String(form.get('legalName')||''),email:String(form.get('email')||''),phone:String(form.get('phone')||''),organizationName:String(form.get('organizationName')||''),taxYear:Number(form.get('taxYear')||2026),consentAccepted:form.get('consentAccepted')==='on',privacyAccepted:form.get('privacyAccepted')==='on',attestationAccepted:form.get('attestationAccepted')==='on'};const response=await fetch('/api/v1/registrations',{method:'POST',headers:{'Content-Type':'application/json','X-Correlation-ID':crypto.randomUUID()},body:JSON.stringify(payload)});const body=await response.json().catch(()=>({error:{message:'Invalid response'}}));setMessage(response.ok?`Registration created: ${body.registration.registrationId}. Status: ${body.registration.status}.`:body.error?.message??'Registration failed.');setBusy(false);}
 return <div className="detail-grid">
  <aside className="detail-card"><div className="eyebrow">Registration type</div><h2>Select an enrollment lane</h2><div style={{display:'grid',gap:'.65rem'}}>{types.map(item=><button type="button" key={item.value} onClick={()=>setType(item.value)} style={{padding:'1rem',textAlign:'left',borderRadius:'.75rem',border:type===item.value?'2px solid #172554':'1px solid #d0d5dd',background:type===item.value?'#eef2ff':'#fff',cursor:'pointer'}}><strong>{item.label}</strong><br/><small>{item.detail}</small></button>)}</div></aside>
  <form className="detail-card" onSubmit={submit}><div className="eyebrow">Identity and authority</div><h2>Registration application</h2><input type="hidden" name="registrationType" value={type}/><label>Tenant ID<input name="tenantId" required placeholder="Assigned tenant or demo-tenant"/></label><label>Legal name<input name="legalName" required autoComplete="name"/></label><label>Email<input name="email" type="email" required autoComplete="email"/></label><label>Mobile phone<input name="phone" type="tel" autoComplete="tel"/></label><label>Organization name<input name="organizationName" required={type==='PROVIDER'||type==='TENANT_ADMIN'}/></label><label>Tax year<input name="taxYear" type="number" defaultValue={2026}/></label><label><input name="consentAccepted" type="checkbox" required/> I authorize processing for this registration request.</label><label><input name="privacyAccepted" type="checkbox" required/> I acknowledge the privacy and data-use notice.</label><label><input name="attestationAccepted" type="checkbox" required/> I attest that the submitted information is accurate.</label><button className="ross-btn ross-btn--gold" disabled={busy}>{busy?'Submitting…':'Submit controlled registration'}</button>{message&&<pre style={{whiteSpace:'pre-wrap',marginTop:'1rem'}}>{message}</pre>}</form>
 </div>;
}
