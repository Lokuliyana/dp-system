import * as React from 'react'

import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-0 rounded-lg border border-slate-200 shadow-sm overflow-hidden',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'flex flex-col gap-0 px-4 py-3 border-b border-slate-100 bg-slate-50/50',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('font-semibold leading-none tracking-tight text-slate-900', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-slate-500', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('p-4', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center p-4 pt-0', className)}
      {...props}
    />
  )
}

function CardSection({ className, title, description, action, children, ...props }: React.ComponentProps<'div'> & { title?: string, description?: string, action?: React.ReactNode }) {
  return (
    <div
      data-slot="card-section"
      className={cn('border-t border-slate-100 first:border-t-0', className)}
      {...props}
    >
      {(title || description || action) && (
        <div className="flex items-start justify-between gap-4 px-6 py-4 bg-slate-50/30">
          <div className="space-y-1">
            {title && <h4 className="text-sm font-medium text-slate-900">{title}</h4>}
            {description && <p className="text-xs text-slate-500">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-6 pt-2">
        {children}
      </div>
    </div>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardSection,
}
