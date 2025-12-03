import { useState, useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { NumberInput } from '@/components/ui/number-input'
import { JsonTextarea } from '@/components/ui/json-textarea'

import { updatePlan, getPlanDetail } from '@/services/subscription'
import type {
  PlanVO,
  PlanDetailVO,
  UpdatePlanDTO,
  ApplyScope,
  CurrencyType,
} from '@/types/subscription.types'

interface EditPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: PlanVO | null
  onSuccess: () => void
}

const PLAN_TYPES = [
  { value: 'FREE', label: '免费版' },
  { value: 'TRIAL', label: '试用版' },
  { value: 'PAID', label: '付费版' },
]

const APPLY_SCOPES: { value: ApplyScope; label: string }[] = [
  { value: 'PERSONAL', label: '个人空间' },
  { value: 'COLLABORATION', label: '协作团队' },
  { value: 'ALL', label: '通用' },
]

const CURRENCIES: { value: CurrencyType; label: string }[] = [
  { value: 'CNY', label: '人民币 (CNY)' },
  { value: 'USD', label: '美元 (USD)' },
]

export function EditPlanDialog({
  open,
  onOpenChange,
  plan,
  onSuccess,
}: EditPlanDialogProps) {
  const [loading, setLoading] = useState(false)
  const [fetchingDetail, setFetchingDetail] = useState(false)
  const [planDetail, setPlanDetail] = useState<PlanDetailVO | null>(null)

  const [formData, setFormData] = useState<UpdatePlanDTO>({
    planName: '',
    planLevel: 0,
    planType: 'FREE',
    applyScope: 'ALL',
    description: '',
    price: 0,
    originalPrice: undefined,
    currency: 'CNY',
    durationDays: undefined,
    dailyQuota: undefined,
    monthlyQuota: undefined,
    resourceLimits: '',
    maxPurchaseCount: undefined,
    maxGrantCount: undefined,
    isDefault: false,
    isTrial: false,
    isVisible: true,
    sortOrder: 0,
  })

  useEffect(() => {
    if (open && plan) {
      fetchDetail(plan.id)
    }
  }, [open, plan])

  const fetchDetail = async (id: number) => {
    setFetchingDetail(true)
    try {
      const res = await getPlanDetail(id)
      if (res.data.code === 'SUCCESS' && res.data.data) {
        const detail = res.data.data
        setPlanDetail(detail)
        setFormData({
          planName: detail.planName,
          planLevel: detail.planLevel,
          planType: detail.planType,
          applyScope: detail.applyScope,
          description: detail.description || '',
          price: detail.price,
          originalPrice: detail.originalPrice ?? undefined,
          currency: detail.currency,
          durationDays: detail.durationDays ?? undefined,
          dailyQuota: detail.dailyQuota ?? undefined,
          monthlyQuota: detail.monthlyQuota ?? undefined,
          resourceLimits: detail.resourceLimits || '',
          maxPurchaseCount: detail.maxPurchaseCount ?? undefined,
          maxGrantCount: detail.maxGrantCount ?? undefined,
          isDefault: detail.isDefault,
          isTrial: detail.isTrial,
          isVisible: detail.isVisible,
          sortOrder: detail.sortOrder,
        })
      } else {
        toast.error('获取计划详情失败')
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Fetch plan detail error:', error)
      toast.error('获取计划详情失败')
      onOpenChange(false)
    } finally {
      setFetchingDetail(false)
    }
  }

  const resetForm = () => {
    setFormData({
      planName: '',
      planLevel: 0,
      planType: 'FREE',
      applyScope: 'ALL',
      description: '',
      price: 0,
      originalPrice: undefined,
      currency: 'CNY',
      durationDays: undefined,
      dailyQuota: undefined,
      monthlyQuota: undefined,
      resourceLimits: '',
      maxPurchaseCount: undefined,
      maxGrantCount: undefined,
      isDefault: false,
      isTrial: false,
      isVisible: true,
      sortOrder: 0,
    })
    setPlanDetail(null)
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async () => {
    if (!plan) return

    if (!formData.planName?.trim()) {
      toast.error('请输入计划名称')
      return
    }

    setLoading(true)
    try {
      const res = await updatePlan(plan.id, {
        ...formData,
        planName: formData.planName?.trim(),
        description: formData.description?.trim() || undefined,
      })

      if (res.data.code === 'SUCCESS') {
        toast.success('计划更新成功')
        handleClose(false)
        onSuccess()
      } else {
        toast.error(res.data.message || '更新失败')
      }
    } catch (error) {
      console.error('Update plan error:', error)
      toast.error('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑订阅计划</DialogTitle>
          <DialogDescription>
            {planDetail ? (
              <>
                编码：<span className="font-mono">{planDetail.planCode}</span>
              </>
            ) : (
              '修改计划信息'
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
              {/* 基本信息 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="planName">
                    计划名称 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="planName"
                    placeholder="如：专业版月付"
                    value={formData.planName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, planName: e.target.value }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>计划等级</Label>
                  <NumberInput
                    minValue={0}
                    value={formData.planLevel}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, planLevel: value }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="planType">计划类型</Label>
                  <Select
                    value={formData.planType}
                    onValueChange={(value: string) =>
                      setFormData((prev) => ({ ...prev, planType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择计划类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAN_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="applyScope">适用范围</Label>
                  <Select
                    value={formData.applyScope}
                    onValueChange={(value: ApplyScope) =>
                      setFormData((prev) => ({ ...prev, applyScope: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择适用范围" />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLY_SCOPES.map((scope) => (
                        <SelectItem key={scope.value} value={scope.value}>
                          {scope.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              {/* 有效期和配额 */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label>有效天数</Label>
                  <NumberInput
                    minValue={0}
                    placeholder="留空表示永久"
                    value={formData.durationDays ?? 0}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        durationDays: value || undefined,
                      }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>每日配额</Label>
                  <NumberInput
                    minValue={0}
                    placeholder="选填"
                    value={formData.dailyQuota ?? 0}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        dailyQuota: value || undefined,
                      }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>月度配额</Label>
                  <NumberInput
                    minValue={0}
                    placeholder="选填"
                    value={formData.monthlyQuota ?? 0}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        monthlyQuota: value || undefined,
                      }))
                    }
                  />
                </div>
              </div>

              {/* 限制 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>最大购买次数</Label>
                  <NumberInput
                    minValue={0}
                    placeholder="0表示无限制"
                    value={formData.maxPurchaseCount ?? 0}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxPurchaseCount: value || undefined,
                      }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>最大赠送次数</Label>
                  <NumberInput
                    minValue={0}
                    placeholder="0表示无限制"
                    value={formData.maxGrantCount ?? 0}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxGrantCount: value || undefined,
                      }))
                    }
                  />
                </div>
              </div>

              {/* 描述 */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  placeholder="计划描述（可选）"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              {/* 资源上限 JSON */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="resourceLimits">资源上限配置 (JSON)</Label>
                <JsonTextarea
                  id="resourceLimits"
                  placeholder='{"projects": 10, "members": 5, "storage": 1024}'
                  value={formData.resourceLimits ?? ''}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, resourceLimits: value }))
                  }
                  rows={4}
                />
              </div>

              {/* 开关选项 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>排序</Label>
                  <NumberInput
                    minValue={0}
                    value={formData.sortOrder}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, sortOrder: value }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-4 pt-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isDefault" className="cursor-pointer">设为默认计划</Label>
                    <Switch
                      id="isDefault"
                      checked={formData.isDefault}
                      onCheckedChange={(checked: boolean) =>
                        setFormData((prev) => ({ ...prev, isDefault: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isTrial" className="cursor-pointer">试用计划</Label>
                    <Switch
                      id="isTrial"
                      checked={formData.isTrial}
                      onCheckedChange={(checked: boolean) =>
                        setFormData((prev) => ({ ...prev, isTrial: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isVisible" className="cursor-pointer">前台可见</Label>
                    <Switch
                      id="isVisible"
                      checked={formData.isVisible}
                      onCheckedChange={(checked: boolean) =>
                        setFormData((prev) => ({ ...prev, isVisible: checked }))
                      }
                    />
                  </div>
                </div>
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
