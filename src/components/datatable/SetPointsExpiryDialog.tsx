import { useState } from 'react'
import { Loader2Icon, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { cn } from '@/lib/utils'
import type { PointsAccountVO } from '@/types/subscription.types'

interface SetPointsExpiryDialogProps {
  account: PointsAccountVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (teamId: number, expireDate: string) => Promise<void>
}

export function SetPointsExpiryDialog({
  account,
  open,
  onOpenChange,
  onConfirm,
}: SetPointsExpiryDialogProps) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setDate(undefined)
      setError('')
    }
    onOpenChange(value)
  }

  const handleConfirm = async () => {
    if (!account || !date) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date < today) {
      setError('过期日期不能早于今天')
      return
    }

    setLoading(true)
    setError('')
    try {
      const expireDate = format(date, 'yyyy-MM-dd')
      await onConfirm(account.teamId, expireDate)
      handleOpenChange(false)
    } catch {
      setError('设置失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 快捷选项
  const quickOptions = [
    { label: '30 天后', days: 30 },
    { label: '60 天后', days: 60 },
    { label: '90 天后', days: 90 },
    { label: '180 天后', days: 180 },
    { label: '365 天后', days: 365 },
  ]

  const handleQuickSelect = (days: number) => {
    const newDate = new Date()
    newDate.setDate(newDate.getDate() + days)
    setDate(newDate)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>设置点数过期时间</DialogTitle>
          <DialogDescription>
            设置团队点数的统一过期时间
          </DialogDescription>
        </DialogHeader>

        {account && (
          <div className="flex flex-col gap-4">
            {/* Account Info */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">团队</span>
                  <span className="font-medium">{account.teamName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">可用点数</span>
                  <span className="font-medium text-primary">
                    {account.availablePoints.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Options */}
            <div className="flex flex-col gap-2">
              <Label>快捷选择</Label>
              <div className="flex flex-wrap gap-2">
                {quickOptions.map((option) => (
                  <Button
                    key={option.days}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(option.days)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Picker */}
            <div className="flex flex-col gap-2">
              <Label>过期日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {date ? format(date, 'yyyy年MM月dd日', { locale: zhCN }) : '选择日期'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    locale={zhCN}
                  />
                </PopoverContent>
              </Popover>
              <span className="text-xs text-muted-foreground">
                选择的日期将作为所有可用点数的过期时间
              </span>
            </div>

            {/* Preview */}
            {date && (
              <div className="rounded-lg border border-dashed p-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">过期时间设置为</span>
                  <span className="font-medium">
                    {format(date, 'yyyy年MM月dd日', { locale: zhCN })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    距今还有 {Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} 天
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !date}>
            {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            确认设置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
