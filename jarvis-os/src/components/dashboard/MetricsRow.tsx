import { useNavigate } from 'react-router-dom'
import { Target, CheckSquare, Mail, Wallet } from 'lucide-react'
import { useGoalsStore, selectOnTrackCount } from '@/store/goalsStore'
import { useTasksStore, selectTodaysTasks } from '@/store/tasksStore'
import { useCommsStore, selectUnreadCount, selectNeedReplyCount } from '@/store/commsStore'
import { useFinanceStore, selectMonthTotals } from '@/store/financeStore'

export default function MetricsRow() {
  const navigate = useNavigate()
  const { goals } = useGoalsStore()
  const { tasks } = useTasksStore()
  const { emails } = useCommsStore()
  const { entries } = useFinanceStore()
  const onTrackCount = selectOnTrackCount(goals)
  const todaysTasks = selectTodaysTasks(tasks)
  const highPriorityToday = todaysTasks.filter((t) => t.priority === 'high').length
  const unread = selectUnreadCount(emails)
  const needReply = selectNeedReplyCount(emails)
  const { net } = selectMonthTotals(entries)

  const metrics = [
    {
      label: 'Goals On Track',
      value: `${onTrackCount} / 6`,
      sub: 'areas progressing',
      icon: Target,
      color: 'var(--status-green)',
      route: '/goals',
    },
    {
      label: 'Tasks Today',
      value: String(todaysTasks.length),
      sub: highPriorityToday > 0 ? `${highPriorityToday} high priority` : 'no urgent tasks',
      icon: CheckSquare,
      color: 'var(--accent)',
      route: '/projects',
    },
    {
      label: 'Inbox',
      value: String(emails.length),
      sub: needReply > 0 ? `${needReply} need reply` : `${unread} unread`,
      icon: Mail,
      color: 'var(--status-blue)',
      route: undefined,
    },
    {
      label: 'Net This Month',
      value: `₦${Math.abs(net).toLocaleString()}`,
      sub: net >= 0 ? 'in the green' : 'in the red',
      icon: Wallet,
      color: net >= 0 ? 'var(--status-green)' : 'var(--status-amber)',
      route: undefined,
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '20px',
      }}
    >
      {metrics.map((m) => (
        <div
          key={m.label}
          onClick={() => m.route && navigate(m.route)}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '16px',
            cursor: m.route ? 'pointer' : 'default',
            transition: 'border-color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (m.route) {
              const el = e.currentTarget as HTMLDivElement
              el.style.borderColor = 'var(--border-strong)'
              el.style.background = 'var(--bg-elevated)'
            }
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = 'var(--border-default)'
            el.style.background = 'var(--bg-surface)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              {m.label}
            </span>
            <m.icon size={14} color={m.color} />
          </div>
          <div
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1,
              marginBottom: '4px',
            }}
          >
            {m.value}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{m.sub}</div>
        </div>
      ))}
    </div>
  )
}
