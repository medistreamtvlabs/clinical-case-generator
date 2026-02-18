/**
 * Case publish route
 */

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { CaseStatus } from '@prisma/client'
import { successResponse, errorResponse } from '@/lib/utils/api-helpers'

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

    if (clinicalCase.status !== CaseStatus.APPROVED) {
      return errorResponse(
        'Solo casos aprobados pueden ser publicados',
        400
      )
    }

    const updated = await db.clinicalCase.update({
      where: { id: params.caseId },
      data: {
        status: CaseStatus.PUBLISHED,
        publishedAt: new Date(),
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
