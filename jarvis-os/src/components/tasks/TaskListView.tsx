import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Bot, Calendar, ArrowUpDown } from 'lucide-react'
import type { Task } from '@/types'
import { useTasksStore, isOverdue } from '@/store/tasksStore'
import { updateTaskStatus } from '@/integrations/notion'

const PROJECT_COLORS: Record<Task['project'], string> = {
  research: '#818cf8',
  business: '#f59e0b',
  brand: '#f472b6',
  ideas: '#60a5fa',
  finance: '#34d399',
}

const PRIORITY_CONFIG: Record<Task['priority'], { label: string; color: string }> = {
  high: { label: 'High', color: 'var(--status-red)' },
  medium: { label: 'Med', color: 'var(--accent)' },
  low: { label: 'Low', color: 'var(--text-muted)' },
}

const STATUS_TABS: Array<{ value: Task['status'] | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
]

const PROJECT_TABS: Array<{ value: Task['project'] | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'research', label: 'Research' },
  { value: 'business', label: 'Business' },
  { value: 'brand', label: 'Brand' },
  { value: 'ideas', label: 'Ideas' },
  { value: 'finance', label: 'Finance' },
]

type SortKey = 'priority' | 'dueDate' | 'project'

interface Props {
  tasks: Task[]
}

export default function TaskListView({ tasks }: Props) {
  const { completeTask, updateTask } = useTasksStore()
  const [projectFilter, setProjectFilter] = useState<Task['project'] | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortKey>('priority')
  const [completing, setCompleting] = useState<Set<string>>(new Set())

  const filtered = tasks
    .filter((t) => projectFilter === 'all' || t.project === projectFilter)
    .filter((t) => statusFilter === 'all' || t.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const p = { high: 0, medium: 1, low: 2 }
        return p[a.priority] - p[b.priority]
      }
      if (sortBy === 'dueDate') {
        return (a.dueDate ?? 'z') < (b.dueDate ?? 'z') ? -1 : 1
      }
      return a.project.localeCompare(b.project)
    })

  const handleComplete = async (task: Task) => {
    if (completing.has(task.id)) return
    setCompleting((s) => new Set(s).add(task.id))

    // Animate out then update store
    setTimeout(() => {
      completeTask(task.id)
      setCompleting((s) => {
        const next = new Set(s)
        next.delete(task.id)
        return next
      })
    }, 400)

    // Sync to Notion
    if (task.notionId && import.meta.env.VITE_NOTION_API_KEY) {
      updateTaskStatus(task.notionId, 'done').catch(console.warn)
    }
  }

  const handleStatusChange = (task: Task, status: Task['status']) => {
    updateTask(task.id, { status })
    if (task.notionId && import.meta.env.VITE_NOTION_API_KEY) {
      updateTaskStatus(task.notionId, status).catch(console.warn)
    }
  }

  return (
    <div>
      {/* Project filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '10px',
          flexWrap: 'wrap',
        }}
      >
        {PROJECT_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setProjectFilter(tab.value)}
            style={{
              background: projectFilter === tab.value ? 'var(--accent-glow)' : 'var(--bg-elevated)',
              border: `1px solid ${projectFilter === tab.value ? 'var(--accent)' : 'var(--border-default)'}`,
              borderRadius: '6px',
              padding: '5px 12px',
              color: projectFilter === tab.value ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: projectFilter === tab.value ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
            {tab.value !== 'all' && (
              <span
                style={{
                  marginLeft: '5px',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                }}
              >
                {tasks.filter((t) => t.project === tab.value && t.status !== 'done').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Status + sort bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              style={{
                background: statusFilter === tab.value ? 'var(--bg-hover)' : 'transparent',
                border: 'none',
                borderRadius: '5px',
                padding: '4px 10px',
                color: statusFilter === tab.value ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowUpDown size={12} color="var(--text-muted)" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              padding: '4px 8px',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
            <option value="project">Project</option>
          </select>
        </div>
      </div>

      {/* Task rows */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px',
              }}
            >
              No tasks here — add one above
            </div>
          ) : (
            filtered.map((task, i) => {
              const overdue = isOverdue(task)
              const isCompleting = completing.has(task.id)
              const priorityCfg = PRIORITY_CONFIG[task.priority]

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 14px',
                    borderBottom:
                      i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    opacity: isCompleting ? 0.4 : 1,
                    background: overdue ? 'rgba(245,158,11,0.04)' : 'transparent',
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleComplete(task)}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      border: `1.5px solid ${task.status === 'done' ? 'var(--status-green)' : 'var(--border-strong)'}`,
                      background: task.status === 'done' ? 'var(--status-green)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {task.status === 'done' && <Check size={10} color="#000" strokeWidth={3} />}
                  </button>

                  {/* Title */}
                  <span
                    style={{
                      flex: 1,
                      fontSize: '13.5px',
                      color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: task.status === 'done' ? 'line-through' : 'none',
                      lineHeight: '1.4',
                    }}
                  >
                    {task.title}
                  </span>

                  {/* Project tag */}
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: PROJECT_COLORS[task.project],
                      background: `${PROJECT_COLORS[task.project]}18`,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {task.project}
                  </span>

                  {/* Priority badge */}
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: priorityCfg.color,
                      minWidth: '28px',
                      textAlign: 'right',
                    }}
                  >
                    {priorityCfg.label}
                  </span>

                  {/* Due date */}
                  {task.dueDate && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '11px',
                        color: overdue ? 'var(--status-amber)' : 'var(--text-muted)',
                        fontFamily: 'DM Mono, monospace',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Calendar size={10} />
                      {task.dueDate}
                    </span>
                  )}

                  {/* Agent badge */}
                  {task.agentCreated && (
                    <span title="Created by agent">
                      <Bot size={12} color="var(--text-muted)" />
                    </span>
                  )}

                  {/* Status selector */}
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value as Task['status'])}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '5px',
                      padding: '3px 6px',
                      color: 'var(--text-muted)',
                      fontSize: '11px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Done</option>
                  </select>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
