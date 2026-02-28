import React from 'react'
import { useApp } from '../store.jsx'

const STATUS_COLORS = {
  on_track: { text: 'text-google-green', shadow: 'shadow-[0_2px_12px_rgba(52,168,83,0.2)]' },
  caution: { text: 'text-google-yellow', shadow: 'shadow-[0_2px_12px_rgba(249,171,0,0.2)]' },
  critical: { text: 'text-google-red', shadow: 'shadow-[0_2px_12px_rgba(234,67,53,0.2)]' },
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
  const { text, shadow } = STATUS_COLORS[status] ?? STATUS_COLORS.on_track

  return (
    <div className={`card p-8 h-full flex flex-col justify-between ${shadow}`}>
      <div>
        <p className="font-google-mono text-xs text-google-black/50 tracking-widest uppercase mb-4">
          Current Balance
        </p>
        {loading.runway ? (
          <div className="skeleton h-12 w-3/4 mb-1" />
        ) : (
          <p className={`font-google font-bold text-4xl ${text} leading-tight`}>
            {formatBalance(profile.current_balance)}
          </p>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-black/6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-google-green pulse-dot" />
          <span className="font-google-mono text-xs text-google-black/45 tracking-wide">
            Live via Capital One Nessie
          </span>
        </div>
        {profile.nessie_account_id ? (
          <p className="font-google-mono text-[11px] text-google-black/35 mt-1.5">
            {profile.nessie_account_id}
          </p>
        ) : (
          <p className="font-google-mono text-[11px] text-google-black/35 mt-1.5">
            Connect account in Settings
          </p>
        )}
      </div>
    </div>
  )
}
