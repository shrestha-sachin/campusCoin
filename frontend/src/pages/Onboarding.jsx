import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { v4 as uuidv4 } from 'uuid'
import { format, addMonths } from 'date-fns'
import Logo from '../components/Logo.jsx'
import {
    User, GraduationCap, Wallet, Briefcase, Receipt,
    Target, ChevronRight, ChevronLeft, Sparkles,
    Plus, X, ArrowRight,
} from 'lucide-react'

const today = new Date()
const TODAY_STR = format(today, 'yyyy-MM-dd')
const IN_4MO = format(addMonths(today, 4), 'yyyy-MM-dd')

const STEPS = [
    { id: 'welcome', label: 'Welcome', icon: Sparkles },
    { id: 'personal', label: 'About You', icon: User },
    { id: 'balance', label: 'Balance', icon: Wallet },
    { id: 'income', label: 'Income', icon: Briefcase },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'goals', label: 'Goals', icon: Target },
]

const TYPE_LABELS = { campus_job: 'Campus Job', internship: 'Internship', stipend: 'Stipend', family: 'Family', other: 'Other' }
const FREQ_LABELS = { monthly: 'Monthly', weekly: 'Weekly', semesterly: 'Semesterly', 'one-time': 'One-time' }

export default function Onboarding() {
    const navigate = useNavigate()
    const { completeOnboarding } = useApp()
    const [step, setStep] = useState(0)

    // Form state
    const [name, setName] = useState('')
    const [university, setUniversity] = useState('')
    const [major, setMajor] = useState('')
    const [gradDate, setGradDate] = useState('')
    const [balance, setBalance] = useState('')
    const [incomes, setIncomes] = useState([])
    const [expenseList, setExpenseList] = useState([])
    const [goals, setGoals] = useState([])
    const [newGoal, setNewGoal] = useState('')

    // Income form
    const [incForm, setIncForm] = useState({ type: 'campus_job', label: '', hourly_rate: '', weekly_hours: '', is_lump_sum: false, lump_sum_amount: '' })
    const [showIncForm, setShowIncForm] = useState(false)

    // Expense form
    const [expForm, setExpForm] = useState({ label: '', amount: '', frequency: 'monthly', type: 'fixed' })
    const [showExpForm, setShowExpForm] = useState(false)

    function canNext() {
        if (step === 1) return name.trim() && university.trim() && major.trim() && gradDate
        if (step === 2) return balance !== '' && Number(balance) >= 0
        return true
    }

    function addIncome() {
        if (!incForm.label.trim()) return
        setIncomes(prev => [...prev, {
            id: uuidv4(), ...incForm,
            hourly_rate: Number(incForm.hourly_rate) || 0,
            weekly_hours: Number(incForm.weekly_hours) || 0,
            lump_sum_amount: incForm.is_lump_sum ? Number(incForm.lump_sum_amount) || 0 : null,
            start_date: TODAY_STR, end_date: IN_4MO, is_active: true,
        }])
        setIncForm({ type: 'campus_job', label: '', hourly_rate: '', weekly_hours: '', is_lump_sum: false, lump_sum_amount: '' })
        setShowIncForm(false)
    }

    function addExpense() {
        if (!expForm.label.trim() || !expForm.amount) return
        setExpenseList(prev => [...prev, {
            id: uuidv4(), ...expForm,
            amount: Number(expForm.amount),
            due_date: TODAY_STR, is_active: true,
        }])
        setExpForm({ label: '', amount: '', frequency: 'monthly', type: 'fixed' })
        setShowExpForm(false)
    }

    function addGoal() {
        const g = newGoal.trim()
        if (!g) return
        setGoals(prev => [...prev, g])
        setNewGoal('')
    }

    function finish() {
        completeOnboarding({
            profile: {
                user_id: uuidv4(),
                name: name.trim(),
                university: university.trim(),
                major: major.trim(),
                graduation_date: gradDate,
                financial_goals: goals,
                current_balance: Number(balance),
                nessie_account_id: null,
            },
            incomeStreams: incomes,
            expenses: expenseList,
        })
        navigate('/dashboard')
    }

    const isLast = step === STEPS.length - 1

    return (
        <div className="min-h-screen bg-g-bg flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-center">
                <Logo size="default" />
            </div>

            {/* Progress bar */}
            <div className="max-w-2xl mx-auto w-full px-6 mb-2">
                <div className="flex items-center gap-1">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex-1 flex items-center gap-1">
                            <div className={`h-1 rounded-full flex-1 transition-all duration-300 ${i <= step ? 'bg-g-blue' : 'bg-g-border'
                                }`} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2">
                    {STEPS.map((s, i) => {
                        const Icon = s.icon
                        return (
                            <div key={s.id} className={`flex items-center gap-1 transition-colors ${i === step ? 'text-g-blue' : i < step ? 'text-g-green' : 'text-g-text-tertiary'
                                }`}>
                                <Icon size={12} />
                                <span className="font-mono text-[9px] tracking-wide hidden sm:inline">{s.label}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Card area */}
            <div className="flex-1 flex items-start justify-center px-4 sm:px-6 pt-4 pb-8">
                <div className="w-full max-w-2xl">

                    {/* Step 0: Welcome */}
                    {step === 0 && (
                        <div className="text-center py-8 sm:py-12 fade-up-1">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-g-blue-pastel flex items-center justify-center mb-6">
                                <Sparkles size={28} className="text-g-blue" />
                            </div>
                            <h1 className="font-display font-bold text-2xl sm:text-3xl text-g-text tracking-tight mb-3">
                                Welcome to CampusCoin
                            </h1>
                            <p className="font-body text-g-text-secondary text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-2">
                                Your AI-powered financial companion built for the student lifecycle.
                                Let's get to know you so we can personalize your experience.
                            </p>
                            <p className="font-mono text-[11px] text-g-text-tertiary">Takes about 2 minutes</p>
                        </div>
                    )}

                    {/* Step 1: Personal */}
                    {step === 1 && (
                        <div className="card p-5 sm:p-7 fade-up-1">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-9 h-9 rounded-xl bg-g-blue-pastel flex items-center justify-center">
                                    <GraduationCap size={18} className="text-g-blue" />
                                </div>
                                <div>
                                    <h2 className="font-display font-bold text-g-text text-lg">About You</h2>
                                    <p className="font-body text-g-text-secondary text-xs">Tell us about yourself</p>
                                </div>
                            </div>
                            <div className="space-y-3.5">
                                <div>
                                    <label className="label">Full Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Chen" className="input-field" autoFocus />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="label">University</label>
                                        <input type="text" value={university} onChange={e => setUniversity(e.target.value)} placeholder="UIUC" className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Major</label>
                                        <input type="text" value={major} onChange={e => setMajor(e.target.value)} placeholder="Computer Science" className="input-field" />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Expected Graduation</label>
                                    <input type="date" value={gradDate} onChange={e => setGradDate(e.target.value)} className="input-field" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Balance */}
                    {step === 2 && (
                        <div className="card p-5 sm:p-7 fade-up-1">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-9 h-9 rounded-xl bg-g-green-pastel flex items-center justify-center">
                                    <Wallet size={18} className="text-g-green" />
                                </div>
                                <div>
                                    <h2 className="font-display font-bold text-g-text text-lg">Current Balance</h2>
                                    <p className="font-body text-g-text-secondary text-xs">How much do you have right now?</p>
                                </div>
                            </div>
                            <div>
                                <label className="label">Balance ($)</label>
                                <input
                                    type="number" step="0.01" value={balance}
                                    onChange={e => setBalance(e.target.value)}
                                    placeholder="1240.50"
                                    className="input-field text-2xl font-display font-bold !py-4"
                                    autoFocus
                                />
                                <p className="font-body text-g-text-tertiary text-xs mt-2">
                                    This is your checking/savings total. You can connect Capital One later.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Income */}
                    {step === 3 && (
                        <div className="card p-5 sm:p-7 fade-up-1">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-g-green-pastel flex items-center justify-center">
                                        <Briefcase size={18} className="text-g-green" />
                                    </div>
                                    <div>
                                        <h2 className="font-display font-bold text-g-text text-lg">Income Sources</h2>
                                        <p className="font-body text-g-text-secondary text-xs">Add your income streams</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowIncForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-g-blue text-white font-body text-xs font-medium hover:bg-[#3367d6] transition-all shadow-sm">
                                    <Plus size={14} /> Add
                                </button>
                            </div>

                            {incomes.length === 0 && !showIncForm && (
                                <div className="text-center py-8 border border-dashed border-g-border rounded-xl">
                                    <Briefcase size={24} className="text-g-text-tertiary mx-auto mb-2" />
                                    <p className="font-body text-g-text-secondary text-sm">No income yet</p>
                                    <p className="font-body text-g-text-tertiary text-xs mt-0.5">Add campus jobs, internships, etc.</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                {incomes.map((inc, i) => (
                                    <div key={inc.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-g-bg border border-g-border">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-body text-g-text text-sm truncate">{inc.label}</p>
                                            <p className="font-mono text-[10px] text-g-text-tertiary">{TYPE_LABELS[inc.type]} · {inc.is_lump_sum ? `$${inc.lump_sum_amount?.toLocaleString()}` : `$${inc.hourly_rate}/hr`}</p>
                                        </div>
                                        <button onClick={() => setIncomes(prev => prev.filter((_, idx) => idx !== i))} className="text-g-text-tertiary hover:text-g-red p-1"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>

                            {showIncForm && (
                                <div className="mt-3 border border-g-border rounded-xl p-4 space-y-3 bg-g-bg/60">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="label">Type</label>
                                            <select value={incForm.type} onChange={e => setIncForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                                                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Label</label>
                                            <input type="text" value={incForm.label} onChange={e => setIncForm(f => ({ ...f, label: e.target.value }))} placeholder="Library Job" className="input-field" />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={incForm.is_lump_sum} onChange={e => setIncForm(f => ({ ...f, is_lump_sum: e.target.checked }))} className="w-4 h-4 rounded accent-g-blue" />
                                        <span className="font-body text-sm text-g-text-secondary">Lump sum</span>
                                    </label>
                                    {incForm.is_lump_sum ? (
                                        <div><label className="label">Amount ($)</label><input type="number" value={incForm.lump_sum_amount} onChange={e => setIncForm(f => ({ ...f, lump_sum_amount: e.target.value }))} placeholder="12000" className="input-field" /></div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className="label">$/hr</label><input type="number" value={incForm.hourly_rate} onChange={e => setIncForm(f => ({ ...f, hourly_rate: e.target.value }))} placeholder="14" className="input-field" /></div>
                                            <div><label className="label">hrs/wk</label><input type="number" value={incForm.weekly_hours} onChange={e => setIncForm(f => ({ ...f, weekly_hours: e.target.value }))} placeholder="12" className="input-field" /></div>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <button onClick={addIncome} className="flex-1 py-2.5 rounded-full bg-g-blue text-white font-body text-sm font-medium shadow-sm">Save</button>
                                        <button onClick={() => setShowIncForm(false)} className="flex-1 py-2.5 rounded-full bg-g-bg text-g-text-secondary font-body text-sm border border-g-border">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Expenses */}
                    {step === 4 && (
                        <div className="card p-5 sm:p-7 fade-up-1">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-g-red-pastel flex items-center justify-center">
                                        <Receipt size={18} className="text-g-red" />
                                    </div>
                                    <div>
                                        <h2 className="font-display font-bold text-g-text text-lg">Monthly Expenses</h2>
                                        <p className="font-body text-g-text-secondary text-xs">Add your recurring costs</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowExpForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-g-red text-white font-body text-xs font-medium hover:bg-[#c5221f] transition-all shadow-sm">
                                    <Plus size={14} /> Add
                                </button>
                            </div>

                            {expenseList.length === 0 && !showExpForm && (
                                <div className="text-center py-8 border border-dashed border-g-border rounded-xl">
                                    <Receipt size={24} className="text-g-text-tertiary mx-auto mb-2" />
                                    <p className="font-body text-g-text-secondary text-sm">No expenses yet</p>
                                    <p className="font-body text-g-text-tertiary text-xs mt-0.5">Add rent, tuition, groceries, etc.</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                {expenseList.map((exp, i) => (
                                    <div key={exp.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-g-bg border border-g-border">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-body text-g-text text-sm truncate">{exp.label}</p>
                                            <p className="font-mono text-[10px] text-g-text-tertiary">${exp.amount.toLocaleString()} · {FREQ_LABELS[exp.frequency]}</p>
                                        </div>
                                        <button onClick={() => setExpenseList(prev => prev.filter((_, idx) => idx !== i))} className="text-g-text-tertiary hover:text-g-red p-1"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>

                            {showExpForm && (
                                <div className="mt-3 border border-g-border rounded-xl p-4 space-y-3 bg-g-bg/60">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div><label className="label">Label</label><input type="text" value={expForm.label} onChange={e => setExpForm(f => ({ ...f, label: e.target.value }))} placeholder="Rent" className="input-field" /></div>
                                        <div><label className="label">Amount ($)</label><input type="number" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} placeholder="750" className="input-field" /></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div><label className="label">Type</label><select value={expForm.type} onChange={e => setExpForm(f => ({ ...f, type: e.target.value }))} className="input-field"><option value="fixed">Fixed</option><option value="variable">Variable</option></select></div>
                                        <div><label className="label">Frequency</label><select value={expForm.frequency} onChange={e => setExpForm(f => ({ ...f, frequency: e.target.value }))} className="input-field">{Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={addExpense} className="flex-1 py-2.5 rounded-full bg-g-blue text-white font-body text-sm font-medium shadow-sm">Save</button>
                                        <button onClick={() => setShowExpForm(false)} className="flex-1 py-2.5 rounded-full bg-g-bg text-g-text-secondary font-body text-sm border border-g-border">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 5: Goals */}
                    {step === 5 && (
                        <div className="card p-5 sm:p-7 fade-up-1">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-9 h-9 rounded-xl bg-g-green-pastel flex items-center justify-center">
                                    <Target size={18} className="text-g-green" />
                                </div>
                                <div>
                                    <h2 className="font-display font-bold text-g-text text-lg">Financial Goals</h2>
                                    <p className="font-body text-g-text-secondary text-xs">What are you saving for?</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-3">
                                {goals.map((g, i) => (
                                    <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-g-bg border border-g-border">
                                        <span className="w-1.5 h-1.5 rounded-full bg-g-green flex-shrink-0" />
                                        <p className="flex-1 font-body text-g-text text-sm truncate">{g}</p>
                                        <button onClick={() => setGoals(prev => prev.filter((_, idx) => idx !== i))} className="text-g-text-tertiary hover:text-g-red p-1"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text" value={newGoal} onChange={e => setNewGoal(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addGoal()}
                                    placeholder="e.g. Graduate debt-free"
                                    className="input-field" autoFocus
                                />
                                <button onClick={addGoal} className="px-4 py-2.5 rounded-xl bg-g-blue text-white font-body text-sm font-medium shadow-sm flex-shrink-0">
                                    <Plus size={16} />
                                </button>
                            </div>

                            {goals.length === 0 && (
                                <div className="mt-4 space-y-1.5">
                                    <p className="font-mono text-[10px] text-g-text-tertiary tracking-wide uppercase">Suggestions</p>
                                    {['Graduate debt-free', 'Save $2,000 emergency fund', 'Build credit score', 'Save for study abroad'].map(s => (
                                        <button key={s} onClick={() => setGoals(prev => [...prev, s])} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-body text-g-text-secondary hover:bg-g-bg hover:text-g-blue transition-colors border border-transparent hover:border-g-border">
                                            + {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-5">
                        <button
                            onClick={() => setStep(s => s - 1)}
                            disabled={step === 0}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full font-body text-sm font-medium transition-all ${step === 0
                                    ? 'opacity-0 pointer-events-none'
                                    : 'text-g-text-secondary hover:text-g-text hover:bg-g-surface border border-g-border'
                                }`}
                        >
                            <ChevronLeft size={16} /> Back
                        </button>

                        {isLast ? (
                            <button
                                onClick={finish}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-g-blue text-white font-body text-sm font-medium hover:bg-[#3367d6] transition-all shadow-sm"
                            >
                                Launch Dashboard <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={() => setStep(s => s + 1)}
                                disabled={!canNext()}
                                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-g-blue text-white font-body text-sm font-medium hover:bg-[#3367d6] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
