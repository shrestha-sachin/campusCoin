import React, { useState } from 'react'
import { Target, Plus, Check } from 'lucide-react'
import { useApp } from '../store.jsx'
import { v4 as uuidv4 } from 'uuid'

export default function SavingsGoalsCard() {
    const { goals, setGoals } = useApp()
    const [isAdding, setIsAdding] = useState(false)
    const [newGoal, setNewGoal] = useState({ name: '', target: '', current: 0 })

    const handleSave = () => {
        if (!newGoal.name || !newGoal.target) return
        setGoals([...goals, {
            id: uuidv4(),
            name: newGoal.name,
            target: parseFloat(newGoal.target),
            current: parseFloat(newGoal.current) || 0
        }])
        setNewGoal({ name: '', target: '', current: 0 })
        setIsAdding(false)
    }

    const handleUpdateProgress = (id, amount) => {
        setGoals(goals.map(g =>
            g.id === id ? { ...g, current: Math.min(g.target, g.current + amount) } : g
        ))
    }

    const handleDelete = (id) => {
        setGoals(goals.filter(g => g.id !== id))
    }

    return (
        <div className="card p-5 sm:p-6 h-full flex flex-col bg-g-surface border border-g-border">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-g-blue-pastel flex items-center justify-center">
                        <Target size={16} className="text-g-blue" />
                    </div>
                    <span className="font-mono text-[11px] text-g-text-secondary tracking-widest uppercase font-medium">
                        Savings Goals
                    </span>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-g-blue hover:text-g-blue/80 transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                )}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[220px] pr-1">
                {isAdding && (
                    <div className="p-3 rounded-xl bg-g-bg border border-g-border space-y-3">
                        <input
                            type="text"
                            placeholder="Goal Name (e.g. Spring Break)"
                            className="w-full bg-transparent border-b border-g-border pb-1 font-body text-sm outline-none focus:border-g-blue text-g-text placeholder:text-g-text-tertiary"
                            value={newGoal.name}
                            onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Target $"
                                className="w-1/2 bg-transparent border-b border-g-border pb-1 font-mono text-xs outline-none focus:border-g-blue text-g-text placeholder:text-g-text-tertiary"
                                value={newGoal.target}
                                onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Saved so far $"
                                className="w-1/2 bg-transparent border-b border-g-border pb-1 font-mono text-xs outline-none focus:border-g-blue text-g-text placeholder:text-g-text-tertiary"
                                value={newGoal.current}
                                onChange={e => setNewGoal({ ...newGoal, current: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="px-3 py-1 text-xs font-body font-medium text-g-text-tertiary hover:text-g-text transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-3 py-1 flex items-center gap-1 bg-g-blue text-white rounded-lg text-xs font-body font-medium hover:bg-g-blue/90 transition-colors"
                            >
                                <Check size={12} /> Save
                            </button>
                        </div>
                    </div>
                )}

                {goals.length === 0 && !isAdding ? (
                    <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center opacity-60">
                        <Target size={24} className="text-g-text-tertiary mb-2" />
                        <p className="font-body text-sm font-medium text-g-text-secondary">No goals yet</p>
                        <p className="font-body text-xs text-g-text-tertiary mt-1">Start saving for your next big purchase!</p>
                    </div>
                ) : (
                    goals.map(goal => {
                        const pct = Math.min(100, (goal.current / goal.target) * 100)
                        const isComplete = pct >= 100
                        return (
                            <div key={goal.id} className="group relative">
                                <div className="flex justify-between items-end mb-1.5">
                                    <div>
                                        <p className="font-body text-sm font-medium text-g-text flex items-center gap-1.5">
                                            {goal.name} {isComplete && <span className="text-[10px] bg-g-green-pastel text-g-green px-1.5 py-0.5 rounded-md font-mono font-bold tracking-tight uppercase">Reached</span>}
                                        </p>
                                        <p className="font-mono text-[10px] text-g-text-tertiary mt-0.5">
                                            ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`font-mono font-bold text-xs ${isComplete ? 'text-g-green' : 'text-g-blue'}`}>
                                        {pct.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-g-border overflow-hidden relative">
                                    <div
                                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${isComplete ? 'bg-g-green' : 'bg-g-blue'}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <div className="absolute top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-g-surface shadow-sm rounded-md border border-g-border overflow-hidden">
                                    <button
                                        onClick={() => handleUpdateProgress(goal.id, 50)}
                                        className="px-2 py-1 text-[10px] font-mono font-bold text-g-blue hover:bg-g-blue-pastel transition-colors"
                                        title="Add $50"
                                    >
                                        +$50
                                    </button>
                                    <button
                                        onClick={() => handleDelete(goal.id)}
                                        className="px-2 py-1 text-[10px] font-mono font-bold text-g-red hover:bg-g-red-pastel transition-colors border-l border-g-border"
                                        title="Delete"
                                    >
                                        Del
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
