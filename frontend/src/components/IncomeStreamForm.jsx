import React, { useState } from 'react'
import { Plus, Trash2, Briefcase } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../store.jsx'
import { format, addMonths } from 'date-fns'

const TYPE_LABELS = { campus_job: 'Campus Job', internship: 'Internship', stipend: 'Stipend', family: 'Family', other: 'Other' }
const TYPE_CLASSES = {
  campus_job: 'bg-g-green-pastel text-g-green border-g-green/15',
  internship: 'bg-g-blue-pastel text-g-blue border-g-blue/15',
  stipend: 'bg-g-blue-pastel text-g-blue border-g-blue/15',
  family: 'bg-g-yellow-pastel text-g-yellow border-g-yellow/15',
  other: 'bg-g-bg text-g-text-secondary border-g-border',
}

const TODAY = format(new Date(), 'yyyy-MM-dd')
const IN_4MO = format(addMonths(new Date(), 4), 'yyyy-MM-dd')
const BLANK = { type: 'campus_job', label: '', hourly_rate: '', weekly_hours: '', start_date: TODAY, end_date: IN_4MO, is_lump_sum: false, lump_sum_amount: '', is_active: true }

export default function IncomeStreamForm() {
  const { incomeStreams, setIncomeStreams, refreshRunway, refreshAI, createNessieDeposit } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(BLANK)

  async function trigger(streams) { const rw = await refreshRunway(streams); await refreshAI(rw) }
  function toggle(id) { const u = incomeStreams.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s); setIncomeStreams(u); trigger(u) }
  function remove(id) { const u = incomeStreams.filter(s => s.id !== id); setIncomeStreams(u); trigger(u) }
  async function save() {
    if (!form.label.trim()) return
    const newStream = { ...form, id: uuidv4(), hourly_rate: Number(form.hourly_rate) || 0, weekly_hours: Number(form.weekly_hours) || 0, lump_sum_amount: form.is_lump_sum ? Number(form.lump_sum_amount) || 0 : null }
    const u = [...incomeStreams, newStream]
    setIncomeStreams(u); setShowAdd(false); setForm(BLANK); trigger(u)

    // Create a Nessie deposit for this income
    const monthlyAmt = newStream.is_lump_sum
      ? (newStream.lump_sum_amount || 0)
      : (newStream.hourly_rate * newStream.weekly_hours * 4.33)
    if (monthlyAmt > 0) {
      createNessieDeposit(Math.round(monthlyAmt * 100) / 100, `${newStream.label} (${newStream.type})`)
    }
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-g-green to-g-green-half flex items-center justify-center shadow-sm">
            <Briefcase size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-g-text text-base">Income</h3>
            <p className="font-mono text-[11px] text-g-text-tertiary mt-0.5">Toggle for what-if</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(v => !v)} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-g-blue text-white font-body text-sm font-medium hover:bg-[#3367d6] transition-all shadow-sm">
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="space-y-2.5 mb-3">
        {incomeStreams.map(s => (
          <div key={s.id} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${s.is_active ? 'bg-g-surface border-g-border hover:border-g-blue/30' : 'bg-g-bg border-g-border opacity-50'}`}>
            <input type="checkbox" checked={s.is_active} onChange={() => toggle(s.id)} className="w-5 h-5 rounded accent-g-blue cursor-pointer flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-body text-g-text text-[15px] font-medium truncate">{s.label}</p>
              <p className="font-mono text-xs text-g-text-tertiary mt-0.5">{s.is_lump_sum ? `$${s.lump_sum_amount?.toLocaleString()} lump sum` : `$${s.hourly_rate}/hr × ${s.weekly_hours}h/wk`}</p>
            </div>
            <span className={`hidden sm:inline px-2.5 py-1 rounded-full border text-[11px] font-mono ${TYPE_CLASSES[s.type]}`}>{TYPE_LABELS[s.type]}</span>
            <button onClick={() => remove(s.id)} className="text-g-text-tertiary hover:text-g-red transition-colors p-1.5 rounded-xl hover:bg-g-red-pastel flex-shrink-0"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="border border-g-border rounded-2xl p-5 space-y-4 bg-g-bg/60 slide-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Type</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">{Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
            <div><label className="label">Label</label><input type="text" placeholder="e.g. Library Job" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="input-field" /></div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" checked={form.is_lump_sum} onChange={e => setForm(f => ({ ...f, is_lump_sum: e.target.checked }))} className="w-5 h-5 rounded accent-g-blue" />
            <span className="font-body text-[15px] text-g-text-secondary">Lump sum payment</span>
          </label>
          {form.is_lump_sum ? (
            <div><label className="label">Total Amount ($)</label><input type="number" placeholder="12000" value={form.lump_sum_amount} onChange={e => setForm(f => ({ ...f, lump_sum_amount: e.target.value }))} className="input-field" /></div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Hourly Rate ($)</label><input type="number" placeholder="14.00" value={form.hourly_rate} onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))} className="input-field" /></div>
              <div><label className="label">Hours/Week</label><input type="number" placeholder="12" value={form.weekly_hours} onChange={e => setForm(f => ({ ...f, weekly_hours: e.target.value }))} className="input-field" /></div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Start Date</label><input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="input-field" /></div>
            <div><label className="label">End Date</label><input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="input-field" /></div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={save} className="flex-1 py-3 rounded-full bg-g-blue text-white font-body text-[15px] font-medium shadow-sm">Save</button>
            <button onClick={() => { setShowAdd(false); setForm(BLANK) }} className="flex-1 py-3 rounded-full bg-g-bg text-g-text-secondary font-body text-[15px] font-medium border border-g-border hover:bg-g-surface transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
