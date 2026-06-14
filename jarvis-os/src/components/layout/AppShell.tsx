import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import ToastHost from './ToastHost'

export default function AppShell() {
  return (
    <div
      style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}
    >
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          <Outlet />
        </main>
      </div>
      <ToastHost />
    </div>
  )
}
