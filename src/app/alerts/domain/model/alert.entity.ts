import { BaseEntity } from '../../../shared/domain/model/base-entity';

export type AlertType = 'LOW_STOCK' | 'DISCREPANCY';
export type AlertStatus = 'ACTIVE' | 'RESOLVED';

export class Alert extends BaseEntity {
  constructor(
    id: number,
    public type: AlertType,
    public productId: number,
    public productName: string,
    public referenceStock: number,
    public source: 'sensor' | 'registered',
    public status: AlertStatus,
    public minutesSinceReading: number | null,
    public restockingNeedId: number | null,
    public registeredStock: number | null,
    public physicalStock: number | null,
    public differencePct: number | null,
    public currentStock: number | null,
    public minThreshold: number | null,
    public resolvedAt: string | null,
  ) {
    super(id);
  }

  get isLowStock(): boolean {
    return this.type === 'LOW_STOCK';
  }

  get isActive(): boolean {
    return this.status === 'ACTIVE';
  }
}

export class NotificationChannel extends BaseEntity {
  constructor(
    id: number,
    public channel: 'email' | 'whatsapp',
    public destination: string,
    public active: boolean,
  ) {
    super(id);
  }
}