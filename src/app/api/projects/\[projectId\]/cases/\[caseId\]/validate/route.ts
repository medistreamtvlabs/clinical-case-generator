/**
 * Case validation endpoint
 * POST /api/projects/:projectId/cases/:caseId/validate
 *
 * Validates a clinical case and returns comprehensive validation report
 */

import { NextRequest } from 'next/server'
import prisma from '@/lib/db/prisma'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/utils/api-helpers'
import {
  validateCaseContent,
  generateValidationReportText,
  type ValidationReport,
} from '@/lib/services/case-validation'
import {
  validateCaseRequestSchema,
} from '@/lib/validators/validation-validators'

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; caseId: string } }
) {
  try {
    const projectId = params.projectId
    const caseId = params.caseId

    // Parse and validate request body
    const body = await request.json()
    const validatedInput = validateCaseRequestSchema.parse(body)

    // Verify project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return errorResponse('Proyecto no encontrado', 404)
    }

    // Fetch the case
    const clinicalCase = await prisma.clinicalCase.findUnique({
      where: {
        id: caseId,
        projectId: projectId,
      },
    })

    if (!clinicalCase) {
      return errorResponse('Caso clínico no encontrado', 404)
    }

    // Perform validation
    const validationReport: ValidationReport = await validateCaseContent({
      ...clinicalCase,
      content: clinicalCase.content as any,
    })

    // Prepare response based on client request
    const responseData: any = {
      ...validationReport,
      caseId,
      projectId,
    }

    // Add detailed text report if requested
    if (validatedInput.includeDetailedReport) {
      responseData.detailedReport = generateValidationReportText(
        validationReport
      )
    }

    // Update database with validation results if case wasn't already validated
    if (!clinicalCase.validated || clinicalCase.validationResults === null) {
      await prisma.clinicalCase.update({
        where: { id: caseId },
        data: {
          validated: validationReport.isValid,
          validationResults: validationReport as any,
          validationScore: validationReport.score,
          lastValidatedAt: new Date(),
        },
      })
    }

    // Return validation report
    return successResponse(responseData, 'Validación completada', 200)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error)
    }

    console.error('Case validation error:', error)
    const message =
      error instanceof Error ? error.message : 'Error al validar caso'
    return errorResponse(message, 500)
  }
}

// Import z for error handling
import { z } from 'zod'
