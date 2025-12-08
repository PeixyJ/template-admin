import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { NotificationDatatable, type NotificationFilters } from '@/components/datatable'
import { NotificationDetailSheet } from '@/components/notification/NotificationDetailSheet'
import { getNotificationList } from '@/services/notification'
import type { NotificationVO } from '@/types/notification.types'

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationVO[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 20

  const [filters, setFilters] = useState<NotificationFilters>({
    userId: '',
    keyword: '',
    parentType: '',
    status: '',
  })

  // Detail sheet state
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [notificationToView, setNotificationToView] = useState<NotificationVO | null>(null)

  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const fetchNotifications = async (
    currentPage: number,
    currentFilters?: NotificationFilters
  ) => {
    const filtersToUse = currentFilters ?? filtersRef.current
    setLoading(true)
    try {
      const response = await getNotificationList({
        userId: filtersToUse.userId ? Number(filtersToUse.userId) : undefined,
        page: currentPage,
        size: pageSize,
        keyword: filtersToUse.keyword || undefined,
        parentType: filtersToUse.parentType || undefined,
        status: filtersToUse.status || undefined,
      })
      if (response.data.code === 'SUCCESS') {
        setNotifications(response.data.data?.records || [])
        setTotal(response.data.data?.total || 0)
      } else {
        toast.error(response.data.message || '获取通知列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      toast.error('获取通知列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 页面加载时获取数据
  useEffect(() => {
    fetchNotifications(1)
  }, [])

  const handleSearch = () => {
    setPage(1)
    fetchNotifications(1, filters)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchNotifications(newPage)
  }

  const handleView = (notification: NotificationVO) => {
    setNotificationToView(notification)
    setDetailSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-medium">通知查询</h2>
        </div>
        <NotificationDatatable
          data={notifications}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          filters={filters}
          onFiltersChange={setFilters}
          onPageChange={handlePageChange}
          onView={handleView}
          onRefresh={() => fetchNotifications(page)}
          onSearch={handleSearch}
        />
      </div>

      <NotificationDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        notification={notificationToView}
        userId={Number(filters.userId) || 0}
      />
    </div>
  )
}
