/**
 * ApprovalButtons Component
 * Status-aware buttons for case approval workflow
 * Optimized with React.memo and useCallback
 */

'use client'

import React, { useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CaseStatus } from '@prisma/client'

interface ApprovalButtonsProps {
  status: CaseStatus
  isLoading?: boolean
  canApprove?: boolean
  canReject?: boolean
  canPublish?: boolean
  canArchive?: boolean
  canRestore?: boolean
  onSubmitReview?: () => void | Promise<void>
  onApprove?: () => void | Promise<void>
  onReject?: () => void | Promise<void>
  onPublish?: () => void | Promise<void>
  onArchive?: () => void | Promise<void>
  onRestore?: () => void | Promise<void>
}

/**
 * Get status configuration
 */
const getStatusConfig = (status: CaseStatus) => {
  switch (status) {
    case 'DRAFT':
      return {
        display: 'Borrador',
        color: 'bg-gray-100 text-gray-800',
        icon: '📝',
      }
    case 'IN_REVIEW':
      return {
        display: 'En Revisión',
        color: 'bg-blue-100 text-blue-800',
        icon: '👁️',
      }
    case 'APPROVED':
      return {
        display: 'Aprobado',
        color: 'bg-green-100 text-green-800',
        icon: '✓',
      }
    case 'PUBLISHED':
      return {
        display: 'Publicado',
        color: 'bg-purple-100 text-purple-800',
        icon: '📚',
      }
    case 'ARCHIVED':
      return {
        display: 'Archivado',
        color: 'bg-gray-200 text-gray-700',
        icon: '📦',
      }
    case 'REJECTED':
      return {
        display: 'Rechazado',
        color: 'bg-red-100 text-red-800',
        icon: '✗',
      }
    default:
      return {
        display: status,
        color: 'bg-gray-100 text-gray-800',
        icon: '?',
      }
  }
}

/**
 * Button Group Item
 */
const ButtonItem = React.memo(
  ({
    icon,
    label,
    onClick,
    isLoading,
    disabled,
    variant = 'outline',
    title,
  }: {
    icon: string
    label: string
    onClick?: () => void | Promise<void>
    isLoading?: boolean
    disabled?: boolean
    variant?: 'outline' | 'default' | 'destructive'
    title?: string
  }) => {
    const handleClick = useCallback(async () => {
      if (onClick) {
        await onClick()
      }
    }, [onClick])

    return (
      <Button
        onClick={handleClick}
        disabled={disabled || isLoading}
        variant={variant}
        size="sm"
        title={title}
        className="flex items-center gap-2"
        data-testid={`approval-btn-${label.toLowerCase()}`}
      >
        {isLoading ? (
          <>
            <LoadingSpinner variant="sm" />
            <span>{label}...</span>
          </>
        ) : (
          <>
            <span>{icon}</span>
            <span>{label}</span>
          </>
        )}
      </Button>
    )
  }
)

ButtonItem.displayName = 'ButtonItem'

/**
 * ApprovalButtons Component
 */
const ApprovalButtonsComponent = React.forwardRef<
  HTMLDivElement,
  ApprovalButtonsProps
>(
  (
    {
      status,
      isLoading = false,
      canApprove = true,
      canReject = true,
      canPublish = true,
      canArchive = true,
      canRestore = true,
      onSubmitReview,
      onApprove,
      onReject,
      onPublish,
      onArchive,
      onRestore,
    },
    ref
  ) => {
    const statusConfig = useMemo(() => getStatusConfig(status), [status])

    // Determine which buttons to show based on status
    const buttons = useMemo(() => {
      switch (status) {
        case 'DRAFT':
          return [
            {
              visible: true,
              icon: '📤',
              label: 'Enviar a Revisión',
              onClick: onSubmitReview,
              title: 'Enviar este caso para revisión',
            },
          ]

        case 'IN_REVIEW':
          return [
            {
              visible: canApprove,
              icon: '✓',
              label: 'Aprobar',
              onClick: onApprove,
              title: 'Aprobar este caso para publicación',
              variant: 'default' as const,
            },
            {
              visible: canReject,
              icon: '✗',
              label: 'Rechazar',
              onClick: onReject,
              title: 'Rechazar este caso con retroalimentación',
              variant: 'destructive' as const,
            },
          ]

        case 'APPROVED':
          return [
            {
              visible: canPublish,
              icon: '📚',
              label: 'Publicar',
              onClick: onPublish,
              title: 'Publicar este caso',
              variant: 'default' as const,
            },
          ]

        case 'PUBLISHED':
          return [
            {
              visible: canArchive,
              icon: '📦',
              label: 'Archivar',
              onClick: onArchive,
              title: 'Archivar este caso',
              variant: 'destructive' as const,
            },
          ]

        case 'ARCHIVED':
          return [
            {
              visible: canRestore,
              icon: '↩️',
              label: 'Restaurar',
              onClick: onRestore,
              title: 'Restaurar este caso',
              variant: 'outline' as const,
            },
          ]

        case 'REJECTED':
          return [
            {
              visible: true,
              icon: '📝',
              label: 'Volver a Borrador',
              onClick: onSubmitReview,
              title: 'Volver a estado de borrador',
              variant: 'outline' as const,
            },
          ]

        default:
          return []
      }
    }, [
      status,
      canApprove,
      canReject,
      canPublish,
      canArchive,
      canRestore,
      onSubmitReview,
      onApprove,
      onReject,
      onPublish,
      onArchive,
      onRestore,
    ])

    const visibleButtons = useMemo(
      () => buttons.filter((btn) => btn.visible),
      [buttons]
    )

    return (
      <div ref={ref} className="space-y-3" data-testid="approval-buttons">
        {/* Status Display */}
        <div
          className={`inline-block px-4 py-2 rounded-lg font-semibold ${statusConfig.color} flex items-center gap-2`}
          data-testid={`status-badge-${status}`}
        >
          <span className="text-lg">{statusConfig.icon}</span>
          <span>{statusConfig.display}</span>
        </div>

        {/* Action Buttons */}
        {visibleButtons.length > 0 && (
          <div className="flex flex-wrap gap-2" data-testid="action-buttons">
            {visibleButtons.map((btn) => (
              <ButtonItem
                key={btn.label}
                icon={btn.icon}
                label={btn.label}
                onClick={btn.onClick}
                isLoading={isLoading}
                disabled={false}
                variant={btn.variant || 'outline'}
                title={btn.title}
              />
            ))}
          </div>
        )}

        {/* No Actions State */}
        {visibleButtons.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            No hay acciones disponibles para este estado
          </div>
        )}
      </div>
    )
  }
)

ApprovalButtonsComponent.displayName = 'ApprovalButtons'

// Export memoized component
export const ApprovalButtons = React.memo(ApprovalButtonsComponent)
