import Link from 'next/link';
import OperationalWorkbench from './operational-workbench';
import type {PlatformRoute} from '../lib/routes';

const domainPanels:Record<string,{metrics:string[];queues:string[];actions:{label:string;href:string}[]}>= {
 'operations-fabric':{metrics:['Open work items','Blocked controls','SLA exceptions','Release gates'],queues:['Priority queue','Human review','Adapter exceptions','Security escalation'],actions:[{label:'Operations API',href:'/api/v1/operations/overview'},{label:'Certification center',href:'/certification'}]},
 'efile-workbench':{metrics:['Validation pass rate','Awaiting signatures','Transmission holds','Rejects requiring action'],queues:['Schema validation','ERO approval','Acknowledgment correlation','Reject resolution'],actions:[{label:'E-file certification',href:'/certification/efile'},{label:'Integration evidence',href:'/certification/integrations'}]},
 'client-portal':{metrics:['Active engagements','Missing documents','Pending signatures','Unread notices'],queues:['New intake','Document review','Signature requests','Delivery acknowledgment'],actions:[{label:'Register client',href:'/register'},{label:'Secure intake',href:'/start'}]},
 'practitioner-work-zone':{metrics:['Returns in preparation','Due-diligence flags','Reviewer holds','Ready for signature'],queues:['Preparation','Due diligence','Review','Client approval'],actions:[{label:'E-file workbench',href:'/efile-workbench'},{label:'Masterfile reconciliation',href:'/masterfile-reconciliation'}]},
 'refund-intelligence':{metrics:['Evidence updates','Lane changes','Human-review holds','Client-safe updates'],queues:['Evidence normalization','Conflict review','Funding correlation','Narrative approval'],actions:[{label:'Masterfile suite',href:'/masterfile-reconciliation'},{label:'Provider operations',href:'/provider-operations'}]},
 'admin':{metrics:['Active tenants','Privileged users','Pending approvals','Suspended adapters'],queues:['Tenant enrollment','Role approval','Credential review','Emergency controls'],actions:[{label:'Registration system',href:'/register'},{label:'Integration dashboard',href:'/certification/integrations'}]},
 'infrastructure':{metrics:['Service health','Queue depth','Backup status','Active alarms'],queues:['Deployment approvals','Migration checks','Recovery tests','Cost exceptions'],actions:[{label:'Infrastructure evidence',href:'/certification/infrastructure'},{label:'Runtime health',href:'/api/health'}]},
};

function MetricStrip({items}:{items:string[]}){return <div className="stat-grid" style={{marginTop:0}}>{items.map((item,index)=><div className="stat-card" key={item}><strong>{index===0?'—':'0'}</strong><span>{item}</span></div>)}</div>}

function DomainWorkspace({route}:{route:PlatformRoute}){
 const config=domainPanels[route.slug]??{metrics:route.capabilities.slice(0,4),queues:route.workflow.slice(0,4),actions:[{label:route.cta,href:route.ctaHref}]};
 return <>
  <section className="section section--compact"><div className="container"><MetricStrip items={config.metrics}/></div></section>
  <section className="section"><div className="container detail-grid">
   <article className="detail-card"><div className="eyebrow">Live workspace</div><h2>{route.title} command center</h2><p>{route.description}</p><div className="command-actions">{config.actions.map(action=><Link key={action.href} href={action.href}>{action.label} →</Link>)}</div></article>
   <article className="detail-card"><div className="eyebrow">Operational queues</div><h2>Assigned work lanes</h2><ul className="integration-list">{config.queues.map((item,index)=><li key={item}><span>{item}</span><small>{index===0?'Priority routing enabled':'Role and tenant scoped'}</small></li>)}</ul></article>
  </div></section>
 </>;
}

export default function EnterpriseRouteRenderer({route}:{route:PlatformRoute}){
 const protectedRoute=route.access!=='public';
 return <>
  <section className="page-hero"><div className="container"><nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>{route.category}</span><span>/</span><span>{route.title}</span></nav><div className="page-hero__grid"><div><div className="route-card__meta"><span className={`access access--${route.access}`}>{route.access}</span><span className={`route-state route-state--${route.status}`}>{route.status}</span></div><div className="eyebrow">{route.eyebrow}</div><h1>{route.title}</h1><p className="lead">{route.subtitle}</p><div className="actions"><Link className="ross-btn ross-btn--gold" href={route.ctaHref}>{route.cta}</Link><Link className="ross-btn ross-btn--outline" href="/register">Registration system</Link></div></div><aside className="route-summary"><h2>Module control</h2><dl><div><dt>Route</dt><dd><code>/{route.slug}</code></dd></div><div><dt>Access</dt><dd>{route.access}</dd></div><div><dt>State</dt><dd>{route.status}</dd></div><div><dt>Workflow stations</dt><dd>{route.workflow.length}</dd></div><div><dt>API contracts</dt><dd>{route.apiEndpoints.length}</dd></div></dl></aside></div></div></section>
  {protectedRoute&&<section className="notice-band"><div className="container"><strong>Protected workspace:</strong> identity, MFA, tenant scope, role assignment, purpose authorization, and audit evidence are required.</div></section>}
  {route.status==='external-gate'&&<section className="notice-band notice-band--critical"><div className="container"><strong>External gate:</strong> outbound transmission and retrieval remain disabled until legitimate authorization and technical evidence pass.</div></section>}
  <DomainWorkspace route={route}/>
  <section className="section section--muted"><div className="container detail-grid"><article className="detail-card"><div className="eyebrow">Control capabilities</div><h2>Module-specific controls</h2><ul className="check-list">{route.capabilities.map(item=><li key={item}>{item}</li>)}</ul></article><article className="detail-card"><div className="eyebrow">Integration contracts</div><h2>Connected systems</h2><ul className="integration-list">{route.integrations.map(item=><li key={item}><span>{item}</span><small>{route.status==='external-gate'?'Evidence required before activation':'Policy and audit governed'}</small></li>)}</ul></article></div></section>
  <section className="section"><div className="container"><OperationalWorkbench routeSlug={route.slug} triggers={route.triggers} apiEndpoints={route.apiEndpoints}/></div></section>
 </>;
}
