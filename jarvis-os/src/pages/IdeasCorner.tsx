import { useEffect, useState, type FormEvent, type CSSProperties } from 'react'
import { Lightbulb, Plus, ArrowRight, Megaphone } from 'lucide-react'
import { useIdeasStore } from '@/store/ideasStore'
import { useTasksStore } from '@/store/tasksStore'
import { usePostsStore } from '@/store/postsStore'
import { useToastStore } from '@/store/toastStore'
import { runJarvis } from '@/agents/orchestrator'
import type { Idea, Task } from '@/types'

const PROJECTS: Idea['project'][] = ['research', 'business', 'brand', 'ideas', 'finance']
const STATUSES: Idea['status'][] = ['new', 'in_progress', 'shipped', 'archived']

const PROJECT_COLORS: Record<Idea['project'], string> = {
  research: '#818cf8',
  business: '#f59e0b',
  brand: '#f472b6',
  ideas: '#60a5fa',
  finance: '#34d399',
}

const STATUS_LABELS: Record<Idea['status'], string> = {
  new: 'New',
  in_progress: 'In Progress',
  shipped: 'Shipped',
  archived: 'Archived',
}

export default function IdeasCorner() {
  const { ideas, fetchAll, addIdea, setStatus } = useIdeasStore()
  const { addTask } = useTasksStore()
  const { posts } = usePostsStore()
  const [text, setText] = useState('')
  const [project, setProject] = useState<Idea['project']>('ideas')
  const [projectFilter, setProjectFilter] = useState<Idea['project'] | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<Idea['status'] | 'all'>('all')

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  function handleCapture(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    addIdea(text.trim(), project)
    setText('')
  }

  function turnIntoTask(idea: Idea) {
    const task: Task = {
      id: `agent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: idea.text,
      project: idea.project === 'ideas' ? 'research' : idea.project,
      status: 'todo',
      priority: 'medium',
      agentCreated: true,
    }
    addTask(task)
    useToastStore.getState().show(`Task added: "${task.title}"`, '✅')
    setStatus(idea.id, 'in_progress')
  }

  function writePost(idea: Idea) {
    runJarvis(`Write a LinkedIn post about: ${idea.text}`)
  }

  const filtered = ideas.filter(
    (i) => (projectFilter === 'all' || i.project === projectFilter) && (statusFilter === 'all' || i.status === statusFilter)
  )

  return (
    <div>
      <h2
        style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '4px',
        }}
      >
        Ideas Corner
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
        Quick capture for anything worth coming back to.
      </p>

      {/* Quick capture */}
      <form
        onSubmit={handleCapture}
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '10px 12px',
        }}
      >
        <Lightbulb size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: '8px' }} />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Capture an idea…"
          style={{
            flex: 1,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'var(--text-primary)',
            fontSize: '13.5px',
            outline: 'none',
            fontFamily: 'DM Sans, sans-serif',
          }}
        />
        <select
          value={project}
          onChange={(e) => setProject(e.target.value as Idea['project'])}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            padding: '8px 10px',
            color: 'var(--text-primary)',
            fontSize: '12.5px',
            outline: 'none',
          }}
        >
          {PROJECTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            background: 'var(--accent)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 14px',
            color: '#0d0f14',
            fontWeight: 600,
            fontSize: '12.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Plus size={14} /> Add
        </button>
      </form>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <FilterGroup label="Project" value={projectFilter} options={['all', ...PROJECTS]} onChange={(v) => setProjectFilter(v as Idea['project'] | 'all')} />
        <FilterGroup label="Status" value={statusFilter} options={['all', ...STATUSES]} onChange={(v) => setStatusFilter(v as Idea['status'] | 'all')} />
      </div>

      {/* Ideas gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {filtered.map((idea) => (
          <div
            key={idea.id}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: PROJECT_COLORS[idea.project],
                  background: `${PROJECT_COLORS[idea.project]}18`,
                  padding: '2px 7px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}
              >
                {idea.project}
              </span>
              <select
                value={idea.status}
                onChange={(e) => setStatus(idea.id, e.target.value as Idea['status'])}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  color: 'var(--text-muted)',
                  fontSize: '10px',
                }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5', flex: 1 }}>{idea.text}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => turnIntoTask(idea)} style={actionBtn()}>
                <ArrowRight size={11} /> Turn into task
              </button>
              <button onClick={() => writePost(idea)} style={actionBtn()}>
                <Megaphone size={11} /> Write a post
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px' }}>No ideas match these filters.</div>
        )}
      </div>

      {/* Content calendar */}
      <h3
        style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}
      >
        Content Calendar
      </h3>
      {posts.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          No drafts yet — ask Jarvis to "write a LinkedIn post about X" from the command bar or an idea above.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{post.topic}</span>
                <span
                  style={{
                    fontSize: '11px',
                    color: post.status === 'posted' ? 'var(--status-green)' : 'var(--accent)',
                    textTransform: 'uppercase',
                  }}
                >
                  {post.status}
                </span>
              </div>
              <pre
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                {post.content}
              </pre>
              <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>{post.content.length} characters</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: T[]
  onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}:</span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            background: value === opt ? 'var(--bg-elevated)' : 'transparent',
            border: `1px solid ${value === opt ? 'var(--border-strong)' : 'transparent'}`,
            borderRadius: '6px',
            padding: '3px 8px',
            fontSize: '11px',
            color: value === opt ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            textTransform: 'capitalize',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function actionBtn(): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  }
}
