import { useEffect, useState } from 'react'
import { Loader2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { NumberInputWithButtons } from '@/components/shadcn-studio/input/input-40'

import type { AdminPackVO, UpdatePackDTO, ResourceType } from '@/types/subscription.types'

interface EditResourcePackDialogProps {
  pack: AdminPackVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (id: number, data: UpdatePackDTO) => Promise<void>
}

const resourceTypeLabels: Record<ResourceType, string> = {
  PROJECT: '项目数',
  MEMBER: '成员数',
  STORAGE: '存储空间',
}

export function EditResourcePackDialog({
  pack,
  open,
  onOpenChange,
  onSubmit,
}: EditResourcePackDialogProps) {
  const [formData, setFormData] = useState<UpdatePackDTO>({})
  const [loading, setLoading] = useState(false)
  const [isPermanent, setIsPermanent] = useState(true)

  useEffect(() => {
    if (open && pack) {
      const hasDuration = pack.durationDays !== null
      setIsPermanent(!hasDuration)
      setFormData({
        packName: pack.packName,
        resourceAmount: pack.resourceAmount,
        price: pack.price,
        originalPrice: pack.originalPrice ?? undefined,
        currency: pack.currency,
        durationDays: pack.durationDays ?? undefined,
        description: pack.description ?? undefined,
        isVisible: pack.isVisible,
        sortOrder: pack.sortOrder,
      })
    }
  }, [open, pack])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pack) return

    setLoading(true)

    try {
      const submitData: UpdatePackDTO = {
        ...formData,
        durationDays: isPermanent ? undefined : formData.durationDays,
      }
      await onSubmit(pack.id, submitData)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  if (!pack) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>编辑资源包</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>编码</Label>
              <Input value={pack.packCode} disabled />
            </div>
            <div className="space-y-2">
              <Label>资源类型</Label>
              <Input value={resourceTypeLabels[pack.resourceType] || pack.resourceType} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="packName">名称 *</Label>
            <Input
              id="packName"
              value={formData.packName || ''}
              onChange={(e) =>
                setFormData({ ...formData, packName: e.target.value })
              }
              placeholder="如: 项目扩容包"
              required
            />
          </div>

          <NumberInputWithButtons
            label="资源额度 *"
            value={formData.resourceAmount}
            onChange={(value) =>
              setFormData({ ...formData, resourceAmount: value })
            }
            minValue={1}
            step={1}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberInputWithButtons
              label="售价 *"
              value={formData.price}
              onChange={(value) =>
                setFormData({ ...formData, price: value })
              }
              minValue={0}
              step={0.01}
            />
            <NumberInputWithButtons
              label="原价"
              value={formData.originalPrice}
              onChange={(value) =>
                setFormData({ ...formData, originalPrice: value })
              }
              minValue={0}
              step={0.01}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">货币类型</Label>
            <Select
              value={formData.currency || 'CNY'}
              onValueChange={(value) =>
                setFormData({ ...formData, currency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CNY">人民币 (CNY)</SelectItem>
                <SelectItem value="USD">美元 (USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>有效期类型</Label>
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  id="isPermanent"
                  checked={isPermanent}
                  onCheckedChange={setIsPermanent}
                />
                <Label htmlFor="isPermanent" className="font-normal">
                  {isPermanent ? '永久有效' : '固定天数'}
                </Label>
              </div>
            </div>
            {!isPermanent && (
              <NumberInputWithButtons
                label="有效天数 *"
                value={formData.durationDays}
                onChange={(value) =>
                  setFormData({ ...formData, durationDays: value })
                }
                minValue={1}
                step={1}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="isVisible"
              checked={formData.isVisible ?? true}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isVisible: checked })
              }
            />
            <Label htmlFor="isVisible" className="font-normal">
              前端可见
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="资源包描述..."
              rows={3}
            />
          </div>

          <NumberInputWithButtons
            label="排序"
            value={formData.sortOrder}
            onChange={(value) =>
              setFormData({ ...formData, sortOrder: value })
            }
            minValue={0}
            step={1}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
