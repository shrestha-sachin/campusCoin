import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { useApp } from '../store.jsx'
import { TrendingUp } from 'lucide-react'

function formatYAxis(value) {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}k`
  return `$${value}`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  const color = val < 0 ? '#ea4335' : '#34a853'
  return (
    <div className="bg-g-surface rounded-2xl px-5 py-3 shadow-lg border border-g-border">
      <p className="font-body text-xs text-g-text-tertiary mb-1">
        {label ? format(parseISO(label), 'MMM d, yyyy') : ''}
      </p>
      <p className="font-body text-base font-bold" style={{ color }}>
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)}
      </p>
    </div>
  )
}

function xTickFormatter(dateStr) {
  try { return format(parseISO(dateStr), 'MMM d') } catch { return '' }
}

export default function RunwayChart() {
  const { runway, loading } = useApp()

  const ticks = runway.filter((_, i) => i % 14 === 0).map(p => p.date)

  if (loading.runway) {
    return (
      <div className="card p-5 sm:p-7">
        <div className="skeleton h-6 w-44 mb-5" />
        <div className="skeleton h-[220px] sm:h-[260px] w-full" />
      </div>
    )
  }

  if (!runway.length) {
    return (
      <div className="card p-5 sm:p-7 flex items-center justify-center h-[260px] sm:h-[300px]">
        <p className="font-body text-[15px] text-g-text-tertiary">
          No runway data — refreshing…
        </p>
      </div>
    )
  }

  return (
    <div className="card p-5 sm:p-7">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-g-green to-g-green-half flex items-center justify-center shadow-sm">
          <TrendingUp size={20} className="text-white" />
        </div>
        <span className="font-body text-xs text-g-text-secondary tracking-widest uppercase font-medium">
          180-Day Runway
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={runway} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="runwayGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34a853" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#34a853" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={xTickFormatter}
            tick={{ fill: '#9aa0a6', fontSize: 11, fontFamily: 'GoogleSansMono, monospace' }}
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fill: '#9aa0a6', fontSize: 11, fontFamily: 'GoogleSansMono, monospace' }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={0}
            stroke="#ea4335"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{ value: '$0', fill: '#ea4335', fontSize: 11, fontFamily: 'GoogleSansMono, monospace' }}
          />
          <Area
            type="monotone"
            dataKey="projected_balance"
            stroke="#34a853"
            strokeWidth={2.5}
            fill="url(#runwayGrad)"
            dot={false}
            activeDot={{ r: 5, fill: '#34a853', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
