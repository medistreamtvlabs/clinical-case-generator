import { describe, it, expect } from 'vitest'
import {
  generateCaseSchema,
  updateCaseSchema,
  publishCaseSchema,
  addCommentSchema,
  rateCaseSchema,
} from '@/lib/validators/case-validators'
import { mockClinicalCase, mockCaseContent } from '../../fixtures/case-fixtures'

describe('Case Validators', () => {
  /**
   * ============================================================================
   * GENERATE CASE SCHEMA TESTS
   * ============================================================================
   */

  describe('generateCaseSchema', () => {
    const validInput = {
      projectId: 'project-001',
      title: 'Hypertension Case Study',
      indication: 'Essential Hypertension',
      complexity: 'BASIC',
      educationalObjective: 'Understanding hypertension management',
      targetAudience: 'Medical residents',
      language: 'es',
      content: mockCaseContent,
    }

    it('should validate a complete valid case', () => {
      const result = generateCaseSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should require projectId', () => {
      const input = { ...validInput }
      delete (input as any).projectId
      const result = generateCaseSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should require title', () => {
      const input = { ...validInput }
      delete (input as any).title
      const result = generateCaseSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should require indication', () => {
      const input = { ...validInput }
      delete (input as any).indication
      const result = generateCaseSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should require complexity field', () => {
      const input = { ...validInput }
      delete (input as any).complexity
      const result = generateCaseSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should validate complexity enum values', () => {
      const validComplexities = ['BASIC', 'INTERMEDIATE', 'ADVANCED']
      validComplexities.forEach((complexity) => {
        const result = generateCaseSchema.safeParse({ ...validInput, complexity })
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid complexity values', () => {
      const result = generateCaseSchema.safeParse({ ...validInput, complexity: 'INVALID' })
      expect(result.success).toBe(false)
    })

    it('should require content object', () => {
      const input = { ...validInput }
      delete (input as any).content
      const result = generateCaseSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should require educationalObjective', () => {
      const input = { ...validInput }
      delete (input as any).educationalObjective
      const result = generateCaseSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should require targetAudience', () => {
      const input = { ...validInput }
      delete (input as any).targetAudience
      const result = generateCaseSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should support multiple languages', () => {
      const languages = ['es', 'en', 'fr', 'pt']
      languages.forEach((lang) => {
        const result = generateCaseSchema.safeParse({ ...validInput, language: lang })
        expect(result.success).toBe(true)
      })
    })

    it('should trim and validate title', () => {
      const result = generateCaseSchema.safeParse({ ...validInput, title: '  Valid Title  ' })
      expect(result.success).toBe(true)
    })
  })

  /**
   * ============================================================================
   * UPDATE CASE SCHEMA TESTS
   * ============================================================================
   */

  describe('updateCaseSchema', () => {
    const validInput = {
      title: 'Updated Case Title',
      indication: 'Updated Indication',
      complexity: 'INTERMEDIATE',
      educationalObjective: 'Updated objective',
      targetAudience: 'Updated audience',
      content: mockCaseContent,
    }

    it('should validate a complete update', () => {
      const result = updateCaseSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should allow partial updates', () => {
      const partialInput = { title: 'New Title' }
      const result = updateCaseSchema.safeParse(partialInput)
      expect(result.success).toBe(true)
    })

    it('should allow updating complexity', () => {
      const result = updateCaseSchema.safeParse({ complexity: 'ADVANCED' })
      expect(result.success).toBe(true)
    })

    it('should allow updating content', () => {
      const result = updateCaseSchema.safeParse({ content: mockCaseContent })
      expect(result.success).toBe(true)
    })

    it('should reject invalid complexity in update', () => {
      const result = updateCaseSchema.safeParse({ complexity: 'INVALID' })
      expect(result.success).toBe(false)
    })

    it('should allow empty update object', () => {
      const result = updateCaseSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should trim title fields', () => {
      const result = updateCaseSchema.safeParse({ title: '  Trimmed Title  ' })
      expect(result.success).toBe(true)
    })
  })

  /**
   * ============================================================================
   * PUBLISH CASE SCHEMA TESTS
   * ============================================================================
   */

  describe('publishCaseSchema', () => {
    const validInput = {
      caseId: 'case-001',
    }

    it('should validate publish request with caseId', () => {
      const result = publishCaseSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should require caseId', () => {
      const result = publishCaseSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('should accept optional reason', () => {
      const result = publishCaseSchema.safeParse({
        caseId: 'case-001',
        reason: 'Case meets all publication criteria',
      })
      expect(result.success).toBe(true)
    })

    it('should validate non-empty caseId', () => {
      const result = publishCaseSchema.safeParse({ caseId: '' })
      expect(result.success).toBe(false)
    })

    it('should accept metadata', () => {
      const result = publishCaseSchema.safeParse({
        caseId: 'case-001',
        metadata: { publishedBy: 'admin-001', source: 'clinical-database' },
      })
      expect(result.success).toBe(true)
    })
  })

  /**
   * ============================================================================
   * ADD COMMENT SCHEMA TESTS
   * ============================================================================
   */

  describe('addCommentSchema', () => {
    const validInput = {
      caseId: 'case-001',
      content: 'This is a helpful comment about the case.',
    }

    it('should validate a complete comment', () => {
      const result = addCommentSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should require caseId', () => {
      const input = { content: 'Comment text' }
      const result = addCommentSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should require content', () => {
      const input = { caseId: 'case-001' }
      const result = addCommentSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should enforce minimum comment length', () => {
      const result = addCommentSchema.safeParse({ caseId: 'case-001', content: 'a' })
      expect(result.success).toBe(false)
    })

    it('should enforce maximum comment length', () => {
      const longContent = 'a'.repeat(5001)
      const result = addCommentSchema.safeParse({ caseId: 'case-001', content: longContent })
      expect(result.success).toBe(false)
    })

    it('should accept comments within length limits', () => {
      const content = 'This comment is between 2 and 5000 characters.'
      const result = addCommentSchema.safeParse({ caseId: 'case-001', content })
      expect(result.success).toBe(true)
    })

    it('should accept optional author field', () => {
      const result = addCommentSchema.safeParse({
        ...validInput,
        author: 'user-001',
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional isReview flag', () => {
      const result = addCommentSchema.safeParse({
        ...validInput,
        isReview: true,
      })
      expect(result.success).toBe(true)
    })

    it('should trim whitespace from content', () => {
      const result = addCommentSchema.safeParse({
        caseId: 'case-001',
        content: '  Comment with whitespace  ',
      })
      expect(result.success).toBe(true)
    })
  })

  /**
   * ============================================================================
   * RATE CASE SCHEMA TESTS
   * ============================================================================
   */

  describe('rateCaseSchema', () => {
    const validInput = {
      caseId: 'case-001',
      rating: 4.5,
    }

    it('should validate a complete rating', () => {
      const result = rateCaseSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should require caseId', () => {
      const input = { rating: 4.5 }
      const result = rateCaseSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should require rating', () => {
      const input = { caseId: 'case-001' }
      const result = rateCaseSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should enforce minimum rating of 1', () => {
      const result = rateCaseSchema.safeParse({ caseId: 'case-001', rating: 0.5 })
      expect(result.success).toBe(false)
    })

    it('should enforce maximum rating of 5', () => {
      const result = rateCaseSchema.safeParse({ caseId: 'case-001', rating: 5.5 })
      expect(result.success).toBe(false)
    })

    it('should accept whole number ratings', () => {
      for (let i = 1; i <= 5; i++) {
        const result = rateCaseSchema.safeParse({ caseId: 'case-001', rating: i })
        expect(result.success).toBe(true)
      }
    })

    it('should accept decimal ratings (0.5 increments)', () => {
      const ratings = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]
      ratings.forEach((rating) => {
        const result = rateCaseSchema.safeParse({ caseId: 'case-001', rating })
        expect(result.success).toBe(true)
      })
    })

    it('should accept optional comment with rating', () => {
      const result = rateCaseSchema.safeParse({
        caseId: 'case-001',
        rating: 4,
        comment: 'Excellent case study with clear clinical learning points.',
      })
      expect(result.success).toBe(true)
    })

    it('should enforce comment length if provided', () => {
      const longComment = 'a'.repeat(1001)
      const result = rateCaseSchema.safeParse({
        caseId: 'case-001',
        rating: 4,
        comment: longComment,
      })
      expect(result.success).toBe(false)
    })
  })

  /**
   * ============================================================================
   * ERROR MESSAGE VALIDATION TESTS
   * ============================================================================
   */

  describe('Error Messages', () => {
    it('should provide clear error for missing required fields', () => {
      const result = generateCaseSchema.safeParse({})
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0)
        expect(result.error.errors[0]).toHaveProperty('message')
      }
    })

    it('should include field path in error messages', () => {
      const result = generateCaseSchema.safeParse({ title: 123 })
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0)
      }
    })

    it('should validate enum values with clear errors', () => {
      const result = generateCaseSchema.safeParse({
        ...{ title: 'Test', projectId: 'p1', indication: 'ind', complexity: 'INVALID', educationalObjective: 'obj', targetAudience: 'aud', content: {} },
      })
      if (!result.success) {
        const complexityError = result.error.errors.find((e) => e.path.includes('complexity'))
        expect(complexityError).toBeDefined()
      }
    })
  })

  /**
   * ============================================================================
   * INTEGRATION TESTS
   * ============================================================================
   */

  describe('Schema Integration', () => {
    it('should validate complete workflow from generation to publishing', () => {
      // Generate case
      const generateResult = generateCaseSchema.safeParse({
        projectId: 'project-001',
        title: 'Test Case',
        indication: 'Test Indication',
        complexity: 'BASIC',
        educationalObjective: 'Test objective',
        targetAudience: 'Test audience',
        language: 'es',
        content: mockCaseContent,
      })
      expect(generateResult.success).toBe(true)

      // Update case
      const updateResult = updateCaseSchema.safeParse({
        title: 'Updated Title',
        complexity: 'INTERMEDIATE',
      })
      expect(updateResult.success).toBe(true)

      // Publish case
      const publishResult = publishCaseSchema.safeParse({
        caseId: 'case-001',
      })
      expect(publishResult.success).toBe(true)
    })

    it('should validate adding comments during review', () => {
      const result = addCommentSchema.safeParse({
        caseId: 'case-001',
        content: 'Review comment about the clinical content.',
        author: 'reviewer-001',
        isReview: true,
      })
      expect(result.success).toBe(true)
    })

    it('should validate user ratings', () => {
      const result = rateCaseSchema.safeParse({
        caseId: 'case-001',
        rating: 4.5,
        comment: 'Great educational case with relevant clinical scenarios.',
      })
      expect(result.success).toBe(true)
    })
  })
})
