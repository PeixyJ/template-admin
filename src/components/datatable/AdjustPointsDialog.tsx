import { useState } from 'react'
import { Loader2Icon, PlusIcon, MinusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

import type { PointsAccountVO } from '@/types/subscription.types'

// 最大单次调整点数：1亿
const MAX_POINTS = 100_000_000

interface AdjustPointsDialogProps {
  account: PointsAccountVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (
    teamId: number,
    points: number,
    reason: string,
    expireDays?: number
  ) => Promise<void>
}

type AdjustType = 'add' | 'subtract'

export function AdjustPointsDialog({
  account,
  open,
  onOpenChange,
  onConfirm,
}: AdjustPointsDialogProps) {
  const [adjustType, setAdjustType] = useState<AdjustType>('add')
  const [amount, setAmount] = useState<number>(0)
  const [reason, setReason] = useState('')
  const [expireDays, setExpireDays] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setAdjustType('add')
      setAmount(0)
      setReason('')
      setExpireDays('')
      setError('')
    }
    onOpenChange(value)
  }

  const handleConfirm = async () => {
    if (!account) return

    if (amount <= 0) {
      setError('请输入有效的点数')
      return
    }

    if (adjustType === 'subtract' && amount > account.availablePoints) {
      setError('扣减点数不能超过可用点数')
      return
    }

    if (!reason.trim()) {
      setError('请输入调整原因')
      return
    }

    const finalPoints = adjustType === 'add' ? amount : -amount
    const expireDaysNum = expireDays && expireDays !== 'permanent' ? parseInt(expireDays, 10) : undefined

    setLoading(true)
    setError('')
    try {
      await onConfirm(account.teamId, finalPoints, reason, expireDaysNum)
      handleOpenChange(false)
    } catch {
      setError('调整失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>调整点数</DialogTitle>
          <DialogDescription>
            为团队增加或扣减点数
          </DialogDescription>
        </DialogHeader>

        {account && (
          <div className="flex flex-col gap-4">
            {/* Account Info */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">团队</span>
                  <span className="font-medium">{account.teamName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">当前可用点数</span>
                  <span className="font-medium text-primary">
                    {account.availablePoints.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Adjust Type */}
            <div className="flex flex-col gap-2">
              <Label>调整类型</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={adjustType === 'add' ? 'default' : 'outline'}
                  className={cn(
                    adjustType === 'add' && 'bg-green-600 hover:bg-green-700'
                  )}
                  onClick={() => setAdjustType('add')}
                >
                  <PlusIcon className="mr-2 size-4" />
                  增加
                </Button>
                <Button
                  type="button"
                  variant={adjustType === 'subtract' ? 'default' : 'outline'}
                  className={cn(
                    adjustType === 'subtract' && 'bg-red-600 hover:bg-red-700'
                  )}
                  onClick={() => setAdjustType('subtract')}
                >
                  <MinusIcon className="mr-2 size-4" />
                  扣减
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-2">
              <NumberInputWithButtons
                label={adjustType === 'add' ? '增加点数' : '扣减点数'}
                value={amount}
                onChange={setAmount}
                minValue={0}
                maxValue={adjustType === 'subtract' ? Math.min(account.availablePoints, MAX_POINTS) : MAX_POINTS}
                step={100}
              />
              <span className="text-xs text-muted-foreground">
                {adjustType === 'subtract'
                  ? `最大可扣减: ${Math.min(account.availablePoints, MAX_POINTS).toLocaleString()} 点`
                  : `单次最多增加: ${MAX_POINTS.toLocaleString()} 点`}
              </span>
            </div>

            {/* Expire Days (only for add) */}
            {adjustType === 'add' && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="expireDays">有效期（可选）</Label>
                <Select value={expireDays} onValueChange={setExpireDays}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择有效期" />
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
            )}

            {/* Reason */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="reason">调整原因</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请输入调整原因..."
                rows={3}
              />
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-dashed p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">调整后点数</span>
                <span className="text-lg font-semibold">
                  {(
                    account.availablePoints +
                    (adjustType === 'add' ? 1 : -1) * amount
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || amount <= 0 || !reason.trim()}
            className={cn(
              adjustType === 'add'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            )}
          >
            {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            确认{adjustType === 'add' ? '增加' : '扣减'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
