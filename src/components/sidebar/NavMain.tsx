import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import type { NavMainItem } from '@/config/navigation'

interface NavMainProps {
  items: NavMainItem[]
}

export function NavMain({ items }: NavMainProps) {
  const location = useLocation()
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>基础模块</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = item.items && item.items.length > 0
          const hasUrl = Boolean(item.url)
          const isActive =
            item.isActive ||
            (item.url && location.pathname === item.url) ||
            item.items?.some((sub) => location.pathname === sub.url)

          // 控制展开状态：手动控制或根据 active 状态
          const isOpen = openItems[item.title] ?? isActive

          return (
            <Collapsible
              key={item.title}
              asChild
              open={isOpen}
              onOpenChange={() => toggleItem(item.title)}
            >
              <SidebarMenuItem>
                {hasUrl ? (
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link to={item.url!}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      <item.icon />
                      <span>{item.title}</span>
                      {hasChildren && (
                        <ChevronRight
                          className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                        />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                )}
                {hasChildren && hasUrl && (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction
                      className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                    >
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                )}
                {hasChildren && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items!.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
