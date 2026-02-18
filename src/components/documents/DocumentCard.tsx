'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertBox } from '@/components/ui/alert'
import { DOCUMENT_TYPES, PARSING_STATUS_LABELS } from '@/config/constants'
import { formatFileSize } from '@/lib/utils/file-utils'

interface DocumentCardProps {
  id: string
  projectId: string
  title: string
  type: keyof typeof DOCUMENT_TYPES
  filename: string
  fileSize: number
  parsingStatus: string
  createdAt: Date | string
  onDelete?: (documentId: string) => void
  onParse?: (documentId: string) => void
}

export function DocumentCard({
  id,
  projectId,
  title,
  type,
  filename,
  fileSize,
  parsingStatus,
  createdAt,
  onDelete,
  onParse,
}: DocumentCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/projects/${projectId}/documents/${id}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Error al eliminar documento')
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

  const handleParse = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/projects/${projectId}/documents/${id}/parse`,
        { method: 'POST' }
      )

      if (!response.ok) {
        throw new Error('Error al procesar documento')
      }

      if (onParse) {
        onParse(id)
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
  const isPending = parsingStatus === 'PENDING'
  const isProcessing = parsingStatus === 'PROCESSING'
  const isCompleted = parsingStatus === 'COMPLETED'
  const isFailed = parsingStatus === 'FAILED'

  let statusColor: 'default' | 'secondary' | 'success' | 'warning' | 'error' =
    'default'
  if (isCompleted) statusColor = 'success'
  else if (isProcessing) statusColor = 'warning'
  else if (isFailed) statusColor = 'error'

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
              <CardTitle>¿Eliminar documento?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Esta acción no se puede deshacer. El documento "{title}" será eliminado
                permanentemente.
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

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link
                href={`/projects/${projectId}/documents/${id}`}
                className="hover:text-primary transition-colors"
              >
                <CardTitle className="truncate">{title}</CardTitle>
              </Link>
              <p className="text-sm text-gray-500 mt-1">{filename}</p>
            </div>
            <Badge variant="secondary">{DOCUMENT_TYPES[type]}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status and Size */}
          <div className="flex items-center justify-between">
            <Badge variant={statusColor}>
              {PARSING_STATUS_LABELS[parsingStatus] || parsingStatus}
            </Badge>
            <span className="text-xs text-gray-500">
              {formatFileSize(fileSize)}
            </span>
          </div>

          {/* Date */}
          <p className="text-xs text-gray-500">
            {createdDate.toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              asChild
            >
              <Link href={`/projects/${projectId}/documents/${id}`}>
                Ver Detalles
              </Link>
            </Button>

            {isPending && (
              <Button
                size="sm"
                onClick={handleParse}
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Procesar'}
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
