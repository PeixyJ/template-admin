import { useEffect, useState } from 'react'
import { Cell, Pie, PieChart, Label } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getPlanDistributionStatistics, type PlanDistributionItem } from '@/services/statistics'

const PLAN_COLORS = [
  'var(--primary)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-1)',
]

interface PlanDistributionProps {
  className?: string
}

export function PlanDistribution({ className }: PlanDistributionProps) {
  const [data, setData] = useState<PlanDistributionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getPlanDistributionStatistics()
        if (response.code === 'SUCCESS') {
          setData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch plan distribution:', error)
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
        <CardContent className="flex items-center gap-6">
          <Skeleton className="size-[180px] rounded-full" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartConfig: ChartConfig = data.reduce((acc, item, index) => {
    acc[item.planCode] = {
      label: item.planName,
      color: PLAN_COLORS[index % PLAN_COLORS.length],
    }
    return acc
  }, {} as ChartConfig)

  const pieData = data.map((item, index) => ({
    ...item,
    fill: PLAN_COLORS[index % PLAN_COLORS.length],
  }))

  const totalCount = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>计划分布</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">暂无数据</p>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <ChartContainer config={chartConfig} className="h-[200px] w-[200px] shrink-0">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="planName"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 8}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {totalCount}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 14}
                              className="fill-muted-foreground text-sm"
                            >
                              总计
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="flex flex-1 flex-col gap-3">
              {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: PLAN_COLORS[index % PLAN_COLORS.length] }}
                    />
                    <span className="text-sm">{item.planName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{item.count}</span>
                    <span className="text-muted-foreground">({item.percentage}%)</span>
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
