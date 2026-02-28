import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, Shield, Zap, BarChart3, Brain, GraduationCap, IdCard } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useApp, clearStorage } from '../store.jsx'
import { api } from '../api'

function FeatureChip({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm">
      <Icon size={14} className="text-g-blue flex-shrink-0" />
      <span className="font-body text-xs text-g-text font-medium">{text}</span>
    </div>
  )
}

export default function Auth() {
  const navigate = useNavigate()
  const { login, completeOnboarding } = useApp()

  const [mode, setMode] = useState('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignIn(e) {
    e.preventDefault()
    setError('')

    const identifier = email.trim()
    if (!identifier || !password) {
      setError('Please enter your email (or Student ID) and password.')
      return
    }

    setLoading(true)
    try {
      const result = await api.login({ identifier, password })

      login({
        email: result.email,
        name: result.name,
        user_id: result.user_id,
        student_id: result.student_id,
      })

      if (result.profile_data) {
        completeOnboarding({
          profile: result.profile_data.profile,
          incomeStreams: result.profile_data.income_streams ?? [],
          expenses: result.profile_data.expenses ?? [],
        })
        navigate('/dashboard')
      } else {
        navigate('/onboarding')
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('401')) {
        try {
          const detail = JSON.parse(msg.split(': ').slice(1).join(': '))
          setError(detail.detail || 'Invalid credentials.')
        } catch {
          setError(msg.includes('No account') ? 'No account found. Please sign up first.' : 'Incorrect password.')
        }
      } else {
        setError('Unable to connect to server. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!studentId.trim()) {
      setError('Please enter your university Student ID.')
      return
    }
    if (!email.trim()) {
      setError('Please enter your university email.')
      return
    }
    if (!email.trim().toLowerCase().endsWith('.edu')) {
      setError('Please use your university email (.edu) to sign up.')
      return
    }
    if (!password || password.length < 4) {
      setError('Please set a password (at least 4 characters).')
      return
    }

    setLoading(true)
    try {
      const result = await api.signup({
        email: email.trim(),
        password,
        name: name.trim(),
        student_id: studentId.trim(),
      })

      clearStorage()
      login({
        email: result.email,
        name: result.name,
        user_id: result.user_id,
        student_id: result.student_id,
      })
      navigate('/onboarding')
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('409')) {
        try {
          const detail = JSON.parse(msg.split(': ').slice(1).join(': '))
          setError(detail.detail || 'Account already exists.')
        } catch {
          setError('An account with this email or Student ID already exists.')
        }
      } else {
        setError('Unable to connect to server. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isSignIn = mode === 'signin'

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel — Hero / Branding */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4285f4 0%, #3367d6 50%, #1a53c2 100%)',
        }}
      >
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)' }} />
          <div className="absolute top-1/3 -left-20 w-72 h-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-24 right-1/4 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(52,168,83,0.15) 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Top — Logo */}
          <div>
            <div className="flex items-center gap-3">
              <svg width={44} height={44} viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" fill="white" fillOpacity="0.2" />
                <circle cx="20" cy="20" r="13" fill="white" fillOpacity="0.15" />
                <text x="20" y="26" textAnchor="middle" fill="white" fontFamily="GoogleSans, sans-serif" fontWeight="700" fontSize="18">$</text>
              </svg>
              <span className="font-display font-bold text-2xl text-white tracking-tight">
                CampusCoin
              </span>
            </div>
          </div>

          {/* Center — Hero text */}
          <div className="my-auto">
            <h1 className="font-display font-bold text-4xl xl:text-5xl text-white leading-[1.15] tracking-tight">
              Financial clarity,
              <br />
              built for
              <br />
              <span className="text-[#fbbc04]">campus life.</span>
            </h1>
            <p className="font-body text-white/70 text-base mt-5 max-w-md leading-relaxed">
              Link your Student ID with Capital One, project your runway,
              and get AI insights designed for the student lifecycle.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-8 max-w-sm">
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                  <IdCard size={16} className="text-white" />
                </div>
                <span className="font-body text-white/90 text-xs font-medium">Student ID linked</span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                  <Brain size={16} className="text-white" />
                </div>
                <span className="font-body text-white/90 text-xs font-medium">AI strategist</span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                  <Shield size={16} className="text-white" />
                </div>
                <span className="font-body text-white/90 text-xs font-medium">Capital One linked</span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                  <BarChart3 size={16} className="text-white" />
                </div>
                <span className="font-body text-white/90 text-xs font-medium">180-day runway</span>
              </div>
            </div>
          </div>

          {/* Bottom — Trust signals */}
          <div className="flex items-center gap-3">
            <GraduationCap size={18} className="text-white/50" />
            <span className="font-mono text-[11px] text-white/40 tracking-wide">
              Built for HackIllinois 2025 · Powered by Capital One Nessie API
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 bg-gradient-to-br from-g-bg via-white to-g-blue-pastel/30">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex items-center justify-center mb-8 lg:hidden">
            <Logo size="large" />
          </div>

          {/* Auth card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-g-blue/5 border border-g-border/60 p-7 sm:p-8">
            {/* Tabs */}
            <div className="flex p-1 rounded-2xl bg-g-bg border border-g-border/80 mb-7">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError('') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-body font-semibold transition-all duration-200 ${isSignIn
                    ? 'bg-white text-g-text shadow-sm border border-g-border/50'
                    : 'text-g-text-tertiary hover:text-g-text-secondary'
                  }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError('') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-body font-semibold transition-all duration-200 ${!isSignIn
                    ? 'bg-white text-g-text shadow-sm border border-g-border/50'
                    : 'text-g-text-tertiary hover:text-g-text-secondary'
                  }`}
              >
                Sign up
              </button>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h2 className="font-display font-bold text-2xl text-g-text tracking-tight">
                {isSignIn ? 'Welcome back' : 'Get started'}
              </h2>
              <p className="font-body text-sm text-g-text-secondary mt-1.5 leading-relaxed">
                {isSignIn
                  ? 'Use your email or Student ID to sign in.'
                  : 'Create an account with your university credentials.'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-g-red/20 bg-g-red-pastel/50 px-4 py-3">
                <div className="w-5 h-5 rounded-full bg-g-red/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-g-red text-xs font-bold">!</span>
                </div>
                <p className="text-xs font-body text-g-red leading-relaxed">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="space-y-4">
              {!isSignIn && (
                <>
                  <div>
                    <label className="font-body text-xs font-semibold text-g-text-secondary mb-1.5 block tracking-wide">Full Name</label>
                    <div className="relative group">
                      <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-g-text-tertiary group-focus-within:text-g-blue transition-colors" />
                      <input
                        type="text"
                        className="input-field !pl-11 !py-3.5 !rounded-2xl !text-sm"
                        placeholder="Your full name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-body text-xs font-semibold text-g-text-secondary mb-1.5 block tracking-wide">University Student ID</label>
                    <div className="relative group">
                      <IdCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-g-text-tertiary group-focus-within:text-g-blue transition-colors" />
                      <input
                        type="text"
                        className="input-field !pl-11 !py-3.5 !rounded-2xl !text-sm"
                        placeholder="e.g. STU-2024-0001"
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                      />
                    </div>
                    <p className="font-mono text-[10px] text-g-text-tertiary mt-1.5 ml-1">
                      Linked to your Capital One banking account
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="font-body text-xs font-semibold text-g-text-secondary mb-1.5 block tracking-wide">
                  {isSignIn ? 'Email or Student ID' : 'University Email'}
                </label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-g-text-tertiary group-focus-within:text-g-blue transition-colors" />
                  <input
                    type={isSignIn ? 'text' : 'email'}
                    className="input-field !pl-11 !py-3.5 !rounded-2xl !text-sm"
                    placeholder={isSignIn ? 'you@university.edu or STU-2024-0001' : 'name@university.edu'}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>
                {!isSignIn && (
                  <p className="font-mono text-[10px] text-g-text-tertiary mt-1.5 ml-1">
                    Only .edu emails are accepted
                  </p>
                )}
              </div>

              <div>
                <label className="font-body text-xs font-semibold text-g-text-secondary mb-1.5 block tracking-wide">Password</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-g-text-tertiary group-focus-within:text-g-blue transition-colors" />
                  <input
                    type="password"
                    className="input-field !pl-11 !py-3.5 !rounded-2xl !text-sm"
                    placeholder={isSignIn ? 'Enter your password' : 'Min. 4 characters'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="!mt-6 w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-g-blue text-white font-body text-sm font-semibold shadow-lg shadow-g-blue/25 hover:shadow-xl hover:shadow-g-blue/30 hover:bg-[#3367d6] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> {isSignIn ? 'Signing in…' : 'Creating account…'}</>
                ) : (
                  <>{isSignIn ? 'Sign in' : 'Create account'} <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center font-body text-xs text-g-text-tertiary mt-6">
              {isSignIn ? (
                <>Don't have an account?{' '}
                  <button type="button" onClick={() => { setMode('signup'); setError('') }} className="text-g-blue font-medium hover:underline">
                    Sign up
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('signin'); setError('') }} className="text-g-blue font-medium hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Mobile — Feature chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-6 lg:hidden">
            <FeatureChip icon={IdCard} text="Student ID linked" />
            <FeatureChip icon={Brain} text="AI strategist" />
            <FeatureChip icon={Shield} text="Capital One" />
          </div>

          <p className="text-center font-mono text-[10px] text-g-text-tertiary mt-6 lg:mt-8">
            Built for HackIllinois 2025 · Powered by Capital One Nessie API
          </p>
        </div>
      </div>
    </div>
  )
}
