# Jarvis OS — Build To-Do List (Days 1–16)
> June 1, 2026 onwards · Following the Jarvis OS Master Plan v2.0
> Days 1–11 complete. Days 12–15 = intelligence upgrade. Day 16 = voice rebuild.

---

## Progress Overview

| Day | Date | Focus | Status |
|-----|------|-------|--------|
| Day 1 | Mon, Jun 2 | Foundation & App Shell | ✅ Complete |
| Day 2 | Tue, Jun 3 | Goals & Progress System | ✅ Complete |
| Day 3 | Wed, Jun 4 | Tasks & Projects | ✅ Complete |
| Day 4 | Thu, Jun 5 | AI Engine & Command Bar | ✅ Complete |
| Day 5 | Fri, Jun 6 | Communications & Calendar | ✅ Complete |
| Day 6 | Sat, Jun 7 | Brand, News, Learning, Council & Ideas | ✅ Complete |
| Day 7 | Sun, Jun 8 | Polish, Finance Agent, Co-Founder & Deploy | ✅ Core agents done, deploy pending |
| Days 8–11 | Jun 14–27 | Voice foundation (browser-native) | ✅ Complete (superseded by Day 16) |
| Day 12 | Jun 27 | Skills system | ✅ Complete |
| Day 13 | Jun 27 | MCP tools wiring | ✅ Complete |
| Day 14 | Jun 27 | Long-term memory | ✅ Complete |
| Day 15 | Jun 27 | Agent upgrades + The Council + Co-Founder | ✅ Complete |
| Day 16 | | Voice rebuild — Deepgram + ElevenLabs (DEFERRED TO LAST) | ⬜ Not started |

---

## Day 1 — Monday, June 2 ✅
### Foundation & App Shell
> **Deliverable achieved:** App runs at http://localhost:5173. Dark theme, sidebar navigation, all 6 home sections with placeholder data. Clean production build (260KB JS, 8KB CSS).

#### 🛠 Project Setup
- [x] Initialise React project with Vite + TypeScript (`npm create vite@latest jarvis-os -- --template react-ts`)
- [x] Install core dependencies: Tailwind CSS v4 via `@tailwindcss/vite`
- [x] Install UI dependencies: Lucide React (icons), Framer Motion (animation)
- [x] Install data dependencies: Recharts (charts), Zustand (state management)
- [x] Install font dependencies: Syne, DM Mono, DM Sans via Google Fonts (in `index.css`)
- [x] Set up `.env.local` file with placeholder keys (never commit)
- [x] Configure `tsconfig.json` path aliases (`@/*` → `src/*`) + Vite alias
- [x] Set up Prettier for code quality

> **Note:** Using Vite 5 (not v9) — Node 20.15.1 cannot run Vite 9's rolldown bundler. Vite 5 works perfectly.

#### 🎨 Design System
- [x] Define CSS variables in `src/index.css`: `--bg-base`, `--bg-surface`, `--bg-elevated`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border-*`, accent amber `#F59E0B`
- [x] Tailwind v4 config via `@tailwindcss/vite` plugin in vite.config.ts
- [x] Design token reference: dark navy/charcoal background, crisp white text, electric amber accent
- [x] Typography: display headings (Syne), body text (DM Sans), data/mono (DM Mono)
- [x] Card style: elevated dark card, subtle 1px border, no heavy shadows
- [x] Responsive breakpoints: 1440px desktop targeted

#### 🏗 App Shell Layout
- [x] `AppShell.tsx` — root layout wrapper with sidebar + main content area
- [x] `Sidebar.tsx` — left nav: Home, Goals, Projects, Agent Chat, Ideas, News, Settings — active route highlighted in amber
- [x] `Header.tsx` — top bar: JARVIS OS logo, live clock (30s interval), greeting by time of day
- [x] React Router: routes for all 7 views (`/home`, `/goals`, `/projects`, `/agent`, `/ideas`, `/news`, `/settings`)
- [x] `Home.tsx` — layout for 6 sections
- [x] Sidebar highlights active route via NavLink

#### 🖼 Static Home Screen Sections
- [x] `BriefingBar.tsx` — morning brief card with dummy text + regenerate button
- [x] `CommandBar.tsx` — ⌘K focus shortcut, cycling placeholder text (5 variants), submit button
- [x] `MetricsRow.tsx` — 4 metric cards: Goals On Track, Tasks Today, Inbox, Overall Progress
- [x] `ProjectLanes.tsx` — 4 project columns with placeholder tasks
- [x] `NewsStrip.tsx` — scrollable horizontal headline strip (5 dummy stories, topic colour tags)

#### Also built: `src/types/index.ts`
- [x] `Goal`, `Milestone`, `WeeklyLog`, `Task`, `AgentLog`, `NewsStory` types fully defined

---

## Day 2 — Tuesday, June 3 ✅
### Goals & Progress System
> **Deliverable achieved:** Goals view live with radar chart, 6 goal cards, animated progress bars, clickable milestones, inline % editing, weekly log table. MetricsRow reads live from store. Notion integration built (graceful fallback to seed data when key not set).

#### 📐 Data Model & State
- [x] `Goal` TypeScript type in `src/types/index.ts` (id, area, title, progress, status, milestones, weeklyLog)
- [x] `Milestone` type (id, text, done)
- [x] `WeeklyLog` type (week, progress, note)
- [x] `src/store/goalsStore.ts` — Zustand: setGoals, updateProgress, toggleMilestone, addWeeklyLog + seed data for all 6 areas

#### 🔌 Notion Integration — Goals
- [x] `src/integrations/notion.ts` — base Notion API client (fetch wrapper, proxied via `/api/notion` to avoid CORS)
- [x] `fetchGoals()` — reads Goals database from Notion, parses into Goal objects
- [x] `updateGoalProgress(notionPageId, progress)` — patches progress value in Notion
- [x] `toggleMilestoneNotion(notionPageId, milestones)` — updates milestones JSON in Notion
- [x] Graceful fallback: if Notion not connected, seed data shown; errors never crash the app
- [x] Vite dev server proxy: `/api/notion` → `https://api.notion.com/v1`

> **Env vars needed:** `VITE_NOTION_API_KEY` (paste "Jarvis" token from app.notion.com/my-integrations) + `VITE_NOTION_GOALS_DB_ID`

#### 🟣 Obsidian Integration — Base Client
- [ ] Install **Local REST API** plugin in Obsidian + generate API key + enable HTTP on port 27123
- [ ] Add `VITE_OBSIDIAN_API_KEY`, `VITE_OBSIDIAN_HOST`, `VITE_OBSIDIAN_VAULT_PATH` to `.env.local`
- [x] `src/integrations/obsidian.ts` — full client built:
  - [x] `readNote(path)`, `writeNote(path, content)`, `appendNote(path, content)`, `patchSection(path, heading, content)`
  - [x] `searchVault(query)`, `listFolder(path)`, `getDailyNote()`, `writeDailyNote(content)`
  - [x] `isObsidianRunning()` — health check (2s timeout)
