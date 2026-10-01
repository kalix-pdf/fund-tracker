const TONES: Record<string, 'neutral' | 'warning' | 'info' | 'accent' | 'success'> = {
  PENDING: 'warning',
  PENDING_APPROVAL: 'warning',
  APPROVED: 'info',
  RELEASED: 'accent',
  FOR_LIQUIDATION: 'accent',
  COMPLETED: 'success'
}

function toLabel(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function StatusBadge({ status }: { status: string }): React.JSX.Element {
  const tone = TONES[status] ?? 'neutral'
  return <span className={`badge badge--${tone}`}>{toLabel(status)}</span>
}