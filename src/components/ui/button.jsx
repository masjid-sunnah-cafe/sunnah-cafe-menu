import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-brand-dark text-white hover:bg-brand-text-dark shadow-sm',
        brand:
          'bg-brand-green text-brand-card hover:bg-brand-green/90 shadow-md',
        gold:
          'bg-brand-gold text-brand-dark hover:bg-brand-gold/90 shadow-md',
        outline:
          'border border-brand-border bg-brand-card text-brand-text-dark hover:border-brand-gold/50 hover:bg-brand-bg',
        ghost:
          'text-brand-text-muted hover:text-brand-text-dark hover:bg-brand-border/40',
        link:
          'text-brand-gold underline-offset-4 hover:underline',
        'lang-active':
          'bg-brand-gold text-brand-dark shadow-md',
        'lang-inactive':
          'text-white/70 hover:text-white bg-transparent',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm:      'h-8 px-3 text-xs',
        lg:      'h-12 px-7 text-base',
        icon:    'h-9 w-9',
        'icon-md': 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  },
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
