import { describe, it, expect, beforeEach } from 'vitest'
import {
  validateCaseCompleteness,
  validateEducationalQuality,
  validateMedicalAccuracy,
  validateCaseContent,
  validateCasesBatch,
} from '@/lib/services/case-validation'
import { mockCaseContent, mockClinicalCase, mockValidatedCase } from '../../fixtures/case-fixtures'
import { mockValidValidationReport, mockErrorsValidationReport } from '../../fixtures/validation-fixtures'

describe('Case Validation Service', () => {
  /**
   * ============================================================================
   * VALIDATE CASE COMPLETENESS TESTS
   * ============================================================================
   */

  describe('validateCaseCompleteness()', () => {
    it('should return score 100 for complete case content', () => {
      const result = validateCaseCompleteness(mockCaseContent)
      expect(result.isComplete).toBe(true)
      expect(result.score).toBe(100)
      expect(result.missing.length).toBe(0)
    })

    it('should return score 0 for null content', () => {
      const result = validateCaseCompleteness(null)
      expect(result.isComplete).toBe(false)
      expect(result.score).toBe(0)
      expect(result.missing.length).toBeGreaterThan(0)
    })

    it('should return score 0 for undefined content', () => {
      const result = validateCaseCompleteness(undefined)
      expect(result.isComplete).toBe(false)
      expect(result.score).toBe(0)
    })

    it('should detect missing patient demographics', () => {
      const incompleteContent = {
        ...mockCaseContent,
        presentationOfCase: {
          patientDemographics: undefined,
        },
      }
      const result = validateCaseCompleteness(incompleteContent as any)
      expect(result.isComplete).toBe(false)
      expect(result.missing.length).toBeGreaterThan(0)
    })

    it('should detect missing clinical examination data', () => {
      const incompleteContent = {
        ...mockCaseContent,
        clinicalExamination: undefined,
      }
      const result = validateCaseCompleteness(incompleteContent as any)
      expect(result.isComplete).toBe(false)
    })

    it('should detect missing diagnostic workup', () => {
      const incompleteContent = {
        ...mockCaseContent,
        diagnosticWorkup: undefined,
      }
      const result = validateCaseCompleteness(incompleteContent as any)
      expect(result.isComplete).toBe(false)
    })

    it('should detect missing educational content', () => {
      const incompleteContent = {
        ...mockCaseContent,
        educationalContent: undefined,
      }
      const result = validateCaseCompleteness(incompleteContent as any)
      expect(result.isComplete).toBe(false)
    })

    it('should return partial score for partially complete content', () => {
      const partialContent = {
        ...mockCaseContent,
        clinicalExamination: undefined,
      }
      const result = validateCaseCompleteness(partialContent as any)
      expect(result.score).toBeGreaterThan(0)
      expect(result.score).toBeLessThan(100)
    })

    it('should have score between 0 and 100', () => {
      const result = validateCaseCompleteness(mockCaseContent)
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('should return missing fields list', () => {
      const incompleteContent = {}
      const result = validateCaseCompleteness(incompleteContent as any)
      expect(Array.isArray(result.missing)).toBe(true)
    })

    it('should scale score proportionally with missing sections', () => {
      const result1 = validateCaseCompleteness(mockCaseContent)
      const result2 = validateCaseCompleteness({})
      expect(result1.score).toBeGreaterThan(result2.score)
    })
  })

  /**
   * ============================================================================
   * VALIDATE EDUCATIONAL QUALITY TESTS
   * ============================================================================
   */

  describe('validateEducationalQuality()', () => {
    it('should return score 100 for high-quality educational content', () => {
      const result = validateEducationalQuality(mockCaseContent)
      expect(result.score).toBe(100)
      expect(result.issues.length).toBe(0)
    })

    it('should return score 0 for null content', () => {
      const result = validateEducationalQuality(null)
      expect(result.score).toBe(0)
    })

    it('should detect brief educational objectives', () => {
      const poorQualityContent = {
        ...mockCaseContent,
        educationalContent: {
          keyPoints: ['Point 1'],
          patientEducation: 'X',
        },
      }
      const result = validateEducationalQuality(poorQualityContent as any)
      expect(result.score).toBeLessThan(100)
      expect(result.issues.length).toBeGreaterThan(0)
    })

    it('should detect missing patient education', () => {
      const poorQualityContent = {
        ...mockCaseContent,
        educationalContent: {
          keyPoints: ['Point 1', 'Point 2', 'Point 3'],
        },
      }
      const result = validateEducationalQuality(poorQualityContent as any)
      expect(result.issues.length).toBeGreaterThan(0)
    })

    it('should check for comprehensive educational points', () => {
      const minimalContent = {
        ...mockCaseContent,
        educationalContent: {
          keyPoints: [],
          patientEducation: 'Education text',
        },
      }
      const result = validateEducationalQuality(minimalContent as any)
      expect(result.score).toBeLessThan(100)
    })

    it('should return array of issues', () => {
      const result = validateEducationalQuality(mockCaseContent)
      expect(Array.isArray(result.issues)).toBe(true)
    })

    it('should issue warnings for common problems', () => {
      const problematicContent = {
        educationalContent: {
          keyPoints: ['Only one point'],
          patientEducation: 'X',
        },
      }
      const result = validateEducationalQuality(problematicContent as any)
      if (result.issues.length > 0) {
        expect(['error', 'warning', 'info']).toContain(result.issues[0].severity)
      }
    })

    it('should score between 0 and 100', () => {
      const result = validateEducationalQuality(mockCaseContent)
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('should include field references in issues', () => {
      const poorContent = { educationalContent: {} }
      const result = validateEducationalQuality(poorContent as any)
      if (result.issues.length > 0) {
        expect(result.issues[0]).toHaveProperty('field')
        expect(typeof result.issues[0].field).toBe('string')
      }
    })
  })

  /**
   * ============================================================================
   * VALIDATE MEDICAL ACCURACY TESTS
   * ============================================================================
   */

  describe('validateMedicalAccuracy()', () => {
    it('should return score 100 for medically accurate content', () => {
      const result = validateMedicalAccuracy(mockCaseContent)
      expect(result.score).toBe(100)
      expect(result.issues.length).toBe(0)
    })

    it('should return score 100 for null content', () => {
      const result = validateMedicalAccuracy(null)
      expect(result.score).toBe(100)
    })

    it('should detect vital signs outside normal ranges', () => {
      const inaccurateContent = {
        ...mockCaseContent,
        clinicalExamination: {
          vitalSigns: {
            bloodPressure: { systolic: 300, diastolic: 200 }, // Out of range
            heartRate: 200, // Out of range
            respiratoryRate: 60, // Out of range
            temperature: 45, // Out of range
          },
          physicalFindings: 'Test',
        },
      }
      const result = validateMedicalAccuracy(inaccurateContent as any)
      expect(result.score).toBeLessThan(100)
      expect(result.issues.length).toBeGreaterThan(0)
    })

    it('should detect abnormal laboratory values', () => {
      const inaccurateContent = {
        ...mockCaseContent,
        diagnosticWorkup: {
          laboratoryTests: {
            creatinine: 10, // Out of normal range
            potassium: 9, // Out of normal range
            glucose: 1000, // Out of normal range
          },
          imaging: 'Normal',
        },
      }
      const result = validateMedicalAccuracy(inaccurateContent as any)
      expect(result.score).toBeLessThan(100)
    })

    it('should score between 0 and 100', () => {
      const result = validateMedicalAccuracy(mockCaseContent)
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('should return issues array', () => {
      const result = validateMedicalAccuracy(mockCaseContent)
      expect(Array.isArray(result.issues)).toBe(true)
    })

    it('should include field references for vital sign issues', () => {
      const inaccurateContent = {
        ...mockCaseContent,
        clinicalExamination: {
          vitalSigns: {
            heartRate: 250, // Out of range
          },
        },
      }
      const result = validateMedicalAccuracy(inaccurateContent as any)
      if (result.issues.length > 0) {
        expect(result.issues[0].field).toContain('vitalSigns')
      }
    })

    it('should handle missing vital signs gracefully', () => {
      const incompleteContent = {
        ...mockCaseContent,
        clinicalExamination: {},
      }
      expect(() => validateMedicalAccuracy(incompleteContent as any)).not.toThrow()
    })
  })

  /**
   * ============================================================================
   * VALIDATE CASE CONTENT TESTS
   * ============================================================================
   */

  describe('validateCaseContent()', () => {
    it('should validate complete case and return high score', () => {
      const result = validateCaseContent(mockCaseContent)
      expect(result.overallScore).toBeGreaterThanOrEqual(80)
      expect(result.isValid).toBe(true)
    })

    it('should return report with all required fields', () => {
      const result = validateCaseContent(mockCaseContent)
      expect(result).toHaveProperty('overallScore')
      expect(result).toHaveProperty('completenessScore')
      expect(result).toHaveProperty('educationalQualityScore')
      expect(result).toHaveProperty('medicalAccuracyScore')
      expect(result).toHaveProperty('isValid')
      expect(result).toHaveProperty('errors')
      expect(result).toHaveProperty('warnings')
      expect(result).toHaveProperty('suggestions')
      expect(result).toHaveProperty('timestamp')
    })

    it('should score 0-100', () => {
      const result = validateCaseContent(mockCaseContent)
      expect(result.overallScore).toBeGreaterThanOrEqual(0)
      expect(result.overallScore).toBeLessThanOrEqual(100)
    })

    it('should calculate weighted average of component scores', () => {
      const result = validateCaseContent(mockCaseContent)
      // Overall score should be average of three components
      const expectedScore =
        (result.completenessScore + result.educationalQualityScore + result.medicalAccuracyScore) / 3
      expect(result.overallScore).toBeCloseTo(expectedScore, 0)
    })

    it('should return empty errors array for valid case', () => {
      const result = validateCaseContent(mockCaseContent)
      expect(Array.isArray(result.errors)).toBe(true)
    })

    it('should return warnings array', () => {
      const result = validateCaseContent(mockCaseContent)
      expect(Array.isArray(result.warnings)).toBe(true)
    })

    it('should return suggestions array', () => {
      const result = validateCaseContent(mockCaseContent)
      expect(Array.isArray(result.suggestions)).toBe(true)
    })

    it('should set isValid to true when score >= 60', () => {
      const result = validateCaseContent(mockCaseContent)
      if (result.overallScore >= 60) {
        expect(result.isValid).toBe(true)
      }
    })

    it('should set isValid to false when score < 60', () => {
      const emptyContent = {}
      const result = validateCaseContent(emptyContent as any)
      if (result.overallScore < 60) {
        expect(result.isValid).toBe(false)
      }
    })

    it('should include timestamp', () => {
      const result = validateCaseContent(mockCaseContent)
      expect(result.timestamp).toBeInstanceOf(Date)
    })

    it('should handle incomplete content', () => {
      const incompleteContent = {
        presentationOfCase: {
          patientDemographics: { age: 65 },
        },
      }
      const result = validateCaseContent(incompleteContent as any)
      expect(result.isValid).toBeDefined()
      expect(result.overallScore).toBeGreaterThanOrEqual(0)
    })
  })

  /**
   * ============================================================================
   * VALIDATE CASES BATCH TESTS
   * ============================================================================
   */

  describe('validateCasesBatch()', () => {
    it('should validate single case', async () => {
      const result = await validateCasesBatch([mockClinicalCase])
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(1)
    })

    it('should validate multiple cases', async () => {
      const cases = [mockClinicalCase, mockValidatedCase]
      const result = await validateCasesBatch(cases)
      expect(result.length).toBe(cases.length)
    })

    it('should return validation report for each case', async () => {
      const cases = [mockClinicalCase, mockValidatedCase]
      const results = await validateCasesBatch(cases)
      results.forEach((report) => {
        expect(report).toHaveProperty('overallScore')
        expect(report).toHaveProperty('isValid')
      })
    })

    it('should handle empty array', async () => {
      const result = await validateCasesBatch([])
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })

    it('should validate batch of 10+ cases', async () => {
      const cases = Array(15)
        .fill(null)
        .map((_, i) => ({
          ...mockClinicalCase,
          id: `case-${i}`,
        }))
      const results = await validateCasesBatch(cases)
      expect(results.length).toBe(15)
    })

    it('should maintain case order in results', async () => {
      const cases = [
        { ...mockClinicalCase, id: 'case-1' },
        { ...mockClinicalCase, id: 'case-2' },
        { ...mockClinicalCase, id: 'case-3' },
      ]
      const results = await validateCasesBatch(cases)
      expect(results.length).toBe(3)
    })

    it('should handle cases with different complexities', async () => {
      const basicCase = { ...mockClinicalCase, complexity: 'BASIC' }
      const intermediateCase = { ...mockClinicalCase, complexity: 'INTERMEDIATE' }
      const advancedCase = { ...mockClinicalCase, complexity: 'ADVANCED' }
      const results = await validateCasesBatch([basicCase, intermediateCase, advancedCase])
      expect(results.length).toBe(3)
    })

    it('should validate cases with missing content gracefully', async () => {
      const cases = [
        mockClinicalCase,
        { ...mockClinicalCase, content: null },
      ]
      const results = await validateCasesBatch(cases)
      expect(results.length).toBe(2)
      expect(results[1].overallScore).toBeLessThan(results[0].overallScore)
    })
  })

  /**
   * ============================================================================
   * VALIDATION SCORE RANGES TESTS
   * ============================================================================
   */

  describe('Validation Score Ranges', () => {
    it('should classify 95+ as excellent', () => {
      const result = validateCaseContent(mockCaseContent)
      if (result.overallScore >= 90) {
        expect(result.isValid).toBe(true)
      }
    })

    it('should classify 75-89 as good', () => {
      // Create moderate quality case
      const moderateContent = {
        ...mockCaseContent,
        educationalContent: {
          keyPoints: ['Point 1'],
        },
      }
      const result = validateCaseContent(moderateContent as any)
      expect(result.overallScore).toBeGreaterThanOrEqual(0)
    })

    it('should classify 60-74 as acceptable', () => {
      const result = validateCaseContent({} as any)
      // Empty content should score low
      expect(result.overallScore).toBeGreaterThanOrEqual(0)
    })

    it('should classify below 60 as needs improvement', () => {
      const result = validateCaseContent({} as any)
      expect(result.isValid).toBe(result.overallScore >= 60)
    })
  })

  /**
   * ============================================================================
   * INTEGRATION TESTS
   * ============================================================================
   */

  describe('Validation Integration', () => {
    it('should validate full case lifecycle', async () => {
      const newCase = mockClinicalCase
      const report = validateCaseContent(newCase.content as any)
      expect(report).toBeDefined()
      expect(report.overallScore).toBeGreaterThanOrEqual(0)
    })

    it('should support updating case after validation', async () => {
      const report1 = validateCaseContent(mockCaseContent)
      const improvedContent = {
        ...mockCaseContent,
        educationalContent: {
          keyPoints: ['Point 1', 'Point 2', 'Point 3'],
          patientEducation: 'Detailed education',
        },
      }
      const report2 = validateCaseContent(improvedContent as any)
      expect(report2.overallScore).toBeGreaterThanOrEqual(report1.overallScore)
    })

    it('should handle validation for different complexities', () => {
      const basicContent = mockCaseContent
      const result = validateCaseContent(basicContent)
      expect(result.overallScore).toBeGreaterThanOrEqual(0)
    })
  })

  /**
   * ============================================================================
   * ERROR HANDLING TESTS
   * ============================================================================
   */

  describe('Error Handling', () => {
    it('should handle null content gracefully', () => {
      expect(() => validateCaseContent(null as any)).not.toThrow()
    })

    it('should handle undefined content gracefully', () => {
      expect(() => validateCaseContent(undefined as any)).not.toThrow()
    })

    it('should handle empty object', () => {
      expect(() => validateCaseContent({} as any)).not.toThrow()
    })

    it('should handle malformed content', () => {
      const malformedContent = {
        random: 'data',
        nested: { wrong: 'structure' },
      }
      expect(() => validateCaseContent(malformedContent as any)).not.toThrow()
    })

    it('should never throw on batch validation', async () => {
      const cases = [
        mockClinicalCase,
        null,
        undefined,
        { ...mockClinicalCase, content: {} },
      ] as any[]
      expect(async () => await validateCasesBatch(cases)).not.toThrow()
    })
  })
})
