import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../store.jsx'
import { format } from 'date-fns'

const FREQ_LABELS = {
  monthly: 'Monthly',
  weekly: 'Weekly',
  semesterly: 'Semesterly',
  'one-time': 'One-time',
}

const FREQ_CLASSES = {
  monthly: 'bg-google-green-pastel text-google-green border-google-green/15',
  weekly: 'bg-google-blue-pastel text-google-blue border-google-blue/15',
  semesterly: 'bg-google-yellow-pastel text-google-yellow border-google-yellow/15',
  'one-time': 'bg-google-red-pastel text-google-red border-google-red/15',
}

const TODAY = format(new Date(), 'yyyy-MM-dd')

const BLANK = {
  type: 'fixed',
  label: '',
  amount: '',
  frequency: 'monthly',
  due_date: TODAY,
  is_active: true,
}

const inputClass =
  'w-full bg-google-off-white border border-black/10 rounded-xl px-4 py-3 text-google-black font-google-text text-sm placeholder-google-black/35 focus:outline-none focus:border-google-blue focus:shadow-[0_0_0_2px_rgba(66,133,244,0.15)] transition-all'
const labelClass = 'font-google-mono text-xs text-google-black/55 uppercase tracking-wider block mb-2'

export default function ExpenseForm() {
  const { expenses, setExpenses, refreshRunway, refreshAI } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(BLANK)

  async function trigger(exp) {
    const rw = await refreshRunway(undefined, exp)
    await refreshAI(rw)
  }

  function toggle(id) {
    const updated = expenses.map(e =>
      e.id === id ? { ...e, is_active: !e.is_active } : e
    )
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
    const newExp = {
      ...form,
      id: uuidv4(),
      amount: Number(form.amount),
    }
    const updated = [...expenses, newExp]
    setExpenses(updated)
    setShowAdd(false)
    setForm(BLANK)
    trigger(updated)
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-google font-semibold text-google-black text-base">
            Expenses
          </h3>
          <p className="font-google-mono text-xs text-google-black/50 mt-1">
            Toggle to run what-if scenarios
          </p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-google-red text-white font-google-text text-sm font-medium hover:bg-[#c5221f] transition-colors shadow-[0_2px_8px_rgba(234,67,53,0.25)]"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="space-y-3 mb-4">
        {expenses.map(exp => (
          <div
            key={exp.id}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-colors ${
              exp.is_active ? 'bg-google-off-white/80 border-black/8' : 'bg-google-off-white/40 border-black/6 opacity-60'
            }`}
          >
            <input
              type="checkbox"
              checked={exp.is_active}
              onChange={() => toggle(exp.id)}
              className="w-5 h-5 rounded accent-google-blue cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <p className="font-google-text text-google-black text-sm truncate">{exp.label}</p>
              <p className="font-google-mono text-xs text-google-black/45 mt-0.5">
                ${exp.amount.toLocaleString()} · due {exp.due_date}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full border text-[11px] font-google-mono ${FREQ_CLASSES[exp.frequency]}`}>
              {FREQ_LABELS[exp.frequency]}
            </span>
            <button
              onClick={() => remove(exp.id)}
              className="text-google-black/30 hover:text-google-red transition-colors p-1 rounded-lg hover:bg-google-red-pastel/30"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="border border-black/8 rounded-2xl p-6 space-y-4 bg-google-off-white/50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Label</label>
              <input
                type="text"
                placeholder="e.g. Rent"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Amount ($)</label>
              <input
                type="number"
                placeholder="750"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className={inputClass}
              >
                <option value="fixed">Fixed</option>
                <option value="variable">Variable</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Frequency</label>
              <select
                value={form.frequency}
                onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                className={inputClass}
              >
                {Object.entries(FREQ_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Due Date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={save}
              className="flex-1 py-3 rounded-full bg-google-blue text-white font-google-text text-sm font-medium hover:bg-[#3367d6] transition-colors shadow-[0_2px_8px_rgba(66,133,244,0.25)]"
            >
              Save
            </button>
            <button
              onClick={() => { setShowAdd(false); setForm(BLANK) }}
              className="flex-1 py-3 rounded-full bg-google-off-white text-google-black/60 font-google-text text-sm font-medium border border-black/10 hover:bg-google-off-white/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
