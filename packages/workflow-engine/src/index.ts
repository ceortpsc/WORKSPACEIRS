export type WorkflowState =
  | 'REQUESTED'
  | 'IDENTITY_PENDING'
  | 'AUTHENTICATED'
  | 'CONFLICT_REVIEW'
  | 'ENGAGEMENT_PENDING'
  | 'SCOPED'
  | 'PRICED'
  | 'PAYMENT_PENDING'
  | 'DOCUMENTS_PENDING'
  | 'READY_FOR_WORK'
  | 'IN_PROGRESS'
  | 'DUE_DILIGENCE'
  | 'HUMAN_REVIEW'
  | 'CLIENT_REVIEW'
  | 'SIGNATURE_PENDING'
  | 'READY_TO_RELEASE'
  | 'TRANSMISSION_PENDING'
  | 'TRANSMITTED'
  | 'ACKNOWLEDGED'
  | 'DELIVERED'
  | 'RETAINED'
  | 'NEEDS_INFO'
  | 'FLAG'
  | 'HOLD'
  | 'DENIED'
  | 'CANCELLED'
  | 'DISENGAGED';

export type WorkflowActor =
  | 'client'
  | 'client_support'
  | 'preparer'
  | 'reviewer'
  | 'ero'
  | 'manager'
  | 'compliance'
  | 'finance'
  | 'system_worker'
  | 'owner';

export type EvidenceRequirement = {
  key: string;
  description: string;
  required: boolean;
};

export type WorkflowTransition = {
  id: string;
  from: WorkflowState[];
  to: WorkflowState;
  label: string;
  actors: WorkflowActor[];
  evidence: EvidenceRequirement[];
  humanApproval: boolean;
  materialAction: boolean;
  event: string;
  failureState: WorkflowState;
};

