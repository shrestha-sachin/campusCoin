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
    const regularInc = incomeStreams
      .filter(s => s.is_active && !s.is_lump_sum)
      .reduce((sum, s) => sum + (Number(s.hourly_rate || 0) * Number(s.weekly_hours || 0) * 4.33), 0)

    const yearlyLumpSum = incomeStreams
      .filter(s => s.is_active && s.is_lump_sum)
      .reduce((sum, s) => sum + (Number(s.lump_sum_amount || 0)), 0)

    const monthlyIncome = regularInc + (yearlyLumpSum / 12)

    const monthlyExpenses = expenses
      .filter(e => e.is_active)
      .reduce((sum, e) => {
        let amt = Number(e.amount) || 0
        if (e.frequency === 'monthly') return sum + amt
        if (e.frequency === 'weekly') return sum + amt * 4.33
        if (e.frequency === 'semesterly') return sum + amt / 4
        return sum
      }, 0)

    return {
      monthlyIncome,
      monthlyExpenses,
      netMonthly: monthlyIncome - monthlyExpenses
    }
  }, [incomeStreams, expenses])

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-8 max-w-5xl mx-auto space-y-6 pb-24">
      <div className="fade-up-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-g-text tracking-tight">
          Manage Finances
        </h1>
        <p className="font-body text-g-text-secondary text-[15px] mt-1.5 line-clamp-1">
          Toggle items below to run what-if scenarios — changes reflect instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 fade-up-1">
        <div className="card p-5 bg-gradient-to-br from-g-green/5 to-transparent border-g-green/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-g-green-pastel flex items-center justify-center">
              <TrendingUp size={18} className="text-g-green" />
            </div>
            <p className="font-display font-bold text-g-text-secondary text-xs uppercase tracking-wider">Income/mo</p>
          </div>
          <p className="font-display font-bold text-g-text text-xl">{fmt(monthlyIncome)}</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-g-red/5 to-transparent border-g-red/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-g-red-pastel flex items-center justify-center">
              <TrendingDown size={18} className="text-g-red" />
            </div>
            <p className="font-display font-bold text-g-text-secondary text-xs uppercase tracking-wider">Expenses/mo</p>
          </div>
          <p className="font-display font-bold text-g-text text-xl">{fmt(monthlyExpenses)}</p>
        </div>

        <div className="card p-5 bg-g-surface border-g-blue/10">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${netMonthly >= 0 ? 'bg-g-blue-pastel' : 'bg-g-red-pastel'}`}>
              <Wallet size={18} className={netMonthly >= 0 ? 'text-g-blue' : 'text-g-red'} />
            </div>
            <p className="font-display font-bold text-g-text-secondary text-xs uppercase tracking-wider">Net Monthly</p>
          </div>
          <p className={`font-display font-bold text-xl ${netMonthly >= 0 ? 'text-g-blue' : 'text-g-red'}`}>
            {netMonthly >= 0 ? '+' : ''}{fmt(netMonthly)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 pt-4">
        <div className="fade-up-2"><IncomeStreamForm /></div>
        <div className="fade-up-3"><ExpenseForm /></div>
      </div>
    </div>
  )
}
