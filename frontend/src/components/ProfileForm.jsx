import React, { useState } from 'react'
import { Plus, X, Check, Save, Target, UserCircle, CreditCard } from 'lucide-react'
import { useApp } from '../store.jsx'
import { api } from '../api.js'

export default function ProfileForm() {
  const { profile, setProfile } = useApp()
  const [form, setForm] = useState({ ...profile })
  const [newGoal, setNewGoal] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function field(key) {
    return { value: form[key] ?? '', onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) }
  }

  function addGoal() {
    const g = newGoal.trim()
    if (!g) return
    setForm(f => ({ ...f, financial_goals: [...(f.financial_goals || []), g] }))
    setNewGoal('')
  }

  function removeGoal(i) {
    setForm(f => ({ ...f, financial_goals: f.financial_goals.filter((_, idx) => idx !== i) }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      setProfile(form)
      await api.storeMemory(form)
    } catch (err) {
      console.error('Sync failed:', err)
      setProfile(form)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setSaving(false)
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Personal Info */}
      <div className="card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-g-blue-pastel flex items-center justify-center">
            <UserCircle size={16} className="text-g-blue" />
          </div>
          <h3 className="font-display font-semibold text-g-text text-sm">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div><label className="label">Name</label><input type="text" placeholder="Alex Chen" {...field('name')} className="input-field" /></div>
          <div><label className="label">University</label><input type="text" placeholder="UIUC" {...field('university')} className="input-field" /></div>
          <div><label className="label">Major</label><input type="text" placeholder="Computer Science" {...field('major')} className="input-field" /></div>
          <div><label className="label">Graduation Date</label><input type="date" {...field('graduation_date')} className="input-field" /></div>
        </div>
      </div>

      {/* Account */}
      <div className="card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-g-yellow-pastel flex items-center justify-center">
            <CreditCard size={16} className="text-g-yellow" />
          </div>
          <h3 className="font-display font-semibold text-g-text text-sm">Account Settings</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="label">Current Balance ($)</label>
            <input type="number" step="0.01" placeholder="1240.50" value={form.current_balance}
              onChange={e => setForm(f => ({ ...f, current_balance: Number(e.target.value) }))} className="input-field" />
          </div>
          <div>
            <label className="label">Capital One Account ID</label>
            <input type="text" placeholder="Nessie account ID (optional)" {...field('nessie_account_id')} className="input-field" />
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-g-green-pastel flex items-center justify-center">
            <Target size={16} className="text-g-green" />
          </div>
          <h3 className="font-display font-semibold text-g-text text-sm">Financial Goals</h3>
        </div>
        <div className="space-y-2">
          {(form.financial_goals || []).map((g, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 bg-g-bg rounded-xl border border-g-border">
              <span className="w-1.5 h-1.5 rounded-full bg-g-green flex-shrink-0" />
              <p className="flex-1 font-body text-g-text text-sm min-w-0 truncate">{g}</p>
              <button onClick={() => removeGoal(i)} className="text-g-text-tertiary hover:text-g-red transition-colors p-1 rounded-lg hover:bg-g-red-pastel/40 flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Add a new goal…" value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGoal()} className="input-field" />
          <button onClick={addGoal} className="px-4 py-2.5 rounded-xl bg-g-blue text-white font-body text-sm font-medium hover:bg-[#3367d6] transition-all shadow-sm flex-shrink-0">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-3 sm:py-3.5 rounded-full font-body font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${saved
            ? 'bg-g-green-pastel text-g-green border border-g-green/20'
            : 'bg-g-blue text-white hover:bg-[#3367d6] shadow-sm hover:shadow-md'
          }`}
      >
        {saving ? <><Save size={15} className="animate-pulse" /> Saving…</>
          : saved ? <><Check size={15} /> Saved</>
            : <><Save size={15} /> Save Profile</>}
      </button>
    </div>
  )
}
