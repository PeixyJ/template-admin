import { useEffect, useState } from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Cell, Pie, PieChart } from 'recharts'
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getRevenueStatistics, type RevenueStatisticsData } from '@/services/statistics'

const chartConfig = {
  revenue: {
    label: '收入',
    color: 'var(--primary)',
  },
  orderCount: {
    label: '订单数',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

const CHANNEL_COLORS = [
  'var(--primary)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

interface RevenueStatsProps {
  className?: string
}

export function RevenueStats({ className }: RevenueStatsProps) {
  const [data, setData] = useState<RevenueStatisticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getRevenueStatistics()
        if (response.code === 'SUCCESS') {
          setData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch revenue statistics:', error)
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
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
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

  const { summary, trends, typeDistribution, channelDistribution } = data

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const isGrowthPositive = summary.momGrowthRate >= 0

  const channelPieData = channelDistribution.map((item, index) => ({
    ...item,
    fill: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
  }))

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>收入统计</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">总收入</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">订单数</p>
            <p className="text-2xl font-semibold">{summary.orderCount.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">客单价</p>
            <p className="text-2xl font-semibold">{formatCurrency(summary.avgOrderAmount)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">环比增长</p>
            <div className="flex items-center gap-1">
              <p
                className={cn(
                  'text-2xl font-semibold',
                  isGrowthPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {isGrowthPositive ? '+' : ''}
                {summary.momGrowthRate}%
              </p>
              {isGrowthPositive ? (
                <TrendingUpIcon className="size-5 text-green-600" />
              ) : (
                <TrendingDownIcon className="size-5 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {trends.length > 0 && (
          <div>
            <p className="mb-4 text-sm font-medium text-muted-foreground">收入趋势</p>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-revenue)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {typeDistribution.length > 0 && (
            <div>
              <p className="mb-4 text-sm font-medium text-muted-foreground">订单类型分布</p>
              <div className="space-y-3">
                {typeDistribution.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.orderTypeDesc}</span>
                      <span className="font-medium">
                        {formatCurrency(item.revenue)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {channelDistribution.length > 0 && (
            <div>
              <p className="mb-4 text-sm font-medium text-muted-foreground">支付渠道分布</p>
              <div className="flex items-center gap-4">
                <ChartContainer config={chartConfig} className="h-[160px] w-[160px] shrink-0">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={channelPieData}
                      dataKey="revenue"
                      nameKey="payChannelDesc"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                    >
                      {channelPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-col gap-2">
                  {channelDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div
                        className="size-3 rounded-full"
                        style={{ backgroundColor: CHANNEL_COLORS[index % CHANNEL_COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{item.payChannelDesc}</span>
                      <span className="font-medium">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
