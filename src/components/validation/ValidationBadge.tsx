/**
 * ValidationBadge Component
 * Displays validation score with color coding and tooltip
 * Optimized with React.memo for performance
 */

'use client'

import React, { useMemo } from 'react'

interface ValidationBadgeProps {
  score: number | null | undefined
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  variant?: 'compact' | 'detailed'
}

/**
 * Get color class based on validation score
 * Excellent: 90+ (green)
 * Good: 75-89 (blue)
 * Acceptable: 60-74 (yellow)
 * Needs Work: 45-59 (orange)
 * Insufficient: 0-44 (red)
 */
const getScoreColor = (score: number): string => {
  if (score >= 90) return 'bg-green-100 text-green-800 border-green-300'
  if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-300'
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
  if (score >= 45) return 'bg-orange-100 text-orange-800 border-orange-300'
  return 'bg-red-100 text-red-800 border-red-300'
}

/**
 * Get score label based on range
 */
const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excelente'
  if (score >= 75) return 'Bueno'
  if (score >= 60) return 'Aceptable'
  if (score >= 45) return 'Necesita mejoras'
  return 'Insuficiente'
}

/**
 * Get size classes for badge
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  switch (size) {
    case 'sm':
      return 'px-2 py-1 text-xs'
    case 'lg':
      return 'px-4 py-3 text-lg'
    case 'md':
    default:
      return 'px-3 py-2 text-sm'
  }
}

/**
 * ValidationBadge Component
 * Renders a color-coded validation score badge
 */
const ValidationBadgeComponent = React.forwardRef<
  HTMLDivElement,
  ValidationBadgeProps
>(
  (
    {
      score,
      size = 'md',
      showTooltip = false,
      variant = 'compact',
    },
    ref
  ) => {
    // Handle null/undefined scores
    const displayScore = useMemo(() => {
      if (score === null || score === undefined) {
        return null
      }
      return Math.round(score)
    }, [score])

    // Get color and label memoized
    const { colorClass, label, icon } = useMemo(() => {
      if (displayScore === null) {
        return { colorClass: '', label: 'Sin validar', icon: '-' }
      }

      const color = getScoreColor(displayScore)
      const lbl = getScoreLabel(displayScore)
      const iconChar =
        displayScore >= 90
          ? '✓'
          : displayScore >= 75
            ? '✔'
            : displayScore >= 60
              ? '⚠'
              : displayScore >= 45
                ? '▼'
                : '✗'

      return { colorClass: color, label: lbl, icon: iconChar }
    }, [displayScore])

    const sizeClasses = useMemo(() => getSizeClasses(size), [size])

    // Compact variant
    if (variant === 'compact') {
      return (
        <div
          ref={ref}
          className={`
            inline-flex items-center justify-center gap-1 rounded-md border
            font-semibold transition-all duration-200
            ${sizeClasses}
            ${colorClass || 'bg-gray-100 text-gray-800 border-gray-300'}
            ${showTooltip ? 'cursor-help' : ''}
          `}
          title={
            showTooltip && displayScore !== null
              ? `${label} - Puntuación: ${displayScore}/100`
              : undefined
          }
          data-testid={`validation-badge-${displayScore}`}
        >
          <span className="font-bold">{icon}</span>
          {size !== 'sm' && (
            <span className="hidden sm:inline">{displayScore}</span>
          )}
        </div>
      )
    }

    // Detailed variant
    return (
      <div
        ref={ref}
        className={`
          inline-flex flex-col items-center gap-1 rounded-md border
          font-semibold transition-all duration-200
          ${sizeClasses}
          ${colorClass || 'bg-gray-100 text-gray-800 border-gray-300'}
        `}
        title={
          showTooltip && displayScore !== null
            ? `${label} - Puntuación: ${displayScore}/100`
            : undefined
        }
        data-testid={`validation-badge-detailed-${displayScore}`}
      >
        <div className="text-lg">{icon}</div>
        <div className="text-center">
          {displayScore !== null && (
            <div className="font-bold text-lg">{displayScore}</div>
          )}
          <div className="text-xs">{label}</div>
        </div>
      </div>
    )
  }
)

ValidationBadgeComponent.displayName = 'ValidationBadge'

// Export memoized component
export const ValidationBadge = React.memo(ValidationBadgeComponent)
