import * as React from 'react'
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { NavMain, type NavMainItem } from './NavMain'
import { NavProjects, type NavProjectItem } from './NavProjects'
import { NavSecondary, type NavSecondaryItem } from './NavSecondary'
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

const defaultNavMain: NavMainItem[] = [
  {
    title: 'Playground',
    url: '/dashboard',
    icon: SquareTerminal,
    isActive: true,
    items: [
      { title: 'History', url: '/dashboard/history' },
      { title: 'Starred', url: '/dashboard/starred' },
      { title: 'Settings', url: '/dashboard/settings' },
    ],
  },
  {
    title: 'Models',
    url: '/dashboard/models',
    icon: Bot,
    items: [
      { title: 'Genesis', url: '/dashboard/models/genesis' },
      { title: 'Explorer', url: '/dashboard/models/explorer' },
      { title: 'Quantum', url: '/dashboard/models/quantum' },
    ],
  },
  {
    title: 'Documentation',
    url: '/dashboard/docs',
    icon: BookOpen,
    items: [
      { title: 'Introduction', url: '/dashboard/docs/intro' },
      { title: 'Get Started', url: '/dashboard/docs/get-started' },
      { title: 'Tutorials', url: '/dashboard/docs/tutorials' },
      { title: 'Changelog', url: '/dashboard/docs/changelog' },
    ],
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings2,
    items: [
      { title: 'General', url: '/dashboard/settings/general' },
      { title: 'Team', url: '/dashboard/settings/team' },
      { title: 'Billing', url: '/dashboard/settings/billing' },
      { title: 'Limits', url: '/dashboard/settings/limits' },
    ],
  },
]

const defaultNavSecondary: NavSecondaryItem[] = [
  { title: 'Support', url: '/dashboard/support', icon: LifeBuoy },
  { title: 'Feedback', url: '/dashboard/feedback', icon: Send },
]

const defaultProjects: NavProjectItem[] = [
  { name: 'Design Engineering', url: '/dashboard/projects/design', icon: Frame },
  { name: 'Sales & Marketing', url: '/dashboard/projects/sales', icon: PieChart },
  { name: 'Travel', url: '/dashboard/projects/travel', icon: Map },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: UserInfo
  navMain?: NavMainItem[]
  navSecondary?: NavSecondaryItem[]
  projects?: NavProjectItem[]
  onLogout?: () => void
}

export function AppSidebar({
  user,
  navMain = defaultNavMain,
  navSecondary = defaultNavSecondary,
  projects = defaultProjects,
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
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
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
