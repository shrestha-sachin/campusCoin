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
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col bg-g-surface
          border-r border-g-border py-6 pl-6 pr-4
          transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0 lg:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Top: logo + close on mobile */}
        <div className="pb-5 mb-2 border-b border-g-border flex items-center justify-between">
          <Logo size="default" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-g-text-tertiary hover:text-g-text hover:bg-g-bg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-0.5 mt-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-body font-medium transition-all duration-150 ${isActive
                  ? 'bg-g-blue-pastel text-g-blue'
                  : 'text-g-text-secondary hover:text-g-text hover:bg-g-bg'
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer badge */}
        <div className="pt-5 mt-2 border-t border-g-border">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-g-green pulse-dot flex-shrink-0" />
            <span className="font-mono text-[10px] text-g-text-tertiary tracking-wide flex items-center gap-1">
              Powered by Modal <Zap size={10} />
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-g-surface border-b border-g-border flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-g-text-secondary hover:text-g-text hover:bg-g-bg transition-colors"
          >
            <Menu size={20} />
          </button>
          <Logo size="small" />
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-y-auto bg-g-bg">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
