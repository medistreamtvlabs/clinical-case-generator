/**
 * Case detail page
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AlertBox } from '@/components/ui/alert'
import { CaseDetailViewer } from '@/components/cases/CaseDetailViewer'
import { getCaseStatusLabel, getCaseStatusColor, getNextSuggestedStatus, canTransitionStatus, getStatusTransitionLabel } from '@/lib/utils/case-utils'
import type { ClinicalCase } from '@/types/case'

interface CaseDetail extends Omit<ClinicalCase, 'createdAt' | 'updatedAt' | 'publishedAt'> {
  createdAt: string | Date
  updatedAt: string | Date
  publishedAt?: string | Date | null
}

export default function CaseDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const caseId = params.caseId as string

  const [caseData, setCaseData] = useState<CaseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [ratingLoading, setRatingLoading] = useState(false)
  const [showRatingForm, setShowRatingForm] = useState(false)

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/projects/${projectId}/cases/${caseId}`
        )

        if (!response.ok) {
          throw new Error('Error al cargar caso')
        }

        const data = await response.json()
        setCaseData(data.data)
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchCase()
  }, [projectId, caseId])

  const handleRateCase = async () => {
    if (ratingValue < 1 || ratingValue > 5) {
      setError('La calificación debe ser entre 1 y 5')
      return
    }

    setRatingLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/projects/${projectId}/cases/${caseId}/rate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: ratingValue }),
        }
      )

      if (!response.ok) {
        throw new Error('Error al calificar caso')
      }

      const data = await response.json()
      setCaseData((prev) =>
        prev
          ? {
              ...prev,
              rating: data.data.rating,
              ratingCount: data.data.ratingCount,
            }
          : null
      )
      setShowRatingForm(false)
      setRatingValue(0)
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
    } finally {
      setRatingLoading(false)
    }
  }

  const nextStatus = caseData ? getNextSuggestedStatus(caseData.status) : null

  if (loading) {
    return <LoadingSpinner size="lg" />
  }

  if (error || !caseData) {
    return (
      <AlertBox
        variant="destructive"
        title="Error"
        description={error || 'Caso no encontrado'}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href={`/projects/${projectId}/cases`}>
          <Button variant="outline">← Volver a Casos</Button>
        </Link>
        <Badge variant={getCaseStatusColor(caseData.status)}>
          {getCaseStatusLabel(caseData.status)}
        </Badge>
      </div>

      {error && (
        <AlertBox
          variant="destructive"
          title="Error"
          description={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Case Content */}
      {caseData.content && (
        <CaseDetailViewer
          title={caseData.title}
          indication={caseData.indication}
          complexity={caseData.complexity}
          status={caseData.status}
          educationalObjective={caseData.educationalObjective}
          targetAudience={caseData.targetAudience}
          views={caseData.views}
          rating={caseData.rating}
          ratingCount={caseData.ratingCount}
          content={caseData.content}
          createdAt={caseData.createdAt}
          updatedAt={caseData.updatedAt}
          publishedAt={caseData.publishedAt}
        />
      )}

      {/* Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rating */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Calificar Caso</h4>
              {!showRatingForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowRatingForm(true)}
                  className="w-full"
                >
                  ⭐ Calificar
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRatingValue(star)}
                        className={`text-2xl ${
                          star <= ratingValue
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        } transition-colors`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRatingForm(false)}
                      disabled={ratingLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleRateCase}
                      disabled={ratingLoading || ratingValue === 0}
                    >
                      {ratingLoading ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Status Transition */}
            {nextStatus && canTransitionStatus(caseData.status, nextStatus) && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Siguiente Paso
                </h4>
                <Button className="w-full">
                  {getStatusTransitionLabel(caseData.status, nextStatus)}
                </Button>
              </div>
            )}
          </div>

          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" asChild>
              <Link href={`/projects/${projectId}/cases/${caseId}/edit`}>
                ✏️ Editar
              </Link>
            </Button>
            <Button variant="outline">
              🖨️ Imprimir
            </Button>
            <Button variant="destructive">
              🗑️ Eliminar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Caso</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">ID</p>
            <p className="font-mono text-xs">{caseData.id}</p>
          </div>
          <div>
            <p className="text-gray-600">Creado</p>
            <p>{new Date(caseData.createdAt).toLocaleDateString('es-ES')}</p>
          </div>
          <div>
            <p className="text-gray-600">Actualizado</p>
            <p>{new Date(caseData.updatedAt).toLocaleDateString('es-ES')}</p>
          </div>
          <div>
            <p className="text-gray-600">Validado</p>
            <p>{caseData.validated ? '✓ Sí' : '✗ No'}</p>
          </div>
          <div>
            <p className="text-gray-600">Idioma</p>
            <p>{caseData.language === 'es' ? 'Español' : 'English'}</p>
          </div>
          <div>
            <p className="text-gray-600">Vistas</p>
            <p>{caseData.views}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
