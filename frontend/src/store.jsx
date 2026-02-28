import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
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
  nessie_customer_id: null,
}

const EMPTY_AUTH = {
  isAuthenticated: false,
  email: '',
  name: '',
}

const STORAGE_KEY = 'campuscoin_data'
const POLL_INTERVAL = 30_000 // 30 seconds

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
  const [nessieTransactions, setNessieTransactions] = useState([])
  const [lastPoll, setLastPoll] = useState(null) // timestamp of last poll

  // Track the last known transaction count so we only trigger AI on changes
  const lastTxnCountRef = useRef(0)

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
    setNessieTransactions([])
    clearStorage()
  }

  function completeOnboarding(data) {
    setProfile(data.profile)
    setIncomeStreams(data.incomeStreams)
    setExpenses(data.expenses)
    setOnboarded(true)
  }

  // ── Nessie Integration ──────────────────────────────

  /** Sync balance from Nessie (live bank balance) */
  const syncNessie = useCallback(async () => {
    if (!profile.nessie_account_id) return
    try {
      const data = await api.getNessieBalance(profile.nessie_account_id)
      setProfile(prev => ({ ...prev, current_balance: data.balance }))
    } catch (err) {
      console.error('Nessie balance sync failed:', err)
    }
  }, [profile.nessie_account_id])

  /** Fetch Nessie transactions and detect new ones. Returns true if new txns found. */
  const fetchNessieTransactions = useCallback(async () => {
    if (!profile.nessie_account_id) return false
    try {
      const txns = await api.getNessieTransactions(profile.nessie_account_id)
      const prevCount = lastTxnCountRef.current
      const newCount = txns.length

      setNessieTransactions(txns)
      setLastPoll(new Date())
      lastTxnCountRef.current = newCount

      // Return true if we detected new transactions
      return newCount > prevCount
    } catch (err) {
      console.error('Nessie transactions fetch failed:', err)
      return false
    }
  }, [profile.nessie_account_id])

  /** Full poll cycle: sync balance → fetch txns → trigger AI only if new txns */
  const pollNessie = useCallback(async () => {
    if (!profile.nessie_account_id) return

    await syncNessie()
    const hasNew = await fetchNessieTransactions()

    if (hasNew) {
      console.log('[CampusCoin] New Nessie transaction detected — running AI analysis')
      const rw = await refreshRunway()
      await refreshAI(rw)
    }
  }, [profile.nessie_account_id, syncNessie, fetchNessieTransactions])

  /** Create a Nessie deposit (income). */
  const createNessieDeposit = useCallback(async (amount, description) => {
    if (!profile.nessie_account_id) return null
    try {
      const result = await api.createNessieDeposit({
        account_id: profile.nessie_account_id,
        amount,
        description,
      })
      // Immediately poll to pick up the new transaction
      await pollNessie()
      return result
    } catch (err) {
      console.error('Nessie deposit failed:', err)
      return null
    }
  }, [profile.nessie_account_id, pollNessie])

  /** Create a Nessie purchase (expense). */
  const createNessiePurchase = useCallback(async (amount, description) => {
    if (!profile.nessie_account_id) return null
    try {
      const result = await api.createNessiePurchase({
        account_id: profile.nessie_account_id,
        amount,
        description,
      })
      // Immediately poll to pick up the new transaction
      await pollNessie()
      return result
    } catch (err) {
      console.error('Nessie purchase failed:', err)
      return null
    }
  }, [profile.nessie_account_id, pollNessie])

  /** Simulate a paycheck deposit (for hackathon demo) */
  const simulatePaycheck = useCallback(async () => {
    if (!profile.nessie_account_id) return null

    // Calculate monthly income from active streams
    const monthlyIncome = incomeStreams
      .filter(s => s.is_active && !s.is_lump_sum)
      .reduce((sum, s) => sum + (s.hourly_rate * s.weekly_hours * 4.33), 0)

    const biweeklyPay = monthlyIncome / 2
    if (biweeklyPay <= 0) return null

    const topIncome = incomeStreams.find(s => s.is_active) || { label: 'Paycheck' }
    return createNessieDeposit(
      Math.round(biweeklyPay * 100) / 100,
      `Bi-weekly paycheck — ${topIncome.label}`
    )
  }, [profile.nessie_account_id, incomeStreams, createNessieDeposit])

  // ── Automatic Polling ───────────────────────────────

  useEffect(() => {
    if (!onboarded || !profile.nessie_account_id) return

    // Initial poll on mount
    pollNessie()

    // Set up interval for auto-polling
    const interval = setInterval(() => {
      pollNessie()
    }, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [onboarded, profile.nessie_account_id])

  // ── Runway & AI ─────────────────────────────────────

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
      // Nessie
      syncNessie,
      nessieTransactions,
      fetchNessieTransactions,
      createNessieDeposit,
      createNessiePurchase,
      pollNessie,
      simulatePaycheck,
      lastPoll,
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
