import React from 'react'
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

const STATUS_CONFIG = {
  on_track: {
    label: 'On Track',
    Icon: CheckCircle2,
    bg: 'bg-g-green-pastel',
    text: 'text-g-green',
    border: 'border-g-green/20',
  },
  caution: {
    label: 'Caution',
    Icon: AlertCircle,
    bg: 'bg-g-yellow-pastel',
    text: 'text-g-yellow',
    border: 'border-g-yellow/20',
  },
  critical: {
    label: 'Critical',
    Icon: XCircle,
    bg: 'bg-g-red-pastel',
    text: 'text-g-red',
    border: 'border-g-red/20',
  },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.on_track
  const { Icon } = config

  return (
    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border ${config.bg} ${config.border}`}>
      <Icon size={16} className={config.text} strokeWidth={2.2} />
      <span className={`font-mono text-xs font-semibold tracking-wide ${config.text}`}>
        {config.label}
      </span>
    </div>
  )
}
