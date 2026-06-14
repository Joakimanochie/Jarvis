import { useState, useEffect } from 'react'
import { CheckCircle, Circle, AlertCircle } from 'lucide-react'
import { isObsidianRunning } from '@/integrations/obsidian'
import { isGoogleConfigured, isGoogleConnected, startGoogleAuth, disconnectGoogle } from '@/integrations/googleAuth'

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

export default function Settings() {
  const [obsidianStatus, setObsidianStatus] = useState<'checking' | 'connected' | 'offline'>(
    'checking'
  )

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
