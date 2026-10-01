import { ipcMain } from 'electron'
import type { RequestService } from '../services/request.service'
import type { RequestRepository } from '../repositories/request.repository'
import { advanceSchema, completeSchema, createRequestSchema, listQuerySchema, markRefundedSchema, markReimbursedSchema } from '../../shared/schema'

export function registerRequestHandlers(repo: RequestRepository, svc: RequestService) {
  ipcMain.handle('requests:list', (_e, q) => repo.list(listQuerySchema.parse(q ?? {})))
  ipcMain.handle('requests:create', (_e, input) => repo.create(createRequestSchema.parse(input)))
  ipcMain.handle('requests:advance', (_e, p) => {
    const { id, to } = advanceSchema.parse(p)
    return svc.advance(id, to)
  })
  ipcMain.handle('requests:complete', (_e, p) => {
    const { id, liquidatedCentavos } = completeSchema.parse(p)
    return svc.complete(id, liquidatedCentavos)
  })
  ipcMain.handle('requests:markReimbursed', (_e, id: unknown) =>
    svc.markReimbursed(markReimbursedSchema.parse({ id }).id)
  )
  ipcMain.handle('requests:markRefunded', (_e, id: unknown) =>
    svc.markRefunded(markRefundedSchema.parse({ id }).id)
  )
}