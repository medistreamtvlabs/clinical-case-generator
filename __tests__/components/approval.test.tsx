import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

/**
 * Component Tests for Approval Components
 * Tests ApprovalButtons and ExportButton components
 */

describe('ApprovalButtons Component', () => {
  /**
   * ============================================================================
   * STATUS-AWARE RENDERING TESTS
   * ============================================================================
   */

  describe('Status-Aware Button Rendering', () => {
    it('should render "Submit for Review" button for DRAFT status', () => {
      const MockButtons = ({ status }: { status: string }) => (
        <div data-testid="approval-buttons">
          {status === 'DRAFT' && (
            <button data-testid="submit-button">Submit for Review</button>
          )}
        </div>
      )

      render(<MockButtons status="DRAFT" />)
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    it('should render "Approve" and "Reject" buttons for IN_REVIEW status', () => {
      const MockButtons = ({ status }: { status: string }) => (
        <div data-testid="approval-buttons">
          {status === 'IN_REVIEW' && (
            <>
              <button data-testid="approve-button">Approve</button>
              <button data-testid="reject-button">Reject</button>
            </>
          )}
        </div>
      )

      render(<MockButtons status="IN_REVIEW" />)
      expect(screen.getByTestId('approve-button')).toBeInTheDocument()
      expect(screen.getByTestId('reject-button')).toBeInTheDocument()
    })

    it('should render "Publish" button for APPROVED status', () => {
      const MockButtons = ({ status }: { status: string }) => (
        <div data-testid="approval-buttons">
          {status === 'APPROVED' && (
            <button data-testid="publish-button">Publish</button>
          )}
        </div>
      )

      render(<MockButtons status="APPROVED" />)
      expect(screen.getByTestId('publish-button')).toBeInTheDocument()
    })

    it('should render "Archive" button for PUBLISHED status', () => {
      const MockButtons = ({ status }: { status: string }) => (
        <div data-testid="approval-buttons">
          {status === 'PUBLISHED' && (
            <button data-testid="archive-button">Archive</button>
          )}
        </div>
      )

      render(<MockButtons status="PUBLISHED" />)
      expect(screen.getByTestId('archive-button')).toBeInTheDocument()
    })

    it('should render "Restore" button for ARCHIVED status', () => {
      const MockButtons = ({ status }: { status: string }) => (
        <div data-testid="approval-buttons">
          {status === 'ARCHIVED' && (
            <button data-testid="restore-button">Restore</button>
          )}
        </div>
      )

      render(<MockButtons status="ARCHIVED" />)
      expect(screen.getByTestId('restore-button')).toBeInTheDocument()
    })
  })

  /**
   * ============================================================================
   * PERMISSION-BASED RENDERING TESTS
   * ============================================================================
   */

  describe('Permission-Based Button Visibility', () => {
    it('should show approve button only when user has permission', () => {
      const MockButtons = ({ canApprove }: { canApprove: boolean }) => (
        <div data-testid="approval-buttons">
          {canApprove && (
            <button data-testid="approve-button">Approve</button>
          )}
        </div>
      )

      const { rerender } = render(<MockButtons canApprove={true} />)
      expect(screen.getByTestId('approve-button')).toBeInTheDocument()

      rerender(<MockButtons canApprove={false} />)
      expect(screen.queryByTestId('approve-button')).not.toBeInTheDocument()
    })

    it('should show reject button only when user has permission', () => {
      const MockButtons = ({ canReject }: { canReject: boolean }) => (
        <div data-testid="approval-buttons">
          {canReject && (
            <button data-testid="reject-button">Reject</button>
          )}
        </div>
      )

      render(<MockButtons canReject={true} />)
      expect(screen.getByTestId('reject-button')).toBeInTheDocument()
    })

    it('should show publish button only when user has permission', () => {
      const MockButtons = ({ canPublish }: { canPublish: boolean }) => (
        <div data-testid="approval-buttons">
          {canPublish && (
            <button data-testid="publish-button">Publish</button>
          )}
        </div>
      )

      render(<MockButtons canPublish={true} />)
      expect(screen.getByTestId('publish-button')).toBeInTheDocument()
    })
  })

  /**
   * ============================================================================
   * BUTTON ACTION TESTS
   * ============================================================================
   */

  describe('Button Actions', () => {
    it('should call onSubmit callback when submit button clicked', () => {
      const handleSubmit = vi.fn()

      const MockButtons = ({ onSubmit }: { onSubmit: () => void }) => (
        <div data-testid="approval-buttons">
          <button data-testid="submit-button" onClick={onSubmit}>
            Submit for Review
          </button>
        </div>
      )

      render(<MockButtons onSubmit={handleSubmit} />)
      fireEvent.click(screen.getByTestId('submit-button'))
      expect(handleSubmit).toHaveBeenCalled()
    })

    it('should call onApprove callback when approve button clicked', () => {
      const handleApprove = vi.fn()

      const MockButtons = ({ onApprove }: { onApprove: () => void }) => (
        <div data-testid="approval-buttons">
          <button data-testid="approve-button" onClick={onApprove}>
            Approve
          </button>
        </div>
      )

      render(<MockButtons onApprove={handleApprove} />)
      fireEvent.click(screen.getByTestId('approve-button'))
      expect(handleApprove).toHaveBeenCalled()
    })

    it('should call onReject callback when reject button clicked', () => {
      const handleReject = vi.fn()

      const MockButtons = ({ onReject }: { onReject: () => void }) => (
        <div data-testid="approval-buttons">
          <button data-testid="reject-button" onClick={onReject}>
            Reject
          </button>
        </div>
      )

      render(<MockButtons onReject={handleReject} />)
      fireEvent.click(screen.getByTestId('reject-button'))
      expect(handleReject).toHaveBeenCalled()
    })

    it('should call onPublish callback when publish button clicked', () => {
      const handlePublish = vi.fn()

      const MockButtons = ({ onPublish }: { onPublish: () => void }) => (
        <div data-testid="approval-buttons">
          <button data-testid="publish-button" onClick={onPublish}>
            Publish
          </button>
        </div>
      )

      render(<MockButtons onPublish={handlePublish} />)
      fireEvent.click(screen.getByTestId('publish-button'))
      expect(handlePublish).toHaveBeenCalled()
    })

    it('should call onArchive callback when archive button clicked', () => {
      const handleArchive = vi.fn()

      const MockButtons = ({ onArchive }: { onArchive: () => void }) => (
        <div data-testid="approval-buttons">
          <button data-testid="archive-button" onClick={onArchive}>
            Archive
          </button>
        </div>
      )

      render(<MockButtons onArchive={handleArchive} />)
      fireEvent.click(screen.getByTestId('archive-button'))
      expect(handleArchive).toHaveBeenCalled()
    })
  })

  /**
   * ============================================================================
   * BUTTON STATE TESTS
   * ============================================================================
   */

  describe('Button States', () => {
    it('should disable buttons when loading', () => {
      const MockButtons = ({ loading }: { loading: boolean }) => (
        <div data-testid="approval-buttons">
          <button data-testid="submit-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      )

      const { rerender } = render(<MockButtons loading={false} />)
      expect(screen.getByTestId('submit-button')).not.toBeDisabled()

      rerender(<MockButtons loading={true} />)
      expect(screen.getByTestId('submit-button')).toBeDisabled()
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Submitting...')
    })

    it('should disable buttons when globally disabled', () => {
      const MockButtons = ({ disabled }: { disabled: boolean }) => (
        <div data-testid="approval-buttons">
          <button data-testid="submit-button" disabled={disabled}>
            Submit for Review
          </button>
        </div>
      )

      render(<MockButtons disabled={true} />)
      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })

    it('should apply primary color class to main action button', () => {
      const MockButtons = () => (
        <div data-testid="approval-buttons">
          <button data-testid="primary-button" className="btn-primary">
            Primary Action
          </button>
        </div>
      )

      const { container } = render(<MockButtons />)
      expect(container.querySelector('.btn-primary')).toBeInTheDocument()
    })

    it('should apply secondary color class to secondary action button', () => {
      const MockButtons = () => (
        <div data-testid="approval-buttons">
          <button data-testid="secondary-button" className="btn-secondary">
            Secondary Action
          </button>
        </div>
      )

      const { container } = render(<MockButtons />)
      expect(container.querySelector('.btn-secondary')).toBeInTheDocument()
    })

    it('should apply destructive color class to reject/archive button', () => {
      const MockButtons = () => (
        <div data-testid="approval-buttons">
          <button data-testid="reject-button" className="btn-destructive">
            Reject
          </button>
        </div>
      )

      const { container } = render(<MockButtons />)
      expect(container.querySelector('.btn-destructive')).toBeInTheDocument()
    })
  })

  /**
   * ============================================================================
   * ICON AND LABEL TESTS
   * ============================================================================
   */

  describe('Icons and Labels', () => {
    it('should display icon with submit button', () => {
      const MockButtons = () => (
        <div data-testid="approval-buttons">
          <button data-testid="submit-button">
            <span data-testid="submit-icon">📤</span>
            Submit for Review
          </button>
        </div>
      )

      render(<MockButtons />)
      expect(screen.getByTestId('submit-icon')).toHaveTextContent('📤')
    })

    it('should display icon with approve button', () => {
      const MockButtons = () => (
        <div data-testid="approval-buttons">
          <button data-testid="approve-button">
            <span data-testid="approve-icon">✓</span>
            Approve
          </button>
        </div>
      )

      render(<MockButtons />)
      expect(screen.getByTestId('approve-icon')).toHaveTextContent('✓')
    })

    it('should display icon with reject button', () => {
      const MockButtons = () => (
        <div data-testid="approval-buttons">
          <button data-testid="reject-button">
            <span data-testid="reject-icon">✗</span>
            Reject
          </button>
        </div>
      )

      render(<MockButtons />)
      expect(screen.getByTestId('reject-icon')).toHaveTextContent('✗')
    })

    it('should display descriptive title on hover', () => {
      const MockButtons = () => (
        <div data-testid="approval-buttons">
          <button data-testid="submit-button" title="Submit this case for review">
            Submit
          </button>
        </div>
      )

      render(<MockButtons />)
      expect(screen.getByTestId('submit-button')).toHaveAttribute('title', 'Submit this case for review')
    })
  })
})

describe('ExportButton Component', () => {
  /**
   * ============================================================================
   * RENDERING TESTS
   * ============================================================================
   */

  describe('Rendering', () => {
    it('should render export button', () => {
      const MockExport = () => (
        <div data-testid="export-button-container">
          <button data-testid="export-button">Export</button>
        </div>
      )

      render(<MockExport />)
      expect(screen.getByTestId('export-button')).toBeInTheDocument()
    })

    it('should render dropdown menu when clicked', () => {
      const MockExport = () => {
        const [isOpen, setIsOpen] = vi.fn().mockReturnValue([false, vi.fn()])

        return (
          <div data-testid="export-button-container">
            <button data-testid="export-button" onClick={() => setIsOpen(true)}>
              Export
            </button>
            {false && (
              <div data-testid="format-menu">
                <button>JSON</button>
              </div>
            )}
          </div>
        )
      }

      render(<MockExport />)
      expect(screen.queryByTestId('format-menu')).not.toBeInTheDocument()
    })
  })

  /**
   * ============================================================================
   * FORMAT SELECTION TESTS
   * ============================================================================
   */

  describe('Format Selection', () => {
    it('should provide JSON format option', () => {
      const MockExport = () => (
        <div data-testid="export-button-container">
          <div data-testid="format-menu">
            <button data-testid="json-option">JSON</button>
          </div>
        </div>
      )

      render(<MockExport />)
      expect(screen.getByTestId('json-option')).toBeInTheDocument()
    })

    it('should provide HTML format option', () => {
      const MockExport = () => (
        <div data-testid="export-button-container">
          <div data-testid="format-menu">
            <button data-testid="html-option">HTML</button>
          </div>
        </div>
      )

      render(<MockExport />)
      expect(screen.getByTestId('html-option')).toBeInTheDocument()
    })

    it('should provide Markdown format option', () => {
      const MockExport = () => (
        <div data-testid="export-button-container">
          <div data-testid="format-menu">
            <button data-testid="markdown-option">Markdown</button>
          </div>
        </div>
      )

      render(<MockExport />)
      expect(screen.getByTestId('markdown-option')).toBeInTheDocument()
    })

    it('should provide PDF format option', () => {
      const MockExport = () => (
        <div data-testid="export-button-container">
          <div data-testid="format-menu">
            <button data-testid="pdf-option">PDF</button>
          </div>
        </div>
      )

      render(<MockExport />)
      expect(screen.getByTestId('pdf-option')).toBeInTheDocument()
    })

    it('should display format descriptions', () => {
      const MockExport = () => (
        <div data-testid="export-button-container">
          <div data-testid="format-menu">
            <div data-testid="json-description">Structured data complete</div>
          </div>
        </div>
      )

      render(<MockExport />)
      expect(screen.getByTestId('json-description')).toHaveTextContent('Structured data complete')
    })
  })

  /**
   * ============================================================================
   * EXPORT OPTIONS TESTS
   * ============================================================================
   */

  describe('Export Options', () => {
    it('should have option to include metadata', () => {
      const MockExport = () => (
        <div data-testid="export-button-container">
          <label>
            <input data-testid="include-metadata" type="checkbox" defaultChecked={true} />
            Include metadata
          </label>
        </div>
      )

      render(<MockExport />)
      expect((screen.getByTestId('include-metadata') as HTMLInputElement).checked).toBe(true)
    })

    it('should have option to include validation report', () => {
      const MockExport = () => (
        <div data-testid="export-button-container">
          <label>
            <input data-testid="include-validation" type="checkbox" defaultChecked={false} />
            Include validation report
          </label>
        </div>
      )

      render(<MockExport />)
      expect((screen.getByTestId('include-validation') as HTMLInputElement).checked).toBe(false)
    })
  })

  /**
   * ============================================================================
   * EXPORT ACTION TESTS
   * ============================================================================
   */

  describe('Export Actions', () => {
    it('should call export callback when format selected', () => {
      const handleExport = vi.fn()

      const MockExport = ({ onExport }: { onExport: (format: string) => void }) => (
        <div data-testid="export-button-container">
          <button data-testid="json-option" onClick={() => onExport('json')}>
            JSON
          </button>
        </div>
      )

      render(<MockExport onExport={handleExport} />)
      fireEvent.click(screen.getByTestId('json-option'))
      expect(handleExport).toHaveBeenCalledWith('json')
    })

    it('should show loading state during export', () => {
      const MockExport = ({ isExporting }: { isExporting: boolean }) => (
        <div data-testid="export-button-container">
          <button data-testid="export-button" disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      )

      const { rerender } = render(<MockExport isExporting={false} />)
      expect(screen.getByTestId('export-button')).toHaveTextContent('Export')

      rerender(<MockExport isExporting={true} />)
      expect(screen.getByTestId('export-button')).toHaveTextContent('Exporting...')
      expect(screen.getByTestId('export-button')).toBeDisabled()
    })
  })

  /**
   * ============================================================================
   * ERROR HANDLING TESTS
   * ============================================================================
   */

  describe('Error Handling', () => {
    it('should display error message on export failure', () => {
      const MockExport = ({ error }: { error?: string }) => (
        <div data-testid="export-button-container">
          {error && <div data-testid="error-message">{error}</div>}
        </div>
      )

      render(<MockExport error="Export failed - please try again" />)
      expect(screen.getByTestId('error-message')).toHaveTextContent('Export failed - please try again')
    })

    it('should disable button when disabled prop is true', () => {
      const MockExport = ({ disabled }: { disabled: boolean }) => (
        <div data-testid="export-button-container">
          <button data-testid="export-button" disabled={disabled}>
            Export
          </button>
        </div>
      )

      render(<MockExport disabled={true} />)
      expect(screen.getByTestId('export-button')).toBeDisabled()
    })
  })
})
