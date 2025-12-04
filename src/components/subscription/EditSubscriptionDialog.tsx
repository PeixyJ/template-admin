import { useEffect, useState } from 'react'
import { CalendarIcon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { zhCN } from 'date-fns/locale'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { updateSubscription } from '@/services/subscription'
import type { SubscriptionVO, AdminUpdateSubscriptionDTO } from '@/types/subscription.types'

interface EditSubscriptionDialogProps {
  subscription: SubscriptionVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function parseDateFromString(dateString: string | null | undefined): Date | undefined {
  if (!dateString) return undefined
  try {
    return new Date(dateString)
  } catch {
    return undefined
  }
}

export function EditSubscriptionDialog({
  subscription,
  open,
  onOpenChange,
  onSuccess,
}: EditSubscriptionDialogProps) {
  const [seats, setSeats] = useState<number>(1)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [remark, setRemark] = useState('')
  const [loading, setLoading] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const originalEndDate = parseDateFromString(subscription?.endTime)

  useEffect(() => {
    if (open && subscription) {
      setSeats(subscription.seats)
      setEndDate(parseDateFromString(subscription.endTime))
      setRemark('')
    }
  }, [open, subscription])

  const hasChanges = subscription && (
    seats !== subscription.seats ||
    (endDate?.toDateString() !== originalEndDate?.toDateString()) ||
    remark.trim() !== ''
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subscription) return

    if (seats < 1) {
      toast.error('席位数必须大于 0')
      return
    }

    if (!hasChanges) {
      toast.error('请修改后再提交')
      return
    }

    setLoading(true)

    try {
      const updateData: AdminUpdateSubscriptionDTO = {}
      if (seats !== subscription.seats) {
        updateData.seats = seats
      }
      if (endDate?.toDateString() !== originalEndDate?.toDateString()) {
        updateData.endDate = endDate ? format(endDate, 'yyyy-MM-dd') : undefined
      }
      if (remark.trim()) {
        updateData.remark = remark.trim()
      }

      const response = await updateSubscription(subscription.id, updateData)
      if (response.code === 'SUCCESS') {
        toast.success('订阅更新成功')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(response.message || '更新订阅失败')
      }
    } catch (error) {
      console.error('Failed to update subscription:', error)
      toast.error('更新订阅失败')
    } finally {
      setLoading(false)
    }
  }

  if (!subscription) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑订阅</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>订阅 ID</Label>
            <Input value={`#${subscription.id}`} disabled />
          </div>

          <div className="space-y-2">
            <Label>计划</Label>
            <Input value={subscription.planName} disabled />
          </div>

          <div className="space-y-2">
            <Label>团队</Label>
            <Input value={subscription.teamName} disabled />
          </div>

          <NumberInput
            label="席位数"
            value={seats}
            onChange={setSeats}
            minValue={1}
          />

          <div className="space-y-2">
            <Label>结束日期</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {endDate ? format(endDate, 'yyyy年MM月dd日', { locale: zhCN }) : '选择日期'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  defaultMonth={endDate}
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date)
                    setCalendarOpen(false)
                  }}
                  locale={zhCN}
                  className="rounded-lg border"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              当前到期：{subscription.endTime ? new Date(subscription.endTime).toLocaleDateString('zh-CN') : '永久'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark">备注</Label>
            <Textarea
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="修改原因..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading || !hasChanges}>
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
