export type ServiceCategory =
  | 'individual-tax'
  | 'business-tax'
  | 'tax-resolution'
  | 'bookkeeping'
  | 'payroll'
  | 'advisory'
  | 'ero-operations'
  | 'technology'
  | 'ai-services'
  | 'education'
  | 'document-services'
  | 'enterprise';

export type PriceModel = 'fixed-from' | 'hourly-from' | 'monthly-from' | 'annual-from' | 'custom-quote';
export type DeliveryMode = 'self-service-assisted' | 'specialist-led' | 'managed-service' | 'project' | 'subscription';
export type ServiceRiskTier = 'standard' | 'elevated' | 'high' | 'material';

export type EnterpriseService = {
  code: string;
  slug: string;
  category: ServiceCategory;
  name: string;
  promise: string;
  scope: string[];
  exclusions: string[];
  deliverables: string[];
  priceModel: PriceModel;
  priceFrom?: number;
  unit?: string;
  deliveryMode: DeliveryMode;
  riskTier: ServiceRiskTier;
  theme: string;
  entryRoute: string;
  actions: string[];
  requiredGates: string[];
  retentionRule: string;
};

export const enterpriseServices: readonly EnterpriseService[] = [
  {
    code: 'IND-1040-SIGNATURE', slug: 'signature-individual-return', category: 'individual-tax',
    name: 'Signature Individual Tax Return', promise: 'Concierge preparation with evidence-first review and controlled e-file release.',
    scope: ['Federal Form 1040', 'One state return', 'W-2 and standard interest/dividend inputs', 'Client review conference', 'E-file acknowledgment tracking'],
    exclusions: ['Business schedules', 'Rental activity', 'Foreign reporting', 'Tax controversy'],
    deliverables: ['Review copy', 'Final signed package', 'E-file acknowledgment', 'Record-retention summary'],
    priceModel: 'fixed-from', priceFrom: 1399.99, unit: 'engagement', deliveryMode: 'specialist-led', riskTier: 'elevated',
    theme: 'taxpayer-concierge', entryRoute: '/services/signature-individual-return',
    actions: ['Begin secure intake','Upload wage and identity records','Approve engagement scope','Review completed return','Authorize transmission intent'],
    requiredGates: ['identity','conflict','engagement','payment','documents','due-diligence','review','signature','release'], retentionRule: 'RET-005'
  },
  {
    code: 'IND-SCHC-PREMIER', slug: 'self-employed-premier-return', category: 'individual-tax',
    name: 'Self-Employed Premier Return', promise: 'Schedule C preparation with business-income reconstruction, expense substantiation and due-diligence controls.',
    scope: ['Federal Form 1040', 'Schedule C', 'One state return', 'Expense classification', 'Mileage review', 'Quarterly-estimate briefing'],
    exclusions: ['Entity return', 'Payroll filing', 'Bookkeeping cleanup beyond quoted scope'],
    deliverables: ['Business-income workpaper', 'Draft and final return', 'Estimated-tax roadmap', 'E-file acknowledgment'],
    priceModel: 'fixed-from', priceFrom: 1429.99, unit: 'engagement', deliveryMode: 'specialist-led', riskTier: 'high',
    theme: 'practitioner-studio', entryRoute: '/services/self-employed-premier-return',
    actions: ['Open business-income interview','Request missing 1099 records','Classify substantiated expenses','Resolve due-diligence flags','Release client review copy'],
    requiredGates: ['identity','engagement','documents','income-reconciliation','due-diligence','review','signature'], retentionRule: 'RET-002'
  },
  {
    code: 'IND-RENTAL-WEALTH', slug: 'rental-investment-return', category: 'individual-tax',
    name: 'Rental and Investment Wealth Return', promise: 'Controlled reporting for rental, brokerage and investment activity with basis and document reconciliation.',
    scope: ['Schedule E', 'Brokerage statements', 'Capital gain/loss reporting', 'Depreciation review', 'One state return'],
    exclusions: ['1031 legal advice', 'Appraisal services', 'Entity restructuring'],
    deliverables: ['Basis and depreciation workpapers', 'Review copy', 'Final return', 'Planning observations'],
    priceModel: 'fixed-from', priceFrom: 1649.99, unit: 'engagement', deliveryMode: 'specialist-led', riskTier: 'high',
    theme: 'practitioner-studio', entryRoute: '/services/rental-investment-return',
    actions: ['Upload closing and brokerage packages','Reconcile basis records','Review depreciation schedule','Approve material assumptions'],
    requiredGates: ['identity','engagement','documents','basis-review','quality-review','signature'], retentionRule: 'RET-005'
  },
  {
    code: 'BUS-1120S-EXEC', slug: 's-corporation-executive-return', category: 'business-tax',
    name: 'S Corporation Executive Return', promise: 'Executive-grade Form 1120-S preparation with shareholder, payroll and balance-sheet reconciliation.',
    scope: ['Form 1120-S', 'K-1 preparation', 'Balance-sheet review', 'Officer compensation review', 'State return quoted separately when complex'],
    exclusions: ['Audit representation', 'Bookkeeping reconstruction beyond scope', 'Legal entity advice'],
    deliverables: ['Entity return package', 'K-1 package', 'Officer-compensation observations', 'E-file acknowledgment'],
    priceModel: 'fixed-from', priceFrom: 2499.99, unit: 'entity return', deliveryMode: 'specialist-led', riskTier: 'material',
    theme: 'executive-black-label', entryRoute: '/services/s-corporation-executive-return',
    actions: ['Open entity intake','Reconcile shareholder basis','Validate payroll tie-out','Approve return release','Record agency acknowledgment'],
    requiredGates: ['authority','engagement','payment','documents','balance-sheet','shareholder-basis','review','signature','release'], retentionRule: 'RET-005'
  },
  {
    code: 'BUS-1065-PARTNER', slug: 'partnership-return', category: 'business-tax',
    name: 'Partnership and Member Return', promise: 'Form 1065 preparation with partner allocation, capital-account and K-1 controls.',
    scope: ['Form 1065', 'K-1 preparation', 'Partner allocation review', 'Capital-account rollforward', 'One state filing allowance'],
    exclusions: ['Complex waterfall modeling', 'Valuation', 'Legal partnership amendments'],
    deliverables: ['Partnership return', 'K-1 package', 'Capital-account workpaper', 'Issue memorandum'],
    priceModel: 'fixed-from', priceFrom: 2799.99, unit: 'entity return', deliveryMode: 'specialist-led', riskTier: 'material',
    theme: 'executive-black-label', entryRoute: '/services/partnership-return',
    actions: ['Collect partner roster','Reconcile allocations','Resolve capital variances','Release partner packages'],
    requiredGates: ['authority','engagement','documents','allocation-review','quality-review','signature'], retentionRule: 'RET-005'
  },
  {
    code: 'BUS-1120-CORP', slug: 'c-corporation-return', category: 'business-tax',
    name: 'C Corporation Return', promise: 'Corporate return preparation with book-to-tax, officer and distribution review.',
    scope: ['Form 1120', 'Book-to-tax reconciliation', 'Officer and ownership review', 'State return allowance'],
    exclusions: ['International forms', 'Consolidated returns', 'Transfer-pricing studies'],
    deliverables: ['Corporate return', 'Book-to-tax schedule', 'Executive issue summary', 'E-file acknowledgment'],
    priceModel: 'fixed-from', priceFrom: 2999.99, unit: 'entity return', deliveryMode: 'specialist-led', riskTier: 'material',
    theme: 'executive-black-label', entryRoute: '/services/c-corporation-return',
    actions: ['Open corporate intake','Map trial balance','Approve book-to-tax adjustments','Authorize release'],
    requiredGates: ['authority','engagement','documents','trial-balance','quality-review','signature'], retentionRule: 'RET-005'
  },
  {
    code: 'RES-NOTICE-TRIAGE', slug: 'irs-notice-triage', category: 'tax-resolution',
    name: 'IRS Notice Triage and Action Plan', promise: 'Deadline-aware notice review with issue classification, authority check and next-step plan.',
    scope: ['Complete notice-page review', 'Deadline extraction', 'Account and return issue mapping', 'Written action plan', 'One review conference'],
    exclusions: ['Representation before IRS', 'Appeal filing', 'Legal opinion'],
    deliverables: ['Notice classification report', 'Deadline calendar', 'Required-document checklist', 'Recommended response lane'],
    priceModel: 'fixed-from', priceFrom: 499.99, unit: 'notice', deliveryMode: 'specialist-led', riskTier: 'high',
    theme: 'resolution-counsel', entryRoute: '/services/irs-notice-triage',
    actions: ['Upload every notice page','Verify taxpayer authority','Classify notice issue','Create deadline task','Deliver action plan'],
    requiredGates: ['identity','authority','engagement','notice-completeness','human-review'], retentionRule: 'RET-008'
  },
  {
    code: 'RES-RESPONSE-PKG', slug: 'notice-response-package', category: 'tax-resolution',
    name: 'Notice Response Package', promise: 'Evidence-indexed response preparation with review, signature and delivery controls.',
    scope: ['Issue analysis', 'Response drafting', 'Exhibit index', 'Client signature package', 'Submission instructions'],
    exclusions: ['Court filing', 'Legal representation', 'Unapproved factual assertions'],
    deliverables: ['Response letter', 'Exhibit package', 'Mail/upload instructions', 'Follow-up calendar'],
    priceModel: 'fixed-from', priceFrom: 1499.99, unit: 'matter', deliveryMode: 'specialist-led', riskTier: 'material',
    theme: 'resolution-counsel', entryRoute: '/services/notice-response-package',
    actions: ['Build issue matrix','Request missing evidence','Assemble exhibits','Approve response language','Release response package'],
    requiredGates: ['authority','engagement','evidence','human-review','client-approval','delivery'], retentionRule: 'RET-008'
  },
  {
    code: 'RES-TRANSCRIPT-RECON', slug: 'transcript-reconciliation', category: 'tax-resolution',
    name: 'Authorized Transcript Reconciliation', promise: 'Return-to-transcript variance analysis using authorized artifacts and documented uncertainty.',
    scope: ['Transcript artifact intake', 'Return and workpaper comparison', 'Variance scoring', 'Disposition recommendations'],
    exclusions: ['Direct access to IRS internal Master File', 'Guarantee of account outcome'],
    deliverables: ['Variance ledger', 'Materiality map', 'PASS/FLAG/HOLD disposition', 'Next-action report'],
    priceModel: 'fixed-from', priceFrom: 999.99, unit: 'tax year', deliveryMode: 'specialist-led', riskTier: 'material',
    theme: 'resolution-counsel', entryRoute: '/services/transcript-reconciliation',
    actions: ['Verify authorization','Upload transcript artifacts','Run variance analysis','Review material findings','Issue disposition report'],
    requiredGates: ['identity','authority','engagement','artifact-integrity','human-review'], retentionRule: 'RET-005'
  },
  {
    code: 'BKS-MONTHLY-ESSENTIAL', slug: 'monthly-bookkeeping-essential', category: 'bookkeeping',
    name: 'Monthly Books Essential', promise: 'Structured transaction coding, reconciliation and monthly management reporting.',
    scope: ['Up to two financial accounts', 'Monthly reconciliation', 'Transaction classification', 'Profit-and-loss and balance-sheet package'],
    exclusions: ['Payroll', 'Inventory accounting', 'Historical cleanup'],
    deliverables: ['Monthly close checklist', 'Reconciliation evidence', 'Management statements', 'Exception list'],
    priceModel: 'monthly-from', priceFrom: 799.99, unit: 'month', deliveryMode: 'subscription', riskTier: 'elevated',
    theme: 'ledger-atelier', entryRoute: '/services/monthly-bookkeeping-essential',
    actions: ['Connect approved data source','Classify exceptions','Approve reconciliation','Release monthly close package'],
    requiredGates: ['authority','engagement','data-access','reconciliation','manager-approval'], retentionRule: 'RET-005'
  },
  {
    code: 'BKS-MONTHLY-CONTROLLER', slug: 'virtual-controller', category: 'bookkeeping',
    name: 'Virtual Controller Black Label', promise: 'High-touch close management, cash-flow visibility, controls and executive reporting.',
    scope: ['Up to eight financial accounts', 'Monthly close management', 'Cash-flow dashboard', 'Budget-to-actual review', 'Executive conference'],
    exclusions: ['Audit or assurance opinion', 'Investment advice', 'Legal services'],
    deliverables: ['Controller close book', 'Executive KPI brief', 'Cash-flow outlook', 'Control exceptions'],
    priceModel: 'monthly-from', priceFrom: 3499.99, unit: 'month', deliveryMode: 'managed-service', riskTier: 'high',
    theme: 'executive-black-label', entryRoute: '/services/virtual-controller',
    actions: ['Open close cycle','Assign reconciliation owners','Review control exceptions','Approve executive package','Close accounting period'],
    requiredGates: ['authority','engagement','data-access','close-review','executive-approval'], retentionRule: 'RET-005'
  },
  {
    code: 'BKS-CLEANUP', slug: 'bookkeeping-cleanup', category: 'bookkeeping',
    name: 'Bookkeeping Cleanup and Reconstruction', promise: 'Project-based correction of uncategorized, unreconciled or incomplete financial records.',
    scope: ['Diagnostic assessment', 'Chart-of-accounts normalization', 'Reconciliation backlog', 'Exception report'],
    exclusions: ['Fraud examination', 'Audit opinion', 'Unsupported fabricated entries'],
    deliverables: ['Cleanup workplan', 'Corrected books', 'Reconciliation package', 'Outstanding-risk report'],
    priceModel: 'fixed-from', priceFrom: 2499.99, unit: 'project', deliveryMode: 'project', riskTier: 'high',
    theme: 'ledger-atelier', entryRoute: '/services/bookkeeping-cleanup',
    actions: ['Run books diagnostic','Approve reconstruction scope','Resolve transaction exceptions','Certify cleaned period'],
    requiredGates: ['authority','engagement','deposit','source-records','quality-review'], retentionRule: 'RET-005'
  },
  {
    code: 'PAY-MANAGED', slug: 'managed-payroll', category: 'payroll',
    name: 'Managed Payroll Operations', promise: 'Controlled payroll processing with manager approval, exception handling and filing evidence.',
    scope: ['Employee setup', 'Regular payroll cycle', 'Earnings and deduction review', 'Approval workflow', 'Statement delivery'],
    exclusions: ['Employment-law advice', 'Benefit-plan administration unless quoted'],
    deliverables: ['Payroll register', 'Approval evidence', 'Employee statements', 'Tax-liability reconciliation'],
    priceModel: 'monthly-from', priceFrom: 599.99, unit: 'month plus per employee', deliveryMode: 'managed-service', riskTier: 'material',
    theme: 'ledger-atelier', entryRoute: '/services/managed-payroll',
    actions: ['Open pay cycle','Resolve time exceptions','Approve payroll register','Release employee statements','Reconcile tax liability'],
    requiredGates: ['authority','engagement','employee-data','manager-approval','payment-rail','filing-evidence'], retentionRule: 'RET-004'
  },
  {
    code: 'PAY-CATCHUP', slug: 'payroll-catchup', category: 'payroll',
    name: 'Payroll Catch-Up and Reconciliation', promise: 'Project recovery for missed payroll records, liabilities and filing evidence.',
    scope: ['Period assessment', 'Payroll register reconstruction', 'Tax-liability mapping', 'Correction roadmap'],
    exclusions: ['Agency penalty abatement guarantee', 'Legal representation'],
    deliverables: ['Catch-up ledger', 'Liability schedule', 'Filing checklist', 'Management action report'],
    priceModel: 'fixed-from', priceFrom: 1999.99, unit: 'project', deliveryMode: 'project', riskTier: 'material',
    theme: 'resolution-counsel', entryRoute: '/services/payroll-catchup',
    actions: ['Collect payroll history','Reconcile periods','Identify filing gaps','Approve correction roadmap'],
    requiredGates: ['authority','engagement','source-records','human-review'], retentionRule: 'RET-004'
  },
  {
    code: 'ADV-TAX-ROADMAP', slug: 'tax-planning-roadmap', category: 'advisory',
    name: 'Strategic Tax Planning Roadmap', promise: 'Scenario-based planning grounded in verified current facts and documented assumptions.',
    scope: ['Current-year projection', 'Scenario comparison', 'Estimated-payment review', 'Action calendar'],
    exclusions: ['Guaranteed savings', 'Legal or investment advice', 'Implementation outside scope'],
    deliverables: ['Planning memorandum', 'Scenario matrix', 'Estimated-payment schedule', 'Decision checklist'],
    priceModel: 'fixed-from', priceFrom: 1499.99, unit: 'planning cycle', deliveryMode: 'specialist-led', riskTier: 'high',
    theme: 'executive-black-label', entryRoute: '/services/tax-planning-roadmap',
    actions: ['Confirm current facts','Model planning scenarios','Review assumptions','Approve action roadmap'],
    requiredGates: ['identity','engagement','current-data','human-review'], retentionRule: 'RET-008'
  },
  {
    code: 'ADV-BUSINESS-OPS', slug: 'business-operations-advisory', category: 'advisory',
    name: 'Business Operations Advisory', promise: 'Executive operating review across revenue, expense, workflow, controls and reporting.',
    scope: ['Operating diagnostic', 'Process mapping', 'KPI architecture', '90-day implementation roadmap'],
    exclusions: ['Legal restructuring', 'Assurance opinion', 'Guaranteed revenue result'],
    deliverables: ['Executive diagnostic', 'Process map', 'KPI scorecard', 'Implementation backlog'],
    priceModel: 'fixed-from', priceFrom: 4999.99, unit: 'engagement', deliveryMode: 'project', riskTier: 'high',
    theme: 'executive-black-label', entryRoute: '/services/business-operations-advisory',
    actions: ['Open executive discovery','Map operating system','Prioritize control gaps','Approve transformation roadmap'],
    requiredGates: ['engagement','data-access','executive-interviews','final-approval'], retentionRule: 'RET-008'
  },
  {
    code: 'ERO-OFFICE-SETUP', slug: 'ero-office-setup', category: 'ero-operations',
    name: 'ERO Office Operating-System Setup', promise: 'Governed tax-office implementation covering roles, workflow, security, review and e-file readiness.',
    scope: ['Office workflow design', 'RBAC matrix', 'WISP operating controls', 'Quality-review process', 'Release checklist'],
    exclusions: ['Government credential issuance', 'Guaranteed EFIN approval', 'Unauthorized IRS integration'],
    deliverables: ['Operating manual', 'Role matrix', 'Release gates', 'Training plan', 'Readiness report'],
    priceModel: 'fixed-from', priceFrom: 14999.99, unit: 'office rollout', deliveryMode: 'project', riskTier: 'material',
    theme: 'ero-command', entryRoute: '/services/ero-office-setup',
    actions: ['Assess office readiness','Design role boundaries','Configure release gates','Run mock production cycle','Issue readiness report'],
    requiredGates: ['owner-authorization','scope','security-review','training','acceptance-test'], retentionRule: 'RET-007'
  },
  {
    code: 'ERO-QA-REVIEW', slug: 'tax-office-quality-review', category: 'ero-operations',
    name: 'Tax Office Quality and Compliance Review', promise: 'Independent review of workflow, evidence, security, due diligence and release controls.',
    scope: ['Sample case review', 'Policy and workflow review', 'Findings classification', 'Corrective-action plan'],
    exclusions: ['Legal opinion', 'Government audit representation', 'Certification by regulator'],
    deliverables: ['Findings register', 'Risk rating', 'Corrective-action plan', 'Executive briefing'],
    priceModel: 'fixed-from', priceFrom: 7499.99, unit: 'review', deliveryMode: 'project', riskTier: 'material',
    theme: 'ero-command', entryRoute: '/services/tax-office-quality-review',
    actions: ['Approve review scope','Select case sample','Test control evidence','Classify findings','Approve remediation plan'],
    requiredGates: ['authority','confidentiality','scope','evidence-access','executive-acceptance'], retentionRule: 'RET-010'
  },
  {
    code: 'TECH-NEXTJS-PLATFORM', slug: 'nextjs-enterprise-platform', category: 'technology',
    name: 'Next.js Enterprise Platform Engineering', promise: 'Production-oriented web platform with domain architecture, security gates, observability and CI/CD.',
    scope: ['Next.js application architecture', 'Node API contracts', 'Design system', 'RBAC shell', 'GitHub Actions', 'Deployment runbook'],
    exclusions: ['Third-party license fees', 'Unapproved production credentials', 'Guaranteed certification'],
    deliverables: ['Monorepo codebase', 'Architecture records', 'CI pipeline', 'Environment matrix', 'Release evidence package'],
    priceModel: 'fixed-from', priceFrom: 49999.99, unit: 'platform phase', deliveryMode: 'project', riskTier: 'material',
    theme: 'executive-black-label', entryRoute: '/services/nextjs-enterprise-platform',
    actions: ['Approve platform blueprint','Create governed monorepo','Implement domain surfaces','Run quality gates','Promote certified release'],
    requiredGates: ['scope','architecture-review','security-review','test-evidence','release-approval'], retentionRule: 'RET-007'
  },
  {
    code: 'TECH-API-INTEGRATION', slug: 'api-integration-engineering', category: 'technology',
    name: 'API and Integration Engineering', promise: 'Versioned contracts, adapter isolation, retry safety, auditability and operational monitoring.',
    scope: ['OpenAPI contract', 'Adapter design', 'Authentication model', 'Idempotency', 'Error and retry policy', 'Observability'],
    exclusions: ['Unauthorized scraping', 'Credential procurement', 'Vendor obligations outside contract'],
    deliverables: ['API contract', 'Adapter package', 'Integration tests', 'Runbook', 'Readiness matrix'],
    priceModel: 'fixed-from', priceFrom: 14999.99, unit: 'integration', deliveryMode: 'project', riskTier: 'material',
    theme: 'practitioner-studio', entryRoute: '/services/api-integration-engineering',
    actions: ['Approve data contract','Implement adapter boundary','Test failure modes','Certify integration readiness'],
    requiredGates: ['vendor-contract','security-review','test-environment','acceptance-test'], retentionRule: 'RET-011'
  },
  {
    code: 'TECH-CLOUD-RELEASE', slug: 'cloud-release-engineering', category: 'technology',
    name: 'Cloud Release and Reliability Engineering', promise: 'Environment-separated deployment, monitoring, rollback, backup and recovery design.',
    scope: ['Environment design', 'Infrastructure automation', 'CI/CD', 'Monitoring', 'Backup and restore', 'Rollback plan'],
    exclusions: ['Cloud consumption charges', 'Unapproved live cutover'],
    deliverables: ['Infrastructure code', 'Release pipeline', 'SLO dashboard', 'Recovery runbook', 'Cutover checklist'],
    priceModel: 'fixed-from', priceFrom: 24999.99, unit: 'environment program', deliveryMode: 'project', riskTier: 'material',
    theme: 'ero-command', entryRoute: '/services/cloud-release-engineering',
    actions: ['Define environment matrix','Provision controlled infrastructure','Run resilience tests','Approve production cutover'],
    requiredGates: ['architecture','security','budget','backup-test','rollback-test','executive-approval'], retentionRule: 'RET-010'
  },
  {
    code: 'AI-SUPPORT-HUB', slug: 'ai-customer-support-hub', category: 'ai-services',
    name: 'AI Customer Support Hub', promise: 'Policy-scoped real-time support with identity-aware routing, source-linked answers and human escalation.',
    scope: ['Persona registry', 'Support intake', 'Knowledge retrieval', 'Risk routing', 'QA review', 'Audit evidence'],
    exclusions: ['Autonomous tax advice', 'Unauthorized account changes', 'Final legal conclusions'],
    deliverables: ['Support interface', 'Persona policies', 'Escalation matrix', 'Conversation audit model', 'Operational dashboard'],
    priceModel: 'fixed-from', priceFrom: 19999.99, unit: 'implementation', deliveryMode: 'project', riskTier: 'material',
    theme: 'ai-workforce-theater', entryRoute: '/services/ai-customer-support-hub',
    actions: ['Define approved personas','Map support intents','Configure risk tiers','Test escalation','Release supervised service'],
    requiredGates: ['privacy-review','knowledge-approval','model-evaluation','human-oversight','release-approval'], retentionRule: 'RET-014'
  },
  {
    code: 'AI-TASK-WORKFORCE', slug: 'ai-task-workforce', category: 'ai-services',
    name: 'AI Task Workforce Implementation', promise: 'Paid AI-assisted task execution with scope contracts, source evidence, approval and delivery proof.',
    scope: ['Task catalog', 'Pricing hooks', 'Persona permissions', 'Tool restrictions', 'Review queues', 'Delivery workflow'],
    exclusions: ['Autonomous material tax actions', 'Unreviewed representation', 'Credential sharing'],
    deliverables: ['AI task catalog', 'Workflow engine', 'Reviewer console', 'Audit schema', 'Client delivery interface'],
    priceModel: 'fixed-from', priceFrom: 29999.99, unit: 'implementation', deliveryMode: 'project', riskTier: 'material',
    theme: 'ai-workforce-theater', entryRoute: '/services/ai-task-workforce',
    actions: ['Approve task contracts','Assign persona scopes','Configure evidence requirements','Run adversarial tests','Certify supervised rollout'],
    requiredGates: ['privacy','security','model-evaluation','human-review','release-certification'], retentionRule: 'RET-014'
  },
  {
    code: 'EDU-PTIN-PRO', slug: 'tax-professional-foundations', category: 'education',
    name: 'Tax Professional Foundations Program', promise: 'Structured training in ethics, intake, due diligence, preparation workflow, review and client service.',
    scope: ['Learning modules', 'Knowledge checks', 'Case simulations', 'Policy acknowledgments', 'Completion evidence'],
    exclusions: ['Guaranteed credential approval', 'Government endorsement'],
    deliverables: ['Learner portal', 'Assessments', 'Completion transcript', 'Competency report'],
    priceModel: 'fixed-from', priceFrom: 1999.99, unit: 'learner', deliveryMode: 'subscription', riskTier: 'standard',
    theme: 'academy-registry', entryRoute: '/services/tax-professional-foundations',
    actions: ['Enroll learner','Assign curriculum','Complete case simulation','Record instructor review','Issue completion evidence'],
    requiredGates: ['enrollment','payment','identity','assessment','completion-review'], retentionRule: 'RET-007'
  },
  {
    code: 'EDU-ERO-LEADERSHIP', slug: 'ero-leadership-program', category: 'education',
    name: 'ERO Leadership and Operations Program', promise: 'Advanced training for tax-office governance, security, workflow, quality and release accountability.',
    scope: ['ERO operations', 'Security governance', 'Due diligence', 'Release controls', 'Incident exercises', 'Capstone'],
    exclusions: ['EFIN issuance', 'Government certification'],
    deliverables: ['Program map', 'Scenario assessments', 'Capstone evaluation', 'Completion transcript'],
    priceModel: 'fixed-from', priceFrom: 4999.99, unit: 'leader', deliveryMode: 'subscription', riskTier: 'elevated',
    theme: 'academy-registry', entryRoute: '/services/ero-leadership-program',
    actions: ['Assign leadership path','Complete incident exercise','Pass release-control simulation','Approve capstone'],
    requiredGates: ['enrollment','identity','assessment','capstone-review'], retentionRule: 'RET-007'
  },
  {
    code: 'DOC-IRS-LETTER', slug: 'irs-letter-analysis', category: 'document-services',
    name: 'IRS Letter and Notice Analysis Report', promise: 'Page-complete document review with issue, deadline, requested action and next-step summary.',
    scope: ['OCR and page validation', 'Notice classification', 'Deadline extraction', 'Plain-language analysis', 'Escalation recommendation'],
    exclusions: ['Representation', 'Response drafting unless separately ordered', 'Outcome guarantee'],
    deliverables: ['Analysis report', 'Deadline alert', 'Required-action checklist', 'Specialist referral lane'],
    priceModel: 'fixed-from', priceFrom: 299.99, unit: 'letter set', deliveryMode: 'self-service-assisted', riskTier: 'high',
    theme: 'resolution-counsel', entryRoute: '/services/irs-letter-analysis',
    actions: ['Upload every page','Validate document completeness','Extract apparent deadline','Generate reviewed analysis'],
    requiredGates: ['identity','document-scan','classification','human-review'], retentionRule: 'RET-015'
  },
  {
    code: 'DOC-BUSINESS-PACKET', slug: 'business-document-packet', category: 'document-services',
    name: 'Business Documentation Packet', promise: 'Professionally structured operational, onboarding or financial documentation tailored to an approved scope.',
    scope: ['Requirements interview', 'Document drafting', 'Brand formatting', 'Version control', 'Final PDF and editable source'],
    exclusions: ['Legal instruments requiring attorney drafting', 'False or backdated records'],
    deliverables: ['Branded PDF', 'Editable source', 'Document index', 'Version history'],
    priceModel: 'fixed-from', priceFrom: 999.99, unit: 'packet', deliveryMode: 'project', riskTier: 'elevated',
    theme: 'executive-black-label', entryRoute: '/services/business-document-packet',
    actions: ['Approve document scope','Provide source facts','Review draft packet','Approve final release'],
    requiredGates: ['identity','scope','source-verification','client-approval'], retentionRule: 'RET-007'
  },
  {
    code: 'ENT-MULTIOFFICE', slug: 'multi-office-tax-platform', category: 'enterprise',
    name: 'Multi-Office Tax Platform Rollout', promise: 'Tenant-isolated operating system for multiple offices, roles, service lines and controlled release.',
    scope: ['Tenant architecture', 'Office hierarchy', 'RBAC', 'Policy versions', 'Service catalog', 'Analytics', 'Release governance'],
    exclusions: ['Government credential issuance', 'Third-party fees', 'Unapproved external integrations'],
    deliverables: ['Enterprise platform', 'Tenant administration', 'Rollout playbook', 'Training program', 'Certification evidence'],
    priceModel: 'custom-quote', deliveryMode: 'project', riskTier: 'material',
    theme: 'executive-black-label', entryRoute: '/services/multi-office-tax-platform',
    actions: ['Approve enterprise architecture','Configure tenant boundaries','Migrate controlled data','Run office acceptance tests','Certify phased rollout'],
    requiredGates: ['executive-scope','security-architecture','migration-plan','office-UAT','release-certification'], retentionRule: 'RET-007'
  },
  {
    code: 'ENT-WHITE-LABEL', slug: 'white-label-tax-technology', category: 'enterprise',
    name: 'White-Label Tax Technology Program', promise: 'Branded tenant experience with governed feature flags, service configuration and release controls.',
    scope: ['Brand package', 'Tenant themes', 'Service configuration', 'Role matrix', 'Deployment profile', 'Support model'],
    exclusions: ['Trademark clearance', 'Government endorsement', 'Uncontrolled custom code'],
    deliverables: ['White-label tenant', 'Theme tokens', 'Service catalog', 'Admin controls', 'Release package'],
    priceModel: 'annual-from', priceFrom: 49999.99, unit: 'year plus implementation', deliveryMode: 'subscription', riskTier: 'material',
    theme: 'executive-black-label', entryRoute: '/services/white-label-tax-technology',
    actions: ['Approve brand governance','Configure tenant package','Validate role boundaries','Run release certification','Activate tenant'],
    requiredGates: ['contract','brand-approval','security-review','tenant-UAT','release-approval'], retentionRule: 'RET-007'
  }
] as const;

