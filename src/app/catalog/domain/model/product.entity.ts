import { BaseEntity } from '../../../shared/domain/model/base-entity';

export type StockLevel = 'lowStock' | 'healthy';
export type SensorLink = 'online' | 'disconnected' | 'none';

export class Product extends BaseEntity {
  constructor(
    id: number | string | null,
    public name: string,
    public sku: string,
    public category: string,
    public unitWeight: number,
    public salePrice: number | null,
    public purchaseCost: number,
    public usualSupplier: string,
    public registeredStock: number,
    public minThreshold: number,
    public maxCapacity: number,
    public sensorId: number | null,
    public sensorStatus: SensorLink = 'none',
    public sensorUnits: number | null = null,
  ) {
    super(id);
  }

  get referenceStock(): number {
    return this.sensorStatus === 'online' && this.sensorUnits !== null
      ? this.sensorUnits
      : this.registeredStock;
  }

  get stockLevel(): StockLevel {
    return this.referenceStock <= this.minThreshold ? 'lowStock' : 'healthy';
  }

  get isSellable(): boolean {
    return !!this.salePrice && this.salePrice > 0;
  }
}
