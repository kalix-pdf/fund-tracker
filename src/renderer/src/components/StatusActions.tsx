import type { RequestRow } from '../../../shared/domain/request'
import { useAdvanceRequest, useMarkReimbursed } from '../api/api'

interface Props {
  request: RequestRow
  onComplete: (request: RequestRow) => void
}

export function StatusActions({ request, onComplete }: Props): React.JSX.Element | null {
  const advance = useAdvanceRequest()
  const markReimbursed = useMarkReimbursed()

  if (request.status === 'PENDING_APPROVAL') {
    return (
      <button disabled={advance.isPending} onClick={() => advance.mutate({ id: request.id, to: 'APPROVED' })}>
        Approve
      </button>
    )
  }

  if (request.status === 'APPROVED') {
    return (
      <button disabled={advance.isPending} onClick={() => advance.mutate({ id: request.id, to: 'RELEASED' })}>
        Release
      </button>
    )
  }

  if (request.status === 'RELEASED') {
    return <button onClick={() => onComplete(request)}>Complete</button>
  }

  if (request.reimbursementStatus === 'PENDING') {
    return (
      <button disabled={markReimbursed.isPending} onClick={() => markReimbursed.mutate(request.id)}>
        {markReimbursed.isPending ? 'Saving...' : 'Mark as reimbursed'}
      </button>
    )
  }

  return null // COMPLETED: nothing to do here
}