import { useState } from 'react'
import { Loader2Icon, CalendarIcon, PlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

import { extendSubscription } from '@/services/subscription'
import type {
  SubscriptionVO,
  SubscriptionStatus,
  ExtendSubscriptionDTO,
} from '@/types/subscription.types'

interface ExtendSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: SubscriptionVO | null
  onSuccess: () => void
}

const statusConfig: Record<SubscriptionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: '待生效', variant: 'outline' },
  ACTIVE: { label: '生效中', variant: 'default' },
  PAUSED: { label: '已暂停', variant: 'secondary' },
  EXPIRED: { label: '已过期', variant: 'destructive' },
  CANCELLED: { label: '已取消', variant: 'destructive' },
}

const QUICK_DAYS = [7, 30, 90, 180, 365]

export function ExtendSubscriptionDialog({
  open,
  onOpenChange,
  subscription,
  onSuccess,
}: ExtendSubscriptionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ExtendSubscriptionDTO>({
    days: 30,
    remark: undefined,
  })

  const resetForm = () => {
    setFormData({
      days: 30,
      remark: undefined,
    })
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const handleQuickDays = (days: number) => {
    setFormData((prev) => ({ ...prev, days }))
  }

  const handleSubmit = async () => {
    if (!subscription) return

    if (!formData.days || formData.days <= 0) {
      toast.error('请输入有效的延长天数')
      return
    }

    setLoading(true)
    try {
      const res = await extendSubscription(subscription.id, {
        days: formData.days,
        remark: formData.remark?.trim() || undefined,
      })

      if (res.data.code === 'SUCCESS') {
        toast.success(`订阅已延长 ${formData.days} 天`)
        handleClose(false)
        onSuccess()
      } else {
        toast.error(res.data.message || '延长订阅失败')
      }
    } catch (error) {
      console.error('Extend subscription error:', error)
      toast.error('延长订阅失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const calculateNewEndDate = () => {
    if (!subscription?.endDate || !formData.days) return null
    const endDate = new Date(subscription.endDate)
    endDate.setDate(endDate.getDate() + formData.days)
    return endDate.toLocaleDateString('zh-CN')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>延长订阅有效期</DialogTitle>
          <DialogDescription>
            {subscription ? (
              <div className="flex items-center gap-2">
                <span className="font-mono">{subscription.subscriptionNo}</span>
                <Badge variant={statusConfig[subscription.status]?.variant || 'outline'}>
                  {statusConfig[subscription.status]?.label || subscription.status}
                </Badge>
              </div>
            ) : (
              '延长订阅的有效期'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* 当前信息展示 */}
          {subscription && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">计划：</span>
                  <span className="font-medium">{subscription.planName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">团队：</span>
                  <span className="font-medium">{subscription.teamName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">当前结束日期：</span>
                  <span className="font-medium">
                    {subscription.endDate
                      ? new Date(subscription.endDate).toLocaleDateString('zh-CN')
                      : '永久'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 快捷选择 */}
          <div className="flex flex-col gap-2">
            <Label>快捷选择</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_DAYS.map((days) => (
                <Button
                  key={days}
                  variant={formData.days === days ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuickDays(days)}
                >
                  {days} 天
                </Button>
              ))}
            </div>
          </div>

          {/* 延长天数 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="days">
              延长天数 <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <PlusIcon className="size-4 text-muted-foreground" />
              <Input
                id="days"
                type="number"
                min={1}
                placeholder="输入延长天数"
                value={formData.days}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    days: e.target.value ? Number(e.target.value) : 0,
                  }))
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">天</span>
            </div>
          </div>

          {/* 新结束日期预览 */}
          {subscription?.endDate && formData.days > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
              <CalendarIcon className="size-4 text-green-600" />
              <span className="text-sm">
                新结束日期：
                <span className="font-medium text-green-700 dark:text-green-400">
                  {calculateNewEndDate()}
                </span>
              </span>
            </div>
          )}

          {/* 备注 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="remark">备注</Label>
            <Textarea
              id="remark"
              placeholder="输入延长原因或备注（可选）"
              value={formData.remark || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, remark: e.target.value }))
              }
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !formData.days}>
            {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            确认延长
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
