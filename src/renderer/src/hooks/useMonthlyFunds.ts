import { useCallback, useEffect, useRef, useState } from 'react'
import type { CashMovement, FundAddition, MonthlyFundsSummary } from '../../../shared/domain/fund'

export function useMonthlyFunds(month: string) {
  const [summary, setSummary] = useState<MonthlyFundsSummary | null>(null)
  const [additions, setAdditions] = useState<FundAddition[]>([])
  const [movements, setMovements] = useState<CashMovement[]>([])
  const [error, setError] = useState<string | null>(null)

  const latestRequest = useRef(0)

  const refresh = useCallback(async () => {
    const requestId = ++latestRequest.current
    try {
      const [s, a, m] = await Promise.all([
        window.api.funds.summary(month),
        window.api.funds.list(month),
        window.api.funds.movements(month),
      ])
      if (requestId !== latestRequest.current) return
      setSummary(s)
      setAdditions(a)
      setMovements(m)
      setError(null)
    } catch (e) {
      if (requestId !== latestRequest.current) return
      setError(e instanceof Error ? e.message : 'Failed to load funds')
    }
  }, [month])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { summary, additions, movements, error, refresh }
}