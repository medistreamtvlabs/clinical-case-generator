'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CaseContent } from '@/types/case'
import { getCaseStatusLabel, getCaseStatusColor, getComplexityColor, formatRating } from '@/lib/utils/case-utils'

interface CaseDetailViewerProps {
  title: string
  indication: string
  complexity: string
  status: string
  educationalObjective: string
  targetAudience: string[]
  views: number
  rating: number | null
  ratingCount: number
  content: CaseContent
  createdAt: Date | string
  updatedAt: Date | string
  publishedAt?: Date | string | null
}

export function CaseDetailViewer({
  title,
  indication,
  complexity,
  status,
  educationalObjective,
  targetAudience,
  views,
  rating,
  ratingCount,
  content,
  createdAt,
  updatedAt,
  publishedAt,
}: CaseDetailViewerProps) {
  const createdDate = new Date(createdAt)
  const updatedDate = new Date(updatedAt)

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-gray-600 mt-2">{indication}</p>
          </div>
          <Badge variant={getCaseStatusColor(status)}>
            {getCaseStatusLabel(status)}
          </Badge>
        </div>

        <div className="flex gap-2 mb-4">
          <Badge variant={getComplexityColor(complexity)}>
            {complexity === 'BASIC' && 'Básico'}
            {complexity === 'INTERMEDIATE' && 'Intermedio'}
            {complexity === 'ADVANCED' && 'Avanzado'}
          </Badge>
          {targetAudience.map((audience) => (
            <Badge key={audience} variant="secondary">
              {audience}
            </Badge>
          ))}
        </div>

        <p className="text-gray-700 font-medium mb-4">{educationalObjective}</p>

        {/* Stats */}
        <div className="flex gap-6 text-sm text-gray-600">
          <div>👁️ {views} vistas</div>
          <div>⭐ {formatRating(rating, ratingCount)}</div>
          <div>📅 Creado: {createdDate.toLocaleDateString('es-ES')}</div>
          {publishedAt && (
            <div>🚀 Publicado: {new Date(publishedAt).toLocaleDateString('es-ES')}</div>
          )}
        </div>
      </div>

      {/* Presentation Section */}
      {content.presentation && (
        <Card>
          <CardHeader>
            <CardTitle>Presentación del Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Demographics */}
            {content.presentation.demographics && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Datos Demográficos</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {content.presentation.demographics.age && (
                    <div>
                      <span className="text-gray-600">Edad:</span>
                      <p className="font-medium">{content.presentation.demographics.age}</p>
                    </div>
                  )}
                  {content.presentation.demographics.sex && (
                    <div>
                      <span className="text-gray-600">Sexo:</span>
                      <p className="font-medium">
                        {content.presentation.demographics.sex === 'M' ? 'Masculino' : 'Femenino'}
                      </p>
                    </div>
                  )}
                  {content.presentation.demographics.occupation && (
                    <div>
                      <span className="text-gray-600">Ocupación:</span>
                      <p className="font-medium">{content.presentation.demographics.occupation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chief Complaint */}
            {content.presentation.chiefComplaint && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Motivo de Consulta</h4>
                <p className="text-gray-700">{content.presentation.chiefComplaint}</p>
              </div>
            )}

            {/* History of Present Illness */}
            {content.presentation.historyOfPresentIllness && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Historia de Enfermedad Actual</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {content.presentation.historyOfPresentIllness}
                </p>
              </div>
            )}

            {/* Past Medical History */}
            {content.presentation.pastMedicalHistory && content.presentation.pastMedicalHistory.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Antecedentes Patológicos</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {content.presentation.pastMedicalHistory.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Medications */}
            {content.presentation.medications && content.presentation.medications.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Medicaciones Actuales</h4>
                <div className="space-y-2">
                  {content.presentation.medications.map((med, idx) => (
                    <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                      <p className="font-medium">{med.name}</p>
                      <p className="text-gray-600">{med.dose} - {med.frequency}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allergies */}
            {content.presentation.allergies && content.presentation.allergies.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Alergias</h4>
                <div className="space-y-1">
                  {content.presentation.allergies.map((allergy, idx) => (
                    <Badge key={idx} variant="error">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Family & Social History */}
            {(content.presentation.familyHistory || content.presentation.socialHistory) && (
              <div className="grid grid-cols-2 gap-4">
                {content.presentation.familyHistory && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Historia Familiar</h4>
                    <p className="text-gray-700">{content.presentation.familyHistory}</p>
                  </div>
                )}
                {content.presentation.socialHistory && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Historia Social</h4>
                    <p className="text-gray-700">{content.presentation.socialHistory}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Clinical Data Section */}
      {content.clinicalData && (
        <Card>
          <CardHeader>
            <CardTitle>Datos Clínicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Physical Examination */}
            {content.clinicalData.physicalExamination && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Examen Físico</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {content.clinicalData.physicalExamination}
                </p>
              </div>
            )}

            {/* Vital Signs */}
            {content.clinicalData.vitalSigns && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Signos Vitales</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {Object.entries(content.clinicalData.vitalSigns).map(
                    ([key, value]) =>
                      value && (
                        <div key={key} className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600 capitalize">{key}</p>
                          <p className="font-medium">{value}</p>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}

            {/* Laboratory Results */}
            {content.clinicalData.laboratoryResults && content.clinicalData.laboratoryResults.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Resultados de Laboratorio</h4>
                <div className="space-y-2">
                  {content.clinicalData.laboratoryResults.map((result, idx) => (
                    <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium">{result.test}</span>
                        <span className="font-bold">{result.result}</span>
                      </div>
                      {result.unit && (
                        <p className="text-gray-600 text-xs">{result.unit} {result.referenceRange && `(Normal: ${result.referenceRange})`}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Tests */}
            {content.clinicalData.otherTests && content.clinicalData.otherTests.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Otras Pruebas</h4>
                <div className="space-y-2">
                  {content.clinicalData.otherTests.map((test, idx) => (
                    <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                      <p className="font-medium">{test.test}</p>
                      <p className="text-gray-700">{test.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Clinical Question Section */}
      {content.clinicalQuestion && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Pregunta Clínica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-gray-900 font-medium mb-4">{content.clinicalQuestion.question}</p>

              {/* Options */}
              {content.clinicalQuestion.options && (
                <div className="space-y-2 mb-4">
                  {content.clinicalQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-3 rounded border-2 ${
                        option.isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <p className="font-medium">
                        {option.isCorrect && '✓ '}
                        {option.id}. {option.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Explanation */}
              {content.clinicalQuestion.explanation && (
                <div className="bg-white p-3 rounded border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Explicación</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {content.clinicalQuestion.explanation}
                  </p>
                </div>
              )}

              {/* References */}
              {content.clinicalQuestion.references && content.clinicalQuestion.references.length > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  <p className="font-semibold mb-1">Referencias:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {content.clinicalQuestion.references.map((ref, idx) => (
                      <li key={idx}>
                        {ref.type}: {ref.section}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Educational Notes Section */}
      {content.educationalNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas Educativas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Key Points */}
            {content.educationalNotes.keyPoints && content.educationalNotes.keyPoints.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Puntos Clave</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {content.educationalNotes.keyPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common Mistakes */}
            {content.educationalNotes.commonMistakes && content.educationalNotes.commonMistakes.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">⚠️ Errores Comunes</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {content.educationalNotes.commonMistakes.map((mistake, idx) => (
                    <li key={idx}>{mistake}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Clinical Tips */}
            {content.educationalNotes.clinicalTips && content.educationalNotes.clinicalTips.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">💡 Consejos Clínicos</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {content.educationalNotes.clinicalTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
