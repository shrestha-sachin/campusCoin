import React from 'react'
import { Zap } from 'lucide-react'
import { useApp } from '../store.jsx'
import { format, parseISO } from 'date-fns'

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function NextActionCard() {
  const { aiInsight, loading } = useApp()

  if (loading.ai) {
    return (
      <div className="card p-8 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-5">
          <Zap size={20} className="text-google-blue" />
          <span className="font-google-mono text-xs text-google-black/50 tracking-widest uppercase">
            Next Best Action
          </span>
        </div>
        <div className="space-y-3 flex-1">
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
    <div className="card p-8 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-5">
          <Zap size={20} className="text-google-blue" />
          <span className="font-google-mono text-xs text-google-black/50 tracking-widest uppercase">
            Next Best Action
          </span>
        </div>
        <p className="font-google-text text-google-black/90 text-[15px] leading-relaxed">
          {action}
        </p>
      </div>

      {shortfallDate && (
        <div className="mt-6 pt-6 border-t border-google-yellow/20 flex items-start gap-2.5 bg-google-yellow-pastel/50 rounded-xl px-4 py-3">
          <span className="text-google-yellow text-base mt-0.5">⚠</span>
          <p className="font-google-mono text-xs text-google-black/80">
            Projected shortfall:{' '}
            <span className="font-semibold text-google-black">
              {format(parseISO(shortfallDate), 'MMM d, yyyy')}
            </span>
            {shortfallAmount ? (
              <span className="text-google-black/60"> ({formatCurrency(Math.abs(shortfallAmount))})</span>
            ) : null}
          </p>
        </div>
      )}
    </div>
  )
}
