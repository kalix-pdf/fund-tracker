const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
export const currentMonthKey = () => key(new Date())
export const nextMonthKey = () => {
  const d = new Date()
  return key(new Date(d.getFullYear(), d.getMonth() + 1, 1))
}

const pad = (n: number): string => String(n).padStart(2, '0')

export function monthDayBounds(month: string): { min: string; max: string } {
  const [year, mon] = month.split('-').map(Number)
  const lastDay = new Date(year, mon, 0).getDate()
  return { min: `${month}-01`, max: `${month}-${pad(lastDay)}` }
}

export function toLocalDateKey(value: Date | string | number): string {
  const d = new Date(value)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}