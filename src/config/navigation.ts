import { Users, Bell, LayoutDashboard, type LucideIcon } from 'lucide-react'

/**
 * 导航子项类型
 */
export interface NavSubItem {
  title: string
  url: string
}

/**
 * 主导航项类型
 * url 可选，为空时点击不做任何反应，有子节点时展开子节点
 */
export interface NavMainItem {
  title: string
  url?: string
  icon: LucideIcon
  isActive?: boolean
  items?: NavSubItem[]
}

/**
 * 次要导航项类型
 */
export interface NavSecondaryItem {
  title: string
  url: string
  icon: LucideIcon
}

/**
 * 项目导航项类型
 */
export interface NavProjectItem {
  name: string
  url: string
  icon: LucideIcon
}

/**
 * 导航配置类型
 */
export interface NavigationConfig {
  main: NavMainItem[]
  secondary: NavSecondaryItem[]
  projects: NavProjectItem[]
}

/**
 * 主导航配置
 */
export const navMainConfig: NavMainItem[] = [
  {
    title: '仪表盘',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '团队管理',
    icon: Users,
    items: [
      { title: '团队', url: '/dashboard/team-management/teams' },
      { title: '用户', url: '/dashboard/team-management/users' },
      { title: '管理员', url: '/dashboard/team-management/admins' },
    ],
  },
  {
    title: '通知管理',
    icon: Bell,
    items: [
      { title: '通知模板', url: '/dashboard/notification-management/templates' },
    ],
  },
]

/**
 * 次要导航配置
 */
export const navSecondaryConfig: NavSecondaryItem[] = [

]

/**
 * 项目导航配置
 */
export const navProjectsConfig: NavProjectItem[] = [

]

/**
 * 完整导航配置
 */
export const navigationConfig: NavigationConfig = {
  main: navMainConfig,
  secondary: navSecondaryConfig,
  projects: navProjectsConfig,
}
