import Link from 'next/link';
import { experienceThemes, domainActions } from '@ross/experience-system';
import { enterpriseServices, serviceCategories } from '@ross/service-catalog';
import { workflowTransitions } from '@ross/workflow-engine';
import styles from './page.module.css';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const rolloutWaves = [
  { code: 'W0', title: 'Foundation', state: 'IMPLEMENTED', detail: 'Contracts, themes, action vocabulary, transition guards and CI evidence.' },
  { code: 'W1', title: 'Public + Intake', state: 'READY', detail: 'Corporate experience, luxury catalog, secure intake and authenticated onboarding.' },
  { code: 'W2', title: 'Client Operations', state: 'CONTROLLED', detail: 'Documents, questionnaires, payment, signatures, notices and final delivery.' },
  { code: 'W3', title: 'Practitioner + ERO', state: 'GATED', detail: 'Workpapers, review, release certification, transmission intent and acknowledgments.' },
  { code: 'W4', title: 'Intelligence + AI', state: 'SUPERVISED', detail: 'Reconciliation, refund evidence, AI paid tasks, citations and review queues.' },
  { code: 'W5', title: 'Enterprise Scale', state: 'PLANNED', detail: 'Multi-office tenancy, white label, SLOs, resilience and release certification.' }
] as const;

const criticalSurfaces = [
  {
    code: 'CX-01', title: 'Taxpayer Concierge', theme: 'taxpayer-concierge',
    narrative: 'A guided client command center that converts complex tax work into verified next actions without exposing internal production controls.',
    rail: ['Identity','Engagement','Documents','Questions','Payment','Review','Signature','Delivery'],
    action: 'Open secure client intake', href: '/start'
  },
  {
    code: 'TX-02', title: 'Practitioner Production Studio', theme: 'practitioner-studio',
    narrative: 'A source-to-workpaper production surface with due-diligence interviews, materiality flags, review annotations and evidence lineage.',
    rail: ['Source evidence','Workpapers','Due diligence','Calculation','Review notes','Corrections','Release copy'],
    action: 'Enter practitioner work zone', href: '/practitioner-work-zone'
  },
  {
    code: 'ER-03', title: 'ERO Transmission Command', theme: 'ero-command',
    narrative: 'A fail-closed release console for schema readiness, signature evidence, environment isolation, idempotency and acknowledgment correlation.',
    rail: ['Readiness','Signature','Schema','Environment','Intent','Transmission','Acknowledgment','Retention'],
    action: 'Open e-file workbench', href: '/efile-workbench'
  },
  {
    code: 'AI-04', title: 'AI Workforce Theater', theme: 'ai-workforce-theater',
    narrative: 'A supervised paid-task arena where every persona, source, tool, risk tier, reviewer disposition and delivery artifact is visible.',
    rail: ['Task contract','Persona scope','Source dock','Execution','Risk check','Human review','Client delivery'],
    action: 'Inspect AI workforce', href: '/ai-workforce'
  }
] as const;

