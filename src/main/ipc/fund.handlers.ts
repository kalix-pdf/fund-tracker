import { ipcMain } from 'electron'
import type { FundService } from '../services/fund.service'
import { addFundsSchema, fundsMonthSchema, voidFundsSchema } from '../../shared/schema'

export function registerFundHandlers(svc: FundService) {
  ipcMain.handle('funds:summary', (_e, p) => svc.getMonthlySummary(fundsMonthSchema.parse(p).month))
  ipcMain.handle('funds:list', (_e, p) => svc.listAdditions(fundsMonthSchema.parse(p).month))
  ipcMain.handle('funds:add', (_e, p) => {
    const { forMonth, amountCentavos, note } = addFundsSchema.parse(p)
    return svc.addFunds(forMonth, amountCentavos, note)
  })
  ipcMain.handle('funds:void', (_e, p) => svc.voidAddition(voidFundsSchema.parse(p).id))
  ipcMain.handle('funds:movements', (_e, p) => svc.listCashMovements(fundsMonthSchema.parse(p).month))
}