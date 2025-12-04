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
import { Textarea } from '@/components/ui/textarea'

import type { CreatePackDTO, ResourceType, DurationType } from '@/types/subscription.types'

interface CreateResourcePackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreatePackDTO) => Promise<void>
}

const defaultFormData: CreatePackDTO = {
  packCode: '',
  packName: '',
  resourceType: 'PROJECT',
  resourceAmount: 1,
  price: 0,
  originalPrice: undefined,
  currency: 'CNY',
  durationType: 'PERMANENT',
  durationDays: undefined,
  description: '',
  maxPurchaseCount: undefined,
  sortOrder: 0,
}

export function CreateResourcePackDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateResourcePackDialogProps) {
  const [formData, setFormData] = useState<CreatePackDTO>(defaultFormData)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setFormData(defaultFormData)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>创建扩容包</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="packCode">编码 *</Label>
              <Input
                id="packCode"
                value={formData.packCode}
                onChange={(e) =>
                  setFormData({ ...formData, packCode: e.target.value })
                }
                placeholder="如: PROJECT_10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="packName">名称 *</Label>
              <Input
                id="packName"
                value={formData.packName}
                onChange={(e) =>
                  setFormData({ ...formData, packName: e.target.value })
                }
                placeholder="如: 项目扩容包"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="resourceType">资源类型 *</Label>
              <Select
                value={formData.resourceType}
                onValueChange={(value) =>
                  setFormData({ ...formData, resourceType: value as ResourceType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROJECT">项目数</SelectItem>
                  <SelectItem value="MEMBER">成员数</SelectItem>
                  <SelectItem value="STORAGE">存储空间</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resourceAmount">资源额度 *</Label>
              <Input
                id="resourceAmount"
                type="number"
                min={1}
                value={formData.resourceAmount}
                onChange={(e) =>
                  setFormData({ ...formData, resourceAmount: parseInt(e.target.value) || 1 })
                }
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">售价 *</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={0.01}
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">原价</Label>
              <Input
                id="originalPrice"
                type="number"
                min={0}
                step={0.01}
                value={formData.originalPrice || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    originalPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="durationType">有效期类型 *</Label>
              <Select
                value={formData.durationType}
                onValueChange={(value) =>
                  setFormData({ ...formData, durationType: value as DurationType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERMANENT">永久</SelectItem>
                  <SelectItem value="FIXED_DAYS">固定天数</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.durationType === 'FIXED_DAYS' && (
              <div className="space-y-2">
                <Label htmlFor="durationDays">有效天数</Label>
                <Input
                  id="durationDays"
                  type="number"
                  min={1}
                  value={formData.durationDays || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationDays: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="扩容包描述..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">排序</Label>
            <Input
              id="sortOrder"
              type="number"
              min={0}
              value={formData.sortOrder || 0}
              onChange={(e) =>
                setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
              }
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              创建
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
