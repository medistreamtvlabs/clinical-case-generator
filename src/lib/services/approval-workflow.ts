/**
 * Clinical Case Approval Workflow Service
 * Manages the approval process: DRAFT → IN_REVIEW → APPROVED → PUBLISHED
 *
 * Features:
 * - Status transition validation
 * - Approval prerequisites checking
 * - Review comments tracking
 * - Audit trail (reviewer, timestamp, action)
 */

import prisma from '@/lib/db/prisma'
import type { ClinicalCase } from '@/types/case'
import { meetsComplexityThreshold, getValidationThresholds } from './case-validation'

/**
 * Workflow result structure
 */
export interface WorkflowResult {
  success: boolean
  previousStatus: string
  newStatus: string
  message: string
  caseId: string
  timestamp: Date
}

/**
 * Approval decision result
 */
export interface ApprovalDecision {
  caseId: string
  reviewerId: string
  decision: 'approved' | 'rejected' | 'needs_revision'
  comments?: string
  timestamp: Date
}

/**
 * Valid status transitions
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['IN_REVIEW', 'ARCHIVED'],
  IN_REVIEW: ['APPROVED', 'DRAFT', 'ARCHIVED'],
  APPROVED: ['PUBLISHED', 'DRAFT', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED'],
  ARCHIVED: ['DRAFT'],
}

/**
 * Check if a status transition is valid
 */
export function canTransition(
  currentStatus: string,
  targetStatus: string
): boolean {
  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || []
  return allowedTransitions.includes(targetStatus)
}

/**
 * Get all possible next statuses from current status
 */
export function getValidTransitions(currentStatus: string): string[] {
  return VALID_TRANSITIONS[currentStatus] || []
}

/**
 * Check if a case can be submitted for review
 * Prerequisites:
 * - Must be in DRAFT status
 * - Must have valid basic content
 * - Must meet minimum validation score
 */
export async function canSubmitForReview(
  caseId: string,
  projectId: string
): Promise<{
  canSubmit: boolean
  reasons: string[]
}> {
  const reasons: string[] = []

  const clinicalCase = await prisma.clinicalCase.findUnique({
    where: {
      id: caseId,
      projectId,
    },
  })

  if (!clinicalCase) {
    return {
      canSubmit: false,
      reasons: ['Caso no encontrado'],
    }
  }

  // Check status
  if (clinicalCase.status !== 'DRAFT') {
    reasons.push(`Caso debe estar en estado BORRADOR, actualmente: ${clinicalCase.status}`)
  }

  // Check if has content
  if (!clinicalCase.content || Object.keys(clinicalCase.content).length === 0) {
    reasons.push('Caso debe tener contenido definido')
  }

  // Check if has title and indication
  if (!clinicalCase.title || clinicalCase.title.trim().length === 0) {
    reasons.push('Caso debe tener un título')
  }

  if (!clinicalCase.indication || clinicalCase.indication.trim().length === 0) {
    reasons.push('Caso debe tener una indicación clínica')
  }

  // Check if has been validated
  if (!clinicalCase.validated) {
    reasons.push('Caso debe ser validado antes de enviar para revisión')
  }

  // Check minimum validation score for complexity
  const minScore = getValidationThresholds()[
    (clinicalCase.complexity || 'BASIC') as keyof ReturnType<typeof getValidationThresholds>
  ] || 60

  if ((clinicalCase.validationScore || 0) < minScore) {
    reasons.push(
      `Puntuación de validación insuficiente: ${clinicalCase.validationScore || 0}/${minScore}`
    )
  }

  return {
    canSubmit: reasons.length === 0,
    reasons,
  }
}

/**
 * Submit case for review
 * Transitions: DRAFT → IN_REVIEW
 */
