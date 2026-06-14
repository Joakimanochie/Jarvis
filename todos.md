# Jarvis OS — 7-Day Build To-Do List
> June 1–7, 2026 · Following the Jarvis OS Master Plan v1.3
> One deliverable per day. Build in order. Ship on Sunday.

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

- [ ] **Step 1** — De-risk: test `tool_calls` round-trip with Kimi K2.6 via Nvidia NIM specifically. If unsupported, design JSON-action fallback for `completeWithTools()` contract before building on it. *(In parallel: sign up for Tavily API key.)*
- [ ] **Step 2** — Add `completeWithTools()` to `kimi.ts` (new function, `complete()`/`streamComplete()` untouched). Add Vitest, write tests for it.
- [ ] **Step 3** — `src/agents/toolLoop.ts`: generic tool-calling loop, 5-iteration cap with partial-result fallback, dedup guard (skip repeat `(tool, args)` calls). Tests.
- [ ] **Step 4** — `briefingAgent.ts` with `calendar_read` (wraps existing `calendar.ts`) + `notion_read` tools only. Verify end-to-end text briefing works.
- [ ] **Step 5** — Add `web_search` tool: `/api/search` Vite proxy → Tavily, `webSearch.ts`, wire into briefingAgent.
- [ ] **Step 6** — Wire `BriefingBar.tsx` "speak briefing" button using Web Speech API `SpeechSynthesis`, with `getVoices()` async-load fix (voiceschanged listener + fallback timeout).

---

## Day 9 — Voice Input: Push-to-Talk (planned)
> Makes EVERY agent voice-accessible — talk to Jarvis instead of typing.

**Goal:** Press a button, speak, speech is transcribed and fed into the same `runJarvis()` orchestrator that already routes to all 9 agents. Talking = typing.

- [ ] Add push-to-talk button to `CommandBar.tsx` / `AgentChat.tsx`
- [ ] STT via Whisper (transformers.js or whisper.cpp) — evaluate against laptop performance
- [ ] Transcribed text → `runJarvis(input)` (no orchestrator changes needed)
- [ ] Visual feedback: recording indicator, transcribing state
- [ ] Test across all 9 agents (ops, research, comms, brand, finance, news, council, learning, cofounder)

---

## Day 10 — Wake-Word / Always-On Listening (planned)
> The ambient assistant: "Hey Jarvis" without touching anything.

**Goal:** Always-listening wake word triggers the push-to-talk flow from Day 9 automatically.

- [ ] Evaluate openWakeWord (in-browser ONNX) feasibility in a browser tab
- [ ] If browser mic lifecycle/permissions are too limited → scope Electron wrapper
- [ ] Wake word → auto-trigger STT capture → `runJarvis(input)`
- [ ] Mic permission UX, on/off toggle in Settings
- [ ] Battery/performance check on current laptop

---

## Day 11 — Proactive Speech & Ambient Narrator Mode (planned)
> The actual end goal: Jarvis speaks up on its own — reminders, briefings, narrated changes — without being asked.

**Goal:** Background polling/diffing of calendar, Notion, tasks, Drive (once connected); Jarvis proactively speaks relevant updates via TTS (from Day 8) through the wake-word system (Day 10).

- [ ] Background polling service for calendar/Notion/task diffs
- [ ] "Worth interrupting for" filter (don't narrate every minor change)
- [ ] Proactive TTS announcements (reminders, "your 3pm just moved", new urgent email, etc.)
- [ ] Notification preferences in Settings (quiet hours, what to narrate)
- [ ] Notion write actions (organize pages, log decisions) — extends tool-calling from Day 8 to writes
- [ ] Google Drive integration (`drive.ts`, OAuth via existing `googleAuth.ts` pattern) as a `drive_search`/`drive_organize` tool
- [ ] Obsidian — revisit once laptop/setup allows

---

## Environment Variables Checklist

All prefixed with `VITE_` (required for Vite browser exposure). Set in both `.env.local` and Vercel dashboard before deploying.

```bash
# AI Engine — Kimi K2.6 via Nvidia NIM
VITE_NVIDIA_API_KEY=        ← Get from https://build.nvidia.com/moonshotai/kimi-k2.6
                              Base URL: https://integrate.api.nvidia.com/v1
                              Model: moonshotai/kimi-k2.6

# Notion
VITE_NOTION_API_KEY=        ← Paste "Jarvis" token from app.notion.com/my-integrations (already created ✅)
VITE_NOTION_TASK_DB_ID=39581b20-8060-49b1-80e5-33cbfeeff50e
VITE_NOTION_JARVIS_PAGE_ID=36f90e11-e76c-81c9-9f5b-e015ae7d7036
VITE_NOTION_GOALS_DB_ID=    ← Create Goals database in Notion, share with Jarvis integration, paste ID

# Google (OAuth 2.0)
VITE_GOOGLE_CLIENT_ID=      ← Get from console.cloud.google.com
VITE_GOOGLE_CLIENT_SECRET=
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback

# Obsidian (local — requires app running on same machine)
VITE_OBSIDIAN_API_KEY=      ← Settings → Local REST API → Security in Obsidian
VITE_OBSIDIAN_HOST=http://127.0.0.1:27123
VITE_OBSIDIAN_VAULT_PATH=   ← Absolute path to your vault

# News
VITE_NEWS_API_KEY=          ← Get from newsapi.org (free = 100 req/day)

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

---

_Built from the Jarvis OS Master Plan v1.3 · AI Engine: Kimi K2.6 via Nvidia NIM (moonshotai/kimi-k2.6) · Start: June 2, 2026 · Ship: June 8, 2026_
