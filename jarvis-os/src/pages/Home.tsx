import MemoryCard from '@/components/dashboard/MemoryCard'
import BriefingBar from '@/components/dashboard/BriefingBar'
import CommandBar from '@/components/dashboard/CommandBar'
import MetricsRow from '@/components/dashboard/MetricsRow'
import TodaysTasks from '@/components/dashboard/TodaysTasks'
import ProjectLanes from '@/components/dashboard/ProjectLanes'
import NewsStrip from '@/components/dashboard/NewsStrip'
import AgentPanel from '@/components/agent/AgentPanel'
import InboxPanel from '@/components/dashboard/InboxPanel'
import CalendarTimeline from '@/components/dashboard/CalendarTimeline'

export default function Home() {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <MemoryCard />
      <BriefingBar />
      <CommandBar />
      <AgentPanel />
      <MetricsRow />
      <TodaysTasks />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <InboxPanel />
        <CalendarTimeline />
      </div>
      <ProjectLanes />
      <NewsStrip />
    </div>
  )
}
