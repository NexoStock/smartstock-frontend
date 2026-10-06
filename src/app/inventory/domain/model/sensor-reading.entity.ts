export class SensorReading {
  constructor(
    public id: number,
    public date: string,
    public weightKg: number,
    public units: number,
  ) {}
}

// Sensor block of the product details (M28)
export class ProductSensorInfo {
  constructor(
    public sensorId: number,
    public code: string,
    public status: 'online' | 'disconnected',
    public weightKg: number,
    public units: number,
    public lastReadingAt: string | null,
  ) {}

  get minutesSinceReading(): number | null {
    return this.lastReadingAt
      ? Math.max(0, Math.round((Date.now() - Date.parse(this.lastReadingAt)) / 60000))
      : null;
  }
}

export class ProductSensorDetail {
  constructor(
    public sensor: ProductSensorInfo | null,
    public readings: SensorReading[],
  ) {}
}
