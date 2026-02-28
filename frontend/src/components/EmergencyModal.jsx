import React from 'react'
import { AlertTriangle, X, Apple, Coins, Briefcase, MapPin } from 'lucide-react'
import { useApp } from '../store.jsx'

const RESOURCE_ICONS = {
  food_pantry: Apple,
  emergency_grant: Coins,
  work_study: Briefcase,
}

export default function EmergencyModal({ onClose }) {
  const { aiInsight } = useApp()
  const resources = aiInsight?.emergency_resources ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-g-surface rounded-2xl shadow-2xl border border-g-red/15 p-5 sm:p-7 z-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-g-text-tertiary hover:text-g-text transition-colors rounded-full p-1 hover:bg-g-bg"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-xl bg-g-red-pastel flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={22} className="text-g-red" />
          </div>
          <div>
            <h2 className="font-display font-bold text-g-red text-lg leading-tight">
              Financial Emergency
            </h2>
            <p className="font-body text-g-text-secondary text-sm mt-1 leading-relaxed">
              Your balance may hit $0 or you can't cover essentials within 30 days.
            </p>
          </div>
        </div>

        {aiInsight?.next_best_action && (
          <div className="bg-g-red-pastel/50 rounded-xl px-4 py-3 mb-5 border border-g-red/10">
            <p className="font-body text-sm text-g-text leading-relaxed">
              {aiInsight.next_best_action}
            </p>
          </div>
        )}

        {resources.length > 0 && (
          <div>
            <p className="font-mono text-[11px] text-g-text-secondary tracking-widest uppercase mb-2.5">
              Resources
            </p>
            <div className="space-y-2">
              {resources.map((r, i) => {
                const IconComp = RESOURCE_ICONS[r.type] ?? MapPin
                return (
                  <div key={i} className="flex items-start gap-3 bg-g-bg rounded-xl px-4 py-3 border border-g-border">
                    <div className="w-8 h-8 rounded-lg bg-g-red-pastel flex items-center justify-center flex-shrink-0">
                      <IconComp size={16} className="text-g-red" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-body font-medium text-g-text text-sm">{r.label}</p>
                      <p className="font-body text-g-text-secondary text-xs mt-0.5 leading-relaxed">{r.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-full bg-g-red-pastel text-g-red font-body font-medium text-sm border border-g-red/20 hover:bg-g-red/10 transition-colors"
        >
          I understand
        </button>
      </div>
    </div>
  )
}
