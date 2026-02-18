/**
 * Generate new case page
 */

'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GenerateCaseForm } from '@/components/cases/GenerateCaseForm'

export default function GenerateCasePage() {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href={`/projects/${projectId}/cases`}>
          <Button variant="outline" className="mb-4">
            ← Volver a Casos
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Generar Nuevo Caso Clínico</h1>
        <p className="text-gray-600 mt-2">
          Completa el formulario para generar un caso clínico educativo con Claude AI
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Parámetros de Generación</CardTitle>
            </CardHeader>
            <CardContent>
              <GenerateCaseForm
                projectId={projectId}
                onSuccess={(caseId) => {
                  // Component handles navigation
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Help */}
        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">💡 Consejos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-900">
              <div>
                <p className="font-semibold mb-1">Indicación Clínica</p>
                <p>Selecciona una condición médica específica o escribe una personalizada</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Complejidad</p>
                <p>
                  Básico para estudiantes novatos, Avanzado para especialistas en
                  formación
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Audiencia</p>
                <p>Selecciona múltiples audiencias para que el caso sea versátil</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Tiempo de Generación</p>
                <p>La generación típicamente toma 30-60 segundos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">✓ Qué esperar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-green-900">
              <div className="flex gap-2">
                <span>📝</span>
                <span>Presentación clínica detallada</span>
              </div>
              <div className="flex gap-2">
                <span>🔬</span>
                <span>Datos clínicos y de laboratorio</span>
              </div>
              <div className="flex gap-2">
                <span>❓</span>
                <span>Pregunta clínica con 4 opciones</span>
              </div>
              <div className="flex gap-2">
                <span>📚</span>
                <span>Notas educativas y puntos clave</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900">⚠️ Importante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-amber-900">
              <p>Los casos generados son borradores. Revisa y personaliza antes de publicar.</p>
              <p>
                Puedes editarlos en la página de detalles si necesitas hacer cambios.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
