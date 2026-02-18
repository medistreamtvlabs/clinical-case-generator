/**
 * Services module exports
 * Centralized service exports for case management, validation, and workflow
 */

export {
  validateCaseContent,
  validateCasesBatch,
  generateValidationReportText,
  meetsComplexityThreshold,
  getValidationThresholds,
  type ValidationReport,
  type ValidationIssue,
  type ValidationWarning,
  type ValidationSuggestion,
} from './case-validation'

export {
  canTransition,
  getValidTransitions,
  canSubmitForReview,
  submitForReview,
  approveCaseForReview,
  rejectCase,
  publishCase,
  archiveCase,
  getWorkflowStatus,
  type WorkflowResult,
  type ApprovalDecision,
} from './approval-workflow'

export {
  exportToJSON,
  exportToHTML,
  exportToMarkdown,
  exportToPDF,
  recordDownload,
  type ExportResult,
  type BatchExportResult,
} from './case-export'
