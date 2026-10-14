import { monthDayBounds, toLocalDateKey } from '@renderer/lib/month'
import type { CashMovement, CashMovementType } from '../../../shared/domain/fund'
import { formatDateTime } from '../lib/format'
import { formatCentavos } from '../lib/money'
import { useMemo, useState } from 'react'

const TYPE_LABEL: Record<CashMovementType, string> = {
  RELEASE: 'Cash released',
  REIMBURSEMENT: 'Reimbursement paid',
  REFUND: 'Return received',
}

interface Props {
  month: string;
  movements: CashMovement[]
}

export function CashMovementsTable({ month, movements }: Props): React.JSX.Element {
  // const netOut = movements.reduce((sum, m) => sum + m.amountCentavos, 0)
  const [selectedDate, setSelectedDate] = useState('')
  const { min, max } = useMemo(() => monthDayBounds(month), [month])
  const netOut = movements.length > 0 ? movements[0].net : 0

  const visible = useMemo(() => selectedDate
        ? movements.filter((m) => toLocalDateKey(m.occurredAt) === selectedDate)
        : movements,
    [movements, selectedDate],)

  const isFiltered = selectedDate !== ''
  const emptyMessage = isFiltered ? 'No cash movements on this date.' : 'No cash movements this month.'

  return (
    <section className="cash-movements">
      <header className="cash-movements__head">
        <h2 className="panel__title">Expenses &amp; cash released</h2>
        
        <div className="cash-movements__tools">
          <label className="cash-movements__filter">
            <span className="cash-movements__filter-label">Date</span>
            <input
              type="date"
              className="cash-movements__date"
              value={selectedDate}
              min={min}
              max={max}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </label>
          {isFiltered && (
            <button type="button" className="btn btn--ghost" onClick={() => setSelectedDate('')}>
              Clear
            </button>
          )}
          <span className="cash-movements__count">
            {isFiltered ? `${visible.length} of ${movements.length}` : visible.length}{' '}
            {movements.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </header>

      <div className="cash-movements__scroll">
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
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">{emptyMessage}</td>
              </tr>
            ) : (
              visible.map((m) => (
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
            {/* {movements.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">No cash movements this month.</td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={`${m.requestId}-${m.type}`}>
                  
                </tr>
              ))
            )} */}
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
      </div>
    </section>
  )
}