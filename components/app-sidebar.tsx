'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ImageIcon, HomeIcon, CreditCard, Settings, Plus } from 'lucide-react'

//Remove the line: import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Models', href: '/models', icon: ImageIcon },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ImageIcon className="h-6 w-6" />
          <span>Astria Web</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <Button asChild className="w-full mb-4">
          <Link href="/models/new">
            <Plus className="mr-2 h-4 w-4" />
            Train Model
          </Link>
        </Button>
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p>Credits</p>
            <p className="font-medium">0 Models / 0 Images</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/billing">Upgrade</Link>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

