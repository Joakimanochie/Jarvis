import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { Goal } from '@/types'

interface Props {
  goals: Goal[]
}

interface TooltipPayload {
  payload: { area: string; progress: number }
  value: number
}

export default function GoalRadar({ goals }: Props) {
  const data = goals.map((g) => ({
    area: g.area,
    progress: g.progress,
    fullMark: 100,
  }))

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <h3
        style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}
      >
        Progress Radar
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="var(--border-default)" />
          <PolarAngleAxis
            dataKey="area"
            tick={{
              fill: 'var(--text-secondary)',
              fontSize: 11,
              fontFamily: 'DM Sans, sans-serif',
            }}
          />
          <Radar
            name="Progress"
            dataKey="progress"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.18}
            strokeWidth={2}
            dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0] as unknown as TooltipPayload
              return (
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <strong>{d.payload.area}</strong>
                  <div style={{ color: 'var(--accent)' }}>{d.value}%</div>
                </div>
              )
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
