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

import { allocatePack } from '@/services/subscription'
import type { AdminPackVO, AllocatePackDTO } from '@/types/subscription.types'

interface AllocateResourcePackDialogProps {
  pack: AdminPackVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AllocateResourcePackDialog({
  pack,
  open,
  onOpenChange,
  onSuccess,
}: AllocateResourcePackDialogProps) {
  const [formData, setFormData] = useState<AllocatePackDTO>({
    teamId: 0,
    quantity: 1,
    expireDays: undefined,
    reason: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pack || !formData.teamId) return

    setLoading(true)

    try {
      const response = await allocatePack(pack.id, formData)
      if (response.code === 'SUCCESS') {
        toast.success('扩容包分配成功')
        onSuccess()
        onOpenChange(false)
        setFormData({ teamId: 0, quantity: 1, expireDays: undefined, reason: '' })
      } else {
        toast.error(response.message || '分配失败')
      }
    } catch (error) {
      console.error('Failed to allocate pack:', error)
      toast.error('分配失败')
    } finally {
      setLoading(false)
    }
  }

  if (!pack) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>分配扩容包</DialogTitle>
          <DialogDescription>
            将 "{pack.packName}" 分配给团队
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>扩容包</Label>
            <Input value={`${pack.packName} (${pack.resourceAmount} ${pack.resourceUnit})`} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamId">团队ID *</Label>
            <Input
              id="teamId"
              type="number"
              min={1}
              value={formData.teamId || ''}
              onChange={(e) =>
                setFormData({ ...formData, teamId: parseInt(e.target.value) || 0 })
              }
              placeholder="请输入团队ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">数量</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={formData.quantity || 1}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
              }
            />
          </div>

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
              placeholder="留空表示使用默认过期时间"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">分配原因</Label>
            <Textarea
              id="reason"
              value={formData.reason || ''}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="请输入分配原因..."
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
            <Button type="submit" disabled={loading || !formData.teamId}>
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              确认分配
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
