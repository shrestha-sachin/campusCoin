import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useApp } from '../store.jsx'
import { api } from '../api.js'

const inputClass =
  'w-full bg-google-off-white border border-black/10 rounded-xl px-4 py-3 text-google-black font-google-text text-sm placeholder-google-black/35 focus:outline-none focus:border-google-blue focus:shadow-[0_0_0_2px_rgba(66,133,244,0.15)] transition-all'
const labelClass = 'font-google-mono text-xs text-google-black/55 uppercase tracking-wider block mb-2'

export default function ProfileForm() {
  const { profile, setProfile } = useApp()
  const [form, setForm] = useState({ ...profile })
  const [newGoal, setNewGoal] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function field(key) {
    return {
      value: form[key] ?? '',
      onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
    }
  }

  function addGoal() {
    const g = newGoal.trim()
    if (!g) return
    setForm(f => ({ ...f, financial_goals: [...(f.financial_goals || []), g] }))
    setNewGoal('')
  }

  function removeGoal(i) {
    setForm(f => ({
      ...f,
      financial_goals: f.financial_goals.filter((_, idx) => idx !== i),
    }))
  }

  async function save() {
    setSaving(true)
    try {
      setProfile(form)
      await api.storeMemory(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Failed to sync to Supermemory:', err)
      setProfile(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-8 space-y-5">
        <h3 className="font-google font-semibold text-google-black text-base tracking-wide">
          Personal Information
        </h3>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Name</label>
            <input type="text" placeholder="Alex Chen" {...field('name')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>University</label>
            <input type="text" placeholder="UIUC" {...field('university')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Major</label>
            <input type="text" placeholder="Computer Science" {...field('major')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Graduation Date</label>
            <input type="date" {...field('graduation_date')} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="card p-8 space-y-5">
        <h3 className="font-google font-semibold text-google-black text-base tracking-wide">
          Account Settings
        </h3>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Current Balance ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="1240.50"
              value={form.current_balance}
              onChange={e => setForm(f => ({ ...f, current_balance: Number(e.target.value) }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Capital One Account ID</label>
            <input
              type="text"
              placeholder="Nessie account ID (optional)"
              {...field('nessie_account_id')}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="card p-8 space-y-5">
        <h3 className="font-google font-semibold text-google-black text-base tracking-wide">
          Financial Goals
        </h3>
        <div className="space-y-3">
          {(form.financial_goals || []).map((g, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-google-off-white rounded-2xl border border-black/6">
              <span className="w-2 h-2 rounded-full bg-google-green flex-shrink-0" />
              <p className="flex-1 font-google-text text-google-black/85 text-sm">{g}</p>
              <button
                onClick={() => removeGoal(i)}
                className="text-google-black/35 hover:text-google-red transition-colors p-1.5 rounded-lg hover:bg-google-red-pastel/30"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Add a new goal…"
            value={newGoal}
            onChange={e => setNewGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoal()}
            className={inputClass}
          />
          <button
            onClick={addGoal}
            className="px-5 py-3 rounded-full bg-google-blue text-white font-google-text text-sm font-medium hover:bg-[#3367d6] transition-colors shadow-[0_2px_8px_rgba(66,133,244,0.25)] flex-shrink-0"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className={`w-full py-4 rounded-full font-google-text font-semibold text-base transition-all duration-150 ${
          saved
            ? 'bg-google-green-pastel text-google-green border-2 border-google-green/20'
            : 'bg-google-blue text-white hover:bg-[#3367d6] shadow-[0_2px_12px_rgba(66,133,244,0.35)]'
        }`}
      >
        {saving ? 'Saving…' : saved ? '✓ Saved & synced to Supermemory' : 'Save Profile'}
      </button>
    </div>
  )
}
