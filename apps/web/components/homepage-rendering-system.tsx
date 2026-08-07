import Link from 'next/link';
import {groupedRoutes,platformRoutes} from '../lib/routes';
import {CONTROL_GATES,TASK_STATES} from '../lib/operations';

const statusTotals={
 implemented:platformRoutes.filter(route=>route.status==='implemented').length,
 controlled:platformRoutes.filter(route=>route.status==='controlled').length,
 externalGate:platformRoutes.filter(route=>route.status==='external-gate').length,
 protected:platformRoutes.filter(route=>route.access!=='public').length
};

const commandPanels=[
 {kicker:'Taxpayer Concierge',title:'Secure intake to delivery',copy:'Identity, engagement, evidence upload, questionnaires, signatures, payment requests, notice timeline, and final delivery acknowledgment.',href:'/client-portal',metric:'Client-safe'},
 {kicker:'Practitioner Studio',title:'Evidence-first production',copy:'Workpapers, due diligence, reviewer notes, exception loops, correction routing, client approval, and retention evidence.',href:'/practitioner-work-zone',metric:'Restricted'},
 {kicker:'ERO Command',title:'Controlled e-file release',copy:'Schema gate, signature gate, submission intent, idempotency, acknowledgments, rejects, retry governance, and audit record.',href:'/efile-workbench',metric:'Fail-closed'},
 {kicker:'Payroll Command',title:'Check rendering operations',copy:'Original, reissue, void, employee, employer, audit, PDF export, print-ready, calibration, and AI validation route suite.',href:'/payroll',metric:'Controlled'}
];

const operatingSpine=[
 ['01','Intake','Identity, conflict, engagement, pricing, consent, and source-record collection.'],
 ['02','Classify','Documents, notices, payroll inputs, refund evidence, transcript artifacts, and service-order context.'],
 ['03','Produce','Tax, payroll, resolution, bookkeeping, education, and advisory work through role-scoped surfaces.'],
 ['04','Review','Independent quality review, exception handling, material-action controls, and owner-approved gates.'],
 ['05','Release','Client delivery, e-file intent, print/export, payment, statement, or response package release.'],
 ['06','Retain','Audit trail, evidence lineage, release record, rollback path, and retention disposition.']
];

const proofPoints=[
 {label:'Governed modules',value:String(platformRoutes.length),detail:'Every surface carries access, status, workflow, triggers, and API contracts.'},
 {label:'Control gates',value:String(CONTROL_GATES.length),detail:'PASS, FLAG, HOLD, DENY, review, release, and retention controls.'},
 {label:'Task states',value:String(TASK_STATES.length),detail:'Normal, exception, review, blocked, delivered, retained, and failed paths.'},
 {label:'Protected routes',value:String(statusTotals.protected),detail:'Authenticated and restricted surfaces separated from public marketing pages.'}
];

const richHtmlPanels=[
 {tag:'RHTML-01',title:'Executive command canvas',copy:'A top-level operating-system home screen with command metrics, route cards, lifecycle spine, and production status evidence.'},
 {tag:'RHTML-02',title:'Role-specific workspaces',copy:'Taxpayer, preparer, reviewer, ERO, payroll, compliance, administrator, and education views use dedicated language and controls.'},
 {tag:'RHTML-03',title:'Non-generic components',copy:'No filler panels. Every card maps to a registered module, trigger, API route, status, workflow, or governed evidence requirement.'},
 {tag:'RHTML-04',title:'Multi-page index',copy:'The platform index renders every route group and links to individual module pages with contracts, triggers, integrations, and workbench controls.'}
];

