import type {Metadata} from 'next';
import Link from 'next/link';
import {groupedRoutes,platformRoutes} from '../../lib/routes';

export const metadata:Metadata={title:'Platform Index',description:'Complete WORKSPACEIRS multi-page index for every governed route, homepage, module, workflow, and API contract.'};

const totals={
 all:platformRoutes.length,
 public:platformRoutes.filter(route=>route.access==='public').length,
 authenticated:platformRoutes.filter(route=>route.access==='authenticated').length,
 restricted:platformRoutes.filter(route=>route.access==='restricted').length,
 implemented:platformRoutes.filter(route=>route.status==='implemented').length,
 controlled:platformRoutes.filter(route=>route.status==='controlled').length,
 externalGate:platformRoutes.filter(route=>route.status==='external-gate').length
};

export default function PlatformIndexPage(){
 return <>
  <section className="page-hero rhtml-index-hero"><div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">Platform Index</span></nav><div className="page-hero__grid"><div><div className="eyebrow">Complete Multi-Page Index</div><h1>Every homepage, module page, route contract, and workflow surface.</h1><p className="lead">A single governed index for WORKSPACEIRS production rendering: public surfaces, authenticated portals, restricted work zones, controlled operations, and external adapter gates.</p><div className="actions"><Link className="ross-btn ross-btn--gold" href="/">Executive Homepage</Link><Link className="ross-btn ross-btn--outline" href="/api/routes">Route API</Link></div></div><aside className="route-summary"><h2>Index totals</h2><dl><div><dt>Total routes</dt><dd>{totals.all}</dd></div><div><dt>Public</dt><dd>{totals.public}</dd></div><div><dt>Authenticated</dt><dd>{totals.authenticated}</dd></div><div><dt>Restricted</dt><dd>{totals.restricted}</dd></div><div><dt>Implemented</dt><dd>{totals.implemented}</dd></div><div><dt>Controlled</dt><dd>{totals.controlled}</dd></div><div><dt>External gates</dt><dd>{totals.externalGate}</dd></div></dl></aside></div></div></section>
  <section className="section rhtml-index-preview"><div className="container"><div className="rhtml-status-strip"><span>{totals.all} total pages</span><span>{totals.implemented} implemented</span><span>{totals.controlled} controlled</span><span>{totals.externalGate} external-gated</span></div>{Object.entries(groupedRoutes).map(([category,routes])=>routes.length>0&&<section className="route-group" key={category}><div className="route-group__heading"><h3>{category}</h3><span>{routes.length} pages</span></div><div className="rhtml-index-list">{routes.map(route=><Link className="rhtml-index-row" href={`/${route.slug}`} key={route.slug}><div><span className={`access access--${route.access}`}>{route.access}</span><span className={`route-state route-state--${route.status}`}>{route.status}</span></div><strong>{route.title}</strong><p>{route.subtitle}</p><small>{route.triggers.length} triggers · {route.apiEndpoints.length} API contracts · {route.workflow.length} workflow steps</small></Link>)}</div></section>)}</div></section>
 </>;
}
