import { useState, type FormEvent } from 'react'
import type { RequestRow } from '../../../shared/domain/request'
import { formatPesos } from '../../../shared/domain/money'
import { useCompleteRequest } from '../api/api'

interface Props {
  request: RequestRow
  onClose: () => void
}

export function CompleteDialog({ request, onClose }: Props): React.JSX.Element {
  const [receiptsPesos, setReceiptsPesos] = useState('')
  const complete = useCompleteRequest()

  const liquidatedCentavos = Math.round(Number(receiptsPesos || 0) * 100)
  const settlement = liquidatedCentavos - request.amountCentavos

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    complete.mutate({ id: request.id, liquidatedCentavos }, { onSuccess: onClose })
  }

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Complete request — {request.requesterName}</h3>
        <p>Amount released: {formatPesos(request.amountCentavos)}</p>

        <label>
          Total on receipts (PHP)
          <input
            type="number"
            min="0"
            step="0.01"
            autoFocus
            value={receiptsPesos}
            onChange={(e) => setReceiptsPesos(e.target.value)}
            required
          />
        </label>

        {receiptsPesos !== '' && (
          <p>
            {settlement > 0 && <>Up for reimbursement: {formatPesos(settlement)}</>}
            {settlement < 0 && <>Refund owed by requester: {formatPesos(-settlement)}</>}
            {settlement === 0 && <>Fully liquidated, no balance.</>}
          </p>
        )}

        <div className="dialog-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={complete.isPending}>
            {complete.isPending ? 'Saving...' : 'Confirm Completion'}
          </button>
        </div>
        {complete.isError && <p role="alert">Failed to complete request.</p>}
      </form>
    </div>
  )
}