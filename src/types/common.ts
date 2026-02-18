// Common Types and Enums

export enum ProjectStatus {
  SETUP = 'SETUP',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum DocumentType {
  FICHA_TECNICA = 'FICHA_TECNICA',
  ESTUDIO_CLINICO = 'ESTUDIO_CLINICO',
  GUIA_CLINICA = 'GUIA_CLINICA',
  CASO_REFERENCIA = 'CASO_REFERENCIA',
  CONTEXTO_CLINICO = 'CONTEXTO_CLINICO',
  COMPETENCIA = 'COMPETENCIA',
}

export enum ParsingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
}

export enum CaseComplexity {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum CaseStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ValidationIssue {
  field: string
  message: string
  severity: 'error' | 'warning'
  reference?: string
}

export interface ValidationResult {
  isValid: boolean
  score: number
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}
