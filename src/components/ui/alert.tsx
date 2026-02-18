import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'
import { AlertCircle, CheckCircle, InfoIcon, AlertTriangle, X } from 'lucide-react'

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-white text-gray-900 border-gray-200',
        destructive:
          'border-error-200 bg-error-50 text-error-800 [&>svg]:text-error-600',
        warning:
          'border-warning-200 bg-warning-50 text-warning-800 [&>svg]:text-warning-600',
        success:
          'border-success-200 bg-success-50 text-success-800 [&>svg]:text-success-600',
        info: 'border-primary-200 bg-primary-50 text-primary-800 [&>svg]:text-primary-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-tight tracking-tight', className)}
    {...props}
  />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

interface AlertBoxProps {
  variant?: 'destructive' | 'warning' | 'success' | 'info'
  title?: string
  description?: React.ReactNode
  onClose?: () => void
  className?: string
}

export function AlertBox({
  variant = 'info',
  title,
  description,
  onClose,
  className,
}: AlertBoxProps) {
  const icons = {
    destructive: <AlertCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    info: <InfoIcon className="h-4 w-4" />,
  }

  return (
    <Alert variant={variant} className={className}>
      {icons[variant]}
      <div className="flex flex-1 items-start justify-between gap-4">
        <div>
          {title && <AlertTitle>{title}</AlertTitle>}
          {description && <AlertDescription>{description}</AlertDescription>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-0.5 shrink-0 text-current opacity-50 hover:opacity-75"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </Alert>
  )
}

export { Alert, AlertTitle, AlertDescription }
