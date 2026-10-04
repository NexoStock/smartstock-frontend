import { BaseEntity } from '../../../shared/domain/model/base-entity';

export type SensorStatus = 'online' | 'disconnected' | 'available';

// IoT weight sensor. Online = it sent a reading in the last 5 minutes (R11); available = not linked to a product (R9).
export class Sensor extends BaseEntity {
  constructor(
    id: number,
    public code: string,
    public productId: number | null,
    public productName: string | null,
    public status: SensorStatus,
    public lastReadingAt: string | null,
    public weightKg: number,
    public units: number | null,
  ) {
    super(id);
  }

  get isAvailable(): boolean {
    return this.productId === null;
  }

  get minutesSinceReading(): number | null {
    return this.lastReadingAt ? Math.max(0, Math.round((Date.now() - Date.parse(this.lastReadingAt)) / 60000)) : null;
  }
}

// Product data needed to link a sensor (a snapshot: Devices does not depend on the catalog entity)
export class LinkableProduct {
  constructor(
    public id: number,
    public name: string,
    public unitWeight: number,
    public hasSensor: boolean,
  ) {}
}
