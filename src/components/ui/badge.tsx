import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-primary-200 bg-primary-100 text-primary-800 hover:bg-primary-200',
        secondary:
          'border-gray-200 bg-gray-100 text-gray-800 hover:bg-gray-200',
        success:
          'border-success-200 bg-success-100 text-success-800 hover:bg-success-200',
        warning:
          'border-warning-200 bg-warning-100 text-warning-800 hover:bg-warning-200',
        error:
          'border-error-200 bg-error-100 text-error-800 hover:bg-error-200',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
