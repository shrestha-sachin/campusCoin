import React, { useEffect, useState } from 'react'
import { useApp } from '../store.jsx'
import BalanceCard from '../components/BalanceCard.jsx'
import RunwayChart from '../components/RunwayChart.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import NextActionCard from '../components/NextActionCard.jsx'
import EmergencyModal from '../components/EmergencyModal.jsx'
import { FileText } from 'lucide-react'

export default function Dashboard() {
  const { profile, aiInsight, loading, syncNessie, refreshRunway, refreshAI } = useApp()
  const [showEmergency, setShowEmergency] = useState(false)
  const firstName = profile.name.split(' ')[0]

  useEffect(() => {
    async function init() {
      await syncNessie()
      const rw = await refreshRunway()
      await refreshAI(rw)
    }
    init()
  }, [])

  useEffect(() => {
    if (aiInsight?.emergency_mode) setShowEmergency(true)
  }, [aiInsight?.emergency_mode])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}

      <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="fade-up-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-[28px] text-g-text tracking-tight">
              {greeting},{' '}
              <span className="text-g-blue">{firstName}</span>
            </h1>
            <p className="font-body text-g-text-secondary text-sm mt-1">
              {profile.university} · {profile.major} · Graduating {profile.graduation_date}
            </p>
          </div>
          <StatusBadge status={aiInsight?.status ?? 'on_track'} />
        </div>

        {/* Cards */}
        <div className="fade-up-2 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="lg:col-span-1"><BalanceCard /></div>
          <div className="lg:col-span-2"><NextActionCard /></div>
        </div>

        {/* Runway */}
        <div className="fade-up-3"><RunwayChart /></div>

        {/* Full Analysis */}
        <div className="fade-up-4 card p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-g-blue-pastel flex items-center justify-center">
              <FileText size={16} className="text-g-blue" />
            </div>
            <span className="font-mono text-[11px] text-g-text-secondary tracking-widest uppercase">
              Full Analysis
            </span>
          </div>
          {loading.ai ? (
            <div className="space-y-2.5">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-4/5" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          ) : (
            <p className="font-body text-g-text-secondary text-sm leading-relaxed whitespace-pre-line">
              {aiInsight?.full_analysis ?? 'Analyzing your financial data — please wait…'}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
