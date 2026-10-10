import { useCallback, useEffect, useState } from 'react'
import type { FundAddition, MonthlyFundsSummary } from '../../../shared/domain/fund'

export function useMonthlyFunds(month: string) {
  const [summary, setSummary] = useState<MonthlyFundsSummary | null>(null)
  const [additions, setAdditions] = useState<FundAddition[]>([])
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([window.api.funds.summary(month), window.api.funds.list(month)])
      setSummary(s)
      setAdditions(a)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load funds')
    }
  }, [month])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { summary, additions, error, refresh }
}