import type { ComponentType } from 'react'
import {
  UsersIcon,
  Users2Icon,
  LayoutGridIcon,
  SparklesIcon,
  CreditCardIcon,
  CoinsIcon,
  GiftIcon,
  PackageIcon,
  RefreshCcwIcon,
  WalletIcon,
  CircleCheckIcon,
  SnowflakeIcon,
  SendIcon,
} from 'lucide-react'

import { useDashboard } from '@/hooks/use-dashboard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DashboardVO } from '@/types'
import { TeamLeaderboard } from './TeamLeaderboard'

/** 格式化数值 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

/** 统计卡片属性 */
interface StatCardProps {
  icon: ComponentType
  title: string
  value: string
  subValue?: string
  changePercentage: number
  iconClassName?: string
}

/** 统计卡片骨架屏 */
function StatCardSkeleton() {
  return (
    <Card className="flex-row items-center justify-between p-4">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-5 w-12 rounded-sm" />
      </div>
      <Skeleton className="size-10 shrink-0 rounded-md" />
    </Card>
  )
}

/** 统计卡片组件 */
function StatCard({
  icon: Icon,
  title,
  value,
  subValue,
  changePercentage,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className="flex-row items-center justify-between p-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-xl font-semibold">
          {value}
          {subValue && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {subValue}
            </span>
          )}
        </span>
        <Badge
          className={cn('w-fit rounded-sm text-xs', {
            'bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400':
              changePercentage > 0,
            'bg-destructive/10 text-destructive': changePercentage < 0,
            'bg-muted text-muted-foreground': changePercentage === 0,
          })}
        >
          {changePercentage > 0 ? '+' : ''}
          {changePercentage.toFixed(1)}%
        </Badge>
      </div>
      <Avatar className="size-10 shrink-0 rounded-md">
        <AvatarFallback
          className={cn(
            'size-10 rounded-md bg-primary/10 text-primary [&>svg]:size-5',
            iconClassName
          )}
        >
          <Icon />
        </AvatarFallback>
      </Avatar>
    </Card>
  )
}

/** 根据数据生成卡片配置 */
function getStatCards(data: DashboardVO): StatCardProps[] {
  return [
    {
      icon: UsersIcon,
      title: '用户总数',
      value: formatNumber(data.totalUsers),
      subValue: `+${formatNumber(data.todayNewUsers)}`,
      changePercentage: data.userTrend?.dayOverDayRate ?? 0,
      iconClassName: 'bg-chart-1/10 text-chart-1',
    },
    {
      icon: Users2Icon,
      title: '团队总数',
      value: formatNumber(data.totalTeams),
      subValue: `+${formatNumber(data.todayNewTeams)}`,
      changePercentage: data.teamTrend?.dayOverDayRate ?? 0,
      iconClassName: 'bg-chart-2/10 text-chart-2',
    },
    {
      icon: LayoutGridIcon,
      title: '套餐计划',
      value: formatNumber(data.totalPlans),
      changePercentage: 0,
      iconClassName: 'bg-chart-3/10 text-chart-3',
    },
    {
      icon: SparklesIcon,
      title: '功能特性',
      value: formatNumber(data.totalFeatures),
      changePercentage: 0,
      iconClassName: 'bg-chart-4/10 text-chart-4',
    },
    {
      icon: CreditCardIcon,
      title: '订阅数',
      value: formatNumber(data.totalSubscriptions),
      changePercentage: 0,
      iconClassName: 'bg-chart-5/10 text-chart-5',
    },
    {
      icon: WalletIcon,
      title: '积分总量',
      value: formatNumber(data.totalPoints),
      changePercentage: 0,
      iconClassName: 'bg-amber-500/10 text-amber-500',
    },
    {
      icon: CoinsIcon,
      title: '可用积分',
      value: formatNumber(data.totalAvailablePoints),
      changePercentage: 0,
      iconClassName: 'bg-yellow-500/10 text-yellow-500',
    },
    {
      icon: CircleCheckIcon,
      title: '已用积分',
      value: formatNumber(data.totalUsedPoints),
      changePercentage: 0,
      iconClassName: 'bg-slate-500/10 text-slate-500',
    },
    {
      icon: SnowflakeIcon,
      title: '冻结积分',
      value: formatNumber(data.totalFrozenPoints),
      changePercentage: 0,
      iconClassName: 'bg-cyan-500/10 text-cyan-500',
    },
    {
      icon: SendIcon,
      title: '已发放积分',
      value: formatNumber(data.totalGrantedPoints),
      changePercentage: 0,
      iconClassName: 'bg-teal-500/10 text-teal-500',
    },
    {
      icon: GiftIcon,
      title: '赠送次数',
      value: formatNumber(data.totalGrants),
      changePercentage: 0,
      iconClassName: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      icon: PackageIcon,
      title: '资源包',
      value: formatNumber(data.totalResourcePacks),
      changePercentage: 0,
      iconClassName: 'bg-violet-500/10 text-violet-500',
    },
  ]
}

const Dashboard = () => {
  const { data, ranking, loading, error, refetch } = useDashboard()

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCcwIcon className="mr-2 size-4" />
          重试
        </Button>
      </div>
    )
  }

  const cards = data ? getStatCards(data) : []

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>
          <p className="text-muted-foreground">系统运营数据概览</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm" disabled={loading}>
          <RefreshCcwIcon className={cn('mr-2 size-4', loading && 'animate-spin')} />
          刷新
        </Button>
      </div>

      {/* 统计卡片 - 响应式布局，每行数量随页面大小变化 */}
      <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <StatCardSkeleton key={i} />)
          : cards.map((card, index) => <StatCard key={index} {...card} />)}
      </div>

    </div>
  )
}

export default Dashboard
