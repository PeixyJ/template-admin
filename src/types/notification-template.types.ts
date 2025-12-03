import type { ApiResult } from './auth.types'
import type { PageData } from './team.types'

/** 操作按钮配置 */
export interface ActionConfig {
  /** 操作标识 */
  actionKey: string
  /** 按钮文字 */
  label: string
  /** 样式: primary/secondary/danger/success */
  style: 'primary' | 'secondary' | 'danger' | 'success'
  /** 类型: endpoint(调接口) / redirect(跳转) */
  actionType: 'endpoint' | 'redirect'
  /** HTTP方法 */
  endpointMethod?: string
  /** URL模板 (endpoint类型) */
  endpointUrlPattern?: string
  /** 跳转URL模板 (redirect类型) */
  redirectUrlPattern?: string
  /** 是否需要确认 */
  confirmRequired: boolean
  /** 确认框标题 */
  confirmTitle?: string
  /** 确认框内容 */
  confirmMessage?: string
}

/** 参数说明 */
export interface ParamSchema {
  /** 参数名 */
  name: string
  /** 类型: string/number/boolean */
  type: 'string' | 'number' | 'boolean'
  /** 描述 */
  desc: string
  /** 是否必填 */
  required: boolean
}

/** 模板状态 */
export type TemplateStatus = 'active' | 'inactive'

/** 模板列表视图对象 */
export interface TemplateListVO {
  /** 主键ID */
  id: number
  /** 模板编码 */
  code: string
  /** 模板名称 */
  name: string
  /** 通知类型 */
  type: string
  /** 通知类型名称 */
  typeName: string
  /** 状态 */
  status: TemplateStatus
  /** 是否系统模板 */
  isSystem: boolean
  /** 描述 */
  description: string | null
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
  /** 数据版本 */
  dataVersion: number
}

/** 模板详情视图对象 */
export interface TemplateDetailVO {
  /** 主键ID */
  id: number
  /** 模板编码 */
  code: string
  /** 模板名称 */
  name: string
  /** 通知类型 */
  type: string
  /** 通知类型名称 */
  typeName: string
  /** 状态 */
  status: TemplateStatus
  /** 是否系统模板 */
  isSystem: boolean
  /** 描述 */
  description: string | null
  /** 标题模板 */
  titleTemplate: string
  /** 内容模板 */
  contentTemplate: string
  /** 默认操作按钮 */
  defaultActions: ActionConfig[]
  /** 参数说明 */
  paramSchema: ParamSchema[]
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
  /** 数据版本 */
  dataVersion: number
}

/** 模板下拉选项 */
export interface TemplateOptionVO {
  /** 模板编码 */
  code: string
  /** 模板名称 */
  name: string
}

/** 渲染后的操作按钮 */
export interface RenderedActionVO {
  /** 操作标识 */
  actionKey: string
  /** 按钮文字 */
  label: string
  /** 样式 */
  style: string
  /** 操作类型 */
  actionType: string
  /** 渲染后的接口URL (endpoint类型) */
  endpointUrl?: string
  /** HTTP方法 (endpoint类型) */
  endpointMethod?: string
  /** 渲染后的跳转URL (redirect类型) */
  redirectUrl?: string
  /** 是否需要确认 */
  confirmRequired: boolean
  /** 确认框标题 */
  confirmTitle?: string
  /** 确认框内容 */
  confirmMessage?: string
}

/** 模板预览视图对象 */
export interface TemplatePreviewVO {
  /** 渲染后的标题 */
  title: string
  /** 渲染后的内容 */
  content: string
  /** 渲染后的操作按钮 */
  actions: RenderedActionVO[]
}

/** 模板验证视图对象 */
export interface TemplateValidateVO {
  /** 是否有效 */
  valid: boolean
  /** 标题模板错误信息 */
  titleError?: string
  /** 内容模板错误信息 */
  contentError?: string
  /** 提取的变量列表 */
  variables: string[]
}

/** 模板列表查询参数 */
export interface TemplateListParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  size: number
  /** 模板编码（模糊匹配） */
  code?: string
  /** 模板名称（模糊匹配） */
  name?: string
  /** 通知类型 */
  type?: string
  /** 状态 active/inactive */
  status?: TemplateStatus
  /** 是否系统模板 */
  isSystem?: boolean
}

/** 创建模板请求 */
export interface CreateTemplateDTO {
  /** 模板编码（2-64字符，字母数字下划线） */
  code: string
  /** 模板名称（2-100字符） */
  name: string
  /** 描述（最大500字符） */
  description?: string
  /** 通知类型（必填） */
  type: string
  /** 标题模板（FreeMarker语法，最大500字符） */
  titleTemplate: string
  /** 内容模板（FreeMarker语法） */
  contentTemplate: string
  /** 默认操作按钮 */
  defaultActions?: ActionConfig[]
  /** 参数说明 */
  paramSchema?: ParamSchema[]
}

/** 更新模板请求 */
export interface UpdateTemplateDTO {
  /** 模板名称（2-100字符） */
  name: string
  /** 描述（最大500字符） */
  description?: string
  /** 标题模板（FreeMarker语法，最大500字符） */
  titleTemplate: string
  /** 内容模板（FreeMarker语法） */
  contentTemplate: string
  /** 默认操作按钮 */
  defaultActions?: ActionConfig[]
  /** 参数说明 */
  paramSchema?: ParamSchema[]
  /** 数据版本（乐观锁） */
  dataVersion: number
}

/** 更新模板状态请求 */
export interface UpdateTemplateStatusDTO {
  /** 状态: active/inactive */
  status: 'ACTIVE' | 'INACTIVE'
}

/** 预览模板请求 */
export interface PreviewTemplateDTO {
  /** 模板参数 */
  params?: Record<string, unknown>
}

/** 验证模板请求 */
export interface ValidateTemplateDTO {
  /** 标题模板 */
  titleTemplate?: string
  /** 内容模板 */
  contentTemplate?: string
}

/** 发送通知请求 */
export interface SendNotificationDTO {
  /** 目标用户ID列表 */
  userIds: number[]
  /** 通知类型（与模板二选一） */
  type?: string
  /** 模板编码（与type+title/content二选一） */
  templateCode?: string
  /** 模板参数（使用模板时需要） */
  templateParams?: Record<string, unknown>
  /** 自定义标题（不使用模板时需要） */
  title?: string
  /** 自定义内容（不使用模板时需要） */
  content?: string
  /** 过期时间（可选） */
  expiresAt?: string
  /** 过期天数（可选，与expiresAt二选一） */
  expiresInDays?: number
}

/** 模板列表响应 */
export type TemplateListResponse = ApiResult<PageData<TemplateListVO>>

/** 模板详情响应 */
export type TemplateDetailResponse = ApiResult<TemplateDetailVO>

/** 模板下拉选项响应 */
export type TemplateOptionsResponse = ApiResult<TemplateOptionVO[]>

/** 模板预览响应 */
export type TemplatePreviewResponse = ApiResult<TemplatePreviewVO>

/** 模板验证响应 */
export type TemplateValidateResponse = ApiResult<TemplateValidateVO>

/** 发送通知响应 */
export type SendNotificationResponse = ApiResult<number[]>

/** 创建模板响应 */
export type CreateTemplateResponse = ApiResult<number>
