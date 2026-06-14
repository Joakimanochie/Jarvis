import { create } from 'zustand'
import type { PostDraft } from '@/types'
import { useToastStore } from '@/store/toastStore'

interface PostsState {
  posts: PostDraft[]
  addDraft: (topic: string, content: string) => PostDraft
  setStatus: (id: string, status: PostDraft['status']) => void
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],

  addDraft: (topic, content) => {
    const draft: PostDraft = {
      id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      topic,
      content,
      status: 'draft',
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ posts: [draft, ...state.posts] }))
    useToastStore.getState().show('Post drafted', '📣')
    return draft
  },

  setStatus: (id, status) =>
    set((state) => ({ posts: state.posts.map((p) => (p.id === id ? { ...p, status } : p)) })),
}))
