// App Configuration Constants

export const APP_NAME = 'Clinical Case Generator'
export const APP_DESCRIPTION = 'Plataforma para generación automática de casos clínicos educativos'
export const APP_VERSION = '0.1.0'

// File Upload Configuration
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
export const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / (1024 * 1024)
export const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
export const ALLOWED_EXTENSIONS = ['.pdf', '.docx']
export const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
export const API_TIMEOUT = 30000 // 30 seconds

// Claude AI Configuration
export const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929'
export const CLAUDE_DEFAULT_TEMPERATURE = 0.7
export const CLAUDE_DEFAULT_MAX_TOKENS = 4000
export const CLAUDE_TIMEOUT = 120000 // 2 minutes

// Case Generation Configuration
export const CASE_COMPLEXITIES = ['BASIC', 'INTERMEDIATE', 'ADVANCED'] as const
export const CASE_STATUSES = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] as const
export const DEFAULT_LANGUAGE = 'es'

// Document Types
export const DOCUMENT_TYPES_ARRAY = [
  'FICHA_TECNICA',
  'ESTUDIO_CLINICO',
  'GUIA_CLINICA',
  'CASO_REFERENCIA',
  'CONTEXTO_CLINICO',
  'COMPETENCIA',
] as const

export const DOCUMENT_TYPES: Record<string, string> = {
  FICHA_TECNICA: 'Ficha Técnica',
  ESTUDIO_CLINICO: 'Estudio Clínico',
  GUIA_CLINICA: 'Guía Clínica',
  CASO_REFERENCIA: 'Caso de Referencia',
  CONTEXTO_CLINICO: 'Contexto Clínico',
  COMPETENCIA: 'Competencia',
}

// Parsing Status Labels
export const PARSING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'Procesando',
  COMPLETED: 'Completado',
  FAILED: 'Error',
  NEEDS_REVIEW: 'Requiere revisión',
}

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Error Messages
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: `El archivo debe ser menor a ${MAX_FILE_SIZE_MB}MB`,
  INVALID_FILE_TYPE: 'Solo se permiten archivos PDF y DOCX',
  FILE_UPLOAD_FAILED: 'Error al cargar el archivo',
  PARSING_FAILED: 'Error al procesar el documento',
  GENERATION_FAILED: 'Error al generar el caso clínico',
  VALIDATION_FAILED: 'Error al validar el caso',
  UNAUTHORIZED: 'No tienes permiso para realizar esta acción',
  NOT_FOUND: 'Recurso no encontrado',
  SERVER_ERROR: 'Error del servidor. Por favor intenta más tarde.',
}

// Success Messages
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'Archivo cargado exitosamente',
  PARSING_COMPLETED: 'Documento procesado exitosamente',
  CASE_GENERATED: 'Caso clínico generado exitosamente',
  CASE_VALIDATED: 'Caso validado',
  PROJECT_CREATED: 'Proyecto creado exitosamente',
  PROJECT_UPDATED: 'Proyecto actualizado exitosamente',
  PROJECT_DELETED: 'Proyecto eliminado exitosamente',
}

// Validation Rules
export const VALIDATION_RULES = {
  PROJECT_NAME_MIN: 3,
  PROJECT_NAME_MAX: 100,
  CASE_TITLE_MIN: 10,
  CASE_TITLE_MAX: 200,
}

// Therapeutic Areas (Common examples)
export const THERAPEUTIC_AREAS = [
  'Oncología',
  'Hematología',
  'Cardiología',
  'Neurología',
  'Endocrinología',
  'Neumología',
  'Gastroenterología',
  'Nefrología',
  'Reumatología',
  'Infectología',
]

// Target Audiences
export const TARGET_AUDIENCES = [
  'Hematólogos',
  'Oncólogos médicos',
  'Residentes',
  'Médicos de atención primaria',
  'Enfermeras',
  'Farmacéuticos',
  'Estudiantes de medicina',
]

// Educational Objectives
export const EDUCATIONAL_OBJECTIVES = [
  'Diagnóstico',
  'Tratamiento',
  'Manejo de efectos adversos',
  'Interacciones medicamentosas',
  'Poblaciones especiales',
  'Monitorización',
  'Reconocimiento de fallo de tratamiento',
  'Ajuste de dosis',
]
