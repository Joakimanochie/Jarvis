# JARVIS OS — Master Build Plan
> Personal Agentic Operating System for a Researcher, Founder & Builder
> Version 2.0 | Created: 2026-05-29 | Updated: 2026-06-25 — Days 12–16 added: Skills system, MCP tools, long-term memory, agent upgrades, voice integration

---

## 0. Vision Statement

Jarvis OS is a personal operating system built around one person's life: a researcher, founder, product manager, and brand builder. It is not a tool — it is an environment. Every morning you open it and it tells you what matters. Every evening it closes the loop. The AI engine (Kimi K2.6 via Nvidia NIM) orchestrates nine specialised agents that talk to your real tools: Gmail, Google Drive, Google Calendar, Notion, Obsidian, LinkedIn, and the web. Nothing is siloed. Everything is connected.

**The north star:** _Open Jarvis. Know exactly where you stand. Do the work that matters._

---

## 1. Who This Is For (User Persona)

| Dimension | Detail |
|-----------|--------|
| **Role** | Researcher · Founder · Product Manager · Brand Builder |
| **Projects** | VLM / AI research, business venture(s), personal brand (LinkedIn), ideas pipeline |
| **Tools in use** | Gmail, Google Drive, Google Calendar, Notion, Obsidian |
| **Daily needs** | Morning orientation, task clarity, research momentum, brand consistency, financial awareness, world & industry news |
| **Pain points** | Context switching, ideas getting lost, no single view of progress, brand posting inconsistency |
| **Goal** | One place to come every day that knows what I'm working on and helps me move forward |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        JARVIS OS                            │
│                   (Browser / Desktop App)                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                ┌─────────▼──────────┐
                │   AI ENGINE         │
                │  (Kimi K2.6 via     │
                │   Nvidia NIM API)   │
                │   - Reasoning core  │
                │   - Memory layer    │
                │   - Tool routing    │
                └─────────┬──────────┘
                          │
        ┌─────────────────┼──────────────────────┐
        │                 │                      │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────────▼──────┐
│  ORCHESTRATOR │  │   CONTEXT    │  │   STATE STORE    │
│  - Route tasks│  │   MANAGER   │  │   - Goals data   │
│  - Agent mgmt │  │   - Memory  │  │   - Task state   │
│  - Daily brief│  │   - History │  │   - Agent logs   │
└───────┬──────┘  └──────────────┘  └──────────────────┘
        │
        ├──────────────────────────────────────────────────┐
        │                                                  │
┌───────▼──────────────────────────────────────────────────▼─┐
│                        NINE AGENTS                          │
│                                                             │
│  [1] RESEARCH  [2] COMMS  [3] BRAND  [4] OPS  [5] FINANCE  │
│  [6] NEWS  [7] LEARNING  [8] COUNCIL  [9] CO-FOUNDER        │
└─────────────────────────────────────────────────────────────┘
        │
        ├── Gmail MCP
        ├── Google Drive MCP
        ├── Google Calendar MCP
        ├── Notion MCP
        ├── Obsidian Local REST API (localhost:27123)
        ├── Web Search
        ├── News APIs (NewsAPI / RSS feeds)
        └── LinkedIn (Phase 3)
