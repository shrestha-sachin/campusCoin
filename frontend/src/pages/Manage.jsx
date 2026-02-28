import React, { useEffect } from 'react'
import IncomeStreamForm from '../components/IncomeStreamForm.jsx'
import ExpenseForm from '../components/ExpenseForm.jsx'
import RunwayChart from '../components/RunwayChart.jsx'
import { useApp } from '../store.jsx'

export default function Manage() {
  const { refreshRunway, refreshAI } = useApp()

  useEffect(() => {
    async function init() {
      const rw = await refreshRunway()
      await refreshAI(rw)
    }
    init()
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-6xl mx-auto">
      <div className="fade-up-1">
        <h1 className="font-display font-bold text-2xl sm:text-[28px] text-g-text tracking-tight">
          Income & Expenses
        </h1>
        <p className="font-body text-g-text-secondary text-sm mt-1">
          Toggle items to run What-If scenarios — charts update live.
        </p>
      </div>

      <div className="fade-up-2 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <IncomeStreamForm />
        <ExpenseForm />
      </div>

      <div className="fade-up-3"><RunwayChart /></div>
    </div>
  )
}