export async function submitForReview(
  caseId: string,
  projectId: string,
  submittedBy: string,
  comments?: string
): Promise<WorkflowResult> {
  // Check prerequisites
  const canSubmit = await canSubmitForReview(caseId, projectId)
  if (!canSubmit.canSubmit) {
    throw new Error(`No se puede enviar para revisión: ${canSubmit.reasons.join(', ')}`)
  }

  // Check if transition is valid
  const clinicalCase = await prisma.clinicalCase.findUnique({
    where: { id: caseId, projectId },
  })

  if (!clinicalCase) {
    throw new Error('Caso no encontrado')
  }

  if (!canTransition(clinicalCase.status, 'IN_REVIEW')) {
    throw new Error(
      `No se puede pasar de ${clinicalCase.status} a IN_REVIEW`
    )
  }

  // Update case status
  const updated = await prisma.clinicalCase.update({
    where: { id: caseId },
    data: {
      status: 'IN_REVIEW',
      submittedForReviewAt: new Date(),
      submittedForReviewBy: submittedBy,
    },
  })

  // Store review comment if provided
  if (comments) {
    await prisma.caseComment.create({
      data: {
        caseId,
        content: comments,
        author: submittedBy,
        isReview: true,
        createdAt: new Date(),
      },
    })
  }

  return {
    success: true,
    previousStatus: clinicalCase.status,
    newStatus: 'IN_REVIEW',
    message: 'Caso enviado para revisión exitosamente',
    caseId,
    timestamp: new Date(),
  }
}

/**
 * Approve a case
 * Transitions: IN_REVIEW → APPROVED
 * Prerequisites:
 * - Must be in IN_REVIEW status
 * - Reviewer must have permission
 */
export async function approveCaseForReview(
  caseId: string,
  projectId: string,
  reviewerId: string,
  comments?: string
): Promise<WorkflowResult> {
  const clinicalCase = await prisma.clinicalCase.findUnique({
    where: { id: caseId, projectId },
  })

  if (!clinicalCase) {
    throw new Error('Caso no encontrado')
  }

  if (!canTransition(clinicalCase.status, 'APPROVED')) {
    throw new Error(
      `No se puede aprobar un caso en estado ${clinicalCase.status}`
    )
  }

  // Update case status
  const updated = await prisma.clinicalCase.update({
    where: { id: caseId },
    data: {
      status: 'APPROVED',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    },
  })

  // Store review comment if provided
  if (comments) {
    await prisma.caseComment.create({
      data: {
        caseId,
        content: `✓ APROBADO: ${comments}`,
        author: reviewerId,
        isReview: true,
        createdAt: new Date(),
      },
    })
  }

  return {
    success: true,
    previousStatus: clinicalCase.status,
    newStatus: 'APPROVED',
    message: 'Caso aprobado exitosamente',
    caseId,
    timestamp: new Date(),
  }
}

/**
 * Reject a case
 * Transitions: IN_REVIEW → DRAFT
 */
export async function rejectCase(
  caseId: string,
  projectId: string,
  reviewerId: string,
  reason: string,
  suggestions?: string[],
  returnToDraft: boolean = true
): Promise<WorkflowResult> {
  const clinicalCase = await prisma.clinicalCase.findUnique({
    where: { id: caseId, projectId },
  })

  if (!clinicalCase) {
    throw new Error('Caso no encontrado')
  }

  if (clinicalCase.status !== 'IN_REVIEW') {
    throw new Error(
      `Solo se pueden rechazar casos en revisión. Estado actual: ${clinicalCase.status}`
    )
  }

  const newStatus = returnToDraft ? 'DRAFT' : clinicalCase.status

  // Update case status
  const updated = await prisma.clinicalCase.update({
    where: { id: caseId },
    data: {
      status: newStatus,
    },
  })

  // Store rejection comment
  const commentContent = [
    `✗ RECHAZADO: ${reason}`,
    ...(suggestions && suggestions.length > 0
      ? ['Sugerencias:', ...suggestions.map((s) => `• ${s}`)]
      : []),
  ].join('\n')

  await prisma.caseComment.create({
    data: {
      caseId,
      content: commentContent,
      author: reviewerId,
      isReview: true,
      createdAt: new Date(),
    },
  })

  return {
    success: true,
    previousStatus: clinicalCase.status,
    newStatus,
    message: `Caso rechazado. ${returnToDraft ? 'Retornado a BORRADOR' : 'Mantiene estado actual'}`,
    caseId,
    timestamp: new Date(),
  }
}

/**
 * Publish a case
 * Transitions: APPROVED → PUBLISHED
 * Prerequisites:
 * - Must be APPROVED
 * - Must have validation score >= publication threshold
 */
