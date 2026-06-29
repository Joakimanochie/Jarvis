import { useState, useEffect } from 'react'
import { CheckCircle, Circle, AlertCircle, Mic, Volume2 } from 'lucide-react'
import { isObsidianRunning } from '@/integrations/obsidian'
import { isGoogleConfigured, isGoogleConnected, startGoogleAuth, disconnectGoogle } from '@/integrations/googleAuth'
import { getWakeWordEnabled, setWakeWordEnabled } from '@/store/wakeWordSettings'
import { getNarratorSettings, setNarratorSettings, type NarratorSettings } from '@/store/narratorSettings'
import { getFounderProfile, setFounderProfile, getPinnedContext, setPinnedContext, type FounderProfile } from '@/memory/contextInjector'

interface Integration {
  name: string
  key: string
  status: 'connected' | 'not_set' | 'checking' | 'offline'
}

const NOTION_KEY = import.meta.env.VITE_NOTION_API_KEY
const NVIDIA_KEY = import.meta.env.VITE_NVIDIA_API_KEY
const NEWS_KEY = import.meta.env.VITE_NEWS_API_KEY
const GOOGLE_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const OBSIDIAN_KEY = import.meta.env.VITE_OBSIDIAN_API_KEY

function ToggleSmall({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: '36px', height: '20px', borderRadius: '999px', border: 'none', flexShrink: 0,
        background: checked ? 'var(--accent)' : 'var(--bg-elevated)',
        boxShadow: checked ? 'none' : 'inset 0 0 0 1px var(--border-default)',
        cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease',
      }}
    >
      <span style={{
        position: 'absolute', top: '2px', left: checked ? '18px' : '2px',
        width: '16px', height: '16px', borderRadius: '50%',
        background: checked ? '#000' : 'var(--text-muted)',
        transition: 'left 0.2s ease',
      }} />
    </button>
  )
}

