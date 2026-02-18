import { DocumentType, ParsingStatus } from './common'

export interface Document {
  id: string
  projectId: string
  type: DocumentType
  title: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  version?: string
  uploadedAt: Date
  parsed: boolean
  parsedData?: Record<string, unknown>
  parsingStatus: ParsingStatus
  parsingError?: string
  metadata?: Record<string, unknown>
}

// Request/Response DTOs
export interface UploadDocumentRequest {
  type: DocumentType
  title: string
  version?: string
  metadata?: Record<string, unknown>
  file: File
}

export interface ParseDocumentRequest {
  documentId: string
}

export interface UpdateDocumentRequest {
  title?: string
  version?: string
  parsedData?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

// Parsed Data Structures
export interface FichaTecnicaParsed {
  nombreComercial: string
  principioActivo: string
  formaFarmaceutica?: string
  concentracion?: string
  indicaciones?: Array<{
    indicacion: string
    poblacion?: string
    lineaTratamiento?: string
  }>
  posologia?: Record<string, unknown>
  contraindicaciones?: {
    absolutas?: string[]
    relativas?: string[]
  }
  advertenciasYPrecauciones?: string[]
  interacciones?: Array<{
    medicamento: string
    efecto: string
    recomendacion: string
  }>
  reaccionesAdversas?: Array<{
    reaccion: string
    frecuencia: string
    gravedad?: string
  }>
}

export interface EstudioClinicoP arsed {
  title: string
  citation?: string
  design?: Record<string, unknown>
  population?: Record<string, unknown>
  interventions?: Record<string, unknown>
  endpoints?: Record<string, unknown>
  keyResults?: Record<string, unknown>
  conclusions?: string
}

export interface GuiaClinicaParsed {
  title: string
  organization?: string
  year?: number
  recommendations?: Array<{
    indication: string
    recommendation: string
    evidenceLevel?: string
    notes?: string
  }>
}
