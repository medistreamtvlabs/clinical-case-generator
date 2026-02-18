/**
 * Case approval API route
 * Transitions case from IN_REVIEW to APPROVED status
 */

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { CaseStatus } from '@prisma/client'
import { successResponse, errorResponse } from '@/lib/utils/api-helpers'

interface ApprovalRequest {
  userId?: string // User ID of the reviewer
  comments?: string // Optional reviewer comments
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; caseId: string } }
) {
  try {
    const body = (await request.json()) as ApprovalRequest
    const userId = body.userId || 'system'

    // Fetch the case
    const clinicalCase = await db.clinicalCase.findFirst({
      where: { id: params.caseId, projectId: params.projectId },
    })

    if (!clinicalCase) {
      return errorResponse('Caso clínico no encontrado', 404)
    }

    // Verify case is in IN_REVIEW status
    if (clinicalCase.status !== CaseStatus.IN_REVIEW) {
      return errorResponse(
        'Solo casos en revisión pueden ser aprobados',
        400
      )
    }

    // Update case status to APPROVED
    const updated = await db.clinicalCase.update({
      where: { id: params.caseId },
      data: {
        status: CaseStatus.APPROVED,
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    })

    // Create a review comment
    if (body.comments) {
      await db.caseComment.create({
        data: {
          caseId: params.caseId,
          author: userId,
          content: `[APPROVED] ${body.comments}`,
          isReview: true,
        },
      })
    } else {
      await db.caseComment.create({
        data: {
          caseId: params.caseId,
          author: userId,
          content: '[APPROVED] Caso aprobado para publicación',
          isReview: true,
        },
      })
    }

    return successResponse({
      ...updated,
      message: 'Caso aprobado correctamente',
    })
  } catch (error) {
    console.error('Error approving case:', error)
    return errorResponse('Error al aprobar caso', 500)
  }
}
