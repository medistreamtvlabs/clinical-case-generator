/**
 * Mock API request and response data for testing
 * Provides fixtures for API endpoint testing
 */

export const mockSuccessResponse = {
  success: true,
  data: {
    id: 'case-001',
    title: 'Hipertensión Arterial - Caso Clínico',
    status: 'DRAFT',
  },
  message: 'Operation completed successfully',
}

export const mockErrorResponse = {
  success: false,
  error: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An error occurred while processing your request',
  },
  timestamp: new Date().toISOString(),
}

export const mockValidationErrorResponse = {
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Request validation failed',
    details: [
      {
        field: 'validationScore',
        message: 'Validation score must be a number between 0 and 100',
      },
      {
        field: 'comments',
        message: 'Comments must not exceed 1000 characters',
      },
    ],
  },
  timestamp: new Date().toISOString(),
}

export const mockNotFoundResponse = {
  success: false,
  error: {
    code: 'NOT_FOUND',
    message: 'The requested resource was not found',
  },
  timestamp: new Date().toISOString(),
}

export const mockUnauthorizedResponse = {
  success: false,
  error: {
    code: 'UNAUTHORIZED',
    message: 'You do not have permission to perform this action',
  },
  timestamp: new Date().toISOString(),
}

export const mockConflictResponse = {
  success: false,
  error: {
    code: 'CONFLICT',
    message: 'Invalid status transition',
    details: {
      currentStatus: 'PUBLISHED',
      requestedStatus: 'IN_REVIEW',
      reason: 'Cannot return published cases to review',
    },
  },
  timestamp: new Date().toISOString(),
}

export const mockHttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
}

export const mockApiHeaders = {
  'Content-Type': 'application/json',
  'X-Request-ID': 'req-001',
  'X-Response-Time': '123ms',
}

export const mockMultipartFormData = new FormData()
mockMultipartFormData.append('file', new Blob(['test'], { type: 'application/pdf' }), 'test.pdf')
mockMultipartFormData.append('projectId', 'project-001')

export const mockPaginatedResponse = {
  success: true,
  data: [
    { id: 'case-001', title: 'Case 1' },
    { id: 'case-002', title: 'Case 2' },
    { id: 'case-003', title: 'Case 3' },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 3,
    pages: 1,
  },
}

export const mockBatchErrorResponse = {
  success: false,
  errors: [
    { caseId: 'case-001', error: 'Case not found' },
    { caseId: 'case-002', error: 'Invalid validation score' },
  ],
  successful: ['case-003'],
  summary: {
    total: 3,
    successful: 1,
    failed: 2,
  },
}

export const mockExportResponse = {
  success: true,
  data: {
    format: 'json',
    fileSize: 15234,
    downloadUrl: '/api/download/export-001.json',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  message: 'Export ready for download',
}

export const mockStreamResponse = {
  ok: true,
  status: 200,
  headers: new Headers({
    'content-type': 'application/octet-stream',
    'content-disposition': 'attachment; filename="case.pdf"',
  }),
  body: new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array([1, 2, 3]))
      controller.close()
    },
  }),
}

export const mockWebSocketMessage = {
  type: 'case.updated',
  data: {
    caseId: 'case-001',
    status: 'PUBLISHED',
    timestamp: new Date().toISOString(),
  },
}

export const mockCsrfToken = {
  token: 'csrf-token-12345abcde',
  timestamp: Date.now(),
}

export const mockRateLimitHeaders = {
  'x-ratelimit-limit': '100',
  'x-ratelimit-remaining': '45',
  'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
}

export const mockAuthToken = {
  accessToken: 'access-token-12345',
  refreshToken: 'refresh-token-67890',
  expiresIn: 3600,
  tokenType: 'Bearer',
}

export const mockCacheHeaders = {
  'cache-control': 'public, max-age=3600',
  etag: '"abc123"',
  'last-modified': 'Wed, 01 Jan 2024 00:00:00 GMT',
}

export const mockApiError = {
  name: 'APIError',
  message: 'Failed to fetch data from API',
  status: 500,
  statusText: 'Internal Server Error',
  response: {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Database connection failed',
    },
  },
}

export const mockTimeoutError = {
  name: 'TimeoutError',
  message: 'Request timeout after 30 seconds',
}

export const mockNetworkError = {
  name: 'NetworkError',
  message: 'Network request failed',
  cause: 'Unable to resolve DNS',
}

export const mockRetryConfig = {
  maxRetries: 3,
  backoffMultiplier: 2,
  initialDelayMs: 100,
  maxDelayMs: 5000,
}
