import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileForm from '../components/ProfileForm.jsx'
import DocumentHistory from '../components/DocumentHistory.jsx'
import { useApp, clearStorage } from '../store.jsx'
import { LogOut, RotateCcw, UserCircle2, Lock, KeyRound, Loader2, Check, Trash2, Bell, Moon, Download, Settings2, ExternalLink, AlertCircle } from 'lucide-react'
import { api } from '../api'
import {
  auth as firebaseAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from '../firebase.js'

function validatePassword(pass) {
  if (pass.length < 8) return "Password must be at least 8 characters long."
  if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter."
  if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter."
  if (!/[0-9]/.test(pass)) return "Password must contain at least one number."
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password must contain at least one special character."
  return null
}

function PasswordChange() {
  const { auth } = useApp()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Determine if the user is a Google user
  const isGoogleUser = firebaseAuth.currentUser?.providerData.some(p => p.providerId === 'google.com')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!currentPassword || !newPassword) {
      setError('Please fill out both fields.')
      return
    }

    const passError = validatePassword(newPassword)
    if (passError) {
      setError(passError)
      return
    }

    setLoading(true)
    try {
      const user = firebaseAuth.currentUser
      if (!user) throw new Error("No user signed in.")

      // 1. Re-authenticate (required by Firebase for sensitive actions)
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // 2. Update password
      await updatePassword(user, newPassword)

      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('invalid-credential') || msg.includes('auth/wrong-password')) {
        setError('Current password is incorrect.')
      } else if (msg.includes('requires-recent-login')) {
        setError('Security threshold reached. Please sign out and sign back in to change your password.')
      } else {
        setError(msg.includes('auth/') ? `Auth error: ${msg}` : 'Failed to update password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (isGoogleUser) {
    return (
      <div className="card p-5 pt-8 sm:p-6 mb-6 opacity-80">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-g-blue-pastel flex items-center justify-center shadow-sm">
            <KeyRound size={20} className="text-g-blue" />
          </div>
          <h3 className="font-display font-bold text-g-text text-base">Password</h3>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-g-bg border border-g-border/60">
          <AlertCircle size={18} className="text-g-blue mt-0.5 flex-shrink-0" />
          <p className="text-xs font-body text-g-text-secondary leading-relaxed">
            You're signed in via **Google**. To change your password, please visit your <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-g-blue font-semibold hover:underline">Google Security settings</a>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5 pt-8 sm:p-6 mb-6">
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

  const [isDeleting, setIsDeleting] = useState(false)

  function handleReset() {
    if (window.confirm('This will clear all your data and restart onboarding. Continue?')) {
      clearStorage()
      window.location.href = '/onboarding'
    }
  }

  async function handleDeleteAccount() {
    if (window.confirm('WARNING: This will permanently delete your account, profile data, and remove you from the system. This cannot be undone. Are you absolutely sure?')) {
      setIsDeleting(true)
      try {
        const user = firebaseAuth.currentUser
        if (!user) throw new Error("No user signed in.")

        // 1. Delete from Backend (Modal)
        await api.deleteAccount({ firebase_uid: user.uid })

        // 2. Delete from Firebase
        try {
          await deleteUser(user)
        } catch (fbErr) {
          if (fbErr.message.includes('requires-recent-login')) {
            alert('For security, deleting your account requires a recent login. Please sign out, sign back in, and try again.')
            setIsDeleting(false)
            return
          }
          throw fbErr
        }

        clearStorage()
        window.location.href = '/auth'
      } catch (err) {
        console.error(err)
        alert(`Failed to delete account: ${err.message || 'Please try again.'}`)
        setIsDeleting(false)
      }
    }
  }

  function handleSignOut() {
    logout()
    navigate('/auth')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-5xl mx-auto pb-24">
      <div className="fade-up-1 mb-2 sm:mb-4">
        <h1 className="font-display font-bold text-2xl sm:text-[28px] text-g-text tracking-tight">Settings</h1>
        <p className="font-body text-g-text-secondary text-sm mt-1">
          Manage your account and update your preferences.
        </p>
      </div>

      {/* Account overview */}
      <div className="fade-up-1 card p-5 flex items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-g-blue-pastel flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle2 size={24} className="text-g-blue" />
              )}
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

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6 items-start">

        {/* Left Column (Main) */}
        <div className="lg:col-span-3 space-y-5 sm:space-y-6 fade-up-2">
          <ProfileForm />
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6 fade-up-3">
          <PasswordChange />
          <DocumentHistory />

          {/* Danger zone */}
          <div className="card border border-g-red/15 overflow-hidden">
            {/* Reset internal cache */}
            <div className="p-5 border-b border-g-border/50 bg-g-surface/50">
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-g-bg text-g-red font-body text-xs font-medium border border-g-border hover:bg-g-red-pastel transition-colors"
              >
                <RotateCcw size={13} /> Clear Cache
              </button>
            </div>

            {/* Delete permanent account */}
            <div className="p-5 bg-white">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-g-red flex items-center justify-center">
                  <Trash2 size={16} className="text-white" />
                </div>
                <h3 className="font-display font-semibold text-g-red text-sm">Delete Account</h3>
              </div>
              <p className="font-body text-g-text-secondary text-xs mb-4 leading-relaxed max-w-md">
                Permanently delete your account, data, and unlink your Student ID. Cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-g-red text-white font-body text-xs font-medium shadow-sm hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                {isDeleting ? 'Deleting...' : 'Delete Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
