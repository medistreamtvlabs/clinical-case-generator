'use client'

import React, { useState, useRef } from 'react'
import { AlertBox } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DOCUMENT_TYPES } from '@/config/constants'

interface DocumentUploadProps {
  projectId: string
  onSuccess?: (documentId: string) => void
  onError?: (error: string) => void
}

export function DocumentUpload({
  projectId,
  onSuccess,
  onError,
}: DocumentUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    file: null as File | null,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, file: files[0] }))
      setError(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, file: files[0] }))
      setError(null)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate
    if (!formData.title.trim()) {
      setError('Título del documento requerido')
      return
    }

    if (!formData.type) {
      setError('Tipo de documento requerido')
      return
    }

    if (!formData.file) {
      setError('Archivo requerido')
      return
    }

    setLoading(true)

    try {
      const form = new FormData()
      form.append('title', formData.title)
      form.append('type', formData.type)
      form.append('file', formData.file)

      const response = await fetch(
        `/api/projects/${projectId}/documents`,
        {
          method: 'POST',
          body: form,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al subir documento')
      }

      // Reset form
      setFormData({ title: '', type: '', file: null })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      if (onSuccess) {
        onSuccess(data.data.id)
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      if (onError) {
        onError(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <AlertBox
          variant="error"
          title="Error"
          description={error}
          onClose={() => setError(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título del Documento
          </label>
          <Input
            name="title"
            type="text"
            placeholder="Ej: Ficha Técnica - Medicamento X"
            value={formData.title}
            onChange={handleInputChange}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/200 caracteres
          </p>
        </div>

        {/* Document Type Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Documento
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">-- Seleccionar tipo --</option>
            {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload - Drag and Drop Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Archivo (PDF o DOCX)
          </label>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center
              transition-colors cursor-pointer
              ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-primary/50'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              disabled={loading}
              className="hidden"
            />

            <div
              onClick={() => !loading && fileInputRef.current?.click()}
              className="space-y-2"
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v24a4 4 0 004 4h24a4 4 0 004-4V20M32 4v12m0 0l-4-4m4 4l4-4"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-gray-600 font-medium">
                {formData.file
                  ? formData.file.name
                  : 'Arrastra tu archivo aquí o haz clic para seleccionar'}
              </p>
              <p className="text-xs text-gray-500">
                Formatos soportados: PDF, DOCX (Máximo 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({ title: '', type: '', file: null })
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
            }}
            disabled={loading}
          >
            Limpiar
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.file || !formData.title || !formData.type}
          >
            {loading ? 'Subiendo...' : 'Subir Documento'}
          </Button>
        </div>
      </form>
    </div>
  )
}
