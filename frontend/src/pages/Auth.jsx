import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail, Lock, User as UserIcon, ArrowRight, Loader2, Shield,
  BarChart3, Brain, IdCard, X, Building2, Search, ChevronDown
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useApp, clearStorage } from '../store.jsx'
import { api } from '../api'
import { signInWithGoogle, firebaseIsConfigured } from '../firebase.js'
import { US_UNIVERSITIES } from '../data/universities.js'

// ─── University list (2,338 US colleges from Hipo dataset) ───────────────────
const UNIVERSITIES = US_UNIVERSITIES



// ─── Google G Icon ────────────────────────────────────────────────────────────
function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ─── Searchable university dropdown ──────────────────────────────────────────
function UniversityPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  // Only filter when the user has typed something — avoids rendering 2,338 rows at once
  const trimmed = query.trim()
  const filtered = trimmed
    ? UNIVERSITIES.filter(u => u.toLowerCase().includes(trimmed.toLowerCase())).slice(0, 80)
    : []
  const hasQuery = trimmed.length > 0

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function select(uni) {
    onChange(uni)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="input-field !py-3 !rounded-2xl !text-sm w-full flex items-center justify-between gap-2 text-left"
        style={{ minHeight: 44 }}
      >
        <span className={value ? 'text-g-text' : 'text-g-text-tertiary'}>
          {value || 'Search your university…'}
        </span>
        <ChevronDown size={16} className={`text-g-text-tertiary flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-g-border shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-g-border/60">
            <Search size={14} className="text-g-text-tertiary flex-shrink-0" />
            <input
              type="text"
              className="w-full text-sm font-body outline-none bg-transparent text-g-text placeholder:text-g-text-tertiary"
              placeholder="Type to search…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-g-text-tertiary hover:text-g-text">
                <X size={14} />
              </button>
            )}
          </div>
          {/* Options */}
          <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
            {!hasQuery ? (
              <div className="px-4 py-4 text-center">
                <Search size={16} className="text-g-text-tertiary mx-auto mb-1.5" />
                <p className="text-xs text-g-text-tertiary font-body">Start typing to search <span className="font-semibold text-g-text">{UNIVERSITIES.length.toLocaleString()}</span> US universities</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-g-text-tertiary font-body text-center">No results. Try a different name.</div>
            ) : (
              <>
                {filtered.map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => select(u)}
                    className={`w-full text-left px-4 py-2.5 text-sm font-body transition-colors hover:bg-g-blue-pastel hover:text-g-blue ${value === u ? 'bg-g-blue-pastel text-g-blue font-semibold' : 'text-g-text'}`}
                  >
                    {u}
                  </button>
                ))}
                {filtered.length === 80 && (
                  <p className="text-center text-[10px] text-g-text-tertiary font-mono py-2 border-t border-g-border/40">Showing top 80 results — type more to narrow</p>
                )}
              </>
            )}
          </div>
          {/* Custom entry */}
          {query.trim() && !UNIVERSITIES.includes(query.trim()) && (
            <div className="border-t border-g-border/60">
              <button
                type="button"
                onClick={() => select(query.trim())}
                className="w-full text-left px-4 py-2.5 text-sm font-body text-g-blue hover:bg-g-blue-pastel transition-colors"
              >
                + Use "<strong>{query.trim()}</strong>"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── University modal for Google sign-in ─────────────────────────────────────
function UniversityModal({ user, onConfirm, onClose }) {
  const [university, setUniversity] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm(e) {
    e.preventDefault()
    if (!university.trim()) { setError('Please select your university.'); return }
    setSubmitting(true); setError('')
    try { await onConfirm(university.trim()) }
    catch (err) { setError(err.message || 'Something went wrong.'); setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(15,25,50,0.55)', backdropFilter: 'blur(6px)' }}>
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-g-border/60 p-8"
        style={{ animation: 'slideUpFade 0.3s ease' }}>
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-g-text-tertiary hover:bg-g-bg hover:text-g-text transition-colors">
          <X size={16} />
        </button>
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-g-blue to-g-blue-half flex items-center justify-center mb-3 shadow-lg">
            <Building2 size={22} className="text-white" />
          </div>
          <h2 className="font-display font-bold text-xl text-g-text">Which university do you attend?</h2>
          <p className="font-body text-sm text-g-text-secondary mt-1.5 max-w-xs">
            Hi <span className="font-semibold text-g-text">{user?.displayName?.split(' ')[0] || 'there'}</span>! We personalise your experience based on your campus.
          </p>
        </div>
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-g-red/20 bg-g-red-pastel/50 px-4 py-3">
            <span className="text-g-red text-xs font-bold mt-0.5">!</span>
            <p className="text-xs font-body text-g-red">{error}</p>
          </div>
        )}
        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <label className="font-body text-xs font-semibold text-g-text-secondary mb-1.5 block tracking-wide">University</label>
            <UniversityPicker value={university} onChange={setUniversity} />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-g-blue text-white font-body text-sm font-semibold shadow-lg shadow-g-blue/20 hover:bg-[#3367d6] transition-all disabled:opacity-60">
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Setting up…</> : <>Continue <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

// ─── InputRow — compact labeled input ────────────────────────────────────────
function InputRow({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="font-body text-[11px] font-semibold text-g-text-secondary mb-1 block tracking-wide">{label}</label>
      <div className="relative group">
        {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-g-text-tertiary group-focus-within:text-g-blue transition-colors pointer-events-none" />}
        {children}
      </div>
    </div>
  )
}

// ─── Main Auth page ───────────────────────────────────────────────────────────
export default function Auth() {
  const navigate = useNavigate()
  const { login, completeOnboarding } = useApp()

  const [mode, setMode] = useState('signup')
  const [name, setName] = useState('')
  const [university, setUniversity] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null)

  const isSignIn = mode === 'signin'

  // ── Email/password sign-in ────────────────────────────────────────────────
  async function handleSignIn(e) {
    e.preventDefault(); setError('')
    const identifier = email.trim()
    if (!identifier || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    try {
      const result = await api.login({ identifier, password })
      clearStorage()
      login({ email: result.email, name: result.name, user_id: result.user_id, student_id: result.student_id, is_premium: result.is_premium ?? false })
      if (result.profile_data) {
        completeOnboarding({ profile: result.profile_data.profile, incomeStreams: result.profile_data.income_streams ?? [], expenses: result.profile_data.expenses ?? [] })
        navigate('/dashboard')
      } else { navigate('/onboarding') }
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('401')) {
        try {
          const detail = JSON.parse(msg.split(': ').slice(1).join(': '))
          setError(detail.detail || 'Invalid credentials.')
        } catch { setError(msg.includes('No account') ? 'No account found. Please sign up.' : 'Incorrect password.') }
      } else { setError('Unable to connect to server. Please try again.') }
    } finally { setLoading(false) }
  }

  // ── Email/password sign-up ────────────────────────────────────────────────
  async function handleSignUp(e) {
    e.preventDefault(); setError('')
    if (!name.trim()) { setError('Please enter your name.'); return }
    if (!university.trim()) { setError('Please select your university.'); return }
    if (!email.trim()) { setError('Please enter your email.'); return }
    if (!password || password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    try {
      const result = await api.signup({ email: email.trim(), password, name: name.trim(), student_id: email.trim(), university: university.trim() })
      clearStorage()
      login({ email: result.email, name: result.name, user_id: result.user_id, student_id: result.student_id, university: university.trim() })
      navigate('/onboarding')
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('409')) {
        try {
          const detail = JSON.parse(msg.split(': ').slice(1).join(': '))
          setError(detail.detail || 'Account already exists.')
        } catch { setError('An account with this email already exists.') }
      } else { setError('Unable to connect to server. Please try again.') }
    } finally { setLoading(false) }
  }

  // ── Google sign-in ────────────────────────────────────────────────────────
  async function handleGoogleSignIn() {
    setGoogleLoading(true); setError('')
    try {
      const result = await signInWithGoogle()
      setPendingGoogleUser(result.user)
    } catch (err) {
      if (err.code === 'auth/not-configured') {
        setError('Firebase is not configured. Add credentials to .env.local and restart.')
      } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        if (err.code === 'auth/popup-blocked') {
          setError('Popup was blocked. Please allow popups for this site.')
        } else {
          setError(`Google sign-in failed: ${err.code || err.message}`);
        }
      }
    } finally { setGoogleLoading(false) }
  }

  async function handleGoogleUniversityConfirm(uni) {
    const fbUser = pendingGoogleUser
    const googleEmail = fbUser.email
    const googleName = fbUser.displayName || googleEmail.split('@')[0]
    const googleUid = fbUser.uid

    try {
      const result = await api.login({ identifier: `google:${googleUid}`, password: googleUid })
      clearStorage()
      login({ email: result.email, name: result.name, user_id: result.user_id, student_id: result.student_id ?? '', is_premium: result.is_premium ?? false, university: uni })
      setPendingGoogleUser(null)
      if (result.profile_data) {
        completeOnboarding({ profile: { ...result.profile_data.profile, university: uni }, incomeStreams: result.profile_data.income_streams ?? [], expenses: result.profile_data.expenses ?? [] })
        navigate('/dashboard')
      } else { navigate('/onboarding') }
    } catch {
      try {
        const result = await api.signup({ email: googleEmail, password: googleUid, name: googleName, student_id: `google:${googleUid}`, university: uni, auth_provider: 'google' })
        clearStorage()
        login({ email: result.email, name: result.name, user_id: result.user_id, student_id: result.student_id ?? `google:${googleUid}`, university: uni })
        setPendingGoogleUser(null)
        navigate('/onboarding')
      } catch (signupErr) {
        const msg = signupErr.message || ''
        if (msg.includes('409')) throw new Error('An account with this email already exists. Please sign in with your password.')
        throw signupErr
      }
    }
  }

  return (
    <>
      {pendingGoogleUser && (
        <UniversityModal user={pendingGoogleUser} onConfirm={handleGoogleUniversityConfirm} onClose={() => setPendingGoogleUser(null)} />
      )}

      {/* Full-viewport two-column layout — no scrolling */}
      <div className="h-screen flex overflow-hidden" style={{ fontFamily: 'inherit' }}>

        {/* ── Left panel ── */}
        <div className="hidden lg:flex lg:w-[48%] xl:w-[50%] relative overflow-hidden flex-col justify-between p-10 xl:p-14"
          style={{ background: 'linear-gradient(140deg, #4285f4 0%, #3367d6 55%, #1a53c2 100%)' }}>
          {/* Blobs */}
          <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.13) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(52,168,83,0.18) 0%, transparent 70%)' }} />

          {/* Logo */}
          <div className="relative z-10">
            <Logo size="small" light={true} />
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col">
            {/* Coin */}
            <div className="relative mb-7 self-start">
              <div className="absolute inset-0 rounded-full bg-[#FFD428]/20 blur-2xl scale-150 animate-pulse pointer-events-none" />
              <img src="/coin-light.svg" alt="CampusCoin" className="coin-spin-3d relative z-10" style={{ width: 96, height: 96 }} />
            </div>

            <h1 className="font-display font-bold text-3xl xl:text-4xl text-white leading-[1.18] tracking-tight mb-3">
              Financial clarity,<br />built for<br /><span className="text-[#fbbc04]">campus life.</span>
            </h1>
            <p className="font-body text-white/65 text-sm leading-relaxed mb-6 max-w-sm">
              Link your Student ID with Capital One, project your runway, and get AI insights designed for students.
            </p>

            {/* Feature chips */}
            <div className="grid grid-cols-2 gap-2 max-w-[300px]">
              {[
                { Icon: IdCard, label: 'Student ID linked' },
                { Icon: Brain, label: 'AI strategist' },
                { Icon: Shield, label: 'Capital One' },
                { Icon: BarChart3, label: '180-day runway' },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 border border-white/10">
                  <Icon size={14} className="text-white/80 flex-shrink-0" />
                  <span className="font-body text-white/85 text-[11px] font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 opacity-55">
            <p className="font-body text-[11px] text-white/80 flex items-center gap-2 flex-wrap">
              <a href="https://hackillinois.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">HackIllinois 2026</a>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <a href="https://developer.capitalone.com/nessie-api-guide" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Capital One Nessie API</a>
            </p>
            <p className="font-mono text-[10px] text-white/55 mt-1">
              By{' '}
              <a href="https://github.com/shrestha-sachin" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline underline-offset-2 decoration-white/20">Sachin Shrestha</a>
              {' '}&amp;{' '}
              <a href="https://github.com/Cdguzmanr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline underline-offset-2 decoration-white/20">Carlos Guzman</a>
            </p>
          </div>
        </div>

        {/* ── Right panel — Auth form ── */}
        <div className="flex-1 flex items-center justify-center px-5 bg-gradient-to-br from-g-bg via-white to-g-blue-pastel/30 overflow-y-auto">
          <div className="w-full max-w-[400px] py-6">

            {/* Mobile logo */}
            <div className="flex justify-center mb-5 lg:hidden">
              <Logo size="default" />
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-g-blue/5 border border-g-border/60 p-6">

              {/* Tabs */}
              <div className="flex p-1 rounded-xl bg-g-bg border border-g-border/80 mb-5">
                <button type="button"
                  onClick={() => { setMode('signin'); setError('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-body font-semibold transition-all ${isSignIn ? 'bg-white text-g-text shadow-sm border border-g-border/50' : 'text-g-text-tertiary hover:text-g-text-secondary'}`}>
                  Sign in
                </button>
                <button type="button"
                  onClick={() => { setMode('signup'); setError('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-body font-semibold transition-all ${!isSignIn ? 'bg-white text-g-text shadow-sm border border-g-border/50' : 'text-g-text-tertiary hover:text-g-text-secondary'}`}>
                  Sign up
                </button>
              </div>

              {/* Google button */}
              <button type="button" onClick={handleGoogleSignIn} disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-2xl border-2 border-g-border bg-white hover:bg-g-bg hover:border-g-blue/30 transition-all font-body text-sm font-semibold text-g-text shadow-sm hover:shadow-md disabled:opacity-60 mb-3">
                {googleLoading
                  ? <><Loader2 size={16} className="animate-spin text-g-blue" /> Signing in…</>
                  : <><GoogleIcon size={17} /> Continue with Google</>}
              </button>
              {!firebaseIsConfigured && (
                <p className="text-center font-mono text-[9px] text-amber-600 mb-3">
                  ⚠️ Add Firebase credentials to .env.local to enable Google sign-in
                </p>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-g-border/70" />
                <span className="font-body text-[11px] text-g-text-tertiary font-medium">or</span>
                <div className="flex-1 h-px bg-g-border/70" />
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-2xl border border-g-red/20 bg-g-red-pastel/50 px-3.5 py-2.5">
                  <span className="text-g-red text-xs font-bold mt-0.5 flex-shrink-0">!</span>
                  <p className="text-xs font-body text-g-red leading-snug">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="space-y-3">
                {!isSignIn && (
                  <>
                    <InputRow label="Full Name" icon={UserIcon}>
                      <input type="text"
                        className="input-field !pl-9 !py-2.5 !rounded-2xl !text-sm"
                        placeholder="Your full name"
                        value={name} onChange={e => setName(e.target.value)} />
                    </InputRow>

                    <div>
                      <label className="font-body text-[11px] font-semibold text-g-text-secondary mb-1 block tracking-wide">University</label>
                      <UniversityPicker value={university} onChange={setUniversity} />
                    </div>
                  </>
                )}

                <InputRow label={isSignIn ? 'Email' : 'Email'} icon={Mail}>
                  <input
                    type="email"
                    className="input-field !pl-9 !py-2.5 !rounded-2xl !text-sm"
                    placeholder={isSignIn ? 'you@email.com' : 'your@email.com'}
                    value={email} onChange={e => setEmail(e.target.value)}
                    autoFocus
                  />
                </InputRow>

                <InputRow label="Password" icon={Lock}>
                  <input type="password"
                    className="input-field !pl-9 !py-2.5 !rounded-2xl !text-sm"
                    placeholder={isSignIn ? 'Your password' : 'Min. 8 characters'}
                    value={password} onChange={e => setPassword(e.target.value)} />
                </InputRow>

                <button type="submit" disabled={loading}
                  className="!mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-g-blue text-white font-body text-sm font-semibold shadow-lg shadow-g-blue/20 hover:shadow-xl hover:bg-[#3367d6] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> {isSignIn ? 'Signing in…' : 'Creating account…'}</>
                    : <>{isSignIn ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></>}
                </button>
              </form>

              {/* Footer toggle */}
              <p className="text-center font-body text-xs text-g-text-tertiary mt-4">
                {isSignIn
                  ? <>Don't have an account?{' '}<button type="button" onClick={() => { setMode('signup'); setError('') }} className="text-g-blue font-medium hover:underline">Sign up</button></>
                  : <>Already have an account?{' '}<button type="button" onClick={() => { setMode('signin'); setError('') }} className="text-g-blue font-medium hover:underline">Sign in</button></>}
              </p>
            </div>

            {/* Bottom credits (mobile) */}
            <p className="text-center font-body text-[10px] text-g-text-tertiary mt-5 opacity-60 lg:hidden">
              HackIllinois 2026 · Capital One Nessie API
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
