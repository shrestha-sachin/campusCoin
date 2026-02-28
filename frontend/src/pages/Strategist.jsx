import React from 'react'
import ChatInterface from '../components/ChatInterface.jsx'
import { Bot, TrendingUp, AlertCircle, CheckCircle2, Zap, Rocket, Lightbulb } from 'lucide-react'
import { useApp } from '../store.jsx'

export default function Strategist() {
  const { aiInsight } = useApp()

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

  const s = statusMap[aiInsight?.status || 'on_track']
  const [showInfo, setShowInfo] = React.useState(false)

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
        {/* Left: Financial Pulse */}
        <div className="lg:col-span-4 fade-up-2 flex flex-col h-full space-y-6 overflow-y-auto pr-2 no-scrollbar pb-20">
          <div className="card p-6 relative flex-shrink-0 overflow-hidden">
            {/* Background Accent */}
            <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-10 blur-2xl ${s.bg}`} />

            <p className="font-display font-bold text-g-text text-lg mb-4 flex items-center gap-2">
              <Zap size={18} className="text-g-purple" />
              Financial Pulse
            </p>

            <div className="space-y-5">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${s.bg} ${s.color} font-body text-sm font-semibold`}>
                <s.icon size={16} />
                {s.label}
              </div>

              <p className="font-body text-g-text-secondary text-[15px] leading-relaxed">
                {s.desc}
              </p>

              <div className="h-px bg-g-border w-full" />

              {aiInsight?.next_best_action && (
                <div>
                  <p className="font-body text-xs font-bold text-g-text-tertiary uppercase tracking-wider mb-2">Priority Action</p>
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-g-purple-pastel flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Rocket size={16} className="text-g-purple" />
                    </div>
                    <p className="font-body text-g-text text-sm font-medium leading-normal">
                      {aiInsight.next_best_action}
                    </p>
                  </div>
                </div>
              )}
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

          <div className="card p-6 bg-gradient-to-br from-g-purple/5 to-transparent border-none shadow-sm flex-shrink-0">
            <div className="flex items-center gap-2 text-g-purple mb-3">
              <Lightbulb size={18} />
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
