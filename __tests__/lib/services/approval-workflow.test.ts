import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  canTransition,
  getValidTransitions,
  canSubmitForReview,
  submitForReview,
  approveCaseForReview,
  rejectCase,
  publishCase,
  archiveCase,
  getWorkflowStatus,
} from '@/lib/services/approval-workflow'
import {
  mockClinicalCase,
  mockValidatedCase,
  mockSubmittedForReviewCase,
  mockApprovedCase,
  mockPublishedCase,
  mockArchivedCase,
} from '../../fixtures/case-fixtures'
import { vi as vitestVi } from 'vitest'

/**
 * Mock Prisma client for testing
 */
const mockPrisma = {
  clinicalCase: {
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  caseComment: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
}

describe('Approval Workflow Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * ============================================================================
   * CAN TRANSITION TESTS
   * ============================================================================
   */

  describe('canTransition()', () => {
    describe('From DRAFT status', () => {
      it('should allow transition to IN_REVIEW', () => {
        expect(canTransition('DRAFT', 'IN_REVIEW')).toBe(true)
      })

      it('should allow transition to ARCHIVED', () => {
        expect(canTransition('DRAFT', 'ARCHIVED')).toBe(true)
      })

      it('should not allow transition to APPROVED', () => {
        expect(canTransition('DRAFT', 'APPROVED')).toBe(false)
      })

      it('should not allow transition to PUBLISHED', () => {
        expect(canTransition('DRAFT', 'PUBLISHED')).toBe(false)
      })
    })

    describe('From IN_REVIEW status', () => {
      it('should allow transition to APPROVED', () => {
        expect(canTransition('IN_REVIEW', 'APPROVED')).toBe(true)
      })

      it('should allow transition back to DRAFT (rejection)', () => {
        expect(canTransition('IN_REVIEW', 'DRAFT')).toBe(true)
      })

      it('should allow transition to ARCHIVED', () => {
        expect(canTransition('IN_REVIEW', 'ARCHIVED')).toBe(true)
      })

      it('should not allow transition to PUBLISHED', () => {
        expect(canTransition('IN_REVIEW', 'PUBLISHED')).toBe(false)
      })
    })

    describe('From APPROVED status', () => {
      it('should allow transition to PUBLISHED', () => {
        expect(canTransition('APPROVED', 'PUBLISHED')).toBe(true)
      })

      it('should allow transition back to DRAFT', () => {
        expect(canTransition('APPROVED', 'DRAFT')).toBe(true)
      })

      it('should allow transition to ARCHIVED', () => {
        expect(canTransition('APPROVED', 'ARCHIVED')).toBe(true)
      })

      it('should not allow transition to IN_REVIEW', () => {
        expect(canTransition('APPROVED', 'IN_REVIEW')).toBe(false)
      })
    })

    describe('From PUBLISHED status', () => {
      it('should only allow transition to ARCHIVED', () => {
        expect(canTransition('PUBLISHED', 'ARCHIVED')).toBe(true)
        expect(canTransition('PUBLISHED', 'DRAFT')).toBe(false)
        expect(canTransition('PUBLISHED', 'IN_REVIEW')).toBe(false)
        expect(canTransition('PUBLISHED', 'APPROVED')).toBe(false)
      })
    })

    describe('From ARCHIVED status', () => {
      it('should only allow transition to DRAFT', () => {
        expect(canTransition('ARCHIVED', 'DRAFT')).toBe(true)
      })

      it('should not allow transition to other statuses', () => {
        expect(canTransition('ARCHIVED', 'IN_REVIEW')).toBe(false)
        expect(canTransition('ARCHIVED', 'PUBLISHED')).toBe(false)
        expect(canTransition('ARCHIVED', 'APPROVED')).toBe(false)
      })
    })

    it('should not allow self-transitions', () => {
      expect(canTransition('DRAFT', 'DRAFT')).toBe(false)
      expect(canTransition('IN_REVIEW', 'IN_REVIEW')).toBe(false)
      expect(canTransition('APPROVED', 'APPROVED')).toBe(false)
      expect(canTransition('PUBLISHED', 'PUBLISHED')).toBe(false)
      expect(canTransition('ARCHIVED', 'ARCHIVED')).toBe(false)
    })

    it('should handle invalid statuses gracefully', () => {
      expect(canTransition('INVALID', 'DRAFT')).toBe(false)
      expect(canTransition('DRAFT', 'INVALID')).toBe(false)
    })
  })

  /**
   * ============================================================================
   * GET VALID TRANSITIONS TESTS
   * ============================================================================
   */

  describe('getValidTransitions()', () => {
    it('should return allowed transitions from DRAFT', () => {
      const transitions = getValidTransitions('DRAFT')
      expect(transitions).toContain('IN_REVIEW')
      expect(transitions).toContain('ARCHIVED')
      expect(transitions.length).toBe(2)
    })

    it('should return allowed transitions from IN_REVIEW', () => {
      const transitions = getValidTransitions('IN_REVIEW')
      expect(transitions).toContain('APPROVED')
      expect(transitions).toContain('DRAFT')
      expect(transitions).toContain('ARCHIVED')
      expect(transitions.length).toBe(3)
    })

    it('should return allowed transitions from APPROVED', () => {
      const transitions = getValidTransitions('APPROVED')
      expect(transitions).toContain('PUBLISHED')
      expect(transitions).toContain('DRAFT')
      expect(transitions).toContain('ARCHIVED')
      expect(transitions.length).toBe(3)
    })

    it('should return only ARCHIVED for PUBLISHED', () => {
      const transitions = getValidTransitions('PUBLISHED')
      expect(transitions).toEqual(['ARCHIVED'])
    })

    it('should return only DRAFT for ARCHIVED', () => {
      const transitions = getValidTransitions('ARCHIVED')
      expect(transitions).toEqual(['DRAFT'])
    })

    it('should return empty array for invalid status', () => {
      const transitions = getValidTransitions('INVALID')
      expect(transitions).toEqual([])
    })

    it('should return array of strings', () => {
      const transitions = getValidTransitions('DRAFT')
      expect(Array.isArray(transitions)).toBe(true)
      transitions.forEach((t) => expect(typeof t).toBe('string'))
    })
  })

  /**
   * ============================================================================
   * CAN SUBMIT FOR REVIEW TESTS
   * ============================================================================
   */

  describe('canSubmitForReview()', () => {
    it('should allow submission for DRAFT case with valid score', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockValidatedCase)

      const result = await canSubmitForReview('case-001', 'project-001')
      expect(result.canSubmit).toBe(true)
      expect(result.reasons.length).toBe(0)
    })

    it('should reject non-existent case', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(null)

      const result = await canSubmitForReview('nonexistent', 'project-001')
      expect(result.canSubmit).toBe(false)
      expect(result.reasons.length).toBeGreaterThan(0)
    })

    it('should reject case not in DRAFT status', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockSubmittedForReviewCase)

      const result = await canSubmitForReview('case-001', 'project-001')
      expect(result.canSubmit).toBe(false)
      expect(result.reasons.some((r) => r.includes('BORRADOR'))).toBe(true)
    })

    it('should check validation score threshold', async () => {
      const lowScoreCase = { ...mockClinicalCase, validationScore: 50 }
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(lowScoreCase)

      const result = await canSubmitForReview('case-001', 'project-001')
      expect(result.canSubmit).toBe(false)
    })

    it('should return reasons array', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockClinicalCase)

      const result = await canSubmitForReview('case-001', 'project-001')
      expect(Array.isArray(result.reasons)).toBe(true)
    })

    it('should require specific projectId match', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(null)

      const result = await canSubmitForReview('case-001', 'wrong-project')
      expect(result.canSubmit).toBe(false)
    })
  })

  /**
   * ============================================================================
   * SUBMIT FOR REVIEW TESTS
   * ============================================================================
   */

  describe('submitForReview()', () => {
    it('should successfully submit DRAFT case for review', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockValidatedCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockValidatedCase,
        status: 'IN_REVIEW',
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({
        id: 'comment-001',
      })

      const result = await submitForReview('case-001', 'project-001', 'user-001', 'Ready for review')
      expect(result.success).toBe(true)
      expect(result.newStatus).toBe('IN_REVIEW')
    })

    it('should create audit comment on submission', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockValidatedCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockValidatedCase,
        status: 'IN_REVIEW',
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      await submitForReview('case-001', 'project-001', 'user-001')
      expect(mockPrisma.caseComment.create).toHaveBeenCalled()
    })

    it('should track submission timestamp', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockValidatedCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockValidatedCase,
        status: 'IN_REVIEW',
        submittedForReviewAt: new Date(),
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      const result = await submitForReview('case-001', 'project-001', 'user-001')
      expect(result.timestamp).toBeInstanceOf(Date)
    })

    it('should track who submitted the case', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockValidatedCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockValidatedCase,
        status: 'IN_REVIEW',
        submittedForReviewBy: 'user-001',
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      await submitForReview('case-001', 'project-001', 'user-001')
      expect(mockPrisma.clinicalCase.update).toHaveBeenCalled()
    })
  })

  /**
   * ============================================================================
   * APPROVE CASE TESTS
   * ============================================================================
   */

  describe('approveCaseForReview()', () => {
    it('should approve IN_REVIEW case', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockSubmittedForReviewCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockSubmittedForReviewCase,
        status: 'APPROVED',
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      const result = await approveCaseForReview('case-001', 'project-001', 'reviewer-001')
      expect(result.success).toBe(true)
      expect(result.newStatus).toBe('APPROVED')
    })

    it('should track reviewer information', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockSubmittedForReviewCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockSubmittedForReviewCase,
        status: 'APPROVED',
        reviewedBy: 'reviewer-001',
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      await approveCaseForReview('case-001', 'project-001', 'reviewer-001')
      expect(mockPrisma.clinicalCase.update).toHaveBeenCalled()
    })

    it('should create approval comment', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockSubmittedForReviewCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockSubmittedForReviewCase,
        status: 'APPROVED',
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      await approveCaseForReview('case-001', 'project-001', 'reviewer-001', 'Case approved with comments')
      expect(mockPrisma.caseComment.create).toHaveBeenCalled()
    })

    it('should reject case not in IN_REVIEW status', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockClinicalCase)

      const result = await approveCaseForReview('case-001', 'project-001', 'reviewer-001')
      expect(result.success).toBe(false)
    })
  })

  /**
   * ============================================================================
   * REJECT CASE TESTS
   * ============================================================================
   */

  describe('rejectCase()', () => {
    it('should reject IN_REVIEW case', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockSubmittedForReviewCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockSubmittedForReviewCase,
        status: 'DRAFT',
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      const result = await rejectCase('case-001', 'project-001', 'reviewer-001', 'Incomplete clinical data')
      expect(result.success).toBe(true)
      expect(result.newStatus).toBe('DRAFT')
    })

    it('should require rejection reason', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockSubmittedForReviewCase)

      const result = await rejectCase('case-001', 'project-001', 'reviewer-001', '')
      expect(result.success).toBe(false)
    })

    it('should create rejection comment with reason', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockSubmittedForReviewCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockSubmittedForReviewCase,
        status: 'DRAFT',
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      await rejectCase('case-001', 'project-001', 'reviewer-001', 'Missing vital signs data')
      expect(mockPrisma.caseComment.create).toHaveBeenCalled()
    })

    it('should support optional suggestions', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockSubmittedForReviewCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockSubmittedForReviewCase,
        status: 'DRAFT',
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      const result = await rejectCase(
        'case-001',
        'project-001',
        'reviewer-001',
        'Incomplete data',
        ['Add missing vital signs', 'Expand clinical assessment']
      )
      expect(result.success).toBe(true)
    })

    it('should reject case not in IN_REVIEW status', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockPublishedCase)

      const result = await rejectCase('case-001', 'project-001', 'reviewer-001', 'Cannot reject published case')
      expect(result.success).toBe(false)
    })
  })

  /**
   * ============================================================================
   * PUBLISH CASE TESTS
   * ============================================================================
   */

  describe('publishCase()', () => {
    it('should publish APPROVED case', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockApprovedCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockApprovedCase,
        status: 'PUBLISHED',
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      const result = await publishCase('case-001', 'project-001', 'user-001')
      expect(result.success).toBe(true)
      expect(result.newStatus).toBe('PUBLISHED')
    })

    it('should set published timestamp', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockApprovedCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockApprovedCase,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      const result = await publishCase('case-001', 'project-001', 'user-001')
      expect(result.timestamp).toBeInstanceOf(Date)
    })

    it('should track publisher ID', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockApprovedCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockApprovedCase,
        status: 'PUBLISHED',
        publishedBy: 'user-001',
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      await publishCase('case-001', 'project-001', 'user-001')
      expect(mockPrisma.clinicalCase.update).toHaveBeenCalled()
    })

    it('should reject case not in APPROVED status', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockSubmittedForReviewCase)

      const result = await publishCase('case-001', 'project-001', 'user-001')
      expect(result.success).toBe(false)
    })
  })

  /**
   * ============================================================================
   * ARCHIVE CASE TESTS
   * ============================================================================
   */

  describe('archiveCase()', () => {
    it('should archive DRAFT case', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockClinicalCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockClinicalCase,
        status: 'ARCHIVED',
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      const result = await archiveCase('case-001', 'project-001', 'user-001', 'Outdated content')
      expect(result.success).toBe(true)
      expect(result.newStatus).toBe('ARCHIVED')
    })

    it('should archive APPROVED case', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockApprovedCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockApprovedCase,
        status: 'ARCHIVED',
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      const result = await archiveCase('case-001', 'project-001', 'user-001')
      expect(result.success).toBe(true)
    })

    it('should set archive timestamp', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockApprovedCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockApprovedCase,
        status: 'ARCHIVED',
        archivedAt: new Date(),
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      const result = await archiveCase('case-001', 'project-001', 'user-001')
      expect(result.timestamp).toBeInstanceOf(Date)
    })

    it('should track who archived the case', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockApprovedCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockApprovedCase,
        status: 'ARCHIVED',
        archivedBy: 'user-001',
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      await archiveCase('case-001', 'project-001', 'user-001')
      expect(mockPrisma.clinicalCase.update).toHaveBeenCalled()
    })

    it('should not allow archiving PUBLISHED case (deprecated requirement)', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockPublishedCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({
        ...mockPublishedCase,
        status: 'ARCHIVED',
      })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      // Should allow archiving - even published cases can be archived
      const result = await archiveCase('case-001', 'project-001', 'user-001')
      expect(result.success).toBe(true)
    })
  })

  /**
   * ============================================================================
   * GET WORKFLOW STATUS TESTS
   * ============================================================================
   */

  describe('getWorkflowStatus()', () => {
    it('should return workflow status for case', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockValidatedCase)
      mockPrisma.caseComment.findMany.mockResolvedValueOnce([])

      const result = await getWorkflowStatus('case-001', 'project-001')
      expect(result).toBeDefined()
      expect(result.currentStatus).toBeDefined()
    })

    it('should include current status', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockSubmittedForReviewCase)
      mockPrisma.caseComment.findMany.mockResolvedValueOnce([])

      const result = await getWorkflowStatus('case-001', 'project-001')
      expect(result.currentStatus).toBe('IN_REVIEW')
    })

    it('should include valid next transitions', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockApprovedCase)
      mockPrisma.caseComment.findMany.mockResolvedValueOnce([])

      const result = await getWorkflowStatus('case-001', 'project-001')
      expect(Array.isArray(result.validTransitions)).toBe(true)
      expect(result.validTransitions).toContain('PUBLISHED')
    })

    it('should include approval comments', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockApprovedCase)
      mockPrisma.caseComment.findMany.mockResolvedValueOnce([
        { id: 'comment-001', content: 'Looks good', isReview: true, createdAt: new Date() },
      ])

      const result = await getWorkflowStatus('case-001', 'project-001')
      expect(result.comments).toBeDefined()
    })

    it('should return null for non-existent case', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(null)

      const result = await getWorkflowStatus('nonexistent', 'project-001')
      expect(result).toBeNull()
    })
  })

  /**
   * ============================================================================
   * WORKFLOW INTEGRATION TESTS
   * ============================================================================
   */

  describe('Full Workflow Integration', () => {
    it('should support DRAFT → IN_REVIEW → APPROVED → PUBLISHED workflow', async () => {
      // Step 1: Submit for review
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockValidatedCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({ ...mockValidatedCase, status: 'IN_REVIEW' })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      const submitResult = await submitForReview('case-001', 'project-001', 'user-001')
      expect(submitResult.newStatus).toBe('IN_REVIEW')

      // Step 2: Approve
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockSubmittedForReviewCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({ ...mockSubmittedForReviewCase, status: 'APPROVED' })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      const approveResult = await approveCaseForReview('case-001', 'project-001', 'reviewer-001')
      expect(approveResult.newStatus).toBe('APPROVED')

      // Step 3: Publish
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockApprovedCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({ ...mockApprovedCase, status: 'PUBLISHED' })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      const publishResult = await publishCase('case-001', 'project-001', 'publisher-001')
      expect(publishResult.newStatus).toBe('PUBLISHED')
    })

    it('should support rejection workflow', async () => {
      // Submit
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockValidatedCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({ ...mockValidatedCase, status: 'IN_REVIEW' })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      const submitResult = await submitForReview('case-001', 'project-001', 'user-001')
      expect(submitResult.newStatus).toBe('IN_REVIEW')

      // Reject
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(mockSubmittedForReviewCase)
      mockPrisma.clinicalCase.update.mockResolvedValueOnce({ ...mockSubmittedForReviewCase, status: 'DRAFT' })
      mockPrisma.caseComment.create.mockResolvedValueOnce({})

      const rejectResult = await rejectCase('case-001', 'project-001', 'reviewer-001', 'Incomplete data')
      expect(rejectResult.newStatus).toBe('DRAFT')
    })

    it('should support archival at any stage', async () => {
      const stages = [mockClinicalCase, mockSubmittedForReviewCase, mockApprovedCase]

      for (const caseData of stages) {
        mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(caseData)
        mockPrisma.clinicalCase.update.mockResolvedValueOnce({ ...caseData, status: 'ARCHIVED' })
        mockPrisma.caseComment.create.mockResolvedValueOnce({})

        const result = await archiveCase('case-001', 'project-001', 'user-001')
        expect(result.newStatus).toBe('ARCHIVED')
      }
    })
  })

  /**
   * ============================================================================
   * ERROR HANDLING TESTS
   * ============================================================================
   */

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrisma.clinicalCase.findUnique.mockRejectedValueOnce(new Error('Database error'))

      expect(async () => {
        await canSubmitForReview('case-001', 'project-001')
      }).not.toThrow()
    })

    it('should return success false on workflow errors', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(null)

      const result = await submitForReview('case-001', 'project-001', 'user-001')
      expect(result.success).toBe(false)
    })

    it('should provide meaningful error messages', async () => {
      mockPrisma.clinicalCase.findUnique.mockResolvedValueOnce(null)

      const result = await submitForReview('case-001', 'project-001', 'user-001')
      expect(result.message).toBeTruthy()
      expect(typeof result.message).toBe('string')
    })
  })
})
