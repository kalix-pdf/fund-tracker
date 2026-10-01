import type { ReimbursementStatus, RefundStatus } from './status'

export interface Settlement {
    settlementCentavos: number
    reimbursementStatus: ReimbursementStatus | null
    refundStatus: RefundStatus | null
}

export function computeSettlement(releasedCentavos: number, liquidatedCentavos: number): Settlement {
    if (liquidatedCentavos > releasedCentavos) {
        return {
            settlementCentavos: liquidatedCentavos - releasedCentavos,
            reimbursementStatus: 'PENDING',
            refundStatus: null
        }
    } else if (liquidatedCentavos < releasedCentavos) {
        return {
            settlementCentavos: releasedCentavos - liquidatedCentavos,
            reimbursementStatus: null,
            refundStatus: 'PENDING'
        }
    } else {
        return {
            settlementCentavos: 0,
            reimbursementStatus: null,
            refundStatus: null
        }
    }
}