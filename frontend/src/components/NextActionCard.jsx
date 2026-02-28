import React from 'react'
import { Zap, AlertTriangle } from 'lucide-react'
import { useApp } from '../store.jsx'
import { format, parseISO } from 'date-fns'

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function NextActionCard() {
  const { aiInsight, loading } = useApp()

  if (loading.ai) {
    return (
      <div className="card p-5 sm:p-7 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-g-yellow to-g-yellow-half flex items-center justify-center shadow-sm">
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-body text-xs text-g-text-secondary tracking-widest uppercase font-medium">
            Next Action
          </span>
        </div>
        <div className="space-y-3 flex-1">
          <div className="skeleton h-5 w-full" />
          <div className="skeleton h-5 w-4/5" />
          <div className="skeleton h-5 w-3/5" />
        </div>
      </div>
    )
  }

  const action = aiInsight?.next_best_action ?? 'Analyzing your financial data...'
  const shortfallDate = aiInsight?.shortfall_date
  const shortfallAmount = aiInsight?.shortfall_amount

  return (
    <div className="card p-5 sm:p-6 flex flex-row items-center gap-5 sm:gap-7 border-none shadow-premium bg-gradient-to-br from-g-yellow/5 to-g-surface relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
        <Zap size={100} />
      </div>

      <div className="flex-shrink-0 relative z-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-g-yellow to-g-yellow-half flex items-center justify-center shadow-lg">
          <Zap size={26} className="text-white" />
        </div>
      </div>

      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-display text-[13px] text-g-text-tertiary tracking-wide uppercase font-bold">
            Current Roadmap
          </span>
        </div>
        <p className="font-body text-g-text text-base sm:text-lg font-medium leading-[1.4] max-w-2xl">
          {action}
        </p>
      </div>

      {shortfallDate && (
        <div className="hidden md:flex items-center gap-3.5 bg-g-red-pastel/40 backdrop-blur-md rounded-2xl px-5 py-3 border border-g-red/10 shadow-sm relative z-10">
          <div className="w-8 h-8 rounded-lg bg-g-red/10 flex items-center justify-center">
            <AlertTriangle size={16} className="text-g-red" />
          </div>
          <div className="text-left pr-1">
            <p className="font-mono text-[9px] text-g-red uppercase font-bold tracking-widest leading-none mb-1">Impact Alert</p>
            <p className="font-body text-[13px] text-g-text font-bold whitespace-nowrap leading-none">
              {format(parseISO(shortfallDate), 'MMMM do')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
