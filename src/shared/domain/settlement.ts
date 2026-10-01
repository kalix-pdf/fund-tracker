import type { ReimbursementStatus } from './status'

export interface Settlement {
  settlementCentavos: number
  reimbursementStatus: ReimbursementStatus | null
}

export function computeSettlement(releasedCentavos: number, liquidatedCentavos: number): Settlement {
  const settlementCentavos = liquidatedCentavos - releasedCentavos
  return {
    settlementCentavos,
    reimbursementStatus: settlementCentavos > 0 ? 'PENDING' : null
  }
}