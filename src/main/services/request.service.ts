import { canAdvance, type Status } from '../../shared/domain/status'
import type { RequestRepository } from '../repositories/request.repository'
import { computeSettlement } from '../../shared/domain/settlement'

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
      ...computeSettlement(r.amountCentavos, liquidatedCentavos)
    })
  }

  markReimbursed(id: number) {
    const r = this.require(id)
    if (r.reimbursementStatus !== 'PENDING') {
      throw new Error(`Request ${id} has no pending reimbursement`)
    }
    return this.repo.update(id, { reimbursementStatus: 'PAID', reimbursedAt: new Date() })
  }
}