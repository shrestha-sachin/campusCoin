import React, { useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { useApp } from '../store.jsx'
import { TrendingUp, BarChart3, LineChart } from 'lucide-react'

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
  const [chartType, setChartType] = useState('area')
  const [timeRange, setTimeRange] = useState('6M')

  const timeRanges = {
    '1D': 1,
    '1W': 7,
    '15D': 15,
    '1M': 30,
    '6M': 180,
    '1Y': 365
  }

  const displayData = useMemo(() => {
    if (!runway || !runway.length) return []
    return runway.slice(0, timeRanges[timeRange] || 180)
  }, [runway, timeRange])

  // Adjust ticks based on range so graph isn't infinitely cluttered
  const ticks = useMemo(() => {
    const len = displayData.length
    if (len <= 7) return displayData.map(p => p.date)
    if (len <= 15) return displayData.filter((_, i) => i % 2 === 0).map(p => p.date)
    if (len <= 30) return displayData.filter((_, i) => i % 5 === 0).map(p => p.date)
    if (len <= 180) return displayData.filter((_, i) => i % 30 === 0).map(p => p.date)
    return displayData.filter((_, i) => i % 60 === 0).map(p => p.date)
  }, [displayData])

  if (loading.runway) {
    return (
      <div className="card p-5 sm:p-7">
        <div className="skeleton h-6 w-44 mb-5" />
        <div className="skeleton h-[220px] sm:h-[260px] w-full" />
      </div>
    )
  }

  if (!displayData.length) {
    return (
      <div className="card p-5 sm:p-7 flex items-center justify-center h-[260px] sm:h-[300px]">
        <p className="font-body text-[15px] text-g-text-tertiary">
          No runway data — refreshing…
        </p>
      </div>
    )
  }

  const ChartComponent = chartType === 'area' ? AreaChart : BarChart

  return (
    <div className="card p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-g-green to-g-green-half flex items-center justify-center shadow-sm">
            <TrendingUp size={20} className="text-white" />
          </div>
          <span className="font-body text-xs text-g-text-secondary tracking-widest uppercase font-medium">
            Runway Projection
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range toggle */}
          <div className="flex items-center bg-g-surface border border-g-border rounded-xl p-1">
            {Object.keys(timeRanges).map(tr => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-3 py-1.5 rounded-lg font-body text-xs font-medium transition-all ${timeRange === tr ? 'bg-white text-g-blue shadow-sm' : 'text-g-text-secondary hover:text-g-text'}`}
              >
                {tr}
              </button>
            ))}
          </div>

          {/* Chart type toggle */}
          <div className="flex items-center bg-g-surface border border-g-border rounded-xl p-1">
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg transition-all ${chartType === 'area' ? 'bg-white text-g-blue shadow-sm' : 'text-g-text-secondary hover:text-g-text'}`}
            >
              <LineChart size={16} />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg transition-all ${chartType === 'bar' ? 'bg-white text-g-blue shadow-sm' : 'text-g-text-secondary hover:text-g-text'}`}
            >
              <BarChart3 size={16} />
            </button>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ChartComponent data={displayData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="runwayGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34a853" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#34a853" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34a853" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#34a853" stopOpacity={0.4} />
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

          {chartType === 'area' ? (
            <Area
              type="monotone"
              dataKey="projected_balance"
              stroke="#34a853"
              strokeWidth={2.5}
              fill="url(#runwayGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#34a853', stroke: '#fff', strokeWidth: 2 }}
            />
          ) : (
            <Bar
              dataKey="projected_balance"
              fill="url(#barGrad)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          )}

        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}
