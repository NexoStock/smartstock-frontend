import { Injectable, inject, signal } from '@angular/core';
import { Comparison } from '../domain/model/comparison.entity';
import { ProductSensorDetail } from '../domain/model/sensor-reading.entity';
import { StockApi } from '../infrastructure/stock-api';

@Injectable({ providedIn: 'root' })
export class StockStore {
  private readonly api = inject(StockApi);
  readonly comparison = signal<Comparison | null>(null);
  readonly sensorDetail = signal<ProductSensorDetail | null>(null);
  readonly loading = signal(false);
  readonly error = signal<unknown>(null);

  fetchComparison(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.comparison().subscribe({
      next: (c) => {
        this.comparison.set(c);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e);
        this.loading.set(false);
      },
    });
  }

  fetchSensorDetail(productId: number | string): void {
    this.loading.set(true);
    this.error.set(null);
    this.sensorDetail.set(null);
    this.api.productSensorDetail(productId).subscribe({
      next: (d) => {
        this.sensorDetail.set(d);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e);
        this.loading.set(false);
      },
    });
  }
}
