import { useState } from 'react'
import type { ListQuery } from '../../../shared/schema'
import type { RequestRow } from '../../../shared/domain/request'
import { formatPesos } from '../../../shared/domain/money'
import { useRequests } from '../api/api'
import { StatusActions } from './StatusActions'
import { CompleteDialog } from './CompleteDialog'
import { StatusBadge } from './StatusBadge'
import { RequestDetailsDrawer } from './RequestDetailsDrawer'

const COLUMN_COUNT = 7

function MessageRow({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <tr>
      <td colSpan={COLUMN_COUNT} className="empty">
        {children}
      </td>
    </tr>
  )
}

function SettlementTags({ request: r }: { request: RequestRow }): React.JSX.Element | null {
  const amount = formatPesos(r.settlementCentavos ?? 0)

  return (
    <>
      {r.reimbursementStatus === 'PENDING' && (
        <span className="tag tag--warning">Reimbursement pending: {amount}</span>
      )}
      {r.reimbursementStatus === 'PAID' && (
        <span className="tag tag--success">Paid / Reimbursed: {amount}</span>
      )}
      {r.refundStatus === 'PENDING' && (
        <span className="tag tag--warning">Refund pending: {amount}</span>
      )}
      {r.refundStatus === 'REFUNDED' && (
        <span className="tag tag--success">Refunded: {amount}</span>
      )}
    </>
  )
}

interface RequestTableRowProps {
  request: RequestRow
  onView: (id: number) => void
  onComplete: (request: RequestRow) => void
}

function RequestTableRow({ request: r, onView, onComplete }: RequestTableRowProps): React.JSX.Element {
  return (
    <tr>
      <td>
        <button
          type="button"
          className="btn-action tag--success"
          onClick={() => onView(r.id)}
          aria-label={`View details for ${r.requesterName}`}
        >
          View
        </button>
      </td>
      <td>{r.requesterName}</td>
      <td>{r.department}</td>
      <td>
        <div className="cell-purpose__text" title={r.purpose}>
          {r.purpose}
        </div>
      </td>
      <td>{formatPesos(r.amountCentavos)}</td>
      <td>
        <div className="status-cell">
          <StatusBadge status={r.status} />
          <SettlementTags request={r} />
        </div>
      </td>
      <td>
        <div className="status-cell">
          <StatusActions request={r} onComplete={onComplete} />
        </div>
      </td>
    </tr>
  )
}

export function RequestTable(): React.JSX.Element {
  const [filters, setFilters] = useState<ListQuery>({})
  const [completing, setCompleting] = useState<RequestRow | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const { data = [], isLoading, error } = useRequests(filters)
  const selected = data.find((r) => r.id === selectedId) ?? null

  const openDetails = (id: number) => {
    setSelectedId(id)
    setDetailsOpen(true)
  }

  const closeDetails = () => setDetailsOpen(false)

  return (
    <section className="cash-movements" aria-labelledby="requests-title">
      <header className="cash-movements__head">
        <h2 id="requests-title" className="panel__title">Requests</h2>
        <span className="cash-movements__count">
          {data.length} {data.length === 1 ? 'entry' : 'entries'}
        </span>
        <div className="toolbar">
          <input
            className="input"
            type="search"
            aria-label="Search requests"
            placeholder="Search name or purpose"
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value || undefined }))
            }
          />
        </div>
      </header>

      <div className="cash-movements__scroll">
        <table className="funds__table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>#</th>
              <th>Name</th>
              <th>Department</th>
              <th>Purpose</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <MessageRow>Loading requests...</MessageRow>
            ) : error ? (
              <MessageRow>Error loading requests.</MessageRow>
            ) : data.length === 0 ? (
              <MessageRow>No requests found.</MessageRow>
            ) : (
              data.map((r) => (
                <RequestTableRow
                  key={r.id}
                  request={r}
                  onView={openDetails}
                  onComplete={setCompleting}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <RequestDetailsDrawer request={selected} open={detailsOpen} onClose={closeDetails} />
      )}
      {completing && (
        <CompleteDialog request={completing} onClose={() => setCompleting(null)} />
      )}
    </section>
  )
}