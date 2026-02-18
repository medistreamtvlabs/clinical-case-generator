/**
 * Batch Operations Page
 * Multi-case operations and bulk actions
 * Optimized with lazy loading and code splitting
 */

'use client'

import React, { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertBox } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Lazy load heavy components
const BatchExportDialog = dynamic(
  () => import('@/components/export/BatchExportDialog').then(mod => ({ default: mod.BatchExportDialog })),
  { loading: () => null }
)

const ValidationBadge = dynamic(
  () => import('@/components/validation/ValidationBadge').then(mod => ({ default: mod.ValidationBadge })),
  { loading: () => <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" /> }
)
import type { BatchExportRequest } from '@/lib/validators/validation-validators'

interface CaseForBatch {
  id: string
  title: string
  status: string
  validationScore?: number
  complexity: string
  createdAt: string
}

interface BatchOperation {
  id: string
  type: 'export' | 'validate' | 'status-change'
  caseCount: number
  status: 'completed' | 'in-progress' | 'failed'
  timestamp: string
  result?: string
}

export default function BatchOperationsPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [cases, setCases] = useState<CaseForBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  // Selection state
  const [selectedCases, setSelectedCases] = useState(new Set<string>())
  const [selectAll, setSelectAll] = useState(false)
  
  // Operations state
  const [operation, setOperation] = useState<'export' | 'validate' | 'status-change' | ''>('')
  const [isExporting, setIsExporting] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [operationLog, setOperationLog] = useState<BatchOperation[]>([])

  const limit = 10

  // Fetch cases
  const fetchCases = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
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

  // Fetch operation log
  const fetchOperationLog = async () => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/cases/batch-operations/log`
      )
      const data = await response.json()
      if (response.ok) {
        setOperationLog(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching operation log:', err)
    }
  }

  // Initial load
  useEffect(() => {
    fetchCases()
    fetchOperationLog()
  }, [projectId, page])

  // Update select all
  useEffect(() => {
    const allSelected = cases.length > 0 && cases.every((c) => selectedCases.has(c.id))
    setSelectAll(allSelected)
  }, [selectedCases, cases])

  // Handle select all toggle
  const handleSelectAllToggle = () => {
    if (selectAll) {
      setSelectedCases(new Set())
      setSelectAll(false)
    } else {
      setSelectedCases(new Set(cases.map((c) => c.id)))
      setSelectAll(true)
    }
  }

  // Handle individual case selection
  const handleCaseSelection = (caseId: string) => {
    const newSelected = new Set(selectedCases)
    if (newSelected.has(caseId)) {
      newSelected.delete(caseId)
    } else {
      newSelected.add(caseId)
    }
    setSelectedCases(newSelected)
  }

  // Handle batch validation
  const handleValidateSelected = async () => {
    if (selectedCases.size === 0) return

    try {
      setIsExporting(true)
      const response = await fetch(
        `/api/projects/${projectId}/cases/validate-batch`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseIds: Array.from(selectedCases),
            override: false,
          }),
        }
      )

      const data = await response.json()
      if (response.ok) {
        // Add to operation log
        const newOp: BatchOperation = {
          id: Date.now().toString(),
          type: 'validate',
          caseCount: selectedCases.size,
          status: 'completed',
          timestamp: new Date().toISOString(),
          result: `${selectedCases.size} casos validados`,
        }
        setOperationLog((prev) => [newOp, ...prev.slice(0, 4)])
        
        // Refresh cases
        await fetchCases()
        setSelectedCases(new Set())
      } else {
        setError(data.message || 'Error al validar casos')
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al validar casos'
      setError(errorMsg)
    } finally {
      setIsExporting(false)
    }
  }

  // Handle batch export
  const handleExportSelected = () => {
    if (selectedCases.size === 0) return
    setOperation('export')
    setShowExportDialog(true)
  }

  // Handle export confirmation
  const handleExportConfirm = async (data: BatchExportRequest) => {
    try {
      setIsExporting(true)
      const response = await fetch(
        `/api/projects/${projectId}/cases/export-batch`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      )

      const result = await response.json()
      if (response.ok) {
        // Trigger download
        const blob = new Blob([result.data], { type: 'application/octet-stream' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `export-${new Date().getTime()}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        // Add to operation log
        const newOp: BatchOperation = {
          id: Date.now().toString(),
          type: 'export',
          caseCount: selectedCases.size,
          status: 'completed',
          timestamp: new Date().toISOString(),
          result: `${selectedCases.size} casos exportados en ${data.format}`,
        }
        setOperationLog((prev) => [newOp, ...prev.slice(0, 4)])

        setShowExportDialog(false)
        setSelectedCases(new Set())
      } else {
        setError(result.message || 'Error al exportar casos')
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al exportar casos'
      setError(errorMsg)
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">Borrador</Badge>
      case 'IN_REVIEW':
        return <Badge variant="warning">En Revisión</Badge>
      case 'APPROVED':
        return <Badge variant="success">Aprobado</Badge>
      case 'PUBLISHED':
        return <Badge variant="default">Publicado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getOperationStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completado ✓</Badge>
      case 'in-progress':
        return <Badge variant="warning">En Progreso</Badge>
      case 'failed':
        return <Badge variant="destructive">Error ✗</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading && cases.length === 0) {
    return <LoadingSpinner variant="md" />
  }

  const selectedCaseIds = Array.from(selectedCases)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operaciones en Lote</h1>
          <p className="text-gray-600 mt-1">
            Realiza acciones en múltiples casos simultáneamente
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/projects/${projectId}/cases`}>
            ← Volver a Casos
          </Link>
        </Button>
      </div>

      {/* Instructions Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Instrucciones</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-blue-900">
            <li>
              <strong>1. Selecciona casos:</strong> Marca los casos que deseas procesar
            </li>
            <li>
              <strong>2. Elige operación:</strong> Selecciona qué hacer con los casos seleccionados
            </li>
            <li>
              <strong>3. Ejecuta:</strong> Haz clic en el botón de operación para procesar
            </li>
            <li>
              <strong>4. Revisa log:</strong> Consulta el historial de operaciones completadas
            </li>
          </ol>
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

      {/* Sticky Operations Bar */}
      {cases.length > 0 && (
        <div className="sticky top-0 z-40 bg-white border border-gray-200 rounded-lg shadow-md p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Selection Info */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAllToggle}
                className="w-5 h-5 rounded cursor-pointer"
              />
              <span className="font-semibold">
                {selectedCases.size} de {cases.length} seleccionados
                {totalPages > 1 && (
                  <span className="text-sm text-gray-500 ml-1">
                    (en esta página)
                  </span>
                )}
              </span>
            </div>

            {/* Operation Buttons */}
            {selectedCases.size > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleValidateSelected}
                  disabled={isExporting}
                  variant="outline"
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  {isExporting ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner variant="sm" />
                      Validando...
                    </div>
                  ) : (
                    `✓ Validar ${selectedCases.size}`
                  )}
                </Button>

                <Button
                  onClick={handleExportSelected}
                  disabled={isExporting}
                  variant="outline"
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  {isExporting ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner variant="sm" />
                      Exportando...
                    </div>
                  ) : (
                    `📥 Exportar ${selectedCases.size}`
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cases List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Casos Disponibles</h2>
        {loading ? (
          <LoadingSpinner variant="sm" />
        ) : cases.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">No hay casos disponibles</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              {cases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className={`hover:shadow-md transition-all ${
                    selectedCases.has(caseItem.id)
                      ? 'bg-blue-50 border-blue-300'
                      : ''
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedCases.has(caseItem.id)}
                        onChange={() => handleCaseSelection(caseItem.id)}
                        className="w-5 h-5 rounded cursor-pointer"
                      />

                      {/* Case Info */}
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
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Creado:{' '}
                          {new Date(caseItem.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>

                      {/* Validation Score */}
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

      {/* Recent Operations Log */}
      {operationLog.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Historial de Operaciones</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {operationLog.map((op) => (
                  <div
                    key={op.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium capitalize">
                        {op.type === 'export'
                          ? '📥 Exportación'
                          : op.type === 'validate'
                          ? '✓ Validación'
                          : 'Status Cambio'}
                        {' '}({op.caseCount} casos)
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{op.result}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(op.timestamp).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <div>
                      {getOperationStatusBadge(op.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Batch Export Dialog */}
      {showExportDialog && (
        <BatchExportDialog
          isOpen={showExportDialog}
          caseIds={selectedCaseIds}
          projectId={projectId}
          onConfirm={handleExportConfirm}
          onCancel={() => {
            setShowExportDialog(false)
            setOperation('')
          }}
        />
      )}
    </div>
  )
}
