/**
 * Validation schemas for case validation operations
 * Using Zod for runtime schema validation
 */

import { z } from 'zod'

/**
 * Validate single case request
 * POST /api/projects/:id/cases/:caseId/validate
 */
export const validateCaseRequestSchema = z.object({
  includeDetailedReport: z.boolean().optional().default(false),
  throwOnInvalid: z.boolean().optional().default(false),
})

export type ValidateCaseRequest = z.infer<typeof validateCaseRequestSchema>

/**
 * Batch validate cases request
 * POST /api/projects/:id/cases/validate-batch
 */
export const validateBatchRequestSchema = z.object({
  caseIds: z
    .array(z.string().cuid('ID de caso inválido'))
    .min(1, 'Al menos un caso debe ser seleccionado')
    .max(50, 'No puedes validar más de 50 casos a la vez'),
  includeDetailedReport: z.boolean().optional().default(true),
})

export type ValidateBatchRequest = z.infer<typeof validateBatchRequestSchema>

/**
 * Approval request with comments
 * POST /api/projects/:id/cases/:caseId/submit-review
 */
export const submitReviewRequestSchema = z.object({
  comments: z
    .string()
    .min(10, 'Los comentarios deben tener al menos 10 caracteres')
    .max(1000, 'Los comentarios no pueden exceder 1000 caracteres')
    .optional(),
})

export type SubmitReviewRequest = z.infer<typeof submitReviewRequestSchema>

/**
 * Case approval request
 * POST /api/projects/:id/cases/:caseId/approve
 */
export const approvalRequestSchema = z.object({
  comments: z
    .string()
    .min(0, '')
    .max(1000, 'Los comentarios no pueden exceder 1000 caracteres')
    .optional(),
  requiresChanges: z.boolean().optional().default(false),
})

export type ApprovalRequest = z.infer<typeof approvalRequestSchema>

/**
 * Case rejection request
 * POST /api/projects/:id/cases/:caseId/reject
 */
export const rejectionRequestSchema = z.object({
  reason: z
    .string()
    .min(20, 'Debes proporcionar una razón clara (mínimo 20 caracteres)')
    .max(500, 'La razón no puede exceder 500 caracteres'),
  suggestions: z
    .array(z.string())
    .max(5, 'Máximo 5 sugerencias')
    .optional(),
  returnToDraft: z.boolean().optional().default(true),
})

export type RejectionRequest = z.infer<typeof rejectionRequestSchema>

/**
 * Export request schema
 * GET /api/projects/:id/cases/:caseId/export?format=...
 * POST /api/projects/:id/cases/export-batch
 */
export const exportRequestSchema = z.object({
  format: z.enum(['json', 'html', 'md', 'markdown', 'pdf'], {
    errorMap: () => ({
      message:
        'Formato de exportación debe ser: json, html, markdown, o pdf',
    }),
  }),
  includeMetadata: z.boolean().optional().default(true),
  includeValidationReport: z.boolean().optional().default(false),
})

export type ExportRequest = z.infer<typeof exportRequestSchema>

/**
 * Batch export request
 * POST /api/projects/:id/cases/export-batch
 */
export const batchExportRequestSchema = z.object({
  caseIds: z
    .array(z.string().cuid('ID de caso inválido'))
    .min(1, 'Al menos un caso debe ser seleccionado')
    .max(100, 'No puedes exportar más de 100 casos a la vez'),
  format: z.enum(['json', 'html', 'md', 'markdown', 'zip'], {
    errorMap: () => ({
      message:
        'Formato de exportación batch debe ser: json, html, markdown, o zip',
    }),
  }),
  includeMetadata: z.boolean().optional().default(true),
  includeValidationReport: z.boolean().optional().default(false),
})

export type BatchExportRequest = z.infer<typeof batchExportRequestSchema>

/**
 * Publication request (after approval)
 * POST /api/projects/:id/cases/:caseId/publish
 */
export const publishRequestSchema = z.object({
  publishedDescription: z
    .string()
    .max(500, 'Descripción de publicación no puede exceder 500 caracteres')
    .optional(),
  notifyStudents: z.boolean().optional().default(false),
})

export type PublishRequest = z.infer<typeof publishRequestSchema>

/**
 * Comment on case request
 * POST /api/projects/:id/cases/:caseId/comments
 */
export const caseCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'El comentario no puede estar vacío')
    .max(2000, 'El comentario no puede exceder 2000 caracteres'),
  isReview: z.boolean().optional().default(false),
})

export type CaseCommentRequest = z.infer<typeof caseCommentSchema>

/**
 * Validation response schema (for validation report display)
 * Returned from validation endpoints
 */
export const validationReportSchema = z.object({
  isValid: z.boolean(),
  score: z.number().min(0).max(100),
  completeness: z.number().min(0).max(100),
  quality: z.number().min(0).max(100),
  accuracy: z.number().min(0).max(100),
  issues: z
    .array(
      z.object({
        severity: z.enum(['error', 'warning', 'info']),
        field: z.string(),
        message: z.string(),
        suggestion: z.string().optional(),
      })
    )
    .optional(),
  warnings: z.array(z.object({
    field: z.string(),
    message: z.string(),
    suggestion: z.string().optional(),
  })).optional(),
  suggestions: z.array(z.object({
    field: z.string(),
    message: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
  })).optional(),
  timestamp: z.date().optional(),
})

export type ValidationReportResponse = z.infer<
  typeof validationReportSchema
>

/**
 * Helper to validate query parameters for list endpoints
 */
export const listValidationQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(5).max(100).optional().default(10),
  status: z
    .enum([
      'DRAFT',
      'IN_REVIEW',
      'APPROVED',
      'PUBLISHED',
      'ARCHIVED',
    ])
    .optional(),
  score: z.enum(['all', 'valid', 'invalid']).optional().default('all'),
})

export type ListValidationQuery = z.infer<
  typeof listValidationQuerySchema
>

/**
 * Validation score badge thresholds for UI
 */
export const VALIDATION_SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  ACCEPTABLE: 60,
  NEEDS_WORK: 45,
  POOR: 0,
}

/**
 * Get validation score badge label
 */
export function getValidationScoreBadge(score: number): {
  label: string
  color: 'success' | 'warning' | 'error' | 'info'
} {
  if (score >= VALIDATION_SCORE_THRESHOLDS.EXCELLENT) {
    return { label: 'Excelente', color: 'success' }
  }
  if (score >= VALIDATION_SCORE_THRESHOLDS.GOOD) {
    return { label: 'Bueno', color: 'success' }
  }
  if (score >= VALIDATION_SCORE_THRESHOLDS.ACCEPTABLE) {
    return { label: 'Aceptable', color: 'warning' }
  }
  if (score >= VALIDATION_SCORE_THRESHOLDS.NEEDS_WORK) {
    return { label: 'Necesita mejoras', color: 'warning' }
  }
  return { label: 'Insuficiente', color: 'error' }
}
