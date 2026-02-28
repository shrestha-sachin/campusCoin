import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  SlidersHorizontal,
  Bot,
  Settings,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/manage', icon: SlidersHorizontal, label: 'Manage' },
  { to: '/strategist', icon: Bot, label: 'AI Strategist' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-google-off-white">
      {/* Sidebar — white surface, soft shadow */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-white rounded-r-2xl shadow-card py-6 pl-6 pr-4">
        {/* Wordmark */}
        <div className="pb-6 mb-4 border-b border-black/8">
          <span className="font-google font-bold text-xl tracking-tight text-google-black">
            <span className="text-google-blue">Campus</span>
            <span>Coin</span>
          </span>
          <p className="font-google-mono text-xs text-google-black/50 mt-1.5">
            Financial Intelligence
          </p>
        </div>

        {/* Navigation — generous spacing */}
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-google-text transition-all duration-150 ${
                  isActive
                    ? 'bg-google-blue-pastel text-google-blue font-medium'
                    : 'text-google-black/60 hover:text-google-black hover:bg-google-off-white'
                }`
              }
            >
              <Icon size={20} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Modal badge */}
        <div className="pt-6 mt-4 border-t border-black/8">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-google-blue pulse-dot flex-shrink-0" />
            <span className="font-google-mono text-xs text-google-black/45 tracking-wide">
              Powered by Modal ⚡
            </span>
          </div>
        </div>
      </aside>

      {/* Main content — off-white, generous padding */}
      <main className="flex-1 overflow-y-auto bg-google-off-white">
        <Outlet />
      </main>
    </div>
  )
}
