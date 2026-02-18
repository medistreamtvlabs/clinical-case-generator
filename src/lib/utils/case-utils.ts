/**
 * Utility functions for clinical case operations
 */

import { CaseComplexity, CaseStatus } from '@/types/common'

/**
 * Generate case title from indication and complexity
 */
export function formatCaseTitle(indication: string, complexity: string): string {
  const complexityMap = {
    BASIC: 'Caso Básico',
    INTERMEDIATE: 'Caso Intermedio',
    ADVANCED: 'Caso Avanzado',
  }

  const complexityLabel =
    complexityMap[complexity as keyof typeof complexityMap] || 'Caso'

  return `${complexityLabel}: ${indication}`
}

/**
 * Get readable label for case status
 */
export function getCaseStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Borrador',
    IN_REVIEW: 'En Revisión',
    APPROVED: 'Aprobado',
    PUBLISHED: 'Publicado',
    ARCHIVED: 'Archivado',
  }

  return labels[status] || status
}

/**
 * Get color for case status (for UI)
 */
export function getCaseStatusColor(
  status: string
): 'default' | 'secondary' | 'success' | 'warning' | 'error' {
  const colors: Record<string, any> = {
    DRAFT: 'default',
    IN_REVIEW: 'warning',
    APPROVED: 'success',
    PUBLISHED: 'success',
    ARCHIVED: 'secondary',
  }

  return colors[status] || 'default'
}

/**
 * Get description for complexity level
 */
export function getCaseComplexityDescription(complexity: string): string {
  const descriptions: Record<string, string> = {
    BASIC: 'Caso clínicamente simple con presentación clásica y diagnóstico directo. Ideal para estudiantes novatos.',
    INTERMEDIATE:
      'Caso con presentación parcialmente atípica y algunos elementos distractores. Requiere síntesis de hallazgos. Nivel intermedio.',
    ADVANCED:
      'Caso clínicamente complejo con presentación atípica y múltiples distractores. Requiere pensamiento crítico y síntesis multidisciplinaria. Nivel avanzado.',
  }

  return (
    descriptions[complexity] ||
    'Nivel de complejidad educativa del caso'
  )
}

/**
 * Get color for complexity level (for UI)
 */
export function getComplexityColor(
  complexity: string
): 'default' | 'secondary' | 'success' | 'warning' | 'error' {
  const colors: Record<string, any> = {
    BASIC: 'success',
    INTERMEDIATE: 'warning',
    ADVANCED: 'error',
  }

  return colors[complexity] || 'default'
}

/**
 * Format rating for display
 */
export function formatRating(rating: number | null, ratingCount: number): string {
  if (!rating || ratingCount === 0) {
    return 'Sin calificación'
  }

  return `${rating.toFixed(1)}/5 (${ratingCount} ${ratingCount === 1 ? 'voto' : 'votos'})`
}

/**
 * Check if case can transition to next status
 */
export function canTransitionStatus(
  currentStatus: string,
  targetStatus: string
): boolean {
  const transitions: Record<string, string[]> = {
    DRAFT: ['IN_REVIEW', 'ARCHIVED'],
    IN_REVIEW: ['DRAFT', 'APPROVED', 'ARCHIVED'],
    APPROVED: ['PUBLISHED', 'DRAFT', 'ARCHIVED'],
    PUBLISHED: ['ARCHIVED'],
    ARCHIVED: ['DRAFT'],
  }

  return (transitions[currentStatus] || []).includes(targetStatus)
}

/**
 * Get status transition label
 */
export function getStatusTransitionLabel(
  currentStatus: string,
  targetStatus: string
): string {
  return `${getCaseStatusLabel(currentStatus)} → ${getCaseStatusLabel(targetStatus)}`
}

/**
 * Validate case content structure
 */
