// repositories/fund.repository.ts
import { and, desc, eq, isNull, lt, sql } from 'drizzle-orm'
import { fundAdditions } from '../db/schema'
import { Db } from '../db/client'

export class FundRepository {
  constructor(private db: Db) {}

  add(forMonth: string, amountCentavos: number, note?: string) {
    return this.db
      .insert(fundAdditions)
      .values({ forMonth, amountCentavos, note, createdAt: new Date() })
      .returning()
      .get()
  }

  void(id: number) {
    return this.db.update(fundAdditions).set({ voidedAt: new Date() }).where(eq(fundAdditions.id, id)).run()
  }

  sumForMonth(month: string): number {
    const r = this.db
      .select({ total: sql<number>`COALESCE(SUM(${fundAdditions.amountCentavos}), 0)` })
      .from(fundAdditions)
      .where(and(eq(fundAdditions.forMonth, month), isNull(fundAdditions.voidedAt)))
      .get()
    return r?.total ?? 0
  }

  sumBeforeMonth(month: string): number {
    const r = this.db
      .select({ total: sql<number>`COALESCE(SUM(${fundAdditions.amountCentavos}), 0)` })
      .from(fundAdditions)
      .where(and(lt(fundAdditions.forMonth, month), isNull(fundAdditions.voidedAt)))
      .get()
    return r?.total ?? 0
  }

    listForMonth(month: string) {
    return this.db
      .select()
      .from(fundAdditions)
      .where(and(eq(fundAdditions.forMonth, month), isNull(fundAdditions.voidedAt)))
      .orderBy(desc(fundAdditions.createdAt))
      .all()
  }
}