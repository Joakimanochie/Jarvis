import { GraduationCap } from 'lucide-react'
import { runLearningAgent } from '@/agents/learningAgent'
import MiniChat from '@/components/agent/MiniChat'

export default function LearningView() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <GraduationCap size={18} color="#60a5fa" />
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Learning
        </h1>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '28px', marginBottom: '20px' }}>
        A Socratic tutor connected to your active goals and research tasks.
      </p>

      <MiniChat
        runner={runLearningAgent}
        color="#60a5fa"
        placeholder="Ask Jarvis to teach, explain, or quiz you…"
        examples={[
          'Create a learning plan for transformer architectures',
          'Explain diffusion models to me',
          'Quiz me on Nigerian fintech regulation',
          'What should I study this week?',
        ]}
      />
    </div>
  )
}
