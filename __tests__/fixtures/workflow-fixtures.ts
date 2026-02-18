import { mockClinicalCase, mockValidatedCase, mockApprovedCase } from './case-fixtures'

/**
 * Mock approval workflow data for testing
 * Provides fixtures for workflow state transitions
 */

export const mockWorkflowStates = {
  draft: {
    status: 'DRAFT',
    canSubmitForReview: true,
    canApprove: false,
    canReject: false,
    canPublish: false,
    canArchive: true,
  },
  inReview: {
    status: 'IN_REVIEW',
    canSubmitForReview: false,
    canApprove: true,
    canReject: true,
    canPublish: false,
    canArchive: true,
  },
  approved: {
    status: 'APPROVED',
    canSubmitForReview: false,
    canApprove: false,
    canReject: false,
    canPublish: true,
    canArchive: true,
  },
  published: {
    status: 'PUBLISHED',
    canSubmitForReview: false,
    canApprove: false,
    canReject: false,
    canPublish: false,
    canArchive: true,
  },
  archived: {
    status: 'ARCHIVED',
    canSubmitForReview: true,
    canApprove: false,
    canReject: false,
    canPublish: false,
    canArchive: false,
  },
}

export const mockSubmitForReviewRequest = {
  caseId: mockClinicalCase.id,
  userId: 'user-001',
  comments: 'Ready for review - all validations passed',
}

export const mockSubmitForReviewResponse = {
  success: true,
  message: 'Case submitted for review successfully',
  case: {
    ...mockClinicalCase,
    status: 'IN_REVIEW',
    submittedForReviewAt: new Date(),
    submittedForReviewBy: 'user-001',
  },
}

export const mockApprovalRequest = {
  caseId: mockValidatedCase.id,
  userId: 'reviewer-001',
  comments: 'Well-structured case with appropriate clinical content',
}

export const mockApprovalResponse = {
  success: true,
  message: 'Case approved successfully',
  case: {
    ...mockValidatedCase,
    status: 'APPROVED',
    reviewedBy: 'reviewer-001',
    reviewedAt: new Date(),
  },
}

export const mockRejectionRequest = {
  caseId: mockValidatedCase.id,
  userId: 'reviewer-001',
  reason: 'Patient demographics are incomplete and clinical findings need clarification',
  suggestions: [
    'Add complete patient history with comorbidities',
    'Expand physical examination findings',
    'Include more diagnostic test results',
  ],
}

export const mockRejectionResponse = {
  success: true,
  message: 'Case rejected - returned to draft for revisions',
  case: {
    ...mockValidatedCase,
    status: 'DRAFT',
  },
}

export const mockPublicationRequest = {
  caseId: mockApprovedCase.id,
  userId: 'publisher-001',
}

export const mockPublicationResponse = {
  success: true,
  message: 'Case published successfully',
  case: {
    ...mockApprovedCase,
    status: 'PUBLISHED',
    publishedAt: new Date(),
    publishedBy: 'publisher-001',
  },
}

export const mockArchiveRequest = {
  caseId: mockValidatedCase.id,
  userId: 'admin-001',
  reason: 'Outdated clinical guidelines',
}

export const mockArchiveResponse = {
  success: true,
  message: 'Case archived successfully',
  case: {
    ...mockValidatedCase,
    status: 'ARCHIVED',
    archivedAt: new Date(),
    archivedBy: 'admin-001',
  },
}

export const mockWorkflowErrors = {
  invalidStatus: {
    code: 'INVALID_STATUS',
    message: 'Invalid status transition requested',
  },
  validationScoreTooLow: {
    code: 'VALIDATION_SCORE_LOW',
    message: 'Validation score must be at least 85 to submit for review',
  },
  caseNotFound: {
    code: 'CASE_NOT_FOUND',
    message: 'Case not found',
  },
  unauthorized: {
    code: 'UNAUTHORIZED',
    message: 'User does not have permission for this action',
  },
  commentRequired: {
    code: 'COMMENT_REQUIRED',
    message: 'Comment is required for approval',
  },
}

export const mockQueueItem = {
  caseId: mockValidatedCase.id,
  title: mockValidatedCase.title,
  submittedAt: mockValidatedCase.submittedForReviewAt,
  submittedBy: mockValidatedCase.submittedForReviewBy,
  complexity: mockValidatedCase.complexity,
  validationScore: mockValidatedCase.validationScore,
  priority: 1,
  position: 1,
  hoursInQueue: 24,
}

export const mockApprovalQueue = [
  mockQueueItem,
  {
    ...mockQueueItem,
    caseId: 'case-002',
    title: 'Diabetes Tipo 2 - Manejo',
    complexity: 'BASIC',
    validationScore: 78,
    priority: 2,
    position: 2,
    hoursInQueue: 18,
  },
  {
    ...mockQueueItem,
    caseId: 'case-003',
    title: 'Insuficiencia Cardíaca Avanzada',
    complexity: 'ADVANCED',
    validationScore: 92,
    priority: 0,
    position: 3,
    hoursInQueue: 12,
  },
]

export const mockStatusTransitions = {
  validTransitions: {
    DRAFT: ['IN_REVIEW', 'ARCHIVED'],
    IN_REVIEW: ['APPROVED', 'DRAFT', 'ARCHIVED'],
    APPROVED: ['PUBLISHED', 'DRAFT', 'ARCHIVED'],
    PUBLISHED: ['ARCHIVED'],
    ARCHIVED: ['DRAFT'],
  },
  invalidTransitions: [
    { from: 'DRAFT', to: 'APPROVED', reason: 'Must go through IN_REVIEW first' },
    { from: 'DRAFT', to: 'PUBLISHED', reason: 'Must go through APPROVED first' },
    { from: 'IN_REVIEW', to: 'PUBLISHED', reason: 'Must go through APPROVED first' },
    { from: 'PUBLISHED', to: 'IN_REVIEW', reason: 'Published cases cannot be returned to review' },
  ],
}
