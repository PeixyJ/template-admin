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
import { NumberInput } from '@/components/ui/number-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { adminGrantSubscription, getPlanList } from '@/services/subscription'
import type { PlanVO } from '@/types/subscription.types'

interface GrantSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function GrantSubscriptionDialog({
  open,
  onOpenChange,
  onSuccess,
}: GrantSubscriptionDialogProps) {
  const [teamId, setTeamId] = useState('')
  const [planId, setPlanId] = useState<string>('')
  const [durationDays, setDurationDays] = useState<number>(30)
  const [seats, setSeats] = useState<number>(1)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<PlanVO[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)

  useEffect(() => {
    if (open) {
      fetchPlans()
    }
  }, [open])

  const fetchPlans = async () => {
    setLoadingPlans(true)
    try {
      const response = await getPlanList({ page: 1, size: 100, status: true })
      if (response.code === 'SUCCESS') {
        setPlans(response.data?.records || [])
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    } finally {
      setLoadingPlans(false)
    }
  }

  const resetForm = () => {
    setTeamId('')
    setPlanId('')
    setDurationDays(30)
    setSeats(1)
    setReason('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const teamIdNum = parseInt(teamId, 10)
    const planIdNum = parseInt(planId, 10)

    if (isNaN(teamIdNum) || teamIdNum <= 0) {
      toast.error('请输入有效的团队ID')
      return
    }

    if (isNaN(planIdNum) || planIdNum <= 0) {
      toast.error('请选择订阅计划')
      return
    }

    if (durationDays <= 0) {
      toast.error('订阅时长必须大于0')
      return
    }

    setLoading(true)

    try {
      const response = await adminGrantSubscription({
        teamId: teamIdNum,
        planId: planIdNum,
        durationDays,
        seats: seats > 0 ? seats : undefined,
        reason: reason.trim() || undefined,
      })
      if (response.code === 'SUCCESS') {
        toast.success('订阅赠送成功')
        onSuccess()
        onOpenChange(false)
        resetForm()
      } else {
        toast.error(response.message || '赠送订阅失败')
      }
    } catch (error) {
      console.error('Failed to grant subscription:', error)
      toast.error('赠送订阅失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>赠送订阅</DialogTitle>
          <DialogDescription>
            为指定团队赠送订阅计划
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamId">团队ID *</Label>
            <Input
              id="teamId"
              type="number"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="请输入团队ID"
              min={1}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planId">订阅计划 *</Label>
            <Select value={planId} onValueChange={setPlanId} required>
              <SelectTrigger id="planId">
                <SelectValue placeholder={loadingPlans ? '加载中...' : '请选择订阅计划'} />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={String(plan.id)}>
                    {plan.planName} ({plan.planCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <NumberInput
            label="订阅时长（天） *"
            value={durationDays}
            onChange={setDurationDays}
            minValue={1}
          />

          <NumberInput
            label="席位数"
            value={seats}
            onChange={setSeats}
            minValue={1}
          />

          <div className="space-y-2">
            <Label htmlFor="reason">赠送原因</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请输入赠送原因（可选）..."
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
            <Button
              type="submit"
              disabled={loading || !teamId || !planId || durationDays <= 0}
            >
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              确认赠送
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
