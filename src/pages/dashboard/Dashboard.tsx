import {
  Users,
  Building2,
  CreditCard,
  Coins,
  Gift,
  Package,
  RefreshCcw,
  LayoutGrid,
  Zap,
  Calendar,
  CalendarDays,
  CalendarRange,
} from 'lucide-react'

import { useDashboard } from '@/hooks/use-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

/** 格式化金额 */
function formatCurrency(num: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(num)
}

/** 统计卡片骨架屏 */
function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  )
}

/** 统计卡片组件 */
interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  className?: string
}

function StatCard({ title, value, icon, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

const Dashboard = () => {
  const { data, loading, error, refetch } = useDashboard()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          重试
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>
          <p className="text-muted-foreground">系统运营数据概览</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm" disabled={loading}>
          <RefreshCcw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
          刷新
        </Button>
      </div>

      {/* 统计卡片 - 一行6个 */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {loading ? (
          Array.from({ length: 18 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : data ? (
          <>
            {/* 用户与团队 */}
            <StatCard
              title="用户总数"
              value={formatNumber(data.totalUsers)}
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              title="今日新增用户"
              value={formatNumber(data.todayNewUsers)}
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              title="团队总数"
              value={formatNumber(data.totalTeams)}
              icon={<Building2 className="h-4 w-4" />}
            />
            <StatCard
              title="今日新增团队"
              value={formatNumber(data.todayNewTeams)}
              icon={<Building2 className="h-4 w-4" />}
            />
            <StatCard
              title="计划数量"
              value={formatNumber(data.totalPlans)}
              icon={<LayoutGrid className="h-4 w-4" />}
            />
            <StatCard
              title="功能数量"
              value={formatNumber(data.totalFeatures)}
              icon={<Zap className="h-4 w-4" />}
            />

            {/* 订阅与点数 */}
            <StatCard
              title="订阅数量"
              value={formatNumber(data.totalSubscriptions)}
              icon={<CreditCard className="h-4 w-4" />}
            />
            <StatCard
              title="可用点数"
              value={formatNumber(data.totalAvailablePoints)}
              icon={<Coins className="h-4 w-4" />}
            />
            <StatCard
              title="赠送数量"
              value={formatNumber(data.totalGrants)}
              icon={<Gift className="h-4 w-4" />}
            />
            <StatCard
              title="扩容包数量"
              value={formatNumber(data.totalResourcePacks)}
              icon={<Package className="h-4 w-4" />}
            />

            {/* 收入 */}
            <StatCard
              title="今日收入"
              value={formatCurrency(data.todayRevenue)}
              icon={<Calendar className="h-4 w-4" />}
            />
            <StatCard
              title="本月收入"
              value={formatCurrency(data.monthRevenue)}
              icon={<CalendarDays className="h-4 w-4" />}
            />
            <StatCard
              title="本年收入"
              value={formatCurrency(data.yearRevenue)}
              icon={<CalendarRange className="h-4 w-4" />}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}

export default Dashboard
