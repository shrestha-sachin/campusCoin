import React, { useState } from 'react'
import { Target, Plus, Check, X, Sparkles } from 'lucide-react'
import { useApp } from '../store.jsx'

const GOAL_COLORS = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-orange-500 to-amber-600',
    'from-rose-500 to-pink-600',
]

export default function FinancialGoalsCard() {
    const { profile, setProfile } = useApp()
    const [isAdding, setIsAdding] = useState(false)
    const [newGoal, setNewGoal] = useState('')

    const addGoal = () => {
        const g = newGoal.trim()
        if (!g) return
        setProfile(prev => ({ ...prev, financial_goals: [...(prev.financial_goals || []), g] }))
        setNewGoal('')
        setIsAdding(false)
    }

    const removeGoal = (i) => {
        setProfile(prev => ({
            ...prev,
            financial_goals: (prev.financial_goals || []).filter((_, idx) => idx !== i),
        }))
    }

    const goals = profile.financial_goals || []

    return (
        <div className="card p-5 sm:p-6 h-full flex flex-col bg-g-surface border border-g-border overflow-hidden relative">
            {/* Subtle bg decoration */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-g-blue/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-g-blue-pastel to-blue-100 flex items-center justify-center shadow-sm">
                        <Target size={17} className="text-g-blue" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-base text-g-text">Financial Goals</h3>
                        <span className="font-display text-[10px] text-g-text-tertiary uppercase font-bold tracking-wider">
                            {goals.length} {goals.length === 1 ? 'target' : 'targets'} set
                        </span>
                    </div>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-g-blue-pastel text-g-blue text-xs font-display font-bold hover:bg-g-blue hover:text-white transition-all duration-200 shadow-sm"
                    >
                        <Plus size={13} /> Add
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="mb-4 p-4 rounded-2xl bg-g-bg border border-g-blue/30 shadow-inner space-y-3 animate-fade-in">
                    <input
                        type="text"
                        autoFocus
                        placeholder="e.g. Save for a new laptop..."
                        className="w-full bg-transparent font-body text-sm outline-none text-g-text placeholder:text-g-text-tertiary border-b border-g-border pb-2 focus:border-g-blue transition-colors"
                        value={newGoal}
                        onChange={e => setNewGoal(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addGoal(); if (e.key === 'Escape') setIsAdding(false) }}
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-3 py-1.5 text-xs font-body font-medium text-g-text-tertiary hover:text-g-text transition-colors cursor-pointer rounded-lg hover:bg-g-bg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={addGoal}
                            className="px-4 py-1.5 flex items-center gap-1.5 bg-g-blue text-white rounded-xl text-xs font-display font-bold hover:bg-g-blue/90 transition-all shadow-sm"
                        >
                            <Check size={12} /> Save Goal
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 min-h-0 space-y-2.5 overflow-y-auto no-scrollbar">
                {goals.length === 0 && !isAdding ? (
                    <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center">
                        <div className="relative mb-4">
                            <div className="w-14 h-14 rounded-full bg-g-blue-pastel flex items-center justify-center">
                                <Sparkles size={22} className="text-g-blue" />
                            </div>
                            <div className="absolute inset-0 rounded-full border-2 border-g-blue/20 animate-ping" />
                        </div>
                        <p className="font-display text-sm font-bold text-g-text-secondary">No goals yet</p>
                        <p className="font-body text-xs text-g-text-tertiary mt-1.5 max-w-[160px]">What's your next big milestone? Set it here.</p>
                    </div>
                ) : (
                    goals.map((goal, i) => (
                        <div
                            key={i}
                            className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-g-bg border border-g-border hover:border-g-blue/30 hover:bg-g-bg/80 hover:shadow-sm transition-all duration-200 animate-fade-in"
                        >
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${GOAL_COLORS[i % GOAL_COLORS.length]} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                <span className="font-display font-black text-[10px] text-white">{i + 1}</span>
                            </div>
                            <p className="flex-1 font-display font-bold text-[13px] text-g-text leading-tight">{goal}</p>
                            <button
                                onClick={() => removeGoal(i)}
                                className="opacity-0 group-hover:opacity-100 text-g-text-tertiary hover:text-g-red p-1.5 rounded-lg hover:bg-g-red-pastel transition-all cursor-pointer flex-shrink-0"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
