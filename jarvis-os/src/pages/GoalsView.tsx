import { useEffect } from 'react'
import { RefreshCw, Target } from 'lucide-react'
import { useGoalsStore, selectOverallProgress, selectOnTrackCount } from '@/store/goalsStore'
import { fetchGoals } from '@/integrations/notion'
import GoalRadar from '@/components/goals/GoalRadar'
import GoalCard from '@/components/goals/GoalCard'
import WeeklyLogTable from '@/components/goals/WeeklyLogTable'

export default function GoalsView() {
  const { goals, loading, error, setGoals, setLoading, setError, lastFetched } = useGoalsStore()

  const overallProgress = selectOverallProgress(goals)
  const onTrackCount = selectOnTrackCount(goals)

  // Fetch from Notion on mount (only if API key is set and data is stale)
  useEffect(() => {
    const isStale = !lastFetched || Date.now() - lastFetched > 10 * 60 * 1000 // 10 min TTL
    if (!import.meta.env.VITE_NOTION_API_KEY || !isStale) return

    setLoading(true)
    fetchGoals()
      .then(setGoals)
      .catch((err: Error) => {
        console.warn('Notion goals fetch failed, using seed data:', err.message)
        setError(null) // suppress error — seed data is shown
        setLoading(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    if (!import.meta.env.VITE_NOTION_API_KEY) return
    setLoading(true)
    fetchGoals()
      .then(setGoals)
      .catch((err: Error) => {
        setError(err.message)
      })
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Target size={18} color="var(--accent)" />
            <h1
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              Goals & Progress
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '28px' }}>
            {onTrackCount} of 6 areas on track · Overall{' '}
            <strong style={{ color: 'var(--accent)' }}>{overallProgress}%</strong>
          </p>
        </div>

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
            padding: '8px 14px',
            color: 'var(--text-secondary)',
            fontSize: '12.5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Syncing…' : 'Sync Notion'}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid var(--status-red)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            color: 'var(--status-red)',
          }}
        >
          {error} — showing cached data.
        </div>
      )}

      {/* Not connected notice */}
      {!import.meta.env.VITE_NOTION_API_KEY && (
        <div
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid var(--accent-dim)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
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
          to .env.local to sync real data.
        </div>
      )}

      {/* Main layout: radar left, cards right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          gap: '20px',
          marginBottom: '20px',
          alignItems: 'start',
        }}
      >
        {/* Radar chart */}
        <GoalRadar goals={goals} />

        {/* Goal cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </div>

      {/* Weekly log table */}
      <WeeklyLogTable goals={goals} />
    </div>
  )
}
