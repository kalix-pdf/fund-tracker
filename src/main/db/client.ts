import Database from 'better-sqlite3'
import type { Database as BetterSqliteDatabase } from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { app } from 'electron'
import { join } from 'path'
import * as schema from './schema'

type OpenDbResult = {
  db: ReturnType<typeof drizzle>
  sqlite: BetterSqliteDatabase
}

export function openDb(): OpenDbResult {
  const sqlite = new Database(join(app.getPath('userData'), 'fund-tracker.db'))
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite, { schema })
  const migrationsFolder = app.isPackaged
    ? join(process.resourcesPath, 'drizzle')
    : join(app.getAppPath(), 'drizzle')
  migrate(db, { migrationsFolder })
  return { db, sqlite }
}
export type Db = ReturnType<typeof openDb>['db']