// shared/domain/funds.ts
export interface MonthlyFundsSummary {
  month: string
  carriedOverCentavos: number
  addedCentavos: number
  expensesCentavos: number
  remainingCentavos: number
}

export const isMonthKey = (s: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(s)

// Manila has no DST, so a fixed +08:00 offset is safe
export function monthRange(month: string) {
  const [y, m] = month.split('-').map(Number)
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
  return {
    start: new Date(`${month}-01T00:00:00+08:00`),
    end: new Date(`${next}-01T00:00:00+08:00`),
  }
}

export interface FundAddition {
  id: number
  forMonth: string
  amountCentavos: number
  note?: string
  createdAt: string
}