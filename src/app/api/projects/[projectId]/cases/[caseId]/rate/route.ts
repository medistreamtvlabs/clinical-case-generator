/**
 * Case rating route
 */

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { rateCaseSchema } from '@/lib/validators/case-validators'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/utils/api-helpers'

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; caseId: string } }
) {
  try {
    const clinicalCase = await db.clinicalCase.findFirst({
      where: { id: params.caseId, projectId: params.projectId },
    })

    if (!clinicalCase) {
      return errorResponse('Caso clínico no encontrado', 404)
    }

    const body = await request.json()
    const validation = rateCaseSchema.safeParse(body)

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
      )
    }

    const { rating } = validation.data

    // Calculate new average rating
    const currentRating = clinicalCase.rating || 0
    const currentCount = clinicalCase.ratingCount || 0
    const newCount = currentCount + 1
    const newRating =
      (currentRating * currentCount + rating) / newCount

    const updated = await db.clinicalCase.update({
      where: { id: params.caseId },
      data: {
        rating: newRating,
        ratingCount: newCount,
      },
    })

    return successResponse({
      id: updated.id,
      rating: updated.rating,
      ratingCount: updated.ratingCount,
      averageRating: updated.rating?.toFixed(2),
      message: 'Caso calificado exitosamente',
    })
  } catch (error) {
    console.error('Error rating case:', error)
    return errorResponse('Error al calificar caso clínico', 500)
  }
}
