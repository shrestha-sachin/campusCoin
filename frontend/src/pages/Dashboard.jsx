import React, { useEffect, useState, useMemo } from 'react'
import { useApp } from '../store.jsx'
import BalanceCard from '../components/BalanceCard.jsx'
import RunwayChart from '../components/RunwayChart.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import NextActionCard from '../components/NextActionCard.jsx'
import EmergencyModal from '../components/EmergencyModal.jsx'
import {
  FileText, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, CalendarDays, Banknote,
  ArrowUp, ArrowDown, History, CreditCard,
  RefreshCw, Loader2,
} from 'lucide-react'

function QuickStat({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="card p-4 sm:p-5 flex items-center gap-3.5">
      <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={color} />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[10px] text-g-text-tertiary tracking-wider uppercase">{label}</p>
        <p className="font-display font-bold text-g-text text-lg leading-tight truncate">{value}</p>
      </div>
    </div>
  )
}

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function fmtFull(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
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
    profile, incomeStreams, expenses, aiInsight, loading,
    refreshRunway,
    nessieTransactions, pollNessie, lastPoll,
  } = useApp()
  const [showEmergency, setShowEmergency] = useState(false)
  const [polling, setPolling] = useState(false)
  const firstName = profile.name.split(' ')[0]

  // Only compute runway on first load (AI is triggered by transaction detection)
  useEffect(() => {
    async function init() {
      await refreshRunway()
    }
    init()
  }, [])

  useEffect(() => {
    if (aiInsight?.emergency_mode) setShowEmergency(true)
  }, [aiInsight?.emergency_mode])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Compute quick stats from real Nessie data
  const stats = useMemo(() => {
    const nessieDeposits = nessieTransactions.filter(t => t.type === 'deposit')
    const nessiePurchases = nessieTransactions.filter(t => t.type === 'purchase')

    const totalDeposits = nessieDeposits.reduce((s, t) => s + (t.amount || 0), 0)
    const totalPurchases = nessiePurchases.reduce((s, t) => s + (t.amount || 0), 0)

    // Use Nessie totals if available, otherwise fall back to estimated
    const monthlyIncome = totalDeposits > 0 ? totalDeposits : incomeStreams
      .filter(s => s.is_active && !s.is_lump_sum)
      .reduce((sum, s) => sum + (s.hourly_rate * s.weekly_hours * 4.33), 0)

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
              {profile.university} · {profile.major}
              {profile.graduation_date && ` · Class of ${profile.graduation_date.slice(0, 4)}`}
            </p>
          </div>
          <StatusBadge status={aiInsight?.status ?? 'on_track'} />
        </div>

        {/* Quick Stats */}
        <div className="fade-up-2 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <QuickStat
            icon={TrendingUp} label="Total Deposits"
            value={fmt(stats.monthlyIncome)}
            color="text-g-green" bgColor="bg-g-green-pastel"
          />
          <QuickStat
            icon={TrendingDown} label="Total Purchases"
            value={fmt(stats.monthlyExpenses)}
            color="text-g-red" bgColor="bg-g-red-pastel"
          />
          <QuickStat
            icon={stats.netMonthly >= 0 ? ArrowUpRight : ArrowDownRight}
            label="Net Flow"
            value={fmt(stats.netMonthly)}
            color={stats.netMonthly >= 0 ? 'text-g-green' : 'text-g-red'}
            bgColor={stats.netMonthly >= 0 ? 'bg-g-green-pastel' : 'bg-g-red-pastel'}
          />
          <QuickStat
            icon={CalendarDays} label="Until Grad"
            value={stats.daysUntilGrad !== null ? `${stats.daysUntilGrad}d` : '—'}
            color="text-g-blue" bgColor="bg-g-blue-pastel"
          />
        </div>

        {/* Balance + Next Action */}
        <div className="fade-up-2 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="lg:col-span-1"><BalanceCard /></div>
          <div className="lg:col-span-2"><NextActionCard /></div>
        </div>

        {/* Capital One Transaction History */}
        {profile.nessie_account_id && (
          <div className="fade-up-3 card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-g-blue to-g-blue-half flex items-center justify-center shadow-sm">
                  <CreditCard size={18} className="text-white" />
                </div>
                <div>
                  <span className="font-display font-bold text-base text-g-text block">
                    Capital One Transactions
                  </span>
                  <span className="font-mono text-[10px] text-g-text-tertiary flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-g-green pulse-dot inline-block" />
                    Auto-syncing · Updated {timeAgo(lastPoll)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleManualPoll}
                disabled={polling}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-g-bg text-g-text-tertiary font-mono text-[11px] font-medium border border-g-border hover:text-g-blue hover:border-g-blue/30 transition-all disabled:opacity-50"
              >
                <RefreshCw size={12} className={polling ? 'animate-spin' : ''} />
                Sync
              </button>
            </div>

            {nessieTransactions.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-g-border rounded-2xl bg-g-bg/50">
                <History size={28} className="text-g-text-tertiary mx-auto mb-2.5" />
                <p className="font-body text-g-text-secondary text-sm font-medium">No transactions yet</p>
                <p className="font-body text-g-text-tertiary text-xs mt-1 max-w-sm mx-auto">
                  Transactions from your Capital One account will appear here automatically.
                  Add income or expenses in the Manage section to create them.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[340px] overflow-y-auto">
                {nessieTransactions.map((tx, i) => {
                  const isDeposit = tx.type === 'deposit'
                  return (
                    <div
                      key={tx.id || i}
                      className="stagger-item flex items-center gap-3 px-4 py-3 rounded-2xl bg-g-bg border border-g-border hover:border-g-blue/20 transition-colors"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDeposit ? 'bg-g-green-pastel' : 'bg-g-red-pastel'
                        }`}>
                        {isDeposit
                          ? <ArrowDown size={16} className="text-g-green" />
                          : <ArrowUp size={16} className="text-g-red" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-g-text text-sm font-medium truncate">
                          {tx.description}
                        </p>
                        <p className="font-mono text-[10px] text-g-text-tertiary">
                          {tx.date || '—'} · {isDeposit ? 'Deposit' : 'Purchase'} · {tx.status}
                        </p>
                      </div>
                      <p className={`font-mono text-sm font-semibold flex-shrink-0 ${isDeposit ? 'text-g-green' : 'text-g-red'
                        }`}>
                        {isDeposit ? '+' : '−'}{fmtFull(tx.amount)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}

            {nessieTransactions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-g-border flex items-center justify-between">
                <span className="font-mono text-[11px] text-g-text-tertiary">
                  {stats.depositCount} deposit{stats.depositCount !== 1 ? 's' : ''} · {stats.purchaseCount} purchase{stats.purchaseCount !== 1 ? 's' : ''}
                </span>
                <span className="font-mono text-[11px] text-g-text-tertiary">
                  AI analyzes on new transactions only
                </span>
              </div>
            )}
          </div>
        )}

        {/* Spending Breakdown */}
        {expenses.filter(e => e.is_active).length > 0 && (
          <div className="fade-up-3 card p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-g-red-pastel flex items-center justify-center">
                <Banknote size={16} className="text-g-red" />
              </div>
              <span className="font-mono text-[11px] text-g-text-secondary tracking-widest uppercase">
                Spending Breakdown
              </span>
            </div>
            <div className="space-y-2.5">
              {expenses.filter(e => e.is_active).sort((a, b) => b.amount - a.amount).map(exp => {
                const maxAmt = Math.max(...expenses.filter(e => e.is_active).map(e => e.amount))
                const pct = maxAmt > 0 ? (exp.amount / maxAmt) * 100 : 0
                return (
                  <div key={exp.id} className="flex items-center gap-3">
                    <p className="font-body text-g-text text-sm w-28 sm:w-36 truncate flex-shrink-0">{exp.label}</p>
                    <div className="flex-1 h-6 bg-g-bg rounded-lg overflow-hidden border border-g-border relative">
                      <div
                        className="h-full bg-gradient-to-r from-g-red-pastel to-g-red/30 rounded-lg transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="font-mono text-xs text-g-text-secondary w-16 text-right flex-shrink-0">
                      {fmt(exp.amount)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Runway Chart */}
        <div className="fade-up-3"><RunwayChart /></div>

        {/* AI Analysis */}
        <div className="fade-up-4 card p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-g-blue-pastel flex items-center justify-center">
              <FileText size={16} className="text-g-blue" />
            </div>
            <div>
              <span className="font-mono text-[11px] text-g-text-secondary tracking-widest uppercase block">
                AI Analysis
              </span>
              <span className="font-mono text-[10px] text-g-text-tertiary">
                Triggered by new transactions
              </span>
            </div>
          </div>
          {loading.ai ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 mb-3">
                <Loader2 size={14} className="animate-spin text-g-blue" />
                <span className="font-body text-g-text-secondary text-sm">New transaction detected — analyzing…</span>
              </div>
              <div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-5/6" />
              <div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-4/5" />
            </div>
          ) : aiInsight ? (
            <p className="font-body text-g-text-secondary text-sm leading-relaxed whitespace-pre-line">
              {aiInsight.full_analysis}
            </p>
          ) : (
            <div className="text-center py-6">
              <p className="font-body text-g-text-tertiary text-sm">
                Waiting for transactions to analyze…
              </p>
              <p className="font-mono text-[11px] text-g-text-tertiary mt-1">
                AI will automatically run when a new deposit or purchase is detected from Capital One
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
