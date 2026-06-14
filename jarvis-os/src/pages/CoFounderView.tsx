import { useState, useEffect } from 'react'
import { Handshake, ClipboardList, Lightbulb } from 'lucide-react'
import { runCofounderAgent, readLog, DECISIONS_KEY, LESSONS_KEY, type LogEntry } from '@/agents/cofounderAgent'
import MiniChat from '@/components/agent/MiniChat'

function LogPanel({ title, icon: Icon, entries }: { title: string; icon: typeof ClipboardList; entries: LogEntry[] }) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '16px',
        flex: 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <Icon size={14} color="var(--text-muted)" />
        <span
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>
      </div>
      {entries.length === 0 ? (
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Nothing logged yet. Say "Log {title.toLowerCase().slice(0, -1)}: …" to the Co-Founder.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {entries.map((e, i) => (
            <div key={i} style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>{e.date}</span>{' '}
              — {e.text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CoFounderView() {
  const [decisions, setDecisions] = useState<LogEntry[]>([])
  const [lessons, setLessons] = useState<LogEntry[]>([])

  function refresh() {
    setDecisions(readLog(DECISIONS_KEY))
    setLessons(readLog(LESSONS_KEY))
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Handshake size={18} color="var(--accent)" />
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Co-Founder
        </h1>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '28px', marginBottom: '20px' }}>
        Direct strategic input. Tracks your decisions and lessons across sessions.
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <LogPanel title="Decisions" icon={ClipboardList} entries={decisions} />
        <LogPanel title="Lessons" icon={Lightbulb} entries={lessons} />
      </div>

      <MiniChat
        runner={async (input, onToken, signal) => {
          const result = await runCofounderAgent(input, onToken, signal)
          refresh()
          return result
        }}
        color="var(--accent)"
        placeholder="Ask for strategic input, or 'Log decision: …' / 'Log lesson: …'"
        examples={[
          'What should I be focused on this week?',
          'Am I working on the right things?',
          'Log decision: Ship Jarvis OS Day 7 without onboarding flow',
          'Synthesise all agent reports',
        ]}
      />
    </div>
  )
}
