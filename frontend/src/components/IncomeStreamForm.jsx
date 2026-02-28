import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
  campus_job: 'bg-google-green-pastel text-google-green border-google-green/15',
  internship: 'bg-google-blue-pastel text-google-blue border-google-blue/15',
  stipend: 'bg-google-blue-pastel text-google-blue border-google-blue/15',
  family: 'bg-google-yellow-pastel text-google-yellow border-google-yellow/15',
  other: 'bg-google-off-white text-google-black/50 border-black/10',
}

const TODAY = format(new Date(), 'yyyy-MM-dd')
const IN_4MO = format(addMonths(new Date(), 4), 'yyyy-MM-dd')

const BLANK = {
  type: 'campus_job',
  label: '',
  hourly_rate: '',
  weekly_hours: '',
  start_date: TODAY,
  end_date: IN_4MO,
  is_lump_sum: false,
  lump_sum_amount: '',
  is_active: true,
}

const inputClass =
  'w-full bg-google-off-white border border-black/10 rounded-xl px-4 py-3 text-google-black font-google-text text-sm placeholder-google-black/35 focus:outline-none focus:border-google-blue focus:shadow-[0_0_0_2px_rgba(66,133,244,0.15)] transition-all'
const labelClass = 'font-google-mono text-xs text-google-black/55 uppercase tracking-wider block mb-2'

export default function IncomeStreamForm() {
  const { incomeStreams, setIncomeStreams, refreshRunway, refreshAI } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(BLANK)

  async function trigger(streams) {
    const rw = await refreshRunway(streams)
    await refreshAI(rw)
  }

  function toggle(id) {
    const updated = incomeStreams.map(s =>
      s.id === id ? { ...s, is_active: !s.is_active } : s
    )
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
      ...form,
      id: uuidv4(),
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
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-google font-semibold text-google-black text-base">
            Income Streams
          </h3>
          <p className="font-google-mono text-xs text-google-black/50 mt-1">
            Toggle to run what-if scenarios
          </p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-google-blue text-white font-google-text text-sm font-medium hover:bg-[#3367d6] transition-colors shadow-[0_2px_8px_rgba(66,133,244,0.25)]"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="space-y-3 mb-4">
        {incomeStreams.map(s => (
          <div
            key={s.id}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-colors ${
              s.is_active ? 'bg-google-off-white/80 border-black/8' : 'bg-google-off-white/40 border-black/6 opacity-60'
            }`}
          >
            <input
              type="checkbox"
              checked={s.is_active}
              onChange={() => toggle(s.id)}
              className="w-5 h-5 rounded accent-google-blue cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <p className="font-google-text text-google-black text-sm truncate">{s.label}</p>
              <p className="font-google-mono text-xs text-google-black/45 mt-0.5">
                {s.is_lump_sum
                  ? `$${s.lump_sum_amount?.toLocaleString()} lump sum`
                  : `$${s.hourly_rate}/hr × ${s.weekly_hours}h/wk`}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full border text-[11px] font-google-mono ${TYPE_CLASSES[s.type]}`}>
              {TYPE_LABELS[s.type]}
            </span>
            <button
              onClick={() => remove(s.id)}
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
              <label className={labelClass}>Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className={inputClass}
              >
                {Object.entries(TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Label</label>
              <input
                type="text"
                placeholder="e.g. Library Job"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_lump_sum}
              onChange={e => setForm(f => ({ ...f, is_lump_sum: e.target.checked }))}
              className="w-5 h-5 rounded accent-google-blue"
            />
            <span className="font-google-text text-sm text-google-black/65">Lump sum payment</span>
          </label>

          {form.is_lump_sum ? (
            <div>
              <label className={labelClass}>Total Amount ($)</label>
              <input
                type="number"
                placeholder="12000"
                value={form.lump_sum_amount}
                onChange={e => setForm(f => ({ ...f, lump_sum_amount: e.target.value }))}
                className={inputClass}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Hourly Rate ($)</label>
                <input
                  type="number"
                  placeholder="14.00"
                  value={form.hourly_rate}
                  onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Hours/Week</label>
                <input
                  type="number"
                  placeholder="12"
                  value={form.weekly_hours}
                  onChange={e => setForm(f => ({ ...f, weekly_hours: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className={inputClass}
              />
            </div>
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
