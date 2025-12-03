import { useState, useEffect } from 'react'
import {
  Loader2Icon,
  GiftIcon,
  CreditCardIcon,
  PackageIcon,
  StarIcon,
} from 'lucide-react'

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
import { NumberInputWithButtons } from '@/components/shadcn-studio/input/input-40'
import { cn } from '@/lib/utils'

import {
  getPlanList,
  getResourcePackList,
  getAllFeatures,
} from '@/services/subscription'
import type {
  GrantType,
  GrantCategory,
  EffectiveType,
  PlanVO,
  AdminPackVO,
  FeatureSimpleVO,
  GrantSubscriptionDTO,
  GrantPointsDTO,
  GrantResourceDTO,
  GrantEntitlementDTO,
} from '@/types/subscription.types'

interface CreateGrantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGrantSubscription: (data: GrantSubscriptionDTO) => Promise<void>
  onGrantPoints: (data: GrantPointsDTO) => Promise<void>
  onGrantResource: (data: GrantResourceDTO) => Promise<void>
  onGrantEntitlement: (data: GrantEntitlementDTO) => Promise<void>
}

const grantTypeOptions: { value: GrantType; label: string; icon: React.ElementType }[] = [
  { value: 'SUBSCRIPTION', label: '赠送订阅', icon: CreditCardIcon },
  { value: 'POINTS', label: '赠送点数', icon: GiftIcon },
  { value: 'RESOURCE_PACK', label: '赠送扩容包', icon: PackageIcon },
  { value: 'QUOTA', label: '赠送配额', icon: StarIcon },
]

const grantCategoryOptions: { value: GrantCategory; label: string }[] = [
  { value: 'VIP', label: 'VIP' },
  { value: 'PROMOTION', label: '促销' },
  { value: 'COMPENSATION', label: '补偿' },
  { value: 'OTHER', label: '其他' },
]

const effectiveTypeOptions: { value: EffectiveType; label: string }[] = [
  { value: 'IMMEDIATE', label: '立即生效' },
  { value: 'SEQUENTIAL', label: '顺序生效' },
]

const MAX_POINTS = 100_000_000
const MAX_QUOTA = 10_000_000

