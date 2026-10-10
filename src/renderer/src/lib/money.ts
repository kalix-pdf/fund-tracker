const php = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
export const formatCentavos = (c: number) => php.format(c / 100)

// String parsing avoids float errors (e.g. 1.1 * 100)
export function pesosToCentavos(input: string): number | null {
  const s = input.trim().replace(/,/g, '')
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null
  const [whole, frac = ''] = s.split('.')
  return Number(whole) * 100 + Number(frac.padEnd(2, '0'))
}
