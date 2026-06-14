import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
  emoji?: string
}

interface ToastState {
  toasts: Toast[]
  show: (message: string, emoji?: string) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (message, emoji) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    set((state) => ({ toasts: [...state.toasts, { id, message, emoji }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },

  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
