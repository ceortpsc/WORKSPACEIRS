import Link from 'next/link';
import type {ReactNode} from 'react';

const routes=[
 ['/provider-operations','Operations'],
 ['/provider-operations/enrollment','Enrollment'],
 ['/provider-operations/fees','Client fees'],
 ['/provider-operations/checks','Check lookup'],
 ['/provider-operations/protocols','XHR / XML']
] as const;

export default function ProviderShell({title,subtitle,active,children}:{title:string;subtitle:string;active:string;children:ReactNode}){
 return <main className="provider-app">
  <header className="provider-topbar"><div><strong>RTPSC Provider Operations</strong><span>TY 2026</span></div><div className="provider-top-actions"><span>Controlled production workspace</span><span>Owner approval required</span></div></header>
  <div className="provider-grid">
   <aside className="provider-sidebar"><div className="provider-brand">ROSS.CO</div><nav>{routes.map(([href,label])=><Link key={href} href={href} className={active===href?'active':''}>{label}</Link>)}</nav><div className="provider-boundary"><strong>System boundary</strong><p>External provider calls remain fail-closed until enrollment, certificate, endpoint, security-test, and owner-approval evidence pass.</p></div></aside>
   <section className="provider-content"><div className="provider-heading"><p>Provider Integration Control Plane</p><h1>{title}</h1><span>{subtitle}</span></div>{children}</section>
  </div>
 </main>;
}
