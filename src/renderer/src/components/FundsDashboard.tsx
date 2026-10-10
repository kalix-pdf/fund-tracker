import { useState } from 'react'
import { useMonthlyFunds } from '../hooks/useMonthlyFunds'
import { currentMonthKey, nextMonthKey } from '../lib/month'
import { formatCentavos, pesosToCentavos } from '../lib/money'
import { CashMovementsTable } from './CashMovementsTable'

export function FundsDashboard(): React.JSX.Element {
  const [month, setMonth] = useState(currentMonthKey)
  const { summary, additions, movements, error, refresh } = useMonthlyFunds(month)

  const [forMonth, setForMonth] = useState(nextMonthKey)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const amountCentavos = pesosToCentavos(amount)
    if (amountCentavos === null || amountCentavos <= 0) return setFormError('Enter a valid amount')
    try {
      await window.api.funds.add({ forMonth, amountCentavos, note: note.trim() || undefined })
      setAmount('')
      setNote('')
      setFormError(null)
      await refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add funds')
    }
  }

  async function voidAddition(id: number) {
    await window.api.funds.void(id)
    await refresh()
  }

  return (
    <section className="funds">
      <div className="funds__toolbar">
        <label>
          Month <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
        </label>
      </div>

      {error && <p role="alert" className="form-error">{error}</p>}

      {summary && (
        <div className="funds__cards">
          <Stat label="Cash Released" value={summary.expensesCentavos} />
          <Stat label="Funds added" value={summary.addedCentavos} />
          <Stat label="Total Cash Expenses" value={summary.expensesCentavos} />
          <Stat label="Remaining Cash" value={summary.remainingCentavos} emphasis />
        </div>
      )}

      <form className="funds__form" onSubmit={submit}>
        <h2>Add funds</h2>
        <label>For month <input type="month" value={forMonth} onChange={(e) => setForMonth(e.target.value)} required /></label>
        <label>Amount (₱) <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required /></label>
        <label>Note <input value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} /></label>
        <button type="submit" className="btn btn--primary">Add funds</button>
        {formError && <p role="alert" className="form-error">{formError}</p>}
      </form>

      <table className="funds__table">
        <thead><tr><th>Added</th><th>Amount</th><th>Note</th><th /></tr></thead>
        <tbody>
          {additions.map((a) => (
            <tr key={a.id}>
              <td>{new Date(a.createdAt).toLocaleDateString('en-PH')}</td>
              <td>{formatCentavos(a.amountCentavos)}</td>
              <td>{a.note}</td>
              <td><button type="button" className="btn btn--ghost" onClick={() => voidAddition(a.id)}>Void</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <CashMovementsTable movements={movements} />
    </section>
  )
}

function Stat({ label, value, emphasis }: { label: string; value: number; emphasis?: boolean }) {
  return (
    <div className={`stat${emphasis ? ' stat--emphasis' : ''}`}>
      <span className="stat__label">{label}</span>
      <span className="stat__value">{formatCentavos(value)}</span>
    </div>
  )
}