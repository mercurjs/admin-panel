export const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    signDisplay: 'auto'
  }).format(amount);
