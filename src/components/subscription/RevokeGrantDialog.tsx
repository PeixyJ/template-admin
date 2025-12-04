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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

import { revokeGrant } from '@/services/subscription'
import type { GrantRecordVO } from '@/types/subscription.types'

interface RevokeGrantDialogProps {
  record: GrantRecordVO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RevokeGrantDialog({
  record,
  open,
  onOpenChange,
  onSuccess,
}: RevokeGrantDialogProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!record) return

    setLoading(true)

    try {
      const response = await revokeGrant(record.grantId, reason || undefined)
      if (response.code === 'SUCCESS') {
        toast.success('赠送已撤销')
        onSuccess()
        onOpenChange(false)
        setReason('')
      } else {
        toast.error(response.message || '撤销失败')
      }
    } catch (error) {
      console.error('Failed to revoke grant:', error)
      toast.error('撤销失败')
    } finally {
      setLoading(false)
    }
  }

  if (!record) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>撤销赠送</DialogTitle>
          <DialogDescription>
            撤销赠送编号: {record.grantId}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">内容:</span>
                <span>{record.grantContent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">数量:</span>
                <span>{record.grantAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">团队:</span>
                <span>{record.teamName}</span>
              </div>
              {record.reason && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">原因:</span>
                  <span>{record.reason}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">撤销原因</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请输入撤销原因..."
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
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              确认撤销
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