export function CreateGrantDialog({
  open,
  onOpenChange,
  onGrantSubscription,
  onGrantPoints,
  onGrantResource,
  onGrantEntitlement,
}: CreateGrantDialogProps) {
  // Form state
  const [grantType, setGrantType] = useState<GrantType>('SUBSCRIPTION')
  const [teamId, setTeamId] = useState('')
  const [grantCategory, setGrantCategory] = useState<GrantCategory>('PROMOTION')
  const [grantReason, setGrantReason] = useState('')
  const [remark, setRemark] = useState('')

  // Subscription specific
  const [planId, setPlanId] = useState('')
  const [effectiveType, setEffectiveType] = useState<EffectiveType>('IMMEDIATE')
  const [durationDays, setDurationDays] = useState<number>(0)

  // Points specific
  const [points, setPoints] = useState<number>(1000)
  const [validDays, setValidDays] = useState('')

  // Resource pack specific
  const [packId, setPackId] = useState('')
  const [quantity, setQuantity] = useState<number>(1)

  // Quota specific
  const [featureCode, setFeatureCode] = useState('')
  const [quotaAmount, setQuotaAmount] = useState<number>(100)
  const [expireDays, setExpireDays] = useState('')

  // Options data
  const [plans, setPlans] = useState<PlanVO[]>([])
  const [packs, setPacks] = useState<AdminPackVO[]>([])
  const [features, setFeatures] = useState<FeatureSimpleVO[]>([])

  // Loading states
  const [loading, setLoading] = useState(false)
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch options when dialog opens
  useEffect(() => {
    if (open) {
      fetchOptions()
    }
  }, [open])

  const fetchOptions = async () => {
    setOptionsLoading(true)
    try {
      const [plansRes, packsRes, featuresRes] = await Promise.all([
        getPlanList({ page: 1, size: 100 }),
        getResourcePackList({ page: 1, size: 100 }),
        getAllFeatures(),
      ])

      if (plansRes.data.code === 'SUCCESS') {
        setPlans(plansRes.data.data?.records || [])
      }
      if (packsRes.data.code === 'SUCCESS') {
        setPacks(packsRes.data.data?.records || [])
      }
      if (featuresRes.data.code === 'SUCCESS') {
        setFeatures(featuresRes.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch options:', error)
    } finally {
      setOptionsLoading(false)
    }
  }

  const resetForm = () => {
    setGrantType('SUBSCRIPTION')
    setTeamId('')
    setGrantCategory('PROMOTION')
    setGrantReason('')
    setRemark('')
    setPlanId('')
    setEffectiveType('IMMEDIATE')
    setDurationDays(0)
    setPoints(1000)
    setValidDays('')
    setPackId('')
    setQuantity(1)
    setFeatureCode('')
    setQuotaAmount(100)
    setExpireDays('')
    setError('')
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      resetForm()
    }
    onOpenChange(value)
  }

  const validateForm = (): boolean => {
    if (!teamId.trim()) {
      setError('请输入团队ID')
      return false
    }

    const teamIdNum = parseInt(teamId, 10)
    if (isNaN(teamIdNum) || teamIdNum <= 0) {
      setError('团队ID必须是有效的正整数')
      return false
    }

    switch (grantType) {
      case 'SUBSCRIPTION':
        if (!planId) {
          setError('请选择订阅计划')
          return false
        }
        break
      case 'POINTS':
        if (points <= 0) {
          setError('请输入有效的点数')
          return false
        }
        break
      case 'RESOURCE_PACK':
        if (!packId) {
          setError('请选择扩容包')
          return false
        }
        if (quantity <= 0) {
          setError('请输入有效的数量')
          return false
        }
        break
      case 'QUOTA':
        if (!featureCode) {
          setError('请选择功能')
          return false
        }
        if (quotaAmount <= 0) {
          setError('请输入有效的配额数量')
          return false
        }
        break
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const teamIdNum = parseInt(teamId, 10)

      switch (grantType) {
        case 'SUBSCRIPTION':
          await onGrantSubscription({
            teamId: teamIdNum,
            planId: parseInt(planId, 10),
            effectiveType,
            durationDays: durationDays > 0 ? durationDays : undefined,
            grantCategory,
            grantReason: grantReason || undefined,
            remark: remark || undefined,
          })
          break
        case 'POINTS':
          await onGrantPoints({
            teamId: teamIdNum,
            points,
            validDays: validDays && validDays !== 'permanent' ? parseInt(validDays, 10) : undefined,
            grantCategory,
            grantReason: grantReason || undefined,
            remark: remark || undefined,
          })
          break
        case 'RESOURCE_PACK':
          await onGrantResource({
            teamId: teamIdNum,
            packId: parseInt(packId, 10),
            quantity,
            grantCategory,
            grantReason: grantReason || undefined,
            remark: remark || undefined,
          })
          break
        case 'QUOTA':
          await onGrantEntitlement({
            teamId: teamIdNum,
            featureCode,
            quotaAmount,
            expireDays: expireDays && expireDays !== 'permanent' ? parseInt(expireDays, 10) : undefined,
            grantCategory,
            grantReason: grantReason || undefined,
            remark: remark || undefined,
          })
          break
      }

      handleOpenChange(false)
    } catch {
      setError('赠送失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const selectedPlan = plans.find(p => p.id.toString() === planId)
  const selectedPack = packs.find(p => p.id.toString() === packId)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建赠送</DialogTitle>
          <DialogDescription>
            选择赠送类型并填写相关信息
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Grant Type Selector */}
          <div className="flex flex-col gap-2">
            <Label>赠送类型</Label>
            <div className="grid grid-cols-2 gap-2">
              {grantTypeOptions.map((option) => {
                const Icon = option.icon
                const isSelected = grantType === option.value
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn(
                      'justify-start h-auto py-3',
                      isSelected && 'ring-2 ring-primary ring-offset-2'
                    )}
                    onClick={() => setGrantType(option.value)}
                  >
                    <Icon className="mr-2 size-4" />
                    {option.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Team ID */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="teamId">团队ID *</Label>
            <Input
              id="teamId"
              type="number"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="请输入接收赠送的团队ID"
            />
          </div>

          {/* Grant Category */}
          <div className="flex flex-col gap-2">
            <Label>赠送分类 *</Label>
            <Select value={grantCategory} onValueChange={(v) => setGrantCategory(v as GrantCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="选择赠送分类" />
              </SelectTrigger>
              <SelectContent>
                {grantCategoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subscription Form */}
          {grantType === 'SUBSCRIPTION' && (
            <>
              <div className="flex flex-col gap-2">
                <Label>订阅计划 *</Label>
                <Select value={planId} onValueChange={setPlanId} disabled={optionsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={optionsLoading ? '加载中...' : '选择订阅计划'} />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.filter(p => p.status).map((plan) => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        {plan.planName} - ¥{plan.price}
                        {plan.durationDays && ` (${plan.durationDays}天)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>生效方式</Label>
                <Select value={effectiveType} onValueChange={(v) => setEffectiveType(v as EffectiveType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {effectiveTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <NumberInputWithButtons
                label="有效天数（覆盖计划默认值，0表示使用默认）"
                value={durationDays}
                onChange={setDurationDays}
                minValue={0}
                maxValue={3650}
                step={30}
              />

              {selectedPlan && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">计划价格:</span>
                    <span className="font-medium">¥{selectedPlan.price}</span>
                  </div>
                  {selectedPlan.durationDays && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">默认天数:</span>
                      <span>{selectedPlan.durationDays}天</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Points Form */}
          {grantType === 'POINTS' && (
            <>
              <NumberInputWithButtons
                label="赠送点数 *"
                value={points}
                onChange={setPoints}
                minValue={1}
                maxValue={MAX_POINTS}
                step={100}
              />

              <div className="flex flex-col gap-2">
                <Label>有效期</Label>
                <Select value={validDays} onValueChange={setValidDays}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择有效期（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">永久有效</SelectItem>
                    <SelectItem value="30">30 天</SelectItem>
                    <SelectItem value="60">60 天</SelectItem>
                    <SelectItem value="90">90 天</SelectItem>
                    <SelectItem value="180">180 天</SelectItem>
                    <SelectItem value="365">365 天</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">赠送点数:</span>
                  <span className="font-medium text-primary">{points.toLocaleString()} 点</span>
                </div>
              </div>
            </>
          )}

          {/* Resource Pack Form */}
          {grantType === 'RESOURCE_PACK' && (
            <>
              <div className="flex flex-col gap-2">
                <Label>扩容包 *</Label>
                <Select value={packId} onValueChange={setPackId} disabled={optionsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={optionsLoading ? '加载中...' : '选择扩容包'} />
                  </SelectTrigger>
                  <SelectContent>
                    {packs.filter(p => p.status === 1).map((pack) => (
                      <SelectItem key={pack.id} value={pack.id.toString()}>
                        {pack.packName} - {pack.resourceAmount}{pack.resourceUnit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <NumberInputWithButtons
                label="数量"
                value={quantity}
                onChange={setQuantity}
                minValue={1}
                maxValue={100}
                step={1}
              />

              {selectedPack && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">扩容包:</span>
                    <span className="font-medium">{selectedPack.packName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">资源量:</span>
                    <span>{selectedPack.resourceAmount}{selectedPack.resourceUnit} x {quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">原价值:</span>
                    <span className="text-primary">¥{(selectedPack.price * quantity).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Quota Form */}
          {grantType === 'QUOTA' && (
            <>
              <div className="flex flex-col gap-2">
                <Label>功能 *</Label>
                <Select value={featureCode} onValueChange={setFeatureCode} disabled={optionsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={optionsLoading ? '加载中...' : '选择功能'} />
                  </SelectTrigger>
                  <SelectContent>
                    {features.map((feature) => (
                      <SelectItem key={feature.featureCode} value={feature.featureCode}>
                        {feature.featureName} ({feature.featureCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <NumberInputWithButtons
                label="配额数量 *"
                value={quotaAmount}
                onChange={setQuotaAmount}
                minValue={1}
                maxValue={MAX_QUOTA}
                step={10}
              />

              <div className="flex flex-col gap-2">
                <Label>过期天数</Label>
                <Select value={expireDays} onValueChange={setExpireDays}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择过期时间（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">永久有效</SelectItem>
                    <SelectItem value="30">30 天</SelectItem>
                    <SelectItem value="60">60 天</SelectItem>
                    <SelectItem value="90">90 天</SelectItem>
                    <SelectItem value="180">180 天</SelectItem>
                    <SelectItem value="365">365 天</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Grant Reason */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="grantReason">赠送原因</Label>
            <Textarea
              id="grantReason"
              value={grantReason}
              onChange={(e) => setGrantReason(e.target.value)}
              placeholder="请输入赠送原因（可选）"
              rows={2}
            />
          </div>

          {/* Remark */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="remark">备注</Label>
            <Textarea
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="请输入备注信息（可选）"
              rows={2}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            确认赠送
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
