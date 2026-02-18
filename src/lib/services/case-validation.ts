/**
 * Clinical Case Validation Service
 * Provides comprehensive validation for clinical cases including:
 * - Completeness validation (all required fields present)
 * - Educational quality scoring (0-100)
 * - Medical accuracy validation (vital signs, labs, logic)
 * - Structured validation reports
 */

import type { CaseContent, ClinicalCase } from '@/types/case'

/**
 * Validation report structure returned by validation functions
 */
export interface ValidationReport {
  isValid: boolean
  score: number // 0-100
  completeness: number // 0-100
  quality: number // 0-100
  accuracy: number // 0-100
  issues: ValidationIssue[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
  timestamp: Date
}

/**
 * Individual validation issue (errors that prevent publication)
 */
export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  field: string
  message: string
  suggestion?: string
}

/**
 * Validation warning (non-blocking issues)
 */
export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

/**
 * Validation suggestion (improvement recommendations)
 */
export interface ValidationSuggestion {
  field: string
  message: string
  priority: 'high' | 'medium' | 'low'
}

/**
 * Clinical data ranges for validation
 */
const VITAL_SIGNS_RANGES = {
  'Heart Rate': { min: 40, max: 120, unit: 'bpm' },
  'Blood Pressure Systolic': { min: 80, max: 180, unit: 'mmHg' },
  'Blood Pressure Diastolic': { min: 50, max: 120, unit: 'mmHg' },
  'Temperature': { min: 35, max: 42, unit: '°C' },
  'Respiratory Rate': { min: 8, max: 30, unit: 'rpm' },
  'SpO2': { min: 85, max: 100, unit: '%' },
  'Blood Glucose': { min: 40, max: 500, unit: 'mg/dL' },
}

const COMMON_LAB_RANGES = {
  'WBC': { min: 3.5, max: 11.0, unit: 'x10^9/L' },
  'Hemoglobin': { min: 12, max: 18, unit: 'g/dL' },
  'Platelets': { min: 150, max: 400, unit: 'x10^9/L' },
  'Sodium': { min: 130, max: 145, unit: 'mEq/L' },
  'Potassium': { min: 3.5, max: 5.0, unit: 'mEq/L' },
  'Creatinine': { min: 0.7, max: 1.3, unit: 'mg/dL' },
  'BUN': { min: 7, max: 20, unit: 'mg/dL' },
  'Glucose': { min: 70, max: 100, unit: 'mg/dL' },
}

/**
 * Check if case has all required fields for a complete case
 * Returns completeness percentage (0-100)
 */
function validateCaseCompleteness(content: CaseContent | null | undefined): {
  isComplete: boolean
  score: number
  missing: string[]
} {
  if (!content) {
    return {
      isComplete: false,
      score: 0,
      missing: [
        'Presentación del paciente',
        'Datos clínicos',
        'Pregunta clínica',
        'Notas educativas',
      ],
    }
  }

  const missingFields: string[] = []
  let requiredFieldsPresent = 0
  const totalRequiredFields = 4

  // Check presentation
  if (
    !content.presentation?.chiefComplaint ||
    !content.presentation?.demographics
  ) {
    missingFields.push('Presentación del paciente (queja principal, demográficos)')
  } else {
    requiredFieldsPresent++
  }

  // Check clinical data
  if (
    !content.clinicalData?.physicalExamination &&
    !content.clinicalData?.vitalSigns &&
    !content.clinicalData?.laboratoryResults
  ) {
    missingFields.push('Datos clínicos (examen físico, signos vitales o laboratorio)')
  } else {
    requiredFieldsPresent++
  }

  // Check clinical question
  if (
    !content.clinicalQuestion?.question ||
    !content.clinicalQuestion?.options ||
    content.clinicalQuestion.options.length < 2
  ) {
    missingFields.push('Pregunta clínica con opciones (mínimo 2 opciones)')
  } else {
    requiredFieldsPresent++
  }

  // Check educational notes
  if (
    !content.educationalNotes?.keyPoints ||
    content.educationalNotes.keyPoints.length === 0
  ) {
    missingFields.push('Notas educativas (puntos clave)')
  } else {
    requiredFieldsPresent++
  }

  const completenessScore = Math.round(
    (requiredFieldsPresent / totalRequiredFields) * 100
  )

  return {
    isComplete: requiredFieldsPresent === totalRequiredFields,
    score: completenessScore,
    missing: missingFields,
  }
}

/**
 * Validate educational quality of the case
 * Scores: question clarity, explanation depth, educational completeness
 * Returns quality score (0-100)
 */
