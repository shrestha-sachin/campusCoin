import React from 'react'

const STATUS_CONFIG = {
  on_track: {
    label: 'ON TRACK',
    dot: 'bg-google-green',
    text: 'text-google-green',
    bg: 'bg-google-green-pastel',
    border: 'border-google-green/20',
  },
  caution: {
    label: 'CAUTION',
    dot: 'bg-google-yellow',
    text: 'text-google-yellow',
    bg: 'bg-google-yellow-pastel',
    border: 'border-google-yellow/20',
  },
  critical: {
    label: 'CRITICAL',
    dot: 'bg-google-red',
    text: 'text-google-red',
    bg: 'bg-google-red-pastel',
    border: 'border-google-red/20',
  },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.on_track

  return (
    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border ${config.bg} ${config.border}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${config.dot} pulse-dot flex-shrink-0`} />
      <span className={`font-google-mono text-xs font-semibold tracking-widest ${config.text}`}>
        {config.label}
      </span>
    </div>
  )
}