```

---

## 3. The Nine Agents

### Agent 1 — Research Agent 🔬
**Purpose:** Accelerate research work. Find papers, summarise content, track project status, draft research notes.

**Capabilities:**
- Web search for papers, articles, datasets
- Summarise PDFs and documents from Google Drive
- Pull and update research tasks from Notion
- Read and write research notes directly in your Obsidian vault
- Draft research notes and literature reviews, saving them to Obsidian
- Track VLM / AI project milestones
- Answer deep questions with cited sources
- Search Obsidian vault for existing notes on a topic before searching the web

**Triggers:**
- "Research [topic]"
- "Summarise this paper"
- "What's the status of my research project?"
- "What have I already written about [topic]?" → searches Obsidian vault
- Morning brief: surfaces research tasks due today

**Tools used:** Web Search, Google Drive, Notion, Obsidian vault

---

### Agent 2 — Communications Agent 📬
**Purpose:** Manage inbox intelligently. Draft, triage, and follow up without losing context.

**Capabilities:**
- Triage Gmail inbox by priority (urgent / needs reply / FYI / archive)
- Draft email replies in your voice
- Summarise unread threads
- Schedule meetings via Google Calendar
- Flag emails related to active projects
- Send follow-up reminders

**Triggers:**
- "What's in my inbox?"
- "Draft a reply to [sender]"
- "Schedule a meeting with [person]"
- Morning brief: inbox summary + calendar for the day

**Tools used:** Gmail, Google Calendar

---

### Agent 3 — Brand Agent 📣
**Purpose:** Make showing up on LinkedIn effortless and consistent. Build the founder + researcher brand.

**Capabilities:**
- Generate LinkedIn post drafts from your notes, ideas, or research
- Maintain your content pillars and voice profile
- Suggest what to post based on your current projects
- Track posting frequency
- Repurpose research findings into accessible content
- Pull raw notes and drafts directly from Obsidian vault as source material
- Draft carousel outlines, article stubs, and thought leadership pieces

**Triggers:**
- "Write a LinkedIn post about [topic]"
- "I need content for this week"
- "Turn this research note into a post"
- "Turn this Obsidian note into a post"
- Weekly prompt: "It's been X days since your last post"

**Tools used:** Notion (content calendar), Obsidian vault, Web Search

---

### Agent 4 — Ops Agent 🗂️
**Purpose:** Keep projects, tasks, and goals organised. Be the system of record for what you're working on.

**Capabilities:**
- Create, update, and surface tasks in Notion
- Manage project status across Research, Business, Brand, Ideas
- Run weekly reviews automatically
- Update goal progress percentages
- Detect stale tasks and flag them
- Capture ideas instantly to the Ideas Corner (Notion + Obsidian)
- Generate weekly planning brief every Monday
- Write daily notes to Obsidian vault (date-stamped, structured)

**Triggers:**
- "Add task: [description] to [project]"
- "What are my top 3 priorities today?"
- "Run my weekly review"
- "Log this idea: [description]"
- Daily: surfaces today's tasks on the dashboard
- Daily: writes today's Jarvis brief as a dated note in Obsidian

**Tools used:** Notion, Google Drive, Obsidian vault

---

### Agent 5 — Finance Agent 💰
**Purpose:** Maintain financial awareness without friction. Track, alert, and advise.

**Capabilities:**
- Track income and expenses from a Notion finance log
- Monthly budget vs actual summary
- Savings milestone progress
- Alert on unusual patterns
- Generate monthly financial review
- Estimate runway for business projects

**Triggers:**
- "Log expense: [amount] [category]"
- "What's my financial status this month?"
- "How's my savings goal going?"
- Monthly: auto-generates financial snapshot

**Tools used:** Notion (finance database), Google Drive (spreadsheets)

---

### Agent 6 — News Agent 🌍
**Purpose:** Keep you informed on everything that matters — AI, tech, Nigeria, global affairs, business — delivered as a crisp, scannable brief. No doom-scrolling. Just what you need to know.

**Capabilities:**
- Fetch live headlines across configurable topic feeds (AI, tech, Nigeria, global news, startups, policy, security)
- Generate a ranked morning news brief: top stories grouped by topic, 2-sentence summary per story
- Deep-dive on any story on demand: full context, background, implications
- Track ongoing stories across multiple days ("catch me up on X")
- Surface news relevant to your active projects (e.g. AI policy news → Research + Brand Agent)
- Weekly digest: biggest stories of the week + what they mean for you
- Custom watchlist: monitor specific topics, people, companies, or regions
- Cross-link news to brand content: "this AI story could be a LinkedIn post"

**Topic Feeds (configurable):**
- 🤖 AI & Machine Learning — model releases, research breakthroughs, policy
- 💻 Tech & Startups — products, funding rounds, acquisitions
- 🇳🇬 Nigeria — politics, economy, security, business, society
- 🌍 World Affairs — geopolitics, international business, diplomacy
- 📋 Policy & Regulation — AI regulation, tech law, data privacy
- 💰 Finance & Markets — macro trends, crypto, investment news
- 🔬 Science & Research — breakthroughs relevant to your work

**Triggers:**
- "What's happening in AI today?"
- "Give me my morning news brief"
- "What's the news in Nigeria this week?"
- "Catch me up on [topic / ongoing story]"
- "Any news I should know about for my research?"
- Morning brief: auto-appended as the final section every day
- Weekly: Sunday digest — week's top stories across all feeds

**Output formats:**
- **Morning brief** — 5–7 stories, topic-grouped, 2 sentences each, link to source
- **Deep dive** — full story breakdown: what happened, why it matters, what comes next
- **Weekly digest** — top 10 stories of the week, narrative summary
- **Relevance flag** — when a news story connects to your projects or goals, surfaces it proactively

**Tools used:** Web Search, News APIs (NewsAPI.org / RSS feeds), Notion (save stories to read later)

---

### Agent 7 — Learning Agent 📚
**Purpose:** Be your personal tutor, learning planner, and knowledge companion. Whether you're taking a course, diving into a new topic, or building a skill, the Learning Agent designs the path, tracks your progress, and teaches you on demand.

**Capabilities:**
- Build structured learning plans for any topic or skill (with milestones, resources, and timelines)
- Track active courses and reading lists in Notion
- Explain any concept at any depth — from 5-minute overview to deep technical breakdown
- Surface the best resources: papers, courses, videos, books for a given topic
- Connect what you're learning to your active projects (e.g. "this course on product strategy applies to your business build")
- Quiz mode: generate practice questions to test your understanding
- Spaced repetition prompts: resurface key concepts at the right time
- Summarise course notes or lecture transcripts from Google Drive
- Write structured lesson summaries directly into Obsidian vault (one note per topic, auto-linked)
- Search Obsidian for existing notes before creating new learning content (no duplication)
- Weekly learning check-in: what did you study this week, what's next

**Learning Plans cover:**
- 🎓 Courses in progress (AI/ML, product management, business, research methods)
- 📖 Books and reading lists
- 🛠 Skill tracks (coding, writing, design, strategy)
- 🧠 Topic deep-dives triggered by research or news
- 🗓 Study schedule: how many hours per week, what to prioritise

**Triggers:**
- "Create a learning plan for [topic]"
- "Explain [concept] to me"
- "What should I study this week?"
- "Quiz me on [topic]"
- "Summarise my notes from this course"
- "Save this to my vault" → writes structured note to Obsidian
- "What's the best resource to learn [skill]?"
- "How does what I'm learning connect to my research?"

**Tools used:** Web Search, Google Drive (course notes, PDFs), Notion (learning tracker, reading list), Obsidian vault (lesson notes, concept maps)

---

### Agent 8 — The Council 🏛️
**Purpose:** Kill sycophancy. When you have a hard decision to make — a business idea, a strategy call, a risky move — The Council assembles five radically different advisers who debate the problem from opposing angles, anonymously peer-review each other, and deliver a single clear verdict. No flattery. No echo chamber. The truth.

**Why this exists:** Research shows AI agrees with you 49% more than a human would. Every time you ask for advice on a hard decision, there's roughly a coin-flip chance the AI is just validating you. The Council is the antidote — five voices with fundamentally different incentives, followed by a Chairman who synthesises the final call.

**The Five Advisers:**
- 🔴 **The Contrarian** — only looks for what will fail. Lists every reason the idea is wrong. Finds what breaks first. States the worst plausible outcome. Does not balance.
- 🔵 **The First-Principles Thinker** — rips apart assumptions. Strips the problem to fundamentals. Asks what you'd do if you couldn't use any obvious framework. Rebuilds from zero.
- 🟢 **The Expansionist** — finds the upside you're missing. Looks at the bigger version of the bet. What does the play open up if it works? What's the asymmetric outcome?
- 🟡 **The Outsider** — knows nothing about your industry. Asks the dumb questions only an outsider asks. Surfaces the obvious things people inside the space stopped questioning.
- ⚪ **The Executor** — doesn't care about strategy. Cares about Monday morning. Tells you exactly what to do this week: the email to send, the conversation to have, the file to create.

**The Process:**
1. All five advisers answer separately, in their own voice
2. Each adviser anonymously peer-reviews the other four (no adviser knows which response is theirs)
3. The Chairman reads all five answers + all five reviews, then delivers the final synthesis: the right decision, the strongest reason for it, the one biggest risk, and the specific next step for the next 7 days

**Triggers:**
- "Run the Council on [decision / idea]"
- "I'm stuck on [business idea] — what does the Council say?"
- "Challenge my thinking on [strategy]"
- "Is this idea actually good or am I just excited about it?"
- "First principles check on [plan]"

**Use for:**
- Evaluating new business ideas before you commit time
- Stress-testing product and go-to-market strategy
- Hard hiring, pricing, or equity decisions
- Anything where the cost of being wrong is high

**Tools used:** Context store (goals, projects, decisions log), Notion (log Council outputs for future reference)

---

### Agent 9 — Co-Founder Agent 🤝
**Purpose:** Be the strategic operating layer over everything. This agent knows your business deeply — your goals, your numbers, your lessons, your non-negotiables. It manages the other agents. It pushes back when you're wrong. It compounds memory over time. This is not a chatbot. This is a partner.

**Why this exists:** Most founders use AI like a search engine — ask a question, get an answer, close the tab. Next week, same question, different answer. No memory of what you decided. Generic advice. The Co-Founder Agent is built the opposite way: it knows your context at depth, carries forward every decision you've ever made, and gets smarter the longer you use it.

**Capabilities:**
- **Deep context on you as a founder:** your working style, strengths, weaknesses, risk tolerance, non-negotiables — loaded into every session
- **Knows your business at depth:** current quarterly focus, margins, what's been tried and failed, every important rule and number
- **Pushes back:** if a new plan contradicts a decision you made 3 months ago, it names the contradiction. If you're chasing a shiny object, it says so. The hardest behaviour to engineer — and the most valuable
- **Memory that compounds:** every major decision, outcome, and lesson is saved to Notion. Three months in, the Co-Founder remembers more about your business than you do. Six months in, it's catching connections you've forgotten
- **Chief of Staff over all agents:** reads the reports from all other agents (Research, Comms, Brand, Ops, Finance, News, Learning, Council), synthesises them into one strategic brief, and flags what needs your attention
- **Drives the work:** doesn't give you options ("here are some things to consider"). Gives you a recommendation, states the reasoning, and waits for the green light. Then acts
- **Weekly operating review:** every Monday, synthesises last week's outcomes across all agents into a single strategic brief: what moved, what didn't, what changes

**Triggers:**
- "What should I be focused on this week?"
- "Review my business strategy"
- "Am I working on the right things?"
- "What decisions have I made about [topic]?"
- "Synthesise all agent reports into one brief"
- "What's the one thing I should do today?"
- "What have I been consistently avoiding?"
- Morning: auto-generates the Co-Founder's view of your day

**Memory architecture:**
- `cofounder-context.md` — your founder profile (goals, style, non-negotiables)
- `business-context.md` — live business snapshot (current focus, metrics, team, rules)
- `decisions-log.md` — every major decision made, with date and reasoning
- `lessons-log.md` — every lesson learned the hard way
- All stored in **both Notion and Obsidian vault** — Notion for structured querying, Obsidian for your personal second brain and backlink graph

**Tools used:** All other agents (acts as orchestrator-in-chief), Notion (context files, decision log, lessons log), Obsidian vault (mirrored context files, backlinked notes), Google Drive

---

### 4.1 Core Philosophy
- **Daily-first:** The default view is today. Everything starts from now.
- **Frictionless entry:** One click to open. No login friction. Instant context.
- **Progressive disclosure:** Show the essential. Let the user drill down.
- **Dark and focused:** Designed for deep work. No distractions.

### 4.2 Layout — Five Sections

```
┌──────────────────────────────────────────────────────────────┐
│  JARVIS OS                          Fri, May 29 · Good morning│
│──────────────────────────────────────────────────────────────│
│  [1] BRIEFING BAR          Today's AI-generated morning brief │
│                            + top 3 news stories of the day   │
│──────────────────────────────────────────────────────────────│
│  [2] COMMAND BAR           Natural language input to Jarvis   │
│──────────────────────────────────────────────────────────────│
│  [3] DASHBOARD             4-panel metrics overview           │
│      Goals Progress        Tasks Today    Inbox    Calendar   │
│──────────────────────────────────────────────────────────────│
│  [4] PROJECT LANES         Kanban-style across all projects   │
│      Research   Business   Brand   Ideas   Finance            │
│──────────────────────────────────────────────────────────────│
│  [5] NEWS STRIP            Scrollable headlines by topic      │
│      🤖 AI  💻 Tech  🇳🇬 Nigeria  🌍 World  📋 Policy         │
│──────────────────────────────────────────────────────────────│
│  [6] AGENT PANEL           Conversation with any agent        │
│      Select agent → chat → get results inline                 │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 Design Language
- **Theme:** Dark mode primary. Deep navy/charcoal background. Crisp white text. Accent: electric amber `#F59E0B`.
- **Typography:** Display — `Syne` (geometric, distinctive). Body — `DM Mono` (readable monospace feel for data). Labels — `DM Sans`.
- **Cards:** Slightly elevated dark cards. Subtle `1px` borders. No heavy shadows.
- **Motion:** Subtle. Data loads with a fade-in stagger. Agent responses stream in. Progress bars animate on load.
- **Icons:** Tabler Icons (outline).
- **Layout:** Responsive. Works on 1440px desktop and 768px tablet.

