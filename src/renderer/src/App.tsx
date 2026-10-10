import { useCallback, useState } from 'react'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import './styles/app.css'
import { AppHeader } from './components/AppHeader'
import { Dashboard } from './components/Dashboard'
import { Drawer } from './components/Drawer'
import { LoginPage } from './components/auth/LoginPage'
import { RequestForm } from './components/RequestForm'
import { RequestTable } from './components/RequestTable'
import { Tabs } from './components/tabs'
import { FundsDashboard } from './components/FundsDashboard'

type View = 'requests' | 'funds'
const VIEWS = [
  { id: 'requests', label: 'Requests' },
  { id: 'funds', label: 'Funds' },
] as const satisfies readonly { id: View; label: string }[]

function MainShell(): React.JSX.Element {
  const [view, setView] = useState<View>('requests')
  const [formOpen, setFormOpen] = useState(false)
  const closeForm = useCallback(() => setFormOpen(false), [])

  return (
    <>
      <AppHeader
        appName="Totops Community"
        section="Finance Management"
        userName="Finance Admin"
        userRole="Community Office"
      />

      <main className="app">
        <div className="app__header">
          <div>
            <h1>Fund Request Tracker</h1>
            <p>Log fund requests and track them through approval and liquidation.</p>
          </div>
          {view === 'requests' && (
            <div className="app__header-actions">
              <button type="button" className="btn btn--primary" onClick={() => setFormOpen(true)}>
                + New request
              </button>
            </div>
          )}
        </div>

        <Tabs tabs={[...VIEWS]} active={view} onChange={setView} />

        <div className="app__body">
          {view === 'requests' ? (
            <>
              <Dashboard />
              <RequestTable />
            </>
          ) : (
            <FundsDashboard />
          )}
        </div>

        <Drawer open={formOpen} title="New fund request" onClose={closeForm}>
          <RequestForm onSubmitted={closeForm} />
        </Drawer>
      </main>
    </>
  )
}

function App(): React.JSX.Element {
  // Fail closed: anything other than an explicit #main renders the login screen.
  return window.location.hash === '#main' ? <MainShell /> : <LoginPage />
}

export default App