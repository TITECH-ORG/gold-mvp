import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../lib/utils'

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex h-11 items-center justify-center rounded-full bg-[hsl(var(--secondary))] p-1 text-[hsl(var(--muted-foreground))]',
        className
      )}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-all data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]',
        className
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content className={cn('mt-4', className)} {...props} />
}
