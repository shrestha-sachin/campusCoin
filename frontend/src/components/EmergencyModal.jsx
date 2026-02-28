import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useApp } from '../store.jsx'

const RESOURCE_ICONS = {
  food_pantry: '🍎',
  emergency_grant: '💰',
  work_study: '💼',
}

export default function EmergencyModal({ onClose }) {
  const { aiInsight } = useApp()
  const resources = aiInsight?.emergency_resources ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-google-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card — white, large radius, soft shadow */}
      <div className="relative w-full max-w-lg bg-white rounded-[24px] shadow-modal border border-google-red/15 p-8 z-10">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-google-black/40 hover:text-google-black transition-colors rounded-full p-1 hover:bg-google-off-white"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-google-red-pastel flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={24} className="text-google-red" />
          </div>
          <div>
            <h2 className="font-google font-bold text-google-red text-xl leading-tight">
              Financial Emergency Alert
            </h2>
            <p className="font-google-text text-google-black/60 text-sm mt-1.5 leading-relaxed">
              Your balance may hit $0 or you can't cover essentials within 30 days.
            </p>
          </div>
        </div>

        {/* Insight */}
        {aiInsight?.next_best_action && (
          <div className="bg-google-red-pastel/60 rounded-2xl px-5 py-4 mb-6 border border-google-red/10">
            <p className="font-google-text text-sm text-google-black/85 leading-relaxed">
              {aiInsight.next_best_action}
            </p>
          </div>
        )}

        {/* Resources */}
        {resources.length > 0 && (
          <div>
            <p className="font-google-mono text-xs text-google-black/50 tracking-widest uppercase mb-3">
              Available Resources
            </p>
            <div className="space-y-3">
              {resources.map((r, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-google-off-white rounded-2xl px-5 py-4 border border-black/4"
                >
                  <span className="text-xl flex-shrink-0">
                    {RESOURCE_ICONS[r.type] ?? '📌'}
                  </span>
                  <div>
                    <p className="font-google-text font-medium text-google-black text-sm">
                      {r.label}
                    </p>
                    <p className="font-google-text text-google-black/60 text-xs mt-1 leading-relaxed">
                      {r.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 rounded-full bg-google-red-pastel text-google-red font-google-text font-medium text-sm border border-google-red/20 hover:bg-google-red/10 transition-colors"
        >
          I understand — take me back
        </button>
      </div>
    </div>
  )
}
