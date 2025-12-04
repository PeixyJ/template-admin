import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'
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

import { adjustPoints } from '@/services/subscription'
import type { PointsAccountVO, AdjustPointsDTO } from '@/types/subscription.types'

interface AdjustPointsDialogProps {
  account: PointsAccountVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AdjustPointsDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
}: AdjustPointsDialogProps) {
  const [formData, setFormData] = useState<Omit<AdjustPointsDTO, 'teamId'>>({
    points: 0,
    expireDays: undefined,
    reason: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account || formData.points === 0) return

    setLoading(true)

    try {
      const response = await adjustPoints({
        teamId: account.teamId,
        ...formData,
      })
      if (response.code === 'SUCCESS') {
        const result = response.data
        const action = formData.points > 0 ? '增加' : '扣减'
        toast.success(`${action} ${Math.abs(formData.points)} 点数成功，当前可用: ${result.availablePoints}`)
        onSuccess()
        onOpenChange(false)
        setFormData({ points: 0, expireDays: undefined, reason: '' })
      } else {
        toast.error(response.message || '调整点数失败')
      }
    } catch (error) {
      console.error('Failed to adjust points:', error)
      toast.error('调整点数失败')
    } finally {
      setLoading(false)
    }
  }

  if (!account) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>调整点数</DialogTitle>
          <DialogDescription>
            为团队 "{account.teamName}" 调整点数（正数增加，负数扣减）
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>当前可用点数</Label>
            <Input value={account.availablePoints} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">调整数量 *</Label>
            <Input
              id="points"
              type="number"
              value={formData.points}
              onChange={(e) =>
                setFormData({ ...formData, points: parseInt(e.target.value) || 0 })
              }
              placeholder="正数增加，负数扣减"
              required
            />
            <p className="text-xs text-muted-foreground">
              输入正数表示增加点数，输入负数表示扣减点数
            </p>
          </div>

          {formData.points > 0 && (
            <div className="space-y-2">
              <Label htmlFor="expireDays">过期天数</Label>
              <Input
                id="expireDays"
                type="number"
                min={1}
                value={formData.expireDays || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expireDays: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="留空表示永不过期"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">调整原因</Label>
            <Textarea
              id="reason"
              value={formData.reason || ''}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="请输入调整原因..."
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
            <Button type="submit" disabled={loading || formData.points === 0}>
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              确认调整
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
