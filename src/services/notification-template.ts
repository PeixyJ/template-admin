import { api } from './api'
import type { ApiResult } from '@/types/auth.types'
import type {
  TemplateListParams,
  TemplateListResponse,
  TemplateDetailResponse,
  NotificationPreviewResponse,
  CreateTemplateResponse,
  SendNotificationResponse,
  BatchSendNotificationResponse,
  CreateTemplateDTO,
  UpdateTemplateDTO,
  AdminSendNotificationDTO,
} from '@/types/notification-template.types'

const TEMPLATE_PREFIX = '/v1/admin/notifications/templates'

/** 分页查询模板列表 */
export function getTemplateList(params: TemplateListParams) {
  return api.get<TemplateListResponse>(TEMPLATE_PREFIX, { params })
}

/** 获取模板详情 */
export function getTemplateDetail(id: number) {
  return api.get<TemplateDetailResponse>(`${TEMPLATE_PREFIX}/${id}`)
}

/** 创建模板 */
export function createTemplate(data: CreateTemplateDTO) {
  return api.post<CreateTemplateResponse>(TEMPLATE_PREFIX, data)
}

/** 更新模板 */
export function updateTemplate(id: number, data: UpdateTemplateDTO) {
  return api.put<ApiResult>(`${TEMPLATE_PREFIX}/${id}`, data)
}

/** 删除模板 */
export function deleteTemplate(id: number) {
  return api.delete<ApiResult>(`${TEMPLATE_PREFIX}/${id}`)
}

/** 更新模板状态 */
export function updateTemplateStatus(id: number, status: boolean) {
  return api.put<ApiResult>(`${TEMPLATE_PREFIX}/${id}/status`, null, {
    params: { status },
  })
}

/** 预览模板 */
export function previewTemplate(id: number, params: Record<string, unknown>) {
  return api.post<NotificationPreviewResponse>(`${TEMPLATE_PREFIX}/${id}/preview`, params)
}

/** 发送通知给单个用户 */
export function sendNotification(data: AdminSendNotificationDTO) {
  return api.post<SendNotificationResponse>(`${TEMPLATE_PREFIX}/send`, data)
}

/** 批量发送通知给多个用户 */
export function batchSendNotification(data: AdminSendNotificationDTO) {
  return api.post<BatchSendNotificationResponse>(`${TEMPLATE_PREFIX}/batch-send`, data)
}
