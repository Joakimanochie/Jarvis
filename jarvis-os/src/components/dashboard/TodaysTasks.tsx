import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight } from 'lucide-react'
import { useTasksStore, selectTodaysTasks } from '@/store/tasksStore'
import { updateTaskStatus } from '@/integrations/notion'

const PRIORITY_COLOR = {
  high: 'var(--status-red)',
  medium: 'var(--accent)',
  low: 'var(--text-muted)',
}

const PROJECT_COLOR: Record<string, string> = {
  research: '#818cf8',
  business: '#f59e0b',
  brand: '#f472b6',
  ideas: '#60a5fa',
  finance: '#34d399',
}

export default function TodaysTasks() {
  const navigate = useNavigate()
  const { tasks, completeTask } = useTasksStore()
  const todaysTasks = selectTodaysTasks(tasks).sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 }
    return p[a.priority] - p[b.priority]
  })

  if (todaysTasks.length === 0) return null

  const handleComplete = (id: string, notionId?: string) => {
    completeTask(id)
    if (notionId && import.meta.env.VITE_NOTION_API_KEY) {
      updateTaskStatus(notionId, 'done').catch(console.warn)
    }
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <h3
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
          }}
        >
          Today's Tasks
        </h3>
        <button
          onClick={() => navigate('/projects')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            color: 'var(--text-muted)',
            fontSize: '11px',
          }}
        >
          All tasks <ChevronRight size={11} />
        </button>
      </div>

      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence initial={false}>
          {todaysTasks.slice(0, 5).map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderBottom:
                  i < todaysTasks.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              {/* Complete button */}
              <button
                onClick={() => handleComplete(task.id, task.notionId)}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  border: '1.5px solid var(--border-strong)',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--status-green)'
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,197,94,0.1)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)'
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }}
              >
                <Check size={9} color="var(--status-green)" strokeWidth={3} />
              </button>

              <span
                style={{
                  flex: 1,
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.4',
                }}
              >
                {task.title}
              </span>

              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: PROJECT_COLOR[task.project],
                  background: `${PROJECT_COLOR[task.project]}18`,
                  padding: '1px 6px',
                  borderRadius: '4px',
                }}
              >
                {task.project}
              </span>

              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: PRIORITY_COLOR[task.priority],
                  flexShrink: 0,
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
