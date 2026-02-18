/**
 * Approval Queue Page
 * Manage case review workflow and approvals
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertBox } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ApprovalButtons } from '@/components/approval/ApprovalButtons'
import { ApprovalDialog } from '@/components/approval/ApprovalDialog'
import { ValidationBadge } from '@/components/validation/ValidationBadge'
import type { ApprovalRequest, RejectionRequest } from '@/lib/validators/validation-validators'

interface QueueStats {
  pending: number
  readyToPublish: number
  approvedByMe: number
  averageReviewTime: number
}

interface CaseInQueue {
  id: string
  title: string
  status: string
  validationScore?: number
  complexity: string
  createdAt: string
  submittedAt?: string
  queuePosition?: number
  reviewer?: string
  estimatedReviewTime?: number
}

export default function ApprovalQueuePage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [stats, setStats] = useState<QueueStats | null>(null)
  const [cases, setCases] = useState<CaseInQueue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [stage, setStage] = useState('')
  const [complexity, setComplexity] = useState('')
  const [sort, setSort] = useState('queue-position')
  
  // Approval dialog state
  const [selectedCase, setSelectedCase] = useState<CaseInQueue | null>(null)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogLoading, setDialogLoading] = useState(false)

  const limit = 10

  // Fetch queue stats
  const fetchStats = async () => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/cases/approval/queue-stats`
      )
      const data = await response.json()
      if (response.ok) {
        setStats(data.data)
      }
    } catch (err) {
      console.error('Error fetching queue stats:', err)
    }
  }

  // Fetch cases in queue
  const fetchCases = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
        ...(stage && { stage }),
        ...(complexity && { complexity }),
      })

      const response = await fetch(
        `/api/projects/${projectId}/cases/approval/queue?${params}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar cola de aprobación')
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
    fetchStats()
    fetchCases()
  }, [projectId, page, stage, complexity, sort])

  // Handle approval action
  const handleApprovalAction = async (
    caseItem: CaseInQueue,
    action: 'approve' | 'reject'
  ) => {
    setSelectedCase(caseItem)
    setApprovalAction(action)
    setIsDialogOpen(true)
  }

  // Handle approval/rejection submission
  const handleApprovalSubmit = async (
    data: ApprovalRequest | RejectionRequest
  ) => {
    if (!selectedCase) return

    try {
      setDialogLoading(true)
      const endpoint =
        approvalAction === 'approve'
          ? `/api/projects/${projectId}/cases/${selectedCase.id}/approve`
          : `/api/projects/${projectId}/cases/${selectedCase.id}/reject`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (response.ok) {
        // Refresh stats and cases
        await fetchStats()
        await fetchCases()
        setIsDialogOpen(false)
        setSelectedCase(null)
      } else {
        setError(result.message || 'Error al procesar solicitud')
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
    } finally {
      setDialogLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_REVIEW':
        return <Badge variant="warning">En Revisión 👁️</Badge>
      case 'APPROVED':
        return <Badge variant="success">Aprobado ✓</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rechazado ✗</Badge>
      case 'DRAFT':
        return <Badge variant="secondary">Borrador</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading && !stats) {
    return <LoadingSpinner variant="md" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cola de Aprobación</h1>
          <p className="text-gray-600 mt-1">
            Gestiona la revisión y aprobación de casos clínicos
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/projects/${projectId}/cases`}>
            ← Volver a Casos
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Pending */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.pending}
                </div>
                <p className="text-gray-600 text-sm mt-2">Pendientes</p>
              </div>
            </CardContent>
          </Card>

          {/* Ready to Publish */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.readyToPublish}
                </div>
                <p className="text-gray-600 text-sm mt-2">Listos para Publicar</p>
              </div>
            </CardContent>
          </Card>

          {/* Approved by Me */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {stats.approvedByMe}
                </div>
                <p className="text-gray-600 text-sm mt-2">Aprobados por Mi</p>
              </div>
            </CardContent>
          </Card>

          {/* Average Review Time */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {stats.averageReviewTime}h
                </div>
                <p className="text-gray-600 text-sm mt-2">Tiempo Promedio</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stage Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etapa
            </label>
            <select
              value={stage}
              onChange={(e) => {
                setStage(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todas</option>
              <option value="IN_REVIEW">En Revisión</option>
              <option value="APPROVED">Aprobados</option>
              <option value="READY_TO_PUBLISH">Listos para Publicar</option>
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
              <option value="basic">Básica</option>
              <option value="intermediate">Intermedia</option>
              <option value="advanced">Avanzada</option>
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
              <option value="queue-position">Posición en Cola</option>
              <option value="newest">Más Recientes</option>
              <option value="oldest">Más Antiguos</option>
              <option value="score-high">Mayor Puntuación</option>
              <option value="score-low">Menor Puntuación</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases in Queue */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Casos en Cola</h2>
        {loading ? (
          <LoadingSpinner variant="sm" />
        ) : cases.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">No hay casos en la cola de aprobación</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {cases.map((caseItem, idx) => (
                <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Queue Position & Case Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          {/* Queue Number */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary">
                              #{caseItem.queuePosition || idx + 1}
                            </span>
                          </div>

                          {/* Case Details */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/projects/${projectId}/cases/${caseItem.id}`}
                              className="text-lg font-semibold text-primary hover:underline truncate"
                            >
                              {caseItem.title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {getStatusBadge(caseItem.status)}
                              <Badge variant="outline">{caseItem.complexity}</Badge>
                              {caseItem.reviewer && (
                                <Badge variant="secondary">👤 {caseItem.reviewer}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              Enviado:{' '}
                              {new Date(caseItem.submittedAt || caseItem.createdAt).toLocaleDateString(
                                'es-ES'
                              )}
                              {caseItem.estimatedReviewTime && (
                                <> • Est. revisión: {caseItem.estimatedReviewTime}h</>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Validation Score */}
                      <div className="flex-shrink-0">
                        {caseItem.validationScore !== undefined ? (
                          <ValidationBadge
                            score={caseItem.validationScore}
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

                      {/* Action Buttons */}
                      <div className="flex-shrink-0 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link
                            href={`/projects/${projectId}/cases/${caseItem.id}/validation`}
                          >
                            Ver Reporte
                          </Link>
                        </Button>
                        {caseItem.status === 'IN_REVIEW' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleApprovalAction(caseItem, 'approve')}
                            >
                              ✓ Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleApprovalAction(caseItem, 'reject')}
                            >
                              ✗ Rechazar
                            </Button>
                          </>
                        )}
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

      {/* Approval Dialog */}
      {selectedCase && approvalAction && (
        <ApprovalDialog
          isOpen={isDialogOpen}
          action={approvalAction}
          onConfirm={handleApprovalSubmit}
          onCancel={() => {
            setIsDialogOpen(false)
            setSelectedCase(null)
            setApprovalAction(null)
          }}
          loading={dialogLoading}
          caseTitle={selectedCase.title}
        />
      )}
    </div>
  )
}
