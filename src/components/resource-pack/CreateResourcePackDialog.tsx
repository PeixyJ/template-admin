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
import { NumberInput } from '@/components/ui/number-input'

import { createResourcePack } from '@/services/subscription'
import type { CreatePackDTO, ResourceType, DurationType, CurrencyType } from '@/types/subscription.types'

interface CreateResourcePackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const RESOURCE_TYPES: { value: ResourceType; label: string; unit: string }[] = [
  { value: 'PROJECT', label: '项目', unit: '个' },
  { value: 'MEMBER', label: '成员', unit: '人' },
  { value: 'STORAGE', label: '存储', unit: 'GB' },
]

const DURATION_TYPES: { value: DurationType; label: string }[] = [
  { value: 'PERMANENT', label: '永久' },
  { value: 'TEMPORARY', label: '临时' },
]

const CURRENCIES: { value: CurrencyType; label: string }[] = [
  { value: 'CNY', label: '人民币 (CNY)' },
  { value: 'USD', label: '美元 (USD)' },
]

export function CreateResourcePackDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateResourcePackDialogProps) {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<CreatePackDTO>({
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
    sortOrder: 0,
  })

  const resetForm = () => {
    setFormData({
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
      sortOrder: 0,
    })
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const getResourceUnit = (type: string) => {
    return RESOURCE_TYPES.find((t) => t.value === type)?.unit || ''
  }

  const handleSubmit = async () => {
    if (!formData.packCode.trim()) {
      toast.error('请输入扩容包编码')
      return
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.packCode)) {
      toast.error('扩容包编码必须以字母开头，只能包含字母、数字和下划线')
      return
    }
    if (!formData.packName.trim()) {
      toast.error('请输入扩容包名称')
      return
    }
    if (!formData.resourceType) {
      toast.error('请选择资源类型')
      return
    }
    if (formData.resourceAmount <= 0) {
      toast.error('资源数量必须大于0')
      return
    }
    if (formData.durationType === 'TEMPORARY' && !formData.durationDays) {
      toast.error('临时扩容包必须设置有效天数')
      return
    }

    setLoading(true)
    try {
      const res = await createResourcePack({
        ...formData,
        packCode: formData.packCode.trim(),
        packName: formData.packName.trim(),
        description: formData.description?.trim() || undefined,
      })

      if (res.data.code === 'SUCCESS') {
        toast.success('扩容包创建成功')
        handleClose(false)
        onSuccess()
      } else {
        toast.error(res.data.message || '创建失败')
      }
    } catch (error) {
      console.error('Create resource pack error:', error)
      toast.error('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>创建扩容包</DialogTitle>
          <DialogDescription>
            填写扩容包信息，创建新的资源扩容包
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* 基本信息 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="packCode">
                扩容包编码 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="packCode"
                placeholder="如：project_pack_10"
                value={formData.packCode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, packCode: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                以字母开头，只能包含字母、数字和下划线
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="packName">
                扩容包名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="packName"
                placeholder="如：项目扩容包-10个"
                value={formData.packName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, packName: e.target.value }))
                }
              />
            </div>
          </div>

          {/* 资源信息 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="resourceType">
                资源类型 <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.resourceType}
                onValueChange={(value: ResourceType) =>
                  setFormData((prev) => ({ ...prev, resourceType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择资源类型" />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="resourceAmount">
                资源数量 <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <NumberInput
                  minValue={1}
                  value={formData.resourceAmount}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, resourceAmount: value }))
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">
                  {getResourceUnit(formData.resourceType)}
                </span>
              </div>
            </div>
          </div>

          {/* 价格信息 */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="currency">货币类型</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: CurrencyType) =>
                  setFormData((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>价格</Label>
              <NumberInput
                minValue={0}
                step={0.01}
                formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                value={formData.price}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, price: value }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>原价</Label>
              <NumberInput
                minValue={0}
                step={0.01}
                formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                placeholder="选填"
                value={formData.originalPrice ?? 0}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    originalPrice: value || undefined,
                  }))
                }
              />
            </div>
          </div>

          {/* 时效信息 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="durationType">
                时效类型 <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.durationType}
                onValueChange={(value: DurationType) =>
                  setFormData((prev) => ({
                    ...prev,
                    durationType: value,
                    durationDays: value === 'PERMANENT' ? undefined : prev.durationDays,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择时效类型" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.durationType === 'TEMPORARY' && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="durationDays">
                  有效天数 <span className="text-destructive">*</span>
                </Label>
                <NumberInput
                  minValue={1}
                  placeholder="天数"
                  value={formData.durationDays ?? 0}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      durationDays: value || undefined,
                    }))
                  }
                />
              </div>
            )}
          </div>

          {/* 排序 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>排序</Label>
              <NumberInput
                minValue={0}
                value={formData.sortOrder ?? 0}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, sortOrder: value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                数值越小排序越靠前
              </p>
            </div>
          </div>

          {/* 描述 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              placeholder="扩容包描述（可选）"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
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
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}