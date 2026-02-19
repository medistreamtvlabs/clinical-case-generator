/**
 * Parse document route: POST to trigger parsing
 */
import { db } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/utils/api-helpers'
import { ParsingStatus } from '@prisma/client'
/**
 * POST /api/projects/[projectId]/documents/[documentId]/parse
 * Trigger document parsing with Claude AI
 * Note: In production, this should be queued as a background job
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; documentId: string } }
) {
  try {
    // Find document
    const document = await db.document.findFirst({
      where: {
        id: params.documentId,
        projectId: params.projectId,
      },
    })
    if (!document) {
      return errorResponse('Documento no encontrado', 404)
    }
    // Update status to PROCESSING
    await db.document.update({
      where: { id: params.documentId },
      data: {
        parsingStatus: ParsingStatus.PROCESSING,
        errorMessage: null,
      },
    })
    // TODO: In production, queue this as a background job
    // For now, parse synchronously (not recommended for large files)
    // This would timeout if document is large or parsing takes too long
    // For demo purposes, simulate parsing
    // In production: integrate with pdf-parse, mammoth, and actually parse the file
    const mockParsedData = {
      status: 'parsing_queued',
      message: 'Documento en cola para procesamiento',
      estimatedTime: '2-5 minutos',
      nextSteps: 'El sistema procesará el documento y extraerá la información automáticamente',
    }
    // Update document with queued status
    const updatedDocument = await db.document.update({
      where: { id: params.documentId },
      data: {
        parsingStatus: ParsingStatus.PROCESSING,
        metadata: {
          ...(document.metadata as any),
          queuedAt: new Date().toISOString(),
        },
      },
    })
    return successResponse(
      {
        id: updatedDocument.id,
        title: updatedDocument.title,
        parsingStatus: updatedDocument.parsingStatus,
        message: 'Documento en procesamiento. Recibirás notificación cuando esté listo.',
        queuedData: mockParsedData,
      },
      202
    )
  } catch (error) {
    console.error('Error queuing document for parsing:', error)
    // Update document with error
    try {
      await db.document.update({
        where: { id: params.documentId },
        data: {
          parsingStatus: ParsingStatus.FAILED,
          errorMessage: 'Error al procesar documento',
        },
      })
    } catch {
      // Ignore update errors
    }
    return errorResponse('Error al procesar documento', 500)
  }
}
