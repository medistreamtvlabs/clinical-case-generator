/**
 * Case archival API route
 * Archives a case from any status
 */
import { db } from '@/lib/db'
import { CaseStatus } from '@prisma/client'
import { successResponse, errorResponse } from '@/lib/utils/api-helpers'
interface ArchiveRequest {
  userId?: string // User ID who is archiving
  reason?: string // Optional reason for archiving
}
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; caseId: string } }
) {
  try {
    const body = (await request.json()) as ArchiveRequest
    const userId = body.userId || 'system'
    // Fetch the case
    const clinicalCase = await db.clinicalCase.findFirst({
      where: { id: params.caseId, projectId: params.projectId },
    })
    if (!clinicalCase) {
      return errorResponse('Caso clínico no encontrado', 404)
    }
    // Cannot archive already published cases (they're in use)
    if (clinicalCase.status === CaseStatus.PUBLISHED) {
      return errorResponse(
        'No se pueden archivar casos publicados. Primero debe despublicarlos.',
        400
      )
    }
    // Update case status to ARCHIVED
    const updated = await db.clinicalCase.update({
      where: { id: params.caseId },
      data: {
        status: CaseStatus.ARCHIVED,
        archivedAt: new Date(),
        archivedBy: userId,
      },
    })
    // Create archive comment
    if (body.reason) {
      await db.caseComment.create({
        data: {
          caseId: params.caseId,
          author: userId,
          content: `[ARCHIVED] Motivo: ${body.reason}`,
          isReview: true,
        },
      })
    } else {
      await db.caseComment.create({
        data: {
          caseId: params.caseId,
          author: userId,
          content: '[ARCHIVED] Caso archivado',
          isReview: true,
        },
      })
    }
    return successResponse({
      ...updated,
      message: 'Caso archivado correctamente',
    })
  } catch (error) {
    console.error('Error archiving case:', error)
    return errorResponse('Error al archivar caso', 500)
  }
}
