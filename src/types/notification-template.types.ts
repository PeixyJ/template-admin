import type { ApiResult } from './auth.types'
import type { PageData } from './team.types'

/** 模板参数定义 */
export interface TemplateParam {
  /** 参数键名 */
  paramKey: string
  /** 参数类型: string/number/boolean/object/array */
  paramType: 'string' | 'number' | 'boolean' | 'object' | 'array'
  /** 参数描述 */
  description: string
  /** 是否必填 */
  required: boolean
  /** 默认值 */
  defaultValue?: string
  /** 排序 */
  sortOrder: number
}

/** 按钮样式 */
export type ButtonStyle = 'PRIMARY' | 'DANGER' | 'DEFAULT'

/** 按钮调用类型 */
export type ButtonActionType = 'API' | 'REDIRECT' | 'BEAN'

/** 模板按钮配置 */
export interface TemplateButton {
  /** 按钮标识 */
  buttonKey: string
  /** 按钮文本 */
  label: string
  /** 按钮样式: PRIMARY/DANGER/DEFAULT */
  style: ButtonStyle
  /** 调用类型: API/REDIRECT/BEAN */
  actionType: ButtonActionType
  /** 调用配置（JSON对象，根据 actionType 不同结构不同） */
  actionConfig?: Record<string, unknown>
  /** 排序 */
  sortOrder: number
  /** 显示条件表达式(SpEL) */
  conditionExpr?: string
}

/** 大分类类型 */
export type ParentType = 'INBOX' | 'SYSTEM'

/** 模板列表视图对象 */
export interface TemplateVO {
  /** 主键ID */
  id: number
  /** 模板编码 */
  code: string
  /** 模板名称 */
  name: string
  /** 大分类: INBOX/SYSTEM */
  parentType: ParentType
  /** 大分类描述 */
  parentTypeDesc: string
  /** 过期天数 */
  expireDays: number
  /** 状态 */
  status: boolean
  /** 状态描述 */
  statusDesc: string
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
}

/** 模板详情视图对象 */
export interface TemplateDetailVO {
  /** 主键ID */
  id: number
  /** 模板编码 */
  code: string
  /** 模板名称 */
  name: string
  /** 大分类: INBOX/SYSTEM */
  parentType: ParentType
  /** 大分类描述 */
  parentTypeDesc: string
  /** 标题模板 */
  titleTemplate: string
  /** 内容模板 */
  contentTemplate: string
  /** 模板参数定义 */
  params: TemplateParam[]
  /** 按钮配置列表 */
  buttons: TemplateButton[]
  /** 过期天数 */
  expireDays: number
  /** 状态 */
  status: boolean
  /** 状态描述 */
  statusDesc: string
  /** 数据版本 */
  dataVersion: number
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
}

/** 通知按钮VO（用于预览和通知展示） */
export interface ButtonVO {
  /** 按钮标识 */
  buttonKey: string
  /** 按钮文本 */
  label: string
  /** 按钮样式 */
  style: string
  /** 调用类型 */
  actionType: string
  /** 排序 */
  sortOrder: number
}

/** 通知视图对象（预览返回） */
export interface NotificationVO {
  /** 通知ID */
  id: number
  /** 大分类 */
  parentType: string
  /** 大分类描述 */
  parentTypeDesc: string
  /** 渲染后的标题 */
  title: string
  /** 渲染后的内容（支持HTML） */
  content: string
  /** 发送者类型 */
  senderType: string
  /** 发送者名称 */
  senderName: string
  /** 通知状态: unread/read/acted/expired */
  status: string
  /** 状态描述 */
  statusDesc: string
  /** 按钮列表 */
  buttons: ButtonVO[]
  /** 创建时间 */
  createTime: string
  /** 阅读时间 */
  readTime?: string
}

/** 模板列表查询参数 */
export interface TemplateListParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  size: number
  /** 关键字搜索 */
  keyword?: string
}

/** 创建模板请求 */
export interface CreateTemplateDTO {
  /** 模板编码（2-64字符，字母数字下划线） */
  code: string
  /** 模板名称（2-100字符） */
  name: string
  /** 大分类: INBOX/SYSTEM */
  parentType: ParentType
  /** 标题模板（FreeMarker语法，最大500字符） */
  titleTemplate: string
  /** 内容模板（FreeMarker语法） */
  contentTemplate: string
  /** 模板参数定义 */
  params?: TemplateParam[]
  /** 按钮配置列表 */
  buttons?: TemplateButton[]
  /** 通知过期天数，0表示永不过期 */
  expireDays?: number
  /** 状态: true-启用, false-禁用 */
  status?: boolean
}

/** 更新模板请求 */
export interface UpdateTemplateDTO {
  /** 模板名称（2-100字符） */
  name?: string
  /** 大分类: INBOX/SYSTEM */
  parentType?: ParentType
  /** 标题模板（FreeMarker语法，最大500字符） */
  titleTemplate?: string
  /** 内容模板（FreeMarker语法） */
  contentTemplate?: string
  /** 模板参数定义 */
  params?: TemplateParam[]
  /** 按钮配置列表 */
  buttons?: TemplateButton[]
  /** 通知过期天数，0表示永不过期 */
  expireDays?: number
  /** 状态: true-启用, false-禁用 */
  status?: boolean
  /** 数据版本（乐观锁） */
  dataVersion: number
}

/** 管理员发送通知请求 */
export interface AdminSendNotificationDTO {
  /** 模板编码 */
  templateCode: string
  /** 接收用户ID（单个发送时使用） */
  userId?: number
  /** 接收用户ID列表（批量发送时使用） */
  userIds?: number[]
  /** 所属团队ID（可选） */
  teamId?: number
  /** 模板参数 */
  params?: Record<string, unknown>
}

/** 模板列表响应 */
export type TemplateListResponse = ApiResult<PageData<TemplateVO>>

/** 模板详情响应 */
export type TemplateDetailResponse = ApiResult<TemplateDetailVO>

/** 通知预览响应 */
export type NotificationPreviewResponse = ApiResult<NotificationVO>

/** 创建模板响应 */
export type CreateTemplateResponse = ApiResult<number>

/** 发送通知响应 */
export type SendNotificationResponse = ApiResult<number>

/** 批量发送通知响应 */
export type BatchSendNotificationResponse = ApiResult<number[]>
