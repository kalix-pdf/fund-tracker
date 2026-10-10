import { sqliteTable, integer, text, index, check } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { DEPARTMENTS, STATUSES, REIMBURSEMENT_STATUSES, REFUND_STATUSES } from '../../shared/domain/status'

export const requests = sqliteTable(
  'requests',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    requesterName: text('requester_name').notNull(),
    department: text('department', { enum: DEPARTMENTS }).notNull(),
    purpose: text('purpose').notNull(),
    amountCentavos: integer('amount_centavos').notNull(),
    status: text('status', { enum: STATUSES }).notNull().default('PENDING_APPROVAL'),
    liquidatedCentavos: integer('liquidated_centavos'),
    settlementCentavos: integer('settlement_centavos'), // + reimburse, - refund owed
    reimbursementStatus: text('reimbursement_status', { enum: REIMBURSEMENT_STATUSES }),
    refundStatus: text('refund_status', { enum: REFUND_STATUSES }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    approvedAt: integer('approved_at', { mode: 'timestamp' }),
    releasedAt: integer('released_at', { mode: 'timestamp' }),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    reimbursedAt: integer('reimbursed_at', { mode: 'timestamp' }),
    refundedAt: integer('refunded_at', { mode: 'timestamp' }),
  },
  (t) => [index('idx_requests_status').on(t.status), index('idx_requests_department').on(t.department),
    index('idx_requests_released_at').on(t.releasedAt), index('idx_requests_reimbursed_at').on(t.reimbursedAt),
    index('idx_requests_refunded_at').on(t.refundedAt)
  ]
)


export const fundAdditions = sqliteTable(
  'fund_additions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    forMonth: text('for_month').notNull(), // 'YYYY-MM' budget month the money is for
    amountCentavos: integer('amount_centavos').notNull(),
    note: text('note'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    voidedAt: integer('voided_at', { mode: 'timestamp' }), // soft-delete, keeps audit trail
  },
  (t) => [
    index('idx_fund_additions_month').on(t.forMonth),
    check('chk_fund_amount_positive', sql`${t.amountCentavos} > 0`),
  ]
)