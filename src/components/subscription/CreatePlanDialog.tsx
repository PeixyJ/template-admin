import { useEffect, useState } from 'react'
import { Loader2Icon } from 'lucide-react'

import { cn } from '@/lib/utils'
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
import { NumberInput } from '@/components/ui/number-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import type { CreatePlanDTO, PlanType, ApplyScope } from '@/types/subscription.types'

interface CreatePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreatePlanDTO) => Promise<void>
}

const defaultFormData: CreatePlanDTO = {
  planCode: '',
  planName: '',
  planLevel: 1,
  planType: 'PAID',
  applyScope: 'ALL',
  description: '',
  price: 0,
  originalPrice: undefined,
  currency: 'CNY',
  durationDays: 30,
  dailyQuota: undefined,
  monthlyQuota: undefined,
  resourceLimits: undefined,
  isDefault: false,
  isTrial: false,
  isVisible: true,
  sortOrder: 0,
}

export function CreatePlanDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreatePlanDialogProps) {
  const [formData, setFormData] = useState<CreatePlanDTO>(defaultFormData)
  const [loading, setLoading] = useState(false)
  const [resourceLimitsJson, setResourceLimitsJson] = useState('')
  const [resourceLimitsError, setResourceLimitsError] = useState('')
  const [minSeats, setMinSeats] = useState<number | undefined>(undefined)
  const [maxSeats, setMaxSeats] = useState<number | undefined>(undefined)
  const [seatPrice, setSeatPrice] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (open) {
      setFormData(defaultFormData)
      setResourceLimitsJson('')
      setResourceLimitsError('')
      setMinSeats(undefined)
      setMaxSeats(undefined)
      setSeatPrice(undefined)
    }
  }, [open])

  const validateResourceLimits = (value: string): string => {
    if (!value.trim()) return ''

    try {
      const parsed = JSON.parse(value)

      // 检查是否为对象
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return 'JSON 必须是一个对象'
      }

      // 检查所有值是否为数字
      for (const [key, val] of Object.entries(parsed)) {
        if (typeof val !== 'number' || !Number.isInteger(val) || val < 0) {
          return `"${key}" 的值必须是非负整数`
        }
      }

      return ''
    } catch {
      return 'JSON 格式不正确'
    }
  }

  const handleResourceLimitsChange = (value: string) => {
    setResourceLimitsJson(value)
    setResourceLimitsError(validateResourceLimits(value))
  }

  const handleFormatJson = () => {
    if (!resourceLimitsJson.trim()) return

    try {
      const parsed = JSON.parse(resourceLimitsJson)
      setResourceLimitsJson(JSON.stringify(parsed, null, 2))
      setResourceLimitsError('')
    } catch {
      setResourceLimitsError('JSON 格式不正确，无法格式化')
    }
  }

  const handleCompressJson = () => {
    if (!resourceLimitsJson.trim()) return

    try {
      const parsed = JSON.parse(resourceLimitsJson)
      setResourceLimitsJson(JSON.stringify(parsed))
      setResourceLimitsError('')
    } catch {
      setResourceLimitsError('JSON 格式不正确，无法压缩')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证 JSON 格式
    if (resourceLimitsJson.trim() && resourceLimitsError) {
      return
    }

    setLoading(true)

    try {
      let parsedResourceLimits: Record<string, number> | undefined
      if (resourceLimitsJson.trim()) {
        try {
          parsedResourceLimits = JSON.parse(resourceLimitsJson)
        } catch {
          setResourceLimitsError('JSON 格式不正确')
          setLoading(false)
          return
        }
      }

      const data: CreatePlanDTO = {
        ...formData,
        resourceLimits: parsedResourceLimits,
        minSeats,
        maxSeats,
        seatPrice,
      }
      await onSubmit(data)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>创建计划</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">基本信息</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="planCode">计划编码 *</Label>
                <Input
                  id="planCode"
                  value={formData.planCode}
                  onChange={(e) =>
                    setFormData({ ...formData, planCode: e.target.value })
                  }
                  placeholder="如: PRO_MONTHLY"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planName">计划名称 *</Label>
                <Input
                  id="planName"
                  value={formData.planName}
                  onChange={(e) =>
                    setFormData({ ...formData, planName: e.target.value })
                  }
                  placeholder="如: 专业版-月付"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>计划等级 *</Label>
                <NumberInput
                  minValue={0}
                  value={formData.planLevel}
                  onChange={(value) =>
                    setFormData({ ...formData, planLevel: value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planType">计划类型 *</Label>
                <Select
                  value={formData.planType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, planType: value as PlanType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">免费版</SelectItem>
                    <SelectItem value="TRIAL">试用版</SelectItem>
                    <SelectItem value="PAID">付费版</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="applyScope">适用范围 *</Label>
                <Select
                  value={formData.applyScope}
                  onValueChange={(value) =>
                    setFormData({ ...formData, applyScope: value as ApplyScope })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSONAL">仅个人团队</SelectItem>
                    <SelectItem value="COLLABORATION">仅协作团队</SelectItem>
                    <SelectItem value="ALL">通用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>排序</Label>
                <NumberInput
                  minValue={0}
                  value={formData.sortOrder ?? 0}
                  onChange={(value) =>
                    setFormData({ ...formData, sortOrder: value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="计划描述..."
                rows={3}
              />
            </div>
          </div>

          {/* 价格信息 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">价格信息</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>售价 *</Label>
                <NumberInput
                  minValue={0}
                  step={0.01}
                  formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                  value={formData.price}
                  onChange={(value) =>
                    setFormData({ ...formData, price: value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>原价（划线价）</Label>
                <NumberInput
                  minValue={0}
                  step={0.01}
                  formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                  value={formData.originalPrice ?? NaN}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      originalPrice: isNaN(value) ? undefined : value,
                    })
                  }
                  placeholder="留空表示无原价"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">货币 *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
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
              <div className="space-y-2">
                <Label>有效天数</Label>
                <NumberInput
                  minValue={0}
                  value={formData.durationDays ?? NaN}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      durationDays: isNaN(value) ? undefined : value,
                    })
                  }
                  placeholder="留空表示永久"
                />
              </div>
            </div>
          </div>

          {/* 席位信息 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">席位信息</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>最小席位数</Label>
                <NumberInput
                  minValue={1}
                  value={minSeats ?? NaN}
                  onChange={(value) =>
                    setMinSeats(isNaN(value) ? undefined : value)
                  }
                  placeholder="默认1"
                />
              </div>
              <div className="space-y-2">
                <Label>最大席位数</Label>
                <NumberInput
                  minValue={1}
                  value={maxSeats ?? NaN}
                  onChange={(value) =>
                    setMaxSeats(isNaN(value) ? undefined : value)
                  }
                  placeholder="留空表示无限制"
                />
              </div>
              <div className="space-y-2">
                <Label>每席位单价</Label>
                <NumberInput
                  minValue={0}
                  step={0.01}
                  formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                  value={seatPrice ?? NaN}
                  onChange={(value) =>
                    setSeatPrice(isNaN(value) ? undefined : value)
                  }
                  placeholder="留空使用计划价格"
                />
              </div>
            </div>
          </div>

          {/* 配额信息 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">配额信息</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>每日配额</Label>
                <NumberInput
                  minValue={0}
                  value={formData.dailyQuota ?? NaN}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      dailyQuota: isNaN(value) ? undefined : value,
                    })
                  }
                  placeholder="留空表示无限制"
                />
              </div>
              <div className="space-y-2">
                <Label>月度配额</Label>
                <NumberInput
                  minValue={0}
                  value={formData.monthlyQuota ?? NaN}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      monthlyQuota: isNaN(value) ? undefined : value,
                    })
                  }
                  placeholder="留空表示无限制"
                />
              </div>
            </div>
          </div>

          {/* 资源限制 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">资源限制</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>资源限制配置 (JSON)</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFormatJson}
                    disabled={!resourceLimitsJson.trim()}
                  >
                    格式化
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCompressJson}
                    disabled={!resourceLimitsJson.trim()}
                  >
                    压缩
                  </Button>
                </div>
              </div>
              <Textarea
                value={resourceLimitsJson}
                onChange={(e) => handleResourceLimitsChange(e.target.value)}
                placeholder='{"PROJECT": 10, "MEMBER": 5, "STORAGE": 100}'
                rows={4}
                className={cn(
                  'font-mono text-sm',
                  resourceLimitsJson.trim() && !resourceLimitsError && 'border-green-500 focus-visible:ring-green-500/50',
                  resourceLimitsError && 'border-destructive focus-visible:ring-destructive/50'
                )}
              />
              {resourceLimitsError && (
                <p className="text-sm text-destructive">{resourceLimitsError}</p>
              )}
            </div>
          </div>

          {/* 开关选项 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">其他选项</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="isDefault" className="cursor-pointer">
                  默认计划
                </Label>
                <Switch
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isDefault: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="isTrial" className="cursor-pointer">
                  试用计划
                </Label>
                <Switch
                  id="isTrial"
                  checked={formData.isTrial}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isTrial: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="isVisible" className="cursor-pointer">
                  前端可见
                </Label>
                <Switch
                  id="isVisible"
                  checked={formData.isVisible}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isVisible: checked })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading || !!resourceLimitsError}>
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              创建
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
