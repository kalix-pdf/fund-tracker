import { canAdvance, type Status } from '../../shared/domain/status'
import type { RequestRepository } from '../repositories/request.repository'
import { computeSettlement } from '../../shared/domain/settlement'
import type { DashboardSummary } from '../../shared/domain/dashboard'

export class RequestService {
  constructor(private repo: RequestRepository) {}

  private require(id: number) {
    const r = this.repo.getById(id)
    if (!r) throw new Error(`Request ${id} not found`)
    return r
  }

  advance(id: number, to: 'APPROVED' | 'RELEASED') {
    const r = this.require(id)
    if (!canAdvance(r.status as Status, to)) throw new Error(`Cannot move ${r.status} -> ${to}`)
    const now = new Date()
    return this.repo.update(id, {
      status: to,
      ...(to === 'APPROVED' ? { approvedAt: now } : { releasedAt: now })
    })
  }

  complete(id: number, liquidatedCentavos: number) {
    const r = this.require(id)
    if (!canAdvance(r.status as Status, 'COMPLETED')) throw new Error(`Cannot complete from ${r.status}`)

    return this.repo.update(id, {
      status: 'COMPLETED',
      completedAt: new Date(),
      liquidatedCentavos,
      ...computeSettlement(r.amountCentavos, liquidatedCentavos),
    })
  }

  markReimbursed(id: number) {
    const r = this.require(id)
    if (r.reimbursementStatus !== 'PENDING') {
      throw new Error(`Request ${id} has no pending reimbursement`)
    }
    return this.repo.update(id, { reimbursementStatus: 'PAID', reimbursedAt: new Date() })
  }

  markRefunded(id: number) {
    const r = this.require(id)
    if (r.refundStatus !== 'PENDING') {
      throw new Error(`Request ${id} has no pending refund`)
    }
    return this.repo.update(id, { refundStatus: 'REFUNDED', refundedAt: new Date() })
  }
  getDashboardSummary(): DashboardSummary {
    const rows = this.repo.summarizeByStatus()
    const totals = (status: Status) => {
      const row = rows.find((r) => r.status === status)
      return {
        count: row?.count ?? 0,
        amountCentavos: row?.amountCentavos ?? 0,
        liquidatedCentavos: row?.liquidatedCentavos ?? 0,
      }
    }

    const pending = totals('PENDING_APPROVAL')
    const approved = totals('APPROVED')
    const released = totals('RELEASED')
    const completed = totals('COMPLETED')
    const s = this.repo.summarizeSettlements()

    return {
      pendingApproval: { count: pending.count, amountCentavos: pending.amountCentavos },
      approved: { count: approved.count, amountCentavos: approved.amountCentavos },
      forLiquidation: { count: released.count, amountCentavos: released.amountCentavos },
      completed: {
        count: completed.count,
        amountCentavos: completed.amountCentavos,
        liquidatedCentavos: completed.liquidatedCentavos,
      },
      totalReleasedCentavos: released.amountCentavos + completed.amountCentavos,
      reimbursementOwed: { count: s.reimbursementCount, amountCentavos: s.reimbursementCentavos },
      refundDue: { count: s.refundCount, amountCentavos: s.refundCentavos },
    }
  }
}