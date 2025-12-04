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

import type { CreateFeatureDTO, FeatureType } from '@/types/subscription.types'

interface CreateFeatureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateFeatureDTO) => Promise<void>
}

const defaultFormData: CreateFeatureDTO = {
  featureCode: '',
  featureName: '',
  featureType: 'BOOLEAN',
  description: '',
  pointsCost: undefined,
  sortOrder: 0,
}

export function CreateFeatureDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateFeatureDialogProps) {
  const [formData, setFormData] = useState<CreateFeatureDTO>(defaultFormData)
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
          <DialogTitle>创建功能</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="featureCode">功能编码 *</Label>
              <Input
                id="featureCode"
                value={formData.featureCode}
                onChange={(e) =>
                  setFormData({ ...formData, featureCode: e.target.value })
                }
                placeholder="如: AI_GENERATE"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featureName">功能名称 *</Label>
              <Input
                id="featureName"
                value={formData.featureName}
                onChange={(e) =>
                  setFormData({ ...formData, featureName: e.target.value })
                }
                placeholder="如: AI 生成"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="featureType">功能类型 *</Label>
              <Select
                value={formData.featureType}
                onValueChange={(value) =>
                  setFormData({ ...formData, featureType: value as FeatureType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOOLEAN">开关型（有/无）</SelectItem>
                  <SelectItem value="POINTS">点数型（消耗点数）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">排序</Label>
              <Input
                id="sortOrder"
                type="number"
                min={0}
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          {formData.featureType === 'POINTS' && (
            <div className="space-y-2">
              <Label htmlFor="pointsCost">点数消耗（每次）</Label>
              <Input
                id="pointsCost"
                type="number"
                min={0}
                value={formData.pointsCost || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pointsCost: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="每次使用消耗的点数"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="功能描述..."
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
