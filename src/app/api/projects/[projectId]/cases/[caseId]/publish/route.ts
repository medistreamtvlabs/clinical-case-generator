/**
 * Case publish route
 * Transitions case from APPROVED to PUBLISHED status
 */
import { db } from '@/lib/db'
import { CaseStatus } from '@prisma/client'
import { successResponse, errorResponse } from '@/lib/utils/api-helpers'
import { isReadyForPublication } from '@/lib/config/approval'
interface PublishRequest {
  userId?: string // User ID who is publishing
}
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; caseId: string } }
) {
  try {
    const body = (await request.json()) as PublishRequest
    const userId = body.userId || 'system'
    const clinicalCase = await db.clinicalCase.findFirst({
      where: { id: params.caseId, projectId: params.projectId },
    })
    if (!clinicalCase) {
      return errorResponse('Caso clínico no encontrado', 404)
    }
    if (clinicalCase.status !== CaseStatus.APPROVED) {
      return errorResponse(
        'Solo casos aprobados pueden ser publicados',
        400
      )
    }
    // Verify publication readiness
    if (!isReadyForPublication(clinicalCase.status, clinicalCase.validationScore)) {
      return errorResponse(
        'El caso no cumple los requisitos mínimos para publicación',
        400
      )
    }
    const updated = await db.clinicalCase.update({
      where: { id: params.caseId },
      data: {
        status: CaseStatus.PUBLISHED,
        publishedAt: new Date(),
        publishedBy: userId,
      },
    })
    // Create publication comment
    await db.caseComment.create({
      data: {
        caseId: params.caseId,
        author: userId,
        content: '[PUBLISHED] Caso publicado y disponible para estudiantes',
        isReview: true,
      },
    })
    return successResponse({
      ...updated,
      message: 'Caso clínico publicado',
    })
  } catch (error) {
    console.error('Error publishing case:', error)
    return errorResponse('Error al publicar caso clínico', 500)
  }
}
