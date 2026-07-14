import Link from 'next/link';
import {platformRoutes} from '../lib/routes';

export default function HomePage(){
 const featured=platformRoutes.filter(route=>['services','portal','ero','transcripts','refunds','compliance'].includes(route.slug));
 return <>
  <section className="hero"><div className="container hero-grid">
   <div><div className="eyebrow">Ross Tax Pro Software Co.</div><h1>Smarter Software.<br/>Stronger Results.</h1><p className="lead">A secure enterprise platform for tax-practice operations, authorized IRS workflows, ERO administration, payroll, refund intelligence, client service, compliance, and controlled automation.</p><div className="actions"><Link className="ross-btn ross-btn-primary" href="/start">Start Secure Intake</Link><Link className="ross-btn ross-btn-secondary" href="/services">Explore Services</Link></div></div>
   <aside className="feature"><span className="status">Production-readiness controls enabled</span><h2>Trust by design.</h2><p>External connections remain gated until credentials, approvals, certificates, endpoint allowlists, and validation evidence are installed.</p><Link href="/api/platform/status">View platform status →</Link></aside>
  </div></section>
  <section className="section"><div className="container"><div className="eyebrow">Platform</div><h2>One governed workspace. Every critical route.</h2><div className="grid">{featured.map(route=><article className="feature" key={route.slug}><span className="status">{route.access}</span><h3>{route.title}</h3><p>{route.description}</p><Link className="ross-btn ross-btn-secondary" href={`/${route.slug}`}>Open {route.title}</Link></article>)}</div></div></section>
 </>
}
