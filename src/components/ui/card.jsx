import { cn } from '../../lib/utils'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 text-[hsl(var(--card-foreground))] shadow-[0_20px_40px_rgba(0,0,0,0.35)]',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1 p-5', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-lg font-semibold', className)} {...props} />
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-[hsl(var(--muted-foreground))]', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5 pt-0', className)} {...props} />
}