export function getServiceBySlug(slug: string): EnterpriseService | undefined {
  return enterpriseServices.find((service) => service.slug === slug);
}

export function listServicesByCategory(category: ServiceCategory): EnterpriseService[] {
  return enterpriseServices.filter((service) => service.category === category);
}

export const serviceCategories: readonly { id: ServiceCategory; label: string; presentation: string }[] = [
  { id: 'individual-tax', label: 'Individual Tax', presentation: 'Concierge preparation and controlled filing' },
  { id: 'business-tax', label: 'Business Tax', presentation: 'Entity compliance and executive reporting' },
  { id: 'tax-resolution', label: 'Tax Resolution', presentation: 'Notice, transcript and response operations' },
  { id: 'bookkeeping', label: 'Bookkeeping', presentation: 'Ledger, reconciliation and close management' },
  { id: 'payroll', label: 'Payroll', presentation: 'Approved payroll cycles and filing evidence' },
  { id: 'advisory', label: 'Advisory', presentation: 'Planning, controls and operating transformation' },
  { id: 'ero-operations', label: 'ERO Operations', presentation: 'Tax-office readiness, quality and governance' },
  { id: 'technology', label: 'Technology', presentation: 'Next.js, APIs, cloud and release engineering' },
  { id: 'ai-services', label: 'AI Services', presentation: 'Supervised support and paid task workforces' },
  { id: 'education', label: 'Education', presentation: 'Professional training and competency evidence' },
  { id: 'document-services', label: 'Document Services', presentation: 'Structured analysis and branded deliverables' },
  { id: 'enterprise', label: 'Enterprise', presentation: 'Multi-office and white-label platform programs' }
] as const;
