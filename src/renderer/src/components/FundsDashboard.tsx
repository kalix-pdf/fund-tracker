import { useState } from 'react'
import { useMonthlyFunds } from '../hooks/useMonthlyFunds'
import { currentMonthKey, nextMonthKey } from '../lib/month'
import { formatCentavos, pesosToCentavos } from '../lib/money'
import { CashMovementsTable } from './CashMovementsTable'
import { Drawer } from './Drawer'
import { Tabs } from './Tabs'

type DrawerTab = 'add' | 'additions'

export function FundsDashboard(): React.JSX.Element {
  const [month, setMonth] = useState(currentMonthKey)
  const { summary, additions, movements, error, refresh } = useMonthlyFunds(month)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('add')

  const openDrawer = (tab: DrawerTab) => {
    setDrawerTab(tab)
    setDrawerOpen(true)
  }

  async function handleAdded() {
    await refresh()
    setDrawerTab('additions')
  }

  async function handleVoid(id: number) {
    await window.api.funds.void(id)
    await refresh()
  }

  const tabs = [
    { id: 'add', label: 'Add funds' },
    { id: 'additions', label: `Additions (${additions.length})` },
  ] as const satisfies readonly { id: DrawerTab; label: string }[]

  return (
    <section className="funds">
      {/* LEFT: month + summary + actions */}
      <aside className="funds__side">
        <label className="funds__month">
          <span>Viewing month</span>
          <input
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
          />
        </label>

        {error && <p role="alert" className="form-error">{error}</p>}

        {summary && (
          <div className="funds__cards">
            <Stat label="Funds added" value={summary.addedCentavos} />
            <Stat label="Cash Released" value={summary.expensesCentavos} />
            <Stat label="Total Cash Expenses" value={summary.expensesCentavos} />
            <Stat label="Remaining Cash" value={summary.remainingCentavos} emphasis />
          </div>
        )}

        <div className="funds__actions">
          <button type="button" className="btn btn--primary btn--block" onClick={() => openDrawer('add')}>
            + Add funds
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={() => openDrawer('additions')}>
            View fund additions ({additions.length})
          </button>
        </div>
      </aside>

      {/* RIGHT: movements table */}
      <div className="funds__main">
        <CashMovementsTable movements={movements} />
      </div>

      <Drawer open={drawerOpen} title="Manage funds" onClose={() => setDrawerOpen(false)}>
        <Tabs tabs={[...tabs]} active={drawerTab} onChange={setDrawerTab} />
        <div className="funds__drawer-body">
          {drawerTab === 'add' ? (
            <AddFundsForm onAdded={handleAdded} />
          ) : (
            <AdditionsList additions={additions} onVoid={handleVoid} />
          )}
        </div>
      </Drawer>
    </section>
  )
}

/* ── Add funds form (owns its own state) ───────────────────────── */

function AddFundsForm({ onAdded }: { onAdded: () => Promise<void> }): React.JSX.Element {
  const [forMonth, setForMonth] = useState(nextMonthKey)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    const amountCentavos = pesosToCentavos(amount)
    if (amountCentavos === null || amountCentavos <= 0) return setFormError('Enter a valid amount')

    setSubmitting(true)
    try {
      await window.api.funds.add({ forMonth, amountCentavos, note: note.trim() || undefined })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add funds')
      setSubmitting(false)
      return
    }

    setAmount('')
    setNote('')
    setFormError(null)
    setSubmitting(false)
    await onAdded()
  }

  return (
    <form className="funds__form" onSubmit={submit} noValidate>
      <div className="field-row">
        <label className="field">
          <span>For month</span>
          <input type="month" value={forMonth} onChange={(e) => setForMonth(e.target.value)} required />
        </label>
        <label className="field">
          <span>Amount (₱)</span>
          <input
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={formError ? true : undefined}
            autoFocus
            required
          />
        </label>
      </div>

      <label className="field">
        <span>Note <small>(optional)</small></span>
        <input
          value={note}
          maxLength={200}
          placeholder="e.g. Monthly replenishment"
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      {formError && <p role="alert" className="form-error">{formError}</p>}

      <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add funds'}
      </button>
    </form>
  )
}

/* ── Fund additions list (owns confirm + error state) ──────────── */

interface Addition {
  id: number
  amountCentavos: number
  createdAt: string | number | Date
  note?: string | null
}

function AdditionsList({
  additions,
  onVoid,
}: {
  additions: Addition[]
  onVoid: (id: number) => Promise<void>
}): React.JSX.Element {
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function confirmVoid(id: number) {
    try {
      await onVoid(id)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to void addition')
    } finally {
      setConfirmingId(null)
    }
  }

  if (additions.length === 0) return <p className="empty">No funds added for this month.</p>

  return (
    <>
      {error && <p role="alert" className="form-error">{error}</p>}
      <ul className="additions">
        {additions.map((a) => (
          <li key={a.id} className="additions__item">
            <div className="additions__main">
              <strong>{formatCentavos(a.amountCentavos)}</strong>
              <span className="additions__meta">
                {new Date(a.createdAt).toLocaleDateString('en-PH')}
                {a.note ? ` · ${a.note}` : ''}
              </span>
            </div>

            {confirmingId === a.id ? (
              <div className="additions__confirm">
                <button type="button" className="btn btn--danger" onClick={() => confirmVoid(a.id)}>
                  Confirm
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => setConfirmingId(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button type="button" className="btn btn--ghost" onClick={() => setConfirmingId(a.id)}>
                Void
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}

function Stat({ label, value, emphasis }: { label: string; value: number; emphasis?: boolean }) {
  const negative = emphasis && value < 0
  return (
    <div className={`stat${emphasis ? ' stat--emphasis' : ''}${negative ? ' stat--negative' : ''}`}>
      <span className="stat__label">{label}</span>
      <span className="stat__value">{formatCentavos(value)}</span>
    </div>
  )
}