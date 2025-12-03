import { useEffect, useState } from 'react'
import { HardDriveIcon, DatabaseIcon, CloudIcon, PackageIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getResourceStatistics, type ResourceStatisticsData } from '@/services/statistics'

const RESOURCE_ICONS: Record<string, React.ReactNode> = {
  storage: <HardDriveIcon className="size-4" />,
  database: <DatabaseIcon className="size-4" />,
  bandwidth: <CloudIcon className="size-4" />,
  default: <PackageIcon className="size-4" />,
}

interface ResourceStatsProps {
  className?: string
}

export function ResourceStats({ className }: ResourceStatsProps) {
  const [data, setData] = useState<ResourceStatisticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getResourceStatistics()
        if (response.code === 'SUCCESS') {
          setData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch resource statistics:', error)
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
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const { typeSummaries } = data

  const formatSize = (value: number) => {
    if (value >= 1024 * 1024 * 1024) {
      return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`
    }
    if (value >= 1024 * 1024) {
      return `${(value / (1024 * 1024)).toFixed(1)} MB`
    }
    if (value >= 1024) {
      return `${(value / 1024).toFixed(1)} KB`
    }
    return `${value}`
  }

  const getProgressColor = (usageRate: number) => {
    if (usageRate >= 90) return 'bg-red-500'
    if (usageRate >= 70) return 'bg-orange-500'
    return 'bg-primary'
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>资源使用</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {typeSummaries.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">暂无资源数据</p>
        ) : (
          typeSummaries.map((resource, index) => {
            const icon =
              RESOURCE_ICONS[resource.resourceType.toLowerCase()] || RESOURCE_ICONS.default

            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {icon}
                    </div>
                    <div>
                      <p className="font-medium">{resource.resourceTypeDesc}</p>
                      <p className="text-xs text-muted-foreground">
                        {resource.packsPurchased > 0 && `${resource.packsPurchased} 个扩容包`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{resource.usageRate}%</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(resource.totalUsed)} / {formatSize(resource.totalQuota)}
                    </p>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full transition-all', getProgressColor(resource.usageRate))}
                    style={{ width: `${Math.min(resource.usageRate, 100)}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
