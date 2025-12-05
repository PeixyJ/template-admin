import { Trophy } from 'lucide-react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { TeamPointsRankVO } from '@/types'

interface TeamLeaderboardProps {
  rankings: TeamPointsRankVO[]
}

function getInitials(name: string) {
  return name.slice(0, 2)
}

function formatNumber(num: number) {
  return num.toLocaleString('zh-CN')
}

export function TeamLeaderboard({ rankings }: TeamLeaderboardProps) {
  return (
    <>
      <CardHeader className="bg-primary py-3 px-4">
        <CardTitle className="flex items-center justify-center gap-2 text-base font-bold text-primary-foreground">
          <Trophy className="h-5 w-5 text-amber-300" />
          <span>团队积分排行榜</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {rankings.map((team) => (
            <div
              key={team.teamId}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
            >
              {/* 排名 */}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                {team.rank}
              </div>

              {/* 头像 */}
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={team.teamLogo || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {getInitials(team.teamName)}
                </AvatarFallback>
              </Avatar>

              {/* 团队信息 */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {team.teamName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {team.ownerName}
                </p>
              </div>

              {/* 可用点数 */}
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatNumber(team.availablePoints)}
                </p>
                <p className="text-xs text-muted-foreground">可用</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </>
  )
}
