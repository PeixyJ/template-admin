import { useEffect, useState } from 'react'
import { TrophyIcon, ZapIcon, UsersIcon, CoinsIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getFeatureRankingStatistics, type FeatureRankingData } from '@/services/statistics'

const RANK_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-600']

interface FeatureRankingProps {
  className?: string
  top?: number
}

export function FeatureRanking({ className, top = 10 }: FeatureRankingProps) {
  const [data, setData] = useState<FeatureRankingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getFeatureRankingStatistics({ top })
        if (response.code === 'SUCCESS') {
          setData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch feature ranking:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [top])

  if (loading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const { rankings, startDate, endDate } = data

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toLocaleString()
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>功能使用排行</CardTitle>
        {startDate && endDate && (
          <span className="text-sm text-muted-foreground">
            {startDate} ~ {endDate}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {rankings.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">暂无数据</p>
        ) : (
          <div className="space-y-4">
            {rankings.map((item, index) => {
              const isTopThree = item.rank <= 3
              return (
                <div
                  key={index}
                  className={cn(
                    'flex items-center gap-4 rounded-lg p-3 transition-colors',
                    isTopThree ? 'bg-muted/50' : 'hover:bg-muted/30'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full font-bold',
                      isTopThree
                        ? cn('bg-muted', RANK_COLORS[item.rank - 1])
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isTopThree ? <TrophyIcon className="size-4" /> : item.rank}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{item.featureName}</p>
                      {item.rank === 1 && (
                        <Badge variant="secondary" className="shrink-0">
                          最热门
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.featureCode}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm shrink-0">
                    <div className="flex items-center gap-1" title="使用次数">
                      <ZapIcon className="size-4 text-muted-foreground" />
                      <span className="font-medium">{formatNumber(item.usageCount)}</span>
                    </div>
                    <div className="flex items-center gap-1" title="使用用户">
                      <UsersIcon className="size-4 text-muted-foreground" />
                      <span>{formatNumber(item.userCount)}</span>
                    </div>
                    <div className="flex items-center gap-1" title="消耗点数">
                      <CoinsIcon className="size-4 text-muted-foreground" />
                      <span>{formatNumber(item.pointsConsumed)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
