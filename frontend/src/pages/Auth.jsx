import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useApp, clearStorage } from '../store.jsx'

export default function Auth() {
  const navigate = useNavigate()
  const { auth, profile, onboarded, login } = useApp()

  const [mode, setMode] = useState(onboarded ? 'signin' : 'signup')
  const [name, setName] = useState(auth.name || profile.name || '')
  const [email, setEmail] = useState(auth.email || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSignIn(e) {
    e.preventDefault()
    setError('')

    if (!onboarded) {
      setError('No saved account found on this device. Please sign up first.')
      return
    }

    login({ email, name: name || profile.name || 'Student' })
    navigate('/dashboard')
  }

  function handleSignUp(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name to continue.')
      return
    }

    // Start a fresh local profile and send user into onboarding
    clearStorage()
    login({ email, name })
    navigate('/onboarding')
  }

  const isSignIn = mode === 'signin'

  return (
    <div className="min-h-screen onboarding-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        {/* Left: hero / marketing */}
        <div className="hidden lg:block slide-in-left">
          <div className="card p-7 bg-g-blue-pastel relative overflow-hidden">
            <div className="absolute -top-10 -right-16 w-56 h-56 rounded-full bg-g-blue-half blur-3xl opacity-40" />
            <div className="relative">
              <Logo size="large" />
              <h1 className="font-display font-bold text-3xl mt-6 tracking-tight text-g-text">
                Smarter money moves,
                <br />
                built for campus life.
              </h1>
              <p className="font-body text-sm text-g-text-secondary mt-3 max-w-sm">
                Create your CampusCoin profile, project your runway, and chat with an AI strategist
                who understands the student lifecycle.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles size={14} />
                  </span>
                  <span className="font-body tracking-wide">AI strategist chat</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles size={14} />
                  </span>
                  <span className="font-body tracking-wide">180-day runway</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles size={14} />
                  </span>
                  <span className="font-body tracking-wide">What-if scenarios</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles size={14} />
                  </span>
                  <span className="font-body tracking-wide">Supermemory profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: auth card */}
        <div className="w-full max-w-md mx-auto fade-up-1">
          <div className="flex items-center justify-center mb-6 lg:mb-4 lg:hidden">
            <Logo size="default" />
          </div>

          <div className="card p-6 sm:p-7 text-g-text">
            {/* Tabs */}
            <div className="flex p-1 rounded-full bg-g-bg border border-g-border mb-6">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-2.5 rounded-full text-sm font-body font-medium transition-all ${
                  isSignIn ? 'bg-g-surface text-g-text shadow-sm' : 'text-g-text-secondary'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2.5 rounded-full text-sm font-body font-medium transition-all ${
                  !isSignIn ? 'bg-g-surface text-g-text shadow-sm' : 'text-g-text-secondary'
                }`}
              >
                Sign up
              </button>
            </div>

            <div className="mb-5">
              <h2 className="font-display font-bold text-xl text-g-text tracking-tight">
                {isSignIn ? 'Welcome back' : 'Create your student profile'}
              </h2>
              <p className="font-body text-xs text-g-text-secondary mt-1.5">
                {isSignIn
                  ? 'Continue where you left off on this device.'
                  : 'We only use this info to personalize your projections.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-g-red/30 bg-g-red-pastel/60 px-3 py-2 text-xs font-body text-g-red">
                {error}
              </div>
            )}

            <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-g-text-tertiary" />
                  <input
                    type="text"
                    className="input-field !pl-10"
                    placeholder="Alex Chen"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label">Email (for identification only)</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-g-text-tertiary" />
                  <input
                    type="email"
                    className="input-field !pl-10"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label">Passphrase</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-g-text-tertiary" />
                  <input
                    type="password"
                    className="input-field !pl-10"
                    placeholder={isSignIn ? 'Enter your passphrase' : 'Set a simple passphrase'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <p className="font-body text-[11px] text-g-text-tertiary mt-1.5">
                  CampusCoin stores everything locally in your browser for this demo — no real authentication yet.
                </p>
              </div>

              <button
                type="submit"
                className="mt-2 w-full flex items-center justify-center gap-2.5 py-3 rounded-full bg-g-blue text-white font-body text-sm font-semibold hover:bg-[#3367d6] hover:shadow-md transition-all hover:scale-[1.01]"
              >
                {isSignIn ? 'Continue to dashboard' : 'Start onboarding'}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

