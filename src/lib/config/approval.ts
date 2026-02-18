/**
 * Approval Workflow Configuration
 * Status transitions, workflow rules, and queue management
 * Used by: approval-workflow service, API routes, dashboard pages
 */

import type { CaseStatus } from '@prisma/client'

/**
 * Approval workflow status transitions
 * Defines which statuses can transition to which other statuses
 */
export const APPROVAL_WORKFLOW_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  DRAFT: ['IN_REVIEW', 'ARCHIVED'],
  IN_REVIEW: ['APPROVED', 'DRAFT', 'ARCHIVED'],
  APPROVED: ['PUBLISHED', 'DRAFT', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED'],
  ARCHIVED: ['DRAFT'],
}

/**
 * Approval workflow configuration
 * Contains rules, thresholds, and settings for the approval process
 */
export const APPROVAL_WORKFLOW = {
  // Minimum validation score required for approval
  requiredValidationScore: 85,

  // Whether medical review is required before publication
  requiresReview: true,

  // Default time limit for review (in hours)
  reviewTimeLimit: 72,

  // Queue prioritization rules
  queuePriority: {
    // Cases with higher complexity get higher priority
    complexityWeight: {
      ADVANCED: 3,
      INTERMEDIATE: 2,
      BASIC: 1,
    },
    // Cases waiting longer get higher priority (days)
    timeInQueueBoost: 0.5,
  },

  // Approval decision reasons
  rejectionReasons: [
    'Información médica incompleta',
    'Errores de precisión médica',
    'Calidad educativa insuficiente',
    'Formato o estructura incorrecta',
    'Contenido no apropiado',
    'Requiere más fuentes',
    'Requiere revisión de experto',
    'Otro',
  ],

  // Approval suggestions are optional
  suggestionsOptional: true,
  maxSuggestions: 5,

  // Status display configuration
  statusDisplay: {
    DRAFT: {
      label: 'Borrador',
      description: 'Caso en edición',
      color: 'secondary',
      icon: '📝',
      canTransitionTo: ['IN_REVIEW', 'ARCHIVED'],
    },
    IN_REVIEW: {
      label: 'En Revisión',
      description: 'Pendiente de aprobación',
      color: 'warning',
      icon: '👁️',
      canTransitionTo: ['APPROVED', 'DRAFT', 'ARCHIVED'],
    },
    APPROVED: {
      label: 'Aprobado',
      description: 'Listo para publicar',
      color: 'success',
      icon: '✓',
      canTransitionTo: ['PUBLISHED', 'DRAFT', 'ARCHIVED'],
    },
    PUBLISHED: {
      label: 'Publicado',
      description: 'Caso disponible para estudiantes',
      color: 'success',
      icon: '🌟',
      canTransitionTo: ['ARCHIVED'],
    },
    ARCHIVED: {
      label: 'Archivado',
      description: 'Caso archivado',
      color: 'secondary',
      icon: '📦',
      canTransitionTo: ['DRAFT'],
    },
  },
} as const

/**
 * Check if a transition between statuses is allowed
 * @param fromStatus - Current status
 * @param toStatus - Target status
 * @returns true if transition is allowed
 */
export function canTransition(fromStatus: CaseStatus, toStatus: CaseStatus): boolean {
  const allowed = APPROVAL_WORKFLOW_TRANSITIONS[fromStatus]
  return allowed.includes(toStatus)
}

/**
 * Get valid transitions from a status
 * @param status - Current status
 * @returns Array of valid target statuses
 */
export function getValidTransitions(status: CaseStatus): CaseStatus[] {
  return APPROVAL_WORKFLOW_TRANSITIONS[status] || []
}

/**
 * Get status display configuration
 * @param status - Case status
 * @returns Display configuration or undefined
 */
export function getStatusDisplay(status: keyof typeof APPROVAL_WORKFLOW.statusDisplay) {
  return APPROVAL_WORKFLOW.statusDisplay[status]
}

/**
 * Check if a case is ready for publication
 * @param status - Case status
 * @param validationScore - Validation score 0-100
 * @returns true if case can be published
 */
export function isReadyForPublication(
  status: CaseStatus,
  validationScore?: number | null
): boolean {
  if (status !== 'APPROVED') return false
  if (!validationScore) return false
  return validationScore >= APPROVAL_WORKFLOW.requiredValidationScore
}

/**
 * Get queue priority score
 * Used for sorting cases in approval queue
 * @param complexity - Case complexity
 * @param hoursInQueue - Hours the case has been in queue
 * @returns Priority score (higher = more urgent)
 */
export function getQueuePriority(
  complexity: string,
  hoursInQueue: number
): number {
  const complexityWeight =
    (APPROVAL_WORKFLOW.queuePriority.complexityWeight as any)[complexity] || 1
  const timeBoost = (hoursInQueue / 24) * APPROVAL_WORKFLOW.queuePriority.timeInQueueBoost

  return complexityWeight + timeBoost
}
