import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { UsersIcon, Building2Icon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getUserGrowthStatistics, type UserGrowthStatisticsData } from '@/services/statistics'

const chartConfig = {
  newUsers: {
    label: '新增用户',
    color: 'var(--primary)',
  },
  newTeams: {
    label: '新增团队',
    color: 'var(--chart-2)',
  },
  cumulativeUsers: {
    label: '累计用户',
    color: 'var(--chart-3)',
  },
  cumulativeTeams: {
    label: '累计团队',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig

interface UserGrowthStatsProps {
  className?: string
}

export function UserGrowthStats({ className }: UserGrowthStatsProps) {
  const [data, setData] = useState<UserGrowthStatisticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getUserGrowthStatistics()
        if (response.code === 'SUCCESS') {
          setData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch user growth statistics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const { summary, trends, startDate, endDate } = data

  const summaryItems = [
    {
      icon: <UsersIcon className="size-4" />,
      label: '总用户数',
      value: summary.totalUsers.toLocaleString(),
      subValue: `+${summary.newUsers}`,
      trend: summary.userGrowthRate,
    },
    {
      icon: <Building2Icon className="size-4" />,
      label: '总团队数',
      value: summary.totalTeams.toLocaleString(),
      subValue: `+${summary.newTeams}`,
      trend: summary.teamGrowthRate,
    },
  ]

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>用户增长</CardTitle>
        {startDate && endDate && (
          <span className="text-sm text-muted-foreground">
            {startDate} 至 {endDate}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {summaryItems.map((item, index) => {
            const isPositive = item.trend >= 0
            return (
              <div
                key={index}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{item.value}</p>
                    <span className="text-sm text-muted-foreground">{item.subValue}</span>
                  </div>
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 text-sm font-medium',
                    isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {isPositive ? (
                    <TrendingUpIcon className="size-4" />
                  ) : (
                    <TrendingDownIcon className="size-4" />
                  )}
                  {Math.abs(item.trend)}%
                </div>
              </div>
            )
          })}
        </div>

        {trends.length > 0 && (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="newUsers"
                stroke="var(--color-newUsers)"
                fill="var(--color-newUsers)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="newTeams"
                stroke="var(--color-newTeams)"
                fill="var(--color-newTeams)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
