import { Sparkles, RefreshCw, Loader2 } from 'lucide-react'
import { useMorningBrief } from '@/hooks/useMorningBrief'

export default function BriefingBar() {
  const { brief, loading, error, regenerate } = useMorningBrief()

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={14} color="var(--accent)" />
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--accent)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Morning Brief
          </span>
        </div>
        <button
          onClick={regenerate}
          disabled={loading}
          style={{
            background: 'none',
            border: 'none',
            cursor: loading ? 'default' : 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'color 0.15s ease',
          }}
        >
          {loading ? <Loader2 size={12} className="spin" /> : <RefreshCw size={12} />}
          Regenerate
        </button>
      </div>

      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '13.5px',
          lineHeight: '1.6',
          fontStyle: 'italic',
        }}
      >
        {error
          ? `⚠️ ${error}`
          : loading && !brief
            ? 'Generating your brief…'
            : brief}
      </p>
    </div>
  )
}
