import {
  OverviewStats,
  SubscriptionStats,
  OrderStats,
  RevenueStats,
  PointsStats,
  ResourceStats,
  UserGrowthStats,
  PlanDistribution,
  FeatureRanking,
} from '@/components/blocks/dashboard'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* 概览统计卡片 */}
      <OverviewStats />

      {/* 用户增长 & 计划分布 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <UserGrowthStats className="lg:col-span-2" />
        <PlanDistribution />
      </div>

      {/* 收入统计 */}
      <RevenueStats />

      {/* 订单 & 订阅统计 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <OrderStats />
        <SubscriptionStats />
      </div>

      {/* 点数 & 资源统计 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PointsStats />
        <ResourceStats />
      </div>

      {/* 功能使用排行 */}
      <FeatureRanking top={10} />
    </div>
  )
}
