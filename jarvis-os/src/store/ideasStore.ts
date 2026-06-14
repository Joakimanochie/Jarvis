import { create } from 'zustand'
import type { Idea } from '@/types'
import { fetchIdeas, saveIdea, updateIdeaStatus } from '@/integrations/notion'
import { useToastStore } from '@/store/toastStore'

interface IdeasState {
  ideas: Idea[]
  loading: boolean
  connected: boolean

  fetchAll: () => Promise<void>
  addIdea: (text: string, project: Idea['project']) => void
  setStatus: (id: string, status: Idea['status']) => void
}

const SEED_IDEAS: Idea[] = [
  {
    id: 'idea_1',
    text: 'Browser extension that auto-summarises any paper into a 3-bullet brief',
    project: 'research',
    status: 'new',
    createdAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
  },
  {
    id: 'idea_2',
    text: 'Weekly "build log" LinkedIn series documenting Jarvis OS progress',
    project: 'brand',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 1 * 86400_000).toISOString(),
  },
  {
    id: 'idea_3',
    text: 'Notion template pack for solo founders — sell as a small digital product',
    project: 'business',
    status: 'new',
    createdAt: new Date().toISOString(),
  },
]

const NOTION_IDEAS_DB_ID = import.meta.env.VITE_NOTION_IDEAS_DB_ID as string

export const useIdeasStore = create<IdeasState>((set, get) => ({
  ideas: SEED_IDEAS,
  loading: false,
  connected: Boolean(NOTION_IDEAS_DB_ID),

  fetchAll: async () => {
    if (!NOTION_IDEAS_DB_ID) return
    set({ loading: true })
    try {
      const ideas = await fetchIdeas()
      set({ ideas: ideas.length > 0 ? ideas : get().ideas, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  addIdea: (text, project) => {
    const idea: Idea = {
      id: `idea_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text,
      project,
      status: 'new',
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ ideas: [idea, ...state.ideas] }))
    useToastStore.getState().show('Idea saved', '💡')

    if (NOTION_IDEAS_DB_ID) {
      saveIdea(idea)
        .then((notionId) =>
          set((state) => ({
            ideas: state.ideas.map((i) => (i.id === idea.id ? { ...i, notionId } : i)),
          }))
        )
        .catch(console.warn)
    }
  },

  setStatus: (id, status) => {
    set((state) => ({ ideas: state.ideas.map((i) => (i.id === id ? { ...i, status } : i)) }))
    const idea = get().ideas.find((i) => i.id === id)
    if (idea?.notionId) {
      updateIdeaStatus(idea.notionId, status).catch(console.warn)
    }
  },
}))
