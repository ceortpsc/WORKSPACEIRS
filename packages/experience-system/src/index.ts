export type ExperienceThemeId =
  | 'executive-black-label'
  | 'taxpayer-concierge'
  | 'practitioner-studio'
  | 'ero-command'
  | 'resolution-counsel'
  | 'ledger-atelier'
  | 'ai-workforce-theater'
  | 'academy-registry';

export type ExperienceDensity = 'guided' | 'balanced' | 'dense' | 'command';
export type ExperienceRiskTone = 'advisory' | 'operational' | 'controlled' | 'critical';

export type ExperienceTheme = {
  id: ExperienceThemeId;
  label: string;
  audience: string[];
  density: ExperienceDensity;
  visualIntent: string;
  shell: 'concierge' | 'studio' | 'command' | 'registry';
  tokens: {
    canvas: string;
    surface: string;
    surfaceRaised: string;
    ink: string;
    muted: string;
    accent: string;
    accentStrong: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
    radius: string;
    shadow: string;
  };
  signaturePatterns: string[];
};

export const experienceThemes: readonly ExperienceTheme[] = [
  {
    id: 'executive-black-label',
    label: 'Executive Black Label',
    audience: ['Owner', 'Executive', 'Administrator', 'Compliance Officer'],
    density: 'command',
    visualIntent: 'Boardroom-grade portfolio command with evidence, risk, revenue and release posture.',
    shell: 'command',
    tokens: {
      canvas: '#050A12', surface: '#0B1423', surfaceRaised: '#111D30', ink: '#F7F3E8', muted: '#9AA6B8',
      accent: '#D8B45A', accentStrong: '#F3D783', border: '#26344A', success: '#49C78E', warning: '#F0B95E',
      danger: '#EF6B73', radius: '18px', shadow: '0 28px 90px rgba(0,0,0,.42)'
    },
    signaturePatterns: ['evidence ledger', 'portfolio risk rail', 'release certification board', 'executive exception drawer']
  },
  {
    id: 'taxpayer-concierge',
    label: 'Taxpayer Concierge',
    audience: ['Taxpayer', 'Business Client', 'Authorized Signer'],
    density: 'guided',
    visualIntent: 'Calm, plain-language guidance with one unmistakable next action and protected document exchange.',
    shell: 'concierge',
    tokens: {
      canvas: '#F5F7FB', surface: '#FFFFFF', surfaceRaised: '#EEF3FA', ink: '#10213B', muted: '#617088',
      accent: '#B58A2E', accentStrong: '#8A6417', border: '#D7E0EC', success: '#177A55', warning: '#A5650B',
      danger: '#A93C45', radius: '22px', shadow: '0 20px 60px rgba(16,33,59,.12)'
    },
    signaturePatterns: ['next-action stage', 'document journey', 'plain-language case timeline', 'secure concierge drawer']
  },
  {
    id: 'practitioner-studio',
    label: 'Practitioner Studio',
    audience: ['Preparer', 'Reviewer', 'Tax Manager'],
    density: 'dense',
    visualIntent: 'Evidence-first professional production with source lineage, workpapers and review annotations.',
    shell: 'studio',
    tokens: {
      canvas: '#0A1020', surface: '#111A2C', surfaceRaised: '#17243A', ink: '#EEF4FF', muted: '#9DAAC1',
      accent: '#76A9FF', accentStrong: '#B6D1FF', border: '#2B3B59', success: '#4FD0A0', warning: '#F2BE68',
      danger: '#FF7A84', radius: '12px', shadow: '0 18px 54px rgba(0,0,0,.32)'
    },
    signaturePatterns: ['source-workpaper split pane', 'due-diligence interview rail', 'review annotation canvas', 'materiality map']
  },
  {
    id: 'ero-command',
    label: 'ERO Command',
    audience: ['ERO', 'Transmitter', 'Release Manager'],
    density: 'command',
    visualIntent: 'High-discipline readiness, signature, environment, transmission, acknowledgment and reject control.',
    shell: 'command',
    tokens: {
      canvas: '#080D15', surface: '#0E1724', surfaceRaised: '#152235', ink: '#F4F8FC', muted: '#94A2B6',
      accent: '#E1B94F', accentStrong: '#FFE59A', border: '#2A394E', success: '#38C985', warning: '#FFB340',
      danger: '#FF5F69', radius: '10px', shadow: '0 22px 72px rgba(0,0,0,.4)'
    },
    signaturePatterns: ['environment isolation banner', 'readiness gate wall', 'transmission event rail', 'reject recovery console']
  },
  {
    id: 'resolution-counsel',
    label: 'Resolution Counsel',
    audience: ['Notice Specialist', 'Authorized Representative', 'Case Manager'],
    density: 'dense',
    visualIntent: 'Deadline-aware notice analysis, authority verification, issue framing and response assembly.',
    shell: 'studio',
    tokens: {
      canvas: '#F6F3ED', surface: '#FFFCF7', surfaceRaised: '#EEE8DE', ink: '#241F1A', muted: '#71685F',
      accent: '#8B5E2B', accentStrong: '#5E3A17', border: '#D8CEC0', success: '#2E7653', warning: '#9B641B',
      danger: '#9A3E3E', radius: '8px', shadow: '0 18px 48px rgba(55,42,28,.14)'
    },
    signaturePatterns: ['deadline rail', 'authority banner', 'notice page navigator', 'issue-response assembly table']
  },
  {
    id: 'ledger-atelier',
    label: 'Ledger Atelier',
    audience: ['Bookkeeper', 'Controller', 'Payroll Manager', 'Business Owner'],
    density: 'dense',
    visualIntent: 'Luxury financial operations with reconciliation proof, close discipline and approval lineage.',
    shell: 'studio',
    tokens: {
      canvas: '#F2F0EA', surface: '#FEFDF9', surfaceRaised: '#E9E5DC', ink: '#19221F', muted: '#68716C',
      accent: '#93713B', accentStrong: '#61461F', border: '#D1CCC0', success: '#2B7756', warning: '#A06917',
      danger: '#A74646', radius: '14px', shadow: '0 20px 55px rgba(35,43,38,.12)'
    },
    signaturePatterns: ['reconciliation ribbon', 'close calendar', 'exception drawer', 'balance proof sheet']
  },
  {
    id: 'ai-workforce-theater',
    label: 'AI Workforce Theater',
    audience: ['AI Supervisor', 'Client Support', 'Quality Reviewer', 'Compliance'],
    density: 'balanced',
    visualIntent: 'Transparent task contracting with persona scope, sources, risk, reviewer disposition and delivery proof.',
    shell: 'command',
    tokens: {
      canvas: '#080B17', surface: '#11162A', surfaceRaised: '#1A2140', ink: '#F0F2FF', muted: '#9FA7C7',
      accent: '#A78BFA', accentStrong: '#D8CCFF', border: '#333B63', success: '#4BC6A2', warning: '#F0B85A',
      danger: '#F07480', radius: '20px', shadow: '0 30px 90px rgba(12,8,35,.5)'
    },
    signaturePatterns: ['persona roster', 'task contract stage', 'source evidence dock', 'human disposition chamber']
  },
  {
    id: 'academy-registry',
    label: 'Academy Registry',
    audience: ['Learner', 'Instructor', 'Program Director', 'Credential Reviewer'],
    density: 'balanced',
    visualIntent: 'Academic program navigation, competency evidence, assessment and credential history.',
    shell: 'registry',
    tokens: {
      canvas: '#F6F8FC', surface: '#FFFFFF', surfaceRaised: '#EDF2FA', ink: '#15233D', muted: '#68768E',
      accent: '#0F70B7', accentStrong: '#084C7E', border: '#D5DFEC', success: '#267A56', warning: '#A56A13',
      danger: '#A63E48', radius: '16px', shadow: '0 18px 52px rgba(21,35,61,.12)'
    },
    signaturePatterns: ['program map', 'competency ledger', 'assessment studio', 'credential evidence transcript']
  }
] as const;

