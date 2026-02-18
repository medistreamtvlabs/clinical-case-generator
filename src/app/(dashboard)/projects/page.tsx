'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LoadingPage, LoadingSpinner } from '@/components/ui/loading-spinner'
import { AlertBox } from '@/components/ui/alert'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import type { ProjectWithStats } from '@/types/project'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectWithStats[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithStats[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/projects')
        if (!response.ok) throw new Error('Error al cargar proyectos')

        const data = await response.json()
        setProjects(data.data.items || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Filter projects by search
  useEffect(() => {
    if (!search) {
      setFilteredProjects(projects)
    } else {
      const searchLower = search.toLowerCase()
      setFilteredProjects(
        projects.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.productName.toLowerCase().includes(searchLower)
        )
      )
    }
  }, [search, projects])

  // Delete project
  const handleDelete = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Error al eliminar')

      setProjects(projects.filter((p) => p.id !== projectId))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Error desconocido')
    }
  }

  if (isLoading) return <LoadingPage />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proyectos</h1>
          <p className="mt-1 text-gray-600">
            Gestiona tus proyectos farmacéuticos
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <AlertBox
          variant="destructive"
          title="Error"
          description={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Search */}
      {projects.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar proyecto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {search ? 'No se encontraron proyectos' : 'Sin proyectos'}
          </h3>
          <p className="text-gray-600 mb-6">
            {search
              ? 'Intenta con otra búsqueda'
              : 'Comienza creando tu primer proyecto farmacéutico'}
          </p>
          {!search && (
            <Link href="/projects/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Proyecto
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Loading indicator when deleting */}
      {/* (handled per card with loading state) */}
    </div>
  )
}
