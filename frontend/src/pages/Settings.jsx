import React from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileForm from '../components/ProfileForm.jsx'
import { useApp, clearStorage } from '../store.jsx'
import { LogOut, RotateCcw, UserCircle2 } from 'lucide-react'

export default function Settings() {
  const navigate = useNavigate()
  const { auth, profile, logout } = useApp()

  const displayName = auth.name || profile.name || 'Student'
  const displayEmail = auth.email || 'Signed in on this device'

  function handleReset() {
    if (window.confirm('This will clear all your data and restart onboarding. Continue?')) {
      clearStorage()
      window.location.href = '/onboarding'
    }
  }

  function handleSignOut() {
    logout()
    navigate('/auth')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-8 max-w-2xl mx-auto">
      <div className="fade-up-1 mb-5 sm:mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-[28px] text-g-text tracking-tight">Settings</h1>
        <p className="font-body text-g-text-secondary text-sm mt-1">
          Update your profile — changes sync to Supermemory for persistent AI context.
        </p>
      </div>

      {/* Account overview */}
      <div className="fade-up-1 mb-6 card p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-g-blue-pastel flex items-center justify-center">
            <UserCircle2 size={24} className="text-g-blue" />
          </div>
          <div>
            <p className="font-display font-semibold text-g-text text-sm">{displayName}</p>
            <p className="font-body text-g-text-secondary text-xs">{displayEmail}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-g-bg text-g-text-secondary font-body text-xs font-medium border border-g-border hover:bg-g-surface hover:text-g-text transition-colors"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <div className="fade-up-2">
        <ProfileForm />
      </div>

      {/* Danger zone */}
      <div className="fade-up-3 mt-6 card p-5 border border-g-red/15">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-g-red-pastel flex items-center justify-center">
            <RotateCcw size={16} className="text-g-red" />
          </div>
          <h3 className="font-display font-semibold text-g-text text-sm">Reset Account</h3>
        </div>
        <p className="font-body text-g-text-secondary text-xs mb-3 leading-relaxed">
          Clear all data and go through onboarding again. This cannot be undone.
        </p>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-g-red-pastel text-g-red font-body text-xs font-medium border border-g-red/20 hover:bg-g-red/10 transition-colors"
        >
          <RotateCcw size={13} /> Reset & Restart
        </button>
      </div>
    </div>
  )
}
