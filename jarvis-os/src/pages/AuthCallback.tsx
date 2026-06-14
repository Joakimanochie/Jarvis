import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { handleGoogleCallback } from '@/integrations/googleAuth'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [message, setMessage] = useState('Connecting your Google account…')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')

    if (error) {
      setStatus('error')
      setMessage(`Google declined: ${error}`)
      return
    }
    if (!code) {
      setStatus('error')
      setMessage('No authorization code returned.')
      return
    }

    handleGoogleCallback(code)
      .then(() => {
        setStatus('success')
        setMessage('Google account connected.')
        setTimeout(() => navigate('/settings'), 1200)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Connection failed')
      })
  }, [navigate])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '12px',
        color: 'var(--text-secondary)',
      }}
    >
      {status === 'pending' && <Loader2 size={28} color="var(--accent)" className="spin" />}
      {status === 'success' && <CheckCircle size={28} color="var(--status-green)" />}
      {status === 'error' && <XCircle size={28} color="var(--status-amber)" />}
      <p style={{ fontSize: '14px' }}>{message}</p>
    </div>
  )
}
