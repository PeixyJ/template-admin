import { useEffect, useState } from 'react'
import {
  UsersIcon,
  Building2Icon,
  ShoppingCartIcon,
  DollarSignIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ActivityIcon,
  CreditCardIcon,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getStatisticsOverview, type StatisticsOverviewData } from '@/services/statistics'

interface StatCardProps {
  title: string
  value: string | number
  subValue?: string
  icon: React.ReactNode
  trend?: number
  trendLabel?: string
}

function StatCard({ title, value, subValue, icon, trend, trendLabel }: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0

  return (
    <Card className="py-4">
      <CardContent className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {(subValue || trend !== undefined) && (
            <div className="flex items-center gap-2 text-sm">
              {trend !== undefined && (
                <span
                  className={cn(
                    'flex items-center gap-1',
                    isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {isPositive ? (
                    <TrendingUpIcon className="size-4" />
                  ) : (
                    <TrendingDownIcon className="size-4" />
                  )}
                  {Math.abs(trend)}%
                </span>
              )}
              {subValue && <span className="text-muted-foreground">{subValue}</span>}
              {trendLabel && <span className="text-muted-foreground">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card className="py-4">
      <CardContent className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="size-10 rounded-lg" />
      </CardContent>
    </Card>
  )
}

interface OverviewStatsProps {
  className?: string
}

export function OverviewStats({ className }: OverviewStatsProps) {
  const [data, setData] = useState<StatisticsOverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getStatisticsOverview()
        if (response.code === 'SUCCESS') {
          setData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch overview statistics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!data) {
    return null
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const stats: StatCardProps[] = [
    {
      title: '总用户数',
      value: data.totalUsers.toLocaleString(),
      subValue: `今日 +${data.todayNewUsers}`,
      icon: <UsersIcon className="size-5" />,
    },
    {
      title: '总团队数',
      value: data.totalTeams.toLocaleString(),
      subValue: `今日 +${data.todayNewTeams}`,
      icon: <Building2Icon className="size-5" />,
    },
    {
      title: '总订单数',
      value: data.totalOrders.toLocaleString(),
      subValue: `今日 ${data.todayOrders}`,
      icon: <ShoppingCartIcon className="size-5" />,
    },
    {
      title: '总收入',
      value: formatCurrency(data.totalRevenue),
      subValue: `今日 ${formatCurrency(data.todayRevenue)}`,
      icon: <DollarSignIcon className="size-5" />,
    },
    {
      title: '7日活跃用户',
      value: data.activeUsers7d.toLocaleString(),
      icon: <ActivityIcon className="size-5" />,
    },
    {
      title: '7日活跃团队',
      value: data.activeTeams7d.toLocaleString(),
      icon: <ActivityIcon className="size-5" />,
    },
    {
      title: '付费团队',
      value: data.paidTeams.toLocaleString(),
      icon: <CreditCardIcon className="size-5" />,
    },
    {
      title: '付费转化率',
      value: `${data.paidConversionRate}%`,
      icon: <TrendingUpIcon className="size-5" />,
    },
  ]

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}
