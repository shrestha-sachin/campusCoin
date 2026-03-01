import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bot, TrendingUp, AlertCircle, CheckCircle2, Zap, Rocket, Lightbulb,
  Activity, ArrowUpRight, ArrowDownLeft, Target, ShieldCheck,
  Upload, FileText, CalendarRange, DollarSign, Clock, X, Loader2,
  SlidersHorizontal, PiggyBank, CheckCheck, Library, FileCheck, Crown, Lock, Sparkles
} from 'lucide-react'
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

const impactColors = [
  { threshold: 100, bg: 'bg-g-green-pastel', text: 'text-g-green', border: 'border-g-green/20' },
  { threshold: 200, bg: 'bg-g-yellow-pastel', text: 'text-g-yellow', border: 'border-g-yellow/20' },
  { threshold: Infinity, bg: 'bg-g-red-pastel', text: 'text-g-red', border: 'border-g-red/20' },
]

function getImpactStyle(amount) {
  return impactColors.find(c => amount <= c.threshold) || impactColors[2]
}

export default function Strategist() {
  const {
    aiInsight, nessieTransactions, profile, setProfile, refreshAI, loading,
    academicEvents, ingestAcademic, setAcademicEvents, refreshRunway, auth
  } = useApp()
  const isPremium = auth.is_premium

  const s = statusMap[aiInsight?.status || 'on_track']
  const [showInfo, setShowInfo] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [ingestionError, setIngestionError] = useState(null)
  const [summaryText, setSummaryText] = useState(null)
  const [adjustingIdx, setAdjustingIdx] = useState(null)
  const [goalAdded, setGoalAdded] = useState({})
  const fileInputRef = React.useRef(null)
  const navigate = useNavigate()

  const addSavingsGoal = useCallback((evt, idx) => {
    const goalText = `Save $${evt.financial_impact.toFixed(0)} before ${evt.title} (${evt.date_range})`
    setProfile(prev => ({
      ...prev,
      financial_goals: [...(prev.financial_goals || []), goalText]
    }))
    setGoalAdded(prev => ({ ...prev, [idx]: true }))
    setTimeout(() => setGoalAdded(prev => ({ ...prev, [idx]: false })), 3000)
  }, [setProfile])

  React.useEffect(() => {
    if (!aiInsight && !loading.ai) {
      refreshAI()
    }
  }, [aiInsight, loading.ai, refreshAI])

  const daysRemaining = React.useMemo(() => {
    if (!aiInsight?.shortfall_date) return 180
    const diff = new Date(aiInsight.shortfall_date) - new Date()
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
  }, [aiInsight?.shortfall_date])

  const wellnessScore = Math.min(100, Math.max(10, Math.round((daysRemaining / 180) * 100)))

  const handleFile = useCallback(async (file) => {
    if (!file) return
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setIngestionError('Please upload a PDF or image file (PNG, JPG, WebP).')
      return
    }
    setIngestionError(null)
    setSummaryText(null)
    try {
      const result = await ingestAcademic(file)
      setSummaryText(result.overall_summary)
      refreshRunway()
    } catch (err) {
      setIngestionError(err.message || 'Ingestion failed. Please try again.')
    }
  }, [ingestAcademic, refreshRunway])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    handleFile(file)
  }, [handleFile])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const onDragLeave = useCallback(() => setDragOver(false), [])

  const onFileSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    handleFile(file)
  }, [handleFile])

  const resetIngestion = useCallback(() => {
    setAcademicEvents([])
    setSummaryText(null)
    setIngestionError(null)
  }, [setAcademicEvents])

  const totalImpact = academicEvents.reduce((sum, e) => sum + e.financial_impact, 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-8 max-w-[1400px] mx-auto min-h-0 lg:h-screen flex flex-col lg:overflow-hidden relative">
      <div className="fade-up-1 mb-6 sm:mb-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 text-left">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-g-blue to-g-blue-half flex items-center justify-center shadow-sm">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-g-text tracking-tight">
              Campus Navigator
            </h1>
            <p className="font-body text-g-text-secondary text-sm">
              Academic-to-Financial Inference Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:flex-1 lg:overflow-hidden min-h-0">
        {/* Left column — cards */}
        <div className="lg:col-span-4 fade-up-2 flex flex-col lg:h-full space-y-6 lg:overflow-y-auto lg:pr-2 lg:no-scrollbar pb-10 lg:pb-20 relative">

          {/* Financial Pulse Card */}
          <div className="card p-6 relative flex-shrink-0 overflow-hidden">
            <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-10 blur-2xl ${s.bg}`} />
            <div className="flex items-center justify-between mb-4">
              <p className="font-display font-bold text-g-text text-lg flex items-center gap-2">
                <Zap size={18} className="text-g-purple" />
                Financial Pulse
              </p>
              <button
                onClick={() => isPremium && refreshAI()}
                disabled={loading.ai || !isPremium}
                className={`p-1.5 rounded-lg border border-g-border text-g-text-tertiary hover:text-g-text hover:bg-g-bg transition-all ${loading.ai ? 'animate-spin opacity-50' : ''}`}
                title={isPremium ? "Refresh Analysis" : "Premium Feature"}
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
                  {!isPremium && <div className="absolute inset-0 bg-g-bg/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                    <Lock size={14} className="text-g-text-tertiary" />
                  </div>}
                </div>
              )}
            </div>

            {!isPremium && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center z-10 rounded-[32px]">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-white shadow-xl flex items-center justify-center mb-4 sm:mb-5 border border-g-border">
                  <Crown size={24} className="text-g-blue sm:w-7 sm:h-7" strokeWidth={1.5} />
                </div>
                <h4 className="font-display font-bold text-base sm:text-lg text-g-text mb-1.5 sm:mb-2">Gemini AI Strategist</h4>
                <p className="font-body text-g-text-secondary text-[12px] sm:text-sm leading-relaxed mb-5 sm:mb-6 max-w-[180px] sm:max-w-[200px]">
                  Unlock your personal AI Advisor with CampusCoin Premium.
                </p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="w-full max-w-[240px] flex items-center justify-center gap-2 sm:gap-3 px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl bg-g-blue text-white font-display font-bold text-xs sm:text-sm shadow-lg shadow-g-blue/20 hover:bg-[#3367d6] transition-all"
                >
                  <Sparkles size={16} className="sm:w-4 sm:h-4" />
                  Upgrade to Premium
                </button>
              </div>
            )}
          </div>

          {/* Runway Target */}
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
              Upload your documents and CampusCoin will predict how academic stress periods impact your income and runway.
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

          {/* Active Signals (Transactions) */}
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

          {/* Knowledge Vault — Saved Documents */}
          <div className="relative overflow-hidden rounded-[32px] flex-shrink-0">
            {profile.doc_history && profile.doc_history.length > 0 && (
              <div className="card p-5 border-none shadow-sm bg-g-surface">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-display font-bold text-g-text text-[14px] flex items-center gap-2">
                    <Library size={16} className="text-g-blue" />
                    Knowledge Vault
                  </p>
                  <span className="text-[10px] font-bold text-g-text-tertiary uppercase tracking-wider bg-g-bg px-2 py-0.5 rounded-full">
                    {profile.doc_history.length} Docs
                  </span>
                </div>
                <div className="space-y-3">
                  {profile.doc_history.slice(0, 5).map((doc, idx) => (
                    <div key={doc.id || idx} className="p-3 rounded-xl bg-g-bg border border-g-border/30 hover:border-g-blue/20 transition-all group cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-g-blue-pastel text-g-blue flex items-center justify-center">
                          <FileCheck size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-[12px] text-g-text font-bold truncate group-hover:text-g-blue transition-colors">
                            {doc.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="font-body text-[10px] text-g-text-tertiary">
                              {new Date(doc.upload_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <span className="w-1 h-1 rounded-full bg-g-border" />
                            <p className="font-body text-[10px] text-g-blue font-bold">{doc.event_count} events</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isPremium && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center z-10 rounded-[32px]">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white shadow-xl flex items-center justify-center mb-3 sm:mb-4 border border-g-border">
                  <Lock size={18} className="text-g-text-tertiary sm:w-5 sm:h-5" />
                </div>
                <p className="font-display font-bold text-sm sm:text-base text-g-text mb-1">Supermemory</p>
                <p className="font-body text-g-text-secondary text-[11px] sm:text-xs leading-relaxed mb-4 sm:mb-5 max-w-[160px] sm:max-w-[180px]">
                  Unlock cross-session history and document persistence.
                </p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-g-text text-white font-display font-bold text-[10px] sm:text-[11px] uppercase tracking-wider shadow-sm hover:scale-105 transition-transform"
                >
                  Go Premium
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column — Ingestion Hub */}
        <div className="lg:col-span-8 fade-up-3 lg:h-full lg:overflow-y-auto lg:no-scrollbar pb-10 lg:pb-20">

          {/* Loading State */}
          {loading.ingestion && (
            <div className="card p-0 overflow-hidden lg:h-full min-h-[400px] flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-g-blue/10 to-g-purple/10 flex items-center justify-center mb-6">
                  <Loader2 size={40} className="text-g-blue animate-spin" />
                </div>
              </div>
              <p className="font-display font-bold text-g-text text-xl mb-2">Powered by Modal</p>
              <p className="font-body text-g-text-secondary text-sm max-w-md text-center leading-relaxed">
                Gemini is scanning your documents for midterms, finals, and project deadlines to predict
                how they'll impact your work hours and runway.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="px-3 py-1.5 rounded-full bg-g-blue-pastel text-g-blue text-xs font-bold">Gemini 1.5</div>
                <div className="px-3 py-1.5 rounded-full bg-g-purple-pastel text-g-purple text-xs font-display font-bold">Powered by Modal</div>
                <div className="px-3 py-1.5 rounded-full bg-g-green-pastel text-g-green text-xs font-bold">Supermemory</div>
              </div>
            </div>
          )}

          {/* Results: Academic Event Cards */}
          {!loading.ingestion && academicEvents.length > 0 && (
            <div className="space-y-5">
              <div className="card p-6 bg-gradient-to-br from-g-blue/5 to-g-purple/5 border-none">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-g-blue to-g-purple flex items-center justify-center">
                        <CalendarRange size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="font-display font-bold text-g-text text-lg">Semester Forecast</p>
                        <p className="font-body text-g-text-tertiary text-xs">{academicEvents.length} stress periods detected</p>
                      </div>
                    </div>
                    {summaryText && (
                      <p className="font-body text-g-text-secondary text-sm leading-relaxed mb-4">{summaryText}</p>
                    )}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-g-border flex-1 sm:flex-none">
                        <DollarSign size={16} className="text-g-red" />
                        <div>
                          <p className="font-body text-[10px] text-g-text-tertiary uppercase font-bold tracking-wider">Total Impact</p>
                          <p className="font-display font-bold text-g-text">${totalImpact.toFixed(0)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={resetIngestion}
                    className="p-2 rounded-xl text-g-text-tertiary hover:text-g-text hover:bg-white/50 transition-all"
                    title="Upload new documents"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {academicEvents.map((evt, idx) => {
                  const style = getImpactStyle(evt.financial_impact)
                  return (
                    <div key={idx} className={`card p-5 border-l-4 ${style.border} hover:shadow-md transition-all group`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
                              <CalendarRange size={16} className={style.text} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-display font-bold text-g-text text-[15px] truncate">{evt.title}</p>
                              <p className="font-body text-g-text-tertiary text-xs">{evt.date_range}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 mb-3">
                            <div className="flex items-center gap-1.5">
                              <Clock size={13} className="text-g-text-tertiary" />
                              <span className="font-body text-xs text-g-text-secondary">-{evt.inferred_hours_reduction} hrs/wk</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <DollarSign size={13} className={style.text} />
                              <span className={`font-display font-bold text-sm ${style.text}`}>-${evt.financial_impact.toFixed(0)}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setAdjustingIdx(adjustingIdx === idx ? null : idx)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl ${style.bg} ${style.text} font-body text-xs font-bold hover:opacity-80 transition-all`}
                        >
                          <SlidersHorizontal size={13} />
                          Adjust Runway
                        </button>
                      </div>
                      {adjustingIdx === idx && (
                        <div className="mt-4 pt-4 border-t border-g-border space-y-3 animate-fade-in">
                          <p className="font-display font-bold text-g-text text-[13px]">Recommended Action</p>
                          <div className={`flex items-center gap-3 p-3 rounded-xl ${style.bg} border ${style.border}`}>
                            <PiggyBank size={18} className={style.text} />
                            <p className={`font-body text-xs font-medium ${style.text} flex-1`}>{evt.recommended_action}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => addSavingsGoal(evt, idx)}
                              disabled={!!goalAdded[idx]}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-display font-bold transition-all ${goalAdded[idx] ? 'bg-emerald-500 text-white' : 'bg-g-blue text-white'}`}
                            >
                              {goalAdded[idx] ? 'Goal Added!' : 'Set as Goal'}
                            </button>
                            <button onClick={() => navigate('/manage')} className="px-4 py-2 rounded-xl bg-g-bg border border-g-border text-xs font-bold text-g-text">Manage Budget</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-g-border rounded-2xl text-g-text-tertiary font-body text-sm hover:border-g-blue/30 transition-all"
              >
                Upload another document
              </button>
              <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={onFileSelect} />
            </div>
          )}

          {/* Dropzone (initial state) */}
          {!loading.ingestion && academicEvents.length === 0 && (
            <div className="card p-0 overflow-hidden lg:h-full min-h-[400px] flex flex-col">
              <div className="p-6 border-b border-g-border">
                <h2 className="font-display font-bold text-xl text-g-text mb-1">Academic Document Ingestion</h2>
                <p className="font-body text-sm text-g-text-secondary">Predict stress periods and their financial impact.</p>
              </div>
              <div className="flex-1 p-8 flex items-center justify-center">
                <div
                  onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={() => fileInputRef.current?.click()}
                  className={`w-full max-w-lg rounded-3xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${dragOver ? 'border-g-blue bg-g-blue-pastel' : 'border-g-border hover:border-g-blue/20'}`}
                >
                  <div className="w-20 h-20 rounded-3xl bg-g-blue-pastel text-g-blue flex items-center justify-center mx-auto mb-6">
                    <Upload size={32} />
                  </div>
                  <p className="font-display font-bold text-lg text-g-text mb-1">{dragOver ? 'Drop it here' : 'Drag & drop documents'}</p>
                  <p className="font-body text-sm text-g-text-secondary mb-8">PDF, PNG, JPG, WebP supported.</p>
                  <button className="px-6 py-3 rounded-2xl bg-g-blue text-white font-display font-bold text-sm">Browse Files</button>
                  <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={onFileSelect} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-md p-4" onClick={() => setShowInfo(false)}>
          <div className="bg-g-surface rounded-3xl w-full max-w-md p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl text-g-text">Intelligence Engine</h3>
              <button onClick={() => setShowInfo(false)} className="p-2 rounded-xl hover:bg-g-bg transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-g-blue-pastel flex items-center justify-center flex-shrink-0"><FileText size={20} className="text-g-blue" /></div>
                <div>
                  <p className="font-body font-bold text-sm text-g-text">Multimodal Ingestion</p>
                  <p className="font-body text-xs text-g-text-secondary">Upload PDFs or photos. Gemini extracts every midterm, final, and major deadline automatically.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-g-green-pastel flex items-center justify-center flex-shrink-0"><TrendingUp size={20} className="text-g-green" /></div>
                <div>
                  <p className="font-body font-bold text-sm text-g-text">Predictive Impact</p>
                  <p className="font-body text-xs text-g-text-secondary">We calculate exactly how many work hours you'll lose and the dollar impact on your runway.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-g-purple-pastel flex items-center justify-center flex-shrink-0"><Rocket size={20} className="text-g-purple" /></div>
                <div>
                  <p className="font-body font-bold text-sm text-g-text">Persistent Memory</p>
                  <p className="font-body text-xs text-g-text-secondary">Supermemory stores your bottlenecks permanently, adapting your financial plan over time.</p>
                </div>
              </div>
            </div>
            <button onClick={() => setShowInfo(false)} className="w-full mt-8 py-3 rounded-2xl bg-g-text text-white font-display font-bold text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
