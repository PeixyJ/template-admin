import { useEffect, useState } from 'react'
import {
  CalendarIcon,
  Loader2Icon,
  UserIcon,
  ClockIcon,
  TagIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

import { getNotificationDetail } from '@/services/notification'
import type { NotificationVO, NotificationDetailVO } from '@/types/notification.types'

interface NotificationDetailSheetProps {
  notification: NotificationVO | null
  userId?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationDetailSheet({
  notification,
  userId,
  open,
  onOpenChange,
}: NotificationDetailSheetProps) {
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<NotificationDetailVO | null>(null)

  useEffect(() => {
    if (open && notification) {
      fetchDetail(notification.id, userId)
    }
  }, [open, notification, userId])

  const fetchDetail = async (id: number, uid?: number) => {
    setLoading(true)
    try {
      const res = await getNotificationDetail(id, uid)
      if (res.data.code === 'SUCCESS') {
        setDetail(res.data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string, statusDesc: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      unread: 'default',
      read: 'secondary',
      acted: 'outline',
      expired: 'destructive',
    }
    return (
      <Badge variant={variants[status] || 'outline'}>
        {statusDesc || status}
      </Badge>
    )
  }

  const getButtonVariant = (style: string) => {
    switch (style) {
      case 'PRIMARY':
        return 'default'
      case 'DANGER':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>通知详情</SheetTitle>
          <SheetDescription>查看通知的详细信息</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : detail ? (
          <div className="flex flex-col gap-6 px-4">
            {/* 基本信息 */}
            <div className="flex flex-col gap-2">
              <span className="text-lg font-semibold">{detail.title}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{detail.parentTypeDesc}</Badge>
                {getStatusBadge(detail.status, detail.statusDesc)}
              </div>
              {detail.templateCode && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TagIcon className="size-4" />
                  <span className="font-mono">{detail.templateCode}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* 发送者信息 */}
            <div className="flex flex-col gap-3">
              <h4 className="font-medium">发送者信息</h4>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <UserIcon className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{detail.senderName}</span>
                  <span className="text-sm text-muted-foreground">
                    {detail.senderType === 'SYSTEM' ? '系统发送' : '用户发送'}
                    {detail.senderId > 0 && ` (ID: ${detail.senderId})`}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* 通知内容 */}
            <div className="flex flex-col gap-3">
              <h4 className="font-medium">通知内容</h4>
              <div className="rounded-lg border bg-muted/30 p-4">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: detail.content }}
                />
              </div>
            </div>

            {/* 按钮列表 */}
            {detail.buttons && detail.buttons.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h4 className="font-medium">操作按钮</h4>
                  <div className="flex flex-wrap gap-2">
                    {detail.buttons.map((button, index) => (
                      <Button
                        key={index}
                        variant={getButtonVariant(button.style)}
                        size="sm"
                        disabled
                      >
                        {button.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 参数信息 */}
            {detail.params && Object.keys(detail.params).length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h4 className="font-medium">原始参数</h4>
                  <div className="max-h-[200px] overflow-y-auto rounded-lg border bg-muted/30 p-3">
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(detail.params, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* 时间信息 */}
            <div className="grid gap-4">
              <DetailItem
                icon={<CalendarIcon className="size-4" />}
                label="创建时间"
                value={detail.createTime}
              />
              {detail.readTime && (
                <DetailItem
                  icon={<CalendarIcon className="size-4" />}
                  label="阅读时间"
                  value={detail.readTime}
                />
              )}
              {detail.expireTime && (
                <DetailItem
                  icon={<ClockIcon className="size-4" />}
                  label="过期时间"
                  value={detail.expireTime}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center py-12 text-muted-foreground">
            暂无数据
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm">{value}</span>
      </div>
    </div>
  )
}
