/** 每日数量统计 */
export interface DailyCountVO {
  date: string
  count: number
}

/** 每月数量统计 */
export interface MonthlyCountVO {
  month: string
  count: number
}

/** 趋势数据 */
export interface TrendDataVO {
  /** 今日数量 */
  todayCount: number
  /** 昨日数量 */
  yesterdayCount: number
  /** 日环比增幅(%) */
  dayOverDayRate: number
  /** 本月数量 */
  thisMonthCount: number
  /** 上月数量 */
  lastMonthCount: number
  /** 月环比增幅(%) */
  monthOverMonthRate: number
  /** 本年数量 */
  thisYearCount: number
  /** 去年数量 */
  lastYearCount: number
  /** 年同比增幅(%) */
  yearOverYearRate: number
  /** 每日数据(用于图表) */
  dailyData: DailyCountVO[]
  /** 每月数据(用于图表) */
  monthlyData: MonthlyCountVO[]
}

/** 仪表盘数据 */
export interface DashboardVO {
  /** 用户总数 */
  totalUsers: number
  /** 今日新增用户 */
  todayNewUsers: number
  /** 用户增长趋势 */
  userTrend: TrendDataVO
  /** 团队总数 */
  totalTeams: number
  /** 今日新增团队 */
  todayNewTeams: number
  /** 团队增长趋势 */
  teamTrend: TrendDataVO
  /** 计划数量 */
  totalPlans: number
  /** 功能数量 */
  totalFeatures: number
  /** 订阅数量 */
  totalSubscriptions: number
  /** 所有点数总和 */
  totalPoints: number
  /** 全部可用点数 */
  totalAvailablePoints: number
  /** 已使用点数 */
  totalUsedPoints: number
  /** 冻结点数 */
  totalFrozenPoints: number
  /** 已发放点数（赠送） */
  totalGrantedPoints: number
  /** 赠送数量 */
  totalGrants: number
  /** 扩容包数量 */
  totalResourcePacks: number
  /** 今日收入 */
  todayRevenue: number
  /** 本月收入 */
  monthRevenue: number
  /** 本年收入 */
  yearRevenue: number
}

/** 团队积分排行项 */
export interface TeamPointsRankVO {
  /** 排名 */
  rank: number
  /** 团队ID */
  teamId: number
  /** 团队名称 */
  teamName: string
  /** 团队Logo */
  teamLogo: string | null
  /** 所有者名称 */
  ownerName: string
  /** 可用点数 */
  availablePoints: number
  /** 已使用点数 */
  usedPoints: number
  /** 总点数 */
  totalPoints: number
}

/** 积分排行榜数据 */
export interface PointsRankingVO {
  /** 排行榜数据 */
  rankings: TeamPointsRankVO[]
  /** 总条数 */
  totalCount: number
}
