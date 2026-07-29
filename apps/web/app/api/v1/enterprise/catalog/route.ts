import { NextResponse } from 'next/server';
import { domainActions, experienceThemes } from '@ross/experience-system';
import { enterpriseServices, serviceCategories } from '@ross/service-catalog';
import { workflowTransitions } from '@ross/workflow-engine';

export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(
    {
      contract: 'rtpsc.enterprise-catalog.v1',
      generatedAt: new Date().toISOString(),
      counts: {
        serviceCategories: serviceCategories.length,
        services: enterpriseServices.length,
        themes: experienceThemes.length,
        domainActions: domainActions.length,
        workflowTransitions: workflowTransitions.length
      },
      serviceCategories,
      services: enterpriseServices,
      themes: experienceThemes,
      actions: domainActions,
      transitions: workflowTransitions.map((transition) => ({
        id: transition.id,
        label: transition.label,
        from: transition.from,
        to: transition.to,
        actors: transition.actors,
        humanApproval: transition.humanApproval,
        materialAction: transition.materialAction,
        event: transition.event,
        failureState: transition.failureState,
        evidence: transition.evidence
      }))
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        'X-Content-Type-Options': 'nosniff'
      }
    }
  );
}
