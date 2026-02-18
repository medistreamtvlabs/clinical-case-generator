import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import type { ApiResponse, ApiErrorResponse } from '@/types/api'

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } as ApiResponse<T>,
    { status }
  )
}

/**
 * Create a success response for lists
 */
export function listResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit)
  return NextResponse.json(
    {
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages,
      },
    },
    { status: 200 }
  )
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: string | Error,
  status = 400,
  details?: Record<string, unknown>
) {
  const message = error instanceof Error ? error.message : error
  const requestId = generateRequestId()

  return NextResponse.json(
    {
      success: false,
      error: getErrorCode(status),
      message,
      details,
      requestId,
    } as ApiErrorResponse,
    { status }
  )
}

/**
 * Handle Zod validation errors
 */
export function validationErrorResponse(error: ZodError) {
  const details: Record<string, unknown> = {}
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    details[path] = err.message
  })

  return NextResponse.json(
    {
      success: false,
      error: 'Validation Error',
      message: 'Los datos proporcionados no son válidos',
      details,
    },
    { status: 400 }
  )
}

/**
 * Handle database errors
 */
export function handleDatabaseError(error: unknown) {
  console.error('Database error:', error)

  if (error instanceof Error) {
    // Prisma specific errors
    if ('code' in error) {
      if ((error as any).code === 'P2025') {
        return errorResponse('Recurso no encontrado', 404)
      }
      if ((error as any).code === 'P2002') {
        return errorResponse('Este registro ya existe', 409)
      }
    }
    return errorResponse(error.message, 500)
  }

  return errorResponse('Error desconocido en la base de datos', 500)
}

/**
 * Handle Claude API errors
 */
export function handleClaudeError(error: unknown) {
  console.error('Claude API error:', error)

  if (error instanceof Error) {
    if (error.message.includes('rate_limit')) {
      return errorResponse('Límite de tasa excedido. Intenta más tarde.', 429)
    }
    if (error.message.includes('timeout')) {
      return errorResponse('La solicitud tardó demasiado', 504)
    }
    return errorResponse(error.message, 503)
  }

  return errorResponse('Error desconocido con Claude API', 503)
}

/**
 * Get HTTP error code as string
 */
function getErrorCode(status: number): string {
  const codes: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  }
  return codes[status] || 'Error'
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}
