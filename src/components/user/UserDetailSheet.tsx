import { useEffect, useState } from 'react'
import {
  UserIcon,
  MailIcon,
  CalendarIcon,
  Loader2Icon,
  ShieldIcon,
  KeyIcon,
  ClockIcon,
  CopyIcon,
  CheckIcon,
  UsersIcon,
  CrownIcon,
  WalletIcon,
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

import { getUserDetail, getUserTeams } from '@/services/userAdmin'
import type { UserDetailVO } from '@/types/user.types'
import type { TeamVO } from '@/types/team.types'
import { cn } from '@/lib/utils'

interface UserDetailSheetProps {
  userId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailSheet({
  userId,
  open,
  onOpenChange,
}: UserDetailSheetProps) {
  const [loading, setLoading] = useState(false)
  const [userDetail, setUserDetail] = useState<UserDetailVO | null>(null)
  const [teams, setTeams] = useState<TeamVO[]>([])

  useEffect(() => {
    if (open && userId) {
      fetchUserData(userId)
    } else {
      setUserDetail(null)
      setTeams([])
    }
  }, [open, userId])

  const fetchUserData = async (id: number) => {
    setLoading(true)
    try {
      const [detailRes, teamsRes] = await Promise.all([
        getUserDetail(id),
        getUserTeams(id),
      ])
      if (detailRes.data.code === 'SUCCESS') {
        setUserDetail(detailRes.data.data)
      }
      if (teamsRes.data.code === 'SUCCESS') {
        setTeams(teamsRes.data.data || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const initials = userDetail?.nickname?.charAt(0).toUpperCase()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>用户详情</SheetTitle>
          <SheetDescription>查看用户的详细信息</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : userDetail ? (
          <div className="flex flex-col gap-6 px-4">
            {/* 用户基本信息 */}
            <div className="flex items-center gap-4">
              <Avatar className="size-16 rounded-xl">
                {userDetail.avatarUrl ? (
                  <AvatarImage
                    src={userDetail.avatarUrl}
                    alt={userDetail.nickname}
                  />
                ) : null}
                <AvatarFallback className="rounded-xl bg-primary/10 text-xl text-primary">
                  {initials || <UserIcon className="size-8" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold">
                  {userDetail.nickname}
                </span>
                <CopyableText
                  label="ID"
                  value={String(userDetail.id)}
                  className="text-sm text-muted-foreground"
                />
                <Badge variant={userDetail.status ? 'default' : 'destructive'}>
                  {userDetail.status ? '正常' : '已禁用'}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* 详细信息 */}
            <div className="grid gap-4">
              <DetailItem
                icon={<KeyIcon className="size-4" />}
                label="邀请码"
                value={userDetail.inviteCode}
                copyable
              />
              <DetailItem
                icon={<UserIcon className="size-4" />}
                label="邀请人"
                value={userDetail.inviter?.nickname || '-'}
                copyable={!!userDetail.inviter}
              />
              <DetailItem
                icon={<CalendarIcon className="size-4" />}
                label="注册时间"
                value={userDetail.createTime}
              />
              {!userDetail.status && userDetail.disableReason && (
                <DetailItem
                  icon={<ShieldIcon className="size-4" />}
                  label="禁用原因"
                  value={userDetail.disableReason}
                />
              )}
              {userDetail.remark && (
                <DetailItem
                  icon={<ShieldIcon className="size-4" />}
                  label="备注"
                  value={userDetail.remark}
                />
              )}
            </div>

            {/* 账号信息 */}
            {userDetail.accounts.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h4 className="font-medium">账号信息</h4>
                  {userDetail.accounts.map((account) => (
                    <div
                      key={account.id}
                      className="rounded-lg border bg-muted/30 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <CopyableText
                          value={account.credential}
                          className="flex items-center gap-2"
                        >
                          <MailIcon className="size-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {account.credential}
                          </span>
                        </CopyableText>
                        <Badge
                          variant={
                            account.lockStatus === 0 ? 'outline' : 'destructive'
                          }
                        >
                          {account.lockStatusDesc}
                        </Badge>
                      </div>
                      <div className="grid gap-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span>类型: {account.accountTypeDesc}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ClockIcon className="size-3" />
                          <span>登录次数: {account.loginCount}</span>
                        </div>
                        {account.lastLoginTime && (
                          <div className="flex items-center gap-1.5">
                            <ClockIcon className="size-3" />
                            <span>最后登录: {account.lastLoginTime}</span>
                          </div>
                        )}
                        {account.lastLoginIp && (
                          <div className="flex items-center gap-1.5">
                            <span>登录IP: {account.lastLoginIp}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 所在团队 */}
            <Separator />
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 font-medium">
                  <UsersIcon className="size-4" />
                  所在团队
                </h4>
                <Badge variant="outline">{teams.length} 个</Badge>
              </div>

              {teams.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="rounded-lg border bg-muted/30 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8 rounded-lg">
                            {team.logoUrl ? (
                              <AvatarImage src={team.logoUrl} alt={team.name} />
                            ) : null}
                            <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                              <UsersIcon className="size-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {team.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ID: {team.id}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {team.isDefault && (
                            <Badge
                              variant="secondary"
                              className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            >
                              <CrownIcon className="mr-1 size-3" />
                              默认
                            </Badge>
                          )}
                          {team.ownerId === userDetail.id && (
                            <Badge
                              variant="secondary"
                              className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                            >
                              所有者
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-1.5 text-xs text-muted-foreground">
                        {team.planName && (
                          <div className="flex items-center gap-1.5">
                            <span>套餐: {team.planName}</span>
                            {team.planEndDate && (
                              <span className="text-muted-foreground/70">
                                (到期: {new Date(team.planEndDate).toLocaleDateString('zh-CN')})
                              </span>
                            )}
                          </div>
                        )}
                        {team.availablePoints !== null && (
                          <div className="flex items-center gap-1.5">
                            <WalletIcon className="size-3" />
                            <span>可用点数:</span>
                            <span
                              className={cn(
                                'font-medium',
                                team.availablePoints > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {team.availablePoints.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="size-3" />
                          <span>
                            创建于 {new Date(team.createTime).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  暂无团队
                </div>
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
