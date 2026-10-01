import { and, desc, eq, like, or, type SQL } from 'drizzle-orm'
import type { Db } from '../db/client'
import { requests } from '../db/schema'
import type { CreateRequestInput, ListQuery } from '../../shared/schema'

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
}