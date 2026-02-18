// API Request/Response Types

export interface ApiErrorResponse {
  error: string
  message: string
  details?: Record<string, unknown>
  requestId?: string
}

export interface ListResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
  services: {
    database: 'connected' | 'disconnected'
    claudeApi: 'available' | 'unavailable'
    fileStorage: 'ok' | 'error'
  }
}

// Common Query Parameters
export interface ListQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: unknown
}

// Validation Errors
export interface ValidationError {
  field: string
  message: string
  code?: string
}
