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

export default function BalanceCard({ onStatusClick }) {
  const { profile, aiInsight, loading } = useApp()
  const status = aiInsight?.status ?? 'on_track'
  const textColor = STATUS_COLORS[status] ?? STATUS_COLORS.on_track
  const isPositive = profile.current_balance >= 0

  return (
    <div className="card p-5 sm:p-6 flex flex-col justify-center border-none shadow-premium bg-gradient-to-br from-g-surface to-g-bg relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
        <Wallet size={100} />
      </div>

      <div className="relative z-10 w-full">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-g-blue to-g-blue-half flex items-center justify-center shadow-lg">
              <Wallet size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-[13px] text-g-text-tertiary tracking-wide uppercase font-bold block">
                  Available Balance
                </span>
                <div className="relative flex items-center">
                  <div className={`w-1.5 h-1.5 rounded-full ${profile.nessie_account_id ? 'bg-g-green' : 'bg-g-text-tertiary'}`} />
                  {profile.nessie_account_id && <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-g-green animate-ping opacity-75" />}
                </div>
              </div>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl bg-g-bg border border-g-border flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isPositive ? 'text-g-green' : 'text-g-red'}`}>
            {isPositive ? 'Surplus' : 'Deficit'}
          </div>
        </div>

        {loading.runway ? (
          <div className="skeleton h-10 w-3/4 mb-1" />
        ) : (
          <div className="space-y-0.5">
            <p className={`font-display font-bold text-3xl sm:text-4xl ${textColor} tracking-tight tabular-nums`}>
              {formatBalance(profile.current_balance)}
            </p>
            <p className="font-body text-[10px] text-g-text-tertiary opacity-60 uppercase font-bold tracking-widest leading-none">Capital One Sync</p>
          </div>
        )}
      </div>
    </div>
  )
}
