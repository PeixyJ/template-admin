/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API 基础地址 */
  readonly VITE_API_BASE_URL: string
  /** 应用名称 */
  readonly VITE_APP_TITLE: string
  /** 应用图标路径 */
  readonly VITE_APP_ICON: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
