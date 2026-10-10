import { and, desc, eq, like, or, type SQL, count, sql } from 'drizzle-orm'
import type { Db } from '../db/client'
import { requests } from '../db/schema'
import type { CreateRequestInput, ListQuery } from '../../shared/schema'
import type { CashMovement } from '../../shared/domain/fund'

const toUnix = (d: Date) => Math.floor(d.getTime() / 1000)

interface CashMovementRow {
  request_id: number
  type: CashMovement['type']
  occurred_at: number
  requester_name: string
  department: string
  purpose: string
  amount: number
}

export class RequestRepository {
  constructor(private db: Db) {}

  list(q: ListQuery) {
    const conds: SQL[] = []
    if (q.status) conds.push(eq(requests.status, q.status))
    if (q.department) conds.push(eq(requests.department, q.department))
    if (q.reimbursementStatus) conds.push(eq(requests.reimbursementStatus, q.reimbursementStatus))
    if (q.search) {
      const p = `%${q.search}%`
      conds.push(or(like(requests.requesterName, p), like(requests.purpose, p))!)
    }
    return this.db
      .select()
      .from(requests)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(requests.createdAt))
      .all()
  }

  getById(id: number) {
    return this.db.select().from(requests).where(eq(requests.id, id)).get()
  }

  create(input: CreateRequestInput) {
    return this.db.insert(requests).values({ ...input, createdAt: new Date() }).returning().get()
  }

  update(id: number, patch: Partial<typeof requests.$inferInsert>) {
    return this.db.update(requests).set(patch).where(eq(requests.id, id)).returning().get()
  }

  summarizeByStatus() {
    return this.db
      .select({
        status: requests.status,
        count: count(),
        amountCentavos: sql<number>`coalesce(sum(${requests.amountCentavos}), 0)`,
        liquidatedCentavos: sql<number>`coalesce(sum(${requests.liquidatedCentavos}), 0)`,
      })
      .from(requests)
      .groupBy(requests.status)
      .all()
  }

  summarizeSettlements() {
    const pendingReimb = sql`${requests.reimbursementStatus} = 'PENDING'`
    const pendingRefund = sql`${requests.refundStatus} = 'PENDING'`

    return this.db
      .select({
        reimbursementCount: sql<number>`coalesce(sum(case when ${pendingReimb} then 1 else 0 end), 0)`,
        reimbursementCentavos: sql<number>`coalesce(sum(case when ${pendingReimb} then ${requests.settlementCentavos} else 0 end), 0)`,
        refundCount: sql<number>`coalesce(sum(case when ${pendingRefund} then 1 else 0 end), 0)`,
        refundCentavos: sql<number>`coalesce(sum(case when ${pendingRefund} then -${requests.settlementCentavos} else 0 end), 0)`,
      })
      .from(requests)
      .get()!
  }

  // One definition of "what counts as money moving", shared by the totals and the ledger table.
  private movementsSql(from: Date, to: Date) {
    const f = toUnix(from)
    const t = toUnix(to)
    return sql`
      SELECT ${requests.id} AS request_id, 'RELEASE' AS type, ${requests.releasedAt} AS occurred_at,
            ${requests.requesterName} AS requester_name, ${requests.department} AS department,
            ${requests.purpose} AS purpose, ${requests.amountCentavos} AS amount
      FROM ${requests}
      WHERE ${requests.releasedAt} >= ${f} AND ${requests.releasedAt} < ${t}
      UNION ALL
      SELECT ${requests.id}, 'REIMBURSEMENT', ${requests.reimbursedAt},
            ${requests.requesterName}, ${requests.department}, ${requests.purpose}, ${requests.settlementCentavos}
      FROM ${requests}
      WHERE ${requests.reimbursementStatus} = 'PAID'
        AND ${requests.reimbursedAt} >= ${f} AND ${requests.reimbursedAt} < ${t}
      UNION ALL
      SELECT ${requests.id}, 'REFUND', ${requests.refundedAt},
            ${requests.requesterName}, ${requests.department}, ${requests.purpose}, ${requests.settlementCentavos}
      FROM ${requests}
      WHERE ${requests.refundStatus} = 'REFUNDED'
        AND ${requests.refundedAt} >= ${f} AND ${requests.refundedAt} < ${t}
    `
  }

  cashOutBetween(from: Date, to: Date): number {
    const row = this.db.get<{ net: number }>(
      sql`SELECT COALESCE(SUM(amount), 0) AS net FROM (${this.movementsSql(from, to)})`
    )
    return row?.net ?? 0
  }

  cashMovementsBetween(from: Date, to: Date): CashMovement[] {
    const rows = this.db.all<CashMovementRow>(sql`
      SELECT * FROM (${this.movementsSql(from, to)})
      ORDER BY occurred_at DESC, request_id DESC
    `)
    return rows.map((r) => ({
      requestId: r.request_id,
      type: r.type,
      occurredAt: new Date(r.occurred_at * 1000),
      requesterName: r.requester_name,
      department: r.department,
      purpose: r.purpose,
      amountCentavos: r.amount,
    }))
  }
}