/**
 * Validation Configuration
 * Scoring thresholds, complexity minimums, and display labels
 * Used by: validation service, API routes, dashboard components
 */

/**
 * Validation score thresholds for badge display
 * Ranges: 0-100
 */
export const VALIDATION_THRESHOLDS = {
  EXCELLENT: 90,      // ✓ Excelente
  GOOD: 75,           // ✓ Bueno
  ACCEPTABLE: 60,     // ⚠ Aceptable
  NEEDS_WORK: 45,     // ⚠ Necesita mejoras
  INSUFFICIENT: 0,    // ✗ Insuficiente
} as const

/**
 * Minimum validation scores required by case complexity
 * Used to determine if a case meets publication readiness
 */
export const COMPLEXITY_MINIMUMS = {
  BASIC: 60,          // 60% minimum for basic cases
  INTERMEDIATE: 70,   // 70% minimum for intermediate cases
  ADVANCED: 80,       // 80% minimum for advanced cases
  PUBLICATION: 85,    // 85% minimum for publication
} as const

/**
 * Validation score ranges for UI display
 * Maps score ranges to user-friendly labels
 */
export const VALIDATION_SCORE_RANGES = {
  EXCELLENT: {
    min: 90,
    max: 100,
    label: 'Excelente',
    icon: '✓✓',
    color: 'success',
    colorClass: 'text-green-600 bg-green-50',
  },
  GOOD: {
    min: 75,
    max: 89,
    label: 'Bueno',
    icon: '✓',
    color: 'success',
    colorClass: 'text-green-600 bg-green-50',
  },
  ACCEPTABLE: {
    min: 60,
    max: 74,
    label: 'Aceptable',
    icon: '→',
    color: 'warning',
    colorClass: 'text-blue-600 bg-blue-50',
  },
  NEEDS_WORK: {
    min: 45,
    max: 59,
    label: 'Necesita mejoras',
    icon: '!',
    color: 'warning',
    colorClass: 'text-yellow-600 bg-yellow-50',
  },
  INSUFFICIENT: {
    min: 0,
    max: 44,
    label: 'Insuficiente',
    icon: '✗',
    color: 'destructive',
    colorClass: 'text-red-600 bg-red-50',
  },
} as const

/**
 * Get validation score label and styling
 * @param score - Validation score (0-100) * @returns Validation range info or undefined if score is invalid
 */
export function getValidationScoreInfo(score?: number | null) {
  if (score === null || score === undefined) {
    return undefined
  }

  if (score >= VALIDATION_THRESHOLDS.EXCELLENT) {
    return VALIDATION_SCORE_RANGES.EXCELLENT
  } else if (score >= VALIDATION_THRESHOLDS.GOOD) {
    return VALIDATION_SCORE_RANGES.GOOD
  } else if (score >= VALIDATION_THRESHOLDS.ACCEPTABLE) {
    return VALIDATION_SCORE_RANGES.ACCEPTABLE
  } else if (score >= VALIDATION_THRESHOLDS.NEEDS_WORK) {
    return VALIDATION_SCORE_RANGES.NEEDS_WORK
  } else {
    return VALIDATION_SCORE_RANGES.INSUFFICIENT
  }
}

/**
 * Check if a case meets the validation threshold for its complexity
 * @param score - Validation score (0-100)
 * @param complexity - Case complexity (BASIC, INTERMEDIATE, ADVANCED)
 * @returns true if score meets or exceeds the minimum for complexity
 */
export function meetsValidationThreshold(
  score: number,
  complexity: string
): boolean {
  const minimum = (COMPLEXITY_MINIMUMS as any)[complexity] || COMPLEXITY_MINIMUMS.BASIC
  return score >= minimum
}

/**
 * Check if a case is ready for publication
 * @param score - Validation score (0-100)
 * @returns true if score meets publication minimum
 */
export function isReadyForPublication(score?: number | null): boolean {
  if (!score) return false
  return score >= COMPLEXITY_MINIMUMS.PUBLICATION
}

/**
 * Validation component size options
 */
export const VALIDATION_BADGE_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
} as const

/**
 * Validation component tooltip options
 */
export const VALIDATION_TOOLTIP_DELAY = 200 // milliseconds
