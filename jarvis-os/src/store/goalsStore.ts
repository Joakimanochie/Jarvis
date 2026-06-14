import { create } from 'zustand'
import type { Goal } from '@/types'

interface GoalsState {
  goals: Goal[]
  loading: boolean
  error: string | null
  lastFetched: number | null

  // Actions
  setGoals: (goals: Goal[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateProgress: (id: string, progress: number) => void
  toggleMilestone: (goalId: string, milestoneId: string) => void
  addWeeklyLog: (
    goalId: string,
    log: { week: string; progress: number; note: string }
  ) => void
}

// Seed data — used as fallback when Notion is not connected
const SEED_GOALS: Goal[] = [
  {
    id: 'goal_research',
    area: 'Research',
    title: 'Complete VLM First Aid project & publish findings',
    progress: 70,
    status: 'on_track',
    milestones: [
      { id: 'm1', text: 'Define research questions', done: true },
      { id: 'm2', text: 'Select and validate dataset', done: false },
      { id: 'm3', text: 'Build baseline model', done: false },
      { id: 'm4', text: 'Run evaluation suite', done: false },
      { id: 'm5', text: 'Write up findings', done: false },
    ],
    weeklyLog: [
      { week: '2026-W22', progress: 60, note: 'System requirements drafted' },
      { week: '2026-W23', progress: 70, note: 'Dataset shortlisted, evaluation metrics defined' },
    ],
  },
  {
    id: 'goal_business',
    area: 'Business',
    title: 'Launch MVP and acquire first 10 paying users',
    progress: 45,
    status: 'on_track',
    milestones: [
      { id: 'm1', text: 'Define core value proposition', done: true },
      { id: 'm2', text: 'Build landing page', done: true },
      { id: 'm3', text: 'Complete pitch deck v2', done: false },
      { id: 'm4', text: 'First 3 user interviews', done: false },
      { id: 'm5', text: 'Ship MVP', done: false },
    ],
    weeklyLog: [
      { week: '2026-W22', progress: 35, note: 'Value prop locked in' },
      { week: '2026-W23', progress: 45, note: 'Landing page live, gathering feedback' },
    ],
  },
  {
    id: 'goal_brand',
    area: 'Brand',
    title: 'Post consistently on LinkedIn — 3x per week',
    progress: 55,
    status: 'on_track',
    milestones: [
      { id: 'm1', text: 'Define 3 content pillars', done: true },
      { id: 'm2', text: 'Write bio and headline', done: true },
      { id: 'm3', text: 'Post 10 times total', done: false },
      { id: 'm4', text: 'Reach 500 followers', done: false },
    ],
    weeklyLog: [
      { week: '2026-W22', progress: 40, note: 'Content pillars set' },
      { week: '2026-W23', progress: 55, note: '6 posts published, good engagement on VLM thread' },
    ],
  },
  {
    id: 'goal_finance',
    area: 'Finance',
    title: 'Hit savings milestone and track all expenses monthly',
    progress: 30,
    status: 'needs_push',
    milestones: [
      { id: 'm1', text: 'Set monthly budget', done: true },
      { id: 'm2', text: 'Log all expenses in Notion', done: false },
      { id: 'm3', text: 'Hit 3-month savings target', done: false },
    ],
    weeklyLog: [
      { week: '2026-W22', progress: 25, note: 'Budget set, tracking inconsistent' },
      { week: '2026-W23', progress: 30, note: 'Improved tracking, 2 weeks consistent' },
    ],
  },
  {
    id: 'goal_ideas',
    area: 'Ideas',
    title: 'Ship one side project from the ideas backlog',
    progress: 20,
    status: 'needs_push',
    milestones: [
      { id: 'm1', text: 'Shortlist top 3 ideas', done: true },
      { id: 'm2', text: 'Build prototype for #1', done: false },
      { id: 'm3', text: 'Get 5 people to try it', done: false },
    ],
    weeklyLog: [
      { week: '2026-W22', progress: 15, note: 'Brainstormed 12 ideas' },
      { week: '2026-W23', progress: 20, note: 'Top 3 shortlisted' },
    ],
  },
  {
    id: 'goal_wellbeing',
    area: 'Wellbeing',
    title: 'Exercise 4x per week and protect deep work time',
    progress: 80,
    status: 'strong',
    milestones: [
      { id: 'm1', text: 'Set workout schedule', done: true },
      { id: 'm2', text: 'Block deep work hours in calendar', done: true },
      { id: 'm3', text: 'Consistent for 4 weeks', done: true },
      { id: 'm4', text: 'No-meeting Fridays', done: false },
    ],
    weeklyLog: [
      { week: '2026-W22', progress: 75, note: 'Exercised 4x, sleep improving' },
      { week: '2026-W23', progress: 80, note: 'Strong week — protected mornings all 5 days' },
    ],
  },
]

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: SEED_GOALS,
  loading: false,
  error: null,
  lastFetched: null,

  setGoals: (goals) => set({ goals, lastFetched: Date.now(), error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),

  updateProgress: (id, progress) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id
          ? {
              ...g,
              progress,
              status:
                progress >= 75 ? 'strong' : progress >= 50 ? 'on_track' : 'needs_push',
            }
          : g
      ),
    })),

  toggleMilestone: (goalId, milestoneId) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              milestones: g.milestones.map((m) =>
                m.id === milestoneId ? { ...m, done: !m.done } : m
              ),
            }
          : g
      ),
    })),

  addWeeklyLog: (goalId, log) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId
          ? { ...g, weeklyLog: [...g.weeklyLog, log] }
          : g
      ),
    })),
}))

// Derived selectors
export const selectOverallProgress = (goals: Goal[]) =>
  Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)

export const selectOnTrackCount = (goals: Goal[]) =>
  goals.filter((g) => g.status === 'strong' || g.status === 'on_track').length
