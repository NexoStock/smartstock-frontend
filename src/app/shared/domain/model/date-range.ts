export interface DateRange {
  start: Date | null;
  end: Date | null;
}

// yyyy-MM-dd in the local time zone (what the API expects in ?desde= and ?hasta=)
export function toIsoDate(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

// First and last day of the current month: the default period of sales, purchases and reports
export function currentMonth(): DateRange {
  const now = new Date();
  return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
}

export function toQuery(range: DateRange): { desde?: string; hasta?: string } {
  return {
    ...(range.start ? { desde: toIsoDate(range.start) } : {}),
    ...(range.end ? { hasta: toIsoDate(range.end) } : {}),
  };
}
