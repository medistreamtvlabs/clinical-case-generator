'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingPage } from '@/components/ui/loading-spinner'
import { AlertBox } from '@/components/ui/alert'
import { BookOpen, Package, Zap, FileText } from 'lucide-react'
import type { Project, ProjectConfiguration } from '@/types/project'
import { ProjectStatus } from '@/types/common'

interface ProjectDetail extends Project {
  configuration: ProjectConfiguration | null
  stats?: {
    documentsCount: number
    casesCount: number
  }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/projects/${projectId}`)
        if (!response.ok) throw new Error('Proyecto no encontrado')

        const data = await response.json()
        setProject(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  if (isLoading) return <LoadingPage />

  if (error || !project) {
    return (
      <div className="space-y-4">
        <AlertBox variant="destructive" title="Error" description={error || 'Proyecto no encontrado'} />
      </div>
    )
  }

  const statusColors: Record<ProjectStatus, 'default' | 'secondary' | 'success' | 'warning'> = {
    [ProjectStatus.SETUP]: 'warning',
    [ProjectStatus.ACTIVE]: 'success',
    [ProjectStatus.ARCHIVED]: 'secondary',
  }

  const statusLabels: Record<ProjectStatus, string> = {
    [ProjectStatus.SETUP]: 'Configuración',
    [ProjectStatus.ACTIVE]: 'Activo',
    [ProjectStatus.ARCHIVED]: 'Archivado',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="mt-2 text-gray-600">{project.productName}</p>
          {project.description && (
            <p className="mt-2 text-gray-600">{project.description}</p>
          )}
        </div>
        <Badge variant={statusColors[project.status as ProjectStatus]}>
          {statusLabels[project.status as ProjectStatus]}
        </Badge>
      </div>

      {/* Tags */}
      {project.therapeuticAreas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.therapeuticAreas.map((area) => (
            <Badge key={area} variant="secondary">
              {area}
            </Badge>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Documents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary-600" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{project.stats?.documentsCount || 0}</p>
            <p className="text-xs text-gray-600 mt-1">documentos cargados</p>
          </CardContent>
        </Card>

        {/* Cases */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary-600" />
              Casos Clínicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{project.stats?.casesCount || 0}</p>
            <p className="text-xs text-gray-600 mt-1">casos generados</p>
          </CardContent>
        </Card>

        {/* Product */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary-600" />
              Producto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-gray-900 truncate">
              {project.productName}
            </p>
            {project.activeIngredient && (
              <p className="text-xs text-gray-600 mt-1">{project.activeIngredient}</p>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary-600" />
              Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={statusColors[project.status as ProjectStatus]}>
              {statusLabels[project.status as ProjectStatus]}
            </Badge>
            <p className="text-xs text-gray-600 mt-2">
              Creado: {new Date(project.createdAt).toLocaleDateString('es-ES')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      {project.configuration && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de IA</CardTitle>
            <CardDescription>
              Parámetros para la generación de casos clínicos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Modelo</p>
                <p className="text-lg font-semibold">{project.configuration.aiModel}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Temperatura</p>
                <p className="text-lg font-semibold">{project.configuration.temperature}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tokens Máximos</p>
                <p className="text-lg font-semibold">{project.configuration.maxTokens}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Revisión Médica</p>
                <p className="text-lg font-semibold">
                  {project.configuration.requireMedicalReview ? 'Requerida' : 'Opcional'}
                </p>
              </div>
            </div>

            {project.configuration.mainIndications.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Indicaciones Principales</p>
                <div className="flex flex-wrap gap-2">
                  {project.configuration.mainIndications.map((ind) => (
                    <Badge key={ind} variant="default">
                      {ind}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {project.configuration.targetAudiences.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Audiencias Objetivo</p>
                <div className="flex flex-wrap gap-2">
                  {project.configuration.targetAudiences.map((aud) => (
                    <Badge key={aud} variant="secondary">
                      {aud}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Pasos</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            <li className="flex gap-3">
              <span className="font-semibold text-primary-600">1.</span>
              <span>Configura las indicaciones y audiencias del proyecto</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary-600">2.</span>
              <span>Carga la documentación (fichas técnicas, estudios clínicos)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary-600">3.</span>
              <span>Genera casos clínicos basados en esa documentación</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary-600">4.</span>
              <span>Valida y revisa los casos antes de publicarlos</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
