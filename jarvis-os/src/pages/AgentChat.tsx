import { useCallback, useEffect, useState } from 'react'
import { Bot, Send, Loader2 } from 'lucide-react'
import { runJarvis } from '@/agents/orchestrator'
import { useAgentStore } from '@/store/agentStore'
import { isKimiConfigured } from '@/integrations/kimi'
import AgentPanel from '@/components/agent/AgentPanel'
import { usePushToTalk } from '@/hooks/usePushToTalk'
import { useFileAttachment, buildAttachedInput } from '@/hooks/useFileAttachment'
import MicButton from '@/components/ui/MicButton'
import AttachButton from '@/components/ui/AttachButton'
import FileChip from '@/components/ui/FileChip'

export default function AgentChat() {
  const [value, setValue] = useState('')
  const busy = useAgentStore((s) => s.busy)
  const exchanges = useAgentStore((s) => s.exchanges)
  const fileAttach = useFileAttachment()

  const submit = useCallback(
    (input: string) => {
      const enriched = buildAttachedInput(input, fileAttach.attachedFile, fileAttach.attachedText, fileAttach.fileType)
      const trimmed = enriched.trim()
      if (!trimmed || busy) return
      setValue('')
      fileAttach.clearFile()
      runJarvis(trimmed)
    },
    [busy, fileAttach]
  )

  const { state: pttState, interimTranscript, toggle: toggleMic, supported: micSupported } = usePushToTalk({
    onTranscript: (text) => submit(text),
  })

  useEffect(() => {
    if (interimTranscript) setValue(interimTranscript)
  }, [interimTranscript])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit(value)
  }

  const isRecording = pttState === 'recording'

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Bot size={18} color="var(--accent)" />
        <h1
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          Agent Chat
        </h1>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '28px', marginBottom: '20px' }}>
        Powered by Kimi K2.6 via Nvidia NIM · intent-routed to the right agent
      </p>

      {!isKimiConfigured() && (
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
          ⚠️ AI engine not connected. Get an API key from{' '}
          <strong>build.nvidia.com/moonshotai/kimi-k2.6</strong> and add{' '}
          <code
            style={{
              fontFamily: 'DM Mono, monospace',
              background: 'var(--bg-elevated)',
              padding: '1px 5px',
              borderRadius: '3px',
              fontSize: '12px',
            }}
          >
            VITE_NVIDIA_API_KEY
          </code>{' '}
          to .env.local, then restart the dev server.
        </div>
      )}

      {exchanges.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '48px 20px',
            textAlign: 'center',
            marginBottom: '16px',
          }}
        >
          <Bot size={28} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>
            Talk to Jarvis
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
            Try: "Add task: finalise dataset to research" · "What are my top 3 priorities?" ·
            "Update research goal to 75%"
          </p>
        </div>
      ) : (
        <AgentPanel />
      )}

      {/* Input */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-elevated)',
            border: `1px solid ${isRecording ? '#ef4444' : 'var(--border-default)'}`,
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: isRecording ? '0 0 0 3px rgba(239,68,68,0.12)' : 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              isRecording
                ? 'Listening…'
                : pttState === 'transcribing'
                  ? 'Transcribing…'
                  : busy
                    ? 'Jarvis is thinking…'
                    : 'Message Jarvis… or press the mic'
            }
            disabled={busy || isRecording}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontFamily: 'DM Sans, sans-serif',
              opacity: busy ? 0.6 : 1,
            }}
          />
          <AttachButton onPress={fileAttach.pickFile} hasFile={!!fileAttach.attachedFile} disabled={busy || isRecording} />
          <MicButton state={pttState} supported={micSupported} onToggle={toggleMic} />
          {busy ? (
            <Loader2 size={15} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <button
              type="submit"
              disabled={!value.trim() || isRecording}
              style={{
                background: value.trim() && !isRecording ? 'var(--accent)' : 'var(--bg-hover)',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 8px',
                cursor: value.trim() && !isRecording ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Send size={13} color={value.trim() && !isRecording ? '#000' : 'var(--text-muted)'} />
            </button>
          )}
        </div>
        <input ref={fileAttach.inputRef} type="file" accept={fileAttach.accept} onChange={fileAttach.onFileChange} style={{ display: 'none' }} />
        {fileAttach.attachedFile && (
          <FileChip file={fileAttach.attachedFile} isProcessing={fileAttach.isProcessing} onClear={fileAttach.clearFile} />
        )}
      </form>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
