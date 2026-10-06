import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { StockMovement } from './stock-movement.entity';

export class SaleItem {
  constructor(
    public productId: number,
    public productName: string,
    public quantity: number,
    public unitPrice: number,
  ) {}

  get subtotal(): number {
    return Math.round(this.quantity * this.unitPrice * 100) / 100;
  }
}

// A completed sale. It never exceeds the registered stock (R13) and creates one OUT movement per item.
export class Sale extends BaseEntity {
  constructor(
    id: string,
    public date: string,
    public status: string,
    public total: number,
    public items: SaleItem[],
    public movements: StockMovement[],
  ) {
    super(id);
  }
}

// What the "New sale" form needs from the catalog (a snapshot, the sale does not depend on the Product entity)
export class SaleProductOption {
  constructor(
    public id: number,
    public name: string,
    public salePrice: number | null,
    public stock: number,
  ) {}
}