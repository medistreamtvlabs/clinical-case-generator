/**
 * Document routes: GET documents, POST new document
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { uploadDocumentSchema, fileValidationSchema } from '@/lib/validators/document-validators'
import { validateFileType, validateFileSize, validateFileExtension, sanitizeFilename } from '@/lib/utils/file-utils'
import { successResponse, listResponse, errorResponse, validationErrorResponse } from '@/lib/utils/api-helpers'
import { ParsingStatus } from '@prisma/client'

/**
 * GET /api/projects/[projectId]/documents
 * Get all documents for a project with pagination and filtering
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    // Validate project exists
    const project = await db.project.findUnique({
      where: { id: params.projectId },
    })

    if (!project) {
      return errorResponse('Proyecto no encontrado', 404)
    }

    // Build filter
    const where: any = { projectId: params.projectId }
    if (type) where.type = type
    if (status) where.parsingStatus = status

    // Get total count
    const total = await db.document.count({ where })

    // Get documents
    const documents = await db.document.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        filename: true,
        fileSize: true,
        parsingStatus: true,
        createdAt: true,
        updatedAt: true,
        version: true,
      },
    })

    return listResponse(documents, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return errorResponse('Error al obtener documentos', 500)
  }
}

/**
 * POST /api/projects/[projectId]/documents
 * Upload a new document
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    // Validate project exists
    const project = await db.project.findUnique({
      where: { id: params.projectId },
    })

    if (!project) {
      return errorResponse('Proyecto no encontrado', 404)
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null
    const type = formData.get('type') as string | null
    const version = formData.get('version') as string | null
    const metadata = formData.get('metadata') as string | null

    if (!file || !title || !type) {
      return validationErrorResponse([
        { field: 'file', message: 'Archivo requerido' },
        { field: 'title', message: 'Título requerido' },
        { field: 'type', message: 'Tipo de documento requerido' },
      ])
    }

    // Validate with schema
    const validationData = {
      title,
      type,
      version: version || undefined,
      metadata: metadata ? JSON.parse(metadata) : undefined,
    }

    const validation = uploadDocumentSchema.safeParse(validationData)
    if (!validation.success) {
      return validationErrorResponse(
        validation.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
      )
    }

    // Validate file
    const buffer = Buffer.from(await file.arrayBuffer())

    if (!validateFileSize(buffer.length)) {
      return validationErrorResponse([
        { field: 'file', message: `Archivo muy grande. Máximo: 10MB` },
      ])
    }

    if (!validateFileType(file.type)) {
      return validationErrorResponse([
        { field: 'file', message: 'Tipo de archivo no permitido' },
      ])
    }

    if (!validateFileExtension(file.name)) {
      return validationErrorResponse([
        { field: 'file', message: 'Extensión de archivo no permitida' },
      ])
    }

    // Create document record
    const sanitizedFilename = sanitizeFilename(file.name)

    const document = await db.document.create({
      data: {
        projectId: params.projectId,
        title: validation.data.title,
        type: validation.data.type,
        filename: sanitizedFilename,
        fileSize: buffer.length,
        mimeType: file.type,
        parsingStatus: ParsingStatus.PENDING,
        version: validation.data.version || '1.0',
        metadata: validation.data.metadata || {},
      },
    })

    // TODO: Queue document for parsing (in background job/queue)
    // For now, return success response with parsing status
    // In production: emit to job queue (Bull, RabbitMQ, etc.)

    return successResponse(
      {
        id: document.id,
        title: document.title,
        type: document.type,
        filename: document.filename,
        fileSize: document.fileSize,
        parsingStatus: document.parsingStatus,
        createdAt: document.createdAt,
        message: 'Documento subido. Procesamiento iniciado.',
      },
      201
    )
  } catch (error) {
    console.error('Error uploading document:', error)
    return errorResponse('Error al subir documento', 500)
  }
}
