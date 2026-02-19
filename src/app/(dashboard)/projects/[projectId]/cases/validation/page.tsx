/**
 * Validation Dashboard Page
 * Comprehensive validation overview and management
 * Optimized with lazy loading and code splitting
 */
'use client'
import React, { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Card, CardContent} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
// Lazy load ValidationBadge component
const ValidationBadge = dynamic(
  () => import('@/components/validation/ValidationBadge').then(mod => ({ default: mod.ValidationBadge })),
  { loading: () => <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" /> }
)
interface ValidationSummary {
  totalCases: number
  validCases: number
  invalidCases: number
  notValidatedCases: number
  averageScore: number
}
interface CaseValidation {
  id: string
  title: string
  status: string
  score?: number
  validationStatus: 'valid' | 'invalid' | 'not-validated'
  complexity: string
  createdAt: string
  updatedAt: string
}
export default function ValidationDashboardPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [summary, setSummary] = useState<ValidationSummary | null>(null)
  const [cases, setCases] = useState<CaseValidation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [validationStatus, setValidationStatus] = useState('')
  const [scoreRange, setScoreRange] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [validatingAll, setValidatingAll] = useState(false)
  const [overrideValidation, setOverrideValidation] = useState(false)
  const limit = 10
  // Fetch validation summary
  const fetchSummary = async () => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/cases/validation/summary`
      )
      const data = await response.json()
      if (response.ok) {
        setSummary(data.data)
      }
    } catch (err) {
      console.error('Error fetching validation summary:', err)
    }
  }
  // Fetch cases with validation data
  const fetchCases = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
        ...(validationStatus && { validationStatus }),
        ...(scoreRange !== 'all' && { scoreRange }),
        ...(search && { search }),
      })
      const response = await fetch(
        `/api/projects/${projectId}/cases?${params}&includeValidation=true`
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
  // Initial load and refetch
  useEffect(() => {
    fetchSummary()
    fetchCases()
  }, [projectId, page, validationStatus, scoreRange, search, sort])
  // Handle validate all
  const handleValidateAll = async () => {
    try {
      setValidatingAll(true)
      const response = await fetch(
        `/api/projects/${projectId}/cases/validate-batch`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseIds: cases.map((c) => c.id),
            override: overrideValidation,
          }),
        }
      )
      const data = await response.json()
      if (response.ok) {
        // Refresh both summary and cases
        await fetchSummary()
        await fetchCases()
      } else {
        setError(data.message || 'Error validating cases')
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al validar casos'
      setError(errorMsg)
    } finally {
      setValidatingAll(false)
    }
  }
  const getValidationStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge variant="success">Válido ✓</Badge>
      case 'invalid':
        return <Badge variant="destructive">Inválido ✗</Badge>
      case 'not-validated':
        return <Badge variant="secondary">Sin validar →</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }
  const getScoreRangeLabel = (range: string) => {
    switch (range) {
      case 'excellent':
        return 'Excelente (90+)'
      case 'good':
        return 'Bueno (75-89)'
      case 'acceptable':
        return 'Aceptable (60-74)'
      case 'needs-work':
        return 'Necesita mejoras (<60)'
      default:
        return 'Todos'
    }
  }
  if (loading && !summary) {
    return <LoadingSpinner variant="md" />
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel de Validación</h1>
          <p className="text-gray-600 mt-1">
            Supervisa la calidad y validez de tus casos clínicos
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/projects/${projectId}/cases`}>
            ← Volver a Casos
          </Link>
        </Button>
      </div>
      {/* Stats Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Cases */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {summary.totalCases}
                </div>
                <p className="text-gray-600 text-sm mt-2">Casos Totales</p>
              </div>
            </CardContent>
          </Card>
          {/* Valid Cases */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {summary.validCases}
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  Casos Válidos ({summary.totalCases > 0 ? Math.round((summary.validCases / summary.totalCases) * 100) : 0}%)
                </p>
              </div>
            </CardContent>
          </Card>
          {/* Average Score */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {summary.averageScore.toFixed(1)}
                </div>
                <p className="text-gray-600 text-sm mt-2">Puntuación Promedio</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Quick Actions Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overrideValidation}
                  onChange={(e) => setOverrideValidation(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-blue-900">
                  Sobrescribir validaciones previas
                </span>
              </label>
            </div>
            <Button
              onClick={handleValidateAll}
              disabled={validatingAll || cases.length === 0}
              className="self-start"
            >
              {validatingAll ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner variant="sm" />
                  Validando {cases.length} casos...
                </div>
              ) : (
                `✓ Validar {${cases.length}} Caso${cases.length !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Error Alert */}
      {error && (
        <AlertBox
          variant="error"
          title="Error"
          description={error}
          onClose={() => setError(null)}
        />
      )}
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
          {/* Validation Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de Validación
            </label>
            <select
              value={validationStatus}
              onChange={(e) => {
                setValidationStatus(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="valid">Válido</option>
              <option value="invalid">Inválido</option>
              <option value="not-validated">Sin validar</option>
            </select>
          </div>
          {/* Score Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rango de Puntuación
            </label>
            <select
              value={scoreRange}
              onChange={(e) => {
                setScoreRange(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="excellent">Excelente (90+)</option>
              <option value="good">Bueno (75-89)</option>
              <option value="acceptable">Aceptable (60-74)</option>
              <option value="needs-work">Necesita mejoras (&lt;60)</option>
            </select>
          </div>
          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="score-high">Mayor puntuación</option>
              <option value="score-low">Menor puntuación</option>
              <option value="title">Título (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
      {/* Cases List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Casos Disponibles</h2>
        {loading ? (
          <LoadingSpinner variant="sm" />
        ) : cases.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">No hay casos que cumplan los criterios</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {cases.map((caseItem) => (
                <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Case Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/projects/${projectId}/cases/${caseItem.id}`}
                          className="text-lg font-semibold text-primary hover:underline truncate"
                        >
                          {caseItem.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {getValidationStatusBadge(caseItem.validationStatus)}
                          <Badge variant="outline">{caseItem.complexity}</Badge>
                          <Badge variant="outline">{caseItem.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Actualizado:{' '}
                          {new Date(caseItem.updatedAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      {/* Validation Badge */}
                      <div className="flex flex-col items-end gap-2">
                        {caseItem.score !== undefined ? (
                          <ValidationBadge
                            score={caseItem.score}
                            size="md"
                            showTooltip
                          />
                        ) : (
                          <div className="text-center">
                            <div className="text-2xl text-gray-300">-</div>
                            <p className="text-xs text-gray-500">Sin validar</p>
                          </div>
                        )}
                      </div>
                      {/* Action Button */}
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link
                            href={`/projects/${projectId}/cases/${caseItem.id}/validation`}
                          >
                            Ver Reporte
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Página {page} de {totalPages} ({total} casos totales)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ← Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Siguiente →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
