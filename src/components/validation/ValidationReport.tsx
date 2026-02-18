/**
 * ValidationReport Component
 * Displays comprehensive validation results with breakdown
 * Optimized with React.memo and useCallback
 */

'use client'

import React, { useCallback, useMemo } from 'react'
import { ValidationBadge } from './ValidationBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export interface ValidationIssue {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
  suggestedFix?: string
}

export interface ValidationScoreBreakdown {
  completeness: {
    score: number
    passed: number
    total: number
  }
  quality: {
    score: number
    passed: number
    total: number
  }
  accuracy: {
    score: number
    passed: number
    total: number
  }
}

export interface ValidationReportProps {
  score: number
  isValid: boolean
  breakdown: ValidationScoreBreakdown
  issues: ValidationIssue[]
  timestamp?: string
  onRefresh?: () => void | Promise<void>
  isLoading?: boolean
}

/**
 * Get severity color and icon
 */
const getSeverityConfig = (severity: 'error' | 'warning' | 'info') => {
  switch (severity) {
    case 'error':
      return { color: 'bg-red-50 border-red-200', icon: '✗', label: 'Error' }
    case 'warning':
      return { color: 'bg-yellow-50 border-yellow-200', icon: '⚠', label: 'Advertencia' }
    case 'info':
      return {
        color: 'bg-blue-50 border-blue-200',
        icon: 'ℹ',
        label: 'Información',
      }
  }
}

/**
 * Format relative time
 */
const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `Hace ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `Hace ${diffDays}d`
}

/**
 * ScoreBreakdown Component
 */
const ScoreBreakdownComponent = React.memo(
  ({
    label,
    score,
    passed,
    total,
  }: {
    label: string
    score: number
    passed: number
    total: number
  }) => {
    const percentage = Math.round((score / 100) * 100)

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm font-bold text-gray-700">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              percentage >= 75
                ? 'bg-green-500'
                : percentage >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500">
          {passed} de {total} checks pasados
        </div>
      </div>
    )
  }
)

ScoreBreakdownComponent.displayName = 'ScoreBreakdown'

/**
 * IssueItem Component
 */
const IssueItemComponent = React.memo(
  ({ issue }: { issue: ValidationIssue }) => {
    const config = getSeverityConfig(issue.severity)
    const [expanded, setExpanded] = React.useState(false)

    return (
      <div
        className={`p-4 rounded-lg border ${config.color} space-y-2`}
        data-testid={`issue-${issue.field}`}
      >
        <div className="flex items-start gap-3">
          <span className="text-lg flex-shrink-0">{config.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {issue.field}
              </Badge>
              <Badge
                variant={
                  issue.severity === 'error'
                    ? 'destructive'
                    : issue.severity === 'warning'
                      ? 'secondary'
                      : 'default'
                }
                className="text-xs"
              >
                {config.label}
              </Badge>
            </div>
            <p className="text-sm mt-2 text-gray-700">{issue.message}</p>

            {issue.suggestedFix && (
              <>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-primary hover:underline mt-2 font-medium"
                >
                  {expanded
                    ? '▼ Ocultar sugerencia'
                    : '▶ Ver sugerencia'}
                </button>
                {expanded && (
                  <div className="mt-2 p-3 bg-white rounded border-l-4 border-primary text-sm text-gray-700">
                    <strong>Sugerencia:</strong> {issue.suggestedFix}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }
)

IssueItemComponent.displayName = 'IssueItem'

/**
 * ValidationReport Component
 */
const ValidationReportComponent = React.forwardRef<
  HTMLDivElement,
  ValidationReportProps
>(
  (
    {
      score,
      isValid,
      breakdown,
      issues,
      timestamp,
      onRefresh,
      isLoading = false,
    },
    ref
  ) => {
    // Memoize status badge
    const statusBadge = useMemo(() => {
      return isValid ? (
        <Badge variant="success" className="text-sm">
          ✓ Válido
        </Badge>
      ) : (
        <Badge variant="destructive" className="text-sm">
          ✗ Inválido
        </Badge>
      )
    }, [isValid])

    // Group issues by severity
    const groupedIssues = useMemo(() => {
      const grouped = {
        error: [] as ValidationIssue[],
        warning: [] as ValidationIssue[],
        info: [] as ValidationIssue[],
      }
      issues.forEach((issue) => {
        grouped[issue.severity].push(issue)
      })
      return grouped
    }, [issues])

    // Handle refresh
    const handleRefresh = useCallback(async () => {
      if (onRefresh) {
        await onRefresh()
      }
    }, [onRefresh])

    return (
      <div ref={ref} className="space-y-6" data-testid="validation-report">
        {/* Header with Score and Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Reporte de Validación</CardTitle>
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner variant="sm" />
                      Actualizando...
                    </div>
                  ) : (
                    '🔄 Actualizar'
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Puntuación General</p>
                  <div className="flex items-center gap-3">
                    <ValidationBadge
                      score={score}
                      size="lg"
                      showTooltip
                      variant="compact"
                    />
                    {statusBadge}
                  </div>
                </div>

                {/* Timestamp */}
                {timestamp && (
                  <div className="text-right text-sm text-gray-500">
                    <p>Actualizado</p>
                    <p className="font-medium">
                      {formatRelativeTime(timestamp)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Desglose de Puntuación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ScoreBreakdownComponent
                label="Completitud"
                score={breakdown.completeness.score}
                passed={breakdown.completeness.passed}
                total={breakdown.completeness.total}
              />
              <ScoreBreakdownComponent
                label="Calidad"
                score={breakdown.quality.score}
                passed={breakdown.quality.passed}
                total={breakdown.quality.total}
              />
              <ScoreBreakdownComponent
                label="Precisión"
                score={breakdown.accuracy.score}
                passed={breakdown.accuracy.passed}
                total={breakdown.accuracy.total}
              />
            </div>
          </CardContent>
        </Card>

        {/* Issues Section */}
        {issues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Problemas Detectados ({issues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Errors */}
                {groupedIssues.error.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-red-800">
                      Errores ({groupedIssues.error.length})
                    </h3>
                    <div className="space-y-3">
                      {groupedIssues.error.map((issue, idx) => (
                        <IssueItemComponent
                          key={`error-${idx}`}
                          issue={issue}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {groupedIssues.warning.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-yellow-800">
                      Advertencias ({groupedIssues.warning.length})
                    </h3>
                    <div className="space-y-3">
                      {groupedIssues.warning.map((issue, idx) => (
                        <IssueItemComponent
                          key={`warning-${idx}`}
                          issue={issue}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Info */}
                {groupedIssues.info.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-blue-800">
                      Información ({groupedIssues.info.length})
                    </h3>
                    <div className="space-y-3">
                      {groupedIssues.info.map((issue, idx) => (
                        <IssueItemComponent
                          key={`info-${idx}`}
                          issue={issue}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Issues State */}
        {issues.length === 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-green-800 font-semibold">
                No hay problemas detectados
              </p>
              <p className="text-sm text-green-700 mt-1">
                Este caso cumple con todos los criterios de validación
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }
)

ValidationReportComponent.displayName = 'ValidationReport'

// Export memoized component
export const ValidationReport = React.memo(ValidationReportComponent)
