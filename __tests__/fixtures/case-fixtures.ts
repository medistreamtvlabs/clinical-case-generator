import { ClinicalCase, CaseContent } from '@/types/case'

/**
 * Mock clinical case data for testing
 * Provides fixtures for various test scenarios
 */

export const mockCaseContent: CaseContent = {
  presentationOfCase: {
    patientDemographics: {
      age: 65,
      gender: 'M',
      weight: 75,
      height: 180,
    },
    mainComplaint: 'Hipertensión arterial no controlada',
    historyOfPresentIllness: 'Paciente de 65 años con diagnóstico de hipertensión arterial desde hace 10 años...',
    pastMedicalHistory: ['Diabetes tipo 2', 'Obesidad'],
    medications: ['Losartán 50 mg', 'Hidroclorotiazida 25 mg'],
  },
  clinicalExamination: {
    vitalSigns: {
      bloodPressure: { systolic: 160, diastolic: 100 },
      heartRate: 78,
      respiratoryRate: 16,
      temperature: 37.0,
    },
    physicalFindings: 'Paciente orientado, cardiopulmonar normal, extremidades sin edema',
  },
  diagnosticWorkup: {
    laboratoryTests: {
      creatinine: 1.1,
      potassium: 4.5,
      glucose: 145,
    },
    imaging: 'ECG normal, ecocardiografía normal',
  },
  assessment: 'Hipertensión arterial estadio 2',
  plan: 'Aumentar dosis de losartán a 100 mg',
  educationalContent: {
    keyPoints: ['Control regular de presión arterial', 'Dieta baja en sodio'],
    patientEducation: 'Explicar importancia del control de presión arterial',
  },
}

export const mockClinicalCase: ClinicalCase = {
  id: 'case-001',
  projectId: 'project-001',
  title: 'Hipertensión Arterial - Caso Clínico',
  indication: 'Hipertensión Arterial',
  complexity: 'BASIC',
  educationalObjective: 'Entender el manejo de hipertensión',
  targetAudience: 'Residentes de Medicina Interna',
  language: 'es',
  content: mockCaseContent,
  status: 'DRAFT',
  validated: false,
  validationResults: null,
  validationScore: null,
  lastValidatedAt: null,
  views: 0,
  downloads: 0,
  rating: null,
  ratingCount: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  createdBy: 'user-001',
  reviewedBy: null,
  reviewedAt: null,
  publishedAt: null,
  submittedForReviewAt: null,
  submittedForReviewBy: null,
  archivedAt: null,
  archivedBy: null,
  publishedBy: null,
}

export const mockValidatedCase: ClinicalCase = {
  ...mockClinicalCase,
  validated: true,
  validationScore: 85,
  lastValidatedAt: new Date('2024-01-15'),
  validationResults: {
    completeness: 90,
    educationalQuality: 85,
    medicalAccuracy: 95,
  },
}

export const mockSubmittedForReviewCase: ClinicalCase = {
  ...mockValidatedCase,
  status: 'IN_REVIEW',
  submittedForReviewAt: new Date('2024-01-16'),
  submittedForReviewBy: 'user-001',
}

export const mockApprovedCase: ClinicalCase = {
  ...mockValidatedCase,
  status: 'APPROVED',
  submittedForReviewAt: new Date('2024-01-16'),
  submittedForReviewBy: 'user-001',
  reviewedAt: new Date('2024-01-17'),
  reviewedBy: 'reviewer-001',
}

export const mockPublishedCase: ClinicalCase = {
  ...mockApprovedCase,
  status: 'PUBLISHED',
  publishedAt: new Date('2024-01-18'),
  publishedBy: 'reviewer-001',
}

export const mockArchivedCase: ClinicalCase = {
  ...mockClinicalCase,
  status: 'ARCHIVED',
  archivedAt: new Date('2024-01-20'),
  archivedBy: 'user-001',
}

export const mockIntermediateComplexityCase: ClinicalCase = {
  ...mockValidatedCase,
  complexity: 'INTERMEDIATE',
  title: 'Síndrome Coronario Agudo - Caso Clínico',
  indication: 'Síndrome Coronario Agudo',
  educationalObjective: 'Manejo agudo del síndrome coronario',
  validationScore: 78,
}

export const mockAdvancedComplexityCase: ClinicalCase = {
  ...mockValidatedCase,
  complexity: 'ADVANCED',
  title: 'Insuficiencia Cardíaca Avanzada - Caso Clínico',
  indication: 'Insuficiencia Cardíaca Clase IV',
  educationalObjective: 'Manejo de insuficiencia cardíaca avanzada',
  validationScore: 92,
}

export const mockLowScoreCase: ClinicalCase = {
  ...mockClinicalCase,
  validated: true,
  validationScore: 55,
  validationResults: {
    completeness: 45,
    educationalQuality: 55,
    medicalAccuracy: 65,
  },
}

export const mockCaseList = [
  mockClinicalCase,
  mockValidatedCase,
  mockSubmittedForReviewCase,
  mockApprovedCase,
  mockPublishedCase,
  mockIntermediateComplexityCase,
  mockAdvancedComplexityCase,
  mockLowScoreCase,
]
