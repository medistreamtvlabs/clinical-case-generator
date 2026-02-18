/**
 * Clinical case generation service using Claude AI
 * Generates educational cases from parsed document data
 */

import Anthropic from '@anthropic-ai/sdk'
import { getCaseGenerationPrompt, getCaseGenerationPromptByDocumentType } from './prompts/generation'
import { CaseContent } from '@/types/case'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface GenerateCaseInput {
  indication: string
  complexity: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'
  educationalObjective: string
  targetAudience: string[]
  language?: string
  additionalRequirements?: string
  documentContext?: {
    documentType?: string
    parsedData?: Record<string, any>
    filename?: string
  }
}

export interface CaseGenerationResult {
  success: boolean
  content?: CaseContent
  rawResponse?: string
  error?: string
  processingTimeMs?: number
  tokensUsed?: {
    input: number
    output: number
  }
  validationErrors?: string[]
}

/**
 * Validate generated case content against expected structure
 */
export function validateCaseContent(content: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required top-level sections
  if (!content.presentation) errors.push('Missing presentation section')
  if (!content.clinicalData) errors.push('Missing clinicalData section')
  if (!content.clinicalQuestion) errors.push('Missing clinicalQuestion section')
  if (!content.educationalNotes) errors.push('Missing educationalNotes section')

  // Validate presentation
  if (content.presentation) {
    if (!content.presentation.chiefComplaint) errors.push('Missing chiefComplaint')
    if (!content.presentation.historyOfPresentIllness)
      errors.push('Missing historyOfPresentIllness')
    if (!Array.isArray(content.presentation.medications))
      errors.push('medications must be array')
  }

  // Validate clinical data
  if (content.clinicalData) {
    if (!content.clinicalData.physicalExamination)
      errors.push('Missing physicalExamination')
    if (!Array.isArray(content.clinicalData.laboratoryResults))
      errors.push('laboratoryResults must be array')
  }

  // Validate clinical question
  if (content.clinicalQuestion) {
    if (!content.clinicalQuestion.question) errors.push('Missing question')
    if (!Array.isArray(content.clinicalQuestion.options))
      errors.push('options must be array')
    if (content.clinicalQuestion.options.length < 3)
      errors.push('Need at least 3 options')
    if (!content.clinicalQuestion.correctAnswer)
      errors.push('Missing correctAnswer')
    if (!content.clinicalQuestion.explanation)
      errors.push('Missing explanation')

    // Check that correct answer exists in options
    const hasCorrect = content.clinicalQuestion.options.some(
      (opt: any) => opt.isCorrect === true
    )
    if (!hasCorrect) errors.push('No correct answer marked in options')
  }

  // Validate educational notes
  if (content.educationalNotes) {
    if (!Array.isArray(content.educationalNotes.keyPoints))
      errors.push('keyPoints must be array')
    if (!Array.isArray(content.educationalNotes.commonMistakes))
      errors.push('commonMistakes must be array')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Enrich case content with metadata
 */
export function enrichCaseContent(
  content: CaseContent,
  input: GenerateCaseInput
): CaseContent {
  // Add educational context to notes
  if (!content.educationalNotes) {
    content.educationalNotes = {}
  }

  if (!content.educationalNotes.keyPoints) {
    content.educationalNotes.keyPoints = []
  }

  // Add educational objective as first key point
  if (input.educationalObjective && !content.educationalNotes.keyPoints[0]?.includes(input.educationalObjective)) {
    content.educationalNotes.keyPoints.unshift(
      `Objetivo educativo: ${input.educationalObjective}`
    )
  }

  return content
}

/**
 * Generate clinical case with Claude AI
 */
export async function generateCaseWithClaude(
  input: GenerateCaseInput
): Promise<CaseGenerationResult> {
  const startTime = Date.now()

  try {
    // Build prompt with document context if available
    let prompt = ''
    if (
      input.documentContext?.documentType &&
      input.documentContext?.parsedData
    ) {
      prompt = getCaseGenerationPromptByDocumentType(
        input.documentContext.documentType,
        input.complexity,
        input.indication
      )

      // Add parsed document data context
      prompt += `\n\nContexto del documento:\n${JSON.stringify(input.documentContext.parsedData, null, 2)}`
    } else {
      prompt = getCaseGenerationPrompt(input.complexity, input.indication)
    }

    // Add audience context
    prompt += `\n\nAudiencia objetivo: ${input.targetAudience.join(', ')}`

    // Add additional requirements if provided
    if (input.additionalRequirements) {
      prompt += `\n\nRequisitos adicionales: ${input.additionalRequirements}`
    }

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from response
    let caseContent: CaseContent | undefined
    const errors: string[] = []

    try {
      // Look for JSON object in response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/m)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])

        // Validate structure
        const validation = validateCaseContent(parsed)
        if (!validation.valid) {
          errors.push(...validation.errors)
        }

        caseContent = enrichCaseContent(parsed, input)
      } else {
        errors.push('No JSON found in response')
      }
    } catch (parseError) {
      errors.push(`JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown'}`)
    }

    const processingTimeMs = Date.now() - startTime

    if (!caseContent) {
      return {
        success: false,
        rawResponse: responseText,
        error: 'Failed to generate valid case content',
        processingTimeMs,
        validationErrors: errors,
        tokensUsed: {
          input: message.usage.input_tokens,
          output: message.usage.output_tokens,
        },
      }
    }

    return {
      success: true,
      content: caseContent,
      rawResponse: responseText,
      processingTimeMs,
      tokensUsed: {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens,
      },
    }
  } catch (error) {
    const processingTimeMs = Date.now() - startTime
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error during case generation'

    return {
      success: false,
      error: errorMessage,
      processingTimeMs,
    }
  }
}

/**
 * Generate case with document context
 * Retrieves relevant parsed documents for context
 */
export async function generateCaseFromDocuments(
  projectId: string,
  input: GenerateCaseInput,
  documentData?: Record<string, any>[]
): Promise<CaseGenerationResult> {
  try {
    // Build context from provided documents
    let documentContext: any = {}
    if (documentData && documentData.length > 0) {
      // Use the most relevant parsed data
      const mergedData = documentData.reduce(
        (acc, doc) => ({ ...acc, ...doc }),
        {}
      )
      documentContext = {
        documentType: 'MULTIPLE',
        parsedData: mergedData,
      }

      // Override with specific document type if all same
      if (
        documentData.length === 1 &&
        documentData[0].documentType
      ) {
        documentContext.documentType = documentData[0].documentType
      }
    }

    // Generate case with context
    const result = await generateCaseWithClaude({
      ...input,
      documentContext,
    })

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error during case generation'

    return {
      success: false,
      error: errorMessage,
    }
  }
}
