import { useEffect, useState } from 'react'
import {
  ShieldIcon,
  CalendarIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon,
  MailIcon,
  ClockIcon,
  LockIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

import { getAdminDetail } from '@/services/admin'
import type { AdminVO } from '@/types/admin.types'

interface AdminDetailSheetProps {
  adminId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminDetailSheet({
  adminId,
  open,
  onOpenChange,
}: AdminDetailSheetProps) {
  const [loading, setLoading] = useState(false)
  const [adminDetail, setAdminDetail] = useState<AdminVO | null>(null)

  useEffect(() => {
    if (open && adminId) {
      fetchAdminDetail(adminId)
    }
  }, [open, adminId])

  const fetchAdminDetail = async (id: number) => {
    setLoading(true)
    try {
      const res = await getAdminDetail(id)
      if (res.data.code === 'SUCCESS') {
        setAdminDetail(res.data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const initials = adminDetail?.nickname?.charAt(0).toUpperCase()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>管理员详情</SheetTitle>
          <SheetDescription>查看管理员的详细信息</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : adminDetail ? (
          <div className="flex flex-col gap-6 px-4">
            {/* 管理员基本信息 */}
            <div className="flex items-center gap-4">
              <Avatar className="size-16 rounded-xl">
                {adminDetail.avatarUrl ? (
                  <AvatarImage
                    src={adminDetail.avatarUrl}
                    alt={adminDetail.nickname}
                  />
                ) : null}
                <AvatarFallback className="rounded-xl bg-primary/10 text-xl text-primary">
                  {initials || <ShieldIcon className="size-8" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold">
                  {adminDetail.nickname}
                </span>
                <CopyableText
                  label="ID"
                  value={String(adminDetail.id)}
                  className="text-sm text-muted-foreground"
                />
                <Badge variant={adminDetail.status ? 'default' : 'destructive'}>
                  {adminDetail.statusDesc || (adminDetail.status ? '正常' : '已禁用')}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* 详细信息 */}
            <div className="grid gap-4">
              <DetailItem
                icon={<ShieldIcon className="size-4" />}
                label="管理员ID"
                value={String(adminDetail.id)}
                copyable
              />
              <DetailItem
                icon={<CalendarIcon className="size-4" />}
                label="创建时间"
                value={adminDetail.createTime}
              />
            </div>

            {/* 账号信息 */}
            {adminDetail.account && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h4 className="font-medium">账号信息</h4>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <CopyableText
                        value={adminDetail.account.credential}
                        className="flex items-center gap-2"
                      >
                        <MailIcon className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {adminDetail.account.credential}
                        </span>
                      </CopyableText>
                      <Badge
                        variant={
                          adminDetail.account.lockStatus === 0 ? 'outline' : 'destructive'
                        }
                      >
                        {adminDetail.account.lockStatusDesc}
                      </Badge>
                    </div>
                    <div className="grid gap-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <LockIcon className="size-3" />
                        <span>类型: {adminDetail.account.accountTypeDesc}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="size-3" />
                        <span>登录次数: {adminDetail.account.loginCount}</span>
                      </div>
                      {adminDetail.account.lastLoginTime && (
                        <div className="flex items-center gap-1.5">
                          <ClockIcon className="size-3" />
                          <span>最后登录: {adminDetail.account.lastLoginTime}</span>
                        </div>
                      )}
                      {adminDetail.account.lastLoginIp && (
                        <div className="flex items-center gap-1.5">
                          <span>登录IP: {adminDetail.account.lastLoginIp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
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

function CopyableText({
  value,
  label,
  className,
  children,
}: {
  value: string
  label?: string
  className?: string
  children?: React.ReactNode
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`${label || '内容'}已复制`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`group inline-flex items-center gap-1.5 text-left transition-colors hover:text-primary ${className || ''}`}
      title="点击复制"
    >
      {children || value}
      {copied ? (
        <CheckIcon className="size-3.5 text-green-500" />
      ) : (
        <CopyIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  )
}

function DetailItem({
  icon,
  label,
  value,
  copyable = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  copyable?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        {copyable && value !== '-' ? (
          <CopyableText value={value} label={label} className="text-sm" />
        ) : (
          <span className="text-sm">{value}</span>
        )}
      </div>
    </div>
  )
}
