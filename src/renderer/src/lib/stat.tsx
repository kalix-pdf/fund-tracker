import { formatCentavos } from "./money";

export function Stat({ label, value, emphasis }: { label: string; value: number; emphasis?: boolean }) {
  const negative = emphasis && value < 0
  return (
    <div className={`stat${emphasis ? ' stat--emphasis' : ''}${negative ? ' stat--negative' : ''}`}>
      <span className="stat__label">{label}</span>
      <span className="stat__value">{formatCentavos(value)}</span>
    </div>
  )
}