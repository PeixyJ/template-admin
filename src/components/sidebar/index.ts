export { AppSidebar } from './AppSidebar'
export { NavMain } from './NavMain'
export { NavProjects } from './NavProjects'
export { NavSecondary } from './NavSecondary'
export { NavUser, type UserInfo } from './NavUser'

// 从配置文件重新导出导航类型
export type {
  NavMainItem,
  NavSubItem,
  NavSecondaryItem,
  NavProjectItem,
  NavigationConfig,
} from '@/config/navigation'

// 重新导出配置
export {
  navMainConfig,
  navSecondaryConfig,
  navProjectsConfig,
  navigationConfig,
} from '@/config/navigation'
