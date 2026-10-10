import { useCallback, useState } from 'react'
import type { ListQuery } from '../../../shared/schema'
import type { RequestRow } from '../../../shared/domain/request'
import { formatPesos } from '../../../shared/domain/money'
import { useRequests } from '../api/api'
import { StatusActions } from './StatusActions'
import { CompleteDialog } from './CompleteDialog'
import { StatusBadge } from './StatusBadge'
import { RequestDetailsDrawer } from './RequestDetailsDrawer'

export function RequestTable(): React.JSX.Element {
  const [filters, setFilters] = useState<ListQuery>({})
  const [completing, setCompleting] = useState<RequestRow | null>(null)
  const { data = [], isLoading, error } = useRequests(filters)
  
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const selected = data.find((r) => r.id === selectedId) ?? null

  const openDetails = (id:number) => {
    setSelectedId(id)
    setDetailsOpen(true)
  }

  // const closeDetails = useCallback(() => setDetailsOpen(false), [])

  return (
    <section className="cash-movements" aria-labelledby="requests-title">
      <header className="cash-movements__head">
        <h2 className="panel__title">Requests </h2>
        <span className="cash-movements__count">
          {data.length} {data.length === 1 ? 'entry' : 'entries'}
        </span>
         <div className="toolbar">
          <input
            className="input"
            type="search"
            aria-label="Search requests"
            placeholder="Search name or purpose"
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
          />
        </div>
      </header>

      <div className="cash-movements__scroll">
        {error ? (
          <p className="state" role="alert">
            Failed to load requests.
          </p>
        ) : isLoading ? (
          <p className="state">Loading requests…</p>
        ) : data.length === 0 ? (
          <p className="state">No requests found.</p>
        ) : (
          <table className="funds__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Department</th>
                <th>Purpose</th>
                <th>Amount</th>
                <th className='status'>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id}>
                  <td>
                    <button type="button" className="btn-action tag--success"
                      onClick={() => openDetails(r.id)} aria-label={`View details for ${r.requesterName}`}
                    > View
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
                      {r.reimbursementStatus === 'PENDING' && (
                        <span className="tag tag--warning">Reimbursement pending: {formatPesos(r.settlementCentavos)}</span>
                      )}
                      {r.reimbursementStatus === 'PAID' && (
                        <span className="tag tag--success">Paid / Reimbursed: {formatPesos(r.settlementCentavos)}</span>
                      )}
                      {r.refundStatus === 'PENDING' && (
                        <span className="tag tag--warning">Refund pending: {formatPesos(r.settlementCentavos)}</span>
                      )}
                      {r.refundStatus === 'REFUNDED' && (
                        <span className="tag tag--success">Refunded: {formatPesos(r.settlementCentavos)}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="status-cell">
                      <StatusActions request={r} onComplete={setCompleting} />
                      {/* {r.reimbursementStatus === 'PENDING' &&
                        formatPesos(r.liquidatedCentavos ?? 0) !== formatPesos(r.amountCentavos) && (
                          <span className="tag tag--warning">
                            {r.liquidatedCentavos === null
                              ? 'Not completed'
                              : `Settlement: ${formatPesos(r.liquidatedCentavos - r.amountCentavos)}`}
                          </span>
                        )} */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <RequestDetailsDrawer request={selected} open={detailsOpen} onClose={() => setSelectedId(null)} />
      )}
      {completing && <CompleteDialog request={completing} onClose={() => setCompleting(null)} />}
    </section>
  )
}