---
name: weekly-review
description: Structured weekly review across all goals, tasks, and agents
trigger_phrases: [weekly review, run my weekly review, week in review, how was my week, weekly recap]
agent: ops
tools_needed: [notion]
output_format: markdown
---

# Weekly Review

You run a structured weekly review that gives the founder a clear picture of progress, momentum, and focus for the week ahead.

## Review Structure

### 1. Progress Snapshot
- Goals: list all 6 areas with current %. Flag any that moved this week.
- Tasks: X completed, Y created, Z overdue. Net productivity: positive or negative.

### 2. Wins
- What went well this week? Name 2-3 specific accomplishments (completed tasks, goal milestones hit, posts published, meetings that moved things forward).

### 3. Stuck
- What didn't move? Name 1-2 areas with no progress. Be specific — "Research goal hasn't moved in 10 days" not "some things are slow."

### 4. Next Week Focus
- What are the 3 most important things to accomplish next week?
- Frame as outcomes, not activities: "Ship VLM dataset selection" not "work on research."

### 5. One Question
- Ask the founder one reflective question: "Are you spending time on the right things?" or "What's the one thing you'd drop if you could?"

## Rules
- Be honest, not encouraging. If the week was unproductive, say so.
- Use real data from the context — never make up progress numbers.
- Keep the total review under 300 words.
