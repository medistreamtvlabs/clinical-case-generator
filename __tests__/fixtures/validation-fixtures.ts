import { ValidationReport, ValidationIssue } from '@/lib/services/case-validation'

/**
 * Mock validation report data for testing
 * Provides fixtures for validation testing scenarios
 */

export const mockValidationIssues: ValidationIssue[] = [
  {
    field: 'presentationOfCase.patientDemographics.age',
    message: 'Age must be between 0 and 120',
    severity: 'error',
    suggestedFix: 'Provide a valid age value',
  },
  {
    field: 'content.clinicalExamination.vitalSigns.bloodPressure.systolic',
    message: 'Systolic BP exceeds normal range for validation',
    severity: 'warning',
    suggestedFix: 'Verify blood pressure reading is correct',
  },
  {
    field: 'educationalContent.keyPoints',
    message: 'Could include more detailed educational points',
    severity: 'suggestion',
    suggestedFix: 'Add 3-5 key points for better educational value',
  },
]

export const mockValidValidationReport: ValidationReport = {
  caseId: 'case-001',
  overallScore: 90,
  completenessScore: 92,
  educationalQualityScore: 88,
  medicalAccuracyScore: 90,
  isValid: true,
  errors: [],
  warnings: [],
  suggestions: [
    {
      field: 'educationalContent',
      message: 'Consider adding more patient education materials',
      suggestedFix: 'Add diagrams or simplified explanations',
    },
  ],
  timestamp: new Date('2024-01-15'),
  validatedAt: new Date('2024-01-15'),
}

export const mockWarningsValidationReport: ValidationReport = {
  caseId: 'case-002',
  overallScore: 72,
  completenessScore: 80,
  educationalQualityScore: 70,
  medicalAccuracyScore: 68,
  isValid: true,
  errors: [],
  warnings: [
    {
      field: 'diagnosticWorkup.laboratoryTests',
      message: 'Some lab values are outside typical ranges',
      suggestedFix: 'Verify all laboratory values are clinically appropriate',
    },
    {
      field: 'content.assessment',
      message: 'Assessment could be more detailed',
      suggestedFix: 'Include differential diagnosis discussion',
    },
  ],
  suggestions: [
    {
      field: 'clinicalExamination',
      message: 'Add more physical examination findings',
      suggestedFix: 'Include documentation of all relevant systems',
    },
  ],
  timestamp: new Date('2024-01-15'),
  validatedAt: new Date('2024-01-15'),
}

export const mockErrorsValidationReport: ValidationReport = {
  caseId: 'case-003',
  overallScore: 45,
  completenessScore: 40,
  educationalQualityScore: 45,
  medicalAccuracyScore: 50,
  isValid: false,
  errors: [
    {
      field: 'presentationOfCase.mainComplaint',
      message: 'Main complaint is required and cannot be empty',
      suggestedFix: 'Provide a clear description of the main complaint',
    },
    {
      field: 'content.clinicalExamination.vitalSigns',
      message: 'Vital signs are incomplete or missing critical values',
      suggestedFix: 'Ensure all vital signs (BP, HR, RR, Temp) are present',
    },
    {
      field: 'diagnosticWorkup.imaging',
      message: 'Diagnostic imaging findings are missing',
      suggestedFix: 'Include relevant imaging studies (ECG, CXR, CT, MRI, etc.)',
    },
  ],
  warnings: [
    {
      field: 'educationalContent',
      message: 'Educational objectives are not clearly defined',
      suggestedFix: 'Specify learning objectives for the case',
    },
  ],
  suggestions: [],
  timestamp: new Date('2024-01-15'),
  validatedAt: new Date('2024-01-15'),
}

export const mockPartialScoreReport: ValidationReport = {
  caseId: 'case-004',
  overallScore: 65,
  completenessScore: 70,
  educationalQualityScore: 65,
  medicalAccuracyScore: 60,
  isValid: true,
  errors: [],
  warnings: [
    {
      field: 'content.plan',
      message: 'Treatment plan could include more detail on medication dosing',
      suggestedFix: 'Add specific doses, frequencies, and duration',
    },
  ],
  suggestions: [
    {
      field: 'clinicalExamination',
      message: 'Expand physical examination to include more systems',
      suggestedFix: 'Add findings for skin, lymph nodes, abdomen',
    },
  ],
  timestamp: new Date('2024-01-15'),
  validatedAt: new Date('2024-01-15'),
}

export const mockExcellentScoreReport: ValidationReport = {
  caseId: 'case-005',
  overallScore: 97,
  completenessScore: 98,
  educationalQualityScore: 96,
  medicalAccuracyScore: 97,
  isValid: true,
  errors: [],
  warnings: [],
  suggestions: [],
  timestamp: new Date('2024-01-15'),
  validatedAt: new Date('2024-01-15'),
}

// Report for each score range for testing UI display

export const mockExcellentReport = mockValidValidationReport // 90+

export const mockGoodReport: ValidationReport = {
  ...mockWarningsValidationReport,
  overallScore: 80,
  completenessScore: 82,
  educationalQualityScore: 78,
  medicalAccuracyScore: 80,
}

export const mockAcceptableReport: ValidationReport = {
  ...mockPartialScoreReport,
  overallScore: 68,
  completenessScore: 70,
  educationalQualityScore: 68,
  medicalAccuracyScore: 65,
}

export const mockNeedsWorkReport: ValidationReport = {
  caseId: 'case-006',
  overallScore: 52,
  completenessScore: 50,
  educationalQualityScore: 52,
  medicalAccuracyScore: 55,
  isValid: true,
  errors: [],
  warnings: [
    {
      field: 'content.presentationOfCase',
      message: 'Patient demographics are incomplete',
      suggestedFix: 'Add missing demographic information',
    },
    {
      field: 'content.diagnosticWorkup',
      message: 'Several diagnostic tests are missing',
      suggestedFix: 'Include all relevant diagnostic findings',
    },
  ],
  suggestions: [
    {
      field: 'content.plan',
      message: 'Follow-up plan is not detailed',
      suggestedFix: 'Specify follow-up appointments and monitoring',
    },
  ],
  timestamp: new Date('2024-01-15'),
  validatedAt: new Date('2024-01-15'),
}

export const mockInsufficientReport: ValidationReport = {
  caseId: 'case-007',
  overallScore: 28,
  completenessScore: 25,
  educationalQualityScore: 30,
  medicalAccuracyScore: 28,
  isValid: false,
  errors: [
    {
      field: 'content',
      message: 'Case content is too minimal to be clinically useful',
      suggestedFix: 'Significantly expand all sections of the case',
    },
    {
      field: 'presentationOfCase',
      message: 'Case presentation is incomplete or incoherent',
      suggestedFix: 'Provide comprehensive patient presentation',
    },
    {
      field: 'clinicalExamination',
      message: 'Clinical examination findings are missing',
      suggestedFix: 'Add detailed physical examination findings',
    },
  ],
  warnings: [
    {
      field: 'educationalContent',
      message: 'No clear educational value identified',
      suggestedFix: 'Define educational objectives and key learning points',
    },
  ],
  suggestions: [],
  timestamp: new Date('2024-01-15'),
  validatedAt: new Date('2024-01-15'),
}

export const mockReportsByScore = {
  excellent: mockExcellentReport,
  good: mockGoodReport,
  acceptable: mockAcceptableReport,
  needsWork: mockNeedsWorkReport,
  insufficient: mockInsufficientReport,
}
