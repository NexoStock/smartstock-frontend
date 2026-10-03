// Amounts in the app are always PEN, in every language: S/ 1,234.50
export function formatPen(amount: number | null | undefined): string {
  const value = Number(amount ?? 0);
  return `S/ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
