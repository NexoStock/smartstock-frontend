import { BaseEntity } from '../../../shared/domain/model/base-entity';

export type MovementType = 'IN' | 'OUT';
export type MovementSource = 'SALE' | 'PURCHASE' | 'ADJUSTMENT';

// A stock change. The registered stock only moves through StockMovements (rule R17).
export class StockMovement extends BaseEntity {
  constructor(
    id: number | string | null,
    public productId: number,
    public productName: string,
    public type: MovementType,
    public source: MovementSource,
    public sourceId: string,
    public quantity: number,
    public date: string,
  ) {
    super(id);
  }

  // +10 for IN, -3 for OUT
  get signedQuantity(): number {
    return this.type === 'IN' ? this.quantity : -this.quantity;
  }
}
