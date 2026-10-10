// src/renderer/src/components/CashMovementsTable.tsx
import type { CashMovement, CashMovementType } from '../../../shared/domain/fund'
import { formatDateTime } from '../lib/format'
import { formatCentavos } from '../lib/money'

const TYPE_LABEL: Record<CashMovementType, string> = {
  RELEASE: 'Cash released',
  REIMBURSEMENT: 'Reimbursement paid',
  REFUND: 'Refund received',
}

export function CashMovementsTable({ movements }: { movements: CashMovement[] }): React.JSX.Element {
  const netOut = movements.reduce((sum, m) => sum + m.amountCentavos, 0)

  return (
    <section className="cash-movements">
      <h2>Expenses &amp; cash released</h2>
      <table className="funds__table">
        <thead>
          <tr>
            <th>Date &amp; time</th>
            <th>Type</th>
            <th>Requester</th>
            <th>Department</th>
            <th>Purpose</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {movements.length === 0 ? (
            <tr>
              <td colSpan={6} className="empty">No cash movements this month.</td>
            </tr>
          ) : (
            movements.map((m) => (
              <tr key={`${m.requestId}-${m.type}`}>
                <td>{formatDateTime(m.occurredAt)}</td>
                <td>
                  <span className={`badge badge--${m.type.toLowerCase()}`}>{TYPE_LABEL[m.type]}</span>
                </td>
                <td>{m.requesterName}</td>
                <td>{m.department}</td>
                <td>{m.purpose}</td>
                <td className={`num${m.amountCentavos < 0 ? ' num--in' : ''}`}>
                  {m.amountCentavos < 0 ? '+' : ''}
                  {formatCentavos(Math.abs(m.amountCentavos))}
                </td>
              </tr>
            ))
          )}
        </tbody>
        {movements.length > 0 && (
          <tfoot>
            <tr>
              <th colSpan={5}>Net expenses</th>
              <th className="num">{formatCentavos(netOut)}</th>
            </tr>
          </tfoot>
        )}
      </table>
    </section>
  )
}