### 4.4 Screens / Views
1. **Home (Daily OS)** — morning brief + metrics + top tasks + top 3 news headlines
2. **Goals View** — radar chart + progress bars + milestones per area
3. **Project View** — per-project deep dive (tasks, notes, files, timeline)
4. **Agent Chat** — full conversation panel per agent
5. **Ideas Corner** — quick capture + gallery of ideas
6. **News View** — full news brief, topic feeds, deep dives, saved stories
7. **Learning View** — active courses, learning plans, weekly study tracker, quiz mode
8. **Council View** — run the Council on any decision; history of past Council outputs
9. **Co-Founder View** — strategic brief, decisions log, lessons log, weekly operating review
10. **Settings** — manage integrations, news topics, voice profile, notification preferences

---

## 5. Data Model

### 5.1 Goals
```json
{
  "id": "goal_research",
  "area": "Research",
  "title": "Complete VLM First Aid project & publish findings",
  "progress": 70,
  "status": "on_track",
  "milestones": [
    { "id": "m1", "text": "Define research questions", "done": true },
    { "id": "m2", "text": "Dataset selected", "done": false }
  ],
  "weeklyLog": [
    { "week": "2026-W22", "progress": 70, "note": "System requirements done" }
  ]
}
```

### 5.2 Tasks
```json
{
  "id": "task_001",
  "title": "Review VLM dataset options",
  "project": "research",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-05-30",
  "agentCreated": false,
  "notionId": "36f90e11-e76c-81db-9404-f14958c99e27"
}
```

