/**
 * Case routes: GET cases list, POST generate case
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { generateCaseSchema, listCasesQuerySchema } from '@/lib/validators/case-validators'
import { generateCaseWithClaude, validateCaseContent } from '@/lib/ai/case-generator'
import { successResponse, listResponse, errorResponse, validationErrorResponse } from '@/lib/utils/api-helpers'
import { CaseStatus, CaseComplexity } from '@prisma/client'

/**
 * GET /api/projects/[projectId]/cases
 * Get all cases for a project with pagination and filtering
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse and validate query parameters
    const queryData = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      complexity: searchParams.get('complexity'),
      indication: searchParams.get('indication'),
      search: searchParams.get('search'),
      sort: searchParams.get('sort'),
    }

    const validation = listCasesQuerySchema.safeParse(queryData)
    if (!validation.success) {
      return validationErrorResponse(
        validation.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
      )
    }

    const { page, limit, status, complexity, indication, search, sort } =
      validation.data

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: params.projectId },
    })

    if (!project) {
      return errorResponse('Proyecto no encontrado', 404)
    }

    // Build filter
    const where: any = { projectId: params.projectId }
    if (status) where.status = status
    if (complexity) where.complexity = complexity
    if (indication) where.indication = { contains: indication, mode: 'insensitive' }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { indication: { contains: search, mode: 'insensitive' } },
        { educationalObjective: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Build sort
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'newest') orderBy = { createdAt: 'desc' }
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' }
    else if (sort === 'rating') orderBy = { rating: 'desc' }
    else if (sort === 'views') orderBy = { views: 'desc' }
    else if (sort === 'title') orderBy = { title: 'asc' }

    // Get total count
    const total = await db.clinicalCase.count({ where })

    // Get cases
    const cases = await db.clinicalCase.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      select: {
        id: true,
        title: true,
        indication: true,
        complexity: true,
        status: true,
        educationalObjective: true,
        targetAudience: true,
        views: true,
        rating: true,
        ratingCount: true,
        validated: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
      },
    })

    return listResponse(cases, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching cases:', error)
    return errorResponse('Error al obtener casos clínicos', 500)
  }
}

/**
 * POST /api/projects/[projectId]/cases
 * Generate new clinical case
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: params.projectId },
      include: { configuration: true },
    })

    if (!project) {
      return errorResponse('Proyecto no encontrado', 404)
    }

    const body = await request.json()

    // Validate request body
    const validation = generateCaseSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(
        validation.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
      )
    }

    const {
      indication,
      complexity,
      educationalObjective,
      targetAudience,
      language,
      additionalRequirements,
      documentIds,
    } = validation.data

    // Retrieve document context if provided
    let documentContext: any[] | undefined
    if (documentIds && documentIds.length > 0) {
      documentContext = await db.document.findMany({
        where: {
          id: { in: documentIds },
          projectId: params.projectId,
        },
        select: {
          type: true,
          parsedData: true,
        },
      })
    }

    // Generate case with Claude
    const generationResult = await generateCaseWithClaude({
      indication,
      complexity: complexity as 'BASIC' | 'INTERMEDIATE' | 'ADVANCED',
      educationalObjective,
      targetAudience,
      language,
      additionalRequirements,
      documentContext: documentContext
        ? {
            documentType: documentContext[0]?.type || 'MULTIPLE',
            parsedData:
              documentContext.length === 1
                ? documentContext[0].parsedData
                : documentContext.reduce(
                    (acc, doc) => ({ ...acc, ...doc.parsedData }),
                    {}
                  ),
          }
        : undefined,
    })

    if (!generationResult.success) {
      console.error('Case generation failed:', generationResult.error)
      return errorResponse(
        generationResult.error || 'Error al generar caso clínico',
        500
      )
    }

    // Validate generated content
    const contentValidation = validateCaseContent(generationResult.content)
    if (!contentValidation.valid) {
      console.error('Generated case validation failed:', contentValidation.errors)
      return errorResponse(
        'El caso generado no cumple con la estructura requerida',
        500
      )
    }

    // Create case in database
    const caseTitle = `${complexity}: ${indication}`

    const clinicalCase = await db.clinicalCase.create({
      data: {
        projectId: params.projectId,
        title: caseTitle,
        indication,
        complexity: complexity as CaseComplexity,
        educationalObjective,
        targetAudience,
        language: language || 'es',
        content: generationResult.content,
        status: CaseStatus.DRAFT,
        validated: true,
      },
    })

    return successResponse(
      {
        id: clinicalCase.id,
        title: clinicalCase.title,
        indication: clinicalCase.indication,
        complexity: clinicalCase.complexity,
        status: clinicalCase.status,
        educationalObjective: clinicalCase.educationalObjective,
        targetAudience: clinicalCase.targetAudience,
        createdAt: clinicalCase.createdAt,
        message: 'Caso clínico generado exitosamente',
        generation: {
          tokensUsed: generationResult.tokensUsed,
          processingTimeMs: generationResult.processingTimeMs,
        },
      },
      201
    )
  } catch (error) {
    console.error('Error generating case:', error)
    return errorResponse('Error al generar caso clínico', 500)
  }
}
