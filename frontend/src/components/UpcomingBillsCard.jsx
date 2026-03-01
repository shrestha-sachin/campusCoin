import React, { useMemo } from 'react'
import { CalendarClock, AlertTriangle, CheckCircle2, Zap } from 'lucide-react'
import { useApp } from '../store.jsx'
import { addDays, addMonths, addWeeks, subDays, isSameDay, differenceInDays } from 'date-fns'
import { isBefore } from 'date-fns'

export default function UpcomingBillsCard() {
    const { expenses, nessieTransactions, nessieBills } = useApp()

    const upcomingBills = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const in30Days = addDays(today, 30)
        const bills = []

        expenses.filter(e => e.is_active).forEach(exp => {
            let nextDate = null
            if (exp.frequency === 'one-time' && exp.due_date) {
                nextDate = new Date(exp.due_date)
            } else if (exp.start_date && exp.frequency !== 'one-time') {
                const startDate = new Date(exp.start_date)
                startDate.setHours(0, 0, 0, 0)
                nextDate = startDate
                while (isBefore(nextDate, today)) {
                    if (exp.frequency === 'monthly') nextDate = addMonths(nextDate, 1)
                    else if (exp.frequency === 'weekly') nextDate = addWeeks(nextDate, 1)
                    else if (exp.frequency === 'semesterly') nextDate = addMonths(nextDate, 4)
                    else break
                }
            }

            if (nextDate && nextDate <= in30Days && nextDate >= today) {
                let isPaid = false
                if (nessieTransactions?.length > 0) {
                    const thresholdDate = subDays(nextDate, 7)
                    isPaid = !!nessieTransactions.find(tx => {
                        if (tx.type !== 'purchase') return false
                        const txDate = new Date(tx.date)
                        txDate.setHours(0, 0, 0, 0)
                        const margin = exp.amount * 0.15
                        return txDate >= thresholdDate && txDate <= nextDate && Math.abs(tx.amount - exp.amount) <= margin
                    })
                }
                if (!isPaid) bills.push({ ...exp, nextDate, source: 'user' })
            }
        })

        if (nessieBills?.length > 0) {
            nessieBills.forEach(nb => {
                const billDateStr = nb.upcoming_payment_date || nb.payment_date
                if (!billDateStr) return
                const billDate = new Date(billDateStr)
                billDate.setHours(0, 0, 0, 0)
                if (billDate >= today && billDate <= in30Days) {
                    const isDuplicate = bills.find(b =>
                        Math.abs(b.amount - (nb.payment_amount || nb.amount)) < 2 && isSameDay(b.nextDate, billDate)
                    )
                    if (!isDuplicate) {
                        bills.push({
                            id: nb._id, label: nb.payee || nb.nickname || 'Linked Bill',
                            amount: nb.payment_amount || nb.amount || 0,
                            frequency: nb.recurring_date ? 'Monthly' : 'One-time',
                            nextDate: billDate, source: 'nessie'
                        })
                    }
                }
            })
        }

        return bills.sort((a, b) => a.nextDate - b.nextDate).slice(0, 5)
    }, [expenses, nessieTransactions, nessieBills])

    const totalDue = upcomingBills.reduce((s, b) => s + b.amount, 0)

    return (
        <div className="card p-5 sm:p-6 h-full flex flex-col bg-g-surface border border-g-border overflow-hidden relative">
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-g-red/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-g-red-pastel to-red-100 flex items-center justify-center shadow-sm">
                        <CalendarClock size={17} className="text-g-red" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-base text-g-text">Upcoming Bills</h3>
                        <span className="font-display text-[10px] text-g-text-tertiary uppercase font-bold tracking-wider">Next 30 days</span>
                    </div>
                </div>
                {upcomingBills.length > 0 && (
                    <div className="text-right">
                        <p className="font-mono font-bold text-base text-g-red">${totalDue.toLocaleString()}</p>
                        <p className="font-display text-[10px] text-g-text-tertiary uppercase font-bold tracking-wide">total due</p>
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-0 space-y-2.5 overflow-y-auto no-scrollbar">
                {upcomingBills.length === 0 ? (
                    <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                            <CheckCircle2 size={26} className="text-emerald-500" />
                        </div>
                        <p className="font-display text-sm font-bold text-g-text-secondary">All clear!</p>
                        <p className="font-body text-xs text-g-text-tertiary mt-1.5">No bills due in the next 30 days</p>
                    </div>
                ) : (
                    upcomingBills.map((bill, i) => {
                        const daysAway = differenceInDays(bill.nextDate, new Date().setHours(0, 0, 0, 0))
                        const isToday = daysAway === 0
                        const isUrgent = daysAway <= 3
                        const urgencyFill = Math.max(0, ((30 - daysAway) / 30) * 100)

                        return (
                            <div
                                key={`${bill.id}-${i}`}
                                className={`group relative flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 overflow-hidden
                  ${isToday ? 'bg-g-red-pastel border-g-red/30 shadow-sm' : isUrgent ? 'bg-orange-50 border-orange-200' : 'bg-g-bg border-g-border hover:border-g-blue/20 hover:shadow-sm'}`}
                                style={{ animationDelay: `${i * 80}ms` }}
                            >
                                {/* Urgency fill bar */}
                                <div
                                    className={`absolute left-0 top-0 h-full opacity-10 transition-all duration-1000 ${isToday ? 'bg-g-red' : isUrgent ? 'bg-orange-400' : 'bg-g-blue'}`}
                                    style={{ width: `${urgencyFill}%` }}
                                />

                                <div className={`relative w-2 h-2 rounded-full flex-shrink-0 ${isToday ? 'bg-g-red animate-pulse' : isUrgent ? 'bg-orange-400' : 'bg-g-text-tertiary/40'}`} />

                                <div className="relative flex-1 min-w-0">
                                    <p className={`font-display font-bold text-[13px] truncate ${isToday ? 'text-g-red' : 'text-g-text'}`}>{bill.label}</p>
                                    <p className="font-mono text-[10px] text-g-text-tertiary uppercase mt-0.5">
                                        {bill.frequency === 'one-time' ? 'One Time' : bill.frequency}
                                    </p>
                                </div>

                                <div className="relative flex flex-col items-end gap-1">
                                    <span className={`font-mono font-black text-sm ${isToday ? 'text-g-red' : 'text-g-text'}`}>
                                        ${bill.amount.toLocaleString()}
                                    </span>
                                    <span className={`font-display text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1
                    ${isToday ? 'bg-g-red text-white' : isUrgent ? 'bg-orange-100 text-orange-600' : 'bg-g-surface text-g-text-tertiary border border-g-border'}`}>
                                        {isToday && <Zap size={9} />}
                                        {isToday ? 'Due Today' : `${daysAway}d`}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
