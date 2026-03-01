import React from 'react'
import { X, Phone, CreditCard, HeartHandshake, AlertTriangle, ExternalLink, GraduationCap, TrendingUp, ShoppingBag } from 'lucide-react'
import { sanitizeLink } from '../utils/links'

export default function EmergencyModal({ onClose, resources = [], university = '', status = 'on_track' }) {
  const isEmergency = status === 'critical' || status === 'caution'

  const getFallbackResources = () => [
    { icon: Phone, label: '211 Helpline', description: 'Free financial counseling', link: 'https://www.211.org/', color: 'from-g-blue to-g-blue-half' },
    { icon: CreditCard, label: 'Emergency Aid', description: 'University emergency funds', link: `https://www.google.com/search?q=emergency+aid+${university}`, color: 'from-g-green to-g-green-half' },
    { icon: HeartHandshake, label: 'Food Pantry', description: 'Campus food assistance', link: `https://www.google.com/search?q=food+pantry+${university}`, color: 'from-g-yellow to-g-yellow-half' },
  ]

  const getProactiveResources = () => [
    { icon: GraduationCap, label: 'Scholarship Portal', description: 'Search regional grants & aid', link: 'https://www.scholarships.com/', color: 'from-g-blue to-g-blue-half' },
    { icon: TrendingUp, label: 'High-Yield Savings', description: 'Grow your student surplus', link: 'https://www.nerdwallet.com/best/banking/high-yield-savings-accounts', color: 'from-g-green to-g-green-half' },
    { icon: ShoppingBag, label: 'Universal Discounts', description: 'Verified 10% - 50% student savings', link: 'https://www.myunidays.com/', color: 'from-g-yellow to-g-yellow-half' },
  ]

  const rawResources = resources.length > 0 ? resources : (isEmergency ? getFallbackResources() : getProactiveResources())

  const displayResources = rawResources.map((r, i) => {
    let color = r.color || 'from-g-blue to-g-blue-half'
    let icon = r.icon || Phone
    if (!r.icon) {
      if (i % 3 === 1) { color = 'from-g-green to-g-green-half'; icon = CreditCard }
      if (i % 3 === 2) { color = 'from-g-yellow to-g-yellow-half'; icon = HeartHandshake }
    }

    const finalLink = sanitizeLink(r.link, `${r.label} ${university}`)

    return {
      icon,
      label: r.label,
      desc: r.description,
      link: finalLink,
      isGoogleFallback: finalLink.includes('google.com/search'),
      color
    }
  })

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-md p-4">
      <div className="bg-g-surface rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${isEmergency ? 'from-g-red to-g-red-half' : 'from-g-blue to-g-blue-half'} flex items-center justify-center shadow-lg`}>
              {isEmergency ? <AlertTriangle size={24} className="text-white" /> : <TrendingUp size={24} className="text-white" />}
            </div>
            <div>
              <h2 className="font-display font-bold text-g-text text-xl">
                {isEmergency ? 'Financial Resources' : 'Financial Opportunity'}
              </h2>
              <p className="font-body text-g-text-secondary text-sm">
                {isEmergency ? 'Immediate Support Services' : 'Growth & Savings Tools'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-g-text-tertiary hover:text-g-text hover:bg-g-bg transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="font-body text-g-text-secondary text-[15px] leading-relaxed mb-6">
          {isEmergency
            ? "Our analysis indicates you may need immediate financial assistance. These tailored resources are here to support you."
            : "You're in a great financial position! Here are some ways to optimize your surplus and save even more as a student."}
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
          className={`w-full py-3.5 rounded-full ${isEmergency ? 'bg-g-red' : 'bg-g-blue'} text-white font-body text-[15px] font-bold hover:opacity-90 transition-all shadow-sm`}
        >
          {isEmergency ? 'I Understand' : 'Got it!'}
        </button>
      </div>
    </div>
  )
}
