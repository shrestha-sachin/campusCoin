import React from 'react'
import ChatInterface from '../components/ChatInterface.jsx'
import { Bot, TrendingUp, AlertCircle, CheckCircle2, Zap, Rocket, Lightbulb, Activity, ArrowUpRight, ArrowDownLeft, Target, ShieldCheck } from 'lucide-react'
import { useApp } from '../store.jsx'

const statusMap = {
  on_track: {
    label: 'On Track',
    icon: CheckCircle2,
    color: 'text-g-green',
    bg: 'bg-g-green-pastel',
    desc: 'Your financials look healthy based on your current spending.'
  },
  caution: {
    label: 'Caution',
    icon: TrendingUp,
    color: 'text-g-yellow',
    bg: 'bg-g-yellow-pastel',
    desc: 'Your runway is tightening. Consider reducing variable expenses.'
  },
  critical: {
    label: 'Critical',
    icon: AlertCircle,
    color: 'text-g-red',
    bg: 'bg-g-red-pastel',
    desc: 'Emergency mode active. Funding resources are highly recommended.'
  }
}

export default function Strategist() {
  const { aiInsight, nessieTransactions, profile, refreshAI, loading } = useApp()

  // Status for Financial Pulse
  const s = statusMap[aiInsight?.status || 'on_track']
  const [showInfo, setShowInfo] = React.useState(false)

  // Initialize AI if null
  React.useEffect(() => {
    if (!aiInsight && !loading.ai) {
      refreshAI()
    }
  }, [aiInsight, loading.ai, refreshAI])

  // Calculate days until shortfall
  const daysRemaining = React.useMemo(() => {
    if (!aiInsight?.shortfall_date) return 180
    const diff = new Date(aiInsight.shortfall_date) - new Date()
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
  }, [aiInsight?.shortfall_date])

  const wellnessScore = Math.min(100, Math.max(10, Math.round((daysRemaining / 180) * 100)))

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-8 max-w-[1400px] mx-auto h-screen flex flex-col overflow-hidden">
      <div className="fade-up-1 mb-6 sm:mb-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-g-blue to-g-blue-half flex items-center justify-center shadow-sm">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-g-text tracking-tight">
              Campus Navigator
            </h1>
            <p className="font-body text-g-text-secondary text-sm">
              Your financial Sage & assistance
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1 overflow-hidden min-h-0">
        {/* Left column — cards */}
        <div className="lg:col-span-4 fade-up-2 flex flex-col h-full space-y-6 overflow-y-auto pr-2 no-scrollbar pb-20">

          {/* Financial Pulse Card */}
          <div className="card p-6 relative flex-shrink-0 overflow-hidden">
            <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-10 blur-2xl ${s.bg}`} />

            <div className="flex items-center justify-between mb-4">
              <p className="font-display font-bold text-g-text text-lg flex items-center gap-2">
                <Zap size={18} className="text-g-purple" />
                Financial Pulse
              </p>
              <button
                onClick={() => refreshAI()}
                disabled={loading.ai}
                className={`p-1.5 rounded-lg border border-g-border text-g-text-tertiary hover:text-g-text hover:bg-g-bg transition-all ${loading.ai ? 'animate-spin opacity-50' : ''}`}
                title="Refresh Analysis"
              >
                <Activity size={14} />
              </button>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-g-bg" />
                  <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * (loading.ai ? 0 : wellnessScore)) / 100}
                    className={`${s.color} transition-all duration-1000 ease-out`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-xl font-display font-bold ${s.color}`}>
                    {loading.ai ? '--' : wellnessScore + '%'}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${s.bg} ${s.color} font-body text-xs font-bold mb-2`}>
                  <s.icon size={14} />
                  {loading.ai ? 'Analyzing...' : s.label}
                </div>
                <p className="font-body text-g-text-secondary text-[13px] leading-relaxed">
                  {loading.ai ? 'Hold on while Sage scans your financial horizon...' : s.desc}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-px bg-g-border w-full" />
              {aiInsight?.next_best_action && (
                <div className="p-3.5 rounded-2xl bg-g-bg border border-g-border/50 group relative">
                  <p className="font-body text-[10px] font-bold text-g-text-tertiary uppercase tracking-widest mb-1.5">Priority Action</p>
                  <div className="flex gap-3 items-start">
                    <Rocket size={16} className={`text-g-purple mt-0.5 flex-shrink-0 ${loading.ai ? 'animate-bounce' : ''}`} />
                    <p className={`font-body text-g-text text-sm font-medium leading-normal ${loading.ai ? 'opacity-40' : ''}`}>
                      {aiInsight.next_best_action}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* New: Status Milestones */}
          <div className="card p-6 border-none shadow-sm flex-shrink-0">
            <p className="font-display font-bold text-g-text text-[15px] mb-4 flex items-center gap-2">
              <Target size={18} className="text-g-blue" />
              Runway Target
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-g-text-tertiary">
                <span>Current Runway</span>
                <span className="text-g-text">{daysRemaining} Days</span>
              </div>
              <div className="w-full h-2 bg-g-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-g-blue to-g-blue-half transition-all duration-1000"
                  style={{ width: `${Math.min(100, (daysRemaining / 120) * 100)}%` }}
                />
              </div>
              <p className="font-body text-[12px] text-g-text-secondary leading-relaxed italic">
                {daysRemaining > 90
                  ? "You have achieved 'Quarterly Security'. Your next goal is a full semester buffer."
                  : "Aim for a 90-day runway to reach 'Stable' tier status."}
              </p>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-l-g-purple flex-shrink-0">
            <p className="font-display font-bold text-g-text text-[15px] mb-2">Proactive Planning</p>
            <p className="font-body text-g-text-secondary text-sm leading-relaxed mb-4">
              Sage isn't just a chatbot — it monitors your Nessie transactions in real-time to adjust advice.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInfo(true)}
                className="text-g-purple text-xs font-bold hover:underline cursor-pointer"
              >
                LEARN MORE →
              </button>
              <div className="ml-auto px-2 py-0.5 rounded-full bg-g-purple-pastel text-g-purple text-[10px] font-bold uppercase tracking-wider">
                Gemini
              </div>
            </div>
          </div>

          {/* New: Active Signals (Transactions) */}
          <div className="card p-5 border-none shadow-sm flex-shrink-0 bg-g-surface">
            <div className="flex items-center justify-between mb-4">
              <p className="font-display font-bold text-g-text text-[14px] flex items-center gap-2">
                <Activity size={16} className="text-g-purple" />
                Active Signals
              </p>
              <div className="px-1.5 py-0.5 rounded bg-g-purple-pastel text-g-purple text-[9px] font-bold uppercase">Nessie Live</div>
            </div>
            <div className="space-y-3">
              {nessieTransactions.slice(0, 3).map((t, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${t.amount < 0 ? 'bg-g-red-pastel text-g-red' : 'bg-g-green-pastel text-g-green'}`}>
                      {t.amount < 0 ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-body text-[13px] text-g-text font-medium truncate">{t.description}</p>
                      <p className="font-body text-[10px] text-g-text-tertiary">Just now</p>
                    </div>
                  </div>
                  <p className={`font-display font-bold text-[13px] ${t.amount < 0 ? 'text-g-text' : 'text-g-green'}`}>
                    {t.amount < 0 ? `-$${Math.abs(t.amount)}` : `+$${t.amount}`}
                  </p>
                </div>
              ))}
              {nessieTransactions.length === 0 && (
                <div className="py-4 text-center border-2 border-dashed border-g-border rounded-2xl">
                  <p className="font-body text-xs text-g-text-tertiary">Waiting for balance signals...</p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-g-purple/5 to-transparent border-none shadow-sm flex-shrink-0">
            <div className="flex items-center gap-2 text-g-purple mb-3">
              <ShieldCheck size={18} />
              <p className="font-display font-bold text-sm tracking-wide uppercase">Sage Wisdom</p>
            </div>
            <p className="font-body text-g-text text-[13px] leading-relaxed italic opacity-80">
              "Building even a $500 'starter' emergency fund can prevent 80% of student loan borrowing for surprise costs."
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 fade-up-3 h-full overflow-hidden">
          <ChatInterface />
        </div>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-md p-4" onClick={() => setShowInfo(false)}>
          <div className="bg-g-surface rounded-3xl w-full max-w-lg p-7 sm:p-9 shadow-2xl scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-2xl bg-g-purple-pastel flex items-center justify-center">
                <Zap size={24} className="text-g-purple" />
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="p-2 rounded-xl text-g-text-tertiary hover:text-g-text hover:bg-g-bg transition-colors"
              >
                <AlertCircle size={20} />
              </button>
            </div>

            <h3 className="font-display font-bold text-2xl text-g-text mb-2">Intelligence Engine</h3>
            <p className="font-body text-g-text-secondary text-[15px] leading-relaxed mb-8">
              CampusCoin Sage is designed to be a proactive financial navigator, not just a reactive responder.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-g-blue-pastel flex items-center justify-center flex-shrink-0">
                  <Bot size={20} className="text-g-blue" />
                </div>
                <div>
                  <p className="font-body font-bold text-g-text text-sm">Real-time Nessie Sync</p>
                  <p className="font-body text-g-text-secondary text-xs leading-relaxed">Automatically imports transactions from your Capital One accounts to update your budget immediately.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-g-green-pastel flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={20} className="text-g-green" />
                </div>
                <div>
                  <p className="font-body font-bold text-g-text text-sm">Predictive Analysis</p>
                  <p className="font-body text-g-text-secondary text-xs leading-relaxed">Calculates your 'Shortfall Date' using historical spending velocity to warn you before you hit zero.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-g-purple-pastel flex items-center justify-center flex-shrink-0">
                  <Rocket size={20} className="text-g-purple" />
                </div>
                <div>
                  <p className="font-body font-bold text-g-text text-sm">Adaptive Advice</p>
                  <p className="font-body text-g-text-secondary text-xs leading-relaxed">Sage adjusts its recommendations based on your actual income frequency and bill due dates.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="w-full py-3.5 rounded-full bg-g-text text-white font-body text-sm font-bold hover:opacity-90 transition-all shadow-sm"
            >
              Close Navigator Info
            </button>
          </div>
        </div>
      )}
    </div>

  )
}
