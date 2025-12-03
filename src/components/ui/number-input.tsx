import { MinusIcon, PlusIcon } from 'lucide-react'
import {
  Button,
  Group,
  Input,
  Label,
  NumberField,
  type NumberFieldProps,
} from 'react-aria-components'
import { cn } from '@/lib/utils'

interface NumberInputProps extends Omit<NumberFieldProps, 'children'> {
  label?: string
  placeholder?: string
  className?: string
  hideLabel?: boolean
}

export function NumberInput({
  label,
  placeholder,
  className,
  hideLabel = false,
  ...props
}: NumberInputProps) {
  return (
    <NumberField className={cn('w-full space-y-2', className)} {...props}>
      {label && (
        <Label
          className={cn(
            'flex items-center gap-2 text-sm leading-none font-medium select-none',
            hideLabel && 'sr-only'
          )}
        >
          {label}
        </Label>
      )}
      <Group className="dark:bg-input/30 border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-[3px] md:text-sm">
        <Button
          slot="decrement"
          className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -ms-px flex aspect-square h-[inherit] items-center justify-center rounded-l-md border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MinusIcon className="size-4" />
          <span className="sr-only">减少</span>
        </Button>
        <Input
          placeholder={placeholder}
          className="selection:bg-primary selection:text-primary-foreground w-full grow px-3 py-2 text-center tabular-nums outline-none bg-transparent"
        />
        <Button
          slot="increment"
          className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center rounded-r-md border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon className="size-4" />
          <span className="sr-only">增加</span>
        </Button>
      </Group>
    </NumberField>
  )
}
