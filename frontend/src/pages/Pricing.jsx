import React from 'react'
import { Check, Crown, Rocket, Zap, Mail, Building, ArrowRight } from 'lucide-react'
import { useApp } from '../store.jsx'
import { useNavigate } from 'react-router-dom'

function PricingCard({ title, price, description, features, highlighted, ctaText, onCtaClick, isCurrent }) {
    return (
        <div className={`
      relative rounded-3xl p-8 flex flex-col h-full transition-all duration-300
      ${highlighted
                ? 'bg-white border-2 border-g-blue shadow-xl shadow-g-blue/10 scale-[1.02] z-10'
                : 'bg-white/60 border border-g-border shadow-sm hover:shadow-md'
            }
    `}>
            {highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-g-blue text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Crown size={12} />
                    Most Popular
                </div>
            )}

            <div className="mb-8">
                <h3 className="font-display font-bold text-xl text-g-text mb-2">{title}</h3>
                <p className="font-body text-sm text-g-text-secondary leading-relaxed">{description}</p>
            </div>

            <div className="mb-8 flex items-baseline gap-1">
                <span className="font-display font-bold text-4xl text-g-text">${price}</span>
                <span className="font-body text-g-text-tertiary">/month</span>
            </div>

            <div className="flex-1 space-y-4 mb-10">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex gap-3">
                        <div className={`
              w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
              ${highlighted ? 'bg-g-blue/10 text-g-blue' : 'bg-g-text-tertiary/10 text-g-text-tertiary'}
            `}>
                            <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="font-body text-[14px] text-g-text-secondary">{feature}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={onCtaClick}
                disabled={isCurrent}
                className={`
          w-full py-4 rounded-2xl font-display font-bold text-sm transition-all flex items-center justify-center gap-2
          ${isCurrent
                        ? 'bg-g-bg text-g-text-tertiary cursor-default border border-g-border'
                        : highlighted
                            ? 'bg-g-blue text-white shadow-lg shadow-g-blue/20 hover:bg-[#3367d6] hover:-translate-y-0.5 active:translate-y-0'
                            : 'bg-white border border-g-border text-g-text hover:bg-g-bg hover:border-g-text/20'
                    }
        `}
            >
                {isCurrent ? 'Current Plan' : ctaText}
                {!isCurrent && <ArrowRight size={16} />}
            </button>
        </div>
    )
}

export default function Pricing() {
    const { auth, togglePremium } = useApp()
    const navigate = useNavigate()

    const handleUpgrade = () => {
        togglePremium()
        setTimeout(() => {
            navigate('/dashboard')
        }, 500)
    }

    return (
        <div className="p-4 sm:p-6 lg:p-10 pt-8 space-y-12 max-w-[1200px] mx-auto pb-24 fade-in">
            {/* Header */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-g-blue-pastel text-g-blue font-body text-xs font-bold uppercase tracking-widest">
                    <Zap size={14} />
                    Elevate your financial game
                </div>
                <h1 className="font-display font-bold text-4xl sm:text-5xl text-g-text tracking-tight">
                    Simple pricing for <span className="text-g-blue">smarter students.</span>
                </h1>
                <p className="font-body text-g-text-secondary text-base sm:text-lg leading-relaxed">
                    Whether you need basic tracking or a full AI financial strategist, we've got you covered for the cost of a coffee.
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <PricingCard
                    title="Student Essential"
                    price="0"
                    description="The basics every student needs to avoid overdrafts and stay on top of their balance."
                    features={[
                        "180-day runway tracking",
                        "Basic Nessie Bank syncing",
                        "Standard status alerts",
                        "Manual budget management",
                        "Academic schedule ingestion"
                    ]}
                    ctaText="Continue for Free"
                    onCtaClick={() => navigate('/dashboard')}
                    isCurrent={!auth.is_premium}
                />
                <PricingCard
                    title="Campus VIP"
                    price="4.99"
                    highlighted={true}
                    description="Your personal AI CFO. Deep insights and persistent memory for serious financial growth."
                    features={[
                        "Everything in Essential",
                        "Gemini AI Strategist Chat",
                        "Supermemory Context Engine",
                        "Predictive Stress Analysis",
                        "Priority AI Refresh Tier",
                        "Early access to new features"
                    ]}
                    ctaText="Upgrade to Premium"
                    onCtaClick={handleUpgrade}
                    isCurrent={auth.is_premium}
                />
            </div>

            {/* B2B / University Section */}
            <div className="bg-g-surface/50 border border-g-border rounded-[32px] p-8 sm:p-12 relative overflow-hidden group">
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-g-blue/5 rounded-full blur-3xl group-hover:bg-g-blue/10 transition-all duration-700" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="w-20 h-20 rounded-3xl bg-white border border-g-border shadow-soft flex items-center justify-center flex-shrink-0">
                        <Building size={36} className="text-g-blue" />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <h2 className="font-display font-bold text-2xl text-g-text">Are you a University administrator?</h2>
                        <p className="font-body text-g-text-secondary text-base leading-relaxed max-w-2xl">
                            Bring CampusCoin to your entire campus. Partner with us to provide CampusCoin as a financial wellness tool
                            for your students at <strong>UWGB, UIUC</strong>, and beyond.
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <a
                                href="mailto:partners@campuscoin.edu"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-g-text text-white font-display font-bold text-sm hover:bg-g-text/90 transition-all"
                            >
                                <Mail size={16} />
                                Contact Enterprise Sales
                            </a>
                            <span className="font-display text-xs font-bold text-g-text-tertiary uppercase tracking-widest hidden sm:block">
                                Trusted by 3+ institutions
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="text-center">
                <p className="font-body text-xs text-g-text-tertiary">
                    Prices in USD. Cancel anytime. <br />
                    Built by <span className="font-bold">Sachin Shrestha</span> & <span className="font-bold">Carlos Guzman</span>
                </p>
            </div>
        </div>
    )
}
