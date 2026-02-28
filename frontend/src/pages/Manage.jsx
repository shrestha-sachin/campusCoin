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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-10 space-y-8 max-w-6xl mx-auto">
      <div className="fade-up-1">
        <h1 className="font-google font-bold text-3xl text-google-black">
          Income & Expenses
        </h1>
        <p className="font-google-text text-google-black/55 text-base mt-2">
          Toggle items to run What-If scenarios — the chart updates live.
        </p>
      </div>

      <div className="fade-up-2 grid grid-cols-2 gap-6">
        <IncomeStreamForm />
        <ExpenseForm />
      </div>

      <div className="fade-up-3">
        <RunwayChart />
      </div>
    </div>
  )
}
