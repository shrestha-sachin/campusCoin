import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useApp } from '../store.jsx'
import BalanceCard from '../components/BalanceCard.jsx'
import RunwayChart from '../components/RunwayChart.jsx'
import FinancialGoalsCard from '../components/FinancialGoalsCard.jsx'
import UpcomingBillsCard from '../components/UpcomingBillsCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import NextActionCard from '../components/NextActionCard.jsx'
import EmergencyModal from '../components/EmergencyModal.jsx'
import {
  FileText, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, CalendarDays, Banknote,
  ArrowUp, ArrowDown, History, CreditCard,
  RefreshCw, Loader2, BadgeCheck, Wallet, PiggyBank, GraduationCap, Briefcase, Zap, Shield
} from 'lucide-react'

const STRATEGY_ICONS = {
  Wallet, TrendingUp, PiggyBank, CreditCard, GraduationCap, Briefcase, Zap, Shield
}

const STRATEGY_COLORS = {
  blue: 'bg-g-blue-pastel text-g-blue border-g-blue/20',
  green: 'bg-g-green-pastel text-g-green border-g-green/20',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  red: 'bg-g-red-pastel text-g-red border-g-red/20',
  purple: 'bg-purple-50 text-purple-600 border-purple-200'
}

function QuickStat({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="card p-4 sm:p-5 flex items-center gap-4 bg-g-surface/50 border-none shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
      <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-500`}>
        <Icon size={64} className={color} />
      </div>
      <div className={`w-11 h-11 rounded-2xl ${bgColor} flex items-center justify-center flex-shrink-0 shadow-sm relative z-10`}>
        <Icon size={20} className={color} />
      </div>
      <div className="min-w-0 relative z-10">
        <p className="font-display text-[10px] text-g-text-tertiary tracking-wide uppercase font-bold">{label}</p>
        <p className={`font-display font-bold text-g-text text-xl leading-tight truncate group-hover:text-g-blue transition-colors`}>{value}</p>
      </div>
    </div>
  )
}

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function timeAgo(date) {
  if (!date) return 'never'
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 5) return 'just now'
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export default function Dashboard() {
  const {
    profile, incomeStreams, expenses, aiInsight, setAiInsight, loading,
    refreshRunway, refreshAI,
    nessieTransactions, pollNessie, lastPoll,
  } = useApp()

  const [showEmergency, setShowEmergency] = useState(false)
  const [polling, setPolling] = useState(false)
  const [splitWidth, setSplitWidth] = useState(33.33)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1280)
  const [isDragging, setIsDragging] = useState(false)
  const isResizing = useRef(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1280)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const relativeX = e.clientX - rect.left
      const percentage = (relativeX / rect.width) * 100
      if (percentage > 15 && percentage < 85) setSplitWidth(percentage)
    }
    const handleMouseUp = () => {
      isResizing.current = false
      setIsDragging(false)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const handleMouseDown = (e) => {
    e.preventDefault()
    isResizing.current = true
    setIsDragging(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const firstName = profile.name.split(' ')[0]

  useEffect(() => {
    refreshRunway()
  }, [])

  useEffect(() => {
    if (aiInsight?.emergency_mode) setShowEmergency(true)
  }, [aiInsight?.emergency_mode])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const stats = useMemo(() => {
    const nessieDeposits = nessieTransactions.filter(t => t.type === 'deposit')
    const nessiePurchases = nessieTransactions.filter(t => t.type === 'purchase')
    const totalDeposits = nessieDeposits.reduce((s, t) => s + (t.amount || 0), 0)
    const totalPurchases = nessiePurchases.reduce((s, t) => s + (t.amount || 0), 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const monthlyIncome = totalDeposits > 0 ? totalDeposits : incomeStreams
      .filter(s => {
        if (!s.is_active || s.is_lump_sum) return false
        const payDate = s.first_payday ? new Date(s.first_payday) : new Date(s.start_date)
        return payDate <= today
      })
      .reduce((sum, s) => {
        const gross = s.hourly_rate * s.weekly_hours * 4.33
        const taxMult = 1 - ((s.tax_rate || 15) / 100)
        return sum + (gross * taxMult)
      }, 0)
    const monthlyExpenses = totalPurchases > 0 ? totalPurchases : expenses
      .filter(e => e.is_active)
      .reduce((sum, e) => {
        if (e.frequency === 'monthly') return sum + e.amount
        if (e.frequency === 'weekly') return sum + e.amount * 4.33
        if (e.frequency === 'semesterly') return sum + e.amount / 4
        return sum
      }, 0)
    const netMonthly = monthlyIncome - monthlyExpenses
    const daysUntilGrad = profile.graduation_date
      ? Math.max(0, Math.ceil((new Date(profile.graduation_date) - new Date()) / (1000 * 60 * 60 * 24)))
      : null
    return {
      monthlyIncome, monthlyExpenses, netMonthly, daysUntilGrad,
      txnCount: nessieTransactions.length,
      depositCount: nessieDeposits.length,
      purchaseCount: nessiePurchases.length,
    }
  }, [incomeStreams, expenses, profile.graduation_date, nessieTransactions])

  async function handleManualPoll() {
    setPolling(true)
    await pollNessie()
    setPolling(false)
  }

  return (
    <>
      {showEmergency && (
        <EmergencyModal
          onClose={() => setShowEmergency(false)}
          resources={aiInsight?.emergency_resources || []}
          university={profile.university}
          status={aiInsight?.status || 'on_track'}
        />
      )}

      <div className="p-4 sm:p-6 lg:p-10 pt-8 space-y-8 max-w-[1400px] mx-auto pb-24">
        {/* Hero Section */}
        <div className="fade-up-1 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-g-text tracking-tight">
              {greeting}, <span className="bg-gradient-to-r from-g-blue to-g-blue-half bg-clip-text text-transparent">{firstName}</span>
            </h1>
            <p className="font-body text-g-text-secondary text-base flex items-center gap-2">
              <span className="opacity-60">{profile.university}</span>
              <span className="w-1 h-1 rounded-full bg-g-text-tertiary" />
              <span className="opacity-60">{profile.major}</span>
            </p>
          </div>
          <button
            onClick={() => setShowEmergency(true)}
            className="flex items-center gap-3 bg-g-surface border border-g-border rounded-2xl px-5 py-3 shadow-sm scale-in hover:shadow-md hover:bg-g-bg/50 transition-all cursor-pointer group"
          >
            <StatusBadge status={aiInsight?.status ?? 'on_track'} />
            <div className="w-px h-6 bg-g-border mx-1" />
            <div className="flex flex-col text-left">
              <span className="font-mono text-[10px] text-g-text-tertiary uppercase tracking-wider group-hover:text-g-blue transition-colors">Semester Path</span>
              <span className="font-display font-bold text-g-text text-xs">
                {stats.daysUntilGrad !== null ? `Graduation in ${stats.daysUntilGrad}d` : 'Target: Graduation'}
              </span>
            </div>
          </button>
        </div>

        {/* Top Intelligence Section */}
        <div className="fade-up-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-4 min-h-0 flex-grow">
              <BalanceCard onStatusClick={() => setShowEmergency(true)} />
            </div>
            <div className="lg:col-span-8">
              <NextActionCard />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickStat
              icon={TrendingUp} label="Month Income (Net)"
              value={fmt(stats.monthlyIncome)}
              color="text-g-green" bgColor="bg-g-green-pastel"
            />
            <QuickStat
              icon={TrendingDown} label="Month Purchases"
              value={fmt(stats.monthlyExpenses)}
              color="text-g-red" bgColor="bg-g-red-pastel"
            />
            <QuickStat
              icon={stats.netMonthly >= 0 ? ArrowUpRight : ArrowDownRight}
              label="Net Monthly"
              value={fmt(stats.netMonthly)}
              color={stats.netMonthly >= 0 ? 'text-g-green' : 'text-g-red'}
              bgColor={stats.netMonthly >= 0 ? 'bg-g-green-pastel' : 'bg-g-red-pastel'}
            />
            <QuickStat
              icon={CalendarDays} label="Days Margin"
              value={stats.daysUntilGrad !== null ? stats.daysUntilGrad.toString() : '—'}
              color="text-g-blue" bgColor="bg-g-blue-pastel"
            />
          </div>
        </div>

        {/* Main Insights Grid */}
        <div className="fade-up-3 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <RunwayChart />
          </div>

          <div className="lg:col-span-4 flex flex-col">
            {profile.nessie_account_id && (
              <div className="card p-0 border-none shadow-premium overflow-hidden bg-g-surface h-full flex flex-col">
                <div className="p-6 border-b border-g-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-g-bg flex items-center justify-center">
                        <CreditCard size={20} className="text-g-blue" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base text-g-text">Live Ledger</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-g-green pulse-dot" />
                          <span className="font-display text-[10px] text-g-text-tertiary uppercase font-bold tracking-tight">Syncing via Nessie</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleManualPoll}
                      disabled={polling}
                      className="p-2 rounded-xl bg-g-bg text-g-text-secondary hover:text-g-blue hover:bg-g-blue-pastel transition-colors cursor-pointer"
                    >
                      <RefreshCw size={14} className={polling ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden relative">
                  <div className="absolute inset-0 overflow-y-auto no-scrollbar scroll-smooth p-2 space-y-1">
                    {nessieTransactions.length === 0 ? (
                      <div className="py-12 text-center px-4">
                        <History size={24} className="text-g-text-tertiary mx-auto mb-2 opacity-30" />
                        <p className="font-body text-g-text-secondary text-xs">No active signals detected</p>
                      </div>
                    ) : (
                      nessieTransactions.map((tx, i) => {
                        const isDeposit = tx.type === 'deposit'
                        return (
                          <div key={tx.id || i} className="group flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-g-bg transition-all duration-300">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-95 ${isDeposit ? 'bg-g-green-pastel' : 'bg-g-red-pastel'}`}>
                              {isDeposit ? <ArrowUp size={16} className="text-g-green" /> : <ArrowDown size={16} className="text-g-red" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-display text-[14px] text-g-text font-bold truncate group-hover:text-g-blue transition-colors">{tx.description}</p>
                              <p className="font-display text-[10px] text-g-text-tertiary mt-0.5 uppercase font-bold tracking-tight">
                                {tx.date ? new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'} · {tx.status}
                              </p>
                            </div>
                            <p className={`font-display font-bold text-sm ${isDeposit ? 'text-g-green' : 'text-g-text'}`}>
                              {isDeposit ? '+' : '-'}{fmt(tx.amount)}
                            </p>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                <div className="p-4 bg-g-bg/40 border-t border-g-border">
                  <p className="font-display text-[10px] text-g-text-tertiary text-center uppercase font-bold tracking-tight">
                    Updating automatically every {timeAgo(lastPoll)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Intelligence - Unified 2-Column Balanced Grid */}
        <div
          ref={containerRef}
          className="fade-up-4 flex flex-col xl:flex-row items-stretch pt-4 relative min-h-0"
        >
          {isDragging && (
            <div className="fixed inset-0 z-[100] cursor-col-resize bg-transparent" />
          )}

          <div
            className="flex flex-col gap-6"
            style={{ width: isDesktop ? `${splitWidth}%` : '100%' }}
          >
            <div className="flex-[2] min-h-[280px] flex flex-col xl:pr-6">
              <FinancialGoalsCard />
            </div>
            <div className="flex-[2] min-h-[280px] flex flex-col xl:pr-6">
              <UpcomingBillsCard />
            </div>
            {expenses.filter(e => e.is_active).length > 0 && (() => {
              const activeExp = expenses.filter(e => e.is_active).sort((a, b) => b.amount - a.amount).slice(0, 4)
              const maxAmt = Math.max(...activeExp.map(e => e.amount))
              const totalMonthly = expenses.filter(e => e.is_active).reduce((s, e) => {
                if (e.frequency === 'monthly') return s + e.amount
                if (e.frequency === 'weekly') return s + e.amount * 4.33
                if (e.frequency === 'semesterly') return s + e.amount / 4
                return s
              }, 0)
              const RANK_COLORS = [
                'from-rose-400 to-red-500',
                'from-orange-400 to-amber-500',
                'from-blue-400 to-indigo-500',
                'from-slate-400 to-gray-500',
              ]
              return (
                <div className="card flex-[2] min-h-[280px] p-5 sm:p-6 border-none shadow-premium bg-g-surface flex flex-col overflow-hidden xl:mr-6 relative">
                  <div className="absolute -top-8 -left-8 w-32 h-32 bg-g-red/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-g-red-pastel to-red-100 flex items-center justify-center shadow-sm">
                        <Banknote size={17} className="text-g-red" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base text-g-text">Concentration</h3>
                        <span className="font-display text-[10px] text-g-text-tertiary uppercase font-bold tracking-wider">Top Monthly Spend</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-base text-g-text">{fmt(totalMonthly)}</p>
                      <p className="font-display text-[10px] text-g-text-tertiary uppercase font-bold tracking-wide">total/mo</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 flex flex-col justify-center overflow-y-auto no-scrollbar">
                    {activeExp.map((exp, idx) => {
                      const pct = maxAmt > 0 ? (exp.amount / maxAmt) * 100 : 0
                      const sharePct = totalMonthly > 0 ? ((exp.amount / totalMonthly) * 100).toFixed(0) : 0
                      return (
                        <div key={exp.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${RANK_COLORS[idx]} flex items-center justify-center shadow-sm`}>
                                <span className="font-display font-black text-[9px] text-white">{idx + 1}</span>
                              </div>
                              <span className="font-display font-bold text-[13px] text-g-text">{exp.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-display text-[10px] text-g-text-tertiary font-bold">{sharePct}%</span>
                              <span className="font-mono font-bold text-[12px] text-g-text">{fmt(exp.amount)}</span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-g-bg rounded-full overflow-hidden border border-g-border/20">
                            <div
                              className={`h-full bg-gradient-to-r ${RANK_COLORS[idx]} transition-all duration-1000 ease-out rounded-full`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>

          <div
            onMouseDown={handleMouseDown}
            className="hidden xl:flex w-2 -mx-1 group cursor-col-resize items-center justify-center z-50 relative h-full min-h-[400px]"
          >
            <div className="w-px h-full bg-g-border group-hover:bg-g-blue/40 group-hover:w-0.5 transition-all" />
            <div className="absolute w-6 h-10 rounded-xl bg-g-surface border border-g-border shadow-soft flex items-center justify-center group-hover:border-g-blue group-hover:shadow-md transition-all active:scale-90 z-10">
              <div className="flex gap-0.5">
                <div className="w-0.5 h-3 rounded-full bg-g-text-tertiary/40 group-hover:bg-g-blue" />
                <div className="w-0.5 h-3 rounded-full bg-g-text-tertiary/40 group-hover:bg-g-blue" />
              </div>
            </div>
          </div>

          <div
            className="flex flex-col"
            style={{ width: isDesktop ? `${100 - splitWidth}%` : '100%' }}
          >
            <div className="card h-full p-6 border-none shadow-premium bg-gradient-to-br from-g-surface to-g-bg relative overflow-hidden group flex flex-col xl:ml-6">
              <div className="absolute top-0 right-0 p-3 opacity-5 -mr-4 -mt-4 transform group-hover:rotate-12 transition-transform pointer-events-none">
                <FileText size={180} />
              </div>
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-g-blue-pastel to-blue-100 flex items-center justify-center shadow-sm overflow-hidden">
                        <span className="font-display font-black text-lg text-g-blue">CC</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-g-blue rounded-full flex items-center justify-center border-2 border-g-surface">
                        <BadgeCheck size={12} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-lg text-g-text">Your Advisor</h2>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-display text-[10px] text-g-text-tertiary uppercase font-bold tracking-[0.15em]">CampusCoin Finance Review</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setAiInsight(null)
                      const freshRunway = await refreshRunway()
                      await refreshAI(freshRunway)
                    }}
                    disabled={loading.ai}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-g-blue-pastel text-g-blue text-xs font-display font-bold hover:bg-g-blue hover:text-white transition-all disabled:opacity-40"
                  >
                    <RefreshCw size={13} className={loading.ai ? 'animate-spin' : ''} />
                    New Review
                  </button>
                </div>

                {loading.ai ? (
                  <div className="space-y-4 flex-1 flex flex-col justify-center items-center py-12">
                    <div className="relative">
                      <div className="absolute inset-0 bg-g-blue/20 blur-xl rounded-full scale-150 animate-pulse" />
                      <Loader2 size={32} className="animate-spin text-g-blue relative z-10" />
                    </div>
                    <div className="text-center">
                      <p className="font-display text-sm font-bold text-g-text-secondary uppercase tracking-[0.3em] animate-pulse">Reviewing your finances...</p>
                      <p className="font-body text-xs text-g-text-tertiary mt-1">Preparing your personal report</p>
                    </div>
                  </div>
                ) : aiInsight ? (
                  <div className="flex flex-col h-full space-y-4">
                    {/* Summary */}
                    <div className="px-5 py-4 rounded-2xl bg-g-bg/40 border border-g-border/30">
                      <p className="font-body text-[15px] text-g-text-secondary leading-relaxed">
                        {aiInsight.full_analysis}
                      </p>
                    </div>

                    {/* Strategy Points */}
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2 pb-4">
                      {(aiInsight.strategy_points || []).map((point, idx) => {
                        const Icon = STRATEGY_ICONS[point.icon] || Wallet
                        const colorClass = STRATEGY_COLORS[point.color] || STRATEGY_COLORS.blue

                        return (
                          <div
                            key={idx}
                            className={`flex gap-4 p-4 rounded-2xl border bg-g-surface/50 hover:bg-g-surface transition-all duration-300 group/point animate-fade-in`}
                            style={{ animationDelay: `${idx * 150}ms` }}
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover/point:scale-110 ${colorClass}`}>
                              <Icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-display font-bold text-g-text text-base mb-1.5">{point.label}</h4>
                              <p className="font-body text-[13px] text-g-text-tertiary leading-relaxed group-hover/point:text-g-text-secondary transition-colors">
                                {point.details}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center opacity-30 px-6">
                    <BadgeCheck size={48} className="mb-4 text-g-blue" />
                    <p className="font-display text-sm font-bold uppercase tracking-[0.3em]">No Review Yet</p>
                    <p className="font-body text-xs text-g-text-tertiary mt-1">Your report will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
