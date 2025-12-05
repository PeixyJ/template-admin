import { useState, useEffect } from 'react'
import { Loader2Icon, ChevronDownIcon, CalendarIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { setBatchExpiry } from '@/services/subscription'
import type { BatchVO } from '@/types/subscription.types'

interface SetBatchExpiryDialogProps {
  batch: BatchVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/**
 * 格式化日期时间为北京时间字符串 yyyy-MM-dd HH:mm:ss
 */
function formatBeijingDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function SetBatchExpiryDialog({
  batch,
  open,
  onOpenChange,
  onSuccess,
}: SetBatchExpiryDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [timeValue, setTimeValue] = useState<string>('23:59:59')
  const [loading, setLoading] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  useEffect(() => {
    if (open && batch) {
      if (batch.expireTime) {
        const date = new Date(batch.expireTime)
        setSelectedDate(date)
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const seconds = date.getSeconds().toString().padStart(2, '0')
        setTimeValue(`${hours}:${minutes}:${seconds}`)
      } else {
        setSelectedDate(undefined)
        setTimeValue('23:59:59')
      }
    }
  }, [open, batch])

  const getExpireDateTime = (): Date | null => {
    if (!selectedDate) return null
    const timeParts = timeValue.split(':').map(Number)
    const hours = timeParts[0] || 0
    const minutes = timeParts[1] || 0
    const seconds = timeParts[2] || 0
    const dateTime = new Date(selectedDate)
    dateTime.setHours(hours, minutes, seconds, 0)
    return dateTime
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!batch) return

    const expireDateTime = getExpireDateTime()
    // 如果选择了日期，则格式化；否则传 undefined 表示永久有效（不带 expireTime 参数）
    const expireTimeStr = expireDateTime ? formatBeijingDateTime(expireDateTime) : undefined

    setLoading(true)

    try {
      const response = await setBatchExpiry(batch.id, expireTimeStr)
      if (response.code === 'SUCCESS') {
        toast.success(expireTimeStr ? '过期时间设置成功' : '已设置为永久有效')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(response.message || '设置过期时间失败')
      }
    } catch (error) {
      console.error('Failed to set batch expiry:', error)
      toast.error('设置过期时间失败')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setSelectedDate(undefined)
    setTimeValue('23:59:59')
  }

  if (!batch) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="size-5" />
            设置批次过期时间
          </DialogTitle>
          <DialogDescription>
            为批次 "{batch.batchNo}" 设置过期时间。剩余点数: {batch.remainingPoints.toLocaleString('zh-CN')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <Label className="px-1">过期日期 *</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    {selectedDate
                      ? format(selectedDate, 'yyyy-MM-dd')
                      : '选择日期'}
                    <ChevronDownIcon className="size-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      setCalendarOpen(false)
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="time-picker" className="px-1">
                过期时间 *
              </Label>
              <Input
                type="time"
                id="time-picker"
                step="1"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                className="w-32 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            当前过期时间: {batch.expireTime ? formatBeijingDateTime(new Date(batch.expireTime)) : '永久有效'}
            {' '}(北京时间)
          </p>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <div className="flex gap-2">
              {selectedDate && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClear}
                  className="text-muted-foreground"
                >
                  <XIcon className="mr-1 size-4" />
                  清空
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading}
              >
                {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
                {selectedDate ? '确认设置' : '设为永久有效'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