export const workflowTransitions: readonly WorkflowTransition[] = [
  {
    id: 'begin-identity-verification', from: ['REQUESTED'], to: 'IDENTITY_PENDING',
    label: 'Begin identity verification', actors: ['client','client_support','system_worker'],
    evidence: [{ key: 'service_request_id', description: 'Immutable service-request identifier', required: true }],
    humanApproval: false, materialAction: false, event: 'IDENTITY_VERIFICATION_REQUESTED', failureState: 'HOLD'
  },
  {
    id: 'confirm-authentication', from: ['IDENTITY_PENDING'], to: 'AUTHENTICATED',
    label: 'Confirm authenticated identity', actors: ['system_worker','client_support'],
    evidence: [
      { key: 'identity_result_id', description: 'Approved provider verification result', required: true },
      { key: 'authentication_level', description: 'Assurance level achieved', required: true }
    ],
    humanApproval: false, materialAction: false, event: 'IDENTITY_VERIFIED', failureState: 'HOLD'
  },
  {
    id: 'open-conflict-screening', from: ['AUTHENTICATED'], to: 'CONFLICT_REVIEW',
    label: 'Open conflict screening', actors: ['client_support','manager','system_worker'],
    evidence: [{ key: 'party_index', description: 'Normalized party and related-entity index', required: true }],
    humanApproval: true, materialAction: true, event: 'CONFLICT_SCREENING_OPENED', failureState: 'HOLD'
  },
  {
    id: 'issue-engagement', from: ['CONFLICT_REVIEW'], to: 'ENGAGEMENT_PENDING',
    label: 'Issue scoped engagement package', actors: ['manager','owner'],
    evidence: [
      { key: 'conflict_clearance_id', description: 'Human conflict disposition', required: true },
      { key: 'engagement_version', description: 'Versioned engagement terms', required: true }
    ],
    humanApproval: true, materialAction: true, event: 'ENGAGEMENT_ISSUED', failureState: 'DENIED'
  },
  {
    id: 'accept-scope', from: ['ENGAGEMENT_PENDING'], to: 'SCOPED',
    label: 'Accept engagement scope', actors: ['client','manager'],
    evidence: [
      { key: 'client_signature_id', description: 'Authenticated client acceptance', required: true },
      { key: 'scope_snapshot_hash', description: 'Hash of accepted scope and exclusions', required: true }
    ],
    humanApproval: true, materialAction: true, event: 'ENGAGEMENT_ACCEPTED', failureState: 'HOLD'
  },
  {
    id: 'approve-price', from: ['SCOPED'], to: 'PRICED',
    label: 'Approve service price and fee basis', actors: ['client','finance','manager'],
    evidence: [
      { key: 'quote_id', description: 'Approved service quote', required: true },
      { key: 'pricing_policy_version', description: 'Applicable pricing policy version', required: true }
    ],
    humanApproval: true, materialAction: true, event: 'PRICE_APPROVED', failureState: 'HOLD'
  },
  {
    id: 'request-payment', from: ['PRICED'], to: 'PAYMENT_PENDING',
    label: 'Request authorized payment', actors: ['finance','system_worker'],
    evidence: [{ key: 'payment_request_id', description: 'Processor-safe payment request', required: true }],
    humanApproval: false, materialAction: false, event: 'PAYMENT_REQUESTED', failureState: 'HOLD'
  },
  {
    id: 'open-document-checklist', from: ['PRICED','PAYMENT_PENDING'], to: 'DOCUMENTS_PENDING',
    label: 'Open required-document checklist', actors: ['preparer','client_support','system_worker'],
    evidence: [{ key: 'checklist_version', description: 'Return/service-specific checklist version', required: true }],
    humanApproval: false, materialAction: false, event: 'DOCUMENT_CHECKLIST_OPENED', failureState: 'NEEDS_INFO'
  },
  {
    id: 'certify-ready-for-work', from: ['DOCUMENTS_PENDING','NEEDS_INFO'], to: 'READY_FOR_WORK',
    label: 'Certify file ready for assigned work', actors: ['preparer','reviewer','manager'],
    evidence: [
      { key: 'document_completeness_result', description: 'Checklist completeness result', required: true },
      { key: 'malware_scan_result', description: 'Clean malware result for uploaded files', required: true },
      { key: 'assignment_id', description: 'Qualified assigned practitioner or specialist', required: true }
    ],
    humanApproval: true, materialAction: true, event: 'FILE_READY_FOR_WORK', failureState: 'HOLD'
  },
  {
    id: 'start-production', from: ['READY_FOR_WORK'], to: 'IN_PROGRESS',
    label: 'Start assigned production work', actors: ['preparer','client_support','system_worker'],
    evidence: [{ key: 'assignment_id', description: 'Active assignment record', required: true }],
    humanApproval: false, materialAction: false, event: 'WORK_STARTED', failureState: 'HOLD'
  },
  {
    id: 'open-due-diligence', from: ['IN_PROGRESS','NEEDS_INFO'], to: 'DUE_DILIGENCE',
    label: 'Open due-diligence interview and evidence review', actors: ['preparer','reviewer'],
    evidence: [{ key: 'due_diligence_scope', description: 'Applicable credit, status or eligibility scope', required: true }],
    humanApproval: true, materialAction: true, event: 'DUE_DILIGENCE_OPENED', failureState: 'HOLD'
  },
  {
    id: 'submit-human-review', from: ['IN_PROGRESS','DUE_DILIGENCE','FLAG'], to: 'HUMAN_REVIEW',
    label: 'Submit complete work package for human review', actors: ['preparer','client_support','system_worker'],
    evidence: [
      { key: 'workpaper_manifest_hash', description: 'Immutable workpaper manifest', required: true },
      { key: 'source_lineage_complete', description: 'Source-to-output lineage confirmation', required: true }
    ],
    humanApproval: false, materialAction: false, event: 'HUMAN_REVIEW_REQUESTED', failureState: 'HOLD'
  },
  {
    id: 'release-client-review', from: ['HUMAN_REVIEW'], to: 'CLIENT_REVIEW',
    label: 'Release approved review package to client', actors: ['reviewer','manager'],
    evidence: [
      { key: 'review_disposition_id', description: 'Independent reviewer disposition', required: true },
      { key: 'review_artifact_hash', description: 'Hash of released review package', required: true }
    ],
    humanApproval: true, materialAction: true, event: 'CLIENT_REVIEW_RELEASED', failureState: 'HOLD'
  },
  {
    id: 'request-signature', from: ['CLIENT_REVIEW'], to: 'SIGNATURE_PENDING',
    label: 'Request completed authorization signature', actors: ['reviewer','ero','manager'],
    evidence: [
      { key: 'client_review_acknowledgment', description: 'Client review acknowledgment', required: true },
      { key: 'signature_package_version', description: 'Completed, nonblank signature package', required: true }
    ],
    humanApproval: true, materialAction: true, event: 'SIGNATURE_REQUESTED', failureState: 'HOLD'
  },
  {
    id: 'certify-release-ready', from: ['SIGNATURE_PENDING'], to: 'READY_TO_RELEASE',
    label: 'Certify all release gates complete', actors: ['ero','reviewer','manager'],
    evidence: [
      { key: 'signature_evidence_id', description: 'Authenticated signed authorization', required: true },
      { key: 'quality_gate_id', description: 'Final quality approval', required: true },
      { key: 'compliance_hold_clearance', description: 'No unresolved material HOLD', required: true }
    ],
    humanApproval: true, materialAction: true, event: 'RELEASE_READY_CERTIFIED', failureState: 'HOLD'
  },
  {
    id: 'create-transmission-intent', from: ['READY_TO_RELEASE'], to: 'TRANSMISSION_PENDING',
    label: 'Create controlled transmission intent', actors: ['ero'],
    evidence: [
      { key: 'environment', description: 'Authorized ATS or production environment', required: true },
      { key: 'schema_validation_id', description: 'Current schema and business-rule validation', required: true },
      { key: 'idempotency_key', description: 'Unique duplicate-prevention key', required: true }
    ],
    humanApproval: true, materialAction: true, event: 'TRANSMISSION_INTENT_CREATED', failureState: 'HOLD'
  },
  {
    id: 'record-transmission', from: ['TRANSMISSION_PENDING'], to: 'TRANSMITTED',
    label: 'Record authorized external transmission', actors: ['ero','system_worker'],
    evidence: [
      { key: 'submission_id', description: 'Internal submission identifier', required: true },
      { key: 'provider_correlation_id', description: 'External provider correlation identifier', required: true },
      { key: 'payload_hash', description: 'Hash of transmitted payload', required: true }
    ],
    humanApproval: true, materialAction: true, event: 'RETURN_TRANSMITTED', failureState: 'HOLD'
  },
  {
    id: 'record-acknowledgment', from: ['TRANSMITTED'], to: 'ACKNOWLEDGED',
    label: 'Correlate and preserve agency acknowledgment', actors: ['ero','system_worker'],
    evidence: [
      { key: 'ack_id', description: 'Acknowledgment identifier', required: true },
      { key: 'ack_payload_hash', description: 'Original acknowledgment payload hash', required: true }
    ],
    humanApproval: false, materialAction: true, event: 'AGENCY_ACKNOWLEDGMENT_RECORDED', failureState: 'FLAG'
  },
  {
    id: 'deliver-final-package', from: ['ACKNOWLEDGED','HUMAN_REVIEW','READY_TO_RELEASE'], to: 'DELIVERED',
    label: 'Deliver approved final package', actors: ['preparer','reviewer','ero','client_support'],
    evidence: [
      { key: 'delivery_manifest_hash', description: 'Manifest of final delivered artifacts', required: true },
      { key: 'delivery_channel', description: 'Approved secure delivery channel', required: true }
    ],
    humanApproval: true, materialAction: true, event: 'FINAL_PACKAGE_DELIVERED', failureState: 'HOLD'
  },
  {
    id: 'close-to-retention', from: ['DELIVERED','ACKNOWLEDGED','CANCELLED','DISENGAGED'], to: 'RETAINED',
    label: 'Close matter into governed retention', actors: ['manager','compliance','system_worker'],
    evidence: [
      { key: 'retention_rule_id', description: 'Applicable versioned retention rule', required: true },
      { key: 'retention_start', description: 'Retention trigger date', required: true },
      { key: 'legal_hold_status', description: 'Legal-hold state', required: true }
    ],
    humanApproval: true, materialAction: true, event: 'RETENTION_STARTED', failureState: 'HOLD'
  },
  {
    id: 'request-more-information', from: ['DOCUMENTS_PENDING','IN_PROGRESS','DUE_DILIGENCE','HUMAN_REVIEW','CLIENT_REVIEW'], to: 'NEEDS_INFO',
    label: 'Request specific additional information', actors: ['preparer','reviewer','client_support'],
    evidence: [
      { key: 'request_items', description: 'Specific requested items and reason', required: true },
      { key: 'response_deadline', description: 'Client response deadline', required: true }
    ],
    humanApproval: false, materialAction: false, event: 'MORE_INFORMATION_REQUESTED', failureState: 'HOLD'
  },
  {
    id: 'flag-material-issue', from: ['DOCUMENTS_PENDING','IN_PROGRESS','DUE_DILIGENCE','HUMAN_REVIEW','CLIENT_REVIEW'], to: 'FLAG',
    label: 'Flag material issue for disposition', actors: ['preparer','reviewer','ero','system_worker'],
    evidence: [{ key: 'flag_record', description: 'Issue, source, materiality and required disposition', required: true }],
    humanApproval: true, materialAction: true, event: 'MATERIAL_ISSUE_FLAGGED', failureState: 'HOLD'
  },
  {
    id: 'place-hold', from: ['REQUESTED','IDENTITY_PENDING','AUTHENTICATED','CONFLICT_REVIEW','ENGAGEMENT_PENDING','SCOPED','PRICED','PAYMENT_PENDING','DOCUMENTS_PENDING','READY_FOR_WORK','IN_PROGRESS','DUE_DILIGENCE','HUMAN_REVIEW','CLIENT_REVIEW','SIGNATURE_PENDING','READY_TO_RELEASE','TRANSMISSION_PENDING','TRANSMITTED','ACKNOWLEDGED','FLAG','NEEDS_INFO'], to: 'HOLD',
    label: 'Place matter on compliance HOLD', actors: ['reviewer','ero','manager','compliance','owner','system_worker'],
    evidence: [
      { key: 'hold_reason_code', description: 'Approved reason code', required: true },
      { key: 'policy_reference', description: 'Controlling policy or control reference', required: true },
      { key: 'evidence_refs', description: 'Evidence supporting the hold', required: true }
    ],
    humanApproval: true, materialAction: true, event: 'COMPLIANCE_HOLD_PLACED', failureState: 'HOLD'
  },
  {
    id: 'release-hold', from: ['HOLD'], to: 'HUMAN_REVIEW',
    label: 'Release resolved HOLD to human review', actors: ['reviewer','ero','manager','compliance','owner'],
    evidence: [
      { key: 'hold_resolution', description: 'Documented corrective action and resolution', required: true },
      { key: 'release_approver_id', description: 'Authorized human approver', required: true }
    ],
    humanApproval: true, materialAction: true, event: 'COMPLIANCE_HOLD_RELEASED', failureState: 'HOLD'
  },
  {
    id: 'disengage-client', from: ['REQUESTED','AUTHENTICATED','CONFLICT_REVIEW','ENGAGEMENT_PENDING','SCOPED','PRICED','PAYMENT_PENDING','DOCUMENTS_PENDING','READY_FOR_WORK','IN_PROGRESS','DUE_DILIGENCE','HUMAN_REVIEW','CLIENT_REVIEW','SIGNATURE_PENDING','HOLD','FLAG','NEEDS_INFO'], to: 'DISENGAGED',
    label: 'Issue written disengagement', actors: ['owner','manager','compliance'],
    evidence: [
      { key: 'disengagement_reason', description: 'Approved factual disengagement basis', required: true },
      { key: 'effective_at', description: 'Effective date and time', required: true },
      { key: 'deadline_notice', description: 'Known deadline and successor-professional notice', required: true },
      { key: 'records_process', description: 'Lawful records delivery process', required: true }
    ],
    humanApproval: true, materialAction: true, event: 'CLIENT_DISENGAGED', failureState: 'HOLD'
  }
] as const;

