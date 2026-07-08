import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-brand-border bg-brand-bg text-brand-text-dark',
        popular:
          'border-transparent bg-brand-orange text-white uppercase tracking-wider font-bold text-[9px]',
        allergen:
          'border-tag-text-red/30 bg-tag-bg-red text-tag-text-red',
        halal:
          'border-halal/30 bg-halal-bg text-halal font-semibold',
        meta:
          'border-brand-border bg-brand-bg text-brand-text-dark',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
