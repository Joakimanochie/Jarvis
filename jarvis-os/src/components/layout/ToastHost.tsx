import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore } from '@/store/toastStore'

export default function ToastHost() {
  const { toasts, dismiss } = useToastStore()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            onClick={() => dismiss(t.id)}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              borderRadius: '10px',
              padding: '10px 16px',
              fontSize: '13px',
              color: 'var(--text-primary)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {t.emoji && <span>{t.emoji}</span>}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
