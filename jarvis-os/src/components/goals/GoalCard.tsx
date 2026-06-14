import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Edit3 } from 'lucide-react'
import type { Goal } from '@/types'
import { useGoalsStore } from '@/store/goalsStore'
import { updateGoalProgress, toggleMilestoneNotion } from '@/integrations/notion'

interface Props {
  goal: Goal
}

const AREA_COLORS: Record<Goal['area'], string> = {
  Research: '#818cf8',
  Business: '#f59e0b',
  Brand: '#f472b6',
  Finance: '#34d399',
  Ideas: '#60a5fa',
  Wellbeing: '#a78bfa',
}

const STATUS_CONFIG = {
  strong: { label: '🟢 Strong', color: 'var(--status-green)', bg: 'rgba(34,197,94,0.1)' },
  on_track: { label: '🟡 On Track', color: 'var(--status-amber)', bg: 'rgba(245,158,11,0.1)' },
  needs_push: { label: '🔴 Needs Push', color: 'var(--status-red)', bg: 'rgba(239,68,68,0.1)' },
}

export default function GoalCard({ goal }: Props) {
  const { updateProgress, toggleMilestone } = useGoalsStore()
  const [editingProgress, setEditingProgress] = useState(false)
  const [draftProgress, setDraftProgress] = useState(String(goal.progress))
  const inputRef = useRef<HTMLInputElement>(null)
  const color = AREA_COLORS[goal.area]
  const statusCfg = STATUS_CONFIG[goal.status]

  useEffect(() => {
    if (editingProgress) inputRef.current?.focus()
  }, [editingProgress])

  const saveProgress = async () => {
    const val = Math.min(100, Math.max(0, parseInt(draftProgress) || 0))
    updateProgress(goal.id, val)
    setEditingProgress(false)
    // Sync to Notion (fire-and-forget; errors handled gracefully)
    if (import.meta.env.VITE_NOTION_API_KEY) {
      updateGoalProgress(goal.id, val).catch(console.warn)
    }
  }

  const handleMilestoneToggle = async (milestoneId: string) => {
    toggleMilestone(goal.id, milestoneId)
    // Sync to Notion
    if (import.meta.env.VITE_NOTION_API_KEY) {
      const updated = goal.milestones.map((m) =>
        m.id === milestoneId ? { ...m, done: !m.done } : m
      )
      toggleMilestoneNotion(goal.id, updated).catch(console.warn)
    }
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '18px',
        borderLeft: `3px solid ${color}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '10px',
          gap: '12px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color,
              display: 'block',
              marginBottom: '4px',
            }}
          >
            {goal.area}
          </span>
          <p
            style={{
              fontSize: '13.5px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              lineHeight: '1.4',
            }}
          >
            {goal.title}
          </p>
        </div>

        {/* Status badge */}
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: statusCfg.color,
            background: statusCfg.bg,
            padding: '3px 8px',
            borderRadius: '20px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {statusCfg.label}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Progress</span>

          {/* Inline editable % */}
          {editingProgress ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                ref={inputRef}
                value={draftProgress}
                onChange={(e) => setDraftProgress(e.target.value)}
                onBlur={saveProgress}
                onKeyDown={(e) => e.key === 'Enter' && saveProgress()}
                style={{
                  width: '44px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--accent)',
                  borderRadius: '4px',
                  padding: '2px 4px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>%</span>
            </div>
          ) : (
            <button
              onClick={() => {
                setDraftProgress(String(goal.progress))
                setEditingProgress(true)
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontFamily: 'DM Mono, monospace',
                padding: '2px 4px',
                borderRadius: '4px',
              }}
            >
              {goal.progress}%
              <Edit3 size={10} />
            </button>
          )}
        </div>

        {/* Bar track */}
        <div
          style={{
            height: '6px',
            background: 'var(--bg-elevated)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: color,
              borderRadius: '3px',
            }}
          />
        </div>
      </div>

      {/* Milestones */}
      <div>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: '6px',
          }}
        >
          Milestones
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {goal.milestones.map((m) => (
            <button
              key={m.id}
              onClick={() => handleMilestoneToggle(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '3px 0',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  border: `1.5px solid ${m.done ? color : 'var(--border-strong)'}`,
                  background: m.done ? color : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                {m.done && <Check size={9} color="#000" strokeWidth={3} />}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: m.done ? 'var(--text-muted)' : 'var(--text-secondary)',
                  textDecoration: m.done ? 'line-through' : 'none',
                  lineHeight: '1.4',
                }}
              >
                {m.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
