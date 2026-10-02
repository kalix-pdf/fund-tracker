import type { RequestRow } from '../../../shared/domain/request'
import { useAdvanceRequest, useMarkReimbursed, useMarkRefunded } from '../api/api'

interface Props {
  request: RequestRow
  onComplete: (request: RequestRow) => void
}

export function StatusActions({ request, onComplete }: Props): React.JSX.Element | null {
  const advance = useAdvanceRequest()
  const markReimbursed = useMarkReimbursed()
  const markRefunded = useMarkRefunded()

  if (request.status === 'PENDING_APPROVAL') {
    return (
      <button className='btn-action tag--neutral' disabled={advance.isPending} onClick={() => advance.mutate({ id: request.id, to: 'APPROVED' })}>
        Approve
      </button>
    )
  }

  if (request.status === 'APPROVED') {
    return (
      <button className='btn-action tag--neutral' disabled={advance.isPending} onClick={() => advance.mutate({ id: request.id, to: 'RELEASED' })}>
        Release
      </button>
    )
  }

  if (request.status === 'RELEASED') {
    return <button className='btn-action tag--warning' onClick={() => onComplete(request)}>Complete</button>
  }

  if (request.reimbursementStatus === 'PENDING') {
    return (
      <button className='btn-action tag--success' disabled={markReimbursed.isPending} onClick={() => markReimbursed.mutate(request.id)}>
        {markReimbursed.isPending ? 'Saving...' : 'Mark as reimbursed'}
      </button>
    )
  }

  if (request.refundStatus === 'PENDING') {
    return (
      <button className='btn-action tag--success' disabled={markRefunded.isPending} onClick={() => markRefunded.mutate(request.id)}>
        {markRefunded.isPending ? 'Saving...' : 'Mark as refunded'}
      </button>
    )
  }

  return null // COMPLETED: nothing to do here
}