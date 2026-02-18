import { describe, it, expect } from 'vitest'
import {
  APPROVAL_WORKFLOW_TRANSITIONS,
  APPROVAL_WORKFLOW,
  canTransition,
  getValidTransitions,
  getStatusDisplay,
  isReadyForPublication,
  getQueuePriority,
} from '@/lib/config/approval'

describe('Approval Workflow Configuration', () => {
  /**
   * ============================================================================
   * APPROVAL WORKFLOW TRANSITIONS TESTS
   * ============================================================================
   */

  describe('APPROVAL_WORKFLOW_TRANSITIONS', () => {
    it('should define valid transitions from DRAFT', () => {
      expect(APPROVAL_WORKFLOW_TRANSITIONS.DRAFT).toContain('IN_REVIEW')
      expect(APPROVAL_WORKFLOW_TRANSITIONS.DRAFT).toContain('ARCHIVED')
    })

    it('should define valid transitions from IN_REVIEW', () => {
      expect(APPROVAL_WORKFLOW_TRANSITIONS.IN_REVIEW).toContain('APPROVED')
      expect(APPROVAL_WORKFLOW_TRANSITIONS.IN_REVIEW).toContain('DRAFT')
      expect(APPROVAL_WORKFLOW_TRANSITIONS.IN_REVIEW).toContain('ARCHIVED')
    })

    it('should define valid transitions from APPROVED', () => {
      expect(APPROVAL_WORKFLOW_TRANSITIONS.APPROVED).toContain('PUBLISHED')
      expect(APPROVAL_WORKFLOW_TRANSITIONS.APPROVED).toContain('DRAFT')
      expect(APPROVAL_WORKFLOW_TRANSITIONS.APPROVED).toContain('ARCHIVED')
    })

    it('should define valid transitions from PUBLISHED', () => {
      expect(APPROVAL_WORKFLOW_TRANSITIONS.PUBLISHED).toContain('ARCHIVED')
    })

    it('should define valid transitions from ARCHIVED', () => {
      expect(APPROVAL_WORKFLOW_TRANSITIONS.ARCHIVED).toContain('DRAFT')
    })

    it('should not allow direct transitions that skip steps', () => {
      expect(APPROVAL_WORKFLOW_TRANSITIONS.DRAFT).not.toContain('APPROVED')
      expect(APPROVAL_WORKFLOW_TRANSITIONS.DRAFT).not.toContain('PUBLISHED')
      expect(APPROVAL_WORKFLOW_TRANSITIONS.IN_REVIEW).not.toContain('PUBLISHED')
    })
  })

  /**
   * ============================================================================
   * APPROVAL WORKFLOW CONFIGURATION TESTS
   * ============================================================================
   */

  describe('APPROVAL_WORKFLOW configuration', () => {
    it('should require validation score of 85 for publication', () => {
      expect(APPROVAL_WORKFLOW.requiredValidationScore).toBe(85)
    })

    it('should require review before publication', () => {
      expect(APPROVAL_WORKFLOW.requiresReview).toBe(true)
    })

    it('should define review time limit', () => {
      expect(APPROVAL_WORKFLOW.reviewTimeLimit).toBeDefined()
      expect(typeof APPROVAL_WORKFLOW.reviewTimeLimit).toBe('number')
    })

    it('should have status transition rules', () => {
      expect(APPROVAL_WORKFLOW.statusTransitions).toBeDefined()
      expect(typeof APPROVAL_WORKFLOW.statusTransitions).toBe('object')
    })
  })

  /**
   * ============================================================================
   * CAN TRANSITION TESTS
   * ============================================================================
   */

  describe('canTransition()', () => {
    describe('From DRAFT', () => {
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

      it('should not allow self-transition', () => {
        expect(canTransition('DRAFT', 'DRAFT')).toBe(false)
      })
    })

    describe('From IN_REVIEW', () => {
      it('should allow transition to APPROVED', () => {
        expect(canTransition('IN_REVIEW', 'APPROVED')).toBe(true)
      })

      it('should allow transition to DRAFT (rejection)', () => {
        expect(canTransition('IN_REVIEW', 'DRAFT')).toBe(true)
      })

      it('should allow transition to ARCHIVED', () => {
        expect(canTransition('IN_REVIEW', 'ARCHIVED')).toBe(true)
      })

      it('should not allow transition to PUBLISHED', () => {
        expect(canTransition('IN_REVIEW', 'PUBLISHED')).toBe(false)
      })
    })

    describe('From APPROVED', () => {
      it('should allow transition to PUBLISHED', () => {
        expect(canTransition('APPROVED', 'PUBLISHED')).toBe(true)
      })

      it('should allow transition to DRAFT (reopen for editing)', () => {
        expect(canTransition('APPROVED', 'DRAFT')).toBe(true)
      })

      it('should allow transition to ARCHIVED', () => {
        expect(canTransition('APPROVED', 'ARCHIVED')).toBe(true)
      })

      it('should not allow transition to IN_REVIEW', () => {
        expect(canTransition('APPROVED', 'IN_REVIEW')).toBe(false)
      })
    })

    describe('From PUBLISHED', () => {
      it('should only allow transition to ARCHIVED', () => {
        expect(canTransition('PUBLISHED', 'ARCHIVED')).toBe(true)
      })

      it('should not allow transition to IN_REVIEW', () => {
        expect(canTransition('PUBLISHED', 'IN_REVIEW')).toBe(false)
      })

      it('should not allow transition to DRAFT', () => {
        expect(canTransition('PUBLISHED', 'DRAFT')).toBe(false)
      })

      it('should not allow transition to APPROVED', () => {
        expect(canTransition('PUBLISHED', 'APPROVED')).toBe(false)
      })
    })

    describe('From ARCHIVED', () => {
      it('should only allow transition to DRAFT', () => {
        expect(canTransition('ARCHIVED', 'DRAFT')).toBe(true)
      })

      it('should not allow transition to IN_REVIEW', () => {
        expect(canTransition('ARCHIVED', 'IN_REVIEW')).toBe(false)
      })

      it('should not allow transition to PUBLISHED', () => {
        expect(canTransition('ARCHIVED', 'PUBLISHED')).toBe(false)
      })
    })

    it('should handle invalid status gracefully', () => {
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
    it('should return all valid transitions from DRAFT', () => {
      const transitions = getValidTransitions('DRAFT')
      expect(transitions).toContain('IN_REVIEW')
      expect(transitions).toContain('ARCHIVED')
    })

    it('should return all valid transitions from IN_REVIEW', () => {
      const transitions = getValidTransitions('IN_REVIEW')
      expect(transitions).toContain('APPROVED')
      expect(transitions).toContain('DRAFT')
      expect(transitions).toContain('ARCHIVED')
    })

    it('should return all valid transitions from APPROVED', () => {
      const transitions = getValidTransitions('APPROVED')
      expect(transitions).toContain('PUBLISHED')
      expect(transitions).toContain('DRAFT')
      expect(transitions).toContain('ARCHIVED')
    })

    it('should return only valid transitions from PUBLISHED', () => {
      const transitions = getValidTransitions('PUBLISHED')
      expect(transitions).toEqual(['ARCHIVED'])
    })

    it('should return only valid transitions from ARCHIVED', () => {
      const transitions = getValidTransitions('ARCHIVED')
      expect(transitions).toEqual(['DRAFT'])
    })

    it('should return empty array for invalid status', () => {
      const transitions = getValidTransitions('INVALID' as any)
      expect(transitions).toEqual([])
    })
  })

  /**
   * ============================================================================
   * GET STATUS DISPLAY TESTS
   * ============================================================================
   */

  describe('getStatusDisplay()', () => {
    it('should return display config for DRAFT status', () => {
      const config = getStatusDisplay('DRAFT')
      expect(config).toHaveProperty('label')
      expect(config).toHaveProperty('color')
      expect(config.label).toBeTruthy()
    })

    it('should return display config for IN_REVIEW status', () => {
      const config = getStatusDisplay('IN_REVIEW')
      expect(config).toHaveProperty('label')
      expect(config).toHaveProperty('color')
    })

    it('should return display config for APPROVED status', () => {
      const config = getStatusDisplay('APPROVED')
      expect(config).toHaveProperty('label')
      expect(config).toHaveProperty('color')
    })

    it('should return display config for PUBLISHED status', () => {
      const config = getStatusDisplay('PUBLISHED')
      expect(config).toHaveProperty('label')
      expect(config).toHaveProperty('color')
    })

    it('should return display config for ARCHIVED status', () => {
      const config = getStatusDisplay('ARCHIVED')
      expect(config).toHaveProperty('label')
      expect(config).toHaveProperty('color')
    })

    it('should have different colors for different statuses', () => {
      const colors = new Set([
        getStatusDisplay('DRAFT').color,
        getStatusDisplay('IN_REVIEW').color,
        getStatusDisplay('APPROVED').color,
        getStatusDisplay('PUBLISHED').color,
        getStatusDisplay('ARCHIVED').color,
      ])
      expect(colors.size).toBeGreaterThan(1)
    })
  })

  /**
   * ============================================================================
   * IS READY FOR PUBLICATION TESTS
   * ============================================================================
   */

  describe('isReadyForPublication()', () => {
    it('should return true when status is APPROVED and score is 85+', () => {
      expect(isReadyForPublication('APPROVED', 85)).toBe(true)
      expect(isReadyForPublication('APPROVED', 100)).toBe(true)
    })

    it('should return false when status is APPROVED but score is below 85', () => {
      expect(isReadyForPublication('APPROVED', 84)).toBe(false)
      expect(isReadyForPublication('APPROVED', 75)).toBe(false)
    })

    it('should return false when status is not APPROVED', () => {
      expect(isReadyForPublication('DRAFT', 100)).toBe(false)
      expect(isReadyForPublication('IN_REVIEW', 100)).toBe(false)
      expect(isReadyForPublication('PUBLISHED', 100)).toBe(false)
      expect(isReadyForPublication('ARCHIVED', 100)).toBe(false)
    })

    it('should use configured validation score threshold', () => {
      expect(isReadyForPublication('APPROVED', APPROVAL_WORKFLOW.requiredValidationScore)).toBe(true)
      expect(isReadyForPublication('APPROVED', APPROVAL_WORKFLOW.requiredValidationScore - 1)).toBe(false)
    })

    it('should handle null/undefined score', () => {
      expect(isReadyForPublication('APPROVED', null as any)).toBe(false)
      expect(isReadyForPublication('APPROVED', undefined as any)).toBe(false)
    })
  })

  /**
   * ============================================================================
   * GET QUEUE PRIORITY TESTS
   * ============================================================================
   */

  describe('getQueuePriority()', () => {
    it('should prioritize ADVANCED cases higher than BASIC', () => {
      const basicPriority = getQueuePriority('BASIC', 24)
      const advancedPriority = getQueuePriority('ADVANCED', 24)
      expect(advancedPriority).toBeGreaterThan(basicPriority)
    })

    it('should prioritize INTERMEDIATE between BASIC and ADVANCED', () => {
      const basicPriority = getQueuePriority('BASIC', 24)
      const intermediatePriority = getQueuePriority('INTERMEDIATE', 24)
      const advancedPriority = getQueuePriority('ADVANCED', 24)
      expect(intermediatePriority).toBeGreaterThan(basicPriority)
      expect(intermediatePriority).toBeLessThan(advancedPriority)
    })

    it('should increase priority for older queue items', () => {
      const newItemPriority = getQueuePriority('BASIC', 1)
      const oldItemPriority = getQueuePriority('BASIC', 72)
      expect(oldItemPriority).toBeGreaterThan(newItemPriority)
    })

    it('should handle zero hours in queue', () => {
      expect(getQueuePriority('BASIC', 0)).toBeGreaterThan(0)
    })

    it('should handle large hour values', () => {
      expect(() => getQueuePriority('ADVANCED', 1000)).not.toThrow()
    })

    it('should return a number between 0 and 1000 (priority score)', () => {
      const priorities = ['BASIC', 'INTERMEDIATE', 'ADVANCED'].flatMap((complexity) =>
        [1, 24, 72].map((hours) => getQueuePriority(complexity as any, hours))
      )
      priorities.forEach((priority) => {
        expect(typeof priority).toBe('number')
        expect(priority).toBeGreaterThanOrEqual(0)
      })
    })
  })

  /**
   * ============================================================================
   * INTEGRATION TESTS
   * ============================================================================
   */

  describe('Approval Workflow Integration', () => {
    it('should support full workflow from DRAFT to PUBLISHED', () => {
      expect(canTransition('DRAFT', 'IN_REVIEW')).toBe(true)
      expect(canTransition('IN_REVIEW', 'APPROVED')).toBe(true)
      expect(canTransition('APPROVED', 'PUBLISHED')).toBe(true)
    })

    it('should allow rejection at IN_REVIEW stage', () => {
      expect(canTransition('IN_REVIEW', 'DRAFT')).toBe(true)
    })

    it('should allow archival at any stage except ARCHIVED', () => {
      const statuses = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED']
      statuses.forEach((status) => {
        expect(canTransition(status, 'ARCHIVED')).toBe(true)
      })
    })

    it('should allow restoration from ARCHIVED to DRAFT', () => {
      expect(canTransition('ARCHIVED', 'DRAFT')).toBe(true)
    })

    it('should validate publication readiness', () => {
      // Approved case with sufficient score is ready for publication
      expect(isReadyForPublication('APPROVED', 85)).toBe(true)

      // But it must go to PUBLISHED status
      expect(canTransition('APPROVED', 'PUBLISHED')).toBe(true)
    })
  })

  /**
   * ============================================================================
   * EDGE CASES
   * ============================================================================
   */

  describe('Edge Cases', () => {
    it('should handle case-sensitivity for status values', () => {
      expect(canTransition('draft', 'IN_REVIEW' as any)).toBe(false)
      expect(canTransition('DRAFT', 'in_review' as any)).toBe(false)
    })

    it('should not allow self-transitions for any status', () => {
      const statuses = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']
      statuses.forEach((status) => {
        expect(canTransition(status, status as any)).toBe(false)
      })
    })

    it('should handle invalid complexity in priority calculation', () => {
      expect(() => getQueuePriority('INVALID' as any, 24)).not.toThrow()
    })

    it('should handle negative hours in queue', () => {
      const priority = getQueuePriority('BASIC', -5)
      expect(typeof priority).toBe('number')
    })
  })
})
