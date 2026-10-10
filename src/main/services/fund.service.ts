import { isMonthKey, monthRange, type MonthlyFundsSummary } from '../../shared/domain/fund'
import { FundRepository } from '../repositories/fund.repository'
import { RequestRepository } from '../repositories/request.repository'

export class FundService {
  constructor(private funds: FundRepository, private requests: RequestRepository) {}

  addFunds(forMonth: string, amountCentavos: number, note?: string) {
    if (!isMonthKey(forMonth)) throw new Error(`Invalid month: ${forMonth}`)
    if (!Number.isInteger(amountCentavos) || amountCentavos <= 0) {
      throw new Error('Amount must be a positive integer (centavos)')
    }
    return this.funds.add(forMonth, amountCentavos, note)
  }

  getMonthlySummary(month: string): MonthlyFundsSummary {
    if (!isMonthKey(month)) throw new Error(`Invalid month: ${month}`)
    const { start, end } = monthRange(month)

    const carriedOver = this.funds.sumBeforeMonth(month) - this.requests.cashOutBetween(new Date(0), start)
    const added = this.funds.sumForMonth(month)
    const expenses = this.requests.cashOutBetween(start, end)

    return {
      month,
      carriedOverCentavos: carriedOver,
      addedCentavos: added,
      expensesCentavos: expenses,
      remainingCentavos: carriedOver + added - expenses,
    }
  }

  listAdditions(month: string) {
    if (!isMonthKey(month)) throw new Error(`Invalid month: ${month}`)
    return this.funds.listForMonth(month);
  }

  voidAddition(id: number) {
    this.funds.void(id)
  }
}