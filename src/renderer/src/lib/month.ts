const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
export const currentMonthKey = () => key(new Date())
export const nextMonthKey = () => {
  const d = new Date()
  return key(new Date(d.getFullYear(), d.getMonth() + 1, 1))
}