import React, { useState } from 'react'
import { Plus, Trash2, Receipt, Edit2, Check } from 'lucide-react'
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
  const { expenses, setExpenses, refreshRunway, refreshAI, createNessiePurchase } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(BLANK)

  async function trigger(exp) { await refreshRunway(undefined, exp) }
  function toggle(id) { const u = expenses.map(e => e.id === id ? { ...e, is_active: !e.is_active } : e); setExpenses(u); trigger(u) }
  function remove(id) { const u = expenses.filter(e => e.id !== id); setExpenses(u); trigger(u) }

  function startEdit(exp) {
    setEditId(exp.id)
    setShowAdd(true)
    setForm({
      ...exp,
      amount: exp.amount?.toString() || '',
    })
  }

  async function save() {
    if (!form.label.trim() || !form.amount) return
    const amt = Number(form.amount)
    const updatedData = { ...form, amount: amt }

    let u
    if (editId) {
      u = expenses.map(e => e.id === editId ? { ...updatedData, id: editId } : e)
    } else {
      u = [...expenses, { ...updatedData, id: uuidv4() }]
    }

    setExpenses(u)
    setShowAdd(false)
    setEditId(null)
    setForm(BLANK)
    trigger(u)

    // Create a Nessie purchase only for new expenses or if amount changed?
    // For simplicity, we'll only create for new ones to avoid duplicate bank entries during edits.
    if (!editId && amt > 0) {
      createNessiePurchase(amt, `${form.label} (${form.frequency})`)
    }
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-g-red to-g-red-half flex items-center justify-center shadow-sm">
            <Receipt size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-g-text text-base">Expenses</h3>
            <p className="font-body text-[11px] text-g-text-tertiary mt-0.5">Toggle for what-if</p>
          </div>
        </div>
        {!showAdd && (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-g-red text-white font-body text-sm font-medium hover:bg-[#c5221f] transition-all shadow-sm">
            <Plus size={16} /> Add
          </button>
        )}
      </div>

      <div className="space-y-2.5 mb-3">
        {expenses.map(exp => (
          <div key={exp.id} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${exp.is_active ? 'bg-g-surface border-g-border hover:border-g-red/30' : 'bg-g-bg border-g-border opacity-50'} ${editId === exp.id ? 'ring-2 ring-g-red border-g-red' : ''}`}>
            <input type="checkbox" checked={exp.is_active} onChange={() => toggle(exp.id)} className="w-5 h-5 rounded accent-g-blue cursor-pointer flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-body text-g-text text-[15px] font-medium truncate">{exp.label}</p>
              <p className="font-body text-xs text-g-text-tertiary mt-0.5">${exp.amount.toLocaleString()} · due {exp.due_date}</p>
            </div>
            <span className={`hidden sm:inline px-2.5 py-1 rounded-full border text-[11px] font-body ${FREQ_CLASSES[exp.frequency]}`}>{FREQ_LABELS[exp.frequency]}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => startEdit(exp)} className="text-g-text-tertiary hover:text-g-red transition-colors p-1.5 rounded-xl hover:bg-g-red-pastel flex-shrink-0"><Edit2 size={16} /></button>
              <button onClick={() => remove(exp.id)} className="text-g-text-tertiary hover:text-g-red transition-colors p-1.5 rounded-xl hover:bg-g-red-pastel flex-shrink-0"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="border border-g-border rounded-2xl p-5 space-y-4 bg-g-bg/60 slide-in">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-display font-bold text-g-text text-sm">{editId ? 'Edit Expense' : 'Add Expense'}</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Label</label><input type="text" placeholder="e.g. Rent" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="input-field" /></div>
            <div><label className="label">Amount ($)</label><input type="number" placeholder="750" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Type</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field"><option value="fixed">Fixed</option><option value="variable">Variable</option></select></div>
            <div><label className="label">Frequency</label><select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className="input-field">{Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          </div>
          <div><label className="label">Due Date</label><input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="input-field" /></div>
          <div className="flex gap-3 pt-1">
            <button onClick={save} className="flex-1 py-3 rounded-full bg-g-blue text-white font-body text-[15px] font-medium shadow-sm flex items-center justify-center gap-2">
              {editId ? <Check size={18} /> : <Plus size={18} />}
              {editId ? 'Update' : 'Save'}
            </button>
            <button onClick={() => { setShowAdd(false); setEditId(null); setForm(BLANK) }} className="flex-1 py-3 rounded-full bg-g-bg text-g-text-secondary font-body text-[15px] font-medium border border-g-border hover:bg-g-surface transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
