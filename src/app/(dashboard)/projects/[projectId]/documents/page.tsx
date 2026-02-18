/**
 * Documents list page for a project
 */

'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DocumentUpload } from '@/components/documents/DocumentUpload'
import { DocumentList } from '@/components/documents/DocumentList'
import { AlertBox } from '@/components/ui/alert'

export default function DocumentsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleUploadSuccess = (documentId: string) => {
    setSuccessMessage('Documento subido exitosamente')
    setShowUploadForm(false)
    setRefreshTrigger((prev) => prev + 1)

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentos del Proyecto</h1>
          <p className="text-gray-600 mt-1">
            Gestiona documentos y genera casos clínicos automáticamente
          </p>
        </div>
        <Button
          onClick={() => setShowUploadForm(!showUploadForm)}
          size="lg"
        >
          {showUploadForm ? 'Cancelar' : '+ Subir Documento'}
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <AlertBox
          variant="success"
          title="Éxito"
          description={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Subir Nuevo Documento</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentUpload
              projectId={projectId}
              onSuccess={handleUploadSuccess}
            />
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <svg
              className="h-6 w-6 text-primary flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900">Cómo funciona</h3>
              <ol className="mt-2 text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Sube documentos (Ficha Técnica, Estudios Clínicos, Guías)</li>
                <li>El sistema extrae información automáticamente</li>
                <li>Claude AI genera casos clínicos contextualizados</li>
                <li>Revisa y valida antes de publicar</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Documentos Cargados</h2>
        <DocumentList projectId={projectId} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}
