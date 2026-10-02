import { useState, type FormEvent } from 'react'
import type { RequestRow } from '../../../shared/domain/request'
import { formatPesos } from '../../../shared/domain/money'
import { useCompleteRequest } from '../api/api'
import { Modal } from './Modal'

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
    <Modal
      title={`Complete request — ${request.requesterName}`}
      onClose={onClose}
      dismissible={!complete.isPending}
    >
      <form onSubmit={handleSubmit} className="modal__form">
        <p>Amount released: {formatPesos(request.amountCentavos)}</p>

        <label className="field">
          Total on receipts (PHP)
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={receiptsPesos}
            onChange={(e) => setReceiptsPesos(e.target.value)}
            required
          />
        </label>

        {receiptsPesos !== '' && (
          <p aria-live="polite">
            {settlement > 0 && <>Up for reimbursement: {formatPesos(settlement)}</>}
            {settlement < 0 && <>Refund owed by requester: {formatPesos(-settlement)}</>}
            {settlement === 0 && <>Fully liquidated, no balance.</>}
          </p>
        )}

        <div className="modal__actions">
          <button type="button" className="btn btn--secondary" onClick={onClose} disabled={complete.isPending}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={complete.isPending}>
            {complete.isPending ? 'Saving…' : 'Confirm Completion'}
          </button>
        </div>

        {complete.isError && <p role="alert">Failed to complete request.</p>}
      </form>
    </Modal>
  )
}