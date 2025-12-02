/**
 * 应用配置
 * 从环境变量读取应用名称和图标等配置
 */
export const appConfig = {
  /** 应用名称 */
  title: import.meta.env.VITE_APP_TITLE || 'Admin Template',
  /** 应用图标路径 */
  icon: import.meta.env.VITE_APP_ICON || '/favicon.svg',
  /** API 基础地址 */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
} as const

export type AppConfig = typeof appConfig
