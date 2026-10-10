import { formatPesos } from '../../../shared/domain/money'
import { useDashboardSummary } from '../api/api'
import { Stat } from '../lib/stat'

interface CardProps {
  label: string
  amountCentavos: number
  count: number
  tone?: 'default' | 'warn' | 'ok'
  hint?: string
}

function StatCard({ label, amountCentavos, count, tone = 'default', hint }: CardProps) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__amount">{formatPesos(amountCentavos)}</strong>
      <span className="stat-card__meta">
        {count} {count === 1 ? 'request' : 'requests'}
        {hint ? ` · ${hint}` : ''}
      </span>
    </article>
  )
}

export function Dashboard() {
  const { data: summary, error } = useDashboardSummary()
  if (error) return <p role="alert">Failed to load summary.</p>
  if (!summary) return <p>Loading…</p>

  return (
    <section className="dashboard" aria-label="Budget overview">
      <StatCard label="Pending approval" tone="warn" {...summary.pendingApproval} />
      <StatCard label="Approved, awaiting release" tone="ok" {...summary.approved} />
      <StatCard label="For liquidation" tone="warn" {...summary.forLiquidation} />
      <StatCard
        label="Completed"
        tone="ok"
        amountCentavos={summary.completed.liquidatedCentavos}
        count={summary.completed.count}
        hint="liquidated"
      />
      <StatCard
        label="Reimbursements owed"
        tone="warn"
        amountCentavos={summary.reimbursementOwed.amountCentavos}
        count={summary.reimbursementOwed.count}
      />
      <StatCard
        label="Refunds to collect"
        tone="warn"
        amountCentavos={summary.refundDue.amountCentavos}
        count={summary.refundDue.count}
      />
    </section>
  )
}