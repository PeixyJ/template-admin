import { api } from './api'
import type {
  NotificationListParams,
  NotificationListResponse,
  NotificationDetailResponse,
} from '@/types/notification.types'

const NOTIFICATION_PREFIX = '/v1/admin/notifications'

/** 分页查询通知列表 */
export function getNotificationList(params: NotificationListParams) {
  return api.get<NotificationListResponse>(NOTIFICATION_PREFIX, { params })
}

/** 获取通知详情 */
export function getNotificationDetail(id: number, userId?: number) {
  return api.get<NotificationDetailResponse>(`${NOTIFICATION_PREFIX}/${id}`, {
    params: userId ? { userId } : undefined,
  })
}
