import { useEffect } from 'react'
import { LayoutList, Columns, RefreshCw, FolderKanban } from 'lucide-react'
import { useTasksStore } from '@/store/tasksStore'
import { fetchTasks } from '@/integrations/notion'
import QuickAdd from '@/components/tasks/QuickAdd'
import TaskListView from '@/components/tasks/TaskListView'
import KanbanBoard from '@/components/tasks/KanbanBoard'

export default function ProjectsView() {
  const { tasks, view, loading, error, setView, setTasks, setLoading, setError, lastFetched } =
    useTasksStore()

  // Fetch from Notion on mount if stale (2-min TTL)
  useEffect(() => {
    const isStale = !lastFetched || Date.now() - lastFetched > 2 * 60 * 1000
    if (!import.meta.env.VITE_NOTION_API_KEY || !isStale) return

    setLoading(true)
    fetchTasks()
      .then(setTasks)
      .catch((err: Error) => {
        console.warn('Notion tasks fetch failed, using seed data:', err.message)
        setError(null)
        setLoading(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    if (!import.meta.env.VITE_NOTION_API_KEY) return
    setLoading(true)
    fetchTasks()
      .then(setTasks)
      .catch((err: Error) => setError(err.message))
  }

  const openTasks = tasks.filter((t) => t.status !== 'done')
  const doneTasks = tasks.filter((t) => t.status === 'done')

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <FolderKanban size={18} color="var(--accent)" />
            <h1
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              Tasks & Projects
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '28px' }}>
            {openTasks.length} open · {doneTasks.length} done
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* View toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {[
              { v: 'list' as const, icon: LayoutList, label: 'List' },
              { v: 'kanban' as const, icon: Columns, label: 'Board' },
            ].map(({ v, icon: Icon, label }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  background: view === v ? 'var(--accent-glow)' : 'transparent',
                  border: 'none',
                  borderRight: v === 'list' ? '1px solid var(--border-default)' : 'none',
                  color: view === v ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: view === v ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Sync button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '7px 13px',
              color: 'var(--text-secondary)',
              fontSize: '12.5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw size={12} />
            {loading ? 'Syncing…' : 'Sync Notion'}
          </button>
        </div>
      </div>

      {/* Banners */}
      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid var(--status-red)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '14px',
            fontSize: '13px',
            color: 'var(--status-red)',
          }}
        >
          {error} — showing cached data.
        </div>
      )}

      {!import.meta.env.VITE_NOTION_API_KEY && (
        <div
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid var(--accent-dim)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '14px',
            fontSize: '13px',
            color: 'var(--accent)',
          }}
        >
          ⚠️ Notion not connected — showing demo data. Add{' '}
          <code
            style={{
              fontFamily: 'DM Mono, monospace',
              background: 'var(--bg-elevated)',
              padding: '1px 5px',
              borderRadius: '3px',
              fontSize: '12px',
            }}
          >
            VITE_NOTION_API_KEY
          </code>{' '}
          to .env.local to sync real tasks.
        </div>
      )}

      {/* Quick add */}
      <QuickAdd />

      {/* Main view */}
      {view === 'list' ? (
        <TaskListView tasks={tasks} />
      ) : (
        <KanbanBoard tasks={tasks} />
      )}
    </div>
  )
}
