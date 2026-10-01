import { useState } from 'react'
import type { ListQuery } from '../../../shared/schema'
import type { RequestRow } from '../../../shared/domain/request'
import { formatPesos } from '../../../shared/domain/money'
import { useRequests } from '../api/api'
import { StatusActions } from './StatusActions'
import { CompleteDialog } from './CompleteDialog'
import { StatusBadge } from './StatusBadge'

export function RequestTable(): React.JSX.Element {
  const [filters, setFilters] = useState<ListQuery>({})
  const [completing, setCompleting] = useState<RequestRow | null>(null)
  const { data = [], isLoading, error } = useRequests(filters)
  // console.log('RequestTable data:', data) // Debugging line to check the data being fetched

  return (
    <section className="card table-card" aria-labelledby="requests-title">
      <header className="card__header">
        <div>
          <h2 className="card__title" id="requests-title">
            Requests
          </h2>
          <p className="card__subtitle">
            {isLoading ? 'Loading…' : `${data.length} ${data.length === 1 ? 'record' : 'records'}`}
          </p>
        </div>
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

      <div className="table-scroll">
        {error ? (
          <p className="state" role="alert">
            Failed to load requests.
          </p>
        ) : isLoading ? (
          <p className="state">Loading requests…</p>
        ) : data.length === 0 ? (
          <p className="state">No requests found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Department</th>
                <th scope="col">Purpose</th>
                <th scope="col" className="num">
                  Amount
                </th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id}>
                  <td className="cell-primary">{r.requesterName}</td>
                  <td>{r.department}</td>
                  <td className="cell-purpose" title={r.purpose}>
                    {r.purpose}
                  </td>
                  <td className="num">{formatPesos(r.amountCentavos)}</td>
                  <td>
                    <div className="status-cell">
                      <StatusBadge status={r.status} />
                      {r.reimbursementStatus === 'PENDING' && (
                        <span className="tag">Reimbursement pending: {formatPesos(r.settlementCentavos)}</span>
                      )}
                      {r.reimbursementStatus === 'PAID' && (
                        <span className="tag tag--success">Paid / Reimbursed: {formatPesos(r.settlementCentavos)}</span>
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

      {completing && <CompleteDialog request={completing} onClose={() => setCompleting(null)} />}
    </section>
  )
}