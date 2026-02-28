import React, { useState } from 'react'
import { Plus, Trash2, Briefcase } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../store.jsx'
import { format, addMonths } from 'date-fns'

const TYPE_LABELS = {
  campus_job: 'Campus Job',
  internship: 'Internship',
  stipend: 'Stipend',
  family: 'Family',
  other: 'Other',
}

const TYPE_CLASSES = {
  campus_job: 'bg-g-green-pastel text-g-green border-g-green/15',
  internship: 'bg-g-blue-pastel text-g-blue border-g-blue/15',
  stipend: 'bg-g-blue-pastel text-g-blue border-g-blue/15',
  family: 'bg-g-yellow-pastel text-g-yellow border-g-yellow/15',
  other: 'bg-g-bg text-g-text-secondary border-g-border',
}

const TODAY = format(new Date(), 'yyyy-MM-dd')
const IN_4MO = format(addMonths(new Date(), 4), 'yyyy-MM-dd')

const BLANK = {
  type: 'campus_job', label: '', hourly_rate: '', weekly_hours: '',
  start_date: TODAY, end_date: IN_4MO, is_lump_sum: false, lump_sum_amount: '', is_active: true,
}

export default function IncomeStreamForm() {
  const { incomeStreams, setIncomeStreams, refreshRunway, refreshAI } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(BLANK)

  async function trigger(streams) {
    const rw = await refreshRunway(streams)
    await refreshAI(rw)
  }

  function toggle(id) {
    const updated = incomeStreams.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s)
    setIncomeStreams(updated)
    trigger(updated)
  }

  function remove(id) {
    const updated = incomeStreams.filter(s => s.id !== id)
    setIncomeStreams(updated)
    trigger(updated)
  }

  function save() {
    if (!form.label.trim()) return
    const newStream = {
      ...form, id: uuidv4(),
      hourly_rate: Number(form.hourly_rate) || 0,
      weekly_hours: Number(form.weekly_hours) || 0,
      lump_sum_amount: form.is_lump_sum ? Number(form.lump_sum_amount) || 0 : null,
    }
    const updated = [...incomeStreams, newStream]
    setIncomeStreams(updated)
    setShowAdd(false)
    setForm(BLANK)
    trigger(updated)
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-g-green-pastel flex items-center justify-center">
            <Briefcase size={16} className="text-g-green" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-g-text text-sm">Income</h3>
            <p className="font-mono text-[10px] text-g-text-tertiary mt-0.5">Toggle for what-if</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-g-blue text-white font-body text-xs font-medium hover:bg-[#3367d6] transition-all shadow-sm"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {incomeStreams.map(s => (
          <div
            key={s.id}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${s.is_active ? 'bg-g-surface border-g-border' : 'bg-g-bg border-g-border opacity-50'
              }`}
          >
            <input
              type="checkbox" checked={s.is_active} onChange={() => toggle(s.id)}
              className="w-4 h-4 rounded accent-g-blue cursor-pointer flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-body text-g-text text-[13px] truncate">{s.label}</p>
              <p className="font-mono text-[10px] text-g-text-tertiary mt-0.5">
                {s.is_lump_sum ? `$${s.lump_sum_amount?.toLocaleString()} lump sum` : `$${s.hourly_rate}/hr × ${s.weekly_hours}h/wk`}
              </p>
            </div>
            <span className={`hidden sm:inline px-2 py-0.5 rounded-full border text-[10px] font-mono ${TYPE_CLASSES[s.type]}`}>
              {TYPE_LABELS[s.type]}
            </span>
            <button onClick={() => remove(s.id)} className="text-g-text-tertiary hover:text-g-red transition-colors p-1 rounded-lg hover:bg-g-red-pastel/40 flex-shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="border border-g-border rounded-xl p-4 space-y-3 bg-g-bg/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Label</label>
              <input type="text" placeholder="e.g. Library Job" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="input-field" />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" checked={form.is_lump_sum} onChange={e => setForm(f => ({ ...f, is_lump_sum: e.target.checked }))} className="w-4 h-4 rounded accent-g-blue" />
            <span className="font-body text-sm text-g-text-secondary">Lump sum payment</span>
          </label>

          {form.is_lump_sum ? (
            <div>
              <label className="label">Total Amount ($)</label>
              <input type="number" placeholder="12000" value={form.lump_sum_amount} onChange={e => setForm(f => ({ ...f, lump_sum_amount: e.target.value }))} className="input-field" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Hourly Rate ($)</label>
                <input type="number" placeholder="14.00" value={form.hourly_rate} onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Hours/Week</label>
                <input type="number" placeholder="12" value={form.weekly_hours} onChange={e => setForm(f => ({ ...f, weekly_hours: e.target.value }))} className="input-field" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="input-field" />
            </div>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button onClick={save} className="flex-1 py-2.5 rounded-full bg-g-blue text-white font-body text-sm font-medium hover:bg-[#3367d6] transition-all shadow-sm">Save</button>
            <button onClick={() => { setShowAdd(false); setForm(BLANK) }} className="flex-1 py-2.5 rounded-full bg-g-bg text-g-text-secondary font-body text-sm font-medium border border-g-border hover:bg-g-surface transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
