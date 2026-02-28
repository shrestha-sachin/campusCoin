import React, { useState } from 'react'
import { X, Phone, CreditCard, HeartHandshake, AlertTriangle, ExternalLink } from 'lucide-react'

const FALLBACK_RESOURCES = [
  { icon: Phone, label: '211 Helpline', desc: 'Free financial counseling', link: 'https://www.211.org/', color: 'from-g-blue to-g-blue-half' },
  { icon: CreditCard, label: 'Emergency Aid', desc: 'University emergency funds', link: '#', color: 'from-g-green to-g-green-half' },
  { icon: HeartHandshake, label: 'Food Pantry', desc: 'Campus food assistance', link: '#', color: 'from-g-yellow to-g-yellow-half' },
]

export default function EmergencyModal({ onClose, resources = [], university = '' }) {
  const displayResources = resources.length > 0 ? resources.map((r, i) => {
    let color = 'from-g-blue to-g-blue-half'
    let icon = Phone
    if (i % 3 === 1) { color = 'from-g-green to-g-green-half'; icon = CreditCard }
    if (i % 3 === 2) { color = 'from-g-yellow to-g-yellow-half'; icon = HeartHandshake }

    // ── Robust link validation ──────────────────────────────────────────────
    // Gemini sometimes returns "#", relative paths, or bare domain-less strings.
    // We validate and fall back to a targeted Google search so the user always
    // lands on something useful.
    const rawLink = (r.link || '').trim()
    let finalLink

    try {
      // Test if it parses as a real absolute URL with a recognisable protocol
      const parsed = new URL(rawLink.startsWith('http') ? rawLink : `https://${rawLink}`)
      const hasDomain = parsed.hostname.includes('.') && parsed.hostname.length > 4
      const isLocal = parsed.hostname === 'localhost' || parsed.hostname.startsWith('127.')
      const isHashOnly = !rawLink || rawLink === '#' || rawLink.startsWith('#')

      if (isHashOnly || isLocal || !hasDomain) {
        throw new Error('invalid')
      }
      finalLink = parsed.href
    } catch {
      // Fall back: open a Google search so the user finds the real page
      const query = encodeURIComponent(`${r.label} ${university}`)
      finalLink = `https://www.google.com/search?q=${query}`
    }
    // ────────────────────────────────────────────────────────────────────────

    return {
      icon,
      label: r.label,
      desc: r.description,
      link: finalLink,
      isGoogleFallback: finalLink.startsWith('https://www.google.com/search'),
      color
    }
  }) : FALLBACK_RESOURCES
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-md p-4">
      <div className="bg-g-surface rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-g-red to-g-red-half flex items-center justify-center shadow-sm">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-g-text text-xl">Financial Alert</h2>
              <p className="font-body text-g-text-secondary text-sm">You may need immediate help</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-g-text-tertiary hover:text-g-text hover:bg-g-bg transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="font-body text-g-text-secondary text-[15px] leading-relaxed mb-6">
          Our analysis indicates a potential financial emergency. Here are resources that can help:
        </p>

        <div className="space-y-3 mb-7">
          {displayResources.map(({ icon: Icon, label, desc, link, color, isGoogleFallback }, idx) => (
            <a
              key={`${label}-${idx}`}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-g-bg border border-g-border hover:border-g-blue/30 hover:shadow-sm transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-g-text text-[15px] font-medium">{label}</p>
                <p className="font-body text-xs text-g-text-tertiary">
                  {isGoogleFallback ? `Search Google → ${label}` : desc}
                </p>
              </div>
              <ExternalLink size={16} className="text-g-text-tertiary group-hover:text-g-blue transition-colors flex-shrink-0" />
            </a>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-full bg-g-blue text-white font-body text-[15px] font-medium hover:bg-[#3367d6] transition-all shadow-sm"
        >
          I Understand
        </button>
      </div>
    </div>
  )
}
