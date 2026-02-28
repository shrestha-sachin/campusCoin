import React, { useEffect, useState } from 'react'
import { useApp } from '../store.jsx'
import BalanceCard from '../components/BalanceCard.jsx'
import RunwayChart from '../components/RunwayChart.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import NextActionCard from '../components/NextActionCard.jsx'
import EmergencyModal from '../components/EmergencyModal.jsx'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (aiInsight?.emergency_mode) {
      setShowEmergency(true)
    }
  }, [aiInsight?.emergency_mode])

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}

      <div className="p-10 space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="fade-up-1 flex items-center justify-between">
          <div>
            <h1 className="font-google font-bold text-3xl text-google-black">
              {greeting},{' '}
              <span className="text-google-blue">{firstName}</span>
            </h1>
            <p className="font-google-text text-google-black/55 text-base mt-2">
              {profile.university} · {profile.major} · Graduating {profile.graduation_date}
            </p>
          </div>
          <StatusBadge status={aiInsight?.status ?? 'on_track'} />
        </div>

        {/* Balance + Next Action */}
        <div className="fade-up-2 grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <BalanceCard />
          </div>
          <div className="col-span-2">
            <NextActionCard />
          </div>
        </div>

        {/* Runway Chart */}
        <div className="fade-up-3">
          <RunwayChart />
        </div>

        {/* Full Analysis */}
        <div className="fade-up-4 card p-8">
          <p className="font-google-mono text-xs text-google-black/50 tracking-widest uppercase mb-5">
            Full Analysis
          </p>
          {loading.ai ? (
            <div className="space-y-3">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-4/5" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          ) : (
            <p className="font-google-text text-google-black/75 text-[15px] leading-relaxed whitespace-pre-line">
              {aiInsight?.full_analysis ?? 'Analyzing your financial data — please wait…'}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
