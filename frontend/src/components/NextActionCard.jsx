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
          <span className="font-mono text-xs text-g-text-secondary tracking-widest uppercase font-medium">
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
    <div className="card p-5 sm:p-7 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-g-yellow to-g-yellow-half flex items-center justify-center shadow-sm">
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-mono text-xs text-g-text-secondary tracking-widest uppercase font-medium">
            Next Action
          </span>
        </div>
        <p className="font-body text-g-text text-[15px] sm:text-base leading-relaxed">
          {action}
        </p>
      </div>

      {shortfallDate && (
        <div className="mt-5 flex items-start gap-3 bg-g-red-pastel/60 rounded-2xl px-4 py-3.5 border border-g-red/10">
          <AlertTriangle size={18} className="text-g-red mt-0.5 flex-shrink-0" />
          <p className="font-mono text-xs text-g-text leading-relaxed">
            Shortfall:{' '}
            <span className="font-semibold">
              {format(parseISO(shortfallDate), 'MMM d, yyyy')}
            </span>
            {shortfallAmount ? (
              <span className="text-g-text-secondary"> ({formatCurrency(Math.abs(shortfallAmount))})</span>
            ) : null}
          </p>
        </div>
      )}
    </div>
  )
}
