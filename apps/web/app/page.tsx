import Link from 'next/link';
import {groupedRoutes,platformRoutes} from '../lib/routes';

const operationalRoutes=platformRoutes.filter(route=>route.status==='available').length;
const gatedRoutes=platformRoutes.filter(route=>route.status==='gated').length;
const protectedRoutes=platformRoutes.filter(route=>route.access!=='public').length;

const pillars=[
 {title:'Prepare with precision',subtitle:'Guided return workflow',text:'Structured intake, document validation, review gates, diagnostics, signatures, transmission readiness, and exception handling in one controlled workspace.',href:'/services',cta:'Explore tax operations'},
 {title:'Operate the entire practice',subtitle:'ERO command center',text:'Manage clients, preparers, returns, acknowledgments, rejects, notices, funding events, tasks, communications, and compliance evidence without fragmented desktop tools.',href:'/ero',cta:'Open ERO workspace'},
 {title:'See what needs action now',subtitle:'ETRAC intelligence',text:'Convert authorized transcript, acknowledgment, notice, refund, payroll, and portal events into prioritized queues, alerts, case timelines, and client updates.',href:'/transcripts',cta:'Review ETRAC controls'}
];

const workflows=[
 ['Client acquisition','Lead → engagement → consent → identity → intake'],
 ['Return production','Import → diagnostics → preparation → review → signature'],
 ['E-file operations','8879 gate → transmit → acknowledgment → reject resolution'],
 ['Post-filing intelligence','Transcript → notice → refund lane → case action'],
 ['Practice governance','RBAC → approvals → audit evidence → retention → reporting'],
 ['Growth and scale','Multi-office → multi-tenant → workforce → analytics → automation']
];

