export function formatCurrency(amount) {
  return '$' + Number(amount || 0).toFixed(2)
}

export function sleep(ms = 200) {
  return new Promise((r) => setTimeout(r, ms))
}
