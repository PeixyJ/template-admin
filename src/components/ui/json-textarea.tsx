import { useState, useCallback } from 'react'
import { WandSparklesIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface JsonTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
  id?: string
}

export function JsonTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
  id,
}: JsonTextareaProps) {
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const validateJson = useCallback((jsonString: string): boolean => {
    if (!jsonString.trim()) {
      setError(null)
      setIsValid(null)
      return true
    }
    try {
      JSON.parse(jsonString)
      setError(null)
      setIsValid(true)
      return true
    } catch (e) {
      setError((e as Error).message)
      setIsValid(false)
      return false
    }
  }, [])

  const handleChange = (newValue: string) => {
    onChange(newValue)
    validateJson(newValue)
  }

  const handleFormat = () => {
    if (!value.trim()) return

    try {
      const parsed = JSON.parse(value)
      const formatted = JSON.stringify(parsed, null, 2)
      onChange(formatted)
      setError(null)
      setIsValid(true)
    } catch (e) {
      setError((e as Error).message)
      setIsValid(false)
    }
  }

  const handleMinify = () => {
    if (!value.trim()) return

    try {
      const parsed = JSON.parse(value)
      const minified = JSON.stringify(parsed)
      onChange(minified)
      setError(null)
      setIsValid(true)
    } catch (e) {
      setError((e as Error).message)
      setIsValid(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          rows={rows}
          className={cn(
            'font-mono text-sm pr-10',
            error && 'border-destructive focus-visible:ring-destructive/50',
            isValid === true && 'border-green-500 focus-visible:ring-green-500/50',
            className
          )}
        />
        {value.trim() && (
          <div className="absolute right-2 top-2">
            {isValid === true ? (
              <CheckCircleIcon className="size-4 text-green-500" />
            ) : isValid === false ? (
              <AlertCircleIcon className="size-4 text-destructive" />
            ) : null}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFormat}
            disabled={!value.trim()}
            className="h-7 text-xs"
          >
            <WandSparklesIcon className="mr-1 size-3" />
            格式化
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleMinify}
            disabled={!value.trim()}
            className="h-7 text-xs"
          >
            压缩
          </Button>
        </div>
        {error && (
          <p className="text-xs text-destructive truncate max-w-[200px]" title={error}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
