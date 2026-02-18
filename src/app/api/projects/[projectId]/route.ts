import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { updateProjectSchema } from '@/lib/validators/project-validators'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleDatabaseError,
} from '@/lib/utils/api-helpers'

interface RouteParams {
  params: {
    projectId: string
  }
}

/**
 * GET /api/projects/[projectId]
 * Get a specific project
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { projectId } = params

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        configuration: true,
        _count: {
          select: {
            documents: true,
            cases: true,
          },
        },
      },
    })

    if (!project) {
      return errorResponse('Proyecto no encontrado', 404)
    }

    return successResponse({
      ...project,
      stats: {
        documentsCount: project._count.documents,
        casesCount: project._count.cases,
      },
      _count: undefined,
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return handleDatabaseError(error)
  }
}

/**
 * PATCH /api/projects/[projectId]
 * Update a project
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { projectId } = params
    const body = await request.json()

    // Validate input
    const validatedData = updateProjectSchema.parse(body)

    // Check project exists
    const exists = await db.project.findUnique({
      where: { id: projectId },
    })

    if (!exists) {
      return errorResponse('Proyecto no encontrado', 404)
    }

    // Update project
    const updated = await db.project.update({
      where: { id: projectId },
      data: validatedData,
      include: {
        configuration: true,
        _count: {
          select: {
            documents: true,
            cases: true,
          },
        },
      },
    })

    return successResponse(
      {
        ...updated,
        stats: {
          documentsCount: updated._count.documents,
          casesCount: updated._count.cases,
        },
        _count: undefined,
      },
      'Proyecto actualizado exitosamente'
    )
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return validationErrorResponse(error as any)
    }
    console.error('Error updating project:', error)
    return handleDatabaseError(error)
  }
}

/**
 * DELETE /api/projects/[projectId]
 * Delete a project (cascade deletes documents and cases)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { projectId } = params

    // Check project exists
    const exists = await db.project.findUnique({
      where: { id: projectId },
    })

    if (!exists) {
      return errorResponse('Proyecto no encontrado', 404)
    }

    // Delete project (cascade deletes related records)
    await db.project.delete({
      where: { id: projectId },
    })

    return successResponse(
      { id: projectId },
      'Proyecto eliminado exitosamente'
    )
  } catch (error) {
    console.error('Error deleting project:', error)
    return handleDatabaseError(error)
  }
}
