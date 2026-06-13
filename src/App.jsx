import { useState } from 'react'
import Header from './components/Header'
import TabNav from './components/TabNav'
import Logs from './pages/Logs'
import Denylist from './pages/Denylist'
import Allowlist from './pages/Allowlist'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

const TABS = ['Denylist', 'Allowlist', 'Analytics', 'Logs', 'Settings']

export default function App() {
  const [activeTab, setActiveTab] = useState('Logs')

  const Page = {
    Denylist,
    Allowlist,
    Analytics,
    Logs,
    Settings,
  }[activeTab] ?? Logs

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Page />
      </main>
    </div>
  )
}
