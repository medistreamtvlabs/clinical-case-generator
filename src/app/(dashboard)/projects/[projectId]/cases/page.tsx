/**
 * Cases list page for a project
 */

'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CaseList } from '@/components/cases/CaseList'

export default function CasesPage() {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Casos Clínicos</h1>
          <p className="text-gray-600 mt-1">
            Genera y gestiona casos clínicos educativos de alta calidad
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href={`/projects/${projectId}/cases/new`}>
            + Generar Caso
          </Link>
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">∞</div>
              <p className="text-gray-600 text-sm mt-2">Casos Ilimitados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">⚡</div>
              <p className="text-gray-600 text-sm mt-2">Generación Rápida</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">✓</div>
              <p className="text-gray-600 text-sm mt-2">Validación Automática</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How it Works */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-blue-900">
            <li className="flex gap-3">
              <span className="font-bold bg-blue-200 px-2 py-1 rounded min-w-fit">1</span>
              <span>Haz clic en "Generar Caso" y completa los parámetros educativos</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-200 px-2 py-1 rounded min-w-fit">2</span>
              <span>Claude AI genera un caso clínico completo y estructurado automáticamente</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-200 px-2 py-1 rounded min-w-fit">3</span>
              <span>El caso se guarda como borrador para que lo revises y personalices</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-200 px-2 py-1 rounded min-w-fit">4</span>
              <span>Envía a revisión, aprobación y finalmente publica para tus estudiantes</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Cases List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Casos Disponibles</h2>
        <CaseList projectId={projectId} />
      </div>
    </div>
  )
}
