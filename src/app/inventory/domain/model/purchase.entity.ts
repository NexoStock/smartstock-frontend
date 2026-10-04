import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { StockMovement } from './stock-movement.entity';

export type PurchaseStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

export class PurchaseItem {
  constructor(
    public productId: number,
    public productName: string,
    public quantity: number,
    public unitCost: number,
  ) {}

  get subtotal(): number {
    return Math.round(this.quantity * this.unitCost * 100) / 100;
  }
}

export class Purchase extends BaseEntity {
  constructor(
    id: string,
    public date: string,
    public status: PurchaseStatus,
    public total: number,
    public supplierId: number,
    public supplierName: string,
    public items: PurchaseItem[],
    public movements: StockMovement[],
    public restockingNeedId: number | null,
  ) {
    super(id);
  }

  get isPending(): boolean {
    return this.status === 'PENDING';
  }
}

export class Supplier extends BaseEntity {
  constructor(
    id: number | null,
    public name: string,
    public email: string,
    public phone: string,
  ) {
    super(id);
  }
}

export class PurchaseProductOption {
  constructor(
    public id: number,
    public name: string,
    public purchaseCost: number,
    public usualSupplier: string,
  ) {}
}
