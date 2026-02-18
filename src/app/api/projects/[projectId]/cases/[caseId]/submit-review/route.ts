/**
 * Submit case for review API route
 * Transitions case from DRAFT to IN_REVIEW status
 */

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { CaseStatus } from '@prisma/client'
import { successResponse, errorResponse } from '@/lib/utils/api-helpers'
import { submitForReview } from '@/lib/services/approval-workflow'
import { APPROVAL_WORKFLOW } from '@/lib/config/approval'

interface SubmitReviewRequest {
  userId?: string // User ID who is submitting for review
  comments?: string // Optional comments when submitting
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; caseId: string } }
) {
  try {
    const body = (await request.json()) as SubmitReviewRequest
    const userId = body.userId || 'system'

    // Fetch the case
    const clinicalCase = await db.clinicalCase.findFirst({
      where: { id: params.caseId, projectId: params.projectId },
    })

    if (!clinicalCase) {
      return errorResponse('Caso clínico no encontrado', 404)
    }

    // Verify case is in DRAFT status
    if (clinicalCase.status !== CaseStatus.DRAFT) {
      return errorResponse(
        'Solo casos en borrador pueden enviarse a revisión',
        400
      )
    }

    // Check if validation score meets minimum requirement
    if (clinicalCase.validationScore === null) {
      return errorResponse(
        'El caso debe ser validado antes de enviarlo a revisión',
        400
      )
    }

    if (
      clinicalCase.validationScore <
      APPROVAL_WORKFLOW.requiredValidationScore
    ) {
      return errorResponse(
        `La puntuación de validación debe ser al menos ${APPROVAL_WORKFLOW.requiredValidationScore}%`,
        400
      )
    }

    // Update case status to IN_REVIEW
    const updated = await db.clinicalCase.update({
      where: { id: params.caseId },
      data: {
        status: CaseStatus.IN_REVIEW,
        submittedForReviewAt: new Date(),
        submittedForReviewBy: userId,
      },
    })

    // Create a comment recording the submission
    if (body.comments) {
      await db.caseComment.create({
        data: {
          caseId: params.caseId,
          author: userId,
          content: `[SUBMITTED FOR REVIEW] ${body.comments}`,
          isReview: true,
        },
      })
    }

    return successResponse({
      ...updated,
      message: 'Caso enviado a revisión correctamente',
    })
  } catch (error) {
    console.error('Error submitting case for review:', error)
    return errorResponse('Error al enviar caso a revisión', 500)
  }
}
