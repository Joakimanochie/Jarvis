import { useNavigate } from 'react-router-dom'
import { FlaskConical, Briefcase, Megaphone, Lightbulb } from 'lucide-react'
import type { Task } from '@/types'
import { useTasksStore, selectOpenTasksByProject } from '@/store/tasksStore'

const PROJECTS: Array<{
  id: Task['project']
  label: string
  icon: React.FC<{ size?: number; color?: string }>
  color: string
}> = [
  { id: 'research', label: 'Research', icon: FlaskConical, color: '#818cf8' },
  { id: 'business', label: 'Business', icon: Briefcase, color: '#f59e0b' },
  { id: 'brand', label: 'Brand', icon: Megaphone, color: '#f472b6' },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb, color: '#60a5fa' },
]

const PRIORITY_DOT: Record<Task['priority'], string> = {
  high: 'var(--status-red)',
  medium: 'var(--accent)',
  low: 'var(--text-muted)',
}

export default function ProjectLanes() {
  const navigate = useNavigate()
  const { tasks } = useTasksStore()

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3
        style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          marginBottom: '10px',
        }}
      >
        Project Lanes
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {PROJECTS.map((p) => {
          const projectTasks = selectOpenTasksByProject(tasks, p.id, 3)
          const total = tasks.filter((t) => t.project === p.id && t.status !== 'done').length

          return (
            <div
              key={p.id}
              onClick={() => navigate('/projects')}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = 'var(--border-strong)'
                el.style.background = 'var(--bg-elevated)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = 'var(--border-default)'
                el.style.background = 'var(--bg-surface)'
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <p.icon size={12} color={p.color} />
                  <span
                    style={{
                      fontFamily: 'Syne, sans-serif',
                      fontWeight: 600,
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {p.label}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-elevated)',
                    padding: '1px 6px',
                    borderRadius: '8px',
                  }}
                >
                  {total}
                </span>
              </div>

              {/* Top tasks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {projectTasks.length === 0 ? (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    All clear ✓
                  </span>
                ) : (
                  projectTasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.4',
                      }}
                    >
                      <span
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: PRIORITY_DOT[task.priority],
                          flexShrink: 0,
                          marginTop: '5px',
                        }}
                      />
                      <span style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {task.title}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
