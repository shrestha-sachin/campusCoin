import React from 'react'
import IncomeStreamForm from '../components/IncomeStreamForm.jsx'
import ExpenseForm from '../components/ExpenseForm.jsx'

export default function Manage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-8 max-w-4xl mx-auto space-y-5 sm:space-y-6">
      <div className="fade-up-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-g-text tracking-tight">
          Income & Expenses
        </h1>
        <p className="font-body text-g-text-secondary text-[15px] mt-1.5">
          Toggle items to run What-If scenarios — charts update live.
        </p>
      </div>

      <div className="fade-up-2"><IncomeStreamForm /></div>
      <div className="fade-up-3"><ExpenseForm /></div>
    </div>
  )
}