function validateEducationalQuality(content: CaseContent | null | undefined): {
  score: number
  issues: ValidationIssue[]
} {
  if (!content) {
    return { score: 0, issues: [] }
  }

  const issues: ValidationIssue[] = []
  let qualityScore = 100

  // Question clarity (20 points)
  const questionLength = content.clinicalQuestion?.question?.length || 0
  if (questionLength < 20) {
    issues.push({
      severity: 'warning',
      field: 'clinicalQuestion.question',
      message: 'La pregunta clínica es muy corta (menos de 20 caracteres)',
      suggestion: 'Expande la pregunta para mayor claridad',
    })
    qualityScore -= 15
  } else if (questionLength > 500) {
    issues.push({
      severity: 'warning',
      field: 'clinicalQuestion.question',
      message: 'La pregunta clínica es muy larga (más de 500 caracteres)',
      suggestion: 'Simplifica la pregunta manteniendo la esencia',
    })
    qualityScore -= 10
  }

  // Explanation depth (25 points)
  const explanationLength = content.clinicalQuestion?.explanation?.length || 0
  if (explanationLength < 50) {
    issues.push({
      severity: 'warning',
      field: 'clinicalQuestion.explanation',
      message: 'La explicación es muy breve (menos de 50 caracteres)',
      suggestion: 'Proporciona una explicación más detallada del diagnóstico/manejo',
    })
    qualityScore -= 20
  }

  // Educational notes completeness (25 points)
  const keyPointsCount = content.educationalNotes?.keyPoints?.length || 0
  const commonMistakesCount = content.educationalNotes?.commonMistakes?.length || 0
  const clinicalTipsCount = content.educationalNotes?.clinicalTips?.length || 0

  if (keyPointsCount < 2) {
    issues.push({
      severity: 'warning',
      field: 'educationalNotes.keyPoints',
      message: 'Se requieren al menos 2 puntos clave educativos',
      suggestion: 'Agrega más puntos clave relevantes al caso',
    })
    qualityScore -= 15
  }

  if (commonMistakesCount === 0) {
    issues.push({
      severity: 'info',
      field: 'educationalNotes.commonMistakes',
      message: 'No hay errores comunes documentados',
      suggestion: 'Considera agregar errores comunes para mejorar la enseñanza',
    })
    qualityScore -= 5
  }

  // Options quality (15 points)
  const optionsCount = content.clinicalQuestion?.options?.length || 0
  if (optionsCount < 4) {
    issues.push({
      severity: 'warning',
      field: 'clinicalQuestion.options',
      message: `Solo hay ${optionsCount} opción(es). Se recomienda 4 opciones`,
      suggestion: 'Agrega más opciones distractoras realistas',
    })
    qualityScore -= 10
  }

  // References (10 points)
  const referencesCount = content.clinicalQuestion?.references?.length || 0
  if (referencesCount === 0) {
    issues.push({
      severity: 'info',
      field: 'clinicalQuestion.references',
      message: 'No hay referencias bibliográficas',
      suggestion: 'Agrega referencias médicas relevantes para mayor credibilidad',
    })
    qualityScore -= 5
  }

  return {
    score: Math.max(0, qualityScore),
    issues,
  }
}

/**
 * Validate medical accuracy of clinical data
 * Checks: vital signs ranges, lab value ranges, clinical plausibility
 * Returns accuracy score (0-100)
 */
function validateMedicalAccuracy(content: CaseContent | null | undefined): {
  score: number
  issues: ValidationIssue[]
} {
  if (!content) {
    return { score: 100, issues: [] }
  }

  const issues: ValidationIssue[] = []
  let accuracyScore = 100

  // Validate vital signs
  if (content.clinicalData?.vitalSigns) {
    const vitalSigns = content.clinicalData.vitalSigns as Record<
      string,
      unknown
    >

    for (const [key, value] of Object.entries(vitalSigns)) {
      if (typeof value !== 'number') continue

      const range = VITAL_SIGNS_RANGES[key as keyof typeof VITAL_SIGNS_RANGES]
      if (range) {
        if (value < range.min || value > range.max) {
          issues.push({
            severity: 'warning',
            field: `clinicalData.vitalSigns.${key}`,
            message: `${key} (${value} ${range.unit}) está fuera del rango típico (${range.min}-${range.max})`,
            suggestion: 'Verifica que el valor sea clínicamente plausible',
          })
          accuracyScore -= 5
        }
      }
    }
  }

  // Validate laboratory results
  if (content.clinicalData?.laboratoryResults) {
    for (const lab of content.clinicalData.laboratoryResults) {
      const resultValue = parseFloat(lab.result)
      if (isNaN(resultValue)) continue

      const range =
        COMMON_LAB_RANGES[lab.test as keyof typeof COMMON_LAB_RANGES]
      if (range) {
        if (resultValue < range.min || resultValue > range.max) {
          issues.push({
            severity: 'info',
            field: `clinicalData.laboratoryResults.${lab.test}`,
            message: `${lab.test} (${lab.result} ${range.unit || 'unidades'}) está fuera del rango típico (${range.min}-${range.max})`,
            suggestion: 'Verifica que el valor sea consistente con la presentación clínica',
          })
          accuracyScore -= 3
        }
      }
    }
  }

  // Validate clinical consistency
  if (
    content.clinicalData?.vitalSigns &&
    content.presentation?.chiefComplaint
  ) {
    const vitalSigns = content.clinicalData.vitalSigns as Record<
      string,
      unknown
    >
    const complaint = content.presentation.chiefComplaint.toLowerCase()

    // Check for fever if fever-related complaint
    if (
      complaint.includes('fiebre') ||
      complaint.includes('fever') ||
      complaint.includes('température')
    ) {
      const temp = vitalSigns['Temperature'] as number | undefined
      if (temp && temp < 38.5) {
        issues.push({
          severity: 'info',
          field: 'clinicalData.vitalSigns.Temperature',
          message: 'Queja de fiebre pero temperatura no es elevada',
          suggestion: 'Considera si es consistente con la presentación clínica',
        })
        accuracyScore -= 2
      }
    }
  }

  return {
    score: Math.max(0, accuracyScore),
    issues,
  }
}