export async function publishCase(
  caseId: string,
  projectId: string,
  publishedBy: string,
  publishedDescription?: string
): Promise<WorkflowResult> {
  const clinicalCase = await prisma.clinicalCase.findUnique({
    where: { id: caseId, projectId },
  })

  if (!clinicalCase) {
    throw new Error('Caso no encontrado')
  }

  const thresholds = getValidationThresholds()
  if ((clinicalCase.validationScore || 0) < thresholds.PUBLICATION) {
    throw new Error(
      `Puntuación de validación insuficiente para publicar: ${clinicalCase.validationScore || 0}/${thresholds.PUBLICATION}`
    )
  }

  if (!canTransition(clinicalCase.status, 'PUBLISHED')) {
    throw new Error(
      `No se puede publicar un caso en estado ${clinicalCase.status}. Debe estar APROBADO`
    )
  }

  // Update case status
  const updated = await prisma.clinicalCase.update({
    where: { id: caseId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
      publishedBy: publishedBy,
    },
  })

  // Store publication comment
  if (publishedDescription) {
    await prisma.caseComment.create({
      data: {
        caseId,
        content: `📢 PUBLICADO: ${publishedDescription}`,
        author: publishedBy,
        isReview: true,
        createdAt: new Date(),
      },
    })
  }

  return {
    success: true,
    previousStatus: clinicalCase.status,
    newStatus: 'PUBLISHED',
    message: 'Caso publicado exitosamente',
    caseId,
    timestamp: new Date(),
  }
}

/**
 * Archive a case
 * Can transition from any status to ARCHIVED
 */
export async function archiveCase(
  caseId: string,
  projectId: string,
  archivedBy: string,
  reason?: string
): Promise<WorkflowResult> {
  const clinicalCase = await prisma.clinicalCase.findUnique({
    where: { id: caseId, projectId },
  })

  if (!clinicalCase) {
    throw new Error('Caso no encontrado')
  }

  if (!canTransition(clinicalCase.status, 'ARCHIVED')) {
    throw new Error(
      `No se puede archivar un caso en estado ${clinicalCase.status}`
    )
  }

  // Update case status
  const updated = await prisma.clinicalCase.update({
    where: { id: caseId },
    data: {
      status: 'ARCHIVED',
      archivedAt: new Date(),
      archivedBy: archivedBy,
    },
  })

  // Store archive comment
  if (reason) {
    await prisma.caseComment.create({
      data: {
        caseId,
        content: `🗃️ ARCHIVADO: ${reason}`,
        author: archivedBy,
        isReview: true,
        createdAt: new Date(),
      },
    })
  }

  return {
    success: true,
    previousStatus: clinicalCase.status,
    newStatus: 'ARCHIVED',
    message: 'Caso archivado exitosamente',
    caseId,
    timestamp: new Date(),
  }
}

/**
 * Get workflow status summary for a case
 */
export async function getWorkflowStatus(
  caseId: string,
  projectId: string
): Promise<{
  currentStatus: string
  validNextSteps: string[]
  canSubmitForReview: boolean
  canApprove: boolean
  canPublish: boolean
  reviewStatus: {
    submittedAt?: Date
    submittedBy?: string
    reviewedAt?: Date
    reviewedBy?: string
    publishedAt?: Date
  }
}> {
  const clinicalCase = await prisma.clinicalCase.findUnique({
    where: { id: caseId, projectId },
  })

  if (!clinicalCase) {
    throw new Error('Caso no encontrado')
  }

  const canSubmit = await canSubmitForReview(caseId, projectId)

  return {
    currentStatus: clinicalCase.status,
    validNextSteps: getValidTransitions(clinicalCase.status),
    canSubmitForReview: canSubmit.canSubmit,
    canApprove: clinicalCase.status === 'IN_REVIEW',
    canPublish: clinicalCase.status === 'APPROVED',
    reviewStatus: {
      submittedAt: clinicalCase.submittedForReviewAt || undefined,
      submittedBy: clinicalCase.submittedForReviewBy || undefined,
      reviewedAt: clinicalCase.reviewedAt || undefined,
      reviewedBy: clinicalCase.reviewedBy || undefined,
      publishedAt: clinicalCase.publishedAt || undefined,
    },
  }
}
