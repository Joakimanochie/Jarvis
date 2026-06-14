export interface Goal {
  id: string
  area: 'Research' | 'Business' | 'Brand' | 'Finance' | 'Ideas' | 'Wellbeing'
  title: string
  progress: number
  status: 'strong' | 'on_track' | 'needs_push'
  milestones: Milestone[]
  weeklyLog: WeeklyLog[]
}

export interface Milestone {
  id: string
  text: string
  done: boolean
}

export interface WeeklyLog {
  week: string
  progress: number
  note: string
}

export interface Task {
  id: string
  title: string
  project: 'research' | 'business' | 'brand' | 'ideas' | 'finance'
  status: 'todo' | 'in_progress' | 'done' | 'blocked'
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
  agentCreated: boolean
  notionId?: string
}

export interface AgentLog {
  id: string
  timestamp: string
  agent: string
  trigger: string
  action: string
  result: 'success' | 'error'
  output: string
}

export interface NewsStory {
  id: string
  headline: string
  source: string
  url: string
  publishedAt: string
  summary: string
  topic: NewsTopic
}

export type NewsTopic = 'ai' | 'tech' | 'nigeria' | 'world' | 'policy' | 'finance' | 'science'

export type TriageBucket = 'urgent' | 'reply' | 'fyi' | 'archive'

export interface EmailThread {
  id: string
  threadId: string
  sender: string
  senderEmail: string
  subject: string
  snippet: string
  date: string
  unread: boolean
  triage: TriageBucket
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  location?: string
  attendees?: string[]
  videoLink?: string
}

export interface Idea {
  id: string
  text: string
  project: 'research' | 'business' | 'brand' | 'ideas' | 'finance'
  status: 'new' | 'in_progress' | 'shipped' | 'archived'
  createdAt: string
  notionId?: string
}

export interface FinanceEntry {
  id: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  notes: string
  notionId?: string
}

export interface PostDraft {
  id: string
  topic: string
  content: string
  status: 'draft' | 'posted'
  createdAt: string
}