/**
 * Main validation function - orchestrates all validations
 */
export async function validateCaseContent(
  caseData: Partial<ClinicalCase>
): Promise<ValidationReport> {
  const content = caseData.content as CaseContent | undefined

  // Get individual validation scores
  const completeness = validateCaseCompleteness(content)
  const educational = validateEducationalQuality(content)
  const accuracy = validateMedicalAccuracy(content)

  // Combine issues
  const allIssues = [
    ...completeness.missing.map((field) => ({
      severity: 'error' as const,
      field: 'case',
      message: `Campo requerido faltante: ${field}`,
    })),
    ...educational.issues,
    ...accuracy.issues,
  ]

  // Separate by severity
  const issues = allIssues.filter((i) => i.severity === 'error')
  const warnings = allIssues.filter((i) => i.severity === 'warning')
  const suggestions = allIssues.filter((i) => i.severity === 'info')

  // Calculate overall score (weighted average)
  // Completeness: 40%, Quality: 40%, Accuracy: 20%
  const overallScore = Math.round(
    completeness.score * 0.4 +
      educational.score * 0.4 +
      accuracy.score * 0.2
  )

  // A case is valid if it's complete (errors = 0)
  const isValid = completeness.isComplete && issues.length === 0

  return {
    isValid,
    score: overallScore,
    completeness: completeness.score,
    quality: educational.score,
    accuracy: accuracy.score,
    issues,
    warnings,
    suggestions,
    timestamp: new Date(),
  }
}

/**
 * Generate a human-readable validation report
 */
export function generateValidationReportText(report: ValidationReport): string {
  const lines: string[] = [
    `=== REPORTE DE VALIDACIÓN ===`,
    ``,
    `Puntuación General: ${report.score}/100`,
    `Estado: ${report.isValid ? '✓ VÁLIDO' : '✗ INVÁLIDO'}`,
    ``,
    `Componentes:`,
    `  • Completitud: ${report.completeness}%`,
    `  • Calidad Educativa: ${report.quality}%`,
    `  • Precisión Médica: ${report.accuracy}%`,
    ``,
  ]

  if (report.issues.length > 0) {
    lines.push(`Errores (${report.issues.length}):`)
    report.issues.forEach((issue) => {
      lines.push(`  ✗ [${issue.field}] ${issue.message}`)
      if (issue.suggestion) {
        lines.push(`    → ${issue.suggestion}`)
      }
    })
    lines.push(``)
  }

  if (report.warnings.length > 0) {
    lines.push(`Advertencias (${report.warnings.length}):`)
    report.warnings.forEach((warning) => {
      lines.push(`  ⚠ [${warning.field}] ${warning.message}`)
      if (warning.suggestion) {
        lines.push(`    → ${warning.suggestion}`)
      }
    })
    lines.push(``)
  }

  if (report.suggestions.length > 0) {
    lines.push(`Sugerencias de Mejora (${report.suggestions.length}):`)
    report.suggestions.forEach((sugg) => {
      lines.push(`  ℹ [${sugg.field}] ${sugg.message}`)
    })
    lines.push(``)
  }

  lines.push(`Fecha: ${report.timestamp.toLocaleString('es-ES')}`)

  return lines.join('\n')
}

/**
 * Batch validate multiple cases
 */
export async function validateCasesBatch(
  cases: Partial<ClinicalCase>[]
): Promise<ValidationReport[]> {
  return Promise.all(cases.map((c) => validateCaseContent(c)))
}

/**
 * Get validation score thresholds
 */
export function getValidationThresholds() {
  return {
    BASIC: 60,        // BASIC cases need 60% minimum
    INTERMEDIATE: 70, // INTERMEDIATE need 70% minimum
    ADVANCED: 80,     // ADVANCED need 80% minimum
    PUBLICATION: 85,  // Publication requires 85% minimum
  }
}

/**
 * Check if case meets complexity-specific validation threshold
 */
export function meetsComplexityThreshold(
  score: number,
  complexity?: string
): boolean {
  const thresholds = getValidationThresholds()
  const threshold =
    thresholds[
      (complexity || 'BASIC') as keyof typeof thresholds
    ] || thresholds.BASIC

  return score >= threshold
}
