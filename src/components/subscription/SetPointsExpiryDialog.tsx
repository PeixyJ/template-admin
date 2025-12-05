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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { setPointsExpiry } from '@/services/subscription'
import type { PointsAccountVO, BatchVO } from '@/types/subscription.types'

interface SetPointsExpiryDialogProps {
  account: PointsAccountVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SetPointsExpiryDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
}: SetPointsExpiryDialogProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>('')
  const [expireTime, setExpireTime] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Get active batches from account
  const activeBatches: BatchVO[] = account?.activeBatches?.filter(
    (b) => b.status === 'ACTIVE'
  ) || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account || !selectedBatchId || !expireTime) return

    setLoading(true)

    try {
      const response = await setPointsExpiry(account.teamId, {
        batchId: parseInt(selectedBatchId),
        expireTime: new Date(expireTime).toISOString(),
      })
      if (response.code === 'SUCCESS') {
        toast.success('过期时间设置成功')
        onSuccess()
        onOpenChange(false)
        setSelectedBatchId('')
        setExpireTime('')
      } else {
        toast.error(response.message || '设置过期时间失败')
      }
    } catch (error) {
      console.error('Failed to set points expiry:', error)
      toast.error('设置过期时间失败')
    } finally {
      setLoading(false)
    }
  }

  if (!account) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>设置点数过期时间</DialogTitle>
          <DialogDescription>
            为团队 "{account.teamName}" 的点数批次设置过期时间
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="batch">选择批次 *</Label>
            {activeBatches.length > 0 ? (
              <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                <SelectTrigger>
                  <SelectValue placeholder="选择批次" />
                </SelectTrigger>
                <SelectContent>
                  {activeBatches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id.toString()}>
                      {batch.batchNo} - 剩余 {batch.remainingPoints} 点
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">暂无可用批次</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expireTime">过期时间 *</Label>
            <Input
              id="expireTime"
              type="datetime-local"
              value={expireTime}
              onChange={(e) => setExpireTime(e.target.value)}
              required
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
              disabled={loading || !selectedBatchId || !expireTime}
            >
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              确认设置
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
