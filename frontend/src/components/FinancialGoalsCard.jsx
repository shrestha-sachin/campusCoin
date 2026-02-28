import React, { useState } from 'react'
import { Target, Plus, Check, X } from 'lucide-react'
import { useApp } from '../store.jsx'

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
        <div className="card p-5 sm:p-6 h-full flex flex-col bg-g-surface border border-g-border">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-g-blue-pastel flex items-center justify-center">
                        <Target size={16} className="text-g-blue" />
                    </div>
                    <span className="font-display text-[11px] text-g-text-tertiary tracking-wide uppercase font-bold">
                        Financial Goals
                    </span>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-g-blue hover:text-g-blue/80 transition-colors cursor-pointer"
                    >
                        <Plus size={18} />
                    </button>
                )}
            </div>

            <div className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1 no-scrollbar">
                {isAdding && (
                    <div className="p-3 rounded-xl bg-g-bg border border-g-border space-y-3">
                        <input
                            type="text"
                            autoFocus
                            placeholder="e.g. Save for a new laptop..."
                            className="w-full bg-transparent border-b border-g-border pb-1 font-body text-sm outline-none focus:border-g-blue text-g-text placeholder:text-g-text-tertiary"
                            value={newGoal}
                            onChange={e => setNewGoal(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') addGoal() }}
                        />
                        <div className="flex justify-end gap-2 pt-1">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="px-3 py-1 text-xs font-body font-medium text-g-text-tertiary hover:text-g-text transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addGoal}
                                className="px-3 py-1 flex items-center gap-1 bg-g-blue text-white rounded-lg text-xs font-body font-medium hover:bg-g-blue/90 transition-colors shadow-sm cursor-pointer"
                            >
                                <Check size={12} /> Add
                            </button>
                        </div>
                    </div>
                )}

                {goals.length === 0 && !isAdding ? (
                    <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center opacity-40">
                        <Target size={24} className="text-g-text-tertiary mb-2" />
                        <p className="font-display text-[11px] font-bold text-g-text-secondary uppercase tracking-widest">No goals set</p>
                        <p className="font-body text-xs text-g-text-tertiary mt-2">What's your next big milestone?</p>
                    </div>
                ) : (
                    goals.map((goal, i) => (
                        <div key={i} className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-g-bg border border-g-border hover:border-g-blue/20 transition-all duration-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-g-blue flex-shrink-0 group-hover:scale-125 transition-transform" />
                            <p className="flex-1 font-display font-bold text-[13px] text-g-text truncate">{goal}</p>
                            <button
                                onClick={() => removeGoal(i)}
                                className="opacity-0 group-hover:opacity-100 text-g-text-tertiary hover:text-g-red p-1 rounded-lg hover:bg-g-red-pastel transition-all cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
