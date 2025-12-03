import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, Pie, PieChart } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getOrderStatistics, type OrderStatisticsData } from '@/services/statistics'

const chartConfig = {
  orderCount: {
    label: '订单数',
    color: 'var(--primary)',
  },
  paidAmount: {
    label: '支付金额',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

const STATUS_COLORS = [
  'var(--primary)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

interface OrderStatsProps {
  className?: string
}

export function OrderStats({ className }: OrderStatsProps) {
  const [data, setData] = useState<OrderStatisticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getOrderStatistics()
        if (response.code === 'SUCCESS') {
          setData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch order statistics:', error)
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

  const { summary, trends, statusDistribution } = data

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const summaryItems = [
    { label: '总订单', value: summary.totalOrders.toLocaleString() },
    { label: '已支付', value: summary.paidOrders.toLocaleString() },
    { label: '待支付', value: summary.pendingOrders.toLocaleString() },
    { label: '支付率', value: `${summary.paymentRate}%` },
  ]

  const pieData = statusDistribution.map((item, index) => ({
    ...item,
    fill: STATUS_COLORS[index % STATUS_COLORS.length],
  }))

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>订单统计</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {summaryItems.map((item, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {trends.length > 0 && (
            <div>
              <p className="mb-4 text-sm font-medium text-muted-foreground">订单趋势</p>
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
                  <Bar dataKey="orderCount" fill="var(--color-orderCount)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          )}

          {statusDistribution.length > 0 && (
            <div>
              <p className="mb-4 text-sm font-medium text-muted-foreground">状态分布</p>
              <div className="flex items-center gap-4">
                <ChartContainer
                  config={chartConfig}
                  className="h-[180px] w-[180px] shrink-0"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={pieData}
                      dataKey="count"
                      nameKey="statusDesc"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-col gap-2">
                  {statusDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div
                        className="size-3 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{item.statusDesc}</span>
                      <span className="font-medium">{item.count}</span>
                      <span className="text-muted-foreground">({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">总金额</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-sm text-muted-foreground">已支付金额</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(summary.paidAmount)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
