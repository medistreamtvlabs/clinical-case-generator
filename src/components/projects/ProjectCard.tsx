'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertBox } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Trash2, Settings, BookOpen } from 'lucide-react'
import type { ProjectWithStats } from '@/types/project'
import { ProjectStatus } from '@/types/common'

interface ProjectCardProps {
  project: ProjectWithStats
  onDelete?: (id: string) => Promise<void>
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  const handleDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    setError(null)

    try {
      await onDelete(project.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el proyecto')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      {error && (
        <div className="px-6 pt-4">
          <AlertBox
            variant="destructive"
            title="Error"
            description={error}
            onClose={() => setError(null)}
          />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link href={`/projects/${project.id}`}>
              <CardTitle className="line-clamp-1 cursor-pointer hover:text-primary-600">
                {project.name}
              </CardTitle>
            </Link>
            <CardDescription className="mt-1 line-clamp-2">
              {project.productName}
            </CardDescription>
          </div>
          <Badge variant={statusColors[project.status as ProjectStatus]}>
            {statusLabels[project.status as ProjectStatus]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Description */}
        {project.description && (
          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.therapeuticAreas.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {project.therapeuticAreas.slice(0, 3).map((area) => (
              <Badge key={area} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
            {project.therapeuticAreas.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{project.therapeuticAreas.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{project.stats.documentsCount} documentos</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{project.stats.casesCount} casos</span>
          </div>
        </div>

        {/* Dates */}
        <div className="mt-4 text-xs text-gray-500">
          <p>Creado: {new Date(project.createdAt).toLocaleDateString('es-ES')}</p>
        </div>
      </CardContent>

      {/* Actions */}
      <div className="border-t border-gray-200 px-6 py-3 flex gap-2">
        <Link href={`/projects/${project.id}`} className="flex-1">
          <Button variant="default" size="sm" className="w-full">
            Abrir
          </Button>
        </Link>
        <Link href={`/projects/${project.id}/configuration`}>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
          className="text-error-600 hover:bg-error-50"
        >
          {isDeleting ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 max-w-sm">
            <CardHeader>
              <CardTitle>Eliminar proyecto</CardTitle>
              <CardDescription>
                ¿Está seguro? Esta acción no se puede deshacer.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1"
              >
                {isDeleting ? <LoadingSpinner size="sm" /> : 'Eliminar'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  )
}
