import React from 'react'
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

const STATUS_CONFIG = {
  on_track: {
    label: 'On Track',
    Icon: CheckCircle2,
    text: 'text-g-green',
    bg: 'bg-g-green-pastel',
    border: 'border-g-green/20',
  },
  caution: {
    label: 'Caution',
    Icon: AlertCircle,
    text: 'text-g-yellow',
    bg: 'bg-g-yellow-pastel',
    border: 'border-g-yellow/20',
  },
  critical: {
    label: 'Critical',
    Icon: XCircle,
    text: 'text-g-red',
    bg: 'bg-g-red-pastel',
    border: 'border-g-red/20',
  },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.on_track
  const { Icon } = config

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${config.bg} ${config.border}`}>
      <Icon size={14} className={config.text} strokeWidth={2.2} />
      <span className={`font-mono text-[11px] font-semibold tracking-wide ${config.text}`}>
        {config.label}
      </span>
    </div>
  )
}
