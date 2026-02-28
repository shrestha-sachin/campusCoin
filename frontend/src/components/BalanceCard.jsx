import React from 'react'
import { useApp } from '../store.jsx'
import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const STATUS_COLORS = {
  on_track: 'text-g-green',
  caution: 'text-g-yellow',
  critical: 'text-g-red',
}

function formatBalance(num) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(num)
}

export default function BalanceCard() {
  const { profile, aiInsight, loading } = useApp()
  const status = aiInsight?.status ?? 'on_track'
  const textColor = STATUS_COLORS[status] ?? STATUS_COLORS.on_track
  const isPositive = profile.current_balance >= 0

  return (
    <div className="card p-5 sm:p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-g-blue-pastel flex items-center justify-center">
              <Wallet size={16} className="text-g-blue" />
            </div>
            <span className="font-mono text-[11px] text-g-text-secondary tracking-widest uppercase">
              Balance
            </span>
          </div>
          <div className={`flex items-center gap-0.5 text-xs font-mono ${isPositive ? 'text-g-green' : 'text-g-red'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          </div>
        </div>

        {loading.runway ? (
          <div className="skeleton h-10 sm:h-11 w-3/4 mb-1" />
        ) : (
          <p className={`font-display font-bold text-3xl sm:text-[34px] ${textColor} leading-tight tracking-tight`}>
            {formatBalance(profile.current_balance)}
          </p>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-g-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-g-green pulse-dot" />
          <span className="font-mono text-[10px] text-g-text-tertiary tracking-wide">
            Live via Capital One Nessie
          </span>
        </div>
        <p className="font-mono text-[10px] text-g-text-tertiary mt-1 truncate">
          {profile.nessie_account_id || 'Connect account in Settings'}
        </p>
      </div>
    </div>
  )
}
