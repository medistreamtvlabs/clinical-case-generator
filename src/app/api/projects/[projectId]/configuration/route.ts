import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { updateConfigurationSchema } from '@/lib/validators/project-validators'
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
 * GET /api/projects/[projectId]/configuration
 * Get project configuration
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { projectId } = params

    const config = await db.projectConfiguration.findUnique({
      where: { projectId },
    })

    if (!config) {
      return errorResponse('Configuración no encontrada', 404)
    }

    return successResponse(config)
  } catch (error) {
    console.error('Error fetching configuration:', error)
    return handleDatabaseError(error)
  }
}

/**
 * PATCH /api/projects/[projectId]/configuration
 * Update project configuration
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { projectId } = params
    const body = await request.json()

    // Validate input
    const validatedData = updateConfigurationSchema.parse(body)

    // Check configuration exists
    const exists = await db.projectConfiguration.findUnique({
      where: { projectId },
    })

    if (!exists) {
      return errorResponse('Configuración no encontrada', 404)
    }

    // Update configuration
    const updated = await db.projectConfiguration.update({
      where: { projectId },
      data: validatedData,
    })

    return successResponse(
      updated,
      'Configuración actualizada exitosamente'
    )
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return validationErrorResponse(error as any)
    }
    console.error('Error updating configuration:', error)
    return handleDatabaseError(error)
  }
}
