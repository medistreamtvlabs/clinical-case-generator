/**
 * Document detail routes: GET, PATCH, DELETE
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateDocumentSchema } from '@/lib/validators/document-validators'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/utils/api-helpers'

/**
 * GET /api/projects/[projectId]/documents/[documentId]
 * Get document details with parsing status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; documentId: string } }
) {
  try {
    const document = await db.document.findFirst({
      where: {
        id: params.documentId,
        projectId: params.projectId,
      },
    })

    if (!document) {
      return errorResponse('Documento no encontrado', 404)
    }

    return successResponse({
      id: document.id,
      title: document.title,
      type: document.type,
      filename: document.filename,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      parsingStatus: document.parsingStatus,
      version: document.version,
      metadata: document.metadata,
      parsedData: document.parsedData,
      errorMessage: document.errorMessage,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching document:', error)
    return errorResponse('Error al obtener documento', 500)
  }
}

/**
 * PATCH /api/projects/[projectId]/documents/[documentId]
 * Update document metadata (not the file itself)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string; documentId: string } }
) {
  try {
    const document = await db.document.findFirst({
      where: {
        id: params.documentId,
        projectId: params.projectId,
      },
    })

    if (!document) {
      return errorResponse('Documento no encontrado', 404)
    }

    const body = await request.json()

    // Validate with schema
    const validation = updateDocumentSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(
        validation.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
      )
    }

    // Build update data
    const updateData: any = {}
    if (validation.data.title !== undefined) updateData.title = validation.data.title
    if (validation.data.version !== undefined) updateData.version = validation.data.version
    if (validation.data.metadata !== undefined) updateData.metadata = validation.data.metadata

    // Update document
    const updatedDocument = await db.document.update({
      where: { id: params.documentId },
      data: updateData,
    })

    return successResponse({
      id: updatedDocument.id,
      title: updatedDocument.title,
      type: updatedDocument.type,
      filename: updatedDocument.filename,
      version: updatedDocument.version,
      metadata: updatedDocument.metadata,
      parsingStatus: updatedDocument.parsingStatus,
      updatedAt: updatedDocument.updatedAt,
      message: 'Documento actualizado',
    })
  } catch (error) {
    console.error('Error updating document:', error)
    return errorResponse('Error al actualizar documento', 500)
  }
}

/**
 * DELETE /api/projects/[projectId]/documents/[documentId]
 * Delete a document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; documentId: string } }
) {
  try {
    const document = await db.document.findFirst({
      where: {
        id: params.documentId,
        projectId: params.projectId,
      },
    })

    if (!document) {
      return errorResponse('Documento no encontrado', 404)
    }

    // Delete document
    await db.document.delete({
      where: { id: params.documentId },
    })

    return successResponse(
      { id: params.documentId, message: 'Documento eliminado' },
      200
    )
  } catch (error) {
    console.error('Error deleting document:', error)
    return errorResponse('Error al eliminar documento', 500)
  }
}
