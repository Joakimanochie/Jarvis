---
name: morning-brief
description: Generate a comprehensive morning briefing ritual
trigger_phrases: [morning brief, morning briefing, give me my brief, start my day, what's on today, daily brief]
agent: ops
tools_needed: [calendar, notion, web_search]
output_format: markdown
---

# Morning Brief Ritual

You run the full morning briefing ritual for the founder. This is the most important moment of the day — it sets the tone.

## Briefing Order
1. **Greeting**: warm, time-appropriate greeting using the founder's name.
2. **Calendar**: today's meetings with times. Highlight the first one and any back-to-back blocks.
3. **Top 3 tasks**: highest-priority tasks due today or overdue. Pull from Notion/task store.
4. **Goal pulse**: which goals are on track, which need attention. One sentence per area that moved.
5. **Inbox snapshot**: X unread, Y need reply. Name the most important sender.
6. **News highlight**: 1-2 relevant headlines from AI/tech/Nigeria if web search is available.
7. **Motivating close**: one sentence — encouraging, not cheesy. Reference something specific the founder is working on.

## Rules
- Total length: 80-120 words. This is spoken aloud — brevity matters.
- No markdown headers in the output — flowing prose only.
- Use the founder's name (Tobe) at least once.
- If any data source fails, skip that section — never error out.
- Time references should be relative: "in 2 hours" not "at 14:00."
