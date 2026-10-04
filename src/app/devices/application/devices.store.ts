import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiErrorBody, apiError } from '../../shared/infrastructure/api-error';
import { LinkableProduct, Sensor } from '../domain/model/sensor.entity';
import { DevicesApi } from '../infrastructure/devices-api';

export type DeviceActionResult = { ok: true } | { ok: false; error: ApiErrorBody };

@Injectable({ providedIn: 'root' })
export class DevicesStore {
  private readonly api = inject(DevicesApi);
  readonly sensors = signal<Sensor[]>([]);
  readonly products = signal<LinkableProduct[]>([]);
  readonly loading = signal(false);
  readonly error = signal<unknown>(null);

  // M31 counters
  readonly online = computed(() => this.sensors().filter((s) => s.status === 'online').length);
  readonly disconnected = computed(() => this.sensors().filter((s) => s.status === 'disconnected').length);
  readonly available = computed(() => this.sensors().filter((s) => s.status === 'available').length);

  fetchSensors(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.sensors.getAll().subscribe({
      next: (sensors) => { this.sensors.set(sensors); this.loading.set(false); },
      error: (e) => { this.error.set(e); this.loading.set(false); },
    });
  }

  fetchLinkProducts(): void {
    this.api.linkableProducts().subscribe({ next: (p) => this.products.set(p), error: (e) => this.error.set(e) });
  }

  link(sensorId: number, productId: number): Observable<DeviceActionResult> {
    return this.run(this.api.link(sensorId, productId));
  }

  private run(request: Observable<unknown>): Observable<DeviceActionResult> {
    this.loading.set(true);
    return request.pipe(
      map((): DeviceActionResult => { this.loading.set(false); return { ok: true }; }),
      catchError((e) => { this.loading.set(false); return of<DeviceActionResult>({ ok: false, error: apiError(e) }); }),
    );
  }
}
