import { z } from 'zod'
import { DEPARTMENTS, STATUSES } from './domain/status'

export const createRequestSchema = z.object({
  requesterName: z.string().trim().min(1),
  department: z.enum(DEPARTMENTS),
  purpose: z.string().trim().min(1),
  amountCentavos: z.number().int().positive()
})
export const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(STATUSES).optional(),
  department: z.enum(DEPARTMENTS).optional(),
  reimbursementStatus: z.enum(['PENDING', 'PAID']).optional(),
  refundStatus: z.enum(['PENDING', 'REFUNDED']).optional()
})
export const markReimbursedSchema = z.object({ id: z.number().int().positive() })
export const markRefundedSchema = z.object({ id: z.number().int().positive() })

export const advanceSchema = z.object({
  id: z.number().int(),
  to: z.enum(['APPROVED', 'RELEASED'])
})
export const completeSchema = z.object({
  id: z.number().int(),
  liquidatedCentavos: z.number().int().min(0)
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>
export type ListQuery = z.infer<typeof listQuerySchema>


//add funds schema:
export const monthKeySchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expected YYYY-MM')

export const fundsMonthSchema = z.object({ month: monthKeySchema })

export const addFundsSchema = z.object({
  forMonth: monthKeySchema,
  amountCentavos: z.number().int().positive(),
  note: z.string().trim().max(200).optional(),
})

export const voidFundsSchema = z.object({ id: z.number().int().positive() })