/**
 * Document detail page
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
import { DOCUMENT_TYPES, PARSING_STATUS_LABELS } from '@/config/constants'
import { formatFileSize } from '@/lib/utils/file-utils'

interface Document {
  id: string
  title: string
  type: string
  filename: string
  fileSize: number
  mimeType: string
  parsingStatus: string
  version: string
  metadata: any
  parsedData: any
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export default function DocumentDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const documentId = params.documentId as string

  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [parseLoading, setParseLoading] = useState(false)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/projects/${projectId}/documents/${documentId}`
        )

        if (!response.ok) {
          throw new Error('Error al cargar documento')
        }

        const data = await response.json()
        setDocument(data.data)
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [projectId, documentId])

  const handleParse = async () => {
    try {
      setParseLoading(true)
      const response = await fetch(
        `/api/projects/${projectId}/documents/${documentId}/parse`,
        { method: 'POST' }
      )

      if (!response.ok) {
        throw new Error('Error al procesar documento')
      }

      const data = await response.json()
      setDocument((prev) =>
        prev
          ? { ...prev, parsingStatus: data.data.parsingStatus }
          : null
      )
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
    } finally {
      setParseLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner variant="lg" />
  }

  if (error || !document) {
    return (
      <AlertBox
        variant="error"
        title="Error"
        description={error || 'Documento no encontrado'}
      />
    )
  }

  const createdDate = new Date(document.createdAt)
  const updatedDate = new Date(document.updatedAt)
  const isPending = document.parsingStatus === 'PENDING'
  const isProcessing = document.parsingStatus === 'PROCESSING'
  const isCompleted = document.parsingStatus === 'COMPLETED'
  const isFailed = document.parsingStatus === 'FAILED'

  let statusColor: 'default' | 'secondary' | 'success' | 'warning' | 'error' =
    'default'
  if (isCompleted) statusColor = 'success'
  else if (isProcessing) statusColor = 'warning'
  else if (isFailed) statusColor = 'error'

  return (
    <div className="space-y-6">
      {error && (
        <AlertBox
          variant="error"
          title="Error"
          description={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{document.title}</h1>
          <div className="flex gap-2 mt-2">
            <Badge>{DOCUMENT_TYPES[document.type] || document.type}</Badge>
            <Badge variant={statusColor}>
              {PARSING_STATUS_LABELS[document.parsingStatus] ||
                document.parsingStatus}
            </Badge>
          </div>
        </div>
        <Link href={`/projects/${projectId}/documents`}>
          <Button variant="outline">← Volver a Documentos</Button>
        </Link>
      </div>

      {/* File Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Archivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nombre de archivo</p>
              <p className="font-medium">{document.filename}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tamaño</p>
              <p className="font-medium">{formatFileSize(document.fileSize)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tipo MIME</p>
              <p className="font-medium text-xs">{document.mimeType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Versión</p>
              <p className="font-medium">{document.version}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Creado</p>
              <p className="font-medium">
                {createdDate.toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Actualizado</p>
              <p className="font-medium">
                {updatedDate.toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parsing Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Procesamiento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {isCompleted &&
                'El documento ha sido procesado exitosamente. Los datos extraídos están disponibles.'}
              {isProcessing &&
                'El documento se encuentra en procesamiento. Por favor espera...'}
              {isPending &&
                'El documento está pendiente de procesamiento. Haz clic en "Procesar" para iniciar.'}
              {isFailed &&
                document.errorMessage &&
                `Error al procesar: ${document.errorMessage}`}
            </p>

            {isPending && (
              <Button
                onClick={handleParse}
                disabled={parseLoading}
                size="lg"
                className="mt-4"
              >
                {parseLoading ? 'Procesando...' : 'Procesar Documento'}
              </Button>
            )}

            {isProcessing && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⏳ Procesamiento en curso. Esta página se actualizará automáticamente.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parsed Data Card */}
      {isCompleted && document.parsedData && (
        <Card>
          <CardHeader>
            <CardTitle>Datos Extraídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                {JSON.stringify(document.parsedData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Details Card */}
      {isFailed && document.errorMessage && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Detalles del Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-800">{document.errorMessage}</p>
            <Button
              onClick={handleParse}
              disabled={parseLoading}
              variant="destructive"
              className="mt-4"
            >
              {parseLoading ? 'Reintentando...' : 'Reintentar Procesamiento'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Metadata Card */}
      {document.metadata && Object.keys(document.metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Metadatos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-48">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                {JSON.stringify(document.metadata, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Próximos Pasos</h3>
          {isCompleted ? (
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>Los datos extraídos se usarán para generar casos clínicos</li>
              <li>Puedes subir más documentos del mismo proyecto</li>
              <li>
                Ve a la sección de Casos para generar material educativo
              </li>
            </ol>
          ) : (
            <p className="text-sm text-gray-700">
              Procesa este documento para extraer información y generar casos
              clínicos automáticamente.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
