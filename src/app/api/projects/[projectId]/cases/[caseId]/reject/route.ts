/**
 * Case rejection API route
 * Rejects case from IN_REVIEW back to DRAFT status with feedback
 */
import { db } from '@/lib/db'
import { CaseStatus } from '@prisma/client'
import { successResponse, errorResponse } from '@/lib/utils/api-helpers'
interface RejectionRequest {
  userId?: string // User ID of the reviewer
  reason: string // Required: reason for rejection
  suggestions?: string[] // Optional: improvement suggestions
}
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; caseId: string } }
) {
  try {
    const body = (await request.json()) as RejectionRequest
    const userId = body.userId || 'system'
    // Validate required fields
    if (!body.reason || body.reason.trim().length === 0) {
      return errorResponse('El motivo del rechazo es requerido', 400)
    }
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
        'Solo casos en revisión pueden ser rechazados',
        400
      )
    }
    // Update case status back to DRAFT
    const updated = await db.clinicalCase.update({
      where: { id: params.caseId },
      data: {
        status: CaseStatus.DRAFT,
        // Keep existing reviewer info for audit trail
      },
    })
    // Create rejection comment with detailed feedback
    let commentContent = `[REJECTED]\n\n**Motivo del rechazo:**\n${body.reason}`
    if (body.suggestions && body.suggestions.length > 0) {
      const validSuggestions = body.suggestions.filter(s => s && s.trim().length > 0)
      if (validSuggestions.length > 0) {
        commentContent += `\n\n**Sugerencias de mejora:**\n`
        validSuggestions.forEach((suggestion, index) => {
          commentContent += `\n${index + 1}. ${suggestion}`
        })
      }
    }
    await db.caseComment.create({
      data: {
        caseId: params.caseId,
        author: userId,
        content: commentContent,
        isReview: true,
      },
    })
    return successResponse({
      ...updated,
      message: 'Caso rechazado. Se devolvió a estado de borrador para revisión',
    })
  } catch (error) {
    console.error('Error rejecting case:', error)
    return errorResponse('Error al rechazar caso', 500)
  }
}
