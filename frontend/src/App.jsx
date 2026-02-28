import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Manage from './pages/Manage.jsx'
import Strategist from './pages/Strategist.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="manage" element={<Manage />} />
        <Route path="strategist" element={<Strategist />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
