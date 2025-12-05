import type { ApiResult } from './auth.types'

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
  /** 全部可用点数 */
  totalAvailablePoints: number
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

/** 仪表盘响应 */
export type DashboardResponse = ApiResult<DashboardVO>
