import { Link, usePage, useForm } from '@inertiajs/react'
import { ChevronLeft, ChevronRight, UserRound, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import React from 'react'
import type { User } from '@/types/inertia'
import { tuyau } from '@/tuyau'
import { getSidebarRoutes } from '@/lib/routes'

type AppSidebarProps = {
  children?: React.ReactNode
  collapsed: boolean
  onToggleCollapse: () => void
}

const AppSidebar = ({ children, collapsed, onToggleCollapse }: AppSidebarProps) => {
  const page = usePage<{ user?: User }>()
  const user = page.props.user
  const currentPath = page.url.split('?')[0] // Enlève les query parameters
  const sidebarRoutes = getSidebarRoutes()

  const { post } = useForm()

  const handleLogout = () => {
    post(tuyau.logout.$url())
  }

  return (
    <div className="h-screen w-full bg-white border-r border-border transition-all duration-300">
      <div className="flex items-center justify-between h-16 p-4 border-b border-border w-full">
        {!collapsed && (
          <Link href="/app/home">
            <h2 className="font-bold text-lg text-primary block">Rapid Work Tracker</h2>
          </Link>
        )}
        <button
          type="button"
          className={collapsed ? 'mx-auto' : 'ml-auto'}
          onClick={onToggleCollapse}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="p-2 flex flex-col h-[calc(100%-64px)] justify-between">
        <ul className="space-y-1">
          {sidebarRoutes.map((route) => (
            <li key={route.key}>
              <Link
                href={route.href}
                className={cn(
                  `w-full flex items-center justify-start rounded-md transition-colors px-4 py-2 text-sm font-medium hover:bg-gray-100`,
                  collapsed ? 'px-2 justify-center' : 'px-4',
                  currentPath === route.href || currentPath.includes(route.key)
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'hover:bg-gray-50'
                )}
                title={collapsed ? route.label : undefined}
              >
                <route.icon size={20} />
                {!collapsed && <span className="ml-2">{route.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
        {children}
        <div className="mt-auto space-y-2 border-t border-border pt-4">
          {user ? (
            <>
              <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
                <UserRound size={20} />
                {!collapsed && (
                  <div className="ml-2 overflow-hidden">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                )}
              </div>
              <button
                type="button"
                className={`w-full flex items-center rounded-md transition-colors py-2 text-sm font-medium hover:bg-gray-100 ${
                  collapsed ? 'px-2 justify-center' : 'px-4 justify-start'
                }`}
                onClick={handleLogout}
                title={collapsed ? 'Déconnexion' : undefined}
              >
                <LogOut size={20} />
                {!collapsed && <span className="ml-2">Déconnexion</span>}
              </button>
            </>
          ) : (
            <div className={`flex justify-center px-2`}>
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700">
                Se connecter
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}

export default AppSidebar
