/**
 * ExportButton Component
 * Dropdown button for exporting cases in multiple formats
 * Optimized with React.memo and useCallback
 */

'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export type ExportFormat = 'json' | 'html' | 'markdown' | 'pdf'

interface ExportButtonProps {
  caseId: string
  disabled?: boolean
  isLoading?: boolean
  onExport?: (format: ExportFormat, options: ExportOptions) => void | Promise<void>
  showOptions?: boolean
}

export interface ExportOptions {
  format: ExportFormat
  includeMetadata?: boolean
  includeValidation?: boolean
}

/**
 * Export format descriptions
 */
const FORMAT_INFO: Record<
  ExportFormat,
  { label: string; icon: string; description: string }
> = {
  json: {
    label: 'JSON',
    icon: '{}',
    description: 'Formato estructurado, ideal para procesamiento automatizado',
  },
  html: {
    label: 'HTML',
    icon: '📄',
    description: 'Página web interactiva con estilos',
  },
  markdown: {
    label: 'Markdown',
    icon: '📝',
    description: 'Texto formateado, compatible con editores',
  },
  pdf: {
    label: 'PDF',
    icon: '📕',
    description: 'Documento imprimible de alta fidelidad',
  },
}

/**
 * Dropdown Menu Component
 */
const DropdownMenu = React.memo(
  ({
    formats,
    onSelect,
    showOptions,
  }: {
    formats: ExportFormat[]
    onSelect: (format: ExportFormat) => void
    showOptions: boolean
  }) => {
    const [expandedFormat, setExpandedFormat] = useState<ExportFormat | null>(
      null
    )

    return (
      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-max">
        {formats.map((format) => {
          const info = FORMAT_INFO[format]
          const isExpanded = expandedFormat === format

          return (
            <div key={format}>
              <button
                onClick={() => onSelect(format)}
                onMouseEnter={() =>
                  setExpandedFormat(showOptions ? format : null)
                }
                onMouseLeave={() => setExpandedFormat(null)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                data-testid={`export-format-${format}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{info.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{info.label}</div>
                    <div className="text-xs text-gray-600">
                      {info.description}
                    </div>
                  </div>
                </div>
              </button>

              {/* Options for expanded format */}
              {isExpanded && showOptions && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 last:border-b-0 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded"
                      data-testid={`option-metadata-${format}`}
                    />
                    <span>Incluir metadatos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded"
                      data-testid={`option-validation-${format}`}
                    />
                    <span>Incluir validación</span>
                  </label>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }
)

DropdownMenu.displayName = 'DropdownMenu'

/**
 * ExportButton Component
 */
const ExportButtonComponent = React.forwardRef<
  HTMLDivElement,
  ExportButtonProps
>(
  (
    {
      caseId,
      disabled = false,
      isLoading = false,
      onExport,
      showOptions = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)

    const formats = useMemo(
      () => ['json', 'html', 'markdown', 'pdf'] as ExportFormat[],
      []
    )

    const handleExport = useCallback(
      async (format: ExportFormat) => {
        if (onExport) {
          const options: ExportOptions = {
            format,
            includeMetadata: true,
            includeValidation: true,
          }
          await onExport(format, options)
        }
        setIsOpen(false)
      },
      [onExport]
    )

    return (
      <div ref={ref} className="relative inline-block" data-testid="export-button">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || isLoading}
          className="flex items-center gap-2"
          data-testid="export-button-main"
        >
          {isLoading ? (
            <>
              <LoadingSpinner variant="sm" />
              <span>Exportando...</span>
            </>
          ) : (
            <>
              <span>📥</span>
              <span>Exportar</span>
              <span className="ml-1">▼</span>
            </>
          )}
        </Button>

        {/* Dropdown Menu */}
        {isOpen && !isLoading && (
          <DropdownMenu
            formats={formats}
            onSelect={handleExport}
            showOptions={showOptions}
          />
        )}
      </div>
    )
  }
)

ExportButtonComponent.displayName = 'ExportButton'

// Export memoized component
export const ExportButton = React.memo(ExportButtonComponent)
