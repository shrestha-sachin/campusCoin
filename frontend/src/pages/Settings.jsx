import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileForm from '../components/ProfileForm.jsx'
import { useApp, clearStorage } from '../store.jsx'
import { LogOut, RotateCcw, UserCircle2, Lock, KeyRound, Loader2, Check } from 'lucide-react'
import { api } from '../api'

function PasswordChange() {
  const { auth } = useApp()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!currentPassword || !newPassword) {
      setError('Please fill out both fields.')
      return
    }
    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters.')
      return
    }

    setLoading(true)
    try {
      await api.changePassword({
        email: auth.email,
        current_password: currentPassword,
        new_password: newPassword,
      })
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('401')) {
        setError('Current password is incorrect.')
      } else {
        setError('Failed to update password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-g-text to-g-text-secondary flex items-center justify-center shadow-sm">
          <KeyRound size={20} className="text-white" />
        </div>
        <h3 className="font-display font-bold text-g-text text-base">Change Password</h3>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-g-red/20 bg-g-red-pastel/50 px-4 py-3">
          <p className="text-xs font-body text-g-red leading-relaxed">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-g-green/20 bg-g-green-pastel/50 px-4 py-3">
          <Check size={16} className="text-g-green flex-shrink-0" />
          <p className="text-xs font-body text-g-green leading-relaxed">Password updated successfully.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-body text-xs font-semibold text-g-text-secondary mb-1.5 block tracking-wide">Current Password</label>
          <div className="relative group">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-g-text-tertiary group-focus-within:text-g-text transition-colors" />
            <input
              type="password"
              className="input-field !pl-11 border-g-border/60 hover:border-g-border bg-g-surface focus:bg-white"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="font-body text-xs font-semibold text-g-text-secondary mb-1.5 block tracking-wide">New Password</label>
          <div className="relative group">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-g-text-tertiary group-focus-within:text-g-text transition-colors" />
            <input
              type="password"
              className="input-field !pl-11 border-g-border/60 hover:border-g-border bg-g-surface focus:bg-white"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-g-text text-white font-body text-sm font-semibold shadow-sm hover:bg-g-text-secondary transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  )
}

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto pb-24">
      <div className="fade-up-1 mb-5 sm:mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-[28px] text-g-text tracking-tight">Settings</h1>
        <p className="font-body text-g-text-secondary text-sm mt-1">
          Manage your account and update your preferences.
        </p>
      </div>

      {/* Account overview */}
      <div className="fade-up-1 mb-6 card p-5 flex items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-g-blue-pastel flex items-center justify-center">
              <UserCircle2 size={24} className="text-g-blue" />
            </div>
            <div>
              <p className="font-display font-semibold text-g-text text-sm">{displayName}</p>
              <p className="font-body text-g-text-secondary text-xs">{displayEmail}</p>
            </div>
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-auto">
            <button
              onClick={handleSignOut}
              className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-full bg-g-bg text-g-text-secondary font-body text-xs font-medium border border-g-border hover:bg-g-surface hover:text-g-text transition-colors"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="fade-up-2">
        <ProfileForm />
      </div>

      <div className="fade-up-2">
        <PasswordChange />
      </div>

      {/* Danger zone */}
      <div className="fade-up-3 card p-5 border border-g-red/15">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-g-red-pastel flex items-center justify-center">
            <RotateCcw size={16} className="text-g-red" />
          </div>
          <h3 className="font-display font-semibold text-g-text text-sm">Reset Device Data</h3>
        </div>
        <p className="font-body text-g-text-secondary text-xs mb-4 leading-relaxed max-w-md">
          Clear local storage cache. Your data remains safe on the cloud.
        </p>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-g-red-pastel text-g-red font-body text-xs font-medium border border-g-red/20 hover:bg-g-red/10 transition-colors"
        >
          <RotateCcw size={13} /> Clear Cache & Log Out
        </button>
      </div>
    </div>
  )
}
