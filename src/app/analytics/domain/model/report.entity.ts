import { StockMovement } from '../../../inventory/domain/model/stock-movement.entity';

// Totals and stock movements of a period (M18). A Pending purchase does not create an IN movement.
export class Report {
  constructor(
    public salesTotal: number,
    public purchasesTotal: number,
    public movements: StockMovement[],
    public pendingPurchases: string[],
  ) {}
}
