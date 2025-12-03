import { useState } from 'react'
import { Loader2Icon, AlertTriangleIcon } from 'lucide-react'

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
import { Badge } from '@/components/ui/badge'

import type { GrantRecordVO } from '@/types/subscription.types'

interface RevokeGrantDialogProps {
  grant: GrantRecordVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (grantId: number, reason: string) => Promise<void>
}

const grantTypeConfig: Record<string, { label: string }> = {
  SUBSCRIPTION: { label: '订阅' },
  POINTS: { label: '点数' },
  RESOURCE_PACK: { label: '扩容包' },
  QUOTA: { label: '配额' },
}

export function RevokeGrantDialog({
  grant,
  open,
  onOpenChange,
  onConfirm,
}: RevokeGrantDialogProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setReason('')
      setError('')
    }
    onOpenChange(value)
  }

  const handleConfirm = async () => {
    if (!grant) return

    if (!reason.trim()) {
      setError('请输入撤销原因')
      return
    }

    setLoading(true)
    setError('')
    try {
      await onConfirm(grant.id, reason.trim())
      handleOpenChange(false)
    } catch {
      setError('撤销失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="size-5 text-destructive" />
            撤销赠送
          </DialogTitle>
          <DialogDescription>
            撤销赠送将回收已赠送的权益，此操作不可撤销。
          </DialogDescription>
        </DialogHeader>

        {grant && (
          <div className="flex flex-col gap-4">
            {/* Grant Info */}
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">赠送单号</span>
                  <span className="font-mono text-sm font-medium">{grant.grantNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">赠送类型</span>
                  <Badge variant="outline">
                    {grantTypeConfig[grant.grantType]?.label || grant.grantTypeDesc}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">接收团队</span>
                  <span className="text-sm">{grant.teamName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">商品/数量</span>
                  <span className="text-sm">
                    {grant.productName || '-'} x{grant.quantity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">原价值</span>
                  <span className="text-sm font-medium text-primary">
                    ¥{grant.originalValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="reason">撤销原因 *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请输入撤销原因..."
                rows={3}
              />
            </div>

            {/* Warning */}
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">注意事项：</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
                    <li>撤销后，接收方将失去已获得的权益</li>
                    <li>如果是订阅赠送，订阅将被取消</li>
                    <li>如果是点数赠送，点数将被扣减</li>
                    <li>此操作无法撤销，请谨慎操作</li>
                  </ul>
                </div>
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
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading || !reason.trim()}
          >
            {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            确认撤销
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
