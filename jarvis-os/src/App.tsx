import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'

const Home = lazy(() => import('@/pages/Home'))
const GoalsView = lazy(() => import('@/pages/GoalsView'))
const ProjectsView = lazy(() => import('@/pages/ProjectsView'))
const AgentChat = lazy(() => import('@/pages/AgentChat'))
const IdeasCorner = lazy(() => import('@/pages/IdeasCorner'))
const NewsView = lazy(() => import('@/pages/NewsView'))
const CouncilView = lazy(() => import('@/pages/CouncilView'))
const LearningView = lazy(() => import('@/pages/LearningView'))
const CoFounderView = lazy(() => import('@/pages/CoFounderView'))
const Settings = lazy(() => import('@/pages/Settings'))
const AuthCallback = lazy(() => import('@/pages/AuthCallback'))

function PageFallback() {
  return <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px' }}>Loading…</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="goals" element={<GoalsView />} />
            <Route path="projects" element={<ProjectsView />} />
            <Route path="agent" element={<AgentChat />} />
            <Route path="ideas" element={<IdeasCorner />} />
            <Route path="news" element={<NewsView />} />
            <Route path="council" element={<CouncilView />} />
            <Route path="learning" element={<LearningView />} />
            <Route path="cofounder" element={<CoFounderView />} />
            <Route path="settings" element={<Settings />} />
            <Route path="auth/callback" element={<AuthCallback />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
