import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './store.jsx'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Manage from './pages/Manage.jsx'
import Strategist from './pages/Strategist.jsx'
import Settings from './pages/Settings.jsx'
import Onboarding from './pages/Onboarding.jsx'

function RequireOnboarding({ children }) {
  const { onboarded } = useApp()
  if (!onboarded) return <Navigate to="/onboarding" replace />
  return children
}

function RedirectIfOnboarded({ children }) {
  const { onboarded } = useApp()
  if (onboarded) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<RedirectIfOnboarded><Onboarding /></RedirectIfOnboarded>} />
      <Route path="/" element={<RequireOnboarding><Layout /></RequireOnboarding>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="manage" element={<Manage />} />
        <Route path="strategist" element={<Strategist />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