### 5.3 Agent Log
```json
{
  "id": "log_001",
  "timestamp": "2026-05-29T08:00:00Z",
  "agent": "ops",
  "trigger": "daily_brief",
  "action": "Generated morning briefing",
  "result": "success",
  "output": "5 tasks surfaced, 2 emails flagged"
}
```

---

## 6. Seven-Day Build Plan

### Day 1 — Foundation & Shell
**Goal:** Running app with layout and navigation. No real data yet.

- [ ] Set up React project (Vite + TypeScript)
- [ ] Install dependencies: Tailwind CSS, Lucide icons, Recharts, Framer Motion
- [ ] Build app shell: sidebar, header, main content area
- [ ] Build Home screen layout (5 sections, static placeholder data)
- [ ] Dark theme CSS variables and design tokens
- [ ] Typography system (Syne + DM Mono + DM Sans)
- [ ] Responsive grid system

**Deliverable:** App opens. Layout is correct. Looks right. Nothing is wired yet.

---

### Day 2 — Goals & Progress System
**Goal:** Goals view fully functional with real data from Notion.

- [ ] Goals data model and state management (Zustand)
- [ ] Goals view — radar chart (Recharts) + 6 progress bars
- [ ] Milestones checklist per goal area
- [ ] Weekly review log table
- [ ] Edit progress inline (slider or input)
- [ ] Sync goals to/from Notion via API
- [ ] Goals summary card for the Home dashboard

**Deliverable:** Can open Goals view, see all 6 areas, update progress, and it saves to Notion.

---

### Day 3 — Tasks & Projects
**Goal:** Full task management working across all projects.

- [ ] Task list view + kanban board view (toggle)
- [ ] Filter by project / status / priority
- [ ] Quick-add task from command bar
- [ ] Project lanes on Home screen (Research, Business, Brand, Ideas)
- [ ] Sync with Notion Task List database (read + write)
- [ ] Today's tasks surfaced on Home dashboard
- [ ] Task completion animations

**Deliverable:** Full task system. Can add, complete, and organise tasks. Syncs to Notion.

---

### Day 4 — AI Engine & Command Bar
**Goal:** Natural language input working. Ops Agent live.

- [ ] Command bar UI (⌘K style, always visible)
- [ ] Kimi K2.6 API integration via Nvidia NIM (OpenAI-compatible SDK)
- [ ] Ops Agent: handles task creation, goal updates, idea capture
- [ ] Streaming response display in UI
- [ ] Agent log panel (shows what agents have done)
- [ ] System prompt engineering for Ops Agent persona
- [ ] Context injection: current goals + tasks fed into every prompt

**Deliverable:** Type "add task: X to research" — it appears in Notion and on screen. Talk to Ops Agent naturally.

---

### Day 5 — Communications & Calendar
**Goal:** Inbox triage and calendar view working.

- [ ] Gmail integration (fetch inbox, thread summaries)
- [ ] Inbox triage view: urgent / reply / FYI / archive buckets
- [ ] Email draft composer (AI-assisted, Comms Agent)
- [ ] Google Calendar pull: today's events on Home dashboard
- [ ] Calendar mini-view (week grid)
- [ ] Meeting scheduler via natural language
- [ ] Morning brief generation: inbox + calendar + tasks combined

**Deliverable:** Open Jarvis in the morning. See your inbox summary, today's meetings, and top tasks — all in one briefing.

---

### Day 6 — Brand Agent, News Agent & Ideas Corner
**Goal:** LinkedIn content workflow + news intelligence + ideas capture all live.

