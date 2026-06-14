import type { Goal } from '@/types'

interface Props {
  goals: Goal[]
}

export default function WeeklyLogTable({ goals }: Props) {
  // Build a unified weekly log — collect all weeks across all goals
  const allWeeks = Array.from(
    new Set(goals.flatMap((g) => g.weeklyLog.map((l) => l.week)))
  ).sort((a, b) => b.localeCompare(a)) // most recent first

  if (allWeeks.length === 0) return null

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px',
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
        Weekly Review Log
      </h3>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  borderBottom: '1px solid var(--border-subtle)',
                  whiteSpace: 'nowrap',
                }}
              >
                Week
              </th>
              {goals.map((g) => (
                <th
                  key={g.id}
                  style={{
                    textAlign: 'center',
                    padding: '8px 12px',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    borderBottom: '1px solid var(--border-subtle)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {g.area}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allWeeks.slice(0, 6).map((week, i) => (
              <tr
                key={week}
                style={{
                  background: i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)',
                }}
              >
                <td
                  style={{
                    padding: '9px 12px',
                    color: 'var(--text-secondary)',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '11px',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  {week}
                </td>
                {goals.map((g) => {
                  const log = g.weeklyLog.find((l) => l.week === week)
                  return (
                    <td
                      key={g.id}
                      style={{
                        padding: '9px 12px',
                        textAlign: 'center',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      {log ? (
                        <span
                          title={log.note}
                          style={{
                            fontFamily: 'DM Mono, monospace',
                            fontSize: '12px',
                            color:
                              log.progress >= 75
                                ? 'var(--status-green)'
                                : log.progress >= 50
                                  ? 'var(--accent)'
                                  : 'var(--status-red)',
                            cursor: 'help',
                          }}
                        >
                          {log.progress}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
        Hover a percentage to see the week's note.
      </p>
    </div>
  )
}
