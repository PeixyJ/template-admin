import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { CoinsIcon, ArrowUpIcon, ArrowDownIcon, ClockIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { getPointsStatistics, type PointsStatisticsData } from '@/services/statistics'

const chartConfig = {
  issued: {
    label: '发放',
    color: 'var(--chart-2)',
  },
  consumed: {
    label: '消耗',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

interface PointsStatsProps {
  className?: string
}

export function PointsStats({ className }: PointsStatsProps) {
  const [data, setData] = useState<PointsStatisticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getPointsStatistics()
        if (response.code === 'SUCCESS') {
          setData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch points statistics:', error)
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
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
          <Skeleton className="h-[180px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const { summary, trends } = data

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toLocaleString()
  }

  const summaryItems = [
    {
      icon: <ArrowUpIcon className="size-4" />,
      label: '总发放',
      value: formatNumber(summary.totalIssued),
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: <ArrowDownIcon className="size-4" />,
      label: '总消耗',
      value: formatNumber(summary.totalConsumed),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: <ClockIcon className="size-4" />,
      label: '已过期',
      value: formatNumber(summary.totalExpired),
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      icon: <CoinsIcon className="size-4" />,
      label: '当前余额',
      value: formatNumber(summary.currentBalance),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ]

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>点数统计</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {summaryItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={cn('flex size-9 items-center justify-center rounded-lg', item.bgColor, item.color)}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-lg font-semibold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">消耗率</span>
            <span className="font-medium">{summary.consumeRate}%</span>
          </div>
          <Progress value={summary.consumeRate} className="h-2" />
        </div>

        {trends.length > 0 && (
          <div>
            <p className="mb-4 text-sm font-medium text-muted-foreground">点数变化趋势</p>
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <Bar dataKey="issued" fill="var(--color-issued)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="consumed" fill="var(--color-consumed)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
