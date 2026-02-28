import React, { useState, useMemo } from 'react'
import { format, addDays, subDays } from 'date-fns'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { useApp } from '../store.jsx'
import { PieChart as PieChartIcon } from 'lucide-react'

function formatYAxis(value) {
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}k`
    return `$${value}`
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-g-surface rounded-2xl px-5 py-3 shadow-lg border border-g-border">
            <p className="font-body text-xs text-g-text-tertiary mb-2">{label}</p>
            {payload.map((item, i) => (
                <p key={i} className="font-body text-sm font-bold flex items-center gap-2 mb-1" style={{ color: item.color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.value)}
                </p>
            ))}
        </div>
    )
}

export default function IncomeExpenseChart() {
    const { nessieTransactions } = useApp()
    const [timeRange, setTimeRange] = useState('1M')

    const timeRanges = {
        '1D': 1,
        '1W': 7,
        '15D': 15,
        '1M': 30,
        '6M': 180,
        '1Y': 365
    }

    const data = useMemo(() => {
        const rangeDays = timeRanges[timeRange] || 30

        let bucketSizeDays = 1
        if (timeRange === '15D') bucketSizeDays = 3
        if (timeRange === '1M') bucketSizeDays = 7
        if (timeRange === '6M') bucketSizeDays = 30
        if (timeRange === '1Y') bucketSizeDays = 30

        const arr = []
        const today = new Date()
        today.setHours(23, 59, 59, 999)

        const numBuckets = Math.ceil(rangeDays / bucketSizeDays)

        // Generate buckets chronologically (oldest dates first, ending with today)
        for (let b = numBuckets - 1; b >= 0; b--) {
            const endOffset = b * bucketSizeDays
            const startOffset = Math.min((b + 1) * bucketSizeDays - 1, rangeDays - 1)

            const startDate = subDays(today, startOffset)
            startDate.setHours(0, 0, 0, 0)
            const endDate = subDays(today, endOffset)
            endDate.setHours(23, 59, 59, 999)

            let boxInc = 0
            let boxExp = 0

            // Tally up actual transactions that fell in this exact past date range
            if (nessieTransactions && nessieTransactions.length > 0) {
                nessieTransactions.forEach(tx => {
                    if (!tx.date) return
                    const txDate = new Date(tx.date)
                    // If the transaction happened exactly within this bucket's date window:
                    if (txDate >= startDate && txDate <= endDate) {
                        if (tx.type === 'deposit') {
                            boxInc += (tx.amount || 0)
                        } else if (tx.type === 'purchase') {
                            boxExp += (tx.amount || 0)
                        }
                    }
                })
            }

            let dateLabel = format(startDate, 'MMM d')
            if (bucketSizeDays === 30) {
                dateLabel = format(startDate, "MMM ''yy")
            } else if (bucketSizeDays > 1) {
                dateLabel = `${format(startDate, 'MMM d')} - ${format(endDate, 'd')}`
            }

            arr.push({
                date: dateLabel,
                Income: boxInc,
                Expenses: boxExp
            })
        }
        return arr
    }, [nessieTransactions, timeRange])

    return (
        <div className="card p-5 sm:p-7 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-g-bg to-g-border flex items-center justify-center shadow-sm">
                        <PieChartIcon size={20} className="text-g-text" />
                    </div>
                    <span className="font-body text-xs text-g-text-secondary tracking-widest uppercase font-medium">
                        Income vs Expenses
                    </span>
                </div>

                {/* Time range toggle */}
                <div className="flex items-center bg-g-surface border border-g-border rounded-xl p-1">
                    {Object.keys(timeRanges).map(tr => (
                        <button
                            key={tr}
                            onClick={() => setTimeRange(tr)}
                            className={`px-3 py-1.5 rounded-lg font-body text-xs font-medium transition-all ${timeRange === tr ? 'bg-white text-g-blue shadow-sm' : 'text-g-text-secondary hover:text-g-text'}`}
                        >
                            {tr}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[260px]">
                {data.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-g-border rounded-2xl bg-g-bg/50">
                        <p className="font-body text-[15px] text-g-text-secondary font-medium">No financial activity</p>
                        <p className="font-body text-xs text-g-text-tertiary mt-1">No income or expenses detected in this period.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={timeRange === '1M' || timeRange === '15D' || timeRange === '1W' || timeRange === '1D' ? 30 : 20}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#9aa0a6', fontSize: 11, fontFamily: 'GeneralSans, sans-serif' }}
                                axisLine={{ stroke: '#e0e0e0' }}
                                tickLine={false}
                                dy={10}
                                minTickGap={20}
                            />
                            <YAxis
                                tickFormatter={formatYAxis}
                                tick={{ fill: '#9aa0a6', fontSize: 11, fontFamily: 'GoogleSansMono, monospace' }}
                                axisLine={false}
                                tickLine={false}
                                width={50}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="Income" fill="#34A853" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="Expenses" fill="#EA4335" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}
