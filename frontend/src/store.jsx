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
  doc_history: [],
}

const EMPTY_AUTH = {
  isAuthenticated: false,
  email: '',
  name: '',
  user_id: '',
  student_id: '',
  is_premium: false,
}

const STORAGE_KEY = 'campuscoin_data'
const POLL_INTERVAL = 120_000 // 2 minutes - balanced for mock data and API limits

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

  // Invalidate old-format AI cache that's missing strategy_points
  const storedAi = stored?.aiInsight
  const validAiInsight = storedAi && Array.isArray(storedAi.strategy_points) ? storedAi : null

  const [onboarded, setOnboarded] = useState(!!stored?.onboarded)
  const [profile, setProfile] = useState(stored?.profile ?? EMPTY_PROFILE)
  const [incomeStreams, setIncomeStreams] = useState(stored?.incomeStreams ?? [])
  const [expenses, setExpenses] = useState(stored?.expenses ?? [])
  const [auth, setAuth] = useState(stored?.auth ?? EMPTY_AUTH)
  const [goals, setGoals] = useState(stored?.goals ?? [])
  const [runway, setRunway] = useState(stored?.runway ?? [])
  const [aiInsight, setAiInsight] = useState(validAiInsight)
  const [loading, setLoading] = useState({ runway: false, ai: false, ingestion: false })
  const [nessieTransactions, setNessieTransactions] = useState([])
  const [nessieBills, setNessieBills] = useState([])
  const [lastPoll, setLastPoll] = useState(null) // timestamp of last poll
  const [academicEvents, setAcademicEvents] = useState(stored?.academicEvents ?? [])

  // Track the last known transaction count so we only trigger AI on changes
  const lastTxnCountRef = useRef(0)
  const saveTimerRef = useRef(null)

  // Persist to localStorage on change
  useEffect(() => {
    saveToStorage({ auth, onboarded, profile, incomeStreams, expenses, goals, runway, aiInsight, academicEvents })
  }, [auth, onboarded, profile, incomeStreams, expenses, goals, runway, aiInsight, academicEvents])


  function login({ email, name, user_id, student_id, is_premium = false }) {
    setAuth({
      isAuthenticated: true,
      email: email?.trim() ?? '',
      name: name?.trim() ?? '',
      user_id: user_id ?? '',
      student_id: student_id ?? '',
      is_premium: is_premium,
    })
  }

  function togglePremium() {
    setAuth(prev => ({ ...prev, is_premium: !prev.is_premium }))
  }

  /** Try to restore profile from backend (for cross-device login) */
  async function restoreFromBackend(userId) {
    try {
      const data = await api.getProfile(userId)
      if (data?.profile) {
        setProfile(data.profile)
        setIncomeStreams(data.income_streams ?? [])
        setExpenses(data.expenses ?? [])
        setGoals(data.goals ?? [])
        setOnboarded(true)
        console.log('[CampusCoin] Profile restored from backend')
        return true
      }
    } catch {
      // Profile not found on backend — that's okay for first-time users
    }
    return false
  }

  function logout() {
    setAuth(EMPTY_AUTH)
    setOnboarded(false)
    setProfile(EMPTY_PROFILE)
    setIncomeStreams([])
    setExpenses([])
    setGoals([])
    setNessieTransactions([])
    clearStorage()
  }

  function completeOnboarding(data) {
    setProfile(data.profile)
    setIncomeStreams(data.incomeStreams)
    setExpenses(data.expenses)
    setGoals(data.goals || [])
    setOnboarded(true)
  }

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

      if (academicEvents.length > 0) {
        // Sort events by start date
        const sortedEvents = [...academicEvents].map(evt => {
          const parts = evt.date_range.split(' - ')
          const startStr = parts[0]?.trim() || ''
          const year = new Date().getFullYear()
          return { ...evt, startDate: new Date(`${startStr}, ${year}`) }
        }).sort((a, b) => a.startDate - b.startDate)

        const adjusted = data.map(point => {
          const pointDate = new Date(point.date)
          let totalAccumulatedImpact = 0

          for (const evt of sortedEvents) {
            if (pointDate >= evt.startDate) {
              // If the point is AFTER the event has started, 
              // we apply the impact based on how much of the event has passed.
              const parts = evt.date_range.split(' - ')
              const endStr = parts[1]?.trim() || ''
              const evtEnd = new Date(`${endStr}, ${new Date().getFullYear()}`)

              if (pointDate >= evtEnd) {
                // Event is fully over, subtract full impact
                totalAccumulatedImpact += evt.financial_impact
              } else {
                // Event is in progress, subtract proportional impact
                const totalDuration = evtEnd - evt.startDate
                const elapsed = pointDate - evt.startDate
                const progress = Math.max(0, Math.min(1, elapsed / totalDuration))
                totalAccumulatedImpact += evt.financial_impact * progress
              }
            }
          }
          return { ...point, projected_balance: point.projected_balance - totalAccumulatedImpact }
        })
        setRunway(adjusted)
        return adjusted
      }

      setRunway(data)
      return data
    } catch (err) {
      console.error('Runway calculation failed:', err)
      return []
    } finally {
      setLoading(prev => ({ ...prev, runway: false }))
    }
  }, [incomeStreams, expenses, profile.current_balance, academicEvents])

  const refreshAI = useCallback(async (runwayData) => {
    if (!auth.is_premium) {
      console.warn('[CampusCoin] AI Advisor is a Premium feature.')
      return null
    }
    setLoading(prev => ({ ...prev, ai: true }))
    try {
      const data = await api.analyzeFinances({
        profile: { ...profile, email: auth.email },
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
  }, [profile.name, profile.university, profile.major, profile.graduation_date, auth.email, auth.is_premium, incomeStreams, expenses])

  const ingestAcademic = useCallback(async (file) => {
    setLoading(prev => ({ ...prev, ingestion: true }))
    try {
      // Compute real work context from active income streams
      const activeStreams = incomeStreams.filter(s => s.is_active && !s.is_lump_sum)
      const weeklyHours = activeStreams.reduce((sum, s) => sum + (s.weekly_hours || 0), 0)
      const hourlyRate = activeStreams.length > 0
        ? activeStreams.reduce((sum, s) => sum + (s.hourly_rate || 13), 0) / activeStreams.length
        : 13
      const data = await api.ingestAcademic(
        file,
        profile.user_id || 'anonymous',
        { weeklyHours, hourlyRate }
      )

      const docMeta = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        upload_date: new Date().toISOString(),
        size: file.size,
        event_count: data.events?.length || 0
      }
      setProfile(prev => ({
        ...prev,
        doc_history: [docMeta, ...(prev.doc_history || [])]
      }))

      setAcademicEvents(data.events || [])
      return data
    } catch (err) {
      console.error('Academic ingestion failed:', err)
      throw err
    } finally {
      setLoading(prev => ({ ...prev, ingestion: false }))
    }
  }, [profile.user_id, incomeStreams, refreshAI])

  // ── Nessie Integration ──────────────────────────────

  // Auto-refresh runway whenever inputs or balance change (debounced)
  useEffect(() => {
    if (!onboarded) return
    const timer = setTimeout(() => {
      refreshRunway()
    }, 400)
    return () => clearTimeout(timer)
  }, [onboarded, incomeStreams, expenses, profile.current_balance, refreshRunway])

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

  /** Fetch Nessie bills (scheduled payments). */
  const fetchNessieBills = useCallback(async () => {
    if (!profile.nessie_account_id) return
    try {
      const bills = await api.getNessieBills(profile.nessie_account_id)
      setNessieBills(bills)
    } catch (err) {
      console.error('Nessie bills fetch failed:', err)
    }
  }, [profile.nessie_account_id])

  /** Full poll cycle: sync balance → fetch txns → trigger AI only if new txns */
  const pollNessie = useCallback(async () => {
    if (!profile.nessie_account_id) return

    await syncNessie()
    const hasNew = await fetchNessieTransactions()
    await fetchNessieBills()

    if (hasNew) {
      console.log('[CampusCoin] New Nessie transaction detected — running AI analysis')
      await refreshAI() // Runway updates automatically due to our new useEffect watching balance
    }
  }, [profile.nessie_account_id, syncNessie, fetchNessieTransactions, fetchNessieBills, refreshAI])

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


  /** Create a Nessie bill (scheduled expense). */
  const createNessieBill = useCallback(async (amount, payee, payment_date, recurring_date) => {
    if (!profile.nessie_account_id) return null
    try {
      const result = await api.createNessieBill({
        account_id: profile.nessie_account_id,
        amount,
        payee,
        payment_date,
        recurring_date,
      })
      // Immediately poll to pick up the new bill
      await pollNessie()
      return result
    } catch (err) {
      console.error('Nessie bill creation failed:', err)
      return null
    }
  }, [profile.nessie_account_id, pollNessie])


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



  // ── Persistence & Observers (placed at end to avoid TDZ errors) ──────

  // Persist to backend (Modal Dict) — debounced 2s after last change
  useEffect(() => {
    if (!onboarded || !profile.user_id) return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      api.saveProfile(profile.user_id, {
        profile,
        income_streams: incomeStreams,
        expenses,
        goals,
      }).then(() => {
        console.log('[CampusCoin] Profile saved to backend')
      }).catch(err => {
        console.warn('[CampusCoin] Backend save failed (data safe in localStorage):', err.message)
      })
    }, 2000)

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [onboarded, profile, incomeStreams, expenses, goals])

  // ── Global Observer: Auto-Refresh AI on major USER edits ─────────────
  useEffect(() => {
    // Only trigger if onboarded and not already loading.
    // We EXCLUDE balance and transaction count here because Nessie polling 
    // already triggers refreshAI() selectively when new data arrives.
    if (!onboarded || !profile.user_id || loading.ai || loading.ingestion) return

    const timer = setTimeout(async () => {
      console.log('[CampusCoin] User data change detected — auto-refiring AI Advisor')
      const freshRunway = await refreshRunway()
      await refreshAI(freshRunway)
    }, 60000) // 60s debounce - prevents loop and excessive AI calls

    return () => clearTimeout(timer)
    // We intentionally exclude refreshAI and refreshRunway from deps 
    // to avoid recursive triggers when their identities change due to state updates they perform.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    incomeStreams,
    expenses,
    academicEvents,
    profile.name,
    profile.university,
    profile.major,
    profile.financial_goals,
    onboarded,
    profile.user_id
  ])

  return (
    <AppContext.Provider value={{
      auth,
      login,
      logout,
      restoreFromBackend,
      onboarded, setOnboarded, completeOnboarding,
      profile, setProfile,
      incomeStreams, setIncomeStreams,
      expenses, setExpenses,
      goals, setGoals,
      runway, setRunway,
      aiInsight, setAiInsight,
      loading,
      refreshRunway,
      refreshAI,
      // Academic Ingestion
      academicEvents, setAcademicEvents,
      ingestAcademic,
      // Nessie
      syncNessie,
      nessieTransactions,
      fetchNessieTransactions,
      createNessieDeposit,
      createNessiePurchase,
      createNessieBill,
      pollNessie,
      lastPoll,
      // Premium
      togglePremium,
      // Nessie Bills
      nessieBills,
      fetchNessieBills,
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