export function HomepageRenderingSystem(){
 return <>
  <section className="rhtml-hero"><div className="container rhtml-hero__grid"><div className="rhtml-hero__copy"><div className="rhtml-kicker"><span>ROSS TAX PRO SOFTWARE CO.</span><b>WORKSPACEIRS RHTML</b></div><h1>Advanced tax-practice rendering for every homepage, module, and operating lane.</h1><p className="lead">A production-grade, multi-page experience system for tax operations, payroll checks, notices, ERO control, refund intelligence, compliance, AI governance, education, and executive administration.</p><div className="actions"><Link className="ross-btn ross-btn--gold executive-primary" href="/platform-index">Open Multi-Page Index</Link><Link className="ross-btn ross-btn--outline executive-secondary" href="/operations-fabric">Inspect Operations Fabric</Link></div><div className="rhtml-proof-row"><span>{statusTotals.implemented} implemented</span><span>{statusTotals.controlled} controlled</span><span>{statusTotals.externalGate} external-gated</span><span>{statusTotals.protected} protected</span></div></div><aside className="rhtml-command" aria-label="Production rendering command"><div className="rhtml-command__header"><div><small>Production Render Matrix</small><strong>All homepages deployed</strong></div><span>LIVE UI</span></div><div className="rhtml-command__screen">{commandPanels.map(panel=><Link href={panel.href} className="rhtml-command-tile" key={panel.title}><small>{panel.kicker}</small><b>{panel.title}</b><p>{panel.copy}</p><em>{panel.metric}</em></Link>)}</div></aside></div></section>

  <section className="rhtml-proof"><div className="container rhtml-proof__grid">{proofPoints.map(point=><article key={point.label}><strong>{point.value}</strong><div><b>{point.label}</b><span>{point.detail}</span></div></article>)}</div></section>

  <section className="section rhtml-systems"><div className="container"><div className="section-heading"><div><div className="eyebrow">Non-Generic Component System</div><h2>Each visual block is wired to a real route, evidence contract, control gate, or production boundary.</h2></div><p>The rendering layer now operates as a product surface, not a brochure: route directories, status chips, role-specific command panels, payroll route links, API contracts, and fail-closed readiness signals are rendered directly into the interface.</p></div><div className="rhtml-panel-grid">{richHtmlPanels.map(panel=><article key={panel.tag}><code>{panel.tag}</code><h3>{panel.title}</h3><p>{panel.copy}</p></article>)}</div></div></section>

  <section className="section rhtml-spine"><div className="container"><div className="section-heading"><div><div className="eyebrow">Operating Spine</div><h2>One controlled journey from secure intake through retained evidence.</h2></div><p>Every homepage and module page now points back to the same operational sequence, making the platform feel unified across public, authenticated, restricted, and externally gated surfaces.</p></div><div className="rhtml-spine__rail">{operatingSpine.map(([number,title,copy])=><article key={title}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

  <section className="section rhtml-index-preview"><div className="container"><div className="section-heading"><div><div className="eyebrow">Multi-Page Index</div><h2>Complete route directory rendered as an executive application map.</h2></div><p>Open any module to inspect its route contract, capabilities, workflow sequence, task triggers, API contracts, access level, and production gate language.</p></div><div className="rhtml-status-strip"><span>{statusTotals.implemented} implemented</span><span>{statusTotals.controlled} controlled</span><span>{statusTotals.externalGate} external gates</span><span>{statusTotals.protected} protected surfaces</span></div>{Object.entries(groupedRoutes).map(([category,routes])=>routes.length>0&&<section className="route-group" key={category}><div className="route-group__heading"><h3>{category}</h3><span>{routes.length} indexed modules</span></div><div className="route-grid route-grid--executive">{routes.map(route=><article className="route-card route-card--executive" key={route.slug}><div className="route-card__meta"><span className={`access access--${route.access}`}>{route.access}</span><span className={`route-state route-state--${route.status}`}>{route.status}</span></div><div className="eyebrow">{route.eyebrow}</div><h4>{route.title}</h4><p>{route.description}</p><div className="route-card__footer"><span>{route.triggers.length} triggers · {route.apiEndpoints.length} contracts</span><Link href={`/${route.slug}`}>Open page →</Link></div></article>)}</div></section>)}</div></section>
 </>;
}
