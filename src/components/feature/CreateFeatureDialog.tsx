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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { createFeature } from '@/services/subscription'
import type { CreateFeatureDTO } from '@/types/subscription.types'

interface CreateFeatureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const FEATURE_TYPES = [
  { value: 'BOOLEAN', label: '开关型', description: '启用/禁用的功能开关' },
  { value: 'POINTS', label: '点数型', description: '需要消耗点数的功能' },
]

export function CreateFeatureDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateFeatureDialogProps) {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<CreateFeatureDTO>({
    featureCode: '',
    featureName: '',
    featureType: '',
    pointsCost: undefined,
    description: '',
    sortOrder: 0,
  })

  const resetForm = () => {
    setFormData({
      featureCode: '',
      featureName: '',
      featureType: '',
      pointsCost: undefined,
      description: '',
      sortOrder: 0,
    })
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async () => {
    if (!formData.featureCode.trim()) {
      toast.error('请输入功能编码')
      return
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.featureCode)) {
      toast.error('功能编码必须以字母开头，只能包含字母、数字和下划线')
      return
    }
    if (!formData.featureName.trim()) {
      toast.error('请输入功能名称')
      return
    }
    if (!formData.featureType) {
      toast.error('请选择功能类型')
      return
    }
    if (formData.featureType === 'POINTS' && (formData.pointsCost === undefined || formData.pointsCost < 0)) {
      toast.error('点数型功能必须设置消耗点数')
      return
    }

    setLoading(true)
    try {
      const res = await createFeature({
        ...formData,
        featureCode: formData.featureCode.trim(),
        featureName: formData.featureName.trim(),
        description: formData.description?.trim() || undefined,
      })

      if (res.data.code === 'SUCCESS') {
        toast.success('功能创建成功')
        handleClose(false)
        onSuccess()
      } else {
        toast.error(res.data.message || '创建失败')
      }
    } catch (error) {
      console.error('Create feature error:', error)
      toast.error('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>创建功能</DialogTitle>
          <DialogDescription>
            添加新的功能定义，用于计划配置
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="featureCode">
              功能编码 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="featureCode"
              placeholder="如：ai_chat"
              value={formData.featureCode}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, featureCode: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              以字母开头，只能包含字母、数字和下划线
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="featureName">
              功能名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="featureName"
              placeholder="如：AI 对话"
              value={formData.featureName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, featureName: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="featureType">
              功能类型 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.featureType}
              onValueChange={(value: string) =>
                setFormData((prev) => ({
                  ...prev,
                  featureType: value,
                  pointsCost: value === 'BOOLEAN' ? undefined : prev.pointsCost,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择功能类型" />
              </SelectTrigger>
              <SelectContent>
                {FEATURE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {type.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.featureType === 'POINTS' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="pointsCost">
                消耗点数 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pointsCost"
                type="number"
                min={0}
                placeholder="每次调用消耗的点数"
                value={formData.pointsCost ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pointsCost: e.target.value ? Number(e.target.value) : undefined
                  }))
                }
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              placeholder="功能描述（可选）"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sortOrder">排序</Label>
            <Input
              id="sortOrder"
              type="number"
              min={0}
              placeholder="排序值，越小越靠前"
              value={formData.sortOrder ?? 0}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sortOrder: e.target.value ? Number(e.target.value) : 0
                }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
