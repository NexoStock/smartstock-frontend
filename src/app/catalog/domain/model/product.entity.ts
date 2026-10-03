import { BaseEntity } from '../../../shared/domain/model/base-entity';

export type StockLevel = 'lowStock' | 'healthy';

export class Product extends BaseEntity {
  constructor(
    id: number | string | null,
    public name: string,
    public sku: string,
    public category: string,
    public unitWeight: number,
    public salePrice: number,
    public purchaseCost: number,
    public usualSupplier: string,
    public registeredStock: number,
    public minThreshold: number,
    public maxCapacity: number,
    public sensorId: number | null,
  ) {
    super(id);
  }

  get stockLevel(): StockLevel {
    return this.registeredStock <= this.minThreshold ? 'lowStock' : 'healthy';
  }
}
