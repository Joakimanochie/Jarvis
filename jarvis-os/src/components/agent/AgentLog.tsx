import { useState } from 'react'
import { ChevronDown, ChevronRight, ScrollText, Trash2 } from 'lucide-react'
import { useAgentStore, AGENT_META, type AgentName } from '@/store/agentStore'

export default function AgentLog() {
  const { logs, clearLogs } = useAgentStore()
  const [open, setOpen] = useState(false)

  if (logs.length === 0) return null

  return (
    <div
      style={{
        margin: '8px 12px 0',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <ScrollText size={11} />
        Agent Log
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: 'DM Mono, monospace',
            fontSize: '10px',
            background: 'var(--bg-hover)',
            padding: '1px 6px',
            borderRadius: '8px',
          }}
        >
          {logs.length}
        </span>
      </button>

      {/* Log entries */}
      {open && (
        <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '0 8px 8px' }}>
          {logs.map((log) => {
            const meta = AGENT_META[log.agent as AgentName] ?? {
              emoji: '🤖',
              color: 'var(--text-muted)',
              label: log.agent,
            }
            return (
              <div
                key={log.id}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  marginBottom: '2px',
                  fontSize: '10.5px',
                  lineHeight: '1.4',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>{meta.emoji}</span>
                  <span style={{ color: meta.color, fontWeight: 600 }}>
                    {log.result === 'error' ? '⚠️' : ''}
                  </span>
                  <span
                    style={{
                      fontFamily: 'DM Mono, monospace',
                      color: 'var(--text-muted)',
                      fontSize: '9.5px',
                      marginLeft: 'auto',
                    }}
                  >
                    {new Date(log.timestamp).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '1px' }}>{log.action}</div>
              </div>
            )
          })}

          <button
            onClick={clearLogs}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '10px',
              padding: '4px 8px',
              marginTop: '4px',
            }}
          >
            <Trash2 size={10} />
            Clear log
          </button>
        </div>
      )}
    </div>
  )
}