export type TransitionRequest = {
  transitionId: string;
  currentState: WorkflowState;
  actor: WorkflowActor;
  evidence: Record<string, unknown>;
  humanApprovalId?: string;
};

export type TransitionDecision = {
  allowed: boolean;
  nextState: WorkflowState;
  event: string;
  errors: string[];
  materialAction: boolean;
};

export function evaluateTransition(request: TransitionRequest): TransitionDecision {
  const transition = workflowTransitions.find((item) => item.id === request.transitionId);
  if (!transition) {
    return { allowed: false, nextState: 'HOLD', event: 'UNKNOWN_TRANSITION', errors: ['Unknown transition identifier.'], materialAction: true };
  }

  const errors: string[] = [];
  if (!transition.from.includes(request.currentState)) errors.push(`Transition ${transition.id} is not valid from ${request.currentState}.`);
  if (!transition.actors.includes(request.actor)) errors.push(`Actor ${request.actor} is not authorized for ${transition.id}.`);
  for (const requirement of transition.evidence) {
    if (requirement.required && (request.evidence[requirement.key] === undefined || request.evidence[requirement.key] === null || request.evidence[requirement.key] === '')) {
      errors.push(`Missing required evidence: ${requirement.key}.`);
    }
  }
  if (transition.humanApproval && !request.humanApprovalId) errors.push('A recorded human approval is required.');
  if (request.actor === 'system_worker' && transition.humanApproval) errors.push('A system worker cannot satisfy a human-approval gate.');

  return {
    allowed: errors.length === 0,
    nextState: errors.length === 0 ? transition.to : transition.failureState,
    event: errors.length === 0 ? transition.event : 'TRANSITION_BLOCKED',
    errors,
    materialAction: transition.materialAction
  };
}

export function listAvailableTransitions(state: WorkflowState, actor: WorkflowActor): WorkflowTransition[] {
  return workflowTransitions.filter((item) => item.from.includes(state) && item.actors.includes(actor));
}
