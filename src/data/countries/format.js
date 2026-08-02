/** Currency display helpers matching local Bolt driver-app conventions. */

export function createMoneyFormatter({ code, symbol, symbolAfter, decimal, group }) {
  const formatNumber = (amount, { decimals = 2 } = {}) => {
    const fixed = Number(amount).toFixed(decimals)
    const [intPart, frac] = fixed.split('.')
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, group)
    if (decimals === 0) return grouped
    return `${grouped}${decimal}${frac}`
  }

  const money = (amount, { decimals = 2 } = {}) => {
    const n = formatNumber(amount, { decimals })
    return symbolAfter ? `${n} ${symbol}` : `${symbol}${n}`
  }

  return {
    code,
    symbol,
    /** Island / header style: 148.00£ or £148.00 / 485,00 lei / R1,280.00 */
    amount: (value, opts) => money(value, opts),
    /** Prefix with space used on trip rows: £ 8.60 / 28,00 lei / R 78.00 */
    spaced: (value, opts) => {
      const n = formatNumber(value, opts)
      return symbolAfter ? `${n} ${symbol}` : `${symbol} ${n}`
    },
    /** Surge chip: +£2.50 / +12 lei / +R25 */
    surge: (value, { decimals } = {}) => {
      const d = decimals ?? (Number.isInteger(value) ? 0 : 2)
      const n = formatNumber(value, { decimals: d })
      return symbolAfter ? `+${n} ${symbol}` : `+${symbol}${n}`
    },
    /** Compact offer title: +£2.50 / +12 lei / +R25 */
    offer: (value, opts) => {
      const surge = createMoneyFormatter({ code, symbol, symbolAfter, decimal, group }).surge(
        value,
        opts,
      )
      return `Earn ${surge} per offer`
    },
  }
}
