import Link from 'next/link';
import {groupedRoutes,platformRoutes} from '../lib/routes';

const operationalRoutes=platformRoutes.filter(route=>route.status==='available').length;
const gatedRoutes=platformRoutes.filter(route=>route.status==='gated').length;
const protectedRoutes=platformRoutes.filter(route=>route.access!=='public').length;

export default function HomePage(){
 return <>
  <section className="hero">
   <div className="container hero-grid">
    <div>
     <div className="eyebrow">Ross Tax Pro Software Co.</div>
     <h1>One governed platform.<br/>Every critical tax workflow.</h1>
     <p className="lead">A secure enterprise workspace for client intake, ERO administration, payroll, transcript operations, refund intelligence, notices, compliance, education, and controlled automation.</p>
     <div className="actions">
      <Link className="ross-btn ross-btn--gold" href="/start">Start Secure Intake</Link>
      <Link className="ross-btn ross-btn--outline hero-outline" href="/services">Explore Services</Link>
     </div>
     <div className="hero-meta" aria-label="Platform controls">
      <span>RBAC-first</span><span>PII-protected</span><span>Audit-ready</span><span>Fail-closed integrations</span>
     </div>
    </div>
    <aside className="command-card" aria-label="Platform command status">
     <div className="command-card__header"><span className="status-dot"/>Platform command status</div>
     <dl className="status-list">
      <div><dt>Web application</dt><dd>Operational</dd></div>
      <div><dt>Public routes</dt><dd>{operationalRoutes} available</dd></div>
      <div><dt>Protected surfaces</dt><dd>{protectedRoutes} gated</dd></div>
      <div><dt>External integrations</dt><dd>Credential controlled</dd></div>
     </dl>
     <div className="command-actions">
      <Link href="/api/health">Health endpoint →</Link>
      <Link href="/api/platform/status">Integration status →</Link>
     </div>
    </aside>
   </div>
  </section>

  <section className="section section--compact">
   <div className="container stat-grid">
    <article className="stat-card"><strong>{platformRoutes.length}</strong><span>Governed routes</span></article>
    <article className="stat-card"><strong>{operationalRoutes}</strong><span>Publicly available</span></article>
    <article className="stat-card"><strong>{gatedRoutes}</strong><span>Credential gated</span></article>
    <article className="stat-card"><strong>24/7</strong><span>Health visibility</span></article>
   </div>
  </section>

  <section className="section" id="platform-directory">
   <div className="container">
    <div className="section-heading">
     <div><div className="eyebrow">Application Directory</div><h2>Every page has a defined purpose, access level, and system boundary.</h2></div>
     <p>Public pages remain indexable. Authenticated and restricted workspaces are explicitly identified and remain gated until identity, role, credential, and integration requirements are satisfied.</p>
    </div>
    {Object.entries(groupedRoutes).map(([category,routes])=>routes.length>0&&<section className="route-group" key={category} aria-labelledby={`group-${category.replaceAll(' ','-').toLowerCase()}`}>
     <div className="route-group__heading"><h3 id={`group-${category.replaceAll(' ','-').toLowerCase()}`}>{category}</h3><span>{routes.length} routes</span></div>
     <div className="route-grid">
      {routes.map(route=><article className="route-card" key={route.slug}>
       <div className="route-card__meta"><span className={`access access--${route.access}`}>{route.access}</span><span className={`route-state route-state--${route.status}`}>{route.status}</span></div>
       <div className="eyebrow">{route.eyebrow}</div>
       <h4>{route.title}</h4>
       <p>{route.description}</p>
       <ul>{route.capabilities.slice(0,3).map(capability=><li key={capability}>{capability}</li>)}</ul>
       <Link className="card-link" href={`/${route.slug}`}>Open {route.title} →</Link>
      </article>)}
     </div>
    </section>)}
   </div>
  </section>

  <section className="section section--dark">
   <div className="container callout-grid">
    <div><div className="eyebrow">Production Discipline</div><h2>Connected does not mean authorized.</h2><p>IRS, funding, identity, banking, payroll, messaging, and document integrations remain disabled until credentials, approvals, certificates, endpoint allowlists, validation evidence, and operating controls are installed.</p></div>
    <div className="callout-actions"><Link className="ross-btn ross-btn--gold" href="/compliance">Review Security Controls</Link><Link className="ross-btn ross-btn--outline hero-outline" href="/api/routes">Inspect Route API</Link></div>
   </div>
  </section>
 </>;
}
