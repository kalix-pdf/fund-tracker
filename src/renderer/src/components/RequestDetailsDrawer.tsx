import type { RequestRow } from '../../../shared/domain/request'
import { formatPesos } from '../../../shared/domain/money'
import { Drawer } from './Drawer'
import { StatusBadge } from './StatusBadge'

interface Props {
  request: RequestRow
  open: boolean
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

export function RequestDetailsDrawer({ request: r, open, onClose }: Props): React.JSX.Element {
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
    <Drawer open={open} title={`Request #${r.id}`} meta={<StatusBadge status={r.status} />} onClose={onClose}>
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
    </Drawer>
  )
}