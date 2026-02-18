import { CaseComplexity, CaseStatus, ValidationResult } from './common'

export interface ClinicalCase {
  id: string
  projectId: string
  title: string
  indication: string
  complexity: CaseComplexity
  educationalObjective: string
  targetAudience: string
  language: string
  content: CaseContent
  status: CaseStatus
  validated: boolean
  validationResults?: ValidationResult
  views: number
  downloads: number
  rating?: number
  ratingCount: number
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  reviewedBy?: string
  reviewedAt?: Date
  publishedAt?: Date
}

export interface CaseContent {
  presentation?: {
    demographics?: {
      age?: number
      sex?: string
      occupation?: string
    }
    chiefComplaint?: string
    historyOfPresentIllness?: string
    pastMedicalHistory?: string[]
    medications?: Array<{
      name: string
      dose: string
      frequency: string
    }>
    allergies?: string[]
    familyHistory?: string
    socialHistory?: string
  }
  clinicalData?: {
    physicalExamination?: string
    vitalSigns?: Record<string, unknown>
    laboratoryResults?: Array<{
      test: string
      result: string
      unit?: string
      referenceRange?: string
    }>
    otherTests?: Array<{
      test: string
      result: string
    }>
  }
  clinicalQuestion?: {
    question: string
    options?: Array<{
      id: string
      text: string
      isCorrect: boolean
    }>
    correctAnswer?: string
    explanation?: string
    references?: Array<{
      type: string
      section: string
      quote?: string
    }>
  }
  educationalNotes?: {
    keyPoints?: string[]
    commonMistakes?: string[]
    clinicalTips?: string[]
  }
}

export interface CaseComment {
  id: string
  caseId: string
  content: string
  author: string
  createdAt: Date
}

// Request/Response DTOs
export interface GenerateCaseRequest {
  indication: string
  complexity: CaseComplexity
  educationalObjective: string
  targetAudience: string
  language?: string
  additionalRequirements?: {
    includeComorbidity?: boolean
    includeInteraction?: boolean
    specificScenario?: string
    [key: string]: unknown
  }
}

export interface UpdateCaseRequest {
  title?: string
  content?: Partial<CaseContent>
  status?: CaseStatus
  validated?: boolean
}

export interface RateCaseRequest {
  rating: number
  feedback?: string
}

export interface AddCommentRequest {
  content: string
  author: string
}
