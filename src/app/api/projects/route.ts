import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  createProjectSchema,
  updateProjectSchema,
} from '@/lib/validators/project-validators'
import {
  successResponse,
  listResponse,
  errorResponse,
  validationErrorResponse,
  handleDatabaseError,
} from '@/lib/utils/api-helpers'

/**
 * GET /api/projects
 * List all projects with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'))
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build where clause
    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { productName: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get total count
    const total = await db.project.count({ where })

    // Get paginated results with stats
    const projects = await db.project.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            documents: true,
            cases: true,
          },
        },
      },
    })

    // Format response with stats
    const formattedProjects = projects.map((p) => ({
      ...p,
      stats: {
        documentsCount: p._count.documents,
        casesCount: p._count.cases,
      },
      _count: undefined,
    }))

    return listResponse(formattedProjects, total, page, limit)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return handleDatabaseError(error)
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = createProjectSchema.parse(body)

    // Create project and configuration in transaction
    const project = await db.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        productName: validatedData.productName,
        activeIngredient: validatedData.activeIngredient,
        therapeuticAreas: validatedData.therapeuticAreas,
        status: 'SETUP',

        // Create default configuration
        configuration: {
          create: {
            mainIndications: [],
            targetAudiences: [],
            availableLanguages: ['es'],
            allowOffLabel: false,
            requireMedicalReview: true,
            aiModel: 'claude-sonnet-4-5-20250929',
            temperature: 0.7,
            maxTokens: 4000,
          },
        },
      },
      include: {
        configuration: true,
      },
    })

    return successResponse(
      project,
      'Proyecto creado exitosamente',
      201
    )
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return validationErrorResponse(error as any)
    }
    console.error('Error creating project:', error)
    return handleDatabaseError(error)
  }
}
