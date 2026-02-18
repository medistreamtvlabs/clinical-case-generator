'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Plus, TrendingUp, FolderOpen, BookOpen } from 'lucide-react'
import type { ProjectWithStats } from '@/types/project'

interface Stats {
  totalProjects: number
  totalDocuments: number
  totalCases: number
  recentProjects: ProjectWithStats[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/projects?limit=100')
        const data = await response.json()

        const projects = data.data.items as ProjectWithStats[]
        const totalDocuments = projects.reduce(
          (sum, p) => sum + p.stats.documentsCount,
          0
        )
        const totalCases = projects.reduce(
          (sum, p) => sum + p.stats.casesCount,
          0
        )

        setStats({
          totalProjects: projects.length,
          totalDocuments,
          totalCases,
          recentProjects: projects.slice(0, 5),
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">
          Bienvenido a Clinical Case Generator
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Projects */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary-600" />
              Proyectos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalProjects || 0}</p>
            <p className="text-xs text-gray-600 mt-2">proyectos activos</p>
          </CardContent>
        </Card>

        {/* Total Documents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalDocuments || 0}</p>
            <p className="text-xs text-gray-600 mt-2">archivos cargados</p>
          </CardContent>
        </Card>

        {/* Total Cases */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-600" />
              Casos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalCases || 0}</p>
            <p className="text-xs text-gray-600 mt-2">casos generados</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Proyectos Recientes</h2>
            <p className="text-gray-600">Tus últimos proyectos activos</p>
          </div>
          <Link href="/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </Link>
        </div>

        {stats && stats.recentProjects.length > 0 ? (
          <div className="space-y-3">
            {stats.recentProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {project.productName}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {project.stats.casesCount}
                          </p>
                          <p className="text-xs text-gray-600">casos</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {project.stats.documentsCount}
                          </p>
                          <p className="text-xs text-gray-600">docs</p>
                        </div>
                        <Badge>→</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sin proyectos
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza creando tu primer proyecto farmacéutico
              </p>
              <Link href="/projects/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Proyecto
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Guía de Inicio Rápido</CardTitle>
          <CardDescription>
            Pasos para comenzar a generar casos clínicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="font-semibold text-primary-600 flex-shrink-0">
                1.
              </span>
              <span className="text-gray-700">
                Crea un nuevo proyecto con la información del medicamento
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary-600 flex-shrink-0">
                2.
              </span>
              <span className="text-gray-700">
                Carga documentación médica (fichas técnicas, estudios clínicos)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary-600 flex-shrink-0">
                3.
              </span>
              <span className="text-gray-700">
                Configure indicaciones y audiencias objetivo
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary-600 flex-shrink-0">
                4.
              </span>
              <span className="text-gray-700">
                Genera casos clínicos automáticamente con IA
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary-600 flex-shrink-0">
                5.
              </span>
              <span className="text-gray-700">
                Valida, revisa y publica los casos
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
