'use client'

import React, { useEffect, useState } from 'react'
import { CaseCard } from './CaseCard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AlertBox } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface Case {
  id: string
  title: string
  indication: string
  complexity: string
  status: string
  educationalObjective: string
  targetAudience: string[]
  views: number
  rating: number | null
  ratingCount: number
  createdAt: string
  updatedAt: string
  publishedAt?: string | null
}

interface CaseListProps {
  projectId: string
  refreshTrigger?: number
  initialStatus?: string
}

export function CaseList({
  projectId,
  refreshTrigger = 0,
  initialStatus,
}: CaseListProps) {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [status, setStatus] = useState(initialStatus || '')
  const [complexity, setComplexity] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')

  const limit = 10

  const fetchCases = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
        ...(status && { status }),
        ...(complexity && { complexity }),
        ...(search && { search }),
      })

      const response = await fetch(
        `/api/projects/${projectId}/cases?${params}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar casos')
      }

      setCases(data.data || [])
      setTotal(data.pagination.total)
      setTotalPages(data.pagination.totalPages)
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [projectId, page, status, complexity, search, sort, refreshTrigger])

  const handleDelete = (caseId: string) => {
    setCases((prev) => prev.filter((c) => c.id !== caseId))
    setTotal((prev) => prev - 1)
  }

  const handleStatusChange = (caseId: string, newStatus: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId ? { ...c, status: newStatus } : c
      )
    )
  }

  if (loading && cases.length === 0) {
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Título o indicación..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="DRAFT">Borrador</option>
              <option value="IN_REVIEW">En Revisión</option>
              <option value="APPROVED">Aprobado</option>
              <option value="PUBLISHED">Publicado</option>
            </select>
          </div>

          {/* Complexity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complejidad
            </label>
            <select
              value={complexity}
              onChange={(e) => {
                setComplexity(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todas</option>
              <option value="BASIC">Básico</option>
              <option value="INTERMEDIATE">Intermedio</option>
              <option value="ADVANCED">Avanzado</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="rating">Mejor calificados</option>
              <option value="views">Más vistos</option>
              <option value="title">Título (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      {cases.length === 0 ? (
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
            No hay casos clínicos
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza generando un nuevo caso clínico
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {cases.map((caseItem) => (
              <CaseCard
                key={caseItem.id}
                id={caseItem.id}
                projectId={projectId}
                title={caseItem.title}
                indication={caseItem.indication}
                complexity={caseItem.complexity}
                status={caseItem.status}
                educationalObjective={caseItem.educationalObjective}
                targetAudience={caseItem.targetAudience}
                views={caseItem.views}
                rating={caseItem.rating}
                ratingCount={caseItem.ratingCount}
                createdAt={caseItem.createdAt}
                updatedAt={caseItem.updatedAt}
                publishedAt={caseItem.publishedAt}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Anterior
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(p)}
                      className="min-w-[40px]"
                    >
                      {p}
                    </Button>
                  )
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Siguiente →
              </Button>

              <span className="text-sm text-gray-600 ml-2">
                Página {page} de {totalPages} ({total} casos)
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
