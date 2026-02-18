'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertBox } from '@/components/ui/alert'
import { getCaseStatusLabel, getCaseStatusColor, getComplexityColor, getCaseComplexityDescription, formatRating } from '@/lib/utils/case-utils'

interface CaseCardProps {
  id: string
  projectId: string
  title: string
  indication: string
  complexity: string
  status: string
  educationalObjective: string
  targetAudience: string[]
  views: number
  rating: number | null
  ratingCount: number
  createdAt: Date | string
  updatedAt: Date | string
  publishedAt?: Date | string | null
  onDelete?: (caseId: string) => void
  onStatusChange?: (caseId: string, newStatus: string) => void
}

export function CaseCard({
  id,
  projectId,
  title,
  indication,
  complexity,
  status,
  educationalObjective,
  targetAudience,
  views,
  rating,
  ratingCount,
  createdAt,
  updatedAt,
  publishedAt,
  onDelete,
  onStatusChange,
}: CaseCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/projects/${projectId}/cases/${id}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Error al eliminar caso')
      }

      if (onDelete) {
        onDelete(id)
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/projects/${projectId}/cases/${id}/publish`,
        { method: 'POST' }
      )

      if (!response.ok) {
        throw new Error('Error al publicar caso')
      }

      if (onStatusChange) {
        onStatusChange(id, 'PUBLISHED')
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const createdDate = new Date(createdAt)
  const updatedDate = new Date(updatedAt)
  const isDraft = status === 'DRAFT'
  const isApproved = status === 'APPROVED'
  const isPublished = status === 'PUBLISHED'

  return (
    <>
      {error && (
        <AlertBox
          variant="error"
          title="Error"
          description={error}
          onClose={() => setError(null)}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>¿Eliminar caso?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Esta acción no se puede deshacer. El caso "{title}" será
                eliminado permanentemente.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="hover:shadow-md transition-shadow overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4 mb-2">
            <Link
              href={`/projects/${projectId}/cases/${id}`}
              className="hover:text-primary transition-colors flex-1 min-w-0"
            >
              <CardTitle className="truncate text-base">{title}</CardTitle>
            </Link>
            <Badge variant={getCaseStatusColor(status)}>
              {getCaseStatusLabel(status)}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{indication}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Educational Objective */}
          <p className="text-sm text-gray-700 line-clamp-2">
            {educationalObjective}
          </p>

          {/* Complexity Badge */}
          <div className="flex gap-2 items-center">
            <Badge variant={getComplexityColor(complexity)}>
              {complexity === 'BASIC' && 'Básico'}
              {complexity === 'INTERMEDIATE' && 'Intermedio'}
              {complexity === 'ADVANCED' && 'Avanzado'}
            </Badge>
            <span className="text-xs text-gray-500">
              {targetAudience.length} audiencia(s)
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span>👁️</span>
              <span>{views} vistas</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span>{formatRating(rating, ratingCount)}</span>
            </div>
          </div>

          {/* Dates */}
          <div className="flex gap-4 text-xs text-gray-500">
            <div>
              Creado: {createdDate.toLocaleDateString('es-ES')}
            </div>
            {isPublished && publishedAt && (
              <div>
                Publicado:{' '}
                {new Date(publishedAt).toLocaleDateString('es-ES')}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              asChild
            >
              <Link href={`/projects/${projectId}/cases/${id}`}>
                Ver Detalles
              </Link>
            </Button>

            {isApproved && (
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={loading}
              >
                Publicar
              </Button>
            )}

            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
            >
              Eliminar
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
