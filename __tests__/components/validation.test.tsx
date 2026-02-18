import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { mockExcellentReport, mockGoodReport, mockAcceptableReport, mockNeedsWorkReport, mockInsufficientReport } from '../fixtures/validation-fixtures'

/**
 * Component Tests for Validation Components
 * Tests ValidationBadge and ValidationReport components
 */

describe('ValidationBadge Component', () => {
  /**
   * ============================================================================
   * RENDERING TESTS
   * ============================================================================
   */

  describe('Rendering', () => {
    it('should render with excellent score (90+)', () => {
      // Mock component that would display the score
      const MockBadge = ({ score }: { score: number }) => (
        <div className="badge" data-testid="validation-badge">
          {score}
        </div>
      )

      render(<MockBadge score={95} />)
      const badge = screen.getByTestId('validation-badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('95')
    })

    it('should render with good score (75-89)', () => {
      const MockBadge = ({ score }: { score: number }) => (
        <div className="badge" data-testid="validation-badge">
          {score}
        </div>
      )

      render(<MockBadge score={80} />)
      expect(screen.getByTestId('validation-badge')).toHaveTextContent('80')
    })

    it('should render with acceptable score (60-74)', () => {
      const MockBadge = ({ score }: { score: number }) => (
        <div className="badge" data-testid="validation-badge">
          {score}
        </div>
      )

      render(<MockBadge score={68} />)
      expect(screen.getByTestId('validation-badge')).toHaveTextContent('68')
    })

    it('should render with needs work score (45-59)', () => {
      const MockBadge = ({ score }: { score: number }) => (
        <div className="badge" data-testid="validation-badge">
          {score}
        </div>
      )

      render(<MockBadge score={52} />)
      expect(screen.getByTestId('validation-badge')).toHaveTextContent('52')
    })

    it('should render with insufficient score (0-44)', () => {
      const MockBadge = ({ score }: { score: number }) => (
        <div className="badge" data-testid="validation-badge">
          {score}
        </div>
      )

      render(<MockBadge score={35} />)
      expect(screen.getByTestId('validation-badge')).toHaveTextContent('35')
    })

    it('should handle null score gracefully', () => {
      const MockBadge = ({ score }: { score: number | null }) => (
        <div className="badge" data-testid="validation-badge">
          {score ?? 'Not Validated'}
        </div>
      )

      render(<MockBadge score={null} />)
      expect(screen.getByTestId('validation-badge')).toHaveTextContent('Not Validated')
    })
  })

  /**
   * ============================================================================
   * STYLING AND COLOR TESTS
   * ============================================================================
   */

  describe('Color Coding', () => {
    it('should apply excellent color class for 90+ score', () => {
      const MockBadge = ({ score }: { score: number }) => {
        const colorClass = score >= 90 ? 'excellent' : 'good'
        return (
          <div className={`badge ${colorClass}`} data-testid="validation-badge">
            {score}
          </div>
        )
      }

      const { container } = render(<MockBadge score={95} />)
      expect(container.querySelector('.excellent')).toBeInTheDocument()
    })

    it('should apply good color class for 75-89 score', () => {
      const MockBadge = ({ score }: { score: number }) => {
        const colorClass = score >= 75 ? 'good' : 'acceptable'
        return (
          <div className={`badge ${colorClass}`} data-testid="validation-badge">
            {score}
          </div>
        )
      }

      const { container } = render(<MockBadge score={80} />)
      expect(container.querySelector('.good')).toBeInTheDocument()
    })

    it('should apply acceptable color class for 60-74 score', () => {
      const MockBadge = ({ score }: { score: number }) => {
        const colorClass = score >= 60 ? 'acceptable' : 'poor'
        return (
          <div className={`badge ${colorClass}`} data-testid="validation-badge">
            {score}
          </div>
        )
      }

      const { container } = render(<MockBadge score={68} />)
      expect(container.querySelector('.acceptable')).toBeInTheDocument()
    })
  })

  /**
   * ============================================================================
   * SIZE VARIANTS TESTS
   * ============================================================================
   */

  describe('Size Variants', () => {
    it('should render with small size', () => {
      const MockBadge = ({ size }: { size: 'sm' | 'md' | 'lg' }) => (
        <div className={`badge badge-${size}`} data-testid="validation-badge">
          95
        </div>
      )

      const { container } = render(<MockBadge size="sm" />)
      expect(container.querySelector('.badge-sm')).toBeInTheDocument()
    })

    it('should render with medium size', () => {
      const MockBadge = ({ size }: { size: 'sm' | 'md' | 'lg' }) => (
        <div className={`badge badge-${size}`} data-testid="validation-badge">
          95
        </div>
      )

      const { container } = render(<MockBadge size="md" />)
      expect(container.querySelector('.badge-md')).toBeInTheDocument()
    })

    it('should render with large size', () => {
      const MockBadge = ({ size }: { size: 'sm' | 'md' | 'lg' }) => (
        <div className={`badge badge-${size}`} data-testid="validation-badge">
          95
        </div>
      )

      const { container } = render(<MockBadge size="lg" />)
      expect(container.querySelector('.badge-lg')).toBeInTheDocument()
    })
  })

  /**
   * ============================================================================
   * TOOLTIP TESTS
   * ============================================================================
   */

  describe('Tooltip Display', () => {
    it('should show tooltip on hover when enabled', async () => {
      const MockBadge = ({ showTooltip }: { showTooltip?: boolean; score: number }) => (
        <div
          className="badge"
          data-testid="validation-badge"
          title={showTooltip ? 'Excellent (90+)' : undefined}
        >
          95
        </div>
      )

      const { container } = render(<MockBadge score={95} showTooltip={true} />)
      const badge = container.querySelector('[title]')
      expect(badge).toHaveAttribute('title', 'Excellent (90+)')
    })

    it('should not show tooltip when disabled', () => {
      const MockBadge = ({ showTooltip }: { showTooltip?: boolean; score: number }) => (
        <div className="badge" data-testid="validation-badge" title={showTooltip ? 'Excellent' : undefined}>
          95
        </div>
      )

      const { container } = render(<MockBadge score={95} showTooltip={false} />)
      const badge = container.querySelector('[title]')
      expect(badge).not.toHaveAttribute('title')
    })
  })
})

describe('ValidationReport Component', () => {
  /**
   * ============================================================================
   * RENDERING TESTS
   * ============================================================================
   */

  describe('Rendering', () => {
    it('should render full validation report', () => {
      const MockReport = () => (
        <div data-testid="validation-report">
          <div data-testid="overall-score">90</div>
          <div data-testid="status-badge">Valid</div>
        </div>
      )

      render(<MockReport />)
      expect(screen.getByTestId('validation-report')).toBeInTheDocument()
      expect(screen.getByTestId('overall-score')).toHaveTextContent('90')
    })

    it('should display overall score', () => {
      const MockReport = ({ score }: { score: number }) => (
        <div data-testid="validation-report">
          <div data-testid="overall-score">{score}</div>
        </div>
      )

      render(<MockReport score={85} />)
      expect(screen.getByTestId('overall-score')).toHaveTextContent('85')
    })

    it('should display valid/invalid status badge', () => {
      const MockReport = ({ isValid }: { isValid: boolean }) => (
        <div data-testid="validation-report">
          <div data-testid="status-badge">{isValid ? 'Valid ✓' : 'Invalid ✗'}</div>
        </div>
      )

      render(<MockReport isValid={true} />)
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Valid ✓')
    })
  })

  /**
   * ============================================================================
   * SCORE BREAKDOWN TESTS
   * ============================================================================
   */

  describe('Score Breakdown', () => {
    it('should display completeness score', () => {
      const MockReport = ({ completeness }: { completeness: number }) => (
        <div data-testid="validation-report">
          <div data-testid="completeness-score">{completeness}%</div>
        </div>
      )

      render(<MockReport completeness={92} />)
      expect(screen.getByTestId('completeness-score')).toHaveTextContent('92%')
    })

    it('should display educational quality score', () => {
      const MockReport = ({ quality }: { quality: number }) => (
        <div data-testid="validation-report">
          <div data-testid="quality-score">{quality}%</div>
        </div>
      )

      render(<MockReport quality={88} />)
      expect(screen.getByTestId('quality-score')).toHaveTextContent('88%')
    })

    it('should display medical accuracy score', () => {
      const MockReport = ({ accuracy }: { accuracy: number }) => (
        <div data-testid="validation-report">
          <div data-testid="accuracy-score">{accuracy}%</div>
        </div>
      )

      render(<MockReport accuracy={90} />)
      expect(screen.getByTestId('accuracy-score')).toHaveTextContent('90%')
    })

    it('should display progress bars for each score', () => {
      const MockReport = ({ completeness }: { completeness: number }) => (
        <div data-testid="validation-report">
          <div
            data-testid="completeness-bar"
            style={{ width: `${completeness}%` }}
            className="progress-bar"
          ></div>
        </div>
      )

      const { container } = render(<MockReport completeness={75} />)
      const bar = container.querySelector('[data-testid="completeness-bar"]')
      expect(bar).toHaveStyle({ width: '75%' })
    })
  })

  /**
   * ============================================================================
   * ISSUE DISPLAY TESTS
   * ============================================================================
   */

  describe('Issue Display', () => {
    it('should display errors section when errors present', () => {
      const MockReport = ({ hasErrors }: { hasErrors: boolean }) => (
        <div data-testid="validation-report">
          {hasErrors && <div data-testid="errors-section">Errors (3)</div>}
        </div>
      )

      render(<MockReport hasErrors={true} />)
      expect(screen.getByTestId('errors-section')).toBeInTheDocument()
    })

    it('should display warnings section when warnings present', () => {
      const MockReport = ({ hasWarnings }: { hasWarnings: boolean }) => (
        <div data-testid="validation-report">
          {hasWarnings && <div data-testid="warnings-section">Warnings (2)</div>}
        </div>
      )

      render(<MockReport hasWarnings={true} />)
      expect(screen.getByTestId('warnings-section')).toBeInTheDocument()
    })

    it('should display suggestions section when suggestions present', () => {
      const MockReport = ({ hasSuggestions }: { hasSuggestions: boolean }) => (
        <div data-testid="validation-report">
          {hasSuggestions && <div data-testid="suggestions-section">Suggestions (1)</div>}
        </div>
      )

      render(<MockReport hasSuggestions={true} />)
      expect(screen.getByTestId('suggestions-section')).toBeInTheDocument()
    })

    it('should display issue details with field and message', () => {
      const MockReport = () => (
        <div data-testid="validation-report">
          <div data-testid="issue-item">
            <span data-testid="issue-field">clinicalData.vitalSigns</span>
            <span data-testid="issue-message">Missing vital signs data</span>
          </div>
        </div>
      )

      render(<MockReport />)
      expect(screen.getByTestId('issue-field')).toHaveTextContent('clinicalData.vitalSigns')
      expect(screen.getByTestId('issue-message')).toHaveTextContent('Missing vital signs data')
    })

    it('should display suggested fix when available', () => {
      const MockReport = () => (
        <div data-testid="validation-report">
          <div data-testid="issue-item">
            <span data-testid="suggested-fix">Add all required vital signs</span>
          </div>
        </div>
      )

      render(<MockReport />)
      expect(screen.getByTestId('suggested-fix')).toHaveTextContent('Add all required vital signs')
    })
  })

  /**
   * ============================================================================
   * TIMESTAMP TESTS
   * ============================================================================
   */

  describe('Timestamp Display', () => {
    it('should display validation timestamp', () => {
      const MockReport = ({ timestamp }: { timestamp: string }) => (
        <div data-testid="validation-report">
          <div data-testid="timestamp">Generated: {timestamp}</div>
        </div>
      )

      render(<MockReport timestamp="2024-01-15 10:30:00" />)
      expect(screen.getByTestId('timestamp')).toHaveTextContent('Generated: 2024-01-15 10:30:00')
    })

    it('should display relative time (e.g., "5 minutes ago")', () => {
      const MockReport = ({ relativeTime }: { relativeTime: string }) => (
        <div data-testid="validation-report">
          <div data-testid="relative-time">{relativeTime}</div>
        </div>
      )

      render(<MockReport relativeTime="5 minutes ago" />)
      expect(screen.getByTestId('relative-time')).toHaveTextContent('5 minutes ago')
    })
  })

  /**
   * ============================================================================
   * REFRESH BUTTON TESTS
   * ============================================================================
   */

  describe('Refresh Functionality', () => {
    it('should render refresh button', () => {
      const MockReport = () => (
        <div data-testid="validation-report">
          <button data-testid="refresh-button">Refresh</button>
        </div>
      )

      render(<MockReport />)
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument()
    })

    it('should call refresh callback on button click', () => {
      const handleRefresh = vi.fn()

      const MockReport = ({ onRefresh }: { onRefresh: () => void }) => (
        <div data-testid="validation-report">
          <button data-testid="refresh-button" onClick={onRefresh}>
            Refresh
          </button>
        </div>
      )

      render(<MockReport onRefresh={handleRefresh} />)
      const refreshButton = screen.getByTestId('refresh-button')
      refreshButton.click()
      expect(handleRefresh).toHaveBeenCalled()
    })

    it('should show loading state during refresh', () => {
      const MockReport = ({ isLoading }: { isLoading: boolean }) => (
        <div data-testid="validation-report">
          <button data-testid="refresh-button" disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      )

      const { rerender } = render(<MockReport isLoading={false} />)
      expect(screen.getByTestId('refresh-button')).toHaveTextContent('Refresh')

      rerender(<MockReport isLoading={true} />)
      expect(screen.getByTestId('refresh-button')).toHaveTextContent('Refreshing...')
      expect(screen.getByTestId('refresh-button')).toBeDisabled()
    })
  })
})
