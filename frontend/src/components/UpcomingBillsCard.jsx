import React, { useMemo } from 'react'
import { CalendarClock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useApp } from '../store.jsx'
import { addDays, addMonths, addWeeks, subDays, isBefore, isSameDay, differenceInDays } from 'date-fns'

export default function UpcomingBillsCard() {
    const { expenses, nessieTransactions, nessieBills } = useApp()

    const upcomingBills = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const in30Days = addDays(today, 30)
        const bills = []

        // 1. Process manually added recurring expenses
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
                // Check if paid recently via Nessie transactions
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
                if (!isPaid) {
                    bills.push({ ...exp, nextDate, source: 'user' })
                }
            }
        })

        // 2. Process real bills from Nessie API
        if (nessieBills?.length > 0) {
            nessieBills.forEach(nb => {
                // Nessie bills use 'upcoming_payment_date' or 'payment_date'
                const billDateStr = nb.upcoming_payment_date || nb.payment_date
                if (!billDateStr) return

                const billDate = new Date(billDateStr)
                billDate.setHours(0, 0, 0, 0)

                if (billDate >= today && billDate <= in30Days) {
                    // Avoid double counting if it matches a user expense very closely
                    const isDuplicate = bills.find(b =>
                        Math.abs(b.amount - (nb.payment_amount || nb.amount)) < 2 &&
                        isSameDay(b.nextDate, billDate)
                    )

                    if (!isDuplicate) {
                        bills.push({
                            id: nb._id,
                            label: nb.payee || nb.nickname || 'Linked Bill',
                            amount: nb.payment_amount || nb.amount || 0,
                            frequency: nb.recurring_date ? 'Monthly' : 'One-time',
                            nextDate: billDate,
                            source: 'nessie'
                        })
                    }
                }
            })
        }

        return bills.sort((a, b) => a.nextDate - b.nextDate).slice(0, 5)
    }, [expenses, nessieTransactions, nessieBills])

    return (
        <div className="card p-5 sm:p-6 h-full flex flex-col bg-g-surface border border-g-border">
            <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-g-red-pastel flex items-center justify-center">
                    <CalendarClock size={16} className="text-g-red" />
                </div>
                <span className="font-display text-[11px] text-g-text-tertiary tracking-wide uppercase font-bold">
                    Upcoming Bills (30d)
                </span>
            </div>

            <div className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1">
                {upcomingBills.length === 0 ? (
                    <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center opacity-60">
                        <CheckCircle2 size={24} className="text-g-text-tertiary mb-2" />
                        <p className="font-body text-sm font-medium text-g-text-secondary">All caught up!</p>
                        <p className="font-body text-xs text-g-text-tertiary mt-1">No bills due in the next 30 days.</p>
                    </div>
                ) : (
                    upcomingBills.map((bill, i) => {
                        const daysAway = differenceInDays(bill.nextDate, new Date().setHours(0, 0, 0, 0))
                        let statusColor = 'text-g-text-secondary'
                        let statusBg = 'bg-g-bg'
                        let statusIcon = null

                        if (daysAway === 0) {
                            statusColor = 'text-g-red'
                            statusBg = 'bg-g-red-pastel'
                            statusIcon = <AlertCircle size={12} />
                        } else if (daysAway <= 3) {
                            statusColor = 'text-g-orange'
                            statusBg = 'bg-orange-50 dark:bg-orange-900/20'
                            statusIcon = <AlertCircle size={12} />
                        }

                        return (
                            <div key={`${bill.id}-${i}`} className="flex items-center justify-between p-3 rounded-xl bg-g-bg border border-g-border hover:border-g-blue/20 transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-body text-sm font-medium text-g-text">{bill.label}</span>
                                    <span className="font-mono text-[10px] text-g-text-tertiary uppercase mt-0.5">
                                        {bill.frequency === 'one-time' ? 'One Time' : bill.frequency}
                                    </span>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <span className="font-mono font-bold text-sm text-g-text">
                                        ${bill.amount.toLocaleString()}
                                    </span>
                                    <span className={`font-mono text-[10px] font-medium flex items-center gap-1 px-1.5 py-0.5 rounded-md ${statusBg} ${statusColor}`}>
                                        {statusIcon}
                                        {daysAway === 0 ? 'Due Today' : `In ${daysAway} day${daysAway === 1 ? '' : 's'}`}
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
