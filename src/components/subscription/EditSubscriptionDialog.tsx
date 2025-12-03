import { useState, useEffect } from 'react'
import { Loader2Icon, CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

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
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

import { adminUpdateSubscription, getSubscriptionDetail } from '@/services/subscription'
import type {
  SubscriptionVO,
  SubscriptionDetailVO,
  AdminUpdateSubscriptionDTO,
  SubscriptionStatus,
} from '@/types/subscription.types'
import { cn } from '@/lib/utils'

interface EditSubscriptionDialogProps {
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

export function EditSubscriptionDialog({
  open,
  onOpenChange,
  subscription,
  onSuccess,
}: EditSubscriptionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [fetchingDetail, setFetchingDetail] = useState(false)
  const [detail, setDetail] = useState<SubscriptionDetailVO | null>(null)

  const [formData, setFormData] = useState<AdminUpdateSubscriptionDTO>({
    endDate: undefined,
    seats: undefined,
    remark: undefined,
  })

  const [endDate, setEndDate] = useState<Date | undefined>()

  useEffect(() => {
    if (open && subscription) {
      fetchDetail(subscription.id)
    }
  }, [open, subscription])

  const fetchDetail = async (id: number) => {
    setFetchingDetail(true)
    try {
      const res = await getSubscriptionDetail(id)
      if (res.data.code === 'SUCCESS' && res.data.data) {
        const d = res.data.data
        setDetail(d)
        setFormData({
          endDate: d.endDate || undefined,
          seats: d.seats || undefined,
          remark: d.remark || undefined,
        })
        setEndDate(d.endDate ? new Date(d.endDate) : undefined)
      } else {
        toast.error('获取订阅详情失败')
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Fetch subscription detail error:', error)
      toast.error('获取订阅详情失败')
      onOpenChange(false)
    } finally {
      setFetchingDetail(false)
    }
  }

  const resetForm = () => {
    setFormData({
      endDate: undefined,
      seats: undefined,
      remark: undefined,
    })
    setEndDate(undefined)
    setDetail(null)
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    setFormData((prev) => ({
      ...prev,
      endDate: date ? format(date, 'yyyy-MM-dd') : undefined,
    }))
  }

  const handleSubmit = async () => {
    if (!subscription) return

    setLoading(true)
    try {
      const res = await adminUpdateSubscription(subscription.id, {
        ...formData,
        remark: formData.remark?.trim() || undefined,
      })

      if (res.data.code === 'SUCCESS') {
        toast.success('订阅更新成功')
        handleClose(false)
        onSuccess()
      } else {
        toast.error(res.data.message || '更新失败')
      }
    } catch (error) {
      console.error('Update subscription error:', error)
      toast.error('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>编辑订阅</DialogTitle>
          <DialogDescription>
            {detail ? (
              <div className="flex items-center gap-2">
                <span className="font-mono">{detail.subscriptionNo}</span>
                <Badge variant={statusConfig[detail.status]?.variant || 'outline'}>
                  {statusConfig[detail.status]?.label || detail.status}
                </Badge>
              </div>
            ) : (
              '修改订阅信息'
            )}
          </DialogDescription>
        </DialogHeader>

        {fetchingDetail ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 py-4">
              {/* 基本信息展示 */}
              {detail && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">计划：</span>
                      <span className="font-medium">{detail.planName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">团队：</span>
                      <span className="font-medium">{detail.teamName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">开始日期：</span>
                      <span>{new Date(detail.startDate).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">当前结束：</span>
                      <span>{detail.endDate ? new Date(detail.endDate).toLocaleDateString('zh-CN') : '永久'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 结束日期 */}
              <div className="flex flex-col gap-2">
                <Label>结束日期</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {endDate ? format(endDate, 'yyyy-MM-dd', { locale: zhCN }) : '选择结束日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  留空表示不修改结束日期
                </p>
              </div>

              {/* 席位数 */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="seats">席位数</Label>
                <Input
                  id="seats"
                  type="number"
                  min={1}
                  placeholder="输入席位数"
                  value={formData.seats || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seats: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  留空表示不修改席位数
                </p>
              </div>

              {/* 备注 */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="remark">备注</Label>
                <Textarea
                  id="remark"
                  placeholder="输入备注信息（可选）"
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
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
                保存
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
