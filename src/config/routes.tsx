import type { RouteObject } from 'react-router-dom'
import {
  HomePage,
  NotFoundPage,
  LoginPage,
  RegisterPage,
  ForgetPasswordPage,
  DashboardPage,
  TeamsPage,
  UsersPage,
  AdminsPage,
  NotificationTemplatesPage,
  NotificationsPage,
  PlansPage,
  FeaturesPage,
  SubscriptionsPage,
  PointsPage,
  OrdersPage,
  ResourcePacksPage,
  GrantsPage,
} from '@/pages'
import { DashboardLayout } from '@/layouts'

/**
 * 认证相关路由
 */
export const authRoutes: RouteObject[] = [
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    path: 'register',
    element: <RegisterPage />,
  },
  {
    path: 'forget-password',
    element: <ForgetPasswordPage />,
  },
]

/**
 * Dashboard 子路由
 */
export const dashboardChildRoutes: RouteObject[] = [
  {
    index: true,
    element: <DashboardPage />,
  },
  // 团队管理
  {
    path: 'team-management/teams',
    element: <TeamsPage />,
  },
  {
    path: 'team-management/users',
    element: <UsersPage />,
  },
  {
    path: 'team-management/admins',
    element: <AdminsPage />,
  },
  // 通知管理
  {
    path: 'notification-management/templates',
    element: <NotificationTemplatesPage />,
  },
  {
    path: 'notification-management/notifications',
    element: <NotificationsPage />,
  },
  // 订阅管理
  {
    path: 'subscription-management/plans',
    element: <PlansPage />,
  },
  {
    path: 'subscription-management/features',
    element: <FeaturesPage />,
  },
  {
    path: 'subscription-management/subscriptions',
    element: <SubscriptionsPage />,
  },
  {
    path: 'subscription-management/points',
    element: <PointsPage />,
  },
  {
    path: 'subscription-management/orders',
    element: <OrdersPage />,
  },
  {
    path: 'subscription-management/resource-packs',
    element: <ResourcePacksPage />,
  },
  {
    path: 'subscription-management/grants',
    element: <GrantsPage />,
  },
]

/**
 * 完整路由配置
 */
export const routesConfig: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/auth',
    children: authRoutes,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: dashboardChildRoutes,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]
