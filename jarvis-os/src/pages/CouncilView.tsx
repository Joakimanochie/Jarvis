import { Landmark } from 'lucide-react'
import { runCouncilAgent } from '@/agents/councilAgent'
import MiniChat from '@/components/agent/MiniChat'

export default function CouncilView() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Landmark size={18} color="#a78bfa" />
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
          The Council
        </h1>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '28px', marginBottom: '20px' }}>
        Five advisers debate your decision, then the Chairman delivers a verdict.
      </p>

      <MiniChat
        runner={runCouncilAgent}
        color="#a78bfa"
        placeholder="Describe a decision for the Council to debate…"
        examples={[
          'Run the Council on raising a pre-seed round now vs. bootstrapping for 6 more months',
          'Challenge my thinking on pivoting Jarvis OS into a paid product',
        ]}
      />
    </div>
  )
}
