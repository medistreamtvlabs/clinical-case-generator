/**
 * Case detail routes: GET, PATCH, DELETE
 */

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { updateCaseSchema } from '@/lib/validators/case-validators'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/utils/api-helpers'

/**
 * GET /api/projects/[projectId]/cases/[caseId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; caseId: string } }
) {
  try {
    const clinicalCase = await db.clinicalCase.findFirst({
      where: {
        id: params.caseId,
        projectId: params.projectId,
      },
      include: {
        _count: { select: { comments: true } },
      },
    })

    if (!clinicalCase) {
      return errorResponse('Caso clínico no encontrado', 404)
    }

    // Increment views
    await db.clinicalCase.update({
      where: { id: params.caseId },
      data: { views: { increment: 1 } },
    })

    return successResponse({
      ...clinicalCase,
      commentsCount: clinicalCase._count.comments,
    })
  } catch (error) {
    console.error('Error fetching case:', error)
    return errorResponse('Error al obtener caso clínico', 500)
  }
}

/**
 * PATCH /api/projects/[projectId]/cases/[caseId]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string; caseId: string } }
) {
  try {
    const clinicalCase = await db.clinicalCase.findFirst({
      where: {
        id: params.caseId,
        projectId: params.projectId,
      },
    })

    if (!clinicalCase) {
      return errorResponse('Caso clínico no encontrado', 404)
    }

    const body = await request.json()
    const validation = updateCaseSchema.safeParse(body)

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
      )
    }

    const updateData: any = {}
    if (validation.data.title !== undefined) updateData.title = validation.data.title
    if (validation.data.indication !== undefined) updateData.indication = validation.data.indication
    if (validation.data.complexity !== undefined) updateData.complexity = validation.data.complexity
    if (validation.data.educationalObjective !== undefined)
      updateData.educationalObjective = validation.data.educationalObjective
    if (validation.data.targetAudience !== undefined)
      updateData.targetAudience = validation.data.targetAudience
    if (validation.data.content !== undefined) updateData.content = validation.data.content
    if (validation.data.status !== undefined) updateData.status = validation.data.status
    if (validation.data.validated !== undefined) updateData.validated = validation.data.validated

    const updatedCase = await db.clinicalCase.update({
      where: { id: params.caseId },
      data: updateData,
    })

    return successResponse({
      ...updatedCase,
      message: 'Caso clínico actualizado',
    })
  } catch (error) {
    console.error('Error updating case:', error)
    return errorResponse('Error al actualizar caso clínico', 500)
  }
}

/**
 * DELETE /api/projects/[projectId]/cases/[caseId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; caseId: string } }
) {
  try {
    const clinicalCase = await db.clinicalCase.findFirst({
      where: {
        id: params.caseId,
        projectId: params.projectId,
      },
    })

    if (!clinicalCase) {
      return errorResponse('Caso clínico no encontrado', 404)
    }

    await db.clinicalCase.delete({
      where: { id: params.caseId },
    })

    return successResponse(
      { id: params.caseId, message: 'Caso clínico eliminado' },
      200
    )
  } catch (error) {
    console.error('Error deleting case:', error)
    return errorResponse('Error al eliminar caso clínico', 500)
  }
}