- [ ] Ideas Corner: quick capture input, gallery/list of saved ideas
- [ ] Ideas sync to Notion
- [ ] Brand Agent: LinkedIn post drafts from ideas or prompts
- [ ] Content calendar view (what's been posted, what's drafted)
- [ ] Voice profile for Brand Agent (tone, pillars, style)
- [ ] Post preview card (how it'll look on LinkedIn)
- [ ] Research Agent: summarise papers/documents from Drive
- [ ] News Agent: fetch live headlines via NewsAPI / web search
- [ ] News View: topic-tabbed feed (AI, Tech, Nigeria, World, Policy)
- [ ] Morning brief: top 3 news stories auto-appended to daily briefing
- [ ] News watchlist: configurable topics saved to user settings
- [ ] "Save story" → sends to Notion reading list
- [ ] News → Brand bridge: flag relevant stories as LinkedIn post opportunities

**Deliverable:** Drop a note, get a LinkedIn post draft. Capture ideas instantly. Open the News view and see a crisp brief across every topic that matters to you.

---

### Day 7 — Polish, Integration & Daily Ritual
**Goal:** Everything connected. Daily OS ritual works end to end.

- [ ] Morning brief automation (runs on open, or on demand)
- [ ] Finance Agent: expense log + monthly summary in Notion
- [ ] Settings page: manage integrations, voice profile, notification prefs
- [ ] Onboarding flow (first-time setup: enter goals, connect tools)
- [ ] Error states and loading states for all data fetches
- [ ] Performance optimisation (lazy load agents, cache Notion data)
- [ ] End-to-end test: full daily ritual from open to close
- [ ] Deploy to Vercel (or package as Electron desktop app)

**Deliverable:** Jarvis OS is live. Open every morning. Works end to end.

---

## 7. Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | React 18 + Vite + TypeScript | Fast, modern, great DX |
| Styling | Tailwind CSS | Utility-first, design tokens easy |
| State | Zustand | Lightweight, simple |
| Animation | Framer Motion | Polished micro-interactions |
| Charts | Recharts | React-native, composable |
| Icons | Lucide React | Clean, consistent |
| AI Engine | Anthropic Claude API | claude-sonnet-4-6 |
| Notion | Notion API (REST) | Tasks, goals, ideas, finance |
| Obsidian | Local REST API plugin (port 27123) | Second brain, research notes, daily notes, Co-Founder context |
| Gmail | Gmail API (OAuth) | Inbox triage, drafts |
| Calendar | Google Calendar API | Events, scheduling |
| Drive | Google Drive API | Doc summaries, file access |
| News | NewsAPI.org + Web Search | Live headlines, topic feeds, deep dives |
| Skills system | Markdown files (`.md`) in `skills/` folder | Arbitrary skills Jarvis loads on intent match |
| MCP tools | Gmail · Calendar · Drive · Notion · Web Search · Obsidian | All connected via MCP protocol |
| STT (voice) | Deepgram API or OpenAI Whisper API | Accent-aware real-time transcription — Day 16 |
| TTS (voice) | ElevenLabs API or OpenAI TTS | Natural voice output — Day 16 |
| Deployment | Electron (primary) · Vercel (fallback) | Electron for Obsidian localhost compatibility |
| Auth | Clerk (or NextAuth) | Handles Google OAuth cleanly |

---

## 8. Agent Orchestration Protocol

```
USER INPUT → Command Bar
     │
     ▼
INTENT CLASSIFIER (Kimi K2.6)
     │
     ├── research intent → Research Agent
     ├── email/calendar intent → Comms Agent
     ├── brand/content intent → Brand Agent
     ├── task/project/idea intent → Ops Agent
     ├── finance intent → Finance Agent
     ├── news/world/current events intent → News Agent
     ├── learning/study/courses intent → Learning Agent
     ├── decision/challenge/first-principles intent → The Council
     └── strategy/business/weekly review intent → Co-Founder Agent
                │
                ▼
        AGENT EXECUTION
        - System prompt (agent persona + context)
        - Tool calls (MCP / REST APIs / NewsAPI)
        - Streaming response
                │
                ▼
        UI RENDER
        - Stream text to Agent Panel
        - Update relevant dashboard cards
        - Log to Agent Log
        - Sync changes to Notion (saved stories, reading list, decisions log)
```

### Context Injected Into Every Agent Call
```
- Today's date and day of week
- Current goals + progress %
- Today's tasks (open)
- Last 3 agent interactions
- Active projects list
- User voice profile (for Brand Agent)
- Configured news topic watchlist (for News Agent)
- Active learning plans + current course (for Learning Agent)
- Co-Founder context files: founder profile, business snapshot, decisions log (for Co-Founder + Council)
```

---

## 9. File & Folder Structure

```
jarvis-os/
├── src/
│   ├── agents/
│   │   ├── orchestrator.ts       # Intent classifier + routing
│   │   ├── researchAgent.ts
│   │   ├── commsAgent.ts
│   │   ├── brandAgent.ts
│   │   ├── opsAgent.ts
│   │   ├── financeAgent.ts
│   │   ├── newsAgent.ts
│   │   ├── learningAgent.ts
│   │   ├── councilAgent.ts
│   │   └── cofounderAgent.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── dashboard/
│   │   │   ├── BriefingBar.tsx
│   │   │   ├── CommandBar.tsx
│   │   │   ├── MetricsRow.tsx
│   │   │   └── ProjectLanes.tsx
│   │   ├── goals/
│   │   │   ├── GoalsView.tsx
│   │   │   ├── GoalCard.tsx
│   │   │   └── GoalRadar.tsx
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx
│   │   │   └── KanbanBoard.tsx
│   │   ├── agent/
│   │   │   ├── AgentPanel.tsx
│   │   │   └── AgentLog.tsx
│   │   └── ideas/
│   │       └── IdeasCorner.tsx
│   │   └── news/
│   │       ├── NewsView.tsx
│   │       ├── NewsStrip.tsx         # Home dashboard headline ticker
│   │       ├── StoryCard.tsx
│   │       └── TopicFeed.tsx
│   │   └── learning/
│   │       ├── LearningView.tsx
│   │       ├── LearningPlan.tsx
│   │       ├── CourseCard.tsx
│   │       └── QuizMode.tsx
│   │   └── council/
│   │       ├── CouncilView.tsx
│   │       ├── AdviserCard.tsx
│   │       └── CouncilHistory.tsx
│   │   └── cofounder/
│   │       ├── CoFounderView.tsx
│   │       ├── DecisionsLog.tsx
│   │       ├── LessonsLog.tsx
│   │       └── WeeklyBrief.tsx
│   ├── integrations/
│   │   ├── notion.ts
│   │   ├── gmail.ts
│   │   ├── calendar.ts
│   │   ├── drive.ts
│   │   ├── news.ts                  # NewsAPI + RSS feed client
│   │   └── obsidian.ts              # Local REST API client (localhost:27123)
│   ├── store/
│   │   ├── goalsStore.ts
│   │   ├── tasksStore.ts
│   │   ├── agentStore.ts
│   │   ├── newsStore.ts             # Topic watchlist, saved stories, brief cache
│   │   ├── learningStore.ts         # Active courses, plans, quiz state
│   │   └── cofounderStore.ts        # Context files, decisions log, lessons log
│   ├── hooks/
│   │   ├── useJarvis.ts
│   │   ├── useMorningBrief.ts
│   │   └── useNewsFeed.ts
│   └── types/
│       └── index.ts
├── context/
│   ├── cofounder-context.md         # Founder profile (loaded every Co-Founder session)
│   ├── business-context.md          # Live business snapshot
│   ├── decisions-log.md             # Every major decision + date + reasoning
│   └── lessons-log.md               # Lessons learned the hard way
├── public/
├── .env.local                    # API keys (never commit)
├── package.json
└── README.md
```

---

## 10. Phase Roadmap

### Phase 1 — Core OS ✅ (Days 1–7, complete)
Foundation, goals, tasks, basic AI via command bar, Notion sync, all 6 agents, morning brief, deploy

### Phase 2 — Voice Foundation ✅ (Days 8–11, partial)
Browser-native voice input (Web Speech API STT + SpeechSynthesis TTS) — evaluated as foundation only. Robotic voice, stateless exchanges, no persistent loop. Replaced in Phase 4.

### Phase 3 — Intelligence Upgrade (Days 12–15, current focus)
Skills system, MCP tool wiring, long-term memory (builder + injector), agent upgrades from agency-agents repo

### Phase 4 — Real Voice OS (Day 16)
Replace browser voice with Deepgram STT + ElevenLabs/OpenAI TTS. Persistent conversation loop. Natural spoken interaction with full agent + skills access.

### Phase 5 — Proactive Jarvis
Jarvis initiates: nudges, reminders, weekly reviews, LinkedIn posting alerts, research momentum tracking

### Phase 6 — Mobile Companion
Mobile-first view, push notifications, cross-device sync

---

## 11. Environment Variables Needed

```bash
# Anthropic
ANTHROPIC_API_KEY=

# Notion
NOTION_API_KEY=
NOTION_TASK_DB_ID=39581b20-8060-49b1-80e5-33cbfeeff50e
NOTION_JARVIS_PAGE_ID=36f90e11-e76c-81c9-9f5b-e015ae7d7036

# Google (OAuth)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# News
NEWS_API_KEY=                     # From newsapi.org (free tier = 100 req/day)

# Obsidian (Local REST API plugin)
OBSIDIAN_API_KEY=                 # Generated in Obsidian → Local REST API settings
OBSIDIAN_HOST=http://localhost:27123

# Voice — STT (Day 16)
DEEPGRAM_API_KEY=                 # From deepgram.com — or use OpenAI Whisper API
OPENAI_API_KEY=                   # If using OpenAI Whisper STT + OpenAI TTS

# Voice — TTS (Day 16)
ELEVENLABS_API_KEY=               # From elevenlabs.io — or use OpenAI TTS above

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 12. Success Criteria (Definition of Done)

| Feature | Done When |
|---------|-----------|
| Daily OS ritual | Open app → see brief, tasks, goals in < 3 seconds |
| Goals tracking | Can update any goal's progress and it persists to Notion |
| Task management | Add, complete, filter tasks — syncs both ways with Notion |
| Command bar | Natural language → correct agent → useful response |
| Inbox triage | See prioritised inbox summary without opening Gmail |
| LinkedIn drafts | "Write a post about X" → publish-ready draft in < 10s |
| Ideas capture | Drop idea → saved to Notion in 1 click |
| Finance snapshot | Monthly income/expense summary always visible |
| Morning news brief | Top 5–7 stories across all configured topics in < 5 seconds |
| News deep dive | "Tell me more about X story" → full context + implications |
| News watchlist | Custom topics saved and auto-fetched every morning |
| News → Brand bridge | Relevant stories flagged as LinkedIn post opportunities |
| Learning plan | "Create a learning plan for X" → structured plan with milestones saved to Notion |
| Quiz mode | "Quiz me on X" → generates practice questions from learning material |
| Learning tracker | Active courses visible; weekly study check-in generates |
| Council | "Run the Council on X" → 5 advisers respond, peer-review, Chairman delivers final call |
| Council history | Past Council outputs saved and retrievable from Notion |
| Co-Founder context | Founder profile + business snapshot loaded every session |
| Co-Founder memory | Decisions log and lessons log accumulate and persist in Notion |
| Weekly operating review | Every Monday: Co-Founder synthesises all agent reports into one strategic brief |
| Obsidian — daily note | Jarvis writes a structured daily note to vault on every open |
| Obsidian — research sync | Research Agent reads + writes research notes to vault |
| Obsidian — learning notes | Learning Agent saves lesson summaries as linked notes in vault |
| Obsidian — Co-Founder files | Context files mirrored in vault; decisions + lessons auto-appended |
| Obsidian — ideas | Ideas captured in Ideas Corner sync to an Obsidian folder |
| Skills system | Drop a `.md` skill file → Jarvis loads and executes it on matched intent |
| MCP tools | All 6 MCP tools (Gmail, Calendar, Drive, Notion, Web Search, Obsidian) callable from any agent |
| Long-term memory | Jarvis knows your context, goals, and session history before you say a word |
| Memory builder | End of every session → key facts extracted and saved to Notion + Obsidian |
| Context injector | Start of every session → profile + recent history loaded into Jarvis's context |
| Voice conversation | Speak naturally → Jarvis understands, executes, speaks back — Day 16 |
| Voice quality | Jarvis voice sounds natural, not robotic — Day 16 |
| Conversation loop | Multi-turn voice conversation with session memory — Day 16 |

---

## 13. Days 12–16 Build Plan (Current Sprint)

> Days 1–11 are complete. Days 12–15 focus on intelligence, skills, and memory. Day 16 is the voice rebuild — deferred to last because it depends on everything else being solid first and requires budget for Deepgram + ElevenLabs API keys.

---

### Day 12 — Skills System
**Goal:** Jarvis can load and execute arbitrary skills from `.md` files. No code changes needed to add a new capability — just drop a file.

**What the skills system is:** A `skills/` folder in the project. Each file is a Markdown document defining a skill's persona, rules, workflow, and output format. When you speak or type to Jarvis, the orchestrator detects the intent, finds the matching skill file, injects it into the Claude API call as part of the system prompt, and Jarvis executes it. Skills are composable — an agent can load more than one.

#### 🗂 Skills Folder Structure
- [ ] Create `skills/` directory at project root
- [ ] Define skill file format (frontmatter: `name`, `trigger_phrases`, `agent`, `tools_needed`)
- [ ] Build `src/integrations/skillsLoader.ts` — reads all `.md` files from `skills/`, parses frontmatter, returns skill registry
- [ ] Build intent-to-skill matcher in `orchestrator.ts` — given classified intent, find best matching skill file
- [ ] Inject matched skill content into system prompt of the relevant agent call
- [ ] Test: add a skill, speak a trigger phrase, confirm Jarvis uses that skill's workflow

#### 📥 Seed Skills — Adapt from agency-agents repo
Pull these skill files from `https://github.com/msitarzewski/agency-agents` and adapt for Jarvis:

- [ ] `skills/voice-ai-engineer.md` — adapted from `engineering/engineering-voice-ai-integration-engineer.md` — STT pipeline rules (used on Day 16)
- [ ] `skills/linkedin-content-creator.md` — adapted from `marketing/marketing-linkedin-content-creator.md` — Brand Agent skill
- [ ] `skills/email-intelligence.md` — adapted from `engineering/engineering-email-intelligence-engineer.md` — Comms Agent skill
- [ ] `skills/prompt-engineer.md` — adapted from `engineering/engineering-prompt-engineer.md` — used to tune all agents
- [ ] `skills/multi-agent-architect.md` — adapted from `engineering/engineering-multi-agent-systems-architect.md` — orchestration rules
- [ ] `skills/finance-tracker.md` — adapted from `support/support-finance-tracker.md` — Finance Agent skill
- [ ] `skills/financial-analyst.md` — adapted from `finance/finance-financial-analyst.md` — Finance Agent deep skill
- [ ] `skills/product-trend-researcher.md` — adapted from `product/product-trend-researcher.md` — Research Agent skill
- [ ] `skills/chief-of-staff.md` — adapted from `specialized/specialized-chief-of-staff.md` — Co-Founder Agent operating model
- [ ] `skills/business-strategist.md` — adapted from `specialized/specialized-business-strategist.md` — The Council + Co-Founder
- [ ] `skills/meeting-notes.md` — adapted from `project-management/project-management-meeting-notes-specialist.md` — post-call summaries
- [ ] `skills/morning-brief.md` — custom skill: runs Jarvis's morning ritual end to end
- [ ] `skills/weekly-review.md` — custom skill: structured weekly review across all agents
- [ ] `skills/research-mode.md` — custom skill: deep research session with citation tracking

#### ✅ Day 12 Deliverable
> Say "write me a LinkedIn post about my VLM research" → Jarvis loads `linkedin-content-creator.md` skill + Brand Agent → returns a polished draft. Add a new `.md` file to `skills/` → Jarvis can use it immediately with no code change.

---

### Day 13 — MCP Tools Wiring
**Goal:** Every agent in Jarvis can call the right MCP tool for the job. Currently tools are connected but not all agents use them fluently. This day wires them all up properly and adds the missing ones.

#### 🔌 Confirm and Harden Existing MCP Tools
- [ ] Gmail MCP — verify Comms Agent can: fetch inbox, read threads, create drafts, confirm before send
- [ ] Google Calendar MCP — verify Comms Agent + Ops Agent can: fetch today's events, fetch next 7 days, create events
- [ ] Google Drive MCP — verify Research Agent can: search files, read doc content, summarise PDFs
- [ ] Notion MCP — verify all agents can: search pages, read database entries, create pages, update properties

#### 🆕 Add Missing MCP Tools
- [ ] **Obsidian Local REST API** — install Local REST API plugin in Obsidian, enable HTTP on port 27123, generate API key, add `OBSIDIAN_API_KEY` to `.env.local`, build `src/integrations/obsidian.ts` with `readNote()`, `writeNote()`, `appendNote()`, `searchVault()`, `getDailyNote()`
- [ ] **Web Search MCP** — wire Brave Search MCP or Perplexity MCP; Research Agent and News Agent use this for live web queries
- [ ] Test Obsidian connection: write a test note from Jarvis → confirm it appears in vault
- [ ] Test web search: ask Research Agent to search a topic → confirm it returns live results

#### 🤝 Agent-to-Tool Matrix — Wire Each Agent Explicitly
- [ ] Research Agent → Web Search MCP + Google Drive MCP + Notion MCP + Obsidian MCP
- [ ] Comms Agent → Gmail MCP + Google Calendar MCP
- [ ] Brand Agent → Notion MCP (content calendar) + Web Search MCP (trend research)
- [ ] Ops Agent → Notion MCP (tasks, goals, ideas) + Google Calendar MCP + Obsidian MCP (daily notes)
- [ ] Finance Agent → Notion MCP (finance database)
- [ ] News Agent → Web Search MCP + Notion MCP (save stories)
- [ ] Co-Founder Agent → Notion MCP (context files) + Obsidian MCP (context mirror)

#### 🧪 Integration Tests
- [ ] "What meetings do I have today?" → Calendar MCP → correct events returned
- [ ] "What's in my inbox?" → Gmail MCP → triage summary returned
- [ ] "Save this idea to Obsidian" → Obsidian MCP → note appears in vault
- [ ] "Research recent VLM papers" → Web Search MCP → live results returned
- [ ] "What tasks are due today?" → Notion MCP → task list returned

#### ✅ Day 13 Deliverable
> Every agent has the right tools wired. Obsidian is connected and writable. Web search returns live results. All MCP tool calls logged in the Agent Log panel.

---

### Day 14 — Long-Term Memory System
**Goal:** Jarvis knows you across sessions. Before you say a word, it already has your context. After every session, it saves what matters. This is the difference between Jarvis as a tool and Jarvis as a companion.

**Architecture recap:** Two components — a Memory Builder (runs end of session) and a Context Injector (runs start of session). Both write to and read from Notion + Obsidian as the persistent stores.

#### 🧠 Memory Builder
- [ ] Build `src/memory/memoryBuilder.ts`
- [ ] After each conversation session ends, send the full transcript + a memory extraction prompt to Claude
- [ ] Extraction prompt asks Claude to pull: decisions made, key facts mentioned, projects updated, people referenced, ideas captured, mood/energy signals
- [ ] Write extracted memory as a structured JSON blob to Notion (Memory Log database — create if not exists)
- [ ] Mirror the same memory as a dated Markdown note to Obsidian: `memory/sessions/YYYY-MM-DD.md`
- [ ] Cap stored sessions: keep last 30 sessions in Notion, full history in Obsidian
- [ ] Run memory builder automatically when the app is closed or a session is ended manually

#### 💉 Context Injector
- [ ] Build `src/memory/contextInjector.ts`
- [ ] On every app open (or session start), load the following into a context payload:
  - Founder profile (name, role, active projects, communication style)
  - Current goals + progress % from Notion
  - Last 5 session memory summaries from Notion
  - Today's open tasks from Notion
  - Any "pinned context" the user has flagged as always-remember
- [ ] Inject this context payload into the system prompt of every Claude API call — before the agent-specific system prompt
- [ ] Cap injected context at ~2000 tokens to stay within reasonable cost per call
- [ ] Show a "Jarvis knows you" summary card in the UI on load: "Good morning Tobechukwu. You have 3 open tasks. Last session you were working on the VLM dataset. Your next meeting is at 2pm."

#### 🗃 Memory Store — Notion Schema
- [ ] Create `Memory Log` database in Notion with properties: Date, Session Summary (text), Key Facts (text), Decisions (text), Projects Touched (multi-select), Energy Level (select: high/medium/low)
- [ ] Create `Founder Profile` page in Notion: name, role, voice style, active projects, working hours, timezone
- [ ] Create `Pinned Context` page: things Jarvis should always know regardless of recency

#### ✅ Day 14 Deliverable
> Open Jarvis on a new day → it greets you with a summary of where you left off. End a session → memory builder saves what happened. The next day, Jarvis already knows. Cross-session memory is live.

---

### Day 15 — Agent Upgrades & Skills Polish
**Goal:** Every agent gets upgraded using the skills from the agency-agents repo. The Council and Co-Founder Agent (planned in master plan v1.2) get their first implementations. The whole system is tested end to end.

#### 🔬 Research Agent Upgrade
- [ ] Load `skills/research-mode.md` + `skills/product-trend-researcher.md` into Research Agent calls
- [ ] Add: "Find recent papers on [topic]" → web search → structured summary with citations
- [ ] Add: "Summarise this Drive doc" → Drive MCP → key points extracted
- [ ] Add: "What's the status of my VLM project?" → Notion MCP → milestone progress returned

#### 📣 Brand Agent Upgrade
- [ ] Load `skills/linkedin-content-creator.md` + `skills/carousel-growth-engine.md` into Brand Agent
- [ ] Add: carousel outline generation (5-slide structure)
- [ ] Add: "Repurpose this research note into a post" → takes Obsidian note → LinkedIn draft
- [ ] Voice trigger: "Write me a post about X" → Brand Agent → ElevenLabs reads draft back (prep for Day 16)

#### 💰 Finance Agent Upgrade
- [ ] Load `skills/finance-tracker.md` + `skills/financial-analyst.md`
- [ ] Add: monthly summary with income vs expense breakdown
- [ ] Add: savings goal progress tracking
- [ ] Add: "Log expense: ₦X category" via voice (prep for Day 16)

#### 🏛 The Council — First Implementation
- [ ] Build `src/agents/councilAgent.ts`
- [ ] System prompt implements 5-adviser structure: Contrarian, First-Principles Thinker, Expansionist, Outsider, Executor
- [ ] Load `skills/business-strategist.md` as the Chairman synthesis layer
- [ ] Trigger: "Run the Council on [decision]" → 5 perspectives generated → Chairman synthesises
- [ ] Output saved to Notion Council Log

#### 🤝 Co-Founder Agent — First Implementation
- [ ] Build `src/agents/cofounderAgent.ts`
- [ ] Load `skills/chief-of-staff.md` as operating model
- [ ] Context files wired: Founder Profile, Business Snapshot, Decisions Log, Lessons Log (Notion + Obsidian mirrors)
- [ ] Trigger: "Co-Founder morning brief" → synthesises all agent reports into one strategic view
- [ ] Weekly operating review: every Monday, auto-generates cross-agent summary

#### 🧪 End-to-End Test
- [ ] Full daily ritual: open app → memory injected → brief generated → tasks surfaced → news loaded → speak a command → agent fires → tools execute → response returned
- [ ] Skills test: add a new `.md` skill file, trigger it, confirm it loads correctly
- [ ] Memory test: run a session → close app → reopen → confirm yesterday's context is present
- [ ] Council test: "Run the Council on whether to pivot my research direction" → 5 views + synthesis

#### ✅ Day 15 Deliverable
> Every agent upgraded. The Council and Co-Founder live. Full end-to-end daily ritual working. Skills system proven. Memory carrying across sessions. Jarvis feels like a real companion — not just a dashboard.

---

### Day 16 — Voice Rebuild (The Real Voice OS)
**Goal:** Replace the browser-native voice layer (Web Speech API + SpeechSynthesis) with Deepgram STT + ElevenLabs/OpenAI TTS. Build a persistent, natural conversation loop. This is the day Jarvis becomes the voice companion you described.

> **Note on cost:** Deepgram and ElevenLabs are paid APIs. Deepgram's Nova-2 model costs ~$0.0059/min of audio. ElevenLabs' cheapest tier is ~$5/month for 30,000 characters. Confirm you have API keys and budget before starting this day. OpenAI Whisper API + OpenAI TTS is a viable single-vendor alternative if preferred.

#### 🎙 STT — Replace Web Speech API with Deepgram
- [ ] Install Deepgram SDK: `npm install @deepgram/sdk`
- [ ] Add `DEEPGRAM_API_KEY` to `.env.local`
- [ ] Build `src/voice/stt.ts` — Deepgram Nova-2 model, real-time streaming, Nigerian English accent support
- [ ] Replace browser `SpeechRecognition` with Deepgram WebSocket stream in the voice component
- [ ] Implement: start listening → stream audio chunks to Deepgram → receive live transcript → display interim text while speaking
- [ ] Handle errors: microphone permission denied, API timeout, network dropout — graceful fallback messages
- [ ] Add audio preprocessing: resample to 16kHz mono before sending to Deepgram (per Voice AI skill rules)

#### 🔊 TTS — Replace SpeechSynthesis with ElevenLabs
- [ ] Add `ELEVENLABS_API_KEY` to `.env.local`
- [ ] Build `src/voice/tts.ts` — ElevenLabs API, select voice model (or clone a custom voice)
- [ ] Replace browser `speechSynthesis.speak()` with ElevenLabs TTS in all voice response paths
- [ ] Stream audio response: don't wait for full response before playing — stream chunks as they arrive
- [ ] Queue system: if Jarvis is mid-sentence and a new response is triggered, queue the next one
- [ ] Fallback: if ElevenLabs unavailable, fall back to OpenAI TTS; if that fails, fall back to browser TTS

#### 💬 Persistent Conversation Loop
- [ ] Build `src/voice/conversationLoop.ts` — the core voice session manager
- [ ] Loop: listen → transcribe → detect intent → route to agent → get response → speak response → listen again
- [ ] Within-session memory: maintain full conversation transcript in Zustand `voiceStore`
- [ ] Context threading: inject last 5 exchanges into every Claude call so Jarvis remembers what was just said
- [ ] "Hey Jarvis" trigger phrase detection (optional, using Deepgram keyword spotting — enable if desired)
- [ ] End session: user says "goodbye Jarvis" or presses stop → triggers memory builder for that session

#### 🎛 Voice UI Mode
- [ ] Build `VoiceMode.tsx` — a minimal full-screen voice UI: pulsing Jarvis orb when listening, transcript displayed live, agent identity shown when responding
- [ ] Toggle: keyboard shortcut `⌘J` activates voice mode from anywhere in the app
- [ ] Visual states: idle (dim orb) → listening (pulsing amber) → thinking (spinning) → speaking (animated waveform)
- [ ] Transcript panel: scrollable log of the current voice session shown below the orb

#### ✅ Day 16 Deliverable
> Press `⌘J`. Jarvis activates. Say "Hey Jarvis, what's on today?" Jarvis checks your calendar, tasks, and inbox via MCP tools and speaks back a natural-sounding morning brief in a real voice. Say "push my 3pm meeting" — it reschedules it. Say "write a LinkedIn post about my VLM findings" — Brand Agent fires, post drafted, Jarvis reads it back. The voice OS vision is live.

---

_This document is the ground truth for building Jarvis OS. Every sprint, every agent, every design decision starts here._

_Last updated: 2026-06-25 — v2.0: Days 12–16 added. claude-sonnet-4-6 model. Skills system, MCP wiring, long-term memory, agent upgrades, voice rebuild (deferred to Day 16)._