export default function EnterpriseExperiencePage() {
  const startingPrices = enterpriseServices.filter((service) => typeof service.priceFrom === 'number');
  const lowestStartingPrice = Math.min(...startingPrices.map((service) => service.priceFrom ?? Number.MAX_SAFE_INTEGER));
  const materialServices = enterpriseServices.filter((service) => service.riskTier === 'material').length;
  const humanApprovedTransitions = workflowTransitions.filter((transition) => transition.humanApproval).length;

  return (
    <main className={styles.canvas}>
      <section className={styles.blackLabelHero}>
        <div className={styles.heroAtmosphere} />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>ROSS TAX PRO SOFTWARE CO. · ENTERPRISE EXPERIENCE FABRIC</div>
            <h1>No generic dashboard. Every role receives a purpose-built operating environment.</h1>
            <p>
              This rollout unifies luxury service commerce, secure taxpayer operations, practitioner production,
              ERO release control, bookkeeping, payroll, AI employees, education and executive governance under
              one explicit route-and-transition contract.
            </p>
            <div className={styles.heroActions}>
              <Link href="/services" className={styles.goldAction}>Explore professional services</Link>
              <Link href="/operations-fabric" className={styles.ghostAction}>Open operations fabric</Link>
            </div>
            <div className={styles.assuranceStrip}>
              <span>Next.js 15</span><span>Node 22+</span><span>pnpm workspaces</span><span>GitHub governed</span><span>Human-gated material actions</span>
            </div>
          </div>

          <aside className={styles.releaseLedger} aria-label="Enterprise release ledger">
            <div className={styles.releaseLedgerHeader}>
              <div><small>Release posture</small><strong>Enterprise expansion branch</strong></div>
              <span>CONTROLLED</span>
            </div>
            <div className={styles.releaseLedgerMetrics}>
              <div><strong>{enterpriseServices.length}</strong><span>coded service offers</span></div>
              <div><strong>{experienceThemes.length}</strong><span>role-specific themes</span></div>
              <div><strong>{workflowTransitions.length}</strong><span>governed transitions</span></div>
              <div><strong>{domainActions.length}</strong><span>material domain actions</span></div>
            </div>
            <div className={styles.releaseLedgerRows}>
              {rolloutWaves.map((wave) => (
                <div className={styles.releaseLedgerRow} key={wave.code}>
                  <b>{wave.code}</b><span>{wave.title}</span><em data-state={wave.state}>{wave.state}</em>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.boardMetrics}>
        <div><strong>{serviceCategories.length}</strong><span>service divisions</span><small>Tax, resolution, ledger, payroll, technology, AI and enterprise</small></div>
        <div><strong>{materialServices}</strong><span>material-risk offers</span><small>Mandatory evidence, human approval and audit treatment</small></div>
        <div><strong>{humanApprovedTransitions}</strong><span>human-gated transitions</span><small>No automation may satisfy a human approval requirement</small></div>
        <div><strong>{money.format(lowestStartingPrice)}</strong><span>lowest coded starting price</span><small>Final scope and engagement terms govern every fee</small></div>
      </section>

      <section className={styles.experiencePortfolio}>
        <header className={styles.portfolioHeader}>
          <div><span>01 · EXPERIENCE PORTFOLIO</span><h2>Eight visual systems. Eight operational personalities.</h2></div>
          <p>Each package changes the information architecture, density, terminology, action hierarchy and exception presentation—not merely the colors.</p>
        </header>
        <div className={styles.themeRunway}>
          {experienceThemes.map((theme, index) => (
            <article className={styles.themeSpecimen} key={theme.id} style={{
              '--theme-canvas': theme.tokens.canvas,
              '--theme-surface': theme.tokens.surface,
              '--theme-ink': theme.tokens.ink,
              '--theme-muted': theme.tokens.muted,
              '--theme-accent': theme.tokens.accent,
              '--theme-border': theme.tokens.border,
              '--theme-radius': theme.tokens.radius
            } as React.CSSProperties}>
              <div className={styles.themeSpecimenTop}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <em>{theme.density}</em>
              </div>
              <h3>{theme.label}</h3>
              <p>{theme.visualIntent}</p>
              <div className={styles.audienceLine}>{theme.audience.join(' · ')}</div>
              <ul>{theme.signaturePatterns.map((pattern) => <li key={pattern}>{pattern}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.surfaceTheater}>
        <header className={styles.portfolioHeader}>
          <div><span>02 · OPERATING SURFACES</span><h2>Dedicated workspaces—not recycled panels with different labels.</h2></div>
          <p>The surface structure changes according to accountability: concierge guidance for clients, dense evidence production for practitioners, command discipline for EROs and transparent supervision for AI workers.</p>
        </header>
        <div className={styles.surfaceStack}>
          {criticalSurfaces.map((surface, index) => (
            <article className={styles.surfaceScene} key={surface.code}>
              <div className={styles.surfaceSceneIndex}>{surface.code}</div>
              <div className={styles.surfaceSceneBody}>
                <span>{surface.theme}</span>
                <h3>{surface.title}</h3>
                <p>{surface.narrative}</p>
                <div className={styles.processRail}>
                  {surface.rail.map((step, stepIndex) => <div key={step}><b>{String(stepIndex + 1).padStart(2, '0')}</b><span>{step}</span></div>)}
                </div>
                <Link href={surface.href}>{surface.action} →</Link>
              </div>
              <div className={styles.surfaceScenePlate} data-scene={index}>
                <div className={styles.plateHeader}><span>{surface.title}</span><em>ROLE SCOPED</em></div>
                <div className={styles.plateRail}>{surface.rail.slice(0, 4).map((item) => <i key={item}>{item}</i>)}</div>
                <div className={styles.plateBody}>
                  <div><small>Current responsibility</small><strong>{surface.rail[2]}</strong><span>Evidence and authorization required</span></div>
                  <div><small>Next controlled action</small><strong>{surface.rail[3]}</strong><span>Transition guard evaluates eligibility</span></div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.serviceExchange}>
        <header className={styles.portfolioHeader}>
          <div><span>03 · LUXURY SERVICE EXCHANGE</span><h2>Every offer carries scope, exclusions, actions, gates and retention.</h2></div>
          <p>The catalog is executable metadata. The same record drives discovery, quoting, intake, assignments, workflow gates, delivery and audit evidence.</p>
        </header>
        <div className={styles.categoryRibbon}>
          {serviceCategories.map((category) => <div key={category.id}><b>{category.label}</b><span>{category.presentation}</span></div>)}
        </div>
        <div className={styles.serviceLedger}>
          {enterpriseServices.slice(0, 12).map((service) => (
            <article key={service.code}>
              <div className={styles.serviceCode}>{service.code}</div>
              <div className={styles.serviceBody}>
                <span>{service.category} · {service.deliveryMode}</span>
                <h3>{service.name}</h3>
                <p>{service.promise}</p>
                <div className={styles.serviceActions}>{service.actions.slice(0, 3).map((action) => <i key={action}>{action}</i>)}</div>
              </div>
              <div className={styles.servicePrice}>
                <small>{service.priceModel.replaceAll('-', ' ')}</small>
                <strong>{service.priceFrom ? money.format(service.priceFrom) : 'Custom'}</strong>
                <span>{service.unit ?? 'approved scope'}</span>
                <Link href={service.entryRoute}>Open service →</Link>
              </div>
            </article>
          ))}
        </div>
        <div className={styles.catalogAction}><Link href="/services">Open the complete service directory →</Link></div>
      </section>

      <section className={styles.transitionVault}>
        <header className={styles.portfolioHeader}>
          <div><span>04 · TRANSITION ROUTING</span><h2>State changes are permissions—not UI suggestions.</h2></div>
          <p>Each transition declares valid source states, authorized actors, required evidence, human approval, materiality, emitted event and fail-closed state.</p>
        </header>
        <div className={styles.transitionGrid}>
          {workflowTransitions.slice(0, 15).map((transition, index) => (
            <article key={transition.id}>
              <div className={styles.transitionNumber}>{String(index + 1).padStart(2, '0')}</div>
              <div className={styles.transitionStates}><span>{transition.from.slice(0, 2).join(' / ')}</span><b>→</b><strong>{transition.to}</strong></div>
              <h3>{transition.label}</h3>
              <p>{transition.evidence.map((item) => item.key).join(' · ')}</p>
              <footer><span>{transition.event}</span><em>{transition.humanApproval ? 'HUMAN APPROVAL' : 'POLICY AUTOMATION'}</em></footer>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.rolloutControl}>
        <div className={styles.rolloutCopy}>
          <span>05 · RELEASE EXECUTION</span>
          <h2>From polished prototype to evidence-backed production candidate.</h2>
          <p>The GitHub pipeline must prove code quality, route contracts, accessibility, security posture, build integrity, artifact provenance and rollback readiness before promotion.</p>
          <div className={styles.rolloutActions}>
            <Link href="/certification">Inspect certification evidence</Link>
            <Link href="/infrastructure">Inspect infrastructure controls</Link>
          </div>
        </div>
        <div className={styles.waveBoard}>
          {rolloutWaves.map((wave) => (
            <div key={wave.code}>
              <b>{wave.code}</b>
              <section><strong>{wave.title}</strong><p>{wave.detail}</p></section>
              <em data-state={wave.state}>{wave.state}</em>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
