"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface DayPoint {
  date: string
  dismiss: number
  total: number
}

interface DeckSeries {
  id: string
  name: string
  data: DayPoint[]
}

interface Props {
  globalData: DayPoint[]
  deckData: DeckSeries[]
  sessionCount: number
}

function toRetentionPct(points: DayPoint[]) {
  return points.map(p => ({
    date: p.date,
    pct: p.total > 0 ? Math.round((p.dismiss / p.total) * 100) : null,
  }))
}

export default function RetentionChart({ globalData, deckData, sessionCount }: Props) {
  const [selectedDeckId, setSelectedDeckId] = useState<string>("all")

  if (sessionCount < 3) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center space-y-1">
        <p className="text-sm font-medium text-zinc-700">Rétention (30 jours)</p>
        <p className="text-xs text-zinc-400">Pas encore assez de données — revenez après quelques sessions</p>
      </div>
    )
  }

  const activeSeries = selectedDeckId === "all"
    ? globalData
    : deckData.find(d => d.id === selectedDeckId)?.data ?? globalData

  const chartData = toRetentionPct(activeSeries)

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-700">Rétention (30 jours)</p>
        {deckData.length > 1 && (
          <select
            value={selectedDeckId}
            onChange={e => setSelectedDeckId(e.target.value)}
            className="text-xs text-zinc-500 bg-transparent border border-zinc-200 rounded px-1.5 py-0.5 outline-none"
          >
            <option value="all">Tous les decks</option>
            {deckData.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}
      </div>
      <ResponsiveContainer width="100%" height={110}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: "#a1a1aa" }}
            tickLine={false}
            axisLine={false}
            interval={6}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#a1a1aa" }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e4e4e7" }}
            labelStyle={{ color: "#71717a" }}
            formatter={(value) => (value != null ? [`${value}%`, "Rétention"] : ["—", "Rétention"])}
          />
          <Line
            type="monotone"
            dataKey="pct"
            stroke="#18181b"
            strokeWidth={1.5}
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