export type DomainActionRisk = 'low' | 'moderate' | 'high' | 'material';
export type DomainAction = {
  id: string;
  label: string;
  confirmation: string;
  risk: DomainActionRisk;
  evidence: string[];
  allowedRoles: string[];
  humanApproval: boolean;
  auditCategory: string;
};

export const domainActions: readonly DomainAction[] = [
  { id: 'request-missing-document', label: 'Request missing document', confirmation: 'Send a source-specific request with deadline and secure upload path.', risk: 'low', evidence: ['case_id','document_type','requested_by','deadline'], allowedRoles: ['preparer','reviewer','client_support'], humanApproval: false, auditCategory: 'CLIENT_REQUEST' },
  { id: 'approve-engagement-scope', label: 'Approve engagement scope', confirmation: 'Approve scope, exclusions, fee basis and responsible professional.', risk: 'high', evidence: ['engagement_version','price_quote','approver_id'], allowedRoles: ['owner','manager','authorized_client'], humanApproval: true, auditCategory: 'ENGAGEMENT' },
  { id: 'place-compliance-hold', label: 'Place case on compliance HOLD', confirmation: 'Suspend material actions and record the unresolved control condition.', risk: 'material', evidence: ['hold_reason','policy_id','evidence_refs','placed_by'], allowedRoles: ['reviewer','ero','compliance','owner'], humanApproval: true, auditCategory: 'COMPLIANCE_HOLD' },
  { id: 'release-review-copy', label: 'Release client review copy', confirmation: 'Release a watermarked review copy after reviewer disposition.', risk: 'high', evidence: ['review_id','artifact_hash','released_by'], allowedRoles: ['reviewer','manager'], humanApproval: true, auditCategory: 'RETURN_REVIEW' },
  { id: 'authorize-transmission-intent', label: 'Authorize transmission intent', confirmation: 'Create an idempotent transmission intent after all readiness gates pass.', risk: 'material', evidence: ['signature_evidence','schema_validation','environment','idempotency_key'], allowedRoles: ['ero'], humanApproval: true, auditCategory: 'EFILE_RELEASE' },
  { id: 'record-agency-acknowledgment', label: 'Record agency acknowledgment', confirmation: 'Correlate the acknowledgment to the transmission and preserve the original payload.', risk: 'high', evidence: ['submission_id','ack_id','received_at','payload_hash'], allowedRoles: ['ero','system_worker'], humanApproval: false, auditCategory: 'EFILE_ACK' },
  { id: 'approve-ai-deliverable', label: 'Approve AI-assisted deliverable', confirmation: 'Confirm source sufficiency, policy scope and client-safe language.', risk: 'high', evidence: ['task_id','source_refs','reviewer_id','disposition'], allowedRoles: ['reviewer','manager','compliance'], humanApproval: true, auditCategory: 'AI_REVIEW' },
  { id: 'generate-destruction-certificate', label: 'Generate destruction certificate', confirmation: 'Confirm retention expiry, legal-hold clearance and supervisor approval before destruction.', risk: 'material', evidence: ['retention_rule','legal_hold_check','approver_id','record_scope'], allowedRoles: ['data_governance','compliance'], humanApproval: true, auditCategory: 'DATA_DISPOSAL' }
] as const;

export function getTheme(id: ExperienceThemeId): ExperienceTheme {
  const theme = experienceThemes.find((item) => item.id === id);
  if (!theme) throw new Error(`Unknown RTPSC experience theme: ${id}`);
  return theme;
}

export function getDomainAction(id: string): DomainAction {
  const action = domainActions.find((item) => item.id === id);
  if (!action) throw new Error(`Unknown RTPSC domain action: ${id}`);
  return action;
}
