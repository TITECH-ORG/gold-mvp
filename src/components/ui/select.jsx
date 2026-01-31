import * as SelectPrimitive from '@radix-ui/react-select'
import { cn } from '../../lib/utils'

export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value

export function SelectTrigger({ className, children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'flex h-11 w-full items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 text-sm font-medium text-[hsl(var(--foreground))] shadow-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="material-symbols-rounded">expand_more</SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectContent({ className, children, ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-2xl',
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-2">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none focus:bg-[hsl(var(--secondary))]',
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}
