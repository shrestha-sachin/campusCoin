import React, { useMemo } from 'react'
import IncomeStreamForm from '../components/IncomeStreamForm.jsx'
import ExpenseForm from '../components/ExpenseForm.jsx'
import { useApp } from '../store.jsx'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function Manage() {
  const { incomeStreams, expenses } = useApp()

  const { monthlyIncome, monthlyExpenses, netMonthly } = useMemo(() => {
    const monthlyIncome = incomeStreams
      .filter(s => s.is_active && !s.is_lump_sum)
      .reduce((sum, s) => sum + (s.hourly_rate * s.weekly_hours * 4.33), 0)

    const monthlyExpenses = expenses
      .filter(e => e.is_active)
      .reduce((sum, e) => {
        if (e.frequency === 'monthly') return sum + e.amount
        if (e.frequency === 'weekly') return sum + e.amount * 4.33
        if (e.frequency === 'semesterly') return sum + e.amount / 4
        return sum
      }, 0)

    return {
      monthlyIncome,
      monthlyExpenses,
      netMonthly: monthlyIncome - monthlyExpenses
    }
  }, [incomeStreams, expenses])

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-8 max-w-5xl mx-auto space-y-5 sm:space-y-6 pb-24">
      <div className="fade-up-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-g-text tracking-tight">
          Income & Expenses
        </h1>
        <p className="font-body text-g-text-secondary text-[15px] mt-1.5 flex items-center justify-between">
          <span>Toggle items to run What-If scenarios — charts update live.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 fade-up-1">
        <div className="card p-4 sm:p-5 flex items-center gap-4 bg-g-surface">
          <div className="w-10 h-10 rounded-xl bg-g-green-pastel flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-g-green" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-g-text-tertiary tracking-wider uppercase">Active Income/Mo</p>
            <p className="font-display font-bold text-g-text text-lg">{fmt(monthlyIncome)}</p>
          </div>
        </div>
        <div className="card p-4 sm:p-5 flex items-center gap-4 bg-g-surface">
          <div className="w-10 h-10 rounded-xl bg-g-red-pastel flex items-center justify-center flex-shrink-0">
            <TrendingDown size={18} className="text-g-red" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-g-text-tertiary tracking-wider uppercase">Active Expenses/Mo</p>
            <p className="font-display font-bold text-g-text text-lg">{fmt(monthlyExpenses)}</p>
          </div>
        </div>
        <div className="card p-4 sm:p-5 flex items-center gap-4 bg-g-surface">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${netMonthly >= 0 ? 'bg-g-blue-pastel' : 'bg-g-red-pastel'}`}>
            <Wallet size={18} className={netMonthly >= 0 ? 'text-g-blue' : 'text-g-red'} />
          </div>
          <div>
            <p className="font-mono text-[10px] text-g-text-tertiary tracking-wider uppercase">Net Monthly</p>
            <p className={`font-display font-bold text-lg ${netMonthly >= 0 ? 'text-g-blue' : 'text-g-red'}`}>
              {netMonthly >= 0 ? '+' : ''}{fmt(netMonthly)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mt-6">
        <div className="fade-up-3"><IncomeStreamForm /></div>
        <div className="fade-up-4"><ExpenseForm /></div>
      </div>
    </div>
  )
}
