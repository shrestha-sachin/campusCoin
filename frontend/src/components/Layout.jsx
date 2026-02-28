import React, { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  SlidersHorizontal,
  Bot,
  Settings,
  Menu,
  X,
  Zap,
} from 'lucide-react'
import Logo from './Logo.jsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/manage', icon: SlidersHorizontal, label: 'Manage' },
  { to: '/strategist', icon: Bot, label: 'Strategist' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-g-bg">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-g-surface
          border-r border-g-border py-7 pl-7 pr-5
          transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0 lg:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo + close */}
        <div className="pb-6 mb-3 border-b border-g-border flex items-center justify-between">
          <Logo size="default" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-g-text-tertiary hover:text-g-text hover:bg-g-bg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 mt-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-body font-medium transition-all duration-200 ${isActive
                  ? 'bg-g-blue-pastel text-g-blue shadow-sm'
                  : 'text-g-text-secondary hover:text-g-text hover:bg-g-bg'
                }`
              }
            >
              <Icon size={20} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer badge */}
        <div className="pt-5 mt-3 border-t border-g-border">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-g-green pulse-dot flex-shrink-0" />
            <span className="font-body text-xs text-g-text-tertiary flex items-center gap-1.5">
              Powered by Modal <Zap size={12} />
            </span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-5 py-3.5 bg-g-surface border-b border-g-border flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 rounded-xl text-g-text-secondary hover:text-g-text hover:bg-g-bg transition-colors"
          >
            <Menu size={22} />
          </button>
          <Logo size="small" />
          <div className="w-11" />
        </header>

        <main className="flex-1 overflow-y-auto bg-g-bg">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
