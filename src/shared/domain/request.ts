import type { Department, Status } from './status'

export interface RequestRow {
  id: number
  requesterName: string
  department: Department
  purpose: string
  amountCentavos: number
  status: Status
  liquidatedCentavos: number | null
  settlementCentavos: number | null
  reimbursementStatus: 'PENDING' | 'PAID' | null
  createdAt: Date
  approvedAt: Date | null
  releasedAt: Date | null
  completedAt: Date | null
}