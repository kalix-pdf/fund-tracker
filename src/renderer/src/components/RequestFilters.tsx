import { useEffect, useMemo, useState } from 'react'
import { DEPARTMENTS, STATUSES, type Department, type Status } from '../../../shared/domain/status'
import type { ListQuery } from '../../../shared/schema'
import { useDebouncedValue } from '../hooks/useDebounceValue'

const STATUS_LABELS: Record<Status, string> = {
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  RELEASED: 'Released - For Liquidation',
  COMPLETED: 'Completed',
}

const pesosToCentavos = (raw: string): number | undefined => {
  if (raw.trim() === '') return undefined
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined
}

interface RequestFiltersProps {
  onChange: (query: ListQuery) => void
}

export function RequestFilters({ onChange }: RequestFiltersProps): React.JSX.Element {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<Status | ''>('')
  const [department, setDepartment] = useState<Department | ''>('')
  const [minPesos, setMinPesos] = useState('')
  const [maxPesos, setMaxPesos] = useState('')

  const min = pesosToCentavos(minPesos)
  const max = pesosToCentavos(maxPesos)
  const rangeInvalid = min !== undefined && max !== undefined && min > max

  const query = useMemo<ListQuery>(
    () => ({
      search: search.trim() || undefined,
      status: status || undefined,
      department: department || undefined,
      // An inverted range is never sent; the inputs show an error instead.
      minAmountCentavos: rangeInvalid ? undefined : min,
      maxAmountCentavos: rangeInvalid ? undefined : max,
    }),
    [search, status, department, min, max, rangeInvalid],
  )

  const debouncedQuery = useDebouncedValue(query)
  useEffect(() => onChange(debouncedQuery), [debouncedQuery, onChange])

  const isDirty = search !== '' || status !== '' || department !== '' || minPesos !== '' || maxPesos !== ''

  const reset = () => {
    setSearch('')
    setStatus('')
    setDepartment('')
    setMinPesos('')
    setMaxPesos('')
  }

  return (
    <div className="filters" role="search">
      <input
        className="requester_input"
        type="search"
        aria-label="Search requests"
        placeholder="Search name or purpose"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        className="select-requester"
        aria-label="Filter by status"
        value={status}
        onChange={(e) => setStatus(e.target.value as Status | '')}
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      <select
        className="select-requester"
        aria-label="Filter by department"
        value={department}
        onChange={(e) => setDepartment(e.target.value as Department | '')}
      >
        <option value="">All departments</option>
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* <div className="filters__range">
        <input
          className="input"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          aria-label="Minimum amount in pesos"
          aria-invalid={rangeInvalid}
          placeholder="Min ₱"
          value={minPesos}
          onChange={(e) => setMinPesos(e.target.value)}
        />
        <span aria-hidden="true">–</span>
        <input
          className="input"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          aria-label="Maximum amount in pesos"
          aria-invalid={rangeInvalid}
          placeholder="Max ₱"
          value={maxPesos}
          onChange={(e) => setMaxPesos(e.target.value)}
        />
      </div> */}

      {rangeInvalid && (
        <span className="filters__error" role="alert">Min cannot exceed max</span>
      )}

      {isDirty && (
        <button type="button" className="btn-action" onClick={reset}>
          Clear
        </button>
      )}
    </div>
  )
}