export default function HomePage(){
 return <>
  <section className="hero hero--brand">
   <div className="container hero-grid hero-grid--brand">
    <div>
     <div className="eyebrow">Ross Tax Pro Software Co. · Authorized ERO Operations</div>
     <h1>Smarter software.<br/>Stronger practice results.</h1>
     <p className="lead">A hardened tax-practice operating system built to unify preparation, ERO administration, client service, ETRAC intelligence, payroll, notices, compliance, education, and controlled automation.</p>
     <div className="actions">
      <Link className="ross-btn ross-btn--gold" href="/start">Start Secure Client Intake</Link>
      <Link className="ross-btn ross-btn--outline hero-outline" href="/ero">Enter the ERO Command Center</Link>
     </div>
     <div className="cta-notes"><span><b>For taxpayers</b> Secure intake, documents, signatures, and status.</span><span><b>For professionals</b> Production workflow, review, e-file, and resolution.</span></div>
     <div className="hero-meta" aria-label="Platform controls"><span>MFA + RBAC</span><span>PII-protected</span><span>Audit-evidenced</span><span>Fail-closed integrations</span><span>Multi-tenant ready</span></div>
    </div>
    <aside className="brand-showcase" aria-label="Ross Tax Pro brand and platform status">
     <img src="/assets/ross-brand-mark.svg" alt="Ross Tax Pro Software Co."/>
     <div className="brand-showcase__status"><span className="status-dot"/><div><b>Platform core operational</b><small>External regulated connections remain credential and approval gated.</small></div></div>
     <div className="brand-showcase__actions"><Link href="/api/health">System health</Link><Link href="/api/platform/status">Integration readiness</Link></div>
    </aside>
   </div>
  </section>

  <section className="section section--compact"><div className="container stat-grid">
   <article className="stat-card"><strong>{platformRoutes.length}</strong><span>Governed application routes</span></article>
   <article className="stat-card"><strong>{operationalRoutes}</strong><span>Available surfaces</span></article>
   <article className="stat-card"><strong>{protectedRoutes}</strong><span>Protected workspaces</span></article>
   <article className="stat-card"><strong>24/7</strong><span>Health and audit visibility</span></article>
  </div></section>

  <section className="section"><div className="container">
   <div className="section-heading"><div><div className="eyebrow">Practice Operating System</div><h2>Built beyond a return-entry screen.</h2></div><p>The platform is engineered as a complete practice environment: front office, production, e-file operations, post-filing service, workforce controls, intelligence, and governance.</p></div>
   <div className="pillar-grid">{pillars.map(p=><article className="pillar-card" key={p.title}><span>{p.subtitle}</span><h3>{p.title}</h3><p>{p.text}</p><Link href={p.href}>{p.cta} →</Link></article>)}</div>
  </div></section>

  <section className="section section--etrac"><div className="container etrac-grid">
   <div className="etrac-visual"><img src="/assets/etrac-mark.svg" alt="ETRAC real-time client updates"/></div>
   <div><div className="eyebrow">ETRAC Event Intelligence</div><h2>Turn verified events into the next correct action.</h2><p>ETRAC is designed to normalize authorized data from acknowledgments, transcripts, notices, funding providers, payroll, identity services, and client portals—then route each event through policy, priority, ownership, and audit controls.</p><ul className="check-list"><li>Real-time case timelines and exception queues</li><li>Client-facing status updates with source and confidence labels</li><li>Refund, notice, reject, identity, and treasury workflow lanes</li><li>Human approval gates before regulated or consequential actions</li></ul><div className="actions"><Link className="ross-btn ross-btn--gold" href="/refunds">Open Refund Intelligence</Link><Link className="ross-btn ross-btn--outline hero-outline" href="/notices">Review Notice Operations</Link></div></div>
  </div></section>

  <section className="section section--muted"><div className="container">
   <div className="section-heading"><div><div className="eyebrow">End-to-End Workflow</div><h2>One system of record from first contact through resolution.</h2></div><p>Every lifecycle has explicit states, ownership, evidence, deadlines, exception paths, and role-based access.</p></div>
   <div className="workflow-grid">{workflows.map(([title,text],i)=><article className="workflow-card" key={title}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
  </div></section>

  <section className="section" id="platform-directory"><div className="container">
   <div className="section-heading"><div><div className="eyebrow">Application Directory</div><h2>Every surface has a purpose, access class, and system boundary.</h2></div><p>Public pages remain indexable. Authenticated and restricted workspaces stay gated until identity, role, credential, and integration requirements are satisfied.</p></div>
   {Object.entries(groupedRoutes).map(([category,routes])=>routes.length>0&&<section className="route-group" key={category} aria-labelledby={`group-${category.replaceAll(' ','-').toLowerCase()}`}><div className="route-group__heading"><h3 id={`group-${category.replaceAll(' ','-').toLowerCase()}`}>{category}</h3><span>{routes.length} routes</span></div><div className="route-grid">{routes.map(route=><article className="route-card" key={route.slug}><div className="route-card__meta"><span className={`access access--${route.access}`}>{route.access}</span><span className={`route-state route-state--${route.status}`}>{route.status}</span></div><div className="eyebrow">{route.eyebrow}</div><h4>{route.title}</h4><p>{route.description}</p><ul>{route.capabilities.slice(0,3).map(capability=><li key={capability}>{capability}</li>)}</ul><Link className="card-link" href={`/${route.slug}`}>Open {route.title} →</Link></article>)}</div></section>)}
  </div></section>

  <section className="section section--dark"><div className="container callout-grid"><div><div className="eyebrow">Production Discipline</div><h2>Scale aggressively. Authorize carefully.</h2><p>The architecture supports multi-office growth, workload automation, analytics, deployment stages, and high-volume operations while regulated integrations remain disabled until approvals, certificates, endpoint allowlists, validation evidence, and operating controls are installed.</p></div><div className="callout-actions"><Link className="ross-btn ross-btn--gold" href="/compliance">Review Security Controls</Link><Link className="ross-btn ross-btn--outline hero-outline" href="/admin">Open Administration</Link></div></div></section>
 </>;
}