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
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
