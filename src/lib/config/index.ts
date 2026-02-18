/**
 * Configuration Index
 * Centralized export of all configuration constants
 * Used by: services, API routes, components, pages
 */

// Validation configuration
export {
  VALIDATION_THRESHOLDS,
  COMPLEXITY_MINIMUMS,
  VALIDATION_SCORE_RANGES,
  VALIDATION_BADGE_SIZES,
  VALIDATION_TOOLTIP_DELAY,
  getValidationScoreInfo,
  meetsValidationThreshold,
  isReadyForPublication,
} from './validation'

// Approval workflow configuration
export {
  APPROVAL_WORKFLOW,
  APPROVAL_WORKFLOW_TRANSITIONS,
  canTransition,
  getValidTransitions,
  getStatusDisplay,
  isReadyForPublication as isReadyForPublicationApproval,
  getQueuePriority,
} from './approval'
