import React, { createContext, useContext, useState, useCallback } from 'react'
import { addDays, addMonths, addWeeks, format } from 'date-fns'
import { api } from './api'

const today = new Date()

const DEMO_PROFILE = {
  user_id: 'alex-chen-demo',
  name: 'Alex Chen',
  university: 'UIUC',
  major: 'Computer Science',
  graduation_date: '2026-05-15',
  financial_goals: ['Graduate debt-free', 'Save $2,000 emergency fund'],
  current_balance: 1240.50,
  nessie_account_id: null,
}

const DEMO_INCOME = [
  {
    id: 'inc-1',
    type: 'campus_job',
    label: 'Library Assistant',
    hourly_rate: 14,
    weekly_hours: 12,
    start_date: format(today, 'yyyy-MM-dd'),
    end_date: format(addMonths(today, 4), 'yyyy-MM-dd'),
    is_lump_sum: false,
    lump_sum_amount: null,
    is_active: true,
  },
  {
    id: 'inc-2',
    type: 'internship',
    label: 'Summer SWE Internship',
    hourly_rate: 0,
    weekly_hours: 0,
    start_date: format(addMonths(today, 3), 'yyyy-MM-dd'),
    end_date: format(addMonths(today, 5.5), 'yyyy-MM-dd'),
    is_lump_sum: true,
    lump_sum_amount: 12000,
    is_active: true,
  },
]

const DEMO_EXPENSES = [
  {
    id: 'exp-1',
    type: 'fixed',
    label: 'Rent',
    amount: 750,
    frequency: 'monthly',
    due_date: format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd'),
    is_active: true,
  },
  {
    id: 'exp-2',
    type: 'fixed',
    label: 'Tuition',
    amount: 6800,
    frequency: 'one-time',
    due_date: format(addDays(today, 14), 'yyyy-MM-dd'),
    is_active: true,
  },
  {
    id: 'exp-3',
    type: 'variable',
    label: 'Groceries',
    amount: 60,
    frequency: 'weekly',
    due_date: format(today, 'yyyy-MM-dd'),
    is_active: true,
  },
]

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(DEMO_PROFILE)
  const [incomeStreams, setIncomeStreams] = useState(DEMO_INCOME)
  const [expenses, setExpenses] = useState(DEMO_EXPENSES)
  const [runway, setRunway] = useState([])
  const [aiInsight, setAiInsight] = useState(null)
  const [loading, setLoading] = useState({ runway: false, ai: false })

  const refreshRunway = useCallback(async (overrideIncome, overrideExpenses) => {
    const inc = overrideIncome ?? incomeStreams
    const exp = overrideExpenses ?? expenses

    setLoading(prev => ({ ...prev, runway: true }))
    try {
      const data = await api.calculateRunway({
        current_balance: profile.current_balance,
        income_streams: inc,
        expenses: exp,
        days: 180,
      })
      setRunway(data)
      return data
    } catch (err) {
      console.error('Runway calculation failed:', err)
      return []
    } finally {
      setLoading(prev => ({ ...prev, runway: false }))
    }
  }, [incomeStreams, expenses, profile.current_balance])

  const refreshAI = useCallback(async (runwayData) => {
    setLoading(prev => ({ ...prev, ai: true }))
    try {
      const data = await api.analyzeFinances({
        profile,
        income_streams: incomeStreams,
        expenses,
        runway: runwayData ?? runway,
      })
      setAiInsight(data)
      return data
    } catch (err) {
      console.error('AI analysis failed:', err)
      return null
    } finally {
      setLoading(prev => ({ ...prev, ai: false }))
    }
  }, [profile, incomeStreams, expenses, runway])

  const syncNessie = useCallback(async () => {
    if (!profile.nessie_account_id) return
    try {
      const data = await api.getNessieBalance(profile.nessie_account_id)
      setProfile(prev => ({ ...prev, current_balance: data.balance }))
    } catch (err) {
      console.error('Nessie sync failed:', err)
    }
  }, [profile.nessie_account_id])

  return (
    <AppContext.Provider value={{
      profile, setProfile,
      incomeStreams, setIncomeStreams,
      expenses, setExpenses,
      runway, setRunway,
      aiInsight, setAiInsight,
      loading,
      refreshRunway,
      refreshAI,
      syncNessie,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
