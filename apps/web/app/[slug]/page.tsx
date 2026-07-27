import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getRoute,platformRoutes} from '../../lib/routes';

export function generateStaticParams(){return platformRoutes.map(route=>({slug:route.slug}));}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const route=getRoute(slug);
 return route?{title:route.title,description:route.description,robots:route.access==='public'?undefined:{index:false,follow:false,noarchive:true}}:{};
}

export default async function RoutedPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const route=getRoute(slug);
 if(!route)notFound();
 const protectedRoute=route.access!=='public';

 return <>
  <section className="page-hero">
   <div className="container">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/#platform-directory">{route.category}</Link><span>/</span><span aria-current="page">{route.title}</span></nav>
    <div className="page-hero__grid">
     <div>
      <div className="route-card__meta"><span className={`access access--${route.access}`}>{route.access}</span><span className={`route-state route-state--${route.status}`}>{route.status}</span></div>
      <div className="eyebrow">{route.eyebrow}</div>
      <h1>{route.title}</h1>
      <p className="lead">{route.subtitle}</p>
      <p>{route.description}</p>
      <div className="actions"><Link className="ross-btn ross-btn--gold" href={route.ctaHref}>{route.cta}</Link><Link className="ross-btn ross-btn--outline" href="/#platform-directory">Application Directory</Link></div>
     </div>
     <aside className="route-summary">
      <h2>Route contract</h2>
      <dl><div><dt>Path</dt><dd><code>/{route.slug}</code></dd></div><div><dt>Access</dt><dd>{route.access}</dd></div><div><dt>Release state</dt><dd>{route.status}</dd></div><div><dt>Category</dt><dd>{route.category}</dd></div></dl>
     </aside>
    </div>
   </div>
  </section>

  {protectedRoute&&<section className="notice-band"><div className="container"><strong>Protected workspace:</strong> production records and controls require authenticated identity, assigned role, MFA where applicable, and an auditable authorization path.</div></section>}

  <section className="section">
   <div className="container detail-grid">
    <article className="detail-card"><div className="eyebrow">Capabilities</div><h2>What this surface controls</h2><ul className="check-list">{route.capabilities.map(item=><li key={item}>{item}</li>)}</ul></article>
    <article className="detail-card"><div className="eyebrow">Integrations</div><h2>Connected system boundaries</h2><ul className="integration-list">{route.integrations.map(item=><li key={item}><span>{item}</span><small>{route.status==='available'?'available or locally governed':'credential and approval gated'}</small></li>)}</ul></article>
   </div>
  </section>

  <section className="section section--muted">
   <div className="container lifecycle-grid">
    <div><div className="eyebrow">Operating Model</div><h2>Fail closed. Verify first. Preserve evidence.</h2><p>Every workflow is expected to enforce identity, access, consent, validation, approval, transmission, acknowledgment, exception handling, and immutable audit evidence at the appropriate stage.</p></div>
    <ol className="lifecycle"><li><span>1</span>Identify and authorize</li><li><span>2</span>Validate required data</li><li><span>3</span>Approve controlled action</li><li><span>4</span>Execute through an allowed adapter</li><li><span>5</span>Record outcome and evidence</li></ol>
   </div>
  </section>
 </>;
}
