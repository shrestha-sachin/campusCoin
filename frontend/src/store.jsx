import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { addDays, addMonths, addWeeks, format } from 'date-fns'
import { api } from './api'

const today = new Date()

const EMPTY_PROFILE = {
  user_id: '',
  name: '',
  university: '',
  major: '',
  graduation_date: '',
  financial_goals: [],
  current_balance: 0,
  nessie_account_id: null,
}

const EMPTY_AUTH = {
  isAuthenticated: false,
  email: '',
  name: '',
}

const STORAGE_KEY = 'campuscoin_data'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const stored = loadFromStorage()

  const [onboarded, setOnboarded] = useState(!!stored?.onboarded)
  const [profile, setProfile] = useState(stored?.profile ?? EMPTY_PROFILE)
  const [incomeStreams, setIncomeStreams] = useState(stored?.incomeStreams ?? [])
  const [expenses, setExpenses] = useState(stored?.expenses ?? [])
  const [auth, setAuth] = useState(stored?.auth ?? EMPTY_AUTH)
  const [runway, setRunway] = useState([])
  const [aiInsight, setAiInsight] = useState(null)
  const [loading, setLoading] = useState({ runway: false, ai: false })

  // Persist to localStorage on change
  useEffect(() => {
    saveToStorage({ auth, onboarded, profile, incomeStreams, expenses })
  }, [auth, onboarded, profile, incomeStreams, expenses])

  function login({ email, name }) {
    setAuth({
      isAuthenticated: true,
      email: email?.trim() ?? '',
      name: name?.trim() ?? '',
    })
  }

  function logout() {
    setAuth(EMPTY_AUTH)
    setOnboarded(false)
    setProfile(EMPTY_PROFILE)
    setIncomeStreams([])
    setExpenses([])
    clearStorage()
  }

  function completeOnboarding(data) {
    setProfile(data.profile)
    setIncomeStreams(data.incomeStreams)
    setExpenses(data.expenses)
    setOnboarded(true)
  }

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
      auth,
      login,
      logout,
      onboarded, setOnboarded, completeOnboarding,
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
