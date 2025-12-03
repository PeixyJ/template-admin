import { api } from './api'
import type { ApiResult } from '@/types/auth.types'
import type {
  TemplateListParams,
  TemplateListResponse,
  TemplateDetailResponse,
  TemplateOptionsResponse,
  TemplatePreviewResponse,
  TemplateValidateResponse,
  SendNotificationResponse,
  CreateTemplateResponse,
  CreateTemplateDTO,
  UpdateTemplateDTO,
  UpdateTemplateStatusDTO,
  PreviewTemplateDTO,
  ValidateTemplateDTO,
  SendNotificationDTO,
} from '@/types/notification-template.types'

const TEMPLATE_PREFIX = '/v1/admin/notification-templates'

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

/** 预览模板 */
export function previewTemplate(id: number, data: PreviewTemplateDTO) {
  return api.post<TemplatePreviewResponse>(`${TEMPLATE_PREFIX}/${id}/preview`, data)
}

/** 启用/禁用模板 */
export function updateTemplateStatus(id: number, data: UpdateTemplateStatusDTO) {
  return api.patch<ApiResult>(`${TEMPLATE_PREFIX}/${id}/status`, data)
}

/** 获取模板下拉选项 */
export function getTemplateOptions(type?: string) {
  return api.get<TemplateOptionsResponse>(`${TEMPLATE_PREFIX}/options`, {
    params: type ? { type } : undefined,
  })
}

/** 校验模板语法 */
export function validateTemplate(data: ValidateTemplateDTO) {
  return api.post<TemplateValidateResponse>(`${TEMPLATE_PREFIX}/validate`, data)
}

/** 发送通知给指定用户 */
export function sendNotification(data: SendNotificationDTO) {
  return api.post<SendNotificationResponse>(`${TEMPLATE_PREFIX}/send`, data)
}
