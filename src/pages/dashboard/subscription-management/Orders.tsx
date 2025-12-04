import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { OrderDatatable } from '@/components/subscription/OrderDatatable'
import { OrderDetailSheet } from '@/components/subscription/OrderDetailSheet'
import { RefundDialog } from '@/components/subscription/RefundDialog'
import { ConfirmPaymentDialog } from '@/components/subscription/ConfirmPaymentDialog'

import { getOrderList, cancelOrder } from '@/services/subscription'
import type { AdminOrderVO, OrderListParams } from '@/types/subscription.types'

export default function Orders() {
  const [orders, setOrders] = useState<AdminOrderVO[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [refundOrder, setRefundOrder] = useState<AdminOrderVO | null>(null)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [confirmOrder, setConfirmOrder] = useState<AdminOrderVO | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params: OrderListParams = {
        page: 1,
        size: 100,
      }
      const response = await getOrderList(params)
      if (response.code === 'SUCCESS') {
        setOrders(response.data?.records || [])
      } else {
        toast.error(response.message || '获取订单列表失败')
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

  const handleRowClick = (order: AdminOrderVO) => {
    setSelectedOrderId(order.id)
    setDetailSheetOpen(true)
  }

  const handleViewDetail = (order: AdminOrderVO) => {
    setSelectedOrderId(order.id)
    setDetailSheetOpen(true)
  }

  const handleCancel = async (order: AdminOrderVO) => {
    if (!confirm(`确定要取消订单 "${order.orderNo}" 吗？`)) {
      return
    }

    try {
      const response = await cancelOrder(order.id)
      if (response.code === 'SUCCESS') {
        toast.success('订单已取消')
        fetchOrders()
      } else {
        toast.error(response.message || '取消订单失败')
      }
    } catch (error) {
      console.error('Failed to cancel order:', error)
      toast.error('取消订单失败')
    }
  }

  const handleRefund = (order: AdminOrderVO) => {
    setRefundOrder(order)
    setRefundDialogOpen(true)
  }

  const handleConfirmPayment = (order: AdminOrderVO) => {
    setConfirmOrder(order)
    setConfirmDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">订单管理</h1>
          <p className="text-muted-foreground">查看和管理用户订单</p>
        </div>
      </div>

      <div className="rounded-xl bg-card">
        <OrderDatatable
          data={orders}
          loading={loading}
          onRowClick={handleRowClick}
          onViewDetail={handleViewDetail}
          onCancel={handleCancel}
          onRefund={handleRefund}
          onConfirmPayment={handleConfirmPayment}
        />
      </div>

      <OrderDetailSheet
        orderId={selectedOrderId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

      <RefundDialog
        order={refundOrder}
        open={refundDialogOpen}
        onOpenChange={setRefundDialogOpen}
        onSuccess={fetchOrders}
      />

      <ConfirmPaymentDialog
        order={confirmOrder}
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onSuccess={fetchOrders}
      />
    </div>
  )
}
