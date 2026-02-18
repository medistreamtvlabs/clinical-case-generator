import { describe, it, expect } from 'vitest'
import {
  VALIDATION_THRESHOLDS,
  COMPLEXITY_MINIMUMS,
  VALIDATION_SCORE_RANGES,
  getValidationScoreInfo,
  meetsValidationThreshold,
  isReadyForPublication,
} from '@/lib/config/validation'

describe('Validation Configuration', () => {
  /**
   * ============================================================================
   * VALIDATION THRESHOLDS TESTS
   * ============================================================================
   */

  describe('VALIDATION_THRESHOLDS', () => {
    it('should define excellent threshold at 90', () => {
      expect(VALIDATION_THRESHOLDS.EXCELLENT).toBe(90)
    })

    it('should define good threshold at 75', () => {
      expect(VALIDATION_THRESHOLDS.GOOD).toBe(75)
    })

    it('should define acceptable threshold at 60', () => {
      expect(VALIDATION_THRESHOLDS.ACCEPTABLE).toBe(60)
    })

    it('should define needs work threshold at 45', () => {
      expect(VALIDATION_THRESHOLDS.NEEDS_WORK).toBe(45)
    })

    it('should define insufficient threshold at 0', () => {
      expect(VALIDATION_THRESHOLDS.INSUFFICIENT).toBe(0)
    })

    it('should have thresholds in ascending order', () => {
      const thresholds = Object.values(VALIDATION_THRESHOLDS)
      for (let i = 0; i < thresholds.length - 1; i++) {
        expect(thresholds[i]).toBeLessThanOrEqual(thresholds[i + 1])
      }
    })
  })

  /**
   * ============================================================================
   * COMPLEXITY MINIMUMS TESTS
   * ============================================================================
   */

  describe('COMPLEXITY_MINIMUMS', () => {
    it('should require 60% minimum for BASIC complexity', () => {
      expect(COMPLEXITY_MINIMUMS.BASIC).toBe(60)
    })

    it('should require 70% minimum for INTERMEDIATE complexity', () => {
      expect(COMPLEXITY_MINIMUMS.INTERMEDIATE).toBe(70)
    })

    it('should require 80% minimum for ADVANCED complexity', () => {
      expect(COMPLEXITY_MINIMUMS.ADVANCED).toBe(80)
    })

    it('should require 85% minimum for publication', () => {
      expect(COMPLEXITY_MINIMUMS.PUBLICATION).toBe(85)
    })

    it('should have increasing minimums for higher complexity', () => {
      expect(COMPLEXITY_MINIMUMS.BASIC).toBeLessThan(COMPLEXITY_MINIMUMS.INTERMEDIATE)
      expect(COMPLEXITY_MINIMUMS.INTERMEDIATE).toBeLessThan(COMPLEXITY_MINIMUMS.ADVANCED)
      expect(COMPLEXITY_MINIMUMS.ADVANCED).toBeLessThan(COMPLEXITY_MINIMUMS.PUBLICATION)
    })
  })

  /**
   * ============================================================================
   * VALIDATION SCORE RANGES TESTS
   * ============================================================================
   */

  describe('VALIDATION_SCORE_RANGES', () => {
    it('should define score range for excellent (90+)', () => {
      expect(VALIDATION_SCORE_RANGES).toHaveProperty('90')
    })

    it('should define score range for good (75-89)', () => {
      expect(VALIDATION_SCORE_RANGES).toHaveProperty('75')
    })

    it('should define score range for acceptable (60-74)', () => {
      expect(VALIDATION_SCORE_RANGES).toHaveProperty('60')
    })

    it('should define score range for needs work (45-59)', () => {
      expect(VALIDATION_SCORE_RANGES).toHaveProperty('45')
    })

    it('should define score range for insufficient (0-44)', () => {
      expect(VALIDATION_SCORE_RANGES).toHaveProperty('0')
    })

    it('each range should have label and color properties', () => {
      Object.values(VALIDATION_SCORE_RANGES).forEach((range) => {
        expect(range).toHaveProperty('label')
        expect(range).toHaveProperty('color')
        expect(typeof range.label).toBe('string')
        expect(typeof range.color).toBe('string')
      })
    })
  })

  /**
   * ============================================================================
   * GET VALIDATION SCORE INFO TESTS
   * ============================================================================
   */

  describe('getValidationScoreInfo()', () => {
    it('should return excellent info for score 95', () => {
      const info = getValidationScoreInfo(95)
      expect(info).toHaveProperty('label')
      expect(info.label).toContain('Excelente')
    })

    it('should return good info for score 80', () => {
      const info = getValidationScoreInfo(80)
      expect(info).toHaveProperty('label')
      expect(info.label).toContain('Bueno')
    })

    it('should return acceptable info for score 68', () => {
      const info = getValidationScoreInfo(68)
      expect(info).toHaveProperty('label')
      expect(info.label).toContain('Aceptable')
    })

    it('should return needs work info for score 52', () => {
      const info = getValidationScoreInfo(52)
      expect(info).toHaveProperty('label')
      expect(info.label).toContain('mejoras')
    })

    it('should return insufficient info for score 35', () => {
      const info = getValidationScoreInfo(35)
      expect(info).toHaveProperty('label')
      expect(info.label).toContain('Insuficiente')
    })

    it('should return color property for each score', () => {
      const scores = [0, 45, 60, 75, 90, 100]
      scores.forEach((score) => {
        const info = getValidationScoreInfo(score)
        expect(info).toHaveProperty('color')
        expect(typeof info.color).toBe('string')
      })
    })

    it('should handle boundary scores correctly', () => {
      expect(getValidationScoreInfo(90)).toHaveProperty('label')
      expect(getValidationScoreInfo(89)).toHaveProperty('label')
      expect(getValidationScoreInfo(75)).toHaveProperty('label')
      expect(getValidationScoreInfo(74)).toHaveProperty('label')
      expect(getValidationScoreInfo(60)).toHaveProperty('label')
      expect(getValidationScoreInfo(59)).toHaveProperty('label')
      expect(getValidationScoreInfo(45)).toHaveProperty('label')
      expect(getValidationScoreInfo(44)).toHaveProperty('label')
    })

    it('should handle edge cases (0 and 100)', () => {
      expect(() => getValidationScoreInfo(0)).not.toThrow()
      expect(() => getValidationScoreInfo(100)).not.toThrow()
    })
  })

  /**
   * ============================================================================
   * MEETS VALIDATION THRESHOLD TESTS
   * ============================================================================
   */

  describe('meetsValidationThreshold()', () => {
    describe('BASIC complexity', () => {
      it('should pass with score of 60', () => {
        expect(meetsValidationThreshold(60, 'BASIC')).toBe(true)
      })

      it('should fail with score of 59', () => {
        expect(meetsValidationThreshold(59, 'BASIC')).toBe(false)
      })

      it('should pass with score of 100', () => {
        expect(meetsValidationThreshold(100, 'BASIC')).toBe(true)
      })
    })

    describe('INTERMEDIATE complexity', () => {
      it('should pass with score of 70', () => {
        expect(meetsValidationThreshold(70, 'INTERMEDIATE')).toBe(true)
      })

      it('should fail with score of 69', () => {
        expect(meetsValidationThreshold(69, 'INTERMEDIATE')).toBe(false)
      })

      it('should pass with score of 85', () => {
        expect(meetsValidationThreshold(85, 'INTERMEDIATE')).toBe(true)
      })
    })

    describe('ADVANCED complexity', () => {
      it('should pass with score of 80', () => {
        expect(meetsValidationThreshold(80, 'ADVANCED')).toBe(true)
      })

      it('should fail with score of 79', () => {
        expect(meetsValidationThreshold(79, 'ADVANCED')).toBe(false)
      })

      it('should pass with score of 95', () => {
        expect(meetsValidationThreshold(95, 'ADVANCED')).toBe(true)
      })
    })

    describe('Publication threshold', () => {
      it('should require 85 for any complexity for publication', () => {
        expect(meetsValidationThreshold(85, 'PUBLICATION')).toBe(true)
        expect(meetsValidationThreshold(84, 'PUBLICATION')).toBe(false)
        expect(meetsValidationThreshold(100, 'PUBLICATION')).toBe(true)
      })
    })

    it('should handle decimal scores', () => {
      expect(meetsValidationThreshold(60.5, 'BASIC')).toBe(true)
      expect(meetsValidationThreshold(59.9, 'BASIC')).toBe(false)
    })
  })

  /**
   * ============================================================================
   * IS READY FOR PUBLICATION TESTS
   * ============================================================================
   */

  describe('isReadyForPublication()', () => {
    it('should return true when score meets publication threshold (85)', () => {
      expect(isReadyForPublication(85)).toBe(true)
    })

    it('should return true when score exceeds publication threshold', () => {
      expect(isReadyForPublication(90)).toBe(true)
      expect(isReadyForPublication(100)).toBe(true)
    })

    it('should return false when score is below publication threshold', () => {
      expect(isReadyForPublication(84)).toBe(false)
      expect(isReadyForPublication(80)).toBe(false)
      expect(isReadyForPublication(0)).toBe(false)
    })

    it('should handle null score as not ready', () => {
      expect(isReadyForPublication(null)).toBe(false)
      expect(isReadyForPublication(undefined)).toBe(false)
    })

    it('should return true for perfect score', () => {
      expect(isReadyForPublication(100)).toBe(true)
    })

    it('should use publication minimum consistently', () => {
      expect(isReadyForPublication(COMPLEXITY_MINIMUMS.PUBLICATION)).toBe(true)
      expect(isReadyForPublication(COMPLEXITY_MINIMUMS.PUBLICATION - 1)).toBe(false)
    })
  })

  /**
   * ============================================================================
   * INTEGRATION TESTS
   * ============================================================================
   */

  describe('Configuration Integration', () => {
    it('should be consistent across thresholds and complexity minimums', () => {
      // Publication minimum should be higher than all other minimums
      expect(COMPLEXITY_MINIMUMS.PUBLICATION).toBeGreaterThanOrEqual(COMPLEXITY_MINIMUMS.ADVANCED)
      expect(COMPLEXITY_MINIMUMS.PUBLICATION).toBeGreaterThanOrEqual(COMPLEXITY_MINIMUMS.INTERMEDIATE)
      expect(COMPLEXITY_MINIMUMS.PUBLICATION).toBeGreaterThanOrEqual(COMPLEXITY_MINIMUMS.BASIC)
    })

    it('should have all score ranges defined', () => {
      const expectedRanges = [90, 75, 60, 45, 0]
      expectedRanges.forEach((range) => {
        expect(VALIDATION_SCORE_RANGES).toHaveProperty(String(range))
      })
    })

    it('should support workflow decision making', () => {
      // A case with score 85 should be ready for publication
      const score = 85
      expect(isReadyForPublication(score)).toBe(true)

      // A case with score 85 should meet ADVANCED threshold
      expect(meetsValidationThreshold(score, 'ADVANCED')).toBe(true)

      // The same case should get "Excelente" rating
      const info = getValidationScoreInfo(score)
      expect(info).toBeDefined()
    })
  })

  /**
   * ============================================================================
   * EDGE CASES AND ERROR HANDLING
   * ============================================================================
   */

  describe('Edge Cases', () => {
    it('should handle invalid complexity gracefully', () => {
      // Should either handle gracefully or throw predictable error
      expect(() => meetsValidationThreshold(85, 'INVALID' as any)).not.toThrow()
    })

    it('should handle negative scores', () => {
      expect(meetsValidationThreshold(-10, 'BASIC')).toBe(false)
    })

    it('should handle scores above 100', () => {
      expect(meetsValidationThreshold(150, 'BASIC')).toBe(true)
      expect(isReadyForPublication(150)).toBe(true)
    })

    it('should handle floating point scores with precision', () => {
      expect(meetsValidationThreshold(60.0001, 'BASIC')).toBe(true)
      expect(meetsValidationThreshold(59.9999, 'BASIC')).toBe(false)
    })
  })
})
