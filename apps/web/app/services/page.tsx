import Link from 'next/link';
import { enterpriseServices, serviceCategories, type ServiceCategory } from '@ross/service-catalog';
import styles from './page.module.css';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const categoryNarratives: Record<ServiceCategory, { index: string; headline: string; statement: string }> = {
  'individual-tax': { index: '01', headline: 'Individual Tax Atelier', statement: 'Concierge preparation engineered around verified facts, complete source records, independent review and controlled e-file release.' },
  'business-tax': { index: '02', headline: 'Entity Tax Office', statement: 'Executive-grade entity return engagements with trial-balance, ownership, payroll, allocation and book-to-tax reconciliation.' },
  'tax-resolution': { index: '03', headline: 'Resolution Counsel', statement: 'Deadline-aware notice, transcript and response operations with authority, evidence, review and follow-through controls.' },
  bookkeeping: { index: '04', headline: 'Ledger Atelier', statement: 'Monthly close, cleanup, reconciliation and management reporting built on evidence rather than unsupported adjustments.' },
  payroll: { index: '05', headline: 'Payroll Command', statement: 'Approved pay cycles, exception management, liability reconciliation, filing evidence and secure employee delivery.' },
  advisory: { index: '06', headline: 'Executive Advisory', statement: 'Scenario-based planning and operating transformation grounded in current data, stated assumptions and human review.' },
  'ero-operations': { index: '07', headline: 'ERO Operations Studio', statement: 'Tax-office workflow, security, quality, due diligence, release readiness and executive accountability.' },
  technology: { index: '08', headline: 'Enterprise Technology Foundry', statement: 'Next.js, Node, API, cloud, integration and reliability engineering with contract-first delivery and release evidence.' },
  'ai-services': { index: '09', headline: 'AI Workforce Theater', statement: 'Supervised customer support and paid AI task services with persona scope, source evidence, review and audit.' },
  education: { index: '10', headline: 'Ross Academy Registry', statement: 'Professional learning paths, assessments, instructor review and completion evidence for tax and operations roles.' },
  'document-services': { index: '11', headline: 'Document Intelligence Office', statement: 'Structured analysis, branded deliverables and version-controlled document packages built from verified source facts.' },
  enterprise: { index: '12', headline: 'Enterprise Black Label', statement: 'Multi-office, white-label and platform programs with tenant isolation, rollout governance and certification evidence.' }
};

const priceLabel = (priceModel: string, priceFrom?: number) => {
  if (!priceFrom) return 'Custom executive proposal';
  const prefix = priceModel.includes('monthly') ? 'Monthly from' : priceModel.includes('annual') ? 'Annual from' : 'Starting at';
  return `${prefix} ${money.format(priceFrom)}`;
};

export default function ServicesPage() {
  return (
    <main className={styles.serviceCanvas}>
      <section className={styles.catalogHero}>
        <div className={styles.catalogHeroGrid}>
          <div>
            <span className={styles.kicker}>ROSS TAX PRO SOFTWARE CO. · PROFESSIONAL SERVICE EXCHANGE</span>
            <h1>Luxury service architecture—not a fast-food menu.</h1>
            <p>
              Every engagement is scoped, priced, assigned, reviewed and delivered according to the actual work required.
              Starting prices establish the entry point; the signed engagement, approved change orders and controlling law govern.
            </p>
            <div className={styles.heroActions}>
              <Link href="/start">Begin secure service intake</Link>
              <Link href="/contact">Request enterprise consultation</Link>
            </div>
          </div>
          <aside className={styles.catalogIndex}>
            <header><span>Service Registry</span><b>{enterpriseServices.length} coded offers</b></header>
            {serviceCategories.map((category, index) => (
              <a href={`#${category.id}`} key={category.id}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <span>{category.label}</span>
                <em>{enterpriseServices.filter((service) => service.category === category.id).length}</em>
              </a>
            ))}
          </aside>
        </div>
      </section>

      <section className={styles.policyRibbon}>
        <div><b>Scope first</b><span>No work begins outside a documented engagement or approved service order.</span></div>
        <div><b>Evidence first</b><span>Material facts and deliverables must trace to client records and approved sources.</span></div>
        <div><b>Human accountability</b><span>AI can assist; qualified people own material review, approval and release.</span></div>
        <div><b>Earned-service pricing</b><span>Fees compensate capacity, work, technology, compliance and third-party costs—not a guaranteed outcome.</span></div>
      </section>

      <div className={styles.catalogBody}>
        {serviceCategories.map((category) => {
          const narrative = categoryNarratives[category.id];
          const services = enterpriseServices.filter((service) => service.category === category.id);
          return (
            <section className={styles.categorySuite} id={category.id} key={category.id}>
              <div className={styles.categoryIdentity}>
                <span>{narrative.index}</span>
                <div>
                  <small>{category.label}</small>
                  <h2>{narrative.headline}</h2>
                  <p>{narrative.statement}</p>
                </div>
              </div>

              <div className={styles.categoryServices}>
                {services.map((service, index) => (
                  <article className={styles.serviceDossier} key={service.code}>
                    <div className={styles.dossierRail}>
                      <b>{service.code}</b>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <em data-risk={service.riskTier}>{service.riskTier}</em>
                    </div>
                    <div className={styles.dossierNarrative}>
                      <small>{service.deliveryMode.replaceAll('-', ' ')} · {service.theme.replaceAll('-', ' ')}</small>
                      <h3>{service.name}</h3>
                      <p>{service.promise}</p>
                      <div className={styles.dossierScope}>
                        <div>
                          <b>Signature scope</b>
                          {service.scope.slice(0, 4).map((item) => <span key={item}>{item}</span>)}
                        </div>
                        <div>
                          <b>Controlled actions</b>
                          {service.actions.slice(0, 4).map((item) => <span key={item}>{item}</span>)}
                        </div>
                      </div>
                    </div>
                    <div className={styles.dossierCommerce}>
                      <span>{priceLabel(service.priceModel, service.priceFrom)}</span>
                      <small>{service.unit ?? 'approved scope'}</small>
                      <div>{service.requiredGates.length} gates · {service.retentionRule}</div>
                      <Link href={`/services/${service.slug}`}>Open full service dossier →</Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className={styles.engagementFooter}>
        <div>
          <span>ENGAGEMENT CONTROL</span>
          <h2>Professional service is priced by scope, complexity, evidence condition, urgency, risk and required review.</h2>
        </div>
        <div>
          <p>Additional forms, entities, tax years, records reconstruction, rush handling, representation, third-party costs, amended work and out-of-scope requests require a written quote or change order.</p>
          <Link href="/start">Open secure scope review →</Link>
        </div>
      </section>
    </main>
  );
}
