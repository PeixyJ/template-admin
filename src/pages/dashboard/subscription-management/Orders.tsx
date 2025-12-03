import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { OrderDatatable } from '@/components/datatable/OrderDatatable'
import {
  getOrderList,
  cancelOrder,
  exportOrders,
} from '@/services/subscription'
import type { AdminOrderVO, OrderListParams } from '@/types/subscription.types'

export default function Orders() {
  const [orders, setOrders] = useState<AdminOrderVO[]>([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params: OrderListParams = {
        page: 1,
        size: 100,
      }
      const response = await getOrderList(params)
      if (response.data.code === 'SUCCESS') {
        setOrders(response.data.data?.records || [])
      } else {
        toast.error(response.data.message || '获取订单列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleView = (order: AdminOrderVO) => {
    // TODO: Open detail sheet
    toast.info(`查看订单: ${order.orderNo}`)
  }

  const handleCancel = async (order: AdminOrderVO) => {
    try {
      const response = await cancelOrder(order.id)
      if (response.data.code === 'SUCCESS') {
        toast.success(`订单 "${order.orderNo}" 已取消`)
        fetchOrders()
      } else {
        toast.error(response.data.message || '取消订单失败')
      }
    } catch (error) {
      console.error('Failed to cancel order:', error)
      toast.error('取消订单失败')
    }
  }

  const handleRefund = (order: AdminOrderVO) => {
    // TODO: Open refund dialog
    toast.info(`退款订单: ${order.orderNo}`)
  }

  const handleConfirmPayment = (order: AdminOrderVO) => {
    // TODO: Open confirm payment dialog
    toast.info(`确认支付: ${order.orderNo}`)
  }

  const handleExport = async () => {
    try {
      const params: OrderListParams = {
        page: 1,
        size: 1000,
      }
      const response = await exportOrders(params)
      const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `订单导出_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('导出成功')
    } catch (error) {
      console.error('Failed to export orders:', error)
      toast.error('导出失败')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card">
        <OrderDatatable
          data={orders}
          loading={loading}
          onView={handleView}
          onCancel={handleCancel}
          onRefund={handleRefund}
          onConfirmPayment={handleConfirmPayment}
          onExport={handleExport}
          onRefresh={fetchOrders}
        />
      </div>
    </div>
  )
}
