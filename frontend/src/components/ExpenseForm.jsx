import React, { useState } from 'react'
import { Plus, Trash2, Receipt } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../store.jsx'
import { format } from 'date-fns'

const FREQ_LABELS = { monthly: 'Monthly', weekly: 'Weekly', semesterly: 'Semesterly', 'one-time': 'One-time' }
const FREQ_CLASSES = {
  monthly: 'bg-g-green-pastel text-g-green border-g-green/15',
  weekly: 'bg-g-blue-pastel text-g-blue border-g-blue/15',
  semesterly: 'bg-g-yellow-pastel text-g-yellow border-g-yellow/15',
  'one-time': 'bg-g-red-pastel text-g-red border-g-red/15',
}

const TODAY = format(new Date(), 'yyyy-MM-dd')
const BLANK = { type: 'fixed', label: '', amount: '', frequency: 'monthly', due_date: TODAY, is_active: true }

export default function ExpenseForm() {
  const { expenses, setExpenses, refreshRunway, refreshAI } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(BLANK)

  async function trigger(exp) {
    const rw = await refreshRunway(undefined, exp)
    await refreshAI(rw)
  }

  function toggle(id) {
    const updated = expenses.map(e => e.id === id ? { ...e, is_active: !e.is_active } : e)
    setExpenses(updated)
    trigger(updated)
  }

  function remove(id) {
    const updated = expenses.filter(e => e.id !== id)
    setExpenses(updated)
    trigger(updated)
  }

  function save() {
    if (!form.label.trim() || !form.amount) return
    const updated = [...expenses, { ...form, id: uuidv4(), amount: Number(form.amount) }]
    setExpenses(updated)
    setShowAdd(false)
    setForm(BLANK)
    trigger(updated)
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-g-red-pastel flex items-center justify-center">
            <Receipt size={16} className="text-g-red" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-g-text text-sm">Expenses</h3>
            <p className="font-mono text-[10px] text-g-text-tertiary mt-0.5">Toggle for what-if</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-g-red text-white font-body text-xs font-medium hover:bg-[#c5221f] transition-all shadow-sm"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {expenses.map(exp => (
          <div
            key={exp.id}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${exp.is_active ? 'bg-g-surface border-g-border' : 'bg-g-bg border-g-border opacity-50'
              }`}
          >
            <input type="checkbox" checked={exp.is_active} onChange={() => toggle(exp.id)} className="w-4 h-4 rounded accent-g-blue cursor-pointer flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-body text-g-text text-[13px] truncate">{exp.label}</p>
              <p className="font-mono text-[10px] text-g-text-tertiary mt-0.5">${exp.amount.toLocaleString()} · due {exp.due_date}</p>
            </div>
            <span className={`hidden sm:inline px-2 py-0.5 rounded-full border text-[10px] font-mono ${FREQ_CLASSES[exp.frequency]}`}>
              {FREQ_LABELS[exp.frequency]}
            </span>
            <button onClick={() => remove(exp.id)} className="text-g-text-tertiary hover:text-g-red transition-colors p-1 rounded-lg hover:bg-g-red-pastel/40 flex-shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="border border-g-border rounded-xl p-4 space-y-3 bg-g-bg/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="label">Label</label><input type="text" placeholder="e.g. Rent" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="input-field" /></div>
            <div><label className="label">Amount ($)</label><input type="number" placeholder="750" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="label">Type</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field"><option value="fixed">Fixed</option><option value="variable">Variable</option></select></div>
            <div><label className="label">Frequency</label><select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className="input-field">{Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          </div>
          <div><label className="label">Due Date</label><input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="input-field" /></div>
          <div className="flex gap-2.5 pt-1">
            <button onClick={save} className="flex-1 py-2.5 rounded-full bg-g-blue text-white font-body text-sm font-medium hover:bg-[#3367d6] transition-all shadow-sm">Save</button>
            <button onClick={() => { setShowAdd(false); setForm(BLANK) }} className="flex-1 py-2.5 rounded-full bg-g-bg text-g-text-secondary font-body text-sm font-medium border border-g-border hover:bg-g-surface transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
