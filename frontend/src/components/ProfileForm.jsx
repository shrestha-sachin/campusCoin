import React, { useState } from 'react'
import { useApp } from '../store.jsx'
import { api } from '../api.js'
import { UserCircle, CreditCard, Target, Save, Check, Plus, X, Camera } from 'lucide-react'

export default function ProfileForm() {
  const { auth, profile, setProfile, incomeStreams, expenses } = useApp()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newGoal, setNewGoal] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  function handleImageUpload(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => handleChange('avatar_url', e.target.result)
      reader.readAsDataURL(file)
    }
  }

  function handleChange(field, value) {
    setProfile(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function addGoal() {
    const g = newGoal.trim()
    if (!g) return
    setProfile(prev => ({ ...prev, financial_goals: [...(prev.financial_goals || []), g] }))
    setNewGoal('')
    setSaved(false)
  }

  function removeGoal(i) {
    setProfile(prev => ({
      ...prev,
      financial_goals: prev.financial_goals.filter((_, idx) => idx !== i),
    }))
    setSaved(false)
  }

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.saveProfile(auth.user_id, {
        profile,
        income_streams: incomeStreams,
        expenses: expenses,
      })
      console.log('[CampusCoin] Profile updated on backend successfully')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Failed to save profile to backend:', err)
      alert("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={saveProfile} className="space-y-5">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-g-blue to-g-blue-half flex items-center justify-center shadow-sm overflow-hidden group cursor-pointer">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={28} className="text-white absolute" />
              )}

              <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10 w-full h-full">
                <Camera size={20} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <h3 className="font-display font-bold text-g-text text-base">Personal Info</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-all shadow-sm ${isEditing ? 'bg-g-blue text-white border-g-blue' : 'bg-g-surface text-g-text-secondary border-g-border hover:bg-g-border/50 hover:text-g-text'}`}
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Name</label>
            <input type="text" value={profile.name} onChange={e => handleChange('name', e.target.value)} readOnly={!isEditing} disabled={!isEditing} className={`input-field ${!isEditing ? 'opacity-60 cursor-not-allowed bg-g-surface' : 'bg-white'}`} />
          </div>
          <div>
            <label className="label">Student ID</label>
            <input type="text" value={profile.student_id || ''} onChange={e => handleChange('student_id', e.target.value)} readOnly={!isEditing} disabled={!isEditing} className={`input-field ${!isEditing ? 'opacity-60 cursor-not-allowed bg-g-surface' : 'bg-white'}`} />
          </div>
          <div>
            <label className="label">University</label>
            <input type="text" value={profile.university} onChange={e => handleChange('university', e.target.value)} readOnly={!isEditing} disabled={!isEditing} className={`input-field ${!isEditing ? 'opacity-60 cursor-not-allowed bg-g-surface' : 'bg-white'}`} />
          </div>
          <div>
            <label className="label">Major</label>
            <input type="text" value={profile.major} onChange={e => handleChange('major', e.target.value)} readOnly={!isEditing} disabled={!isEditing} className={`input-field ${!isEditing ? 'opacity-60 cursor-not-allowed bg-g-surface' : 'bg-white'}`} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Graduation Date</label>
            <input type="date" value={profile.graduation_date} onChange={e => handleChange('graduation_date', e.target.value)} readOnly={!isEditing} disabled={!isEditing} className={`input-field max-w-sm ${!isEditing ? 'opacity-60 cursor-not-allowed bg-g-surface' : 'bg-white'}`} />
          </div>
        </div>
        <p className="font-mono text-[10px] text-g-text-tertiary mt-4 break-words">Account created with Student ID: {profile.student_id || 'N/A'}</p>
      </div>

      {/* Account settings */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-g-yellow to-g-yellow-half flex items-center justify-center shadow-sm">
            <CreditCard size={20} className="text-white" />
          </div>
          <h3 className="font-display font-bold text-g-text text-base">Account Settings</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Current Balance ($)</label><input type="number" value={profile.current_balance} onChange={e => handleChange('current_balance', Number(e.target.value))} className="input-field" /></div>
          <div><label className="label">Capital One Account ID</label><input type="text" value={profile.nessie_account_id || ''} readOnly disabled placeholder="Nessie account ID (optional)" className="input-field opacity-60 cursor-not-allowed bg-g-surface" /></div>
        </div>
      </div>

      {/* Financial goals */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-g-green to-g-green-half flex items-center justify-center shadow-sm">
            <Target size={20} className="text-white" />
          </div>
          <h3 className="font-display font-bold text-g-text text-base">Financial Goals</h3>
        </div>
        <div className="space-y-2.5 mb-4">
          {(profile.financial_goals || []).map((goal, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-g-bg border border-g-border">
              <span className="w-2.5 h-2.5 rounded-full bg-g-green flex-shrink-0" />
              <p className="flex-1 font-body text-g-text text-[15px] truncate">{goal}</p>
              <button type="button" onClick={() => removeGoal(i)} className="text-g-text-tertiary hover:text-g-red p-1.5 rounded-xl hover:bg-g-red-pastel transition-colors flex-shrink-0"><X size={16} /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <input type="text" value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGoal() } }} placeholder="Add a new goal…" className="input-field" />
          <button type="button" onClick={addGoal} className="px-5 py-3 rounded-2xl bg-g-blue text-white flex-shrink-0 shadow-sm hover:shadow-md transition-all">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Save action */}
      <div className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-g-blue/20 bg-gradient-to-r from-g-bg to-g-blue-pastel/30">
        <p className="font-body text-xs text-g-text-secondary">
          Changes will securely sync to your CampusCoin account.
        </p>
        <button
          type="submit"
          disabled={saving || saved}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-body text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${saved
            ? 'bg-g-green text-white hover:bg-g-green/90'
            : 'bg-g-blue text-white hover:bg-[#3367d6] hover:shadow-md'
            }`}
        >
          {saved ? <><Check size={16} /> Saved</> : saving ? 'Saving…' : <><Save size={16} /> Save Profile</>}
        </button>
      </div>
    </form>
  )
}
