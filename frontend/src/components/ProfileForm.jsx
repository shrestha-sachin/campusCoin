import React, { useState } from 'react'
import { useApp } from '../store.jsx'
import { UserCircle, CreditCard, Target, Save, Check, Plus, X } from 'lucide-react'

export default function ProfileForm() {
  const { profile, setProfile } = useApp()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newGoal, setNewGoal] = useState('')

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
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={saveProfile} className="space-y-5">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-g-blue to-g-blue-half flex items-center justify-center shadow-sm">
            <UserCircle size={20} className="text-white" />
          </div>
          <h3 className="font-display font-bold text-g-text text-base">Personal Info</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Name</label><input type="text" value={profile.name} readOnly disabled className="input-field opacity-60 cursor-not-allowed bg-g-surface" /></div>
          <div><label className="label">Student ID</label><input type="text" value={profile.student_id || ''} readOnly disabled className="input-field opacity-60 cursor-not-allowed bg-g-surface" /></div>
          <div><label className="label">University</label><input type="text" value={profile.university} readOnly disabled className="input-field opacity-60 cursor-not-allowed bg-g-surface" /></div>
          <div><label className="label">Major</label><input type="text" value={profile.major} readOnly disabled className="input-field opacity-60 cursor-not-allowed bg-g-surface" /></div>
          <div className="sm:col-span-2"><label className="label">Graduation Date</label><input type="date" value={profile.graduation_date} readOnly disabled className="input-field opacity-60 cursor-not-allowed bg-g-surface max-w-sm" /></div>
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
          <div><label className="label">Capital One Account ID</label><input type="text" value={profile.nessie_account_id || ''} onChange={e => handleChange('nessie_account_id', e.target.value || null)} placeholder="Nessie account ID (optional)" className="input-field" /></div>
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

      {/* Save button */}
      <button
        type="submit"
        disabled={saving || saved}
        className={`w-full py-3.5 rounded-full font-body text-[15px] font-medium transition-all flex items-center justify-center gap-2.5 shadow-sm ${saved
          ? 'bg-g-green text-white'
          : 'bg-g-blue text-white hover:bg-[#3367d6] hover:shadow-md'
          }`}
      >
        {saved ? <><Check size={18} /> Saved</> : saving ? 'Saving…' : <><Save size={16} /> Save Profile</>}
      </button>
    </form>
  )
}
