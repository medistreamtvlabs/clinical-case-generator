'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertBox, Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { createProjectSchema, type CreateProjectInput } from '@/lib/validators/project-validators'
import { THERAPEUTIC_AREAS } from '@/config/constants'
import { AlertCircle } from 'lucide-react'

interface CreateProjectFormProps {
  onSuccess?: () => void
}

export function CreateProjectForm({ onSuccess }: CreateProjectFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    mode: 'onBlur',
  })

  const selectedAreas = watch('therapeuticAreas') || []

  const onSubmit = async (data: CreateProjectInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear el proyecto')
      }

      const result = await response.json()
      onSuccess?.()
      router.push(`/projects/${result.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Nuevo Proyecto</CardTitle>
        <CardDescription>
          Configura un nuevo proyecto farmacéutico para generar casos clínicos
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <AlertBox
              variant="destructive"
              title="Error"
              description={error}
              onClose={() => setError(null)}
            />
          )}

          {/* Project Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Nombre del Proyecto *
            </label>
            <Input
              id="name"
              placeholder="Ej: Imatinib - Leucemia Mieloide Crónica"
              {...register('name')}
              className={errors.name ? 'border-error-600 focus:ring-error-600' : ''}
            />
            {errors.name && (
              <p className="text-sm text-error-600">{errors.name.message}</p>
            )}
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <label htmlFor="productName" className="block text-sm font-medium">
              Nombre del Producto *
            </label>
            <Input
              id="productName"
              placeholder="Ej: Imatinib 400mg comprimidos"
              {...register('productName')}
              className={errors.productName ? 'border-error-600 focus:ring-error-600' : ''}
            />
            {errors.productName && (
              <p className="text-sm text-error-600">{errors.productName.message}</p>
            )}
          </div>

          {/* Active Ingredient */}
          <div className="space-y-2">
            <label htmlFor="activeIngredient" className="block text-sm font-medium">
              Principio Activo
            </label>
            <Input
              id="activeIngredient"
              placeholder="Ej: Imatinib mesilato"
              {...register('activeIngredient')}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Descripción
            </label>
            <textarea
              id="description"
              placeholder="Descripción del proyecto y documentación..."
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 resize-none"
              rows={4}
            />
          </div>

          {/* Therapeutic Areas */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Áreas Terapéuticas * ({selectedAreas.length})
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 border border-gray-300 rounded-md bg-gray-50">
              {THERAPEUTIC_AREAS.map((area) => (
                <label key={area} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={area}
                    {...register('therapeuticAreas')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
            {errors.therapeuticAreas && (
              <p className="text-sm text-error-600">
                {errors.therapeuticAreas.message}
              </p>
            )}
          </div>

          {/* Info Alert */}
          <Alert variant="info">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuración posterior</AlertTitle>
            <AlertDescription>
              Después de crear el proyecto, podrás configurar indicaciones, audiencias objetivo y cargar documentación.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Proyecto'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
