import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import OperationalWorkbench from '../../components/operational-workbench';
import {getRoute,platformRoutes} from '../../lib/routes';

export function generateStaticParams(){return platformRoutes.map(route=>({slug:route.slug}));}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const route=getRoute(slug);
 return route?{title:route.title,description:route.description,robots:route.access==='public'?undefined:{index:false,follow:false,noarchive:true}}:{};
}

export default async function RoutedPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const route=getRoute(slug);if(!route)notFound();
 const protectedRoute=route.access!=='public';
 return <>
  <section className="page-hero"><div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/#platform-directory">{route.category}</Link><span>/</span><span aria-current="page">{route.title}</span></nav><div className="page-hero__grid"><div><div className="route-card__meta"><span className={`access access--${route.access}`}>{route.access}</span><span className={`route-state route-state--${route.status}`}>{route.status}</span></div><div className="eyebrow">{route.eyebrow}</div><h1>{route.title}</h1><p className="lead">{route.subtitle}</p><p>{route.description}</p><div className="actions"><Link className="ross-btn ross-btn--gold" href={route.ctaHref}>{route.cta}</Link><Link className="ross-btn ross-btn--outline" href="/#platform-directory">Application Directory</Link></div></div><aside className="route-summary"><h2>Route contract</h2><dl><div><dt>Path</dt><dd><code>/{route.slug}</code></dd></div><div><dt>Access</dt><dd>{route.access}</dd></div><div><dt>Implementation</dt><dd>{route.status}</dd></div><div><dt>Category</dt><dd>{route.category}</dd></div><div><dt>Triggers</dt><dd>{route.triggers.length}</dd></div><div><dt>API contracts</dt><dd>{route.apiEndpoints.length}</dd></div></dl></aside></div></div></section>

  {protectedRoute&&<section className="notice-band"><div className="container"><strong>Protected workspace:</strong> production records require authenticated identity, assigned role, tenant and case scope, MFA where applicable, purpose authorization, and an auditable decision path.</div></section>}
  {route.status==='external-gate'&&<section className="notice-band notice-band--critical"><div className="container"><strong>External adapter gate:</strong> the application workflow is implemented, but no outside transmission or retrieval is permitted until configuration, legal authority, credentials, certificates, testing evidence, and owner approval are verified.</div></section>}

  <section className="section"><div className="container detail-grid"><article className="detail-card"><div className="eyebrow">Capabilities</div><h2>What this surface controls</h2><ul className="check-list">{route.capabilities.map(item=><li key={item}>{item}</li>)}</ul></article><article className="detail-card"><div className="eyebrow">System Boundaries</div><h2>Connected integration contracts</h2><ul className="integration-list">{route.integrations.map(item=><li key={item}><span>{item}</span><small>{route.status==='external-gate'?'disabled until external gate evidence passes':'governed by identity, policy, and audit controls'}</small></li>)}</ul></article></div></section>

  <section className="section section--muted"><div className="container workflow-contract-grid"><article className="detail-card"><div className="eyebrow">Workflow</div><h2>Required sequence</h2><ol className="contract-list">{route.workflow.map((item,index)=><li key={`${item}-${index}`}><span>{String(index+1).padStart(2,'0')}</span>{item}</li>)}</ol></article><article className="detail-card"><div className="eyebrow">Task Triggers</div><h2>Registered event automation</h2><ul className="trigger-list">{route.triggers.map(item=><li key={item}><code>{item}</code><small>Evaluated through the governed trigger engine</small></li>)}</ul></article></div></section>

  <section className="section"><div className="container"><OperationalWorkbench routeSlug={route.slug} triggers={route.triggers} apiEndpoints={route.apiEndpoints}/></div></section>

  <section className="section section--dark"><div className="container lifecycle-grid"><div><div className="eyebrow">Operating Discipline</div><h2>Fail closed. Verify first. Preserve evidence.</h2><p>Every material action must evaluate trusted identity and scope, validate required data, obtain the correct human approval, execute only through an allowed adapter, and preserve an immutable audit event and outcome.</p></div><ol className="lifecycle"><li><span>1</span>Identify and authorize</li><li><span>2</span>Validate required evidence</li><li><span>3</span>Approve the controlled action</li><li><span>4</span>Execute through an allowed adapter</li><li><span>5</span>Record, reconcile, and retain</li></ol></div></section>
 </>;
}
