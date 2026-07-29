import Link from 'next/link';
import { notFound } from 'next/navigation';
import { enterpriseServices, getServiceBySlug } from '@ross/service-catalog';
import styles from './page.module.css';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function generateStaticParams() {
  return enterpriseServices.map((service) => ({ slug: service.slug }));
}

export default async function ServiceDossierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const price = service.priceFrom ? money.format(service.priceFrom) : 'Executive proposal';

  return (
    <main className={styles.canvas} data-theme={service.theme}>
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroIdentity}>
            <div className={styles.crumbs}><Link href="/services">Services</Link><span>/</span><b>{service.category}</b></div>
            <div className={styles.code}>{service.code}</div>
            <h1>{service.name}</h1>
            <p>{service.promise}</p>
            <div className={styles.heroActions}>
              <Link href={`/start?service=${service.slug}`}>Open secure scope review</Link>
              <Link href="/contact">Request specialist conference</Link>
            </div>
          </div>
          <aside className={styles.commercePanel}>
            <span>{service.priceModel.replaceAll('-', ' ')}</span>
            <strong>{price}</strong>
            <small>{service.unit ?? 'approved engagement scope'}</small>
            <div className={styles.commerceFacts}>
              <div><b>{service.deliveryMode.replaceAll('-', ' ')}</b><span>delivery model</span></div>
              <div><b>{service.riskTier}</b><span>risk tier</span></div>
              <div><b>{service.requiredGates.length}</b><span>required gates</span></div>
              <div><b>{service.retentionRule}</b><span>retention rule</span></div>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.operatingBrief}>
        <article>
          <span>01</span><h2>Engagement scope</h2>
          <div>{service.scope.map((item) => <p key={item}>{item}</p>)}</div>
        </article>
        <article>
          <span>02</span><h2>Deliverables</h2>
          <div>{service.deliverables.map((item) => <p key={item}>{item}</p>)}</div>
        </article>
        <article className={styles.exclusionArticle}>
          <span>03</span><h2>Not included without written expansion</h2>
          <div>{service.exclusions.map((item) => <p key={item}>{item}</p>)}</div>
        </article>
      </section>

      <section className={styles.actionSequence}>
        <header>
          <span>CONTROLLED ACTION SEQUENCE</span>
          <h2>Every step names the actual responsibility.</h2>
          <p>No vague “submit” or “process” buttons. Each action is tied to scope, actor, evidence and workflow state.</p>
        </header>
        <div className={styles.actionRail}>
          {service.actions.map((action, index) => (
            <article key={action}>
              <b>{String(index + 1).padStart(2, '0')}</b>
              <h3>{action}</h3>
              <p>{index === 0 ? 'Initiates the documented service lane.' : index === service.actions.length - 1 ? 'Closes the controlled service phase with evidence.' : 'Advances only after the preceding gate is satisfied.'}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.gateChamber}>
        <div>
          <span>RELEASE DISCIPLINE</span>
          <h2>{service.requiredGates.length} gates must be satisfied before delivery or release.</h2>
          <p>Gate requirements are versioned configuration. External systems, signatures, material tax positions, banking changes and agency actions remain fail closed until authorization evidence exists.</p>
        </div>
        <div className={styles.gateGrid}>
          {service.requiredGates.map((gate, index) => (
            <article key={gate}><b>{String(index + 1).padStart(2, '0')}</b><span>{gate.replaceAll('-', ' ')}</span><em>REQUIRED</em></article>
          ))}
        </div>
      </section>

      <section className={styles.termsBand}>
        <div>
          <span>PRICING AND TERMS</span>
          <h2>Starting prices are not blanket quotes.</h2>
        </div>
        <div>
          <p>Final pricing depends on scope, complexity, record condition, tax years, entities, forms, deadlines, urgency, risk, third-party costs and review requirements. Work outside the signed engagement requires a written change order.</p>
          <p>Fees compensate professional time, reserved capacity, technology, compliance controls and completed work. They do not guarantee a refund, credit decision, government result, deadline, acceptance or other third-party outcome.</p>
          <Link href={`/start?service=${service.slug}`}>Begin documented engagement review →</Link>
        </div>
      </section>
    </main>
  );
}
