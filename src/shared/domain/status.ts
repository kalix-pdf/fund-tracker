export const STATUSES = ['PENDING_APPROVAL', 'APPROVED', 'RELEASED', 'COMPLETED'] as const
export type Status = (typeof STATUSES)[number]

const NEXT: Record<Status, Status | null> = {
  PENDING_APPROVAL: 'APPROVED',
  APPROVED: 'RELEASED',
  RELEASED: 'COMPLETED',
  COMPLETED: null
}
export const canAdvance = (from: Status, to: Status) => NEXT[from] === to

export const REIMBURSEMENT_STATUSES = ['PENDING', 'PAID'] as const
export type ReimbursementStatus = (typeof REIMBURSEMENT_STATUSES)[number]

export const REFUND_STATUSES = ['PENDING', 'REFUNDED'] as const
export type RefundStatus = (typeof REFUND_STATUSES)[number]

export const DEPARTMENTS = ['Legal', 'Sports', 'Realty', 'Workers', 'Engineering'] as const
export type Department = (typeof DEPARTMENTS)[number]