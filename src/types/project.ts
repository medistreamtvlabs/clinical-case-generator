import { ProjectStatus } from './common'

export interface Project {
  id: string
  name: string
  description?: string
  productName: string
  activeIngredient?: string
  therapeuticAreas: string[]
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
}

export interface ProjectWithStats extends Project {
  stats: {
    documentsCount: number
    casesCount: number
  }
}

export interface ProjectConfiguration {
  id: string
  projectId: string
  mainIndications: string[]
  targetAudiences: string[]
  availableLanguages: string[]
  systemPrompt?: string
  caseTemplates?: Record<string, unknown>
  allowOffLabel: boolean
  requireMedicalReview: boolean
  aiModel: string
  temperature: number
  maxTokens: number
  updatedAt: Date
}

// Request/Response DTOs
export interface CreateProjectRequest {
  name: string
  description?: string
  productName: string
  activeIngredient?: string
  therapeuticAreas: string[]
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  status?: ProjectStatus
}

export interface UpdateProjectConfigRequest {
  mainIndications?: string[]
  targetAudiences?: string[]
  availableLanguages?: string[]
  systemPrompt?: string
  caseTemplates?: Record<string, unknown>
  allowOffLabel?: boolean
  requireMedicalReview?: boolean
  temperature?: number
  maxTokens?: number
}
