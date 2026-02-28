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
      <div className="card p-5 sm:p-6 h-full flex flex-col">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-g-yellow-pastel flex items-center justify-center">
            <Zap size={16} className="text-g-yellow" />
          </div>
          <span className="font-mono text-[11px] text-g-text-secondary tracking-widest uppercase">
            Next Action
          </span>
        </div>
        <div className="space-y-2.5 flex-1">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-4/5" />
          <div className="skeleton h-4 w-3/5" />
        </div>
      </div>
    )
  }

  const action = aiInsight?.next_best_action ?? 'Analyzing your financial data...'
  const shortfallDate = aiInsight?.shortfall_date
  const shortfallAmount = aiInsight?.shortfall_amount

  return (
    <div className="card p-5 sm:p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-g-yellow-pastel flex items-center justify-center">
            <Zap size={16} className="text-g-yellow" />
          </div>
          <span className="font-mono text-[11px] text-g-text-secondary tracking-widest uppercase">
            Next Action
          </span>
        </div>
        <p className="font-body text-g-text text-sm leading-relaxed">
          {action}
        </p>
      </div>

      {shortfallDate && (
        <div className="mt-5 flex items-start gap-2.5 bg-g-red-pastel/60 rounded-xl px-3.5 py-3 border border-g-red/10">
          <AlertTriangle size={15} className="text-g-red mt-0.5 flex-shrink-0" />
          <p className="font-mono text-[11px] text-g-text">
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
