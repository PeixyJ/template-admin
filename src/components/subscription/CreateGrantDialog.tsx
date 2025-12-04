import { useEffect, useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

import {
  grantSubscription,
  grantPoints,
  grantResource,
} from '@/services/subscription'
import type {
  GrantType,
  GrantCategory,
  GrantSubscriptionDTO,
  GrantPointsDTO,
  GrantResourceDTO,
} from '@/types/subscription.types'

interface CreateGrantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateGrantDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateGrantDialogProps) {
  const [grantType, setGrantType] = useState<GrantType>('SUBSCRIPTION')
  const [loading, setLoading] = useState(false)

  // Common fields
  const [teamId, setTeamId] = useState<number>(0)
  const [grantCategory, setGrantCategory] = useState<GrantCategory>('ADMIN')
  const [grantReason, setGrantReason] = useState('')

  // Subscription specific
  const [planId, setPlanId] = useState<number>(0)
  const [subscriptionDays, setSubscriptionDays] = useState<number>(30)

  // Points specific
  const [points, setPoints] = useState<number>(0)
  const [pointsExpireDays, setPointsExpireDays] = useState<number | undefined>()

  // Resource specific
  const [packId, setPackId] = useState<number>(0)
  const [resourceQuantity, setResourceQuantity] = useState<number>(1)
  const [resourceExpireDays, setResourceExpireDays] = useState<number | undefined>()

  useEffect(() => {
    if (open) {
      // Reset form
      setTeamId(0)
      setGrantCategory('ADMIN')
      setGrantReason('')
      setPlanId(0)
      setSubscriptionDays(30)
      setPoints(0)
      setPointsExpireDays(undefined)
      setPackId(0)
      setResourceQuantity(1)
      setResourceExpireDays(undefined)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamId) {
      toast.error('请输入团队ID')
      return
    }

    setLoading(true)

    try {
      let response

      if (grantType === 'SUBSCRIPTION') {
        if (!planId) {
          toast.error('请输入计划ID')
          setLoading(false)
          return
        }
        const data: GrantSubscriptionDTO = {
          teamId,
          planId,
          durationDays: subscriptionDays,
          grantCategory,
          grantReason: grantReason || undefined,
        }
        response = await grantSubscription(data)
      } else if (grantType === 'POINTS') {
        if (!points) {
          toast.error('请输入点数')
          setLoading(false)
          return
        }
        const data: GrantPointsDTO = {
          teamId,
          points,
          expireDays: pointsExpireDays,
          grantCategory,
          grantReason: grantReason || undefined,
        }
        response = await grantPoints(data)
      } else if (grantType === 'RESOURCE') {
        if (!packId) {
          toast.error('请输入扩容包ID')
          setLoading(false)
          return
        }
        const data: GrantResourceDTO = {
          teamId,
          packId,
          quantity: resourceQuantity,
          expireDays: resourceExpireDays,
          grantCategory,
          grantReason: grantReason || undefined,
        }
        response = await grantResource(data)
      }

      if (response?.code === 'SUCCESS') {
        toast.success('赠送成功')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(response?.message || '赠送失败')
      }
    } catch (error) {
      console.error('Failed to grant:', error)
      toast.error('赠送失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>创建赠送</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={grantType} onValueChange={(v: string) => setGrantType(v as GrantType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="SUBSCRIPTION">订阅</TabsTrigger>
              <TabsTrigger value="POINTS">点数</TabsTrigger>
              <TabsTrigger value="RESOURCE">资源</TabsTrigger>
            </TabsList>

            {/* Common Fields */}
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamId">团队ID *</Label>
                <Input
                  id="teamId"
                  type="number"
                  min={1}
                  value={teamId || ''}
                  onChange={(e) => setTeamId(parseInt(e.target.value) || 0)}
                  placeholder="请输入团队ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grantCategory">赠送类别 *</Label>
                <Select
                  value={grantCategory}
                  onValueChange={(value) => setGrantCategory(value as GrantCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">管理员赠送</SelectItem>
                    <SelectItem value="PROMOTION">活动赠送</SelectItem>
                    <SelectItem value="COMPENSATION">补偿赠送</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="SUBSCRIPTION" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="planId">计划ID *</Label>
                <Input
                  id="planId"
                  type="number"
                  min={1}
                  value={planId || ''}
                  onChange={(e) => setPlanId(parseInt(e.target.value) || 0)}
                  placeholder="请输入计划ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscriptionDays">订阅天数</Label>
                <Input
                  id="subscriptionDays"
                  type="number"
                  min={1}
                  value={subscriptionDays}
                  onChange={(e) => setSubscriptionDays(parseInt(e.target.value) || 30)}
                />
              </div>
            </TabsContent>

            <TabsContent value="POINTS" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="points">点数 *</Label>
                <Input
                  id="points"
                  type="number"
                  min={1}
                  value={points || ''}
                  onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                  placeholder="请输入点数"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pointsExpireDays">过期天数</Label>
                <Input
                  id="pointsExpireDays"
                  type="number"
                  min={1}
                  value={pointsExpireDays || ''}
                  onChange={(e) =>
                    setPointsExpireDays(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="留空表示永不过期"
                />
              </div>
            </TabsContent>

            <TabsContent value="RESOURCE" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="packId">扩容包ID *</Label>
                <Input
                  id="packId"
                  type="number"
                  min={1}
                  value={packId || ''}
                  onChange={(e) => setPackId(parseInt(e.target.value) || 0)}
                  placeholder="请输入扩容包ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resourceQuantity">数量</Label>
                <Input
                  id="resourceQuantity"
                  type="number"
                  min={1}
                  value={resourceQuantity}
                  onChange={(e) => setResourceQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resourceExpireDays">过期天数</Label>
                <Input
                  id="resourceExpireDays"
                  type="number"
                  min={1}
                  value={resourceExpireDays || ''}
                  onChange={(e) =>
                    setResourceExpireDays(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="留空表示使用默认过期时间"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="grantReason">赠送原因</Label>
            <Textarea
              id="grantReason"
              value={grantReason}
              onChange={(e) => setGrantReason(e.target.value)}
              placeholder="请输入赠送原因..."
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
            <Button type="submit" disabled={loading || !teamId}>
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              确认赠送
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
