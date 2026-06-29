import { getSkillRegistry, type Skill } from '@/integrations/skillsLoader'

const AGENT_COLORS: Record<string, string> = {
  ops: '#F59E0B',
  brand: '#8B5CF6',
  comms: '#3B82F6',
  research: '#10B981',
  finance: '#EF4444',
  news: '#F97316',
  council: '#EC4899',
  cofounder: '#6366F1',
  learning: '#14B8A6',
  all: 'var(--text-muted)',
}

export default function SkillsView() {
  const skills = getSkillRegistry()

  return (
    <div style={{ maxWidth: '720px' }}>
      <h2
        style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '4px',
        }}
      >
        Skills
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
        {skills.length} skills loaded. Drop a <code style={{ fontFamily: 'DM Mono, monospace', background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: '3px', fontSize: '11px' }}>.md</code> file
        into <code style={{ fontFamily: 'DM Mono, monospace', background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: '3px', fontSize: '11px' }}>skills/</code> to add a new one.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {skills.map((skill) => (
          <SkillCard key={skill.fileName} skill={skill} />
        ))}
      </div>

      {skills.length === 0 && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          No skills found. Add <code>.md</code> files to <code>skills/</code> to get started.
        </div>
      )}
    </div>
  )
}

function SkillCard({ skill }: { skill: Skill }) {
  const agentColor = AGENT_COLORS[skill.agent] ?? 'var(--text-muted)'

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '16px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {skill.name}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'DM Mono, monospace',
            color: agentColor,
            background: `${agentColor}15`,
            border: `1px solid ${agentColor}30`,
            borderRadius: '999px',
            padding: '2px 8px',
          }}
        >
          {skill.agent}
        </span>
      </div>

      {skill.description && (
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 10px 0', lineHeight: '1.4' }}>
          {skill.description}
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {skill.triggerPhrases.map((phrase) => (
          <span
            key={phrase}
            style={{
              fontSize: '11px',
              fontFamily: 'DM Mono, monospace',
              color: 'var(--text-secondary)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '2px 8px',
            }}
          >
            "{phrase}"
          </span>
        ))}
      </div>

      {skill.toolsNeeded.length > 0 && (
        <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
          Tools: {skill.toolsNeeded.join(', ')}
        </div>
      )}
    </div>
  )
}
