import type { ApiResult } from './auth.types'
import type { PageData } from './team.types'

/** 通知按钮 */
export interface NotificationButtonVO {
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

/** 通知列表项 */
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
  buttons: NotificationButtonVO[]
  /** 创建时间 */
  createTime: string
  /** 阅读时间 */
  readTime?: string
}

/** 通知详情 */
export interface NotificationDetailVO {
  /** 通知ID */
  id: number
  /** 模板编码 */
  templateCode: string
  /** 大分类 */
  parentType: string
  /** 大分类描述 */
  parentTypeDesc: string
  /** 标题 */
  title: string
  /** 完整内容 */
  content: string
  /** 原始参数 */
  params: Record<string, unknown>
  /** 发送者类型: SYSTEM/USER */
  senderType: string
  /** 发送者ID */
  senderId: number
  /** 发送者名称 */
  senderName: string
  /** 状态 */
  status: string
  /** 状态描述 */
  statusDesc: string
  /** 按钮列表 */
  buttons: NotificationButtonVO[]
  /** 创建时间 */
  createTime: string
  /** 阅读时间 */
  readTime?: string
  /** 过期时间 */
  expireTime?: string
}

/** 通知列表查询参数 */
export interface NotificationListParams {
  /** 用户ID（可选） */
  userId?: number
  /** 页码 */
  page: number
  /** 每页数量 */
  size: number
  /** 大分类 */
  parentType?: string
  /** 状态 */
  status?: string
  /** 关键字搜索 */
  keyword?: string
}

/** 通知列表响应 */
export type NotificationListResponse = ApiResult<PageData<NotificationVO>>

/** 通知详情响应 */
export type NotificationDetailResponse = ApiResult<NotificationDetailVO>