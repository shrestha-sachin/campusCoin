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
    <div className="card p-5 sm:p-7 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-g-blue to-g-blue-half flex items-center justify-center shadow-sm">
              <Wallet size={20} className="text-white" />
            </div>
            <span className="font-mono text-xs text-g-text-secondary tracking-widest uppercase font-medium">
              Balance
            </span>
          </div>
          <div className={`flex items-center gap-0.5 text-sm font-mono ${isPositive ? 'text-g-green' : 'text-g-red'}`}>
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          </div>
        </div>

        {loading.runway ? (
          <div className="skeleton h-12 w-3/4 mb-1" />
        ) : (
          <p className={`font-display font-bold text-4xl sm:text-[38px] ${textColor} leading-tight tracking-tight`}>
            {formatBalance(profile.current_balance)}
          </p>
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-g-border">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${profile.nessie_account_id ? 'bg-g-green pulse-dot' : 'bg-g-text-tertiary'}`} />
          <span className="font-mono text-xs text-g-text-tertiary tracking-wide">
            {profile.nessie_account_id ? 'Connected via Capital One Nessie' : 'Local balance (no Nessie link)'}
          </span>
        </div>
        {profile.nessie_account_id && (
          <p className="font-mono text-xs text-g-text-tertiary mt-1.5 truncate">
            Account: {profile.nessie_account_id}
          </p>
        )}
      </div>
    </div>
  )
}
