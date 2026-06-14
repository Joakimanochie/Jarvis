import { create } from 'zustand'
import type { Task } from '@/types'

interface TasksState {
  tasks: Task[]
  loading: boolean
  error: string | null
  lastFetched: number | null
  view: 'list' | 'kanban'

  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  completeTask: (id: string) => void
  removeTask: (id: string) => void
  setLoading: (v: boolean) => void
  setError: (v: string | null) => void
  setView: (v: 'list' | 'kanban') => void
}

const SEED_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Review VLM dataset options',
    project: 'research',
    status: 'todo',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0], // today
    agentCreated: false,
  },
  {
    id: 't2',
    title: 'Define evaluation metrics for first-aid model',
    project: 'research',
    status: 'in_progress',
    priority: 'high',
    agentCreated: false,
  },
  {
    id: 't3',
    title: 'Literature review — visual language models in healthcare',
    project: 'research',
    status: 'todo',
    priority: 'medium',
    agentCreated: false,
  },
  {
    id: 't4',
    title: 'Draft pitch deck v2',
    project: 'business',
    status: 'todo',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0], // today
    agentCreated: false,
  },
  {
    id: 't5',
    title: 'Market sizing analysis',
    project: 'business',
    status: 'in_progress',
    priority: 'medium',
    agentCreated: false,
  },
  {
    id: 't6',
    title: 'Competitor research — AI health startups',
    project: 'business',
    status: 'todo',
    priority: 'low',
    agentCreated: false,
  },
  {
    id: 't7',
    title: 'Write LinkedIn post on VLMs in clinical settings',
    project: 'brand',
    status: 'todo',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0], // today
    agentCreated: false,
  },
  {
    id: 't8',
    title: 'Schedule 3 posts this week',
    project: 'brand',
    status: 'in_progress',
    priority: 'medium',
    agentCreated: false,
  },
  {
    id: 't9',
    title: 'Prototype AI triage concept',
    project: 'ideas',
    status: 'todo',
    priority: 'medium',
    agentCreated: false,
  },
  {
    id: 't10',
    title: 'Log monthly expenses in Notion',
    project: 'finance',
    status: 'blocked',
    priority: 'medium',
    agentCreated: false,
  },
]

export const useTasksStore = create<TasksState>((set) => ({
  tasks: SEED_TASKS,
  loading: false,
  error: null,
  lastFetched: null,
  view: 'list',

  setTasks: (tasks) => set({ tasks, lastFetched: Date.now(), error: null }),

  addTask: (task) =>
    set((state) => ({ tasks: [task, ...state.tasks] })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  completeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: 'done' as const } : t
      ),
    })),

  removeTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setView: (view) => set({ view }),
}))

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectTasksByProject = (tasks: Task[], project: Task['project'] | 'all') =>
  project === 'all' ? tasks : tasks.filter((t) => t.project === project)

export const selectTasksByStatus = (tasks: Task[], status: Task['status'] | 'all') =>
  status === 'all' ? tasks : tasks.filter((t) => t.status === status)

export const selectTodaysTasks = (tasks: Task[]) => {
  const today = new Date().toISOString().split('T')[0]
  return tasks.filter(
    (t) => t.dueDate === today && t.status !== 'done'
  )
}

export const selectOpenTasksByProject = (tasks: Task[], project: Task['project'], limit = 3) =>
  tasks
    .filter((t) => t.project === project && t.status !== 'done')
    .sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 }
      return p[a.priority] - p[b.priority]
    })
    .slice(0, limit)

export const isOverdue = (task: Task) => {
  if (!task.dueDate || task.status === 'done') return false
  return task.dueDate < new Date().toISOString().split('T')[0]
}
