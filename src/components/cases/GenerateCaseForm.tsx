'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertBox } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { generateCaseSchema } from '@/lib/validators/case-validators'
import { MEDICAL_CONDITIONS, CASE_TARGET_AUDIENCES, CASE_COMPLEXITY_DESCRIPTIONS } from '@/config/constants'
import type { GenerateCaseInput } from '@/lib/validators/case-validators'

interface GenerateCaseFormProps {
  projectId: string
  onSuccess?: (caseId: string) => void
  onError?: (error: string) => void
}

export function GenerateCaseForm({
  projectId,
  onSuccess,
  onError,
}: GenerateCaseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedComplexity, setSelectedComplexity] = useState('BASIC')

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GenerateCaseInput>({
    resolver: zodResolver(generateCaseSchema),
    mode: 'onBlur',
    defaultValues: {
      language: 'es',
      targetAudience: [],
    },
  })

  const objectiveValue = watch('educationalObjective') || ''
  const audienceWatch = watch('targetAudience')

  const onSubmit = async (data: GenerateCaseInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/projects/${projectId}/cases`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al generar caso')
      }

      // Success
      if (onSuccess) {
        onSuccess(result.data.id)
      }

      // Redirect to case detail
      router.push(`/projects/${projectId}/cases/${result.data.id}`)
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
    <div className="space-y-6">
      {error && (
        <AlertBox
          variant="error"
          title="Error"
          description={error}
          onClose={() => setError(null)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Indication */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Indicación Clínica *
          </label>
          <input
            {...register('indication')}
            type="text"
            placeholder="Ej: Diabetes Mellitus Tipo 2, Hipertensión Arterial"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            disabled={loading}
          />
          {errors.indication && (
            <p className="text-xs text-red-600 mt-1">
              {errors.indication.message}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Selecciona de la lista o escribe una condición personalizada
          </p>
          <div className="mt-2 grid grid-cols-2 lg:grid-cols-3 gap-2">
            {MEDICAL_CONDITIONS.slice(0, 9).map((condition) => (
              <button
                key={condition}
                type="button"
                onClick={() => {
                  const input = document.querySelector(
                    'input[name="indication"]'
                  ) as HTMLInputElement
                  if (input) {
                    input.value = condition
                    input.dispatchEvent(new Event('change', { bubbles: true }))
                  }
                }}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                disabled={loading}
              >
                {condition}
              </button>
            ))}
          </div>
        </div>

        {/* Complexity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Nivel de Complejidad *
          </label>
          <div className="space-y-3">
            {['BASIC', 'INTERMEDIATE', 'ADVANCED'].map((complexity) => (
              <label
                key={complexity}
                className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  {...register('complexity')}
                  type="radio"
                  value={complexity}
                  onChange={(e) => setSelectedComplexity(e.target.value)}
                  className="mt-1 mr-3"
                  disabled={loading}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {complexity === 'BASIC' && 'Básico'}
                    {complexity === 'INTERMEDIATE' && 'Intermedio'}
                    {complexity === 'ADVANCED' && 'Avanzado'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {CASE_COMPLEXITY_DESCRIPTIONS[complexity]}
                  </p>
                </div>
              </label>
            ))}
          </div>
          {errors.complexity && (
            <p className="text-xs text-red-600 mt-2">
              {errors.complexity.message}
            </p>
          )}
        </div>

        {/* Educational Objective */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Objetivo Educativo *
          </label>
          <textarea
            {...register('educationalObjective')}
            placeholder="¿Qué competencia educativa busca desarrollar este caso?"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            {objectiveValue.length}/500 caracteres
          </p>
          {errors.educationalObjective && (
            <p className="text-xs text-red-600 mt-1">
              {errors.educationalObjective.message}
            </p>
          )}
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Audiencia Objetivo *
          </label>
          <div className="space-y-2">
            {Object.entries(CASE_TARGET_AUDIENCES).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={key}
                  {...register('targetAudience')}
                  className="mr-2"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
          {errors.targetAudience && (
            <p className="text-xs text-red-600 mt-2">
              {errors.targetAudience.message}
            </p>
          )}
          {audienceWatch && audienceWatch.length > 0 && (
            <p className="text-xs text-green-600 mt-2">
              {audienceWatch.length} audiencia(s) seleccionada(s)
            </p>
          )}
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Idioma
          </label>
          <select
            {...register('language')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            disabled={loading}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Additional Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Requisitos Adicionales (Opcional)
          </label>
          <textarea
            {...register('additionalRequirements')}
            placeholder="Especificaciones adicionales para la generación del caso..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Ej: incluir comorbilidades, enfoque en diagnóstico diferencial
          </p>
        </div>

        {/* Info Card */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            ℹ️ Cómo funciona
          </h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Completa los campos con los parámetros del caso deseado</li>
            <li>Claude genera un caso clínico completo y estructurado</li>
            <li>El caso se guarda como borrador para su revisión</li>
            <li>Puedes editarlo antes de enviarlo a revisión</li>
          </ol>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || isSubmitting}
            className="min-w-[200px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner variant="sm" />
                Generando caso...
              </div>
            ) : (
              'Generar Caso Clínico'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
