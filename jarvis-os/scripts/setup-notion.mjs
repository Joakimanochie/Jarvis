/**
 * One-time Notion setup: configure Goals DB schema, seed 6 goals,
 * create Tasks DB under the Jarvis page.
 * Run: node scripts/setup-notion.mjs
 */
import { readFileSync } from 'fs'

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const KEY = env.match(/VITE_NOTION_API_KEY=\s*(\S+)/)?.[1]
const GOALS_DB = '37690e11e76c8048bc06defa462acdc2'
const JARVIS_PAGE = '36f90e11-e76c-81c9-9f5b-e015ae7d7036'

const headers = {
  Authorization: `Bearer ${KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
}

async function notion(path, method = 'GET', body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`${path}: ${json.message}`)
  return json
}

// ── 1. Update Goals DB schema ────────────────────────────────────────────────
console.log('1. Updating Goals DB schema…')
await notion(`/databases/${GOALS_DB}`, 'PATCH', {
  title: [{ text: { content: 'Goals Database' } }],
  properties: {
    Name: { name: 'Title' }, // rename title property
    Area: {
      select: {
        options: [
          { name: 'Research', color: 'purple' },
          { name: 'Business', color: 'yellow' },
          { name: 'Brand', color: 'pink' },
          { name: 'Finance', color: 'green' },
          { name: 'Ideas', color: 'blue' },
          { name: 'Wellbeing', color: 'orange' },
        ],
      },
    },
    Progress: { number: { format: 'percent' } },
    Status: {
      select: {
        options: [
          { name: 'strong', color: 'green' },
          { name: 'on_track', color: 'yellow' },
          { name: 'needs_push', color: 'red' },
        ],
      },
    },
    Milestones: { rich_text: {} },
    WeeklyLog: { rich_text: {} },
  },
})
console.log('   ✓ Schema set: Title, Area, Progress, Status, Milestones, WeeklyLog')

// ── 2. Seed the 6 goals (skip if already present) ───────────────────────────
const existing = await notion(`/databases/${GOALS_DB}/query`, 'POST', { page_size: 10 })
if (existing.results.length > 0) {
  console.log(`2. Goals DB already has ${existing.results.length} pages — skipping seed`)
} else {
  console.log('2. Seeding 6 goals…')
  const goals = [
    {
      area: 'Research', title: 'Complete VLM First Aid project & publish findings', progress: 70, status: 'on_track',
      milestones: [
        { id: 'm1', text: 'Define research questions', done: true },
        { id: 'm2', text: 'Select and validate dataset', done: false },
        { id: 'm3', text: 'Build baseline model', done: false },
        { id: 'm4', text: 'Run evaluation suite', done: false },
        { id: 'm5', text: 'Write up findings', done: false },
      ],
      weeklyLog: [
        { week: '2026-W22', progress: 60, note: 'System requirements drafted' },
        { week: '2026-W23', progress: 70, note: 'Dataset shortlisted, metrics defined' },
      ],
    },
    {
      area: 'Business', title: 'Launch MVP and acquire first 10 paying users', progress: 45, status: 'on_track',
      milestones: [
        { id: 'm1', text: 'Define core value proposition', done: true },
        { id: 'm2', text: 'Build landing page', done: true },
        { id: 'm3', text: 'Complete pitch deck v2', done: false },
        { id: 'm4', text: 'First 3 user interviews', done: false },
        { id: 'm5', text: 'Ship MVP', done: false },
      ],
      weeklyLog: [
        { week: '2026-W22', progress: 35, note: 'Value prop locked in' },
        { week: '2026-W23', progress: 45, note: 'Landing page live' },
      ],
    },
    {
      area: 'Brand', title: 'Post consistently on LinkedIn — 3x per week', progress: 55, status: 'on_track',
      milestones: [
        { id: 'm1', text: 'Define 3 content pillars', done: true },
        { id: 'm2', text: 'Write bio and headline', done: true },
        { id: 'm3', text: 'Post 10 times total', done: false },
        { id: 'm4', text: 'Reach 500 followers', done: false },
      ],
      weeklyLog: [
        { week: '2026-W22', progress: 40, note: 'Content pillars set' },
        { week: '2026-W23', progress: 55, note: '6 posts published' },
      ],
    },
    {
      area: 'Finance', title: 'Hit savings milestone and track all expenses monthly', progress: 30, status: 'needs_push',
      milestones: [
        { id: 'm1', text: 'Set monthly budget', done: true },
        { id: 'm2', text: 'Log all expenses in Notion', done: false },
        { id: 'm3', text: 'Hit 3-month savings target', done: false },
      ],
      weeklyLog: [
        { week: '2026-W22', progress: 25, note: 'Budget set, tracking inconsistent' },
        { week: '2026-W23', progress: 30, note: '2 weeks consistent tracking' },
      ],
    },
    {
      area: 'Ideas', title: 'Ship one side project from the ideas backlog', progress: 20, status: 'needs_push',
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
      area: 'Wellbeing', title: 'Exercise 4x per week and protect deep work time', progress: 80, status: 'strong',
      milestones: [
        { id: 'm1', text: 'Set workout schedule', done: true },
        { id: 'm2', text: 'Block deep work hours in calendar', done: true },
        { id: 'm3', text: 'Consistent for 4 weeks', done: true },
        { id: 'm4', text: 'No-meeting Fridays', done: false },
      ],
      weeklyLog: [
        { week: '2026-W22', progress: 75, note: 'Exercised 4x, sleep improving' },
        { week: '2026-W23', progress: 80, note: 'Protected mornings all 5 days' },
      ],
    },
  ]

  for (const g of goals) {
    await notion('/pages', 'POST', {
      parent: { database_id: GOALS_DB },
      properties: {
        Title: { title: [{ text: { content: g.title } }] },
        Area: { select: { name: g.area } },
        Progress: { number: g.progress / 100 },
        Status: { select: { name: g.status } },
        Milestones: { rich_text: [{ text: { content: JSON.stringify(g.milestones) } }] },
        WeeklyLog: { rich_text: [{ text: { content: JSON.stringify(g.weeklyLog) } }] },
      },
    })
    console.log(`   ✓ ${g.area}`)
  }
}

// ── 3. Create Tasks DB (if missing) ─────────────────────────────────────────
console.log('3. Creating Tasks Database…')
const search = await notion('/search', 'POST', {
  query: 'Tasks Database',
  filter: { property: 'object', value: 'database' },
})
let tasksDb = search.results.find(
  (r) => r.title?.[0]?.plain_text === 'Tasks Database'
)

if (tasksDb) {
  console.log(`   ✓ Already exists: ${tasksDb.id}`)
} else {
  tasksDb = await notion('/databases', 'POST', {
    parent: { type: 'page_id', page_id: JARVIS_PAGE },
    title: [{ text: { content: 'Tasks Database' } }],
    properties: {
      Title: { title: {} },
      Project: {
        select: {
          options: [
            { name: 'research', color: 'purple' },
            { name: 'business', color: 'yellow' },
            { name: 'brand', color: 'pink' },
            { name: 'ideas', color: 'blue' },
            { name: 'finance', color: 'green' },
          ],
        },
      },
      Status: {
        select: {
          options: [
            { name: 'todo', color: 'gray' },
            { name: 'in_progress', color: 'blue' },
            { name: 'done', color: 'green' },
            { name: 'blocked', color: 'red' },
          ],
        },
      },
      Priority: {
        select: {
          options: [
            { name: 'high', color: 'red' },
            { name: 'medium', color: 'yellow' },
            { name: 'low', color: 'gray' },
          ],
        },
      },
      'Due Date': { date: {} },
      'Agent Created': { checkbox: {} },
    },
  })
  console.log(`   ✓ Created: ${tasksDb.id}`)
}

console.log('\nDONE')
console.log(`GOALS_DB_ID=${GOALS_DB}`)
console.log(`TASKS_DB_ID=${tasksDb.id.replace(/-/g, '')}`)
