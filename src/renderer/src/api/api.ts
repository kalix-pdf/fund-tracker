import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateRequestInput, ListQuery } from '../../../shared/schema'

export const requestKeys = {
  all: ['requests'] as const,
  list: (filters: ListQuery) => ['requests', 'list', filters] as const
}

export function useRequests(filters: ListQuery) {
  return useQuery({
    queryKey: requestKeys.list(filters),
    queryFn: async () => {
      const rows = await window.api.requests.list(filters)
      // console.log('[useRequests] filters:', JSON.stringify(filters))
      // console.log('[useRequests] rows:', JSON.stringify(rows, null, 2))
      return rows
    }
  })
}

export function useCreateRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateRequestInput) => window.api.requests.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestKeys.all })
  })
}

export function useAdvanceRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, to }: { id: number; to: 'APPROVED' | 'RELEASED' }) =>
      window.api.requests.advance(id, to),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestKeys.all })
  })
}

export function useCompleteRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, liquidatedCentavos }: { id: number; liquidatedCentavos: number }) =>
      window.api.requests.complete(id, liquidatedCentavos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestKeys.all })
  })
}

export function useMarkReimbursed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.requests.markReimbursed(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestKeys.all })
  })
}

export function useMarkRefunded() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.requests.markRefunded(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestKeys.all })
  })
}