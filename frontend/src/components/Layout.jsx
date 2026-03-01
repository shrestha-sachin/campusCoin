import React, { useState, useRef, useCallback } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  SlidersHorizontal,
  Bot,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import Logo from './Logo.jsx'
import PartnerLogos from './PartnerLogos.jsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/manage', icon: SlidersHorizontal, label: 'Manage' },
  { to: '/strategist', icon: Bot, label: 'Navigator' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const SCROLL_THRESHOLD = 10

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileHeaderVisible, setMobileHeaderVisible] = useState(true)
  const lastScrollY = useRef(0)

  const handleMainScroll = useCallback((e) => {
    const el = e.target
    if (!el || el.tagName !== 'MAIN') return
    const scrollTop = el.scrollTop
    if (scrollTop <= 0) {
      setMobileHeaderVisible(true)
    } else if (scrollTop > lastScrollY.current && scrollTop > SCROLL_THRESHOLD) {
      setMobileHeaderVisible(false)
    } else if (scrollTop < lastScrollY.current) {
      setMobileHeaderVisible(true)
    }
    lastScrollY.current = scrollTop
  }, [])

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
          <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center">
            <Logo size="small" />
          </NavLink>
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

        {/* Partner logos */}
        <div className="pt-5 mt-3 border-t border-g-border">
          <PartnerLogos />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar — fixed, hides on scroll down, shows on scroll up */}
        <header
          className={`
            fixed left-0 right-0 top-0 z-30 flex
            items-center justify-between px-5 py-3.5
            bg-g-surface border-b border-g-border
            transition-transform duration-300 ease-out
            lg:hidden
            ${mobileHeaderVisible ? 'translate-y-0' : '-translate-y-full'}
          `}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 rounded-xl text-g-text-secondary hover:text-g-text hover:bg-g-bg transition-colors"
          >
            <Menu size={22} />
          </button>
          <NavLink to="/dashboard" className="flex items-center">
            <Logo size="small" />
          </NavLink>
          <div className="w-11" />
        </header>

        <main
          className="flex-1 overflow-y-auto overflow-x-hidden bg-g-bg pt-14 lg:pt-0"
          onScroll={handleMainScroll}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