export function validateCaseContentStructure(content: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!content) {
    errors.push('Contenido del caso es requerido')
    return { valid: false, errors }
  }

  // Check main sections
  if (!content.presentation)
    errors.push('Sección de presentación faltante')
  if (!content.clinicalData)
    errors.push('Sección de datos clínicos faltante')
  if (!content.clinicalQuestion)
    errors.push('Sección de pregunta clínica faltante')
  if (!content.educationalNotes)
    errors.push('Sección de notas educativas faltante')

  // Presentation validation
  if (content.presentation) {
    if (!content.presentation.chiefComplaint)
      errors.push('Motivo de consulta faltante')
    if (!content.presentation.historyOfPresentIllness)
      errors.push('Historia de enfermedad actual faltante')
  }

  // Clinical question validation
  if (content.clinicalQuestion) {
    if (!content.clinicalQuestion.question)
      errors.push('Pregunta faltante')
    if (
      !Array.isArray(content.clinicalQuestion.options) ||
      content.clinicalQuestion.options.length < 2
    ) {
      errors.push('Se requieren al menos 2 opciones')
    }
    if (!content.clinicalQuestion.correctAnswer)
      errors.push('Respuesta correcta no indicada')
    if (!content.clinicalQuestion.explanation)
      errors.push('Explicación faltante')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Format case for display (truncate long fields)
 */
export function formatCaseForDisplay(
  caseData: any,
  maxObjectiveLength: number = 100
): any {
  return {
    ...caseData,
    educationalObjective:
      caseData.educationalObjective &&
      caseData.educationalObjective.length > maxObjectiveLength
        ? caseData.educationalObjective.substring(0, maxObjectiveLength) +
          '...'
        : caseData.educationalObjective,
  }
}

/**
 * Calculate estimated reading time for case (in minutes)
 */
export function estimateReadingTime(content: any): number {
  let totalWords = 0

  // Count words in presentation
  if (content.presentation?.historyOfPresentIllness) {
    totalWords += content.presentation.historyOfPresentIllness.split(/\s+/).length
  }

  // Count words in clinical data
  if (content.clinicalData?.physicalExamination) {
    totalWords += content.clinicalData.physicalExamination.split(/\s+/).length
  }

  // Count words in explanation
  if (content.clinicalQuestion?.explanation) {
    totalWords += content.clinicalQuestion.explanation.split(/\s+/).length
  }

  // Average reading speed: 200 words per minute
  const readingTime = Math.ceil(totalWords / 200)

  return Math.max(1, readingTime) // Minimum 1 minute
}

/**
 * Get audience display text
 */
export function getAudienceLabel(audience: string): string {
  const labels: Record<string, string> = {
    DOCTORS: 'Médicos',
    RESIDENTS: 'Residentes',
    MEDICAL_STUDENTS: 'Estudiantes de Medicina',
    NURSES: 'Enfermeras',
    PHARMACISTS: 'Farmacéuticos',
    PRIMARY_CARE: 'Atención Primaria',
    SPECIALISTS: 'Especialistas',
  }

  return labels[audience] || audience
}

/**
 * Calculate case difficulty score (0-10)
 */
export function calculateDifficultyScore(
  complexity: string,
  targetAudienceCount: number,
  hasMultipleConditions: boolean
): number {
  let score = 0

  // Base score from complexity
  if (complexity === 'BASIC') score += 2
  else if (complexity === 'INTERMEDIATE') score += 5
  else if (complexity === 'ADVANCED') score += 8

  // Adjust for audience diversity
  score += Math.min(targetAudienceCount - 1, 2)

  // Adjust for multiple conditions
  if (hasMultipleConditions) score += 1

  return Math.min(10, score)
}

/**
 * Get next suggested status based on workflow
 */
export function getNextSuggestedStatus(currentStatus: string): string | null {
  const workflow: Record<string, string> = {
    DRAFT: 'IN_REVIEW',
    IN_REVIEW: 'APPROVED',
    APPROVED: 'PUBLISHED',
    PUBLISHED: null as any,
    ARCHIVED: null as any,
  }

  return workflow[currentStatus] || null
}
