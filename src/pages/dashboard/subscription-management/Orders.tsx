import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { ConfirmPaymentDialog } from '@/components/datatable/ConfirmPaymentDialog'
import { OrderDatatable } from '@/components/datatable/OrderDatatable'
import { OrderDetailSheet } from '@/components/datatable/OrderDetailSheet'
import { RefundDialog } from '@/components/datatable/RefundDialog'
import {
  getOrderList,
  cancelOrder,
  refundOrder,
  confirmPayment,
  exportOrders,
} from '@/services/subscription'
import type { AdminOrderVO, OrderListParams } from '@/types/subscription.types'

export default function Orders() {
  const [orders, setOrders] = useState<AdminOrderVO[]>([])
  const [loading, setLoading] = useState(false)

  // Detail sheet state
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)

  // Refund dialog state
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [orderToRefund, setOrderToRefund] = useState<AdminOrderVO | null>(null)

  // Confirm payment dialog state
  const [confirmPaymentDialogOpen, setConfirmPaymentDialogOpen] = useState(false)
  const [orderToConfirm, setOrderToConfirm] = useState<AdminOrderVO | null>(null)

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
    setSelectedOrderId(order.id)
    setDetailSheetOpen(true)
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
    setOrderToRefund(order)
    setRefundDialogOpen(true)
  }

  const handleRefundConfirm = async (orderId: number, refundAmount: number, reason?: string) => {
    const response = await refundOrder(orderId, { refundAmount, reason })
    if (response.data.code === 'SUCCESS') {
      toast.success('退款成功')
      fetchOrders()
    } else {
      toast.error(response.data.message || '退款失败')
      throw new Error(response.data.message)
    }
  }

  const handleConfirmPayment = (order: AdminOrderVO) => {
    setOrderToConfirm(order)
    setConfirmPaymentDialogOpen(true)
  }

  const handleConfirmPaymentSubmit = async (
    orderId: number,
    payChannel: string,
    transactionNo: string,
    remark?: string
  ) => {
    const response = await confirmPayment(orderId, { payChannel, transactionNo, remark })
    if (response.data.code === 'SUCCESS') {
      toast.success('确认支付成功')
      fetchOrders()
    } else {
      toast.error(response.data.message || '确认支付失败')
      throw new Error(response.data.message)
    }
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

      {/* Order Detail Sheet */}
      <OrderDetailSheet
        orderId={selectedOrderId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

      {/* Refund Dialog */}
      <RefundDialog
        order={orderToRefund}
        open={refundDialogOpen}
        onOpenChange={setRefundDialogOpen}
        onConfirm={handleRefundConfirm}
      />

      {/* Confirm Payment Dialog */}
      <ConfirmPaymentDialog
        order={orderToConfirm}
        open={confirmPaymentDialogOpen}
        onOpenChange={setConfirmPaymentDialogOpen}
        onConfirm={handleConfirmPaymentSubmit}
      />
    </div>
  )
}
