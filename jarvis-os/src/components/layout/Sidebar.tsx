import { NavLink } from 'react-router-dom'
import {
  Home,
  Target,
  FolderKanban,
  Bot,
  Lightbulb,
  Newspaper,
  Settings,
  Zap,
  Landmark,
  GraduationCap,
  Handshake,
  Sparkles,
} from 'lucide-react'
import AgentLog from '@/components/agent/AgentLog'

const navItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/agent', label: 'Agent Chat', icon: Bot },
  { path: '/ideas', label: 'Ideas', icon: Lightbulb },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/council', label: 'Council', icon: Landmark },
  { path: '/learning', label: 'Learning', icon: GraduationCap },
  { path: '/cofounder', label: 'Co-Founder', icon: Handshake },
  { path: '/skills', label: 'Skills', icon: Sparkles },
]

export default function Sidebar() {
  return (
    <aside
      style={{
        width: '220px',
        flexShrink: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '0 20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              background: 'var(--accent)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={14} color="#000" fill="#000" />
          </div>
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '16px',
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px',
            }}
          >
            JARVIS OS
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '8px',
              marginBottom: '2px',
              textDecoration: 'none',
              fontSize: '13.5px',
              fontWeight: isActive ? 500 : 400,
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-glow)' : 'transparent',
              transition: 'all 0.15s ease',
            })}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              if (!el.classList.contains('active')) {
                el.style.background = 'var(--bg-hover)'
                el.style.color = 'var(--text-primary)'
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              if (!el.getAttribute('aria-current')) {
                el.style.background = ''
                el.style.color = ''
              }
            }}
          >
            <Icon size={16} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Agent activity log */}
      <AgentLog />

      {/* Settings at bottom */}
      <div style={{ padding: '0 12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '8px' }}>
        <NavLink
          to="/settings"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '13.5px',
            fontWeight: isActive ? 500 : 400,
            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
            background: isActive ? 'var(--accent-glow)' : 'transparent',
          })}
        >
          <Settings size={16} strokeWidth={1.8} />
          Settings
        </NavLink>
      </div>
    </aside>
  )
}
