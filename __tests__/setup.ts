import { expect, afterEach, vi } from 'vitest'
import '@testing-library/jest-dom'

/**
 * Global test setup for FASE 5 test suite
 * Sets up mocks, global configurations, and test utilities
 */

// ============================================================================
// PRISMA CLIENT MOCK
// ============================================================================

vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    clinicalCase: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    caseComment: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    document: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    projectConfiguration: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    exportHistory: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  }

  return {
    PrismaClient: vi.fn(() => mockPrismaClient),
    mockPrismaClient,
  }
})

// ============================================================================
// PRISMA CONTEXT (SINGLETON)
// ============================================================================

vi.mock('@/lib/prisma', () => ({
  prisma: {
    clinicalCase: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    caseComment: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
    },
    document: {
      findMany: vi.fn(),
    },
    projectConfiguration: {
      findUnique: vi.fn(),
    },
    exportHistory: {
      create: vi.fn(),
    },
  },
}))

// ============================================================================
// NEXT.JS ROUTER MOCK
// ============================================================================

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    query: {},
    pathname: '/',
    asPath: '/',
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  }),
}))

// ============================================================================
// NEXT/NAVIGATION MOCK (For App Router)
// ============================================================================

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// ============================================================================
// FETCH API MOCK
// ============================================================================

global.fetch = vi.fn()

// ============================================================================
// GLOBAL TEST UTILITIES
// ============================================================================

export const resetMocks = () => {
  vi.clearAllMocks()
}

export const mockFetch = (response: any, status = 200) => {
  ;(global.fetch as any).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValueOnce(response),
    text: vi.fn().mockResolvedValueOnce(JSON.stringify(response)),
  })
}

export const mockFetchError = (error: string) => {
  ;(global.fetch as any).mockRejectedValueOnce(new Error(error))
}

// ============================================================================
// AFTEREACH CLEANUP
// ============================================================================

afterEach(() => {
  resetMocks()
})

// ============================================================================
// CONSOLE SUPPRESSION FOR TESTS
// ============================================================================

// Suppress console errors and warnings during tests for cleaner output
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = vi.fn()
  console.warn = vi.fn()
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})

// ============================================================================
// CUSTOM MATCHERS
// ============================================================================

expect.extend({
  toBeValidScore(received: any) {
    const pass = typeof received === 'number' && received >= 0 && received <= 100
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid score (0-100)`
          : `Expected ${received} to be a valid score (0-100)`,
    }
  },
  toBeValidCaseStatus(received: any) {
    const validStatuses = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']
    const pass = validStatuses.includes(received)
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid case status`
          : `Expected ${received} to be one of: ${validStatuses.join(', ')}`,
    }
  },
  toBeValidComplexity(received: any) {
    const validComplexities = ['BASIC', 'INTERMEDIATE', 'ADVANCED']
    const pass = validComplexities.includes(received)
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid complexity`
          : `Expected ${received} to be one of: ${validComplexities.join(', ')}`,
    }
  },
})

// ============================================================================
// TYPE AUGMENTATION FOR CUSTOM MATCHERS
// ============================================================================

declare global {
  namespace Vi {
    interface Matchers<R> {
      toBeValidScore(): R
      toBeValidCaseStatus(): R
      toBeValidComplexity(): R
    }
  }
}
