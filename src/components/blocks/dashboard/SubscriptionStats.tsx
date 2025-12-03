import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getSubscriptionStatistics, type SubscriptionStatisticsData } from '@/services/statistics'

const chartConfig = {
  newSubscriptions: {
    label: '新增订阅',
    color: 'var(--primary)',
  },
  cancelledSubscriptions: {
    label: '取消订阅',
    color: 'var(--destructive)',
  },
  netGrowth: {
    label: '净增长',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig

interface SubscriptionStatsProps {
  className?: string
}

export function SubscriptionStats({ className }: SubscriptionStatsProps) {
  const [data, setData] = useState<SubscriptionStatisticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getSubscriptionStatistics()
        if (response.code === 'SUCCESS') {
          setData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch subscription statistics:', error)
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
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const { summary, trends } = data

  const summaryItems = [
    { label: '总订阅数', value: summary.totalSubscriptions.toLocaleString() },
    { label: '活跃订阅', value: summary.activeSubscriptions.toLocaleString() },
    { label: '新增订阅', value: summary.newSubscriptions.toLocaleString() },
    { label: '取消订阅', value: summary.cancelledSubscriptions.toLocaleString() },
    { label: '续订数', value: summary.renewals.toLocaleString() },
    { label: '续订率', value: `${summary.renewalRate}%` },
  ]

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>订阅统计</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {summaryItems.map((item, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        {trends.length > 0 && (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
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
              <Area
                type="monotone"
                dataKey="newSubscriptions"
                stroke="var(--color-newSubscriptions)"
                fill="var(--color-newSubscriptions)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="netGrowth"
                stroke="var(--color-netGrowth)"
                fill="var(--color-netGrowth)"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
