import { useEffect, useState } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { NumberInputWithButtons } from '@/components/shadcn-studio/input/input-40'

import { grantResourcePack } from '@/services/subscription'
import type { AdminPackVO, GrantResourcePackDTO } from '@/types/subscription.types'

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
  const [formData, setFormData] = useState<Omit<GrantResourcePackDTO, 'packId'>>({
    teamId: 0,
    expireDays: undefined,
    reason: '',
  })
  const [loading, setLoading] = useState(false)
  const [useDefaultExpiry, setUseDefaultExpiry] = useState(true)

  useEffect(() => {
    if (open) {
      setFormData({
        teamId: 0,
        expireDays: undefined,
        reason: '',
      })
      setUseDefaultExpiry(true)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pack || !formData.teamId || !formData.reason) return

    setLoading(true)

    try {
      const submitData: GrantResourcePackDTO = {
        packId: pack.id,
        teamId: formData.teamId,
        reason: formData.reason,
        ...(useDefaultExpiry ? {} : { expireDays: formData.expireDays }),
      }
      const response = await grantResourcePack(submitData)
      if (response.code === 'SUCCESS') {
        toast.success('资源包赠送成功')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(response.message || '赠送失败')
      }
    } catch (error) {
      console.error('Failed to grant resource pack:', error)
      toast.error('赠送失败')
    } finally {
      setLoading(false)
    }
  }

  if (!pack) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>赠送资源包</DialogTitle>
          <DialogDescription>
            将 "{pack.packName}" 赠送给团队
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>资源包</Label>
            <Input value={`${pack.packName} (${pack.resourceAmount})`} disabled />
          </div>

          <NumberInputWithButtons
            label="团队ID *"
            value={formData.teamId || undefined}
            onChange={(value) =>
              setFormData({ ...formData, teamId: value })
            }
            minValue={1}
            step={1}
          />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch
                id="useDefaultExpiry"
                checked={useDefaultExpiry}
                onCheckedChange={setUseDefaultExpiry}
              />
              <Label htmlFor="useDefaultExpiry" className="font-normal">
                {useDefaultExpiry ? '使用资源包默认有效期' : '自定义有效期'}
              </Label>
            </div>
            {!useDefaultExpiry && (
              <NumberInputWithButtons
                label="有效天数"
                value={formData.expireDays}
                onChange={(value) =>
                  setFormData({ ...formData, expireDays: value })
                }
                minValue={1}
                step={1}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">赠送原因 *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="请输入赠送原因..."
              rows={3}
              required
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
            <Button type="submit" disabled={loading || !formData.teamId || !formData.reason}>
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              确认赠送
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
