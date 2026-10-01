import { useEffect } from 'react'
import type { RequestRow } from '../../../shared/domain/request'
import { formatPesos } from '../../../shared/domain/money'
import { StatusBadge } from './StatusBadge'

interface Props {
  request: RequestRow
  onClose: () => void
}

const dateFormat = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' })

function formatDate(d: Date | null): string {
  return d ? dateFormat.format(d) : '—'
}

function describeSettlement(r: RequestRow): { label: string; tone: 'warning' | 'success' | 'neutral' } {
  if (r.status !== 'COMPLETED') return { label: 'Not yet liquidated', tone: 'neutral' }
  const amount = formatPesos(r.settlementCentavos ?? 0)
  if (r.reimbursementStatus === 'PENDING') return { label: `Reimbursement pending: ${amount}`, tone: 'warning' }
  if (r.reimbursementStatus === 'PAID') return { label: `Reimbursed: ${amount}`, tone: 'success' }
  if (r.refundStatus === 'PENDING') return { label: `Refund pending from requester: ${amount}`, tone: 'warning' }
  if (r.refundStatus === 'REFUNDED') return { label: `Refunded: ${amount}`, tone: 'success' }
  return { label: 'Fully liquidated, no balance', tone: 'success' }
}

export function RequestDetailsDrawer({ request: r, onClose }: Props): React.JSX.Element {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const settlement = describeSettlement(r)

  const timeline: Array<[string, Date | null]> = [
    ['Created', r.createdAt],
    ['Approved', r.approvedAt],
    ['Released', r.releasedAt],
    ['Completed', r.completedAt],
    ['Reimbursed', r.reimbursedAt],
    ['Refunded', r.refundedAt]
  ]

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer__header">
          <div>
            <h3 id="drawer-title">Request #{r.id}</h3>
            <StatusBadge status={r.status} />
          </div>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Close details">
            ✕
          </button>
        </header>

        <section className="drawer__section">
          <h4>Request</h4>
          <dl className="detail-list">
            <dt>Requester</dt>
            <dd>{r.requesterName}</dd>
            <dt>Department</dt>
            <dd>{r.department}</dd>
            <dt>Purpose</dt>
            <dd className="detail-list__multiline">{r.purpose}</dd>
          </dl>
        </section>

        <section className="drawer__section">
          <h4>Amounts</h4>
          <dl className="detail-list">
            <dt>Released</dt>
            <dd>{formatPesos(r.amountCentavos)}</dd>
            <dt>Liquidated (receipts)</dt>
            <dd>{r.liquidatedCentavos === null ? '—' : formatPesos(r.liquidatedCentavos)}</dd>
            <dt>Balance</dt>
            <dd>
              <span className={`tag tag--${settlement.tone}`}>{settlement.label}</span>
            </dd>
          </dl>
        </section>

        <section className="drawer__section">
          <h4>Timeline</h4>
          <ol className="timeline">
            {timeline.map(([label, date]) => (
              <li key={label} className={date ? 'timeline__item is-done' : 'timeline__item'}>
                <span>{label}</span>
                <time>{formatDate(date)}</time>
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </div>
  )
}