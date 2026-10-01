import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core'
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
  (t) => [index('idx_requests_status').on(t.status), index('idx_requests_department').on(t.department)]
)