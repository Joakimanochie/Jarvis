import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Task } from '@/types'
import { useTasksStore } from '@/store/tasksStore'
import { createTask } from '@/integrations/notion'

const PROJECTS: Task['project'][] = ['research', 'business', 'brand', 'ideas', 'finance']
const PRIORITIES: Task['priority'][] = ['high', 'medium', 'low']

const PROJECT_COLORS: Record<Task['project'], string> = {
  research: '#818cf8',
  business: '#f59e0b',
  brand: '#f472b6',
  ideas: '#60a5fa',
  finance: '#34d399',
}

interface Props {
  defaultProject?: Task['project']
}

export default function QuickAdd({ defaultProject = 'research' }: Props) {
  const { addTask } = useTasksStore()
  const [title, setTitle] = useState('')
  const [project, setProject] = useState<Task['project']>(defaultProject)
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const newTask: Task = {
      id: `local_${Date.now()}`,
      title: title.trim(),
      project,
      status: 'todo',
      priority,
      agentCreated: false,
    }

    // Optimistic add
    addTask(newTask)
    setTitle('')

    // Sync to Notion (fire-and-forget)
    if (import.meta.env.VITE_NOTION_API_KEY) {
      setSaving(true)
      createTask(newTask)
        .then((notionId) => {
          useTasksStore.getState().updateTask(newTask.id, { notionId })
        })
        .catch(console.warn)
        .finally(() => setSaving(false))
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '10px',
        padding: '10px 14px',
        marginBottom: '16px',
      }}
    >
      <Plus size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task…"
        style={{
          flex: 1,
          background: 'none',
          border: 'none',
          outline: 'none',
          color: 'var(--text-primary)',
          fontSize: '13.5px',
          fontFamily: 'DM Sans, sans-serif',
        }}
      />

      {/* Project selector */}
      <select
        value={project}
        onChange={(e) => setProject(e.target.value as Task['project'])}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: '6px',
          padding: '4px 8px',
          color: PROJECT_COLORS[project],
          fontSize: '12px',
          outline: 'none',
          cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        {PROJECTS.map((p) => (
          <option key={p} value={p} style={{ color: 'var(--text-primary)' }}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </option>
        ))}
      </select>

      {/* Priority selector */}
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Task['priority'])}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: '6px',
          padding: '4px 8px',
          color:
            priority === 'high'
              ? 'var(--status-red)'
              : priority === 'medium'
                ? 'var(--accent)'
                : 'var(--text-muted)',
          fontSize: '12px',
          outline: 'none',
          cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        {PRIORITIES.map((p) => (
          <option key={p} value={p} style={{ color: 'var(--text-primary)' }}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={!title.trim() || saving}
        style={{
          background: title.trim() ? 'var(--accent)' : 'var(--bg-elevated)',
          border: 'none',
          borderRadius: '6px',
          padding: '5px 12px',
          color: title.trim() ? '#000' : 'var(--text-muted)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: title.trim() ? 'pointer' : 'default',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
        }}
      >
        {saving ? 'Saving…' : 'Add'}
      </button>
    </form>
  )
}
