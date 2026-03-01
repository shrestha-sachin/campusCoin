import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, clearStorage } from '../store.jsx'
import { api } from '../api'
import { v4 as uuidv4 } from 'uuid'
import { format, addMonths } from 'date-fns'
import Logo from '../components/Logo.jsx'
import {
    User, GraduationCap, Wallet, Briefcase, Receipt,
    Target, ChevronRight, ChevronLeft, Sparkles,
    Plus, X, ArrowRight, DollarSign, Clock, Loader2, Check
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

const CustomCheckbox = ({ checked, onChange }) => (
    <div
        onClick={onChange}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${checked ? 'bg-g-blue border-g-blue shadow-sm scale-110' : 'border-g-border bg-white hover:border-g-blue/30'}`}
    >
        {checked && <Check size={12} className="text-white" strokeWidth={3} />}
    </div>
)

export default function Onboarding() {
    const navigate = useNavigate()
    const { auth, completeOnboarding } = useApp()
    const [step, setStep] = useState(0)
    const [direction, setDirection] = useState('right') // track animation direction
    const [animKey, setAnimKey] = useState(0) // force re-mount for animation

    // Form state
    const [name, setName] = useState(auth.name || '')
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

    // Submitting state (Nessie account creation)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')

    function canNext() {
        if (step === 1) return name.trim() && university.trim() && major.trim() && gradDate
        if (step === 2) return balance !== '' && Number(balance) >= 0
        return true
    }

    function goNext() {
        if (!canNext()) return
        setDirection('right')
        setAnimKey(k => k + 1)
        setStep(s => s + 1)
    }

    function goBack() {
        setDirection('left')
        setAnimKey(k => k + 1)
        setStep(s => s - 1)
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

    async function finish() {
        setSubmitting(true)
        setSubmitError('')

        const userId = auth.user_id || uuidv4()
        const balanceNum = Number(balance)
        let nessieAccountId = null
        let nessieCustomerId = null

        // Split name into first/last for Nessie
        const parts = name.trim().split(/\s+/)
        const firstName = parts[0] || 'Student'
        const lastName = parts.slice(1).join(' ') || 'User'

        try {
            // Create Nessie customer + checking account with starting balance
            const nessie = await api.createNessieAccount({
                first_name: firstName,
                last_name: lastName,
                balance: balanceNum,
            })
            nessieAccountId = nessie.account_id
            nessieCustomerId = nessie.customer_id
        } catch (err) {
            console.warn('Nessie account creation failed (continuing without it):', err)
        }

        const profileData = {
            user_id: userId,
            student_id: auth.student_id || '',
            name: name.trim(),
            university: university.trim(),
            major: major.trim(),
            graduation_date: gradDate,
            financial_goals: goals,
            current_balance: balanceNum,
            nessie_account_id: nessieAccountId,
            nessie_customer_id: nessieCustomerId,
        }

        const onboardingData = {
            profile: profileData,
            incomeStreams: incomes,
            expenses: expenseList,
        }

        // 1. Update local state
        completeOnboarding(onboardingData)

        // 2. Save to backend immediately (don't rely on debounce)
        try {
            await api.saveProfile(userId, {
                profile: profileData,
                income_streams: incomes,
                expenses: expenseList,
            })
            console.log('[CampusCoin] Profile saved to backend on onboarding complete')
        } catch (err) {
            console.warn('Backend save failed (data safe in localStorage):', err)
        }

        setSubmitting(false)
        navigate('/dashboard')
    }

    const isLast = step === STEPS.length - 1
    const animClass = direction === 'right' ? 'slide-in' : 'slide-in-left'
    const pct = ((step + 1) / STEPS.length) * 100

    return (
        <div className="min-h-screen onboarding-bg flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 sm:py-6 flex items-center justify-center fade-up-1">
                <Logo size="large" />
            </div>

            {/* Unified progress bar */}
            <div className="max-w-2xl mx-auto w-full px-6 mb-4">
                <div className="h-1.5 rounded-full bg-g-border/50 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-g-blue to-g-blue-half transition-all duration-500 ease-out glow-pulse"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <div className="flex justify-between mt-3">
                    {STEPS.map((s, i) => {
                        const Icon = s.icon
                        const isActive = i === step
                        const isDone = i < step
                        return (
                            <div
                                key={s.id}
                                className={`flex items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-g-blue scale-105' : isDone ? 'text-g-green' : 'text-g-text-tertiary'
                                    }`}
                            >
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-g-blue text-white shadow-md' : isDone ? 'bg-g-green-pastel' : 'bg-g-bg'
                                    }`}>
                                    <Icon size={12} />
                                </div>
                                <span className="font-body text-[10px] sm:text-[11px] tracking-wide hidden sm:inline font-medium">
                                    {s.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Step content area */}
            <div className="flex-1 flex items-start justify-center px-4 sm:px-6 pt-2 pb-8">
                <div className="w-full max-w-2xl" key={animKey}>

                    {/* Step 0: Welcome */}
                    {step === 0 && (
                        <div className={`text-center py-10 sm:py-16 ${animClass}`}>
                            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-br from-g-blue to-g-blue-half flex items-center justify-center mb-7 scale-in float-anim shadow-lg">
                                <Sparkles size={36} className="text-white sm:w-10 sm:h-10" />
                            </div>
                            <h1 className="font-display font-bold text-3xl sm:text-4xl text-g-text tracking-tight mb-4">
                                Welcome to <span className="text-g-blue">CampusCoin</span>
                            </h1>
                            <p className="font-body text-g-text-secondary text-base sm:text-lg max-w-md mx-auto leading-relaxed mb-3">
                                Your AI-powered financial companion built for the student lifecycle.
                                Let's personalize your experience.
                            </p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-g-surface border border-g-border mt-2">
                                <Clock size={14} className="text-g-text-tertiary" />
                                <span className="font-body text-xs text-g-text-tertiary">Takes about 2 minutes</span>
                            </div>

                            {/* Sign in fallback */}
                            <div className="mt-8 pt-6 border-t border-g-border/50">
                                <p className="font-body text-g-text-tertiary text-xs mb-2">Already have an account?</p>
                                <button
                                    onClick={() => { clearStorage(); window.location.href = '/auth'; }}
                                    className="font-body text-g-blue text-sm font-semibold hover:underline"
                                >
                                    Log out and Sign in
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Personal */}
                    {step === 1 && (
                        <div className={`card p-6 sm:p-8 ${animClass}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-g-blue to-g-blue-half flex items-center justify-center scale-in shadow-sm">
                                    <GraduationCap size={22} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="font-display font-bold text-g-text text-xl sm:text-2xl">About You</h2>
                                    <p className="font-body text-g-text-secondary text-sm">Tell us about yourself</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Full Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Chen" className="input-field" autoFocus />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <div className={`card p-6 sm:p-8 ${animClass}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-g-green to-g-green-half flex items-center justify-center scale-in shadow-sm">
                                    <Wallet size={22} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="font-display font-bold text-g-text text-xl sm:text-2xl">Current Balance</h2>
                                    <p className="font-body text-g-text-secondary text-sm">How much do you have right now?</p>
                                </div>
                            </div>
                            <div>
                                <label className="label">Balance ($)</label>
                                <div className="relative">
                                    <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-g-text-tertiary" />
                                    <input
                                        type="number" step="0.01" value={balance}
                                        onChange={e => setBalance(e.target.value)}
                                        placeholder="1,240.50"
                                        className="input-field !pl-11 text-2xl sm:text-3xl font-display font-bold !py-5"
                                        autoFocus
                                    />
                                </div>
                                <p className="font-body text-g-text-tertiary text-sm mt-3">
                                    This is your checking/savings total. You can connect Capital One later in Settings.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Income */}
                    {step === 3 && (
                        <div className={`card p-6 sm:p-8 ${animClass}`}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-g-green to-g-green-half flex items-center justify-center scale-in shadow-sm">
                                        <Briefcase size={22} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-display font-bold text-g-text text-xl sm:text-2xl">Income Sources</h2>
                                        <p className="font-body text-g-text-secondary text-sm">Add your income streams</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowIncForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-g-blue text-white font-body text-sm font-medium hover:bg-[#3367d6] transition-all shadow-sm hover:shadow-md">
                                    <Plus size={16} /> Add
                                </button>
                            </div>

                            {incomes.length === 0 && !showIncForm && (
                                <div className="text-center py-10 border-2 border-dashed border-g-border rounded-2xl bg-g-bg/50">
                                    <Briefcase size={32} className="text-g-text-tertiary mx-auto mb-3" />
                                    <p className="font-body text-g-text-secondary text-base font-medium">No income yet</p>
                                    <p className="font-body text-g-text-tertiary text-sm mt-1">Add campus jobs, internships, stipends</p>
                                </div>
                            )}

                            <div className="space-y-2.5">
                                {incomes.map((inc, i) => (
                                    <div key={inc.id} className="stagger-item flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-g-bg border border-g-border hover:border-g-blue/30 transition-colors">
                                        <div className="w-9 h-9 rounded-xl bg-g-green-pastel flex items-center justify-center flex-shrink-0">
                                            <Briefcase size={16} className="text-g-green" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-body text-g-text text-[15px] font-medium truncate">{inc.label}</p>
                                            <p className="font-body text-xs text-g-text-tertiary">{TYPE_LABELS[inc.type]} · {inc.is_lump_sum ? `$${inc.lump_sum_amount?.toLocaleString()}` : `$${inc.hourly_rate}/hr`}</p>
                                        </div>
                                        <button onClick={() => setIncomes(prev => prev.filter((_, idx) => idx !== i))} className="text-g-text-tertiary hover:text-g-red p-1.5 rounded-lg hover:bg-g-red-pastel transition-colors"><X size={16} /></button>
                                    </div>
                                ))}
                            </div>

                            {showIncForm && (
                                <div className="mt-4 border border-g-border rounded-2xl p-5 space-y-4 bg-g-bg/60 slide-in">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Type</label>
                                            <select value={incForm.type} onChange={e => setIncForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                                                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Label</label>
                                            <input type="text" value={incForm.label} onChange={e => setIncForm(f => ({ ...f, label: e.target.value }))} placeholder="Library Job" className="input-field" autoFocus />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                        <CustomCheckbox checked={incForm.is_lump_sum} onChange={() => setIncForm(f => ({ ...f, is_lump_sum: !f.is_lump_sum }))} />
                                        <span className="font-body text-[15px] text-g-text-secondary">Lump sum payment</span>
                                    </label>
                                    {incForm.is_lump_sum ? (
                                        <div><label className="label">Amount ($)</label><input type="number" value={incForm.lump_sum_amount} onChange={e => setIncForm(f => ({ ...f, lump_sum_amount: e.target.value }))} placeholder="12000" className="input-field" /></div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="label">Hourly Rate ($)</label><input type="number" value={incForm.hourly_rate} onChange={e => setIncForm(f => ({ ...f, hourly_rate: e.target.value }))} placeholder="14" className="input-field" /></div>
                                            <div><label className="label">Hours / Week</label><input type="number" value={incForm.weekly_hours} onChange={e => setIncForm(f => ({ ...f, weekly_hours: e.target.value }))} placeholder="12" className="input-field" /></div>
                                        </div>
                                    )}
                                    <div className="flex gap-3 pt-1">
                                        <button onClick={addIncome} className="flex-1 py-3 rounded-full bg-g-blue text-white font-body text-[15px] font-medium shadow-sm hover:shadow-md transition-all">Save</button>
                                        <button onClick={() => setShowIncForm(false)} className="flex-1 py-3 rounded-full bg-g-surface text-g-text-secondary font-body text-[15px] font-medium border border-g-border hover:bg-g-bg transition-colors">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Expenses */}
                    {step === 4 && (
                        <div className={`card p-6 sm:p-8 ${animClass}`}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-g-red to-g-red-half flex items-center justify-center scale-in shadow-sm">
                                        <Receipt size={22} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-display font-bold text-g-text text-xl sm:text-2xl">Monthly Expenses</h2>
                                        <p className="font-body text-g-text-secondary text-sm">Add your recurring costs</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowExpForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-g-red text-white font-body text-sm font-medium hover:bg-[#c5221f] transition-all shadow-sm hover:shadow-md">
                                    <Plus size={16} /> Add
                                </button>
                            </div>

                            {expenseList.length === 0 && !showExpForm && (
                                <div className="text-center py-10 border-2 border-dashed border-g-border rounded-2xl bg-g-bg/50">
                                    <Receipt size={32} className="text-g-text-tertiary mx-auto mb-3" />
                                    <p className="font-body text-g-text-secondary text-base font-medium">No expenses yet</p>
                                    <p className="font-body text-g-text-tertiary text-sm mt-1">Add rent, tuition, groceries, etc.</p>
                                </div>
                            )}

                            <div className="space-y-2.5">
                                {expenseList.map((exp, i) => (
                                    <div key={exp.id} className="stagger-item flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-g-bg border border-g-border hover:border-g-red/30 transition-colors">
                                        <div className="w-9 h-9 rounded-xl bg-g-red-pastel flex items-center justify-center flex-shrink-0">
                                            <Receipt size={16} className="text-g-red" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-body text-g-text text-[15px] font-medium truncate">{exp.label}</p>
                                            <p className="font-body text-xs text-g-text-tertiary">${exp.amount.toLocaleString()} · {FREQ_LABELS[exp.frequency]}</p>
                                        </div>
                                        <button onClick={() => setExpenseList(prev => prev.filter((_, idx) => idx !== i))} className="text-g-text-tertiary hover:text-g-red p-1.5 rounded-lg hover:bg-g-red-pastel transition-colors"><X size={16} /></button>
                                    </div>
                                ))}
                            </div>

                            {showExpForm && (
                                <div className="mt-4 border border-g-border rounded-2xl p-5 space-y-4 bg-g-bg/60 slide-in">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><label className="label">Label</label><input type="text" value={expForm.label} onChange={e => setExpForm(f => ({ ...f, label: e.target.value }))} placeholder="Rent" className="input-field" autoFocus /></div>
                                        <div><label className="label">Amount ($)</label><input type="number" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} placeholder="750" className="input-field" /></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><label className="label">Type</label><select value={expForm.type} onChange={e => setExpForm(f => ({ ...f, type: e.target.value }))} className="input-field"><option value="fixed">Fixed</option><option value="variable">Variable</option></select></div>
                                        <div><label className="label">Frequency</label><select value={expForm.frequency} onChange={e => setExpForm(f => ({ ...f, frequency: e.target.value }))} className="input-field">{Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
                                    </div>
                                    <div className="flex gap-3 pt-1">
                                        <button onClick={addExpense} className="flex-1 py-3 rounded-full bg-g-blue text-white font-body text-[15px] font-medium shadow-sm hover:shadow-md transition-all">Save</button>
                                        <button onClick={() => setShowExpForm(false)} className="flex-1 py-3 rounded-full bg-g-surface text-g-text-secondary font-body text-[15px] font-medium border border-g-border hover:bg-g-bg transition-colors">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 5: Goals */}
                    {step === 5 && (
                        <div className={`card p-6 sm:p-8 ${animClass}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-g-green to-g-green-half flex items-center justify-center scale-in shadow-sm">
                                    <Target size={22} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="font-display font-bold text-g-text text-xl sm:text-2xl">Financial Goals</h2>
                                    <p className="font-body text-g-text-secondary text-sm">What are you saving for?</p>
                                </div>
                            </div>

                            <div className="space-y-2.5 mb-4">
                                {goals.map((g, i) => (
                                    <div key={i} className="stagger-item flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-g-bg border border-g-border hover:border-g-green/30 transition-colors">
                                        <div className="w-7 h-7 rounded-full bg-g-green flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-xs font-bold">{i + 1}</span>
                                        </div>
                                        <p className="flex-1 font-body text-g-text text-[15px] font-medium truncate">{g}</p>
                                        <button onClick={() => setGoals(prev => prev.filter((_, idx) => idx !== i))} className="text-g-text-tertiary hover:text-g-red p-1.5 rounded-lg hover:bg-g-red-pastel transition-colors"><X size={16} /></button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <input
                                    type="text" value={newGoal} onChange={e => setNewGoal(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addGoal()}
                                    placeholder="e.g. Graduate debt-free"
                                    className="input-field" autoFocus
                                />
                                <button onClick={addGoal} className="px-5 py-3 rounded-2xl bg-g-blue text-white font-body text-[15px] font-medium shadow-sm hover:shadow-md transition-all flex-shrink-0">
                                    <Plus size={18} />
                                </button>
                            </div>

                            {goals.length === 0 && (
                                <div className="mt-5 space-y-1.5">
                                    <p className="font-body text-xs text-g-text-tertiary tracking-wider uppercase mb-2">Quick Add</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {['Graduate debt-free', 'Save $2,000 emergency fund', 'Build credit score', 'Save for study abroad'].map(s => (
                                            <button key={s} onClick={() => setGoals(prev => [...prev, s])}
                                                className="text-left px-4 py-3 rounded-xl text-[15px] font-body text-g-text-secondary bg-g-bg border border-g-border hover:bg-g-blue-pastel hover:text-g-blue hover:border-g-blue/30 transition-all">
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-6 sm:mt-8">
                        <button
                            onClick={goBack}
                            disabled={step === 0}
                            className={`flex items-center gap-2 px-5 py-3 rounded-full font-body text-[15px] font-medium transition-all ${step === 0
                                ? 'opacity-0 pointer-events-none'
                                : 'text-g-text-secondary hover:text-g-text bg-g-surface border border-g-border hover:shadow-sm'
                                }`}
                        >
                            <ChevronLeft size={18} /> Back
                        </button>

                        {isLast ? (
                            <button
                                onClick={finish}
                                disabled={submitting}
                                className="flex items-center gap-2.5 px-7 py-3 rounded-full bg-gradient-to-r from-g-blue to-g-blue-half text-white font-body text-[15px] font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <><Loader2 size={18} className="animate-spin" /> Setting up your account…</>
                                ) : (
                                    <>Launch Dashboard <ArrowRight size={18} /></>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={goNext}
                                disabled={!canNext()}
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-g-blue text-white font-body text-[15px] font-medium hover:bg-[#3367d6] transition-all shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
                            >
                                Next <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
