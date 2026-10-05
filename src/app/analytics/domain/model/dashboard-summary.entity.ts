export interface DayTotal {
  total: number;
  count: number;
}

export class ActivityItem {
  constructor(
    public type: 'SALE' | 'PURCHASE',
    public id: string,
    public total: number,
  ) {}

  get link(): string[] {
    return [this.type === 'SALE' ? '/sales' : '/purchases', this.id];
  }
}

export class StockOverviewItem {
  constructor(
    public productId: number,
    public name: string,
    public units: number,
    public level: 'lowStock' | 'healthy',
    public sensor: string,
  ) {}
}

// Day summary of the business (M17). Analytics only reads what the other contexts already know.
export class DashboardSummary {
  constructor(
    public salesToday: DayTotal,
    public purchasesToday: DayTotal,
    public lowStockAlerts: number,
    public recentActivity: ActivityItem[],
    public stockOverview: StockOverviewItem[],
  ) {}
}
