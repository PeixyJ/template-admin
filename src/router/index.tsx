import { createBrowserRouter } from 'react-router-dom'
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
  PlansPage,
  SubscriptionsPage,
  FeaturesPage,
  OrdersPage,
  PointsPage,
  ResourcePacksPage,
  GrantsPage,
} from '@/pages'
import { DashboardLayout } from '@/layouts'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/auth',
    children: [
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
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
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
      {
        path: 'notification-management/templates',
        element: <NotificationTemplatesPage />,
      },
      {
        path: 'subscription-management/plans',
        element: <PlansPage />,
      },
      {
        path: 'subscription-management/subscriptions',
        element: <SubscriptionsPage />,
      },
      {
        path: 'subscription-management/features',
        element: <FeaturesPage />,
      },
      {
        path: 'subscription-management/orders',
        element: <OrdersPage />,
      },
      {
        path: 'subscription-management/points',
        element: <PointsPage />,
      },
      {
        path: 'subscription-management/resource-packs',
        element: <ResourcePacksPage />,
      },
      {
        path: 'subscription-management/grants',
        element: <GrantsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
