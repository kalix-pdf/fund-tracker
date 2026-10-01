import './styles/app.css'
import { RequestForm } from './components/RequestForm'
import { RequestTable } from './components/RequestTable'

function App(): React.JSX.Element {
  return (
    <main className="app">
      <header className="app__header">
        <h1>Fund Request Tracker</h1>
        <p>Log fund requests and track them through approval and liquidation.</p>
      </header>

      <div className="app__body">
        <RequestForm />
        <RequestTable />
      </div>
    </main>
  )
}

export default App