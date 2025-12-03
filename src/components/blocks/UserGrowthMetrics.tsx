import { useEffect, useState } from 'react'
import {
  TrendingUpIcon,
  UsersIcon,
  UserPlusIcon,
  Building2Icon,
  ChartNoAxesCombinedIcon,
  CirclePercentIcon,
} from 'lucide-react'
import { Bar, BarChart, Label, Pie, PieChart } from 'recharts'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { getUserGrowthStatistics, type UserGrowthStatisticsData } from '@/services/statistics'

const defaultData: UserGrowthStatisticsData = {
  startDate: '',
  endDate: '',
  summary: {
    totalUsers: 0,
    newUsers: 0,
    totalTeams: 0,
    newTeams: 0,
    userGrowthRate: 0,
    teamGrowthRate: 0,
  },
  trends: [],
}

const revenueChartConfig = {
  value: {
    label: '数量',
  },
  users: {
    label: '用户',
    color: 'var(--primary)',
  },
  teams: {
    label: '团队',
    color: 'color-mix(in oklab, var(--primary) 60%, transparent)',
  },
  growth: {
    label: '增长',
    color: 'color-mix(in oklab, var(--primary) 20%, transparent)',
  },
} satisfies ChartConfig

const trendChartConfig = {
  users: {
    label: '用户',
  },
} satisfies ChartConfig

interface UserGrowthMetricsProps {
  className?: string
}

export function UserGrowthMetrics({ className }: UserGrowthMetricsProps) {
  const [data, setData] = useState<UserGrowthStatisticsData>(defaultData)
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

  const { summary, startDate, endDate, trends } = data

  const metricsData = [
    {
      icon: <UsersIcon className="size-5" />,
      title: '总用户数',
      value: summary.totalUsers.toLocaleString(),
    },
    {
      icon: <UserPlusIcon className="size-5" />,
      title: '新增用户',
      value: summary.newUsers.toLocaleString(),
    },
    {
      icon: <Building2Icon className="size-5" />,
      title: '总团队数',
      value: summary.totalTeams.toLocaleString(),
    },
    {
      icon: <TrendingUpIcon className="size-5" />,
      title: '新增团队',
      value: summary.newTeams.toLocaleString(),
    },
  ]

  const pieChartData = [
    { category: 'users', value: summary.totalUsers, fill: 'var(--color-users)' },
    { category: 'teams', value: summary.totalTeams, fill: 'var(--color-teams)' },
    { category: 'growth', value: summary.newUsers + summary.newTeams, fill: 'var(--color-growth)' },
  ]

  const totalValue = summary.totalUsers + summary.totalTeams

  // 生成趋势条形图数据
  const totalBars = 24
  const growthPercentage = Math.min(
    100,
    Math.max(0, (summary.userGrowthRate + summary.teamGrowthRate) / 2)
  )
  const filledBars = Math.round((growthPercentage * totalBars) / 100) || (summary.newUsers > 0 ? totalBars : 0)

  const barChartData = trends.length > 0
    ? trends.map((t) => ({ date: t.period, users: t.newUsers }))
    : Array.from({ length: totalBars }, (_, index) => ({
        date: `day-${index}`,
        users: index < filledBars ? 1 : 0,
      }))

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-16">
          <span className="text-muted-foreground">加载中...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="space-y-4">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="flex flex-col gap-7 lg:col-span-3">
            <span className="text-lg font-semibold">用户增长概览</span>
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ChartNoAxesCombinedIcon className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xl font-medium">统计周期</span>
                <span className="text-sm text-muted-foreground">
                  {startDate} 至 {endDate}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {metricsData.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-md border px-4 py-2"
                >
                  <Avatar className="size-9 rounded-sm">
                    <AvatarFallback className="shrink-0 rounded-sm bg-primary/10 text-primary">
                      {metric.icon}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </span>
                    <span className="text-lg font-medium">{metric.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="gap-4 py-4 shadow-none lg:col-span-2">
            <CardHeader className="gap-1">
              <CardTitle className="text-lg font-semibold">用户分布</CardTitle>
            </CardHeader>

            <CardContent className="px-0">
              <ChartContainer config={revenueChartConfig} className="mx-auto h-40 w-full">
                <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="category"
                    startAngle={300}
                    endAngle={660}
                    innerRadius={58}
                    outerRadius={75}
                    paddingAngle={2}
                  >
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
                                y={(viewBox.cy || 0) - 12}
                                className="fill-card-foreground text-lg font-medium"
                              >
                                {totalValue}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 12}
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
            </CardContent>

            <CardFooter className="justify-between">
              <span className="text-base">用户增长率</span>
              <span className="text-xl font-medium">{summary.userGrowthRate}%</span>
            </CardFooter>
          </Card>
        </div>

        <Card className="shadow-none">
          <CardContent className="grid gap-4 px-4 lg:grid-cols-5">
            <div className="flex flex-col justify-center gap-6">
              <span className="text-lg font-semibold">增长趋势</span>
              <span className="text-5xl lg:text-6xl">{summary.newUsers + summary.newTeams}</span>
              <span className="text-sm text-muted-foreground">本期新增总数</span>
            </div>
            <div className="flex flex-col gap-6 text-lg md:col-span-4">
              <span className="font-medium">趋势分析</span>
              <span className="text-muted-foreground">
                用户增长率 {summary.userGrowthRate}%，团队增长率 {summary.teamGrowthRate}%
              </span>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <ChartNoAxesCombinedIcon className="size-6" />
                  <span className="text-lg font-medium">用户统计</span>
                </div>
                <div className="flex items-center gap-2">
                  <CirclePercentIcon className="size-6" />
                  <span className="text-lg font-medium">增长变化</span>
                </div>
              </div>

              <ChartContainer config={trendChartConfig} className="h-8 w-full">
                <BarChart
                  accessibilityLayer
                  data={barChartData}
                  margin={{ left: 0, right: 0 }}
                  maxBarSize={16}
                >
                  <Bar
                    dataKey="users"
                    fill="var(--primary)"
                    background={{
                      fill: 'color-mix(in oklab, var(--primary) 10%, transparent)',
                      radius: 12,
                    }}
                    radius={12}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
