import { useEffect, useState } from 'react'
import {
  UsersIcon,
  UserIcon,
  CalendarIcon,
  CrownIcon,
  ShieldIcon,
  Loader2Icon,
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
import type { TeamVO, TeamMemberVO, TeamMemberRole, TeamType } from '@/types/team.types'
import { cn } from '@/lib/utils'

interface TeamDetailSheetProps {
  teamId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const teamTypeLabels: Record<TeamType, string> = {
  PERSONAL_SPACE: '个人空间',
  COLLABORATION_TEAM: '协作团队',
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
  const [team, setTeam] = useState<TeamVO | null>(null)
  const [members, setMembers] = useState<TeamMemberVO[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && teamId) {
      fetchTeamData(teamId)
    } else {
      setTeam(null)
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
        setTeam(detailRes.data.data)
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
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>团队详情</SheetTitle>
          <SheetDescription>查看团队信息和成员列表</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : team ? (
          <div className="flex flex-col gap-6 px-4">
            {/* Team Info */}
            <div className="flex items-start gap-4">
              <Avatar className="size-16 rounded-xl">
                {team.logoUrl ? (
                  <AvatarImage src={team.logoUrl} alt={team.name} />
                ) : null}
                <AvatarFallback className="rounded-xl bg-primary/10 text-primary">
                  <UsersIcon className="size-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">{team.name}</h3>
                <Badge
                  variant="secondary"
                  className={cn(
                    team.type === 'PERSONAL_SPACE'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  )}
                >
                  {teamTypeLabels[team.type]}
                </Badge>
                <span className="text-xs text-muted-foreground">ID: {team.id}</span>
              </div>
            </div>

            {/* Description */}
            {team.description && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">{team.description}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">所有者</span>
                <div className="flex items-center gap-2">
                  <Avatar className="size-5">
                    <AvatarImage
                      src={team.ownerAvatarUrl ?? undefined}
                      alt={team.ownerNickname || ''}
                    />
                    <AvatarFallback className="text-xs">
                      {team.ownerNickname?.charAt(0) || <UserIcon className="size-3" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {team.ownerNickname || `用户 #${team.ownerId}`}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">创建时间</span>
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(team.createTime).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">套餐</span>
                <span className="text-sm font-medium">
                  {team.planName || '无套餐'}
                </span>
                {team.planEndDate && (
                  <span className="text-xs text-muted-foreground">
                    到期: {new Date(team.planEndDate).toLocaleDateString('zh-CN')}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">可用积分</span>
                <span className={cn(
                  'text-sm font-medium tabular-nums',
                  team.availablePoints && team.availablePoints > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-muted-foreground'
                )}>
                  {team.availablePoints?.toLocaleString() ?? '-'}
                </span>
              </div>
            </div>

            <Separator />

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