export default function Settings() {
  const [obsidianStatus, setObsidianStatus] = useState<'checking' | 'connected' | 'offline'>('checking')
  const [wakeEnabled, setWakeEnabledState] = useState(getWakeWordEnabled)
  const [narrator, setNarrator] = useState<NarratorSettings>(getNarratorSettings)
  const [profile, setProfile] = useState<FounderProfile>(getFounderProfile)
  const [pinned, setPinned] = useState(getPinnedContext)

  const toggleWakeWord = () => {
    const next = !wakeEnabled
    setWakeEnabledState(next)
    setWakeWordEnabled(next)
  }

  const patchNarrator = (patch: Partial<NarratorSettings>) => {
    const next = { ...narrator, ...patch }
    setNarrator(next)
    setNarratorSettings(next)
  }

  useEffect(() => {
    isObsidianRunning().then((running) => setObsidianStatus(running ? 'connected' : 'offline'))
  }, [])

  const googleStatus: Integration['status'] = !GOOGLE_ID
    ? 'not_set'
    : isGoogleConnected()
      ? 'connected'
      : 'offline'

  const integrations: Integration[] = [
    { name: 'Notion', key: 'VITE_NOTION_API_KEY', status: NOTION_KEY ? 'connected' : 'not_set' },
    {
      name: 'Kimi K2.6 (Nvidia NIM)',
      key: 'VITE_NVIDIA_API_KEY',
      status: NVIDIA_KEY ? 'connected' : 'not_set',
    },
    {
      name: 'Gmail',
      key: 'VITE_GOOGLE_CLIENT_ID',
      status: googleStatus,
    },
    {
      name: 'Google Calendar',
      key: 'VITE_GOOGLE_CLIENT_ID',
      status: googleStatus,
    },
    {
      name: 'Google Drive',
      key: 'VITE_GOOGLE_CLIENT_ID',
      status: googleStatus,
    },
    {
      name: 'Tavily Web Search',
      key: 'VITE_TAVILY_API_KEY',
      status: import.meta.env.VITE_TAVILY_API_KEY ? 'connected' : 'not_set',
    },
    {
      name: 'NewsAPI',
      key: 'VITE_NEWS_API_KEY',
      status: NEWS_KEY ? 'connected' : 'not_set',
    },
    {
      name: 'Obsidian Vault',
      key: 'VITE_OBSIDIAN_API_KEY',
      status: OBSIDIAN_KEY
        ? obsidianStatus === 'checking'
          ? 'checking'
          : obsidianStatus
        : 'not_set',
    },
  ]

  const StatusIcon = ({ status }: { status: Integration['status'] }) => {
    if (status === 'connected')
      return <CheckCircle size={14} color="var(--status-green)" />
    if (status === 'offline')
      return <AlertCircle size={14} color="var(--status-amber)" />
    return <Circle size={14} color="var(--text-muted)" />
  }

  const statusLabel = (s: Integration['status']) => {
    if (s === 'connected') return { text: 'Connected', color: 'var(--status-green)' }
    if (s === 'offline') return { text: 'Not running', color: 'var(--status-amber)' }
    if (s === 'checking') return { text: 'Checking…', color: 'var(--text-muted)' }
    return { text: 'Not connected', color: 'var(--text-muted)' }
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      <h2
        style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '4px',
        }}
      >
        Settings
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '28px' }}>
        Manage integrations, agent voice profile, and notification preferences.
      </p>

      {/* Integrations */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          Integrations
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {integrations.map((intg) => {
            const label = statusLabel(intg.status)
            return (
              <div
                key={intg.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
                    {intg.name}
                  </span>
                  {intg.status === 'not_set' && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        display: 'block',
                        fontFamily: 'DM Mono, monospace',
                      }}
                    >
                      Add {intg.key} to .env.local
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <StatusIcon status={intg.status} />
                  <span style={{ fontSize: '12px', color: label.color }}>{label.text}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Profile */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
        }}
      >
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
          Profile
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Name', defaultValue: 'Tobe' },
            { label: 'Timezone', defaultValue: 'Africa/Lagos (WAT, UTC+1)' },
          ].map(({ label, defaultValue }) => (
            <div key={label}>
              <label
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {label}
              </label>
              <input
                defaultValue={defaultValue}
                style={{
                  width: '100%',
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
            </div>
          ))}
        </div>
      </div>

      {/* Memory & Founder Profile */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          Memory & Context
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Communication Style (injected into every agent)
            </label>
            <input
              value={profile.communicationStyle}
              onChange={(e) => { const p = { ...profile, communicationStyle: e.target.value }; setProfile(p); setFounderProfile(p) }}
              style={{
                width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                borderRadius: '8px', padding: '8px 12px', color: 'var(--text-primary)', fontSize: '13px',
                outline: 'none', fontFamily: 'DM Sans, sans-serif',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Active Projects (comma-separated)
            </label>
            <input
              value={profile.activeProjects.join(', ')}
              onChange={(e) => { const p = { ...profile, activeProjects: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }; setProfile(p); setFounderProfile(p) }}
              style={{
                width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                borderRadius: '8px', padding: '8px 12px', color: 'var(--text-primary)', fontSize: '13px',
                outline: 'none', fontFamily: 'DM Sans, sans-serif',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Pinned Context (always injected — key constraints, important people, commitments)
            </label>
            <textarea
              value={pinned}
              onChange={(e) => { setPinned(e.target.value); setPinnedContext(e.target.value) }}
              rows={3}
              style={{
                width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                borderRadius: '8px', padding: '8px 12px', color: 'var(--text-primary)', fontSize: '13px',
                outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical',
              }}
              placeholder="e.g. Supervisor is Prof. Adewale. Paper deadline is August 15. Never schedule meetings before 9am."
            />
          </div>
        </div>
      </div>

      {/* Google section */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
        }}
      >
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
          Google Account
        </h3>
        {!isGoogleConfigured() ? (
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Add{' '}
            <code style={{ fontFamily: 'DM Mono, monospace', background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: '3px', fontSize: '11px' }}>
              VITE_GOOGLE_CLIENT_ID
            </code>{' '}
            and{' '}
            <code style={{ fontFamily: 'DM Mono, monospace', background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: '3px', fontSize: '11px' }}>
              VITE_GOOGLE_CLIENT_SECRET
            </code>{' '}
            to .env.local (from console.cloud.google.com) to enable Gmail and Calendar.
          </p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: isGoogleConnected() ? 'var(--status-green)' : 'var(--text-muted)' }}>
              {isGoogleConnected() ? 'Connected — Gmail and Calendar synced' : 'Not connected'}
            </span>
            <button
              onClick={() => {
                if (isGoogleConnected()) {
                  disconnectGoogle()
                  location.reload()
                } else {
                  startGoogleAuth()
                }
              }}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12.5px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              {isGoogleConnected() ? 'Disconnect' : 'Connect Google'}
            </button>
          </div>
        )}
      </div>

      {/* Wake Word section */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          Voice & Wake Word
        </h3>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Mic size={14} color="var(--accent)" />
              <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 500 }}>
                "Hey Jarvis" Wake Word
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
              Always-on listening in the background. Say <strong style={{ color: 'var(--text-secondary)' }}>"Hey Jarvis"</strong> or <strong style={{ color: 'var(--text-secondary)' }}>"Jarvis"</strong> to start recording. Chrome will request microphone permission.
              Works in Chrome and Edge only.
            </p>
          </div>

          {/* Toggle switch */}
          <button
            onClick={toggleWakeWord}
            title={wakeEnabled ? 'Disable wake word' : 'Enable wake word'}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '999px',
              border: 'none',
              background: wakeEnabled ? 'var(--accent)' : 'var(--bg-elevated)',
              boxShadow: wakeEnabled ? 'none' : 'inset 0 0 0 1px var(--border-default)',
              cursor: 'pointer',
              position: 'relative',
              flexShrink: 0,
              transition: 'background 0.2s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '3px',
                left: wakeEnabled ? '23px' : '3px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: wakeEnabled ? '#000' : 'var(--text-muted)',
                transition: 'left 0.2s ease',
              }}
            />
          </button>
        </div>

        {wakeEnabled && (
          <p style={{ fontSize: '11.5px', color: 'var(--accent)', marginTop: '12px', marginBottom: 0 }}>
            ● Active — listening for "Hey Jarvis" on the Home page command bar
          </p>
        )}
      </div>

      {/* Ambient Narrator section */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          Ambient Narrator
        </h3>

        {/* Master toggle */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Volume2 size={14} color="var(--accent)" />
              <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 500 }}>
                Proactive narration
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
              Jarvis speaks upcoming meetings, overdue tasks, and your morning briefing without being asked.
            </p>
          </div>
          <button
            onClick={() => patchNarrator({ enabled: !narrator.enabled })}
            style={{
              width: '44px', height: '24px', borderRadius: '999px', border: 'none', flexShrink: 0,
              background: narrator.enabled ? 'var(--accent)' : 'var(--bg-elevated)',
              boxShadow: narrator.enabled ? 'none' : 'inset 0 0 0 1px var(--border-default)',
              cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease',
            }}
          >
            <span style={{
              position: 'absolute', top: '3px', left: narrator.enabled ? '23px' : '3px',
              width: '18px', height: '18px', borderRadius: '50%',
              background: narrator.enabled ? '#000' : 'var(--text-muted)',
              transition: 'left 0.2s ease',
            }} />
          </button>
        </div>

        {narrator.enabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>

            {/* Meeting warning */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Warn before meetings</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={narrator.meetingWarningMins}
                  onChange={(e) => patchNarrator({ speakMeetings: true, meetingWarningMins: Number(e.target.value) })}
                  style={{
                    width: '52px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: '6px', padding: '4px 8px', color: 'var(--text-primary)', fontSize: '13px',
                    outline: 'none', textAlign: 'center',
                  }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>min before</span>
                <ToggleSmall checked={narrator.speakMeetings} onChange={(v) => patchNarrator({ speakMeetings: v })} />
              </div>
            </div>

            {/* Overdue tasks */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Announce overdue tasks</label>
              <ToggleSmall checked={narrator.speakOverdue} onChange={(v) => patchNarrator({ speakOverdue: v })} />
            </div>

            {/* Auto-brief hour */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Auto morning briefing at</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={narrator.autoBriefHour ?? ''}
                  onChange={(e) => patchNarrator({ autoBriefHour: e.target.value === '' ? null : Number(e.target.value) })}
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: '6px', padding: '4px 8px', color: 'var(--text-primary)',
                    fontSize: '13px', outline: 'none',
                  }}
                >
                  <option value="">Off</option>
                  {[6,7,8,9,10,11].map((h) => (
                    <option key={h} value={h}>{h}:00 {h < 12 ? 'AM' : 'PM'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quiet hours */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Quiet hours</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <select
                  value={narrator.quietStart ?? ''}
                  onChange={(e) => patchNarrator({ quietStart: e.target.value === '' ? null : Number(e.target.value) })}
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: '6px', padding: '4px 8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
                  }}
                >
                  <option value="">Off</option>
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>{h}:00</option>
                  ))}
                </select>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>to</span>
                <select
                  value={narrator.quietEnd ?? ''}
                  onChange={(e) => patchNarrator({ quietEnd: e.target.value === '' ? null : Number(e.target.value) })}
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: '6px', padding: '4px 8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
                  }}
                >
                  <option value="">Off</option>
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>{h}:00</option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Obsidian section */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
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
          Obsidian Vault
        </h3>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Install the{' '}
          <strong style={{ color: 'var(--text-secondary)' }}>Local REST API</strong> plugin in
          Obsidian and enable HTTP on port 27123. Add your API key to{' '}
          <code
            style={{
              fontFamily: 'DM Mono, monospace',
              background: 'var(--bg-elevated)',
              padding: '1px 5px',
              borderRadius: '3px',
              fontSize: '11px',
            }}
          >
            .env.local
          </code>
          .
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {obsidianStatus === 'connected' ? (
            <CheckCircle size={14} color="var(--status-green)" />
          ) : obsidianStatus === 'offline' ? (
            <AlertCircle size={14} color="var(--status-amber)" />
          ) : (
            <Circle size={14} color="var(--text-muted)" />
          )}
          <span
            style={{
              fontSize: '12.5px',
              color:
                obsidianStatus === 'connected'
                  ? 'var(--status-green)'
                  : obsidianStatus === 'offline'
                    ? 'var(--status-amber)'
                    : 'var(--text-muted)',
            }}
          >
            {obsidianStatus === 'connected'
              ? 'Vault connected on port 27123'
              : obsidianStatus === 'offline'
                ? 'Obsidian not running — open the app to enable vault sync'
                : 'Checking…'}
          </span>
        </div>
      </div>
    </div>
  )
}
