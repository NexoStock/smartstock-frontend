export type ComparisonResult = 'MATCH' | 'DISCREPANCY' | 'REGISTERED_ONLY';

// One product compared: registered stock vs the weight of its online sensor (R18). The sensor never changes the stock.
export class ComparisonRow {
  constructor(
    public productId: number,
    public productName: string,
    public registeredStock: number,
    public weightKg: number | null,
    public physicalUnits: number | null,
    public differencePct: number | null,
    public result: ComparisonResult,
  ) {}

  // Tag shown in the table: match | discrepancy | registeredOnly
  get statusKey(): string {
    return this.result === 'MATCH'
      ? 'match'
      : this.result === 'DISCREPANCY'
        ? 'discrepancy'
        : 'registeredOnly';
  }
}

export class Comparison {
  constructor(
    public rows: ComparisonRow[],
    public discrepancies: number,
    public alertId: number | null,
  ) {}
}
