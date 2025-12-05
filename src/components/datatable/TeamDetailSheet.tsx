import { useEffect, useState } from 'react'
import {
  UsersIcon,
  UserIcon,
  CalendarIcon,
  CrownIcon,
  ShieldIcon,
  Loader2Icon,
  WalletIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  PackageIcon,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { getTeamDetail, getTeamMembers } from '@/services/team'
import type { AdminPointsAccountVO, TeamMemberVO, TeamMemberRole } from '@/types/team.types'
import { cn } from '@/lib/utils'

interface TeamDetailSheetProps {
  teamId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const roleLabels: Record<TeamMemberRole, string> = {
  OWNER: '所有者',
  ADMIN: '管理员',
  MEMBER: '成员',
}

const roleIcons: Record<TeamMemberRole, typeof CrownIcon> = {
  OWNER: CrownIcon,
  ADMIN: ShieldIcon,
  MEMBER: UserIcon,
}

export function TeamDetailSheet({ teamId, open, onOpenChange }: TeamDetailSheetProps) {
  const [account, setAccount] = useState<AdminPointsAccountVO | null>(null)
  const [members, setMembers] = useState<TeamMemberVO[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && teamId) {
      fetchTeamData(teamId)
    } else {
      setAccount(null)
      setMembers([])
    }
  }, [open, teamId])

  const fetchTeamData = async (id: number) => {
    setLoading(true)
    try {
      const [detailRes, membersRes] = await Promise.all([
        getTeamDetail(id),
        getTeamMembers(id),
      ])

      if (detailRes.data.code === 'SUCCESS') {
        setAccount(detailRes.data.data)
      }

      if (membersRes.data.code === 'SUCCESS') {
        setMembers(membersRes.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch team data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>团队详情</SheetTitle>
          <SheetDescription>查看团队信息、点数账户和成员列表</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : account ? (
          <div className="flex flex-col gap-6 px-4">
            {/* Team Info */}
            <div className="flex items-start gap-4">
              <Avatar className="size-16 rounded-xl">
                <AvatarFallback className="rounded-xl bg-primary/10 text-primary">
                  <UsersIcon className="size-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">{account.teamName}</h3>
                <Badge
                  variant="secondary"
                  className={cn(
                    account.status
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  )}
                >
                  {account.statusDesc}
                </Badge>
                <span className="text-xs text-muted-foreground">ID: {account.teamId}</span>
              </div>
            </div>

            {/* Owner Info */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">所有者</span>
              <div className="flex items-center gap-2">
                <Avatar className="size-5">
                  <AvatarFallback className="text-xs">
                    {account.ownerName?.charAt(0) || <UserIcon className="size-3" />}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {account.ownerName || `用户 #${account.ownerId}`}
                </span>
              </div>
            </div>

            <Separator />

            {/* Points Summary */}
            <div className="flex flex-col gap-3">
              <h4 className="font-medium flex items-center gap-2">
                <WalletIcon className="size-4" />
                点数账户
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <span className="text-xs text-muted-foreground">可用余额</span>
                  <p className={cn(
                    'text-lg font-semibold tabular-nums',
                    (account.availableBalance ?? 0) > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  )}>
                    {(account.availableBalance ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <span className="text-xs text-muted-foreground">冻结余额</span>
                  <p className="text-lg font-semibold tabular-nums text-muted-foreground">
                    {(account.frozenBalance ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Points Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUpIcon className="size-4 text-green-500" />
                  <span className="text-muted-foreground">累计获得:</span>
                  <span className="font-medium tabular-nums">{(account.totalEarned ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDownIcon className="size-4 text-red-500" />
                  <span className="text-muted-foreground">累计消费:</span>
                  <span className="font-medium tabular-nums">{(account.totalConsumed ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="size-4 text-orange-500" />
                  <span className="text-muted-foreground">累计过期:</span>
                  <span className="font-medium tabular-nums">{(account.totalExpired ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PackageIcon className="size-4 text-blue-500" />
                  <span className="text-muted-foreground">累计调整:</span>
                  <span className="font-medium tabular-nums">{(account.totalAdjusted ?? 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Expiring Points Warning */}
              {(account.expiringPoints ?? 0) > 0 && (
                <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-3 text-sm">
                  <span className="text-orange-700 dark:text-orange-400">
                    7天内即将过期: <strong>{(account.expiringPoints ?? 0).toLocaleString()}</strong> 点
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Subscription Info */}
            <div className="flex flex-col gap-2">
              <h4 className="font-medium">订阅信息</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">当前套餐</span>
                  <span className="text-sm font-medium">
                    {account.planName || '无套餐'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">订阅状态</span>
                  <span className="text-sm font-medium">
                    {account.subscriptionStatusDesc || '-'}
                  </span>
                </div>
                {account.planEndDate && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">到期时间</span>
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="size-3.5 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(account.planEndDate).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">创建时间</span>
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="size-3.5 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(account.createTime).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Active Batches */}
            {account.activeBatches && account.activeBatches.length > 0 && (
              <>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">活跃批次</h4>
                    <Badge variant="outline">{account.activeBatchCount} 个</Badge>
                  </div>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                    {account.activeBatches.slice(0, 5).map((batch) => (
                      <div
                        key={batch.id}
                        className="flex items-center justify-between rounded-lg border p-2 text-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{batch.packName || batch.batchNo}</span>
                          <span className="text-xs text-muted-foreground">
                            {batch.sourceDesc} · {batch.expireTime ? `到期: ${new Date(batch.expireTime).toLocaleDateString('zh-CN')}` : '永久有效'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium tabular-nums text-green-600 dark:text-green-400">
                            {(batch.remainingPoints ?? 0).toLocaleString()}
                          </span>
                          <span className="text-muted-foreground"> / {(batch.totalPoints ?? 0).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Members Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">团队成员</h4>
                <Badge variant="outline">{members.length} 人</Badge>
              </div>

              {members.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {members.map((member) => {
                    const RoleIcon = roleIcons[member.role]
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarImage
                              src={member.user.avatarUrl ?? undefined}
                              alt={member.user.nickname}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.user.nickname.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {member.user.nickname}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(member.joinedTime).toLocaleDateString('zh-CN')} 加入
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'flex items-center gap-1',
                            member.role === 'OWNER' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
                            member.role === 'ADMIN' && 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                          )}
                        >
                          <RoleIcon className="size-3" />
                          {roleLabels[member.role]}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  暂无成员
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">
            未找到团队信息
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
