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
import { NumberInputWithButtons } from '@/components/shadcn-studio/input/input-40'

import { adjustPoints, freezePoints, unfreezePoints } from '@/services/subscription'
import type { PointsAccountVO, AdjustPointsDTO } from '@/types/subscription.types'

type OperationType = 'adjust' | 'freeze' | 'unfreeze'

const operationConfig = {
  adjust: {
    title: '调整点数',
    description: (teamName: string) => `为团队 "${teamName}" 调整点数（正数增加，负数扣减）`,
    pointsLabel: '调整数量 *',
    pointsHint: '正数表示增加点数，负数表示扣减点数',
    submitText: '确认调整',
    allowNegative: true,
  },
  freeze: {
    title: '冻结点数',
    description: (teamName: string) => `冻结团队 "${teamName}" 的可用点数`,
    pointsLabel: '冻结数量 *',
    pointsHint: '输入要冻结的点数数量',
    submitText: '确认冻结',
    allowNegative: false,
  },
  unfreeze: {
    title: '解冻点数',
    description: (teamName: string) => `解冻团队 "${teamName}" 的冻结点数`,
    pointsLabel: '解冻数量 *',
    pointsHint: '输入要解冻的点数数量',
    submitText: '确认解冻',
    allowNegative: false,
  },
}

interface AdjustPointsDialogProps {
  account: PointsAccountVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AdjustPointsDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
}: AdjustPointsDialogProps) {
  const [operationType, setOperationType] = useState<OperationType>('adjust')
  const [formData, setFormData] = useState<Omit<AdjustPointsDTO, 'teamId'>>({
    points: 0,
    expireDays: undefined,
    reason: '',
  })
  const [loading, setLoading] = useState(false)

  const config = operationConfig[operationType]

  const handleOperationChange = (value: OperationType) => {
    setOperationType(value)
    setFormData({ points: 0, expireDays: undefined, reason: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account || formData.points === 0) return

    setLoading(true)

    try {
      let response
      let successMessage = ''

      if (operationType === 'adjust') {
        response = await adjustPoints({
          teamId: account.teamId,
          ...formData,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = response.data as any
        const action = formData.points > 0 ? '增加' : '扣减'
        const availablePoints = result?.availablePoints ?? result?.availableBalance ?? '未知'
        successMessage = `${action} ${Math.abs(formData.points)} 点数成功，当前可用: ${availablePoints}`
      } else if (operationType === 'freeze') {
        response = await freezePoints({
          teamId: account.teamId,
          points: Math.abs(formData.points),
          reason: formData.reason,
        })
        const result = response.data
        successMessage = `冻结 ${result?.operatedPoints ?? formData.points} 点数成功，当前冻结: ${result?.frozenPoints ?? '未知'}`
      } else {
        response = await unfreezePoints({
          teamId: account.teamId,
          points: Math.abs(formData.points),
          reason: formData.reason,
        })
        const result = response.data
        successMessage = `解冻 ${result?.operatedPoints ?? formData.points} 点数成功，当前可用: ${result?.availablePoints ?? '未知'}`
      }

      // 兼容 code 为 'SUCCESS' 或 0 的情况
      const code = response.code as string | number
      if (code === 'SUCCESS' || code === 0) {
        toast.success(successMessage)
        onSuccess()
        onOpenChange(false)
        setFormData({ points: 0, expireDays: undefined, reason: '' })
        setOperationType('adjust')
      } else {
        toast.error(response.message || `${config.title}失败`)
      }
    } catch (error) {
      console.error(`Failed to ${operationType} points:`, error)
      toast.error(`${config.title}失败`)
    } finally {
      setLoading(false)
    }
  }

  if (!account) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>
            {config.description(account.teamName)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>操作类型</Label>
            <Select value={operationType} onValueChange={handleOperationChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adjust">调整点数</SelectItem>
                <SelectItem value="freeze">冻结点数</SelectItem>
                <SelectItem value="unfreeze">解冻点数</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>可用点数</Label>
              <Input value={account.availableBalance.toLocaleString('zh-CN')} disabled />
            </div>
            <div className="space-y-2">
              <Label>冻结点数</Label>
              <Input value={account.frozenBalance.toLocaleString('zh-CN')} disabled />
            </div>
          </div>

          <NumberInputWithButtons
            label={config.pointsLabel}
            value={formData.points}
            onChange={(value) => setFormData({ ...formData, points: value })}
            minValue={config.allowNegative ? undefined : 0}
            step={10}
          />
          <p className="-mt-2 text-xs text-muted-foreground">
            {config.pointsHint}
          </p>

          {operationType === 'adjust' && formData.points > 0 && (
            <NumberInputWithButtons
              label="过期天数"
              value={formData.expireDays ?? 0}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  expireDays: value > 0 ? value : undefined,
                })
              }
              minValue={0}
              step={1}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">
              {operationType === 'adjust' ? '调整原因' : '操作原因'}
            </Label>
            <Textarea
              id="reason"
              value={formData.reason || ''}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="请输入原因..."
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
            <Button type="submit" disabled={loading || formData.points === 0}>
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              {config.submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