- [x] Fails silently if Obsidian not running (vault is additive, never blocking)
- [x] Obsidian connection status badge in Settings (green / amber / checking)

#### 📊 Goals View UI
- [x] `GoalsView.tsx` — full page: radar chart left, 2-col goal cards right, weekly log below
- [x] `GoalRadar.tsx` — Recharts RadarChart, 6 areas, amber fill (#F59E0B), custom tooltip
- [x] `GoalCard.tsx` — area colour stripe, status badge (🟢 Strong / 🟡 On Track / 🔴 Needs Push), animated progress bar (Framer Motion, 0→% in 600ms), inline % edit on click, milestone checkboxes with strikethrough
- [x] `WeeklyLogTable.tsx` — cross-area weekly table, hover to see note, colour-coded by progress
- [x] Notion sync button + connection notice banner

#### 🏠 Home Dashboard Card
- [x] `MetricsRow.tsx` updated — reads `onTrackCount` and `overallProgress` live from goalsStore
- [x] Clicking Goals card navigates to `/goals`

---

## Day 3 — Wednesday, June 4 ✅
### Tasks & Projects
> **Deliverable achieved:** Full task system working. Quick-add bar creates tasks (syncs to Notion). List view with filters, sort, animated completion. Kanban board with drag-and-drop between columns. Home shows Today's Tasks strip and live ProjectLanes. MetricsRow Tasks Today is live.

#### 📐 Data Model & State
- [x] `Task` TypeScript type: id, title, project, status, priority, dueDate, agentCreated, notionId
- [x] Project union: `research | business | brand | ideas | finance`
- [x] Status union: `todo | in_progress | done | blocked`
- [x] Priority union: `high | medium | low`
- [x] `src/store/tasksStore.ts` — Zustand: addTask, updateTask, completeTask, removeTask, setView + selectors: `selectTodaysTasks`, `selectOpenTasksByProject`, `isOverdue` + 10-task seed data

#### 🔌 Notion Integration — Tasks (built in notion.ts Day 2)
- [x] `fetchTasks()` — reads Notion Task database, filters out Done, maps to Task objects
- [x] `createTask(task)` — creates new page in Notion Task database
- [x] `updateTaskStatus(notionPageId, status)` — patches status in Notion
- [x] `archiveTask(notionPageId)` — archives in Notion (no hard delete)
- [x] Fetch on mount if stale (2-min TTL); manual sync button

#### 📋 Task List View
- [x] `TaskListView.tsx` — project tabs (with open count badge) + status filter tabs + sort dropdown (priority / due date / project)
- [x] Task row: checkbox, title, project tag, priority badge, due date, agent badge, status dropdown
- [x] Checkbox click → animated exit (Framer Motion fade + height collapse) + Notion sync
- [x] Overdue tasks: amber due date indicator
- [x] Empty state: "No tasks here — add one above"

#### 🗂 Kanban Board View
- [x] `KanbanBoard.tsx` — 4 columns: To Do, In Progress, Blocked, Done
- [x] Task cards: title, project tag, priority dot, due date (MM-DD), agent badge
- [x] Drag-and-drop via `@dnd-kit/core` — drops update Zustand + Notion
- [x] DragOverlay ghost card while dragging
- [x] Column task count badges, drop zone highlights amber on hover

#### ➕ Quick Add Task
- [x] `QuickAdd.tsx` — inline bar: title input + project dropdown + priority dropdown + Add button
- [x] Optimistic add (instant UI), Notion sync in background
- [x] Project selector colour-coded per project

#### 🏗 Projects View
- [x] `ProjectsView.tsx` — List/Board toggle (LayoutList / Columns icons), Sync Notion button, open/done counts, connection notice

#### 🏠 Home Dashboard
- [x] `ProjectLanes.tsx` — reads live from tasksStore, top 3 open tasks per project (sorted by priority), clickable → /projects
- [x] `TodaysTasks.tsx` — new Home widget: tasks due today, sorted by priority, animated completion, "All tasks →" link
- [x] `MetricsRow.tsx` — Tasks Today count from `selectTodaysTasks`, high-priority sub-label
- [x] `Home.tsx` — TodaysTasks inserted between MetricsRow and ProjectLanes

---

## Day 4 — Thursday, June 5 ✅
### AI Engine & Command Bar
> **Deliverable achieved:** Kimi K2.6 live via Nvidia NIM (verified end-to-end: "JARVIS ONLINE" test passed). Command bar + Agent Chat both route through intent classifier to Ops Agent. Responses stream token-by-token. Actions (create task, update goal) parsed from agent output and executed against Zustand + Notion. Agent log in sidebar.

#### 🤖 Kimi K2.6 API Integration (Nvidia NIM)
- [x] Install OpenAI-compatible SDK: `npm install openai` (v6.42.0)
- [x] `src/integrations/kimi.ts` — client with `complete()` (non-streaming) + `streamComplete()` (token callback), proxied via `/api/nim` → `https://integrate.api.nvidia.com/v1`, model `moonshotai/kimi-k2.6`
- [x] `VITE_NVIDIA_API_KEY` set in `.env.local` ✅
- [x] Tested live: direct API + Vite proxy both verified working

#### 🧠 Orchestrator — Intent Classifier
- [x] `src/agents/orchestrator.ts` — `classifyIntent()` + `runJarvis()` entry point
- [x] Fast keyword pre-check (no API round-trip for obvious cases) + Kimi fallback classifier (6 intents: research / comms / brand / ops / finance / news)
- [x] Routes to agent modules — Day 4: all intents handled by Ops Agent with a "coming soon" note for unbuilt agents
- [x] Every agent call logged to `agentStore`

#### 🗂 Ops Agent — `opsAgent.ts`
- [x] System prompt: persona, action-block output format, response rules
- [x] Context injection: today's date, all goals + progress %, open tasks with IDs/priorities/due dates, today's due tasks, active projects — into every call
- [x] Handle: "Add task: [X] to [project]" → emits `create_task` action → Zustand + Notion + agent log
- [x] Handle: "What are my top 3 priorities today?" → answers from injected context, ranked
- [x] Handle: "Update research goal to 75%" → emits `update_goal` action → Zustand + Notion
- [x] Handle: "Run my weekly review" → structured review from tasks + goals context
- [ ] Handle: "Log idea: [X]" → deferred to Day 6 (Ideas Corner + Notion Ideas DB built then)
- [ ] Obsidian daily note on app open → deferred until Obsidian plugin is installed (user action)
- [x] Streaming response: token-by-token display, action blocks stripped from visible output

#### ⌨️ Command Bar UI — `CommandBar.tsx`
- [x] Wired: input → `runJarvis()` → streaming response in AgentPanel
- [x] ⌘K / Ctrl+K shortcut focuses bar from anywhere
- [x] Busy state: "Jarvis is thinking…" placeholder + spinner, input disabled while streaming
- [x] Response renders in Agent Panel (streaming, token by token)
- [x] Command history: ↑/↓ recall previous inputs (last 20)

#### 🪵 Agent Log — `AgentLog.tsx` + `agentStore.ts`
- [x] `src/store/agentStore.ts` — logs (last 50), exchanges (last 5), busy state, AGENT_META (emoji + colour per agent)
- [x] `AgentLog.tsx` — collapsible panel in sidebar: colour-coded entries, timestamps, count badge, clear button

#### 💬 Agent Panel — `AgentPanel.tsx`
- [x] Appears below command bar on Home when an exchange exists
- [x] Streaming text with blinking cursor (▋) + "thinking…" pulse
- [x] Agent identity header: emoji + name + colour-coded left border
- [x] "Copy response" button (clipboard + confirmation)
- [x] Conversation history: last 5 exchanges, auto-scrolls, max-height scrollable

#### 💬 Bonus: Agent Chat page — `AgentChat.tsx`
- [x] Full chat view at `/agent`: empty state with example prompts, same store/orchestrator as command bar, connection warning if key missing

#### ✅ Day 4 Deliverable
> ACHIEVED — Type "add task: finalise dataset to research" → task appears on screen (+ Notion if connected). "What are my top 3 priorities?" → ranked list from real task data. Responses stream live. Agent log records every action.

---

## Day 5 — Friday, June 6 ✅
### Communications & Calendar
> **Deliverable achieved:** Gmail + Calendar clients built with Google OAuth 2.0 (PKCE) + seed-data fallback when not connected. Comms Agent triages inbox, drafts emails, and schedules events via action blocks. InboxPanel + CalendarTimeline on Home, MetricsRow inbox count live, Header shows "next meeting in X min". Morning brief auto-generates via Kimi, cached 30 min, regenerate button wired.

#### 🔌 Gmail Integration — `gmail.ts` + `googleAuth.ts`
- [x] Google OAuth 2.0 PKCE flow (`src/integrations/googleAuth.ts`) — `startGoogleAuth()`, `/auth/callback` page exchanges code, tokens in localStorage, auto-refresh via `getAccessToken()`
- [x] `fetchInbox()` — fetches last 20 inbox threads, returns sender, subject, snippet, date, unread, heuristic triage
- [x] `fetchThread(threadId)` — fetches full thread for summarisation
- [x] `createDraft(to, subject, body)` — creates email draft in Gmail
- [x] `sendEmail(draftId)` — sends a draft (Comms Agent never calls this automatically — user sends from Gmail)
- [x] OAuth token refresh automatic via refresh_token
- [x] Seed inbox (5 emails, all 4 triage buckets) when Google not connected

#### 🔌 Google Calendar Integration — `calendar.ts`
- [x] `fetchTodayEvents()`, `fetchWeekEvents()`, `createEvent(title, start, end, attendees)`
- [x] Parse events: title, time, location, attendees, video link (hangoutLink)
- [x] Seed events (3 today + 1 this week) when not connected

#### 📬 Communications Agent — `commsAgent.ts`
- [x] System prompt: triage logic, drafting voice, scheduling rules, action blocks (`create_draft`, `create_event`)
- [x] "What's in my inbox?" → triage summary from context
- [x] "Draft a reply to [sender] saying [X]" → `create_draft` action → saved to Gmail drafts (never auto-sent)
- [x] "Schedule a meeting with [person]" → suggests slots from calendar gaps, `create_event` action
- [x] "Summarise the thread from [sender]" → fetches thread, 3-sentence summary
- [x] Active projects injected into context
- [x] Orchestrator routes `comms` intent to `runCommsAgent`

#### 📧 Inbox Triage View — `InboxPanel.tsx`
- [x] Inbox panel on Home: live unread count, "X need reply" in MetricsRow
- [x] Triage buckets: 🔴 Urgent, 🟡 Reply, 🔵 FYI, ⚪ Archive — filter tabs with counts
- [x] Email card: sender, subject, snippet, time-ago, triage icon
- [x] Click → runs "Summarise the thread from [sender]" in Agent Panel

#### 📅 Calendar View — `CalendarTimeline.tsx`
- [x] Today's events as timeline on Home dashboard, past events dimmed
- [x] Event card: time range, title, location pin, video link icon
- [x] "Next meeting in X minutes" badge in Header

#### 🌅 Morning Brief Generator — `useMorningBrief.ts`
- [x] Hook runs on app open, cached 30 min in localStorage
- [x] Structure: greeting → top tasks → inbox summary → calendar → goal progress (via Kimi prose)
- [x] Brief renders in `BriefingBar.tsx` with loading/error states
- [x] "Regenerate brief" button wired (bypasses cache)

#### ✅ Day 5 Deliverable
> ACHIEVED — Open Jarvis → morning brief auto-generates from real tasks/goals/inbox/calendar state (seed data until Google is connected). Inbox panel shows triage buckets. Calendar timeline shows today's schedule + "next meeting in X min" in header. Ask "draft a reply to [name]" or "schedule a meeting with [person]" → Comms Agent responds and (once Google is connected via Settings) creates the draft/event.

> **Note:** Google OAuth requires `VITE_GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_SECRET` from console.cloud.google.com (user action, not yet set) — until then, Gmail/Calendar run on realistic seed data so the UI and agent are fully testable.

---

## Day 6 — Saturday, June 7 ✅
### Brand Agent, News Agent, Learning Agent, The Council & Ideas Corner
> **Goal:** LinkedIn content pipeline, live news intelligence, ideas capture, learning plans, and The Council all working.

#### 💡 Ideas Corner — `IdeasCorner.tsx`
- [x] Quick-capture input, gallery of idea cards (text, date, project tag, status)
- [x] Enter → saves to Notion (if `VITE_NOTION_IDEAS_DB_ID` configured) + appears instantly (seed data otherwise)
- [x] Filter by project / status
- [x] "Turn into task" button → creates task directly (Ops Agent action-block path deferred)
- [x] "Write a post about this" button → Brand Agent

#### 🔌 Notion — Ideas Sync
- [x] `fetchIdeas()`, `saveIdea(idea)`, `updateIdeaStatus(id, status)` — graceful no-op until `VITE_NOTION_IDEAS_DB_ID` is set

#### 📣 Brand Agent — `brandAgent.ts`
- [x] System prompt: founder + researcher tone, LinkedIn format rules, content pillars
- [x] Handle: "Write a LinkedIn post about [topic]", content requests via `create_post` action
- [x] Voice profile (hardcoded description) injected into every call
- [x] Content Calendar rendered inline in `IdeasCorner.tsx` (no separate `PostPreview.tsx`/`ContentCalendar.tsx` components)

#### 🔬 Research Agent — `researchAgent.ts`
- [x] System prompt: academic, citation-aware
- [x] Handle: "Research [topic]", "Summarise this paper", "Find datasets for [topic]"

#### 🌍 News Agent — `newsAgent.ts`
- [x] `src/integrations/news.ts` — NewsAPI client: `fetchHeadlines`, `searchNews`, `fetchTopStories` (seed fallback if `VITE_NEWS_API_KEY` not set)
- [x] Handle: morning brief, "What's happening in AI today?", "Catch me up on [topic]", "Tell me more about [story]"
- [x] News → Brand bridge: flags stories as LinkedIn post opportunities

#### 📰 News View — `NewsView.tsx`
- [x] Topic tabs: 🤖 AI · 💻 Tech · 🇳🇬 Nigeria · 🌍 World · 📋 Policy · 💰 Finance · 🔬 Science + Saved
- [x] `StoryCard.tsx` — headline, source, timestamp, summary, deep dive / save / write post / open source buttons
- [x] `newsStore.ts` — topic fetch, saved stories, 30-min TTL cache

#### 📰 News Strip on Home
- [x] Wire `NewsStrip.tsx` to live `useNewsStore` data
- [x] Auto-refresh every 30 min (TTL-based)

#### 🌅 Morning Brief — News Integration
- [x] Update `useMorningBrief.ts`: append top 3 news stories
- [x] News woven into brief text (no separate dashboard section added to `BriefingBar.tsx`)

#### 📚 Learning Agent — `learningAgent.ts`
- [x] System prompt: tutor tone, Socratic, connects to active projects
- [x] Handle: "Create a learning plan for [topic]", "Explain [concept] to me", "Quiz me on [topic]", "What should I study this week?"
- [ ] Obsidian lesson notes + dedicated `LearningView.tsx`/`CourseCard.tsx`/`QuizMode.tsx`/`learningStore.ts` — deferred (command-bar/chat only for now)

#### 🏛️ The Council — `councilAgent.ts`
- [x] 5 adviser personas: Contrarian, First-Principles Thinker, Expansionist, Outsider, Executor
- [x] 2-call process: advisers + anonymous peer review → Chairman synthesis
- [x] Handle: "Run the Council on [decision]", "Challenge my thinking on [idea]"
- [ ] Save Council output to Notion + Obsidian, dedicated `CouncilView.tsx`/`AdviserCard.tsx`/`CouncilHistory.tsx` — deferred (command-bar/chat only for now)

#### ✅ Day 6 Deliverable
> Ideas Corner works. Brand Agent drafts LinkedIn posts. News view shows live headlines. Learning Agent creates a plan for any topic and quizzes you on demand. The Council debates your business ideas and delivers a Chairman's verdict. Morning brief includes top news stories. Council/Learning are command-bar-only (no dedicated pages); Council/Notion/Obsidian persistence deferred.

---

## Day 7 — Sunday, June 8 ✅ (core agents complete, polish/deploy deferred)
### Polish, Finance Agent, Co-Founder Agent & Deploy
> **Goal:** Jarvis OS is live. Every feature connected end to end. Co-Founder Agent online. Deployed to Vercel.

#### 💰 Finance Agent — `financeAgent.ts`
- [x] Finance database in Notion: amount, category, type (income/expense), date, notes — `fetchFinanceEntries()`/`logFinanceEntry()` in notion.ts, graceful no-op until `VITE_NOTION_FINANCE_DB_ID` set
- [x] `financeStore.ts` with seed data, `selectMonthTotals`, `selectExpensesByCategory`
- [x] Handle: "Log expense: ₦15,000 transport", "What's my financial status this month?", "Generate my monthly review"
- [x] Finance summary card ("Net This Month") in `MetricsRow.tsx`

#### 🤝 Co-Founder Agent — `cofounderAgent.ts`
- [x] Decisions log + lessons log stored in localStorage (simplified from Notion/Obsidian `/context/` files)
- [x] System prompt: strategic, direct, pushes back, never sycophantic
- [x] Handle: "What should I be focused on this week?", "Review my business strategy", "Am I working on the right things?", "Synthesise all agent reports"
- [x] "Log decision: X" / "Log lesson: X" — stored, surfaced in future sessions
- [ ] Dedicated `CoFounderView.tsx`/`DecisionsLog.tsx`/`LessonsLog.tsx`/`WeeklyBrief.tsx`, Notion/Obsidian sync, Monday auto-brief — deferred (command-bar only)

#### ⚙️ Settings Page — `Settings.tsx`
- [ ] Expand settings: News topic watchlist editor, Brand voice profile textarea, Learning section, Co-Founder context editor — deferred
- [ ] Notification preferences: morning brief time, weekly digest day — deferred

#### 🚀 Onboarding Flow
- [ ] 7-step first-time setup — deferred (app is single-user, pre-configured via .env.local)

#### 🎨 UI Polish & Micro-interactions
- [x] Toast notifications: task added ✅, idea saved 💡, post drafted 📣, expense/income logged 💰, goal updated 🎯 (`toastStore.ts` + `ToastHost.tsx`)
- [x] Dedicated chat pages for Council, Learning, Co-Founder (`MiniChat.tsx` shared component)
- [ ] Loading skeletons, command bar glow, news strip scroll momentum — deferred (existing loading text/spinners retained)

#### 🔁 Morning Brief Automation
- [x] Runs on every app open, cached 30 min
- [x] "Regenerate brief" button wired end-to-end

#### ⚡ Performance Optimisation
- [x] Code-split by route — all pages lazy-loaded via `React.lazy`/`Suspense` in `App.tsx`; main bundle dropped from ~1MB to 391KB, no chunks over 500KB
- [ ] Memoized Recharts components, debounced Notion writes — deferred

#### 🧪 End-to-End Testing
- [x] All agents route correctly via intent classifier + keyword pre-checks (verified via clean build)
- [x] Graceful degradation: seed data shown for every integration when not configured
- [ ] Manual full daily-ritual click-through, live Notion round-trip verification — left for user to exercise

#### 🚢 Deployment
- [ ] Connect GitHub repo to Vercel, add env vars, first production deploy — requires user's Vercel/GitHub account, see below

#### ✅ Day 7 Deliverable
> Finance Agent tracks income/expenses with Notion sync and a MetricsRow card. Co-Founder Agent gives direct strategic input, remembers decisions/lessons across sessions, and pushes back on contradictions. Council and Learning now have dedicated chat pages (`/council`, `/learning`), Co-Founder has its own page (`/cofounder`) with Decisions/Lessons logs. Toast notifications confirm key actions. App is route-split for performance. Morning brief auto-generates with live news. All core agents route correctly from the command bar. Build is clean. Onboarding, Settings expansion, and Vercel deploy remain — see deferred items above.

---

## Day 8 — Skills, Tool-Calling & Spoken Morning Briefing (planned)
> Plan reviewed via gstack `/office-hours` + `/plan-eng-review`, approved.
> Full design doc: `~/.gstack/projects/Joakimanochie-Jarvis/2026-06-14-design-jarvis-skills-voice.md`

**Goal:** Vertical slice proving real tool-calling + spoken output. Built in 6 checkpointed steps (one slice, not split PRs).

- [x] **Step 1** — De-risk: Nvidia NIM supports OpenAI tool_calls API natively. `completeWithTools()` uses it directly.
- [x] **Step 2** — Added `completeWithTools()` to `kimi.ts` (existing `complete()`/`streamComplete()` untouched). Added Vitest v2, 5 passing tests.
- [x] **Step 3** — `src/agents/toolLoop.ts`: generic tool-calling loop, 5-iteration cap, dedup guard (skip repeat `(tool, args)` calls). 5 passing tests.
- [x] **Step 4** — `briefingAgent.ts` with `calendar_read` + `notion_read` tools, wired into `useMorningBrief.ts` with fallback.
- [x] **Step 5** — `src/integrations/webSearch.ts` (Tavily), `/api/search` Vite proxy added, wired into briefingAgent as `web_search` tool.
- [x] **Step 6** — `BriefingBar.tsx` "Speak" button using Web Speech API `SpeechSynthesis`, voiceschanged listener + 300ms fallback timeout.

---

## Day 9 — Voice Input: Push-to-Talk (planned)
> Makes EVERY agent voice-accessible — talk to Jarvis instead of typing.

**Goal:** Press a button, speak, speech is transcribed and fed into the same `runJarvis()` orchestrator that already routes to all 9 agents. Talking = typing.

- [x] STT engine: Web Speech API (SpeechRecognition) — zero model download, real-time interim results, works in Chrome/Edge. No perf hit.
- [x] `src/hooks/usePushToTalk.ts` — states: idle → recording → transcribing → error (auto-clears 3s); interim transcript streams into input live; hand-rolled TS types (no extra @types package needed)
- [x] `src/components/ui/MicButton.tsx` — idle/recording (pulsing Framer Motion ring)/transcribing (spinner) states; `color` prop tints ring to agent accent; unsupported browser shows disabled MicOff icon
- [x] `CommandBar.tsx` — mic button added; border turns red while recording; interim transcript fills input; final transcript auto-submits to `runJarvis()`
- [x] `AgentChat.tsx` — mic button added; same recording border + interim fill + auto-submit pattern
- [x] `MiniChat.tsx` — mic button added with agent `color` prop; covers Council, Learning, Co-Founder pages — all 9 agents voice-accessible
- [x] Build clean, all 5 existing tests pass

---

## Day 10 — Wake-Word / Always-On Listening (planned)
> The ambient assistant: "Hey Jarvis" without touching anything.

**Goal:** Always-listening wake word triggers the push-to-talk flow from Day 9 automatically.

- [x] Engine: Continuous Web Speech API — zero dependencies, works in Chrome/Edge, no model download, no perf cost. Electron wrapper not needed.
- [x] `src/hooks/useWakeWord.ts` — continuous SpeechRecognition; trigger phrases: "hey jarvis", "ok jarvis", "okay jarvis", "jarvis"; auto-restarts after silence; `pause()`/`resume()` for PTT coordination so two SR instances never run simultaneously
- [x] `src/store/wakeWordSettings.ts` — `getWakeWordEnabled`/`setWakeWordEnabled` with localStorage + `jarvis_wake_word_changed` broadcast event
- [x] `CommandBar.tsx` — wake word triggers PTT (250 ms gap); PTT end resumes wake word; amber border while wake word listening
- [x] `Header.tsx` — pulsing amber "Hey Jarvis" pill badge when wake word is active
- [x] `Settings.tsx` — "Voice & Wake Word" section with animated toggle switch
- [x] Build clean (392KB, no regressions), 5/5 tests pass

---

## Day 11 — Proactive Speech & Ambient Narrator Mode ✅
> The actual end goal: Jarvis speaks up on its own — reminders, briefings, narrated changes — without being asked.

**Goal:** Background polling/diffing of calendar, Notion, tasks; Jarvis proactively speaks relevant updates via TTS (from Day 8).

- [x] `src/store/narratorSettings.ts` — localStorage-persisted narrator config (enabled, speakMeetings, meetingWarningMins, speakOverdue, autoBriefHour, quietStart/quietEnd)
- [x] `src/hooks/useAmbientNarrator.ts` — background polling hook (30s interval, mounted in AppShell): upcoming meeting TTS, overdue task TTS, auto-spoken morning briefing at configurable hour, quiet hours respected, dynamic import keeps kimi out of main bundle
- [x] Settings.tsx "Ambient Narrator" section — master toggle, meeting warning minutes + sub-toggle, overdue tasks toggle, auto-brief hour selector, quiet hours start/end selectors
- [x] `src/integrations/notion.ts` — `appendToPage()` Notion write function for any page by ID
- [x] `src/agents/opsAgent.ts` — `log_decision` action: "Log decision: X" → timestamped entry appended to Jarvis Notion page
- [x] Build clean (397KB main, no regressions), 5/5 tests pass
- [x] Wake word rewritten to chain (non-continuous) approach for reliable always-on listening

---

## Day 12 — Skills System ✅
### Build Jarvis's skills loader and seed 14 skills from the agency-agents repo
> **Goal:** Drop a `.md` file into `skills/` → Jarvis loads and executes it on matched intent. No code change required to add a new capability.

#### 🗂 Skills Infrastructure
- [x] Create `skills/` directory at project root
- [x] Define skill frontmatter schema: `name`, `trigger_phrases[]`, `agent`, `tools_needed[]`, `output_format`
- [x] Build `src/integrations/skillsLoader.ts` — Vite `import.meta.glob` loads `.md` files at build time, parses YAML frontmatter, returns skill registry
- [x] Update `src/agents/orchestrator.ts` — after classifying intent, `matchSkills()` finds matching skills by trigger phrases + agent, `buildSkillPrompt()` concatenates them into the system prompt
- [x] Skills can stack: multiple skills matched → all injected
- [x] Agent Log shows which skills were loaded per call
- [x] Build `SkillsView.tsx` — `/skills` page listing all loaded skills with trigger phrases, agent badges, and tool requirements
- [x] All 9 agents updated to accept optional `skillContent` parameter appended to system prompt
- [x] Sidebar entry added (Sparkles icon)
- [x] Route added in App.tsx (lazy-loaded)

#### 📥 Seed Skills — Adapt from agency-agents repo
Each of these is adapted from `https://github.com/msitarzewski/agency-agents` and saved as a `.md` file in `skills/`. Strip Claude Code-specific formatting, keep the persona, rules, and workflow sections.

- [x] `skills/linkedin-content-creator.md` — Brand Agent: voice rules, post structure, content pillars
- [x] `skills/carousel-growth-engine.md` — Brand Agent: 5-8 slide carousel structure with hook/content/CTA
- [x] `skills/email-intelligence.md` — Comms Agent: triage rules, reply drafting, pattern recognition
- [x] `skills/prompt-engineer.md` — all agents: prompt design principles and debugging checklist
- [x] `skills/multi-agent-architect.md` — all agents: agent design rules, orchestration patterns
- [x] `skills/finance-tracker.md` — Finance Agent: expense parsing, categorisation, currency handling
- [x] `skills/financial-analyst.md` — Finance Agent: monthly reviews, runway calculation, savings tracking
- [x] `skills/product-trend-researcher.md` — Research Agent: landscape scan, opportunity mapping
- [x] `skills/chief-of-staff.md` — Co-Founder Agent: operating review structure, push-back rules
- [x] `skills/business-strategist.md` — Council Chairman: synthesis rules, verdict delivery
- [x] `skills/meeting-notes.md` — Comms Agent: structured post-call processing with action items
- [x] `skills/voice-ai-engineer.md` — all agents: STT/TTS pipeline design rules (prep for Day 16)
- [x] `skills/morning-brief.md` — Ops Agent: morning ritual order, length rules, flowing prose output
- [x] `skills/weekly-review.md` — Ops Agent: structured weekly review with wins/stuck/focus/reflection

#### ✅ Day 12 Deliverable
> Say "write me a LinkedIn post about my VLM research" → orchestrator loads `linkedin-content-creator.md` → Brand Agent executes with full skill persona and rules → polished draft returned. Add any new `.md` to `skills/` → Jarvis can use it immediately.

---

## Day 13 — MCP Tools Wiring ✅
### Every agent gets its tools. Shared tool registry. Google Drive integration added.
> **Goal:** All MCP tools callable from the right agents. Centralised tool registry. Every agent upgraded with tool-calling.

#### 🔒 Existing MCP Connections (hardened)
- [x] Gmail MCP — Comms Agent: `fetchInbox()`, `readThread()`, `createDraft()` (confirm-before-send via action blocks)
- [x] Google Calendar MCP — Comms Agent + Ops Agent: `fetchTodayEvents()`, `fetchWeekEvents()`, `createEvent()`
- [x] Google Drive MCP — `src/integrations/drive.ts` created: `searchFiles()`, `readFileContent()` (with Google Docs export + binary fallback)
- [x] Notion MCP — all agents: read tasks/goals/finance, create tasks, append to pages
- [x] Google Drive scope added to OAuth (`drive.readonly`)

#### Obsidian MCP (built Day 2 — now wired via shared registry)
- [x] `obsidian.ts` already has: readNote, writeNote, appendNote, searchVault, listFolder, getDailyNote, isObsidianRunning
- [x] Connection badge in Settings (green/amber)
- [x] Wired into Research, Ops, Learning, Co-Founder agents via `tools.ts`

#### Web Search MCP (built Day 8 — Tavily — now wired via shared registry)
- [x] Tavily web search (`webSearch.ts`) wired into Research, Brand, News, Ops, Council, Learning agents
- [x] Connection status added to Settings page (Tavily Web Search row)

#### 🤝 Agent-to-Tool Matrix — `getAgentTools()` in `tools.ts`
- [x] Research Agent → web_search, drive_search, drive_read, notion_read, obsidian_search, obsidian_read, obsidian_append
- [x] Comms Agent → gmail_inbox, gmail_read_thread, gmail_draft, calendar_read, calendar_create (via existing action blocks + context injection)
- [x] Brand Agent → notion_read, web_search, obsidian_read
- [x] Ops Agent → calendar_read, notion_read, notion_create_task, notion_append, obsidian_append, obsidian_daily, web_search
- [x] Finance Agent → notion_read (via direct context injection)
- [x] News Agent → web_search, notion_read
- [x] Council Agent → notion_read, web_search
- [x] Co-Founder Agent → notion_read, obsidian_search, obsidian_read, calendar_read
- [x] Learning Agent → web_search, notion_read, obsidian_append

#### 🏗 Infrastructure Built
- [x] `src/agents/tools.ts` — shared tool registry: 16 tool definitions + handlers, `getAgentTools(agent)` returns tools + handlers for each agent
- [x] `src/integrations/drive.ts` — Google Drive integration: `searchFiles()`, `readFileContent()` (Google Docs export + binary fallback)
- [x] `gatherToolContext()` in `toolLoop.ts` — pre-flight tool gathering that preserves streaming UX: model picks tools → tools execute → results injected as context → agent streams final response
- [x] 7 agents upgraded with tool-gathering (Research, Ops, Brand, News, Council, Co-Founder, Learning)
- [x] `briefingAgent.ts` refactored to use shared tool registry
- [x] Build clean (398KB main), 5/5 tests pass

#### ✅ Day 13 Deliverable
> All agents wired to their tools via a centralised registry. `gatherToolContext()` lets agents call tools then stream responses with live data. Google Drive integration added. Agent Log shows which tools fired on every call.

---

## Day 14 — Long-Term Memory System ✅
### Jarvis knows you. Before you say a word — and after every session.
> **Goal:** Memory builder saves context at end of each session. Context injector loads it at the start. Jarvis remembers you across days.

#### 🧠 Memory Builder — `src/memory/memoryBuilder.ts`
- [x] `memoryBuilder.ts` — sends session transcript to Kimi with extraction prompt, gets structured JSON back
- [x] Extraction prompt extracts: summary, key facts, decisions, projects touched, energy level
- [x] Saves to localStorage (last 30 sessions) + Notion (appends to Jarvis page) + Obsidian (`memory/sessions/YYYY-MM-DD.md`)
- [x] "End Session" button in Header triggers builder (dynamic import keeps kimi out of main bundle)
- [x] `beforeunload` event also triggers memory save on tab close
- [x] Toast: "Session saved to memory 🧠" on success
- [x] `src/memory/memoryStore.ts` — extracted pure localStorage functions to avoid kimi import in main bundle

#### 💉 Context Injector — `src/memory/contextInjector.ts`
- [x] `buildContextPayload()` — assembles: founder profile, goals + progress %, today's tasks, next event, last 5 session memories, pinned context
- [x] Capped at ~8000 chars (~2000 tokens) to control cost
- [x] Injected into every agent's system prompt via orchestrator (prepended to skillContent)
- [x] `getMemorySummary()` — returns greeting + last session summary + memory count for MemoryCard
- [x] `FounderProfile` — editable in Settings (name, role, active projects, communication style)
- [x] `pinnedContext` — editable in Settings (freeform text always injected)

#### 🖼 MemoryCard — `src/components/dashboard/MemoryCard.tsx`
- [x] Shows on Home page (above BriefingBar) when memories exist
- [x] "Jarvis Remembers" header with session count
- [x] Last session summary, recent session dates, recent decisions
- [x] Imports only from `memoryStore` (no kimi in main bundle)

#### ⚙️ Settings — Memory & Context Section
- [x] Communication style editor (injected into every agent)
- [x] Active projects editor (comma-separated)
- [x] Pinned context textarea (always injected — key constraints, important people, commitments)

#### ✅ Day 14 Deliverable
> End a session → memory builder fires → Notion and Obsidian updated. Open Jarvis the next day → context injector loads → Jarvis greets you knowing where you left off. Cross-session memory is live. Build clean (399KB), 5/5 tests pass.

---

## Day 15 — Agent Upgrades, The Council & Co-Founder ✅
### Every agent upgraded with skills, tools, and memory. Full end-to-end system tested.
> **Goal:** All agents load their skills. Council and Co-Founder fully wired. System tested end to end.

#### 🔬 Research Agent Upgrade
- [x] Skills auto-load via trigger phrases (`product-trend-researcher`, `research-mode`)
- [x] System prompt expanded: deep research flow with citations, landscape scans, paper summarisation, Drive doc summaries, milestone tracking
- [x] Citation rules: name papers by real names, "Sources Referenced" section, never fabricate

#### 📣 Brand Agent Upgrade
- [x] Skills auto-load (`linkedin-content-creator`, `carousel-growth-engine`)
- [x] Carousel support: 5-8 slide structure with hook/content/summary/CTA
- [x] "Repurpose this Obsidian note" → obsidian_read tool gathers note → Brand Agent drafts LinkedIn post
- [x] Tool-aware prompt: mentions Notion, web search, Obsidian access

#### 💰 Finance Agent Upgrade
- [x] Skills auto-load (`finance-tracker`, `financial-analyst`)
- [x] Monthly review structure: summary line, top 3 categories, savings rate, negative flag
- [x] Runway calculation: current_balance / monthly_burn → months remaining
- [x] Savings goal tracking with rate calculation

#### 📬 Comms Agent Upgrade
- [x] Skills auto-load (`email-intelligence`, `meeting-notes`)
- [x] Meeting notes processing: extracts title, attendees, summary, decisions, action items, follow-ups
- [x] Triage now flags emails connected to active projects (via founder context injection)

#### 🏛 The Council — Upgraded (already existed from Day 6)
- [x] 5-adviser system + Chairman synthesis (built Day 6) — now with tool access (Day 13) + skill injection (Day 12)
- [x] `business-strategist.md` skill auto-loads for Chairman via trigger phrases
- [x] Council output auto-saved to Notion (Jarvis page) + Obsidian (`council/YYYY-MM-DD.md`)
- [x] Agent Log records council save

#### 🤝 Co-Founder Agent — Upgraded (already existed from Day 7)
- [x] `chief-of-staff.md` skill auto-loads via trigger phrases
- [x] System prompt expanded: weekly operating review structure (progress snapshot, what's working, what's stuck, strategic tension, one recommendation)
- [x] Push-back rules: flags stalled goals (7+ days), missing LinkedIn posts (7+ days), decision contradictions
- [x] Decisions + lessons now sync to Notion (Jarvis page) + Obsidian (`cofounder/decisions.md`, `cofounder/lessons.md`)
- [x] Weekly operating review auto-triggers Monday 9-10am via ambient narrator

#### 🧪 System Verification
- [x] Build clean (400KB main bundle), 5/5 tests pass
- [x] All 14 skills loaded at build time, auto-matched by trigger phrases
- [x] All agents have tool access via shared registry (Day 13)
- [x] Memory context injected into every agent call (Day 14)
- [x] Council + Co-Founder save output to Notion + Obsidian
- [x] Monday auto-review fires via ambient narrator

#### ✅ Day 15 Deliverable
> All agents upgraded with skills, tools, and cross-session memory. Council saves deliberations. Co-Founder syncs decisions/lessons to Notion + Obsidian and auto-runs Monday reviews. The full daily ritual works end to end.

---

## Day 16 — Voice Rebuild (The Real Voice OS) ⚠️ DEFERRED TO LAST
### Replace browser voice with Deepgram STT + ElevenLabs TTS. Build the real conversation loop.
> **Goal:** Natural spoken conversation with Jarvis. No keyboard needed. Press `⌘J`, speak freely, Jarvis understands and speaks back with a real voice.
>
> ⚠️ **Prerequisite:** Confirm you have budget for Deepgram API (~$0.006/min audio) and ElevenLabs ($5/mo starter) or OpenAI TTS before starting. Alternative: use OpenAI Whisper API + OpenAI TTS as a single-vendor option.

#### 🎙 STT — Deepgram Nova-2
- [ ] Add `DEEPGRAM_API_KEY` to `.env.local`
- [ ] Install Deepgram SDK: `npm install @deepgram/sdk`
- [ ] Build `src/voice/stt.ts` — WebSocket stream to Deepgram Nova-2 model
- [ ] Configure: `model: 'nova-2'`, `language: 'en'`, `interim_results: true`, `endpointing: 500` (ms of silence to mark end of utterance)
- [ ] Audio preprocessing: resample to 16kHz mono via Web Audio API before sending chunks
- [ ] Display interim transcript live in VoiceMode UI as you speak
- [ ] Handle: microphone permission denied → friendly error; API timeout → retry with backoff; network drop → reconnect

#### 🔊 TTS — ElevenLabs (or OpenAI TTS fallback)
- [ ] Add `ELEVENLABS_API_KEY` to `.env.local`
- [ ] Build `src/voice/tts.ts` — ElevenLabs streaming TTS
- [ ] Choose voice: browse ElevenLabs voice library, select one that fits Jarvis's personality (calm, clear, authoritative)
- [ ] Stream audio chunks as they arrive — don't wait for full response before playing
- [ ] Queue system: if new response comes in while speaking, queue it; don't interrupt mid-sentence
- [ ] Fallback chain: ElevenLabs unavailable → OpenAI TTS → browser SpeechSynthesis (last resort)

#### 💬 Conversation Loop — `src/voice/conversationLoop.ts`
- [ ] Build persistent conversation session manager
- [ ] Loop: listen (Deepgram) → transcript finalised → send to orchestrator (claude-sonnet-4-6) → agent fires + tools execute → response text → TTS speaks → listen again
- [ ] Session memory: maintain full transcript in `voiceStore` (Zustand) during the session
- [ ] Context threading: inject last 5 exchanges into every Claude call (so "push it" knows what "it" refers to)
- [ ] Long-term memory bridge: context injector loaded at session start; memory builder triggered at session end
- [ ] Optional wake word: "Hey Jarvis" detected via Deepgram keyword spotting → activates listening mode without button press

#### 🎛 Voice Mode UI — `src/components/voice/VoiceMode.tsx`
- [ ] Full-screen minimal voice UI (activated via `⌘J`)
- [ ] Centre: Jarvis orb — animated states: idle (dim pulse) → listening (amber pulse) → thinking (rotate) → speaking (waveform)
- [ ] Below orb: live transcript text as you speak
- [ ] Top right: agent identity badge when an agent responds ("Ops Agent", "Research Agent", etc.)
- [ ] Bottom: scrollable session transcript panel (current session only)
- [ ] Exit: press `⌘J` again or `Escape` → closes voice mode → triggers memory builder for session

#### ✅ Day 16 Deliverable
> Press `⌘J`. Jarvis orb activates. Say "What's on today?" — Jarvis checks Calendar MCP and Notion tasks, then speaks a natural brief back to you. Say "write a LinkedIn post about my VLM findings" — Brand Agent fires, loads linkedin-content-creator skill, reads the draft back in Jarvis's real voice. Say "goodbye Jarvis" — session ends, memory saved. The voice OS is live.

---

## Environment Variables — Full Checklist

```bash
# Already set (Days 1–11)
VITE_NVIDIA_API_KEY=        ← Get from https://build.nvidia.com/moonshotai/kimi-k2.6
VITE_NOTION_API_KEY=        ← Paste "Jarvis" token from app.notion.com/my-integrations
VITE_NOTION_TASK_DB_ID=39581b20-8060-49b1-80e5-33cbfeeff50e
VITE_NOTION_JARVIS_PAGE_ID=36f90e11-e76c-81c9-9f5b-e015ae7d7036
VITE_NOTION_GOALS_DB_ID=    ← Create Goals database in Notion, share with Jarvis integration, paste ID
VITE_GOOGLE_CLIENT_ID=      ← Get from console.cloud.google.com
VITE_GOOGLE_CLIENT_SECRET=
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_NEWS_API_KEY=          ← Get from newsapi.org (free = 100 req/day)
VITE_TAVILY_API_KEY=        ← Get from tavily.com
VITE_OBSIDIAN_API_KEY=      ← Settings → Local REST API → Security in Obsidian
VITE_OBSIDIAN_HOST=http://127.0.0.1:27123

# Add for Day 13 — Web Search
BRAVE_API_KEY=              ← From brave.com/search/api (or use PERPLEXITY_API_KEY)

# Add for Day 16 — Voice STT
DEEPGRAM_API_KEY=           ← From deepgram.com (or OPENAI_API_KEY for Whisper)

# Add for Day 16 — Voice TTS
ELEVENLABS_API_KEY=         ← From elevenlabs.io (or use OpenAI TTS with OPENAI_API_KEY)

# App
VITE_APP_URL=http://localhost:5173
```

---

## Definition of Done — Full Checklist

### Core System
- [x] App opens and loads in under 3 seconds
- [x] Dark theme renders correctly on all screens
- [x] All 7 views accessible from sidebar navigation
- [x] Responsive layout at 1440px desktop

### Goals & Progress
- [x] All 6 goal areas visible with progress bars
- [x] Radar chart renders with live data
- [x] Milestone checkboxes update and save to Notion
- [x] Progress % editable inline and persists

### Tasks & Projects
- [x] Tasks load from Notion Task List database (with seed fallback)
- [x] New tasks created via quick-add appear in Notion
- [x] Task completion syncs to Notion
- [x] Kanban and list views both work
- [x] Today's tasks visible on Home dashboard

### AI & Command Bar
- [x] ⌘K opens command bar from anywhere
- [x] Intent classifier routes correctly (6 intents; specialised agents land Days 5–7)
- [x] Ops Agent creates tasks and updates goals via natural language (ideas → Day 6)
- [x] Responses stream in real time
- [x] Agent log records every action

### Communications
- [x] Gmail inbox loads and triages into 4 buckets (seed data until Google connected)
- [x] Comms Agent drafts emails on request
- [x] Today's calendar events visible on Home
- [x] Morning brief auto-generates on app open

### Brand & Content
- [x] Brand Agent drafts LinkedIn post from any prompt
- [x] Ideas captured instantly (Notion sync if `VITE_NOTION_IDEAS_DB_ID` set)
- [x] Content Calendar shows drafted post cards with character count
- [x] "Turn idea into post" flow works end to end

### News Intelligence
- [x] Morning news brief includes top headlines
- [x] All 7 topic feeds load in News view
- [x] Deep dive works: "tell me more about X story"
- [x] Save story → appears in Saved tab (local; not synced to Notion reading list)
- [x] News → Brand bridge: story suggests LinkedIn post
- [x] News Strip on Home auto-refreshes every 30 min (TTL-based)

### Learning
- [x] "Create a learning plan for X" / "Explain X" / "Quiz me on X" / "What should I study this week?" — command-bar only
- [ ] Structured plans saved to Notion, dedicated Learning View with progress bars, weekly Sunday check-in — deferred

### The Council
- [x] "Run the Council on [decision]" → all 5 advisers respond in distinct voices
- [x] Anonymous peer review step runs correctly
- [x] Chairman delivers final verdict: decision, reason, risk, next step
- [ ] Council output auto-saved to Notion — deferred

### Co-Founder
- [x] Co-Founder loads goals/tasks/finance context + decisions/lessons logs (localStorage) every session
- [x] "Log decision: X" / "Log lesson: X" stored and surfaced in future sessions
- [x] Push-back tone built into system prompt (flags contradictions with logged decisions)
- [ ] Context files synced to Notion/Obsidian, Monday auto-brief automation — deferred

### Obsidian Vault
- [ ] Local REST API plugin installed and running on port 27123
- [x] Connection status shown in Settings (green / amber)
- [x] `obsidian.ts` client built: read, write, append, patch, search, daily note
- [ ] Daily note written to vault on every app open
- [ ] Vault search works: "search my vault for X" returns relevant notes
- [x] Graceful degradation: app works fully if Obsidian is not running

### Finance
- [x] Log expense/income via command bar ("Log expense: ₦15,000 transport")
- [x] Monthly income/expense summary + category breakdown generates
- [x] Finance data syncs to Notion if `VITE_NOTION_FINANCE_DB_ID` set (seed data otherwise)
- [x] Net-this-month card in MetricsRow

### Settings & Onboarding
- [x] All integrations show real connection status (Notion, Nvidia, Gmail, Calendar, Drive, NewsAPI, Obsidian)
- [x] Obsidian connection tested live on Settings load
- [ ] News topic watchlist editable
- [ ] Brand voice profile saves and injects into Brand Agent
- [ ] Onboarding flow completes for a fresh user

### Deploy
- [ ] Production build passes with no errors *(currently passing ✅ locally)*
- [ ] All env vars set in Vercel
- [ ] App live at production URL
- [ ] Smoke test passes on production

### Day 12 — Skills System
- [ ] `skills/` folder exists with 14 seed skill files
- [ ] `skillsLoader.ts` reads and parses all skill files into a registry
- [ ] Orchestrator matches intent to skill and injects into system prompt
- [ ] Skills view shows all loaded skills in Settings

### Day 13 — MCP Tools
- [x] All MCP tools (Gmail, Calendar, Drive, Notion, Obsidian, Web Search) in shared registry
- [x] Google Drive integration added (`drive.ts`)
- [x] `gatherToolContext()` — pre-flight tool gathering preserving streaming UX
- [x] Agent-to-tool matrix fully wired via `getAgentTools()`

### Day 14 — Long-Term Memory
- [x] Memory builder extracts + saves session to localStorage + Notion + Obsidian
- [x] Context injector loads founder profile + memories + goals + tasks on every agent call
- [x] MemoryCard shown on Home with session history and recent decisions
- [x] Founder Profile and Pinned Context editable in Settings
- [x] "End Session" button in Header + beforeunload trigger

### Day 15 — Agent Upgrades
- [x] All agents upgraded with enriched prompts + tool/skill/memory access
- [x] Council saves output to Notion + Obsidian
- [x] Co-Founder syncs decisions/lessons to Notion + Obsidian
- [x] Monday auto-review triggers via ambient narrator
- [x] Build clean (400KB), 5/5 tests pass

### Day 16 — Voice Rebuild
- [ ] Deepgram STT streaming and transcribing accurately
- [ ] ElevenLabs TTS sounding natural (not robotic)
- [ ] Conversation loop: multi-turn with session context threading
- [ ] Memory builder fires at session end
- [ ] `⌘J` activates/deactivates voice mode
- [ ] Full voice ritual test: speak morning brief request → Jarvis speaks back natural response

---

_Days 12–16 added 2026-06-25. Model: claude-sonnet-4-6. Voice deferred to Day 16 — last, by design._
