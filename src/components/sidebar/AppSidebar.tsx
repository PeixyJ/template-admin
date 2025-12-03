import * as React from 'react'
import { Link } from 'react-router-dom'

import { NavMain } from './NavMain'
import { NavProjects } from './NavProjects'
import { NavSecondary } from './NavSecondary'
import { NavUser, type UserInfo } from './NavUser'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  navMainConfig,
  navSecondaryConfig,
  navProjectsConfig,
  type NavMainItem,
  type NavSecondaryItem,
  type NavProjectItem,
} from '@/config/navigation'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: UserInfo
  navMain?: NavMainItem[]
  navSecondary?: NavSecondaryItem[]
  projects?: NavProjectItem[]
  onLogout?: () => void
}

export function AppSidebar({
  user,
  navMain = navMainConfig,
  navSecondary = navSecondaryConfig,
  projects = navProjectsConfig,
  onLogout,
  ...props
}: AppSidebarProps) {
  const defaultUser: UserInfo = {
    name: 'Guest User',
    email: 'guest@example.com',
    avatar: '',
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <img
                    src={import.meta.env.VITE_APP_ICON || '/favicon.svg'}
                    alt="Logo"
                    className="size-4"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {import.meta.env.VITE_APP_TITLE || 'Admin Template'}
                  </span>
                  <span className="truncate text-xs">管理后台</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || defaultUser} onLogout={onLogout} />
      </SidebarFooter>
    </Sidebar>
  )
}
