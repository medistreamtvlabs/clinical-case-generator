'use client'

import React, { useEffect, useState } from 'react'
import { DocumentCard } from './DocumentCard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AlertBox } from '@/components/ui/alert'

interface Document {
  id: string
  title: string
  type: string
  filename: string
  fileSize: number
  parsingStatus: string
  createdAt: string
}

interface DocumentListProps {
  projectId: string
  refreshTrigger?: number
}

export function DocumentList({
  projectId,
  refreshTrigger = 0,
}: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/projects/${projectId}/documents?limit=50`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar documentos')
      }

      setDocuments(data.data || [])
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [projectId, refreshTrigger])

  const handleDelete = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
  }

  const handleParse = (documentId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? { ...doc, parsingStatus: 'PROCESSING' }
          : doc
      )
    )
  }

  if (loading) {
    return <LoadingSpinner variant="md" />
  }

  if (error) {
    return (
      <AlertBox
        variant="error"
        title="Error"
        description={error}
        onClose={() => setError(null)}
      />
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No hay documentos
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza subiendo un documento para generar casos clínicos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            id={doc.id}
            projectId={projectId}
            title={doc.title}
            type={doc.type as any}
            filename={doc.filename}
            fileSize={doc.fileSize}
            parsingStatus={doc.parsingStatus}
            createdAt={doc.createdAt}
            onDelete={handleDelete}
            onParse={handleParse}
          />
        ))}
      </div>
    </div>
  )
}
