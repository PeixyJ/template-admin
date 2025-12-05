import { Trophy, Medal, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TeamRanking {
  rank: number
  teamId: number
  teamName: string
  teamLogo: string | null
  ownerName: string
  availablePoints: number
  usedPoints: number
  totalPoints: number
}

interface TeamLeaderboardProps {
  rankings: TeamRanking[]
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-6 w-6 text-yellow-500" />
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />
    case 3:
      return <Award className="h-6 w-6 text-amber-600" />
    default:
      return null
  }
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-950/30 dark:to-amber-950/30 dark:border-yellow-800"
    case 2:
      return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 dark:from-gray-950/30 dark:to-slate-950/30 dark:border-gray-700"
    case 3:
      return "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 dark:from-orange-950/30 dark:to-amber-950/30 dark:border-orange-800"
    default:
      return "bg-card border-border"
  }
}

function getInitials(name: string) {
  return name.slice(0, 2)
}

function formatNumber(num: number) {
  return num.toLocaleString("zh-CN")
}

export function TeamLeaderboard({ rankings }: TeamLeaderboardProps) {
  const topThree = rankings.slice(0, 3)
  const rest = rankings.slice(3)

  return (
    <Card className="overflow-hidden text-sm">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b py-3 px-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-5 w-5 text-primary" />
          团队积分排行榜
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* 前三名展示 */}
        <div className="flex flex-col gap-2 p-3">
          {topThree.map((team) => (
            <div
              key={team.teamId}
              className={`relative rounded-lg border p-3 transition-all hover:shadow-md ${getRankStyle(team.rank)}`}
            >
              <div className="flex items-center gap-3">
                {/* 排名图标 */}
                <div className="shrink-0">{getRankIcon(team.rank)}</div>

                {/* 头像 */}
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={team.teamLogo || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(team.teamName)}
                  </AvatarFallback>
                </Avatar>

                {/* 团队信息 */}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate text-sm">{team.teamName}</p>
                  <p className="text-xs text-muted-foreground truncate">{team.ownerName}</p>
                </div>

                {/* 可用点数 */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatNumber(team.availablePoints)}
                  </p>
                  <p className="text-xs text-muted-foreground">可用</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 其余排名列表 */}
        {rest.length > 0 && (
          <div className="border-t">
            <div className="divide-y">
              {rest.map((team) => (
                <div
                  key={team.teamId}
                  className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-muted/50"
                >
                  {/* 排名 */}
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {team.rank}
                  </div>

                  {/* 团队信息 */}
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarImage src={team.teamLogo || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(team.teamName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">{team.teamName}</p>
                  </div>

                  {/* 可用点数 */}
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {formatNumber(team.availablePoints)